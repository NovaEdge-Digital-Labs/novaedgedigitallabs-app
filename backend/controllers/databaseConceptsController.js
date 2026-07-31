/**
 * Database Concepts & Engineering Simulator Controller
 * Implements logic for ACID, CAP Theorem, Normalization, Indexing, and Concurrency Transactions.
 */

// -------------------------------------------------------------
// 1. ACID Properties & Isolation Simulator Engine
// -------------------------------------------------------------
const ISOLATION_LEVELS = {
    READ_UNCOMMITTED: 'READ_UNCOMMITTED',
    READ_COMMITTED: 'READ_COMMITTED',
    REPEATABLE_READ: 'REPEATABLE_READ',
    SERIALIZABLE: 'SERIALIZABLE'
};

const simulateAcidTransaction = (req, res) => {
    try {
        const { isolationLevel = ISOLATION_LEVELS.READ_COMMITTED, action = 'transfer', amount = 200, forceFail = false } = req.body;

        // Simulated Accounts State
        let accountA = { id: 'ACC_001', name: 'Alice', balance: 1000 };
        let accountB = { id: 'ACC_002', name: 'Bob', balance: 500 };

        const walLog = [];
        const timeline = [];

        const logWal = (txId, op, payload) => {
            walLog.push({
                timestamp: new Date().toISOString(),
                txId,
                operation: op,
                payload,
                status: 'APPENDED_TO_WAL'
            });
        };

        const txId = `TXN_${Date.now().toString().slice(-6)}`;
        
        timeline.push({ step: 1, action: 'BEGIN TRANSACTION', txId, detail: `Isolation Level: ${isolationLevel}` });
        logWal(txId, 'BEGIN', { isolationLevel });

        timeline.push({ step: 2, action: 'READ_BALANCE', target: accountA.name, val: accountA.balance });
        logWal(txId, 'READ', { account: accountA.id, balance: accountA.balance });

        if (accountA.balance < amount) {
            timeline.push({ step: 3, action: 'ABORT', reason: 'Insufficient Funds' });
            logWal(txId, 'ABORT', { reason: 'Insufficient Funds' });
            return res.json({
                success: false,
                txId,
                isolationLevel,
                message: 'Transaction aborted due to insufficient funds',
                accounts: { accountA, accountB },
                timeline,
                walLog
            });
        }

        // Simulate dirty read check logic
        let dirtyReadExposed = false;
        let anomalyDetected = null;

        if (isolationLevel === ISOLATION_LEVELS.READ_UNCOMMITTED) {
            dirtyReadExposed = true;
            anomalyDetected = 'Dirty Read (Uncommitted changes visible to concurrent readers)';
        } else if (isolationLevel === ISOLATION_LEVELS.READ_COMMITTED) {
            anomalyDetected = 'Non-Repeatable Read possible if concurrent transaction updates row before re-read';
        } else if (isolationLevel === ISOLATION_LEVELS.REPEATABLE_READ) {
            anomalyDetected = 'Phantom Read possible if concurrent transaction inserts new matching rows';
        } else {
            anomalyDetected = 'None (Serializable isolation enforces full serial execution)';
        }

        // Debit Alice
        const newBalanceA = accountA.balance - amount;
        timeline.push({ step: 3, action: 'WRITE_DEBIT', target: accountA.name, oldVal: accountA.balance, newVal: newBalanceA });
        logWal(txId, 'WRITE', { account: accountA.id, old: accountA.balance, new: newBalanceA });
        accountA.balance = newBalanceA;

        // Simulate failure trigger (Durability / Atomicity Test)
        if (forceFail) {
            timeline.push({ step: 4, action: 'CRASH_SIMULATED', error: 'System power loss / DB crash during execution!' });
            timeline.push({ step: 5, action: 'WAL_ROLLBACK', detail: 'Rolling back uncommitted mutations from WAL log...' });
            accountA.balance += amount; // Restore
            logWal(txId, 'ROLLBACK', { restoredAccount: accountA.id, restoredBalance: accountA.balance });

            return res.json({
                success: false,
                atomicityPreserved: true,
                txId,
                isolationLevel,
                message: 'Transaction Atomicity & Durability Verified: Rollback executed via WAL logs.',
                accounts: { accountA, accountB },
                timeline,
                walLog
            });
        }

        // Credit Bob
        const newBalanceB = accountB.balance + amount;
        timeline.push({ step: 4, action: 'WRITE_CREDIT', target: accountB.name, oldVal: accountB.balance, newVal: newBalanceB });
        logWal(txId, 'WRITE', { account: accountB.id, old: accountB.balance, new: newBalanceB });
        accountB.balance = newBalanceB;

        timeline.push({ step: 5, action: 'COMMIT_TRANSACTION', detail: 'FLUSH_WAL_TO_DISK' });
        logWal(txId, 'COMMIT', { status: 'PERSISTED_TO_STORAGE' });

        return res.json({
            success: true,
            atomicityPreserved: true,
            durabilityPreserved: true,
            txId,
            isolationLevel,
            dirtyReadExposed,
            anomalyDetected,
            accounts: { accountA, accountB },
            timeline,
            walLog
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// -------------------------------------------------------------
// 2. CAP Theorem & PACELC Simulator Engine
// -------------------------------------------------------------
const simulateCapTheorem = (req, res) => {
    try {
        const {
            nodesCount = 3,
            partitionedNodes = [2], // array of node IDs cut off from majority
            readQuorum = 2,
            writeQuorum = 2,
            systemPreference = 'CP', // 'CP' (Consistency/Partition) vs 'AP' (Availability/Partition)
            writeKey = 'user_status',
            writeValue = 'ACTIVE_PREMIUM'
        } = req.body;

        const totalNodes = Math.max(3, Math.min(5, nodesCount));
        const nodes = Array.from({ length: totalNodes }, (_, i) => ({
            id: i + 1,
            name: `Node-${i + 1}`,
            status: partitionedNodes.includes(i + 1) ? 'PARTITIONED' : 'ONLINE',
            data: { user_status: 'INACTIVE' },
            version: 1,
            latencyMs: partitionedNodes.includes(i + 1) ? 999 : 12 + Math.floor(Math.random() * 15)
        }));

        const activeNodes = nodes.filter(n => n.status === 'ONLINE');
        const quorumSatisfied = (writeQuorum + readQuorum) > totalNodes;
        const writePossible = activeNodes.length >= writeQuorum;

        const executionLog = [];
        let dataConsistency = 'STRONG';
        let systemAvailability = true;

        executionLog.push(`Distributed Cluster initialized with ${totalNodes} nodes.`);
        executionLog.push(`Configured Quorum: Read Quorum R=${readQuorum}, Write Quorum W=${writeQuorum} (R + W = ${readQuorum + writeQuorum} vs N = ${totalNodes}).`);

        if (partitionedNodes.length > 0) {
            executionLog.push(`⚠️ Network Partition Active! Cut-off nodes: ${partitionedNodes.map(n => `Node-${n}`).join(', ')}.`);
        }

        if (systemPreference === 'CP') {
            // CP Mode: Reject writes if consistency quorum cannot be reached across partition
            if (!writePossible) {
                systemAvailability = false;
                executionLog.push(`❌ [CP Mode] Write rejected to preserve strict consistency! Active nodes (${activeNodes.length}) < Write Quorum (${writeQuorum}).`);
            } else {
                activeNodes.forEach(n => {
                    n.data[writeKey] = writeValue;
                    n.version += 1;
                });
                executionLog.push(`✅ [CP Mode] Write committed to ${activeNodes.length} active nodes. Isolated nodes will sync upon partition heal.`);
            }
        } else {
            // AP Mode: Accept writes on any reachable node, sync later (eventual consistency)
            activeNodes.forEach(n => {
                n.data[writeKey] = writeValue;
                n.version += 1;
            });
            dataConsistency = partitionedNodes.length > 0 ? 'EVENTUAL' : 'STRONG';
            executionLog.push(`✅ [AP Mode] Write accepted on all reachable nodes (${activeNodes.length}/${totalNodes}). Availability preserved!`);
            if (partitionedNodes.length > 0) {
                executionLog.push(`⚠️ [AP Mode] Divergent data detected! Partitioned nodes still hold version 1. Eventual consistency convergence required.`);
            }
        }

        return res.json({
            success: true,
            systemPreference,
            quorumSatisfied,
            writePossible,
            dataConsistency,
            systemAvailability,
            nodes,
            executionLog,
            pacelcSummary: systemPreference === 'CP' 
                ? 'If Partitioned: Consistency over Availability. Else: Latency over Consistency.' 
                : 'If Partitioned: Availability over Consistency. Else: Consistency over Latency.'
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// -------------------------------------------------------------
// 3. Database Normalization Engine (1NF / 2NF / 3NF / BCNF)
// -------------------------------------------------------------
const analyzeNormalization = (req, res) => {
    try {
        const { tableName = 'OrderItems', attributes = ['OrderID', 'ProductID', 'CustomerName', 'CustomerEmail', 'ProductName', 'ProductPrice', 'Quantity'], primaryKey = ['OrderID', 'ProductID'], functionalDependencies = [
            { lhs: ['OrderID'], rhs: ['CustomerName', 'CustomerEmail'] },
            { lhs: ['ProductID'], rhs: ['ProductName', 'ProductPrice'] },
            { lhs: ['OrderID', 'ProductID'], rhs: ['Quantity'] }
        ]} = req.body;

        const analysis = {
            is1NF: true,
            is2NF: true,
            is3NF: true,
            isBCNF: true,
            violations: [],
            decomposedTables: [],
            generatedSql: []
        };

        // 1NF Check: Atomic attributes (assumed true unless array/composite detected)
        const nonAtomic = attributes.filter(a => a.toLowerCase().includes('list') || a.toLowerCase().includes('tags'));
        if (nonAtomic.length > 0) {
            analysis.is1NF = false;
            analysis.is2NF = false;
            analysis.is3NF = false;
            analysis.isBCNF = false;
            analysis.violations.push(`1NF Violation: Non-atomic multi-valued attributes detected: ${nonAtomic.join(', ')}.`);
        }

        // 2NF Check: Partial dependencies (FD where LHS is a proper subset of candidate composite key)
        const pkSet = new Set(primaryKey);
        const partialDeps = [];

        functionalDependencies.forEach(fd => {
            const lhsIsProperSubset = fd.lhs.every(k => pkSet.has(k)) && fd.lhs.length < primaryKey.length;
            if (lhsIsProperSubset) {
                partialDeps.push(fd);
            }
        });

        if (partialDeps.length > 0) {
            analysis.is2NF = false;
            analysis.is3NF = false;
            analysis.isBCNF = false;
            partialDeps.forEach(pd => {
                analysis.violations.push(`2NF Violation (Partial Dependency): [${pd.lhs.join(', ')}] -> [${pd.rhs.join(', ')}] depends on part of composite key [${primaryKey.join(', ')}].`);
            });
        }

        // 3NF Check: Transitive dependencies (X -> Y where X is not superkey and Y is non-prime)
        const transitiveDeps = [];
        functionalDependencies.forEach(fd => {
            const isSuperKey = primaryKey.every(pk => fd.lhs.includes(pk));
            const rhsIsPrime = fd.rhs.every(r => primaryKey.includes(r));
            if (!isSuperKey && !rhsIsPrime && fd.lhs.length < primaryKey.length === false) {
                transitiveDeps.push(fd);
            }
        });

        if (transitiveDeps.length > 0) {
            analysis.is3NF = false;
            analysis.isBCNF = false;
            transitiveDeps.forEach(td => {
                analysis.violations.push(`3NF Violation (Transitive Dependency): [${td.lhs.join(', ')}] -> [${td.rhs.join(', ')}] (LHS is not a Super Key & RHS is non-prime).`);
            });
        }

        // Decomposed Schema Generation to 3NF
        if (!analysis.is2NF || !analysis.is3NF) {
            analysis.decomposedTables = [
                {
                    name: 'Customers',
                    primaryKey: ['OrderID'],
                    attributes: ['OrderID', 'CustomerName', 'CustomerEmail'],
                    normalForm: '3NF'
                },
                {
                    name: 'Products',
                    primaryKey: ['ProductID'],
                    attributes: ['ProductID', 'ProductName', 'ProductPrice'],
                    normalForm: '3NF'
                },
                {
                    name: 'OrderLineItems',
                    primaryKey: ['OrderID', 'ProductID'],
                    foreignKeys: [
                        { field: 'OrderID', references: 'Customers(OrderID)' },
                        { field: 'ProductID', references: 'Products(ProductID)' }
                    ],
                    attributes: ['OrderID', 'ProductID', 'Quantity'],
                    normalForm: '3NF'
                }
            ];

            analysis.generatedSql = [
                `CREATE TABLE Customers (\n  OrderID INT PRIMARY KEY,\n  CustomerName VARCHAR(255) NOT NULL,\n  CustomerEmail VARCHAR(255) NOT NULL\n);`,
                `CREATE TABLE Products (\n  ProductID INT PRIMARY KEY,\n  ProductName VARCHAR(255) NOT NULL,\n  ProductPrice DECIMAL(10,2) NOT NULL\n);`,
                `CREATE TABLE OrderLineItems (\n  OrderID INT REFERENCES Customers(OrderID),\n  ProductID INT REFERENCES Products(ProductID),\n  Quantity INT NOT NULL,\n  PRIMARY KEY (OrderID, ProductID)\n);`
            ];
        } else {
            analysis.decomposedTables.push({
                name: tableName,
                primaryKey,
                attributes,
                normalForm: '3NF/BCNF'
            });
            analysis.generatedSql.push(
                `CREATE TABLE ${tableName} (\n  ${attributes.map(a => `${a} VARCHAR(255)`).join(',\n  ')},\n  PRIMARY KEY (${primaryKey.join(', ')})\n);`
            );
        }

        return res.json({
            success: true,
            tableName,
            primaryKey,
            functionalDependencies,
            analysis
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// -------------------------------------------------------------
// 4. Database Indexing Basics & Benchmark Engine
// -------------------------------------------------------------
const simulateIndexing = (req, res) => {
    try {
        const { datasetSize = 100000, targetId = 84920, indexType = 'B_TREE' } = req.body;

        const size = Math.max(1000, Math.min(1000000, Number(datasetSize)));
        const target = Math.max(1, Math.min(size, Number(targetId)));

        // Performance Calculations
        // Sequential scan inspects ~N/2 rows on average
        const seqScanRowsExamined = Math.floor(target);
        const seqScanTimeMs = (seqScanRowsExamined * 0.00035).toFixed(3);

        // B+ Tree index lookup takes O(log_B N) height steps where fanout B ≈ 100
        const bTreeHeight = Math.ceil(Math.log(size) / Math.log(100)) + 1;
        const bTreeTimeMs = (bTreeHeight * 0.012).toFixed(3);

        // Hash index takes O(1) expected bucket lookup
        const hashBucketsExamined = 1;
        const hashTimeMs = (0.015).toFixed(3);

        const executionPlan = {
            query: `SELECT * FROM users WHERE id = ${target};`,
            datasetSize: size,
            withoutIndex: {
                nodeType: 'Seq Scan (Full Table Scan)',
                relationName: 'users',
                rowsExamined: seqScanRowsExamined,
                executionTimeMs: parseFloat(seqScanTimeMs),
                cost: `0.00..${(size * 0.025).toFixed(2)}`
            },
            withIndex: {
                nodeType: indexType === 'HASH' ? 'Hash Index Scan' : 'Index Scan using idx_users_id (B+ Tree)',
                indexName: indexType === 'HASH' ? 'idx_users_id_hash' : 'idx_users_id_btree',
                treeDepth: bTreeHeight,
                rowsExamined: indexType === 'HASH' ? hashBucketsExamined : bTreeHeight,
                executionTimeMs: indexType === 'HASH' ? parseFloat(hashTimeMs) : parseFloat(bTreeTimeMs),
                cost: `0.28..8.30`
            },
            speedupFactor: (parseFloat(seqScanTimeMs) / Math.max(0.001, parseFloat(indexType === 'HASH' ? hashTimeMs : bTreeTimeMs))).toFixed(1) + 'x faster'
        };

        // B+ Tree Visual Structure snippet
        const bTreeVisualization = {
            root: { keys: [25000, 50000, 75000], childrenCount: 4 },
            level1: [
                { range: '1..24999', keys: [6250, 12500, 18750] },
                { range: '25000..49999', keys: [31250, 37500, 43750] },
                { range: '50000..74999', keys: [56250, 62500, 68750] },
                { range: '75000..100000', keys: [81250, 87500, 93750] }
            ],
            targetPath: [
                `Root Node -> Key range 75000..100000`,
                `Child Node -> Target ${target} located at Leaf Block #849`
            ]
        };

        return res.json({
            success: true,
            datasetSize: size,
            targetId: target,
            indexType,
            executionPlan,
            bTreeVisualization
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// -------------------------------------------------------------
// 5. Database Transactions & Concurrency Control Engine (2PL, MVCC, Deadlock)
// -------------------------------------------------------------
const simulateTransactionsConcurrency = (req, res) => {
    try {
        const { concurrencyModel = '2PL', simulateDeadlock = false } = req.body;

        const transactions = [
            { id: 'T1', name: 'Transfer Txn 1', state: 'RUNNING' },
            { id: 'T2', name: 'Audit Txn 2', state: 'RUNNING' }
        ];

        let lockTable = [];
        let mvccVersions = [];
        let waitForGraph = [];
        let timeline = [];

        if (concurrencyModel === '2PL') {
            // Two-Phase Locking Simulation (Growing Phase -> Shrinking Phase)
            lockTable = [
                { resource: 'Account_A', lockType: 'EXCLUSIVE (X)', grantedTo: 'T1', waiting: simulateDeadlock ? ['T2'] : [] },
                { resource: 'Account_B', lockType: simulateDeadlock ? 'EXCLUSIVE (X)' : 'SHARED (S)', grantedTo: simulateDeadlock ? 'T2' : 'T2', waiting: simulateDeadlock ? ['T1'] : [] }
            ];

            timeline = [
                { step: 1, txId: 'T1', action: 'ACQUIRE_LOCK', resource: 'Account_A', type: 'X', status: 'GRANTED' },
                { step: 2, txId: 'T2', action: 'ACQUIRE_LOCK', resource: 'Account_B', type: 'X', status: 'GRANTED' },
                { step: 3, txId: 'T1', action: 'REQUEST_LOCK', resource: 'Account_B', type: 'X', status: simulateDeadlock ? 'BLOCKED_WAITING' : 'GRANTED' },
                { step: 4, txId: 'T2', action: 'REQUEST_LOCK', resource: 'Account_A', type: 'X', status: simulateDeadlock ? 'BLOCKED_WAITING' : 'GRANTED' }
            ];

            if (simulateDeadlock) {
                waitForGraph = [
                    { waitingTx: 'T1', blockedByTx: 'T2', resource: 'Account_B' },
                    { waitingTx: 'T2', blockedByTx: 'T1', resource: 'Account_A' }
                ];
                timeline.push({
                    step: 5,
                    txId: 'SYSTEM_DETECTOR',
                    action: 'DEADLOCK_DETECTED',
                    detail: 'Cycle in Wait-For Graph: T1 -> T2 -> T1. Aborting T2 to resolve cycle.'
                });
                transactions[1].state = 'ABORTED';
            }
        } else {
            // Multi-Version Concurrency Control (MVCC) Simulation
            mvccVersions = [
                { rowId: 'Row_101 (Account_A)', version: 1, createdByTx: 'T0 (Initial)', val: { balance: 1000 }, minTxId: 100, maxTxId: null },
                { rowId: 'Row_101 (Account_A)', version: 2, createdByTx: 'T1 (Uncommitted)', val: { balance: 800 }, minTxId: 101, maxTxId: null }
            ];

            timeline = [
                { step: 1, txId: 'T1', action: 'CREATE_SNAPSHOT_VERSION', target: 'Row_101', val: 800, detail: 'Writes new version tuple v2, leaves v1 intact for readers.' },
                { step: 2, txId: 'T2', action: 'READ_ROW_SNAPSHOT', target: 'Row_101', detail: 'T2 reads version v1 without blocking or waiting for T1 write lock!' }
            ];
        }

        return res.json({
            success: true,
            concurrencyModel,
            deadlockOccurred: simulateDeadlock && concurrencyModel === '2PL',
            transactions,
            lockTable,
            mvccVersions,
            waitForGraph,
            timeline
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    simulateAcidTransaction,
    simulateCapTheorem,
    analyzeNormalization,
    simulateIndexing,
    simulateTransactionsConcurrency
};
