const PROD_API_URL = "https://app.novaedgedigitallabs.in/api";
const LOCAL_API_URL = "http://localhost:5000/api";

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
        ? LOCAL_API_URL
        : PROD_API_URL);

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    plan: string;
    isActive: boolean;
    createdAt: string;
}

export interface Service {
    _id: string;
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    icon: string;
    category: string;
    pricing: {
        startingPrice: number;
        currency: string;
        model: string;
    };
    features: string[];
    technologies: string[];
    deliverables: string[];
    thumbnail: string;
    estimatedDuration: string;
    isActive: boolean;
    isFeatured: boolean;
    order: number;
    createdAt: string;
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    instructor: {
        name: string;
        bio?: string;
        avatar?: string;
    };
    price: number;
    originalPrice?: number;
    category: string;
    thumbnail: string;
    previewVideoUrl?: string;
    lectures: {
        title: string;
        duration: string;
        videoUrl: string;
        freePreview: boolean;
    }[];
    totalDuration?: string;
    enrolledCount: number;
    rating: number;
    tags: string[];
    createdAt: string;
}

export interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    zipUrl: string;
    isActive: boolean;
    totalSales: number;
    averageRating: number;
    tags?: string[];
    features?: string[];
    createdAt: string;
}

export interface ApiKey {
    _id: string;
    key: string;
    name: string;
    userId: {
        _id: string;
        email: string;
    };
    monthlyLimit: number;
    monthlyCalls: number;
    isActive: boolean;
    createdAt: string;
}

export interface Analytics {
    avgSessionDuration: number;
    bounceRate: number;
    retentionRate: number;
    activeNodes: number;
    trafficSources: {
        label: string;
        value: number;
    }[];
    regionalDistribution: {
        country: string;
        value: string;
        color: string;
    }[];
}

export interface SystemHealth {
    apiLatency: number;
    cpuLoad: number;
    diskUsage: number;
}

export interface LeadSubmission {
    _id: string;
    name: string;
    email: string;
    phone: string;
    service: string;
    budget?: string;
    message: string;
    source: string;
    status: "new" | "contacted" | "in-progress" | "closed-won" | "closed-lost";
    assignedTo?: string;
    notes?: string;
    createdAt: string;
}

export interface BusinessInquirySubmission {
    _id: string;
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    category: string;
    message?: string;
    status: "pending" | "contacted" | "closed" | "rejected";
    createdAt: string;
}

export interface AdminJobPost {
    _id: string;
    title: string;
    location: string;
    jobType: string;
    listingType: "Basic" | "Featured" | "Premium";
    isActive: boolean;
    expiryDate: string;
    postedBy?: {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    companyId?: {
        _id: string;
        name?: string;
    };
    createdAt: string;
}

export interface AdminProjectWork {
    _id: string;
    title: string;
    status: "open" | "in-progress" | "completed" | "cancelled";
    budgetRange: {
        min: number;
        max: number;
    };
    clientId?: {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    createdAt: string;
}

export interface AdminGigWork {
    _id: string;
    title: string;
    category: string;
    price: number;
    isActive: boolean;
    freelancerId?: {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    createdAt: string;
}

export interface PlatformConfig {
    siteName: string;
    supportEmail: string;
    description: string;
    maintenanceMode: boolean;
    brandPrimaryColor: string;
    colorScheme: string;
    typography: string;
    enable2FA: boolean;
    strongPassword: boolean;
    sessionTimeout: boolean;
    ipWhitelisting: boolean;
    apiProPlanPrice?: number;
    apiProPlanQuota?: number;
    [key: string]: string | number | boolean | object | undefined;
}

export const authApi = {
    login: (data: Record<string, unknown>) =>
        request("/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
        }),
};

async function request(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    let response: Response;
    try {
        response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Network error";
        throw new Error(`Unable to reach API at ${BASE_URL}. ${message}`);
    }

    if (!response.ok) {
        if (response.status === 401 && typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth-error", { detail: "Session expired" }));
            const error = await response.json().catch(() => ({ message: "Session expired" }));
            throw new Error(error.message || "Session expired");
        }
        const error = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(error.message || "Request failed");
    }

    return response.json();
}

export const adminApi = {
    getStats: () => request("/admin/stats"),
    getSystemHealth: () => request("/admin/system-health"),
    getUsers: () => request("/admin/users"),
    updateUser: (userId: string, data: { role?: string; plan?: string; isActive?: boolean }) =>
        request(`/admin/user/${userId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    deleteUser: (userId: string) =>
        request(`/admin/user/${userId}`, {
            method: "DELETE",
        }),
    createUser: (data: Partial<User> & { password?: string }) =>
        request("/admin/user", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    getPlatformConfig: () => request("/admin/platform-config"),
    updatePlatformConfig: (data: PlatformConfig) =>
        request("/admin/platform-config", {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    getAnalytics: () => request("/admin/analytics"),
    refreshAnalytics: () =>
        request("/admin/analytics/refresh", {
            method: "POST",
        }),
    // Products management
    getProducts: () => request("/admin/products"),
    createProduct: (data: Partial<Product>) =>
        request("/admin/products", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    updateProduct: (id: string, data: Partial<Product>) =>
        request(`/admin/products/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    deleteProduct: (id: string) => request(`/admin/products/${id}`, { method: 'DELETE' }),
    
    // API Keys
    getApiKeys: () => request('/admin/api-keys'),
    createApiKey: (data: { userId: string, name?: string, monthlyLimit?: number }) => request('/admin/api-keys', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateApiKey: (id: string, data: { monthlyLimit: number }) => request(`/admin/api-keys/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    revokeApiKey: (id: string) => request(`/admin/api-keys/${id}`, { method: 'DELETE' }),

    // Services management
    getServices: () => request('/admin/services'),
    createService: (data: Partial<Service>) => request('/admin/services', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateService: (id: string, data: Partial<Service>) => request(`/admin/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteService: (id: string) => request(`/admin/services/${id}`, { method: 'DELETE' }),

    // Courses (Academy) management
    getCourses: () => request('/admin/courses'),
    createCourse: (data: Partial<Course>) => request('/admin/courses', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateCourse: (id: string, data: Partial<Course>) => request(`/admin/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteCourse: (id: string) => request(`/admin/courses/${id}`, { method: 'DELETE' }),

    // Leads and approval submissions
    getLeads: () => request('/admin/leads'),
    updateLead: (
        id: string,
        data: Partial<Pick<LeadSubmission, "status" | "notes" | "assignedTo">>
    ) => request(`/admin/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    getInquiries: () => request('/admin/inquiries'),
    updateInquiry: (id: string, data: Partial<Pick<BusinessInquirySubmission, "status">>) =>
        request(`/admin/inquiries/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    // Job posts management
    getJobs: () => request('/admin/jobs'),
    updateJob: (id: string, data: Partial<Pick<AdminJobPost, "isActive" | "listingType" | "expiryDate">>) =>
        request(`/admin/jobs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteJob: (id: string) => request(`/admin/jobs/${id}`, { method: 'DELETE' }),

    // Work management (projects/gigs)
    getWork: () => request('/admin/work'),
    updateProject: (id: string, data: Partial<Pick<AdminProjectWork, "status">>) =>
        request(`/admin/work/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteProject: (id: string) => request(`/admin/work/projects/${id}`, { method: 'DELETE' }),
    updateGig: (id: string, data: Partial<Pick<AdminGigWork, "isActive">>) =>
        request(`/admin/work/gigs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteGig: (id: string) => request(`/admin/work/gigs/${id}`, { method: 'DELETE' }),
    getPricingTiers: async () => {
        return request("/admin/pricing");
    },
    updatePricingTier: async (id: string, data: Record<string, unknown>) => {
        return request(`/admin/pricing/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },
};

export const dbLabApi = {
    simulateAcid: async (data: Record<string, unknown>) => {
        try {
            return await request('/db-lab/acid', { method: 'POST', body: JSON.stringify(data) });
        } catch {
            return {
                success: true,
                atomicityPreserved: true,
                durabilityPreserved: true,
                txId: `TXN_${Date.now().toString().slice(-6)}`,
                isolationLevel: data.isolationLevel || 'READ_COMMITTED',
                dirtyReadExposed: data.isolationLevel === 'READ_UNCOMMITTED',
                anomalyDetected: data.isolationLevel === 'READ_UNCOMMITTED' ? 'Dirty Read' : 'None',
                accounts: {
                    accountA: { id: 'ACC_001', name: 'Alice', balance: 800 },
                    accountB: { id: 'ACC_002', name: 'Bob', balance: 700 }
                },
                timeline: [
                    { step: 1, action: 'BEGIN TRANSACTION', txId: 'TXN_001', detail: `Isolation Level: ${data.isolationLevel || 'READ_COMMITTED'}` },
                    { step: 2, action: 'READ_BALANCE', target: 'Alice', val: 1000 },
                    { step: 3, action: 'WRITE_DEBIT', target: 'Alice', oldVal: 1000, newVal: 800 },
                    { step: 4, action: 'WRITE_CREDIT', target: 'Bob', oldVal: 500, newVal: 700 },
                    { step: 5, action: 'COMMIT_TRANSACTION', detail: 'FLUSH_WAL_TO_DISK' }
                ],
                walLog: [
                    { timestamp: new Date().toISOString(), txId: 'TXN_001', operation: 'BEGIN', status: 'APPENDED_TO_WAL' },
                    { timestamp: new Date().toISOString(), txId: 'TXN_001', operation: 'WRITE', payload: { account: 'Alice', old: 1000, new: 800 }, status: 'APPENDED_TO_WAL' },
                    { timestamp: new Date().toISOString(), txId: 'TXN_001', operation: 'COMMIT', status: 'PERSISTED_TO_STORAGE' }
                ]
            };
        }
    },
    simulateCap: async (data: Record<string, unknown>) => {
        try {
            return await request('/db-lab/cap', { method: 'POST', body: JSON.stringify(data) });
        } catch {
            return {
                success: true,
                systemPreference: data.systemPreference || 'CP',
                quorumSatisfied: true,
                writePossible: true,
                dataConsistency: data.systemPreference === 'AP' ? 'EVENTUAL' : 'STRONG',
                systemAvailability: true,
                nodes: [
                    { id: 1, name: 'Node-1', status: 'ONLINE', data: { user_status: 'ACTIVE_PREMIUM' }, version: 2, latencyMs: 14 },
                    { id: 2, name: 'Node-2', status: 'PARTITIONED', data: { user_status: 'INACTIVE' }, version: 1, latencyMs: 999 },
                    { id: 3, name: 'Node-3', status: 'ONLINE', data: { user_status: 'ACTIVE_PREMIUM' }, version: 2, latencyMs: 18 }
                ],
                executionLog: [
                    'Cluster active (3 nodes)',
                    'Node-2 isolated by network partition',
                    `Quorum evaluation completed for preference: ${data.systemPreference || 'CP'}`
                ],
                pacelcSummary: 'If Partitioned: Trade-off between Consistency & Availability.'
            };
        }
    },
    analyzeNormalization: async (data: Record<string, unknown>) => {
        try {
            return await request('/db-lab/normalization', { method: 'POST', body: JSON.stringify(data) });
        } catch {
            return {
                success: true,
                tableName: 'Orders',
                primaryKey: ['OrderID', 'ProductID'],
                analysis: {
                    is1NF: true,
                    is2NF: false,
                    is3NF: false,
                    isBCNF: false,
                    violations: [
                        '2NF Violation (Partial Dependency): OrderID -> CustomerName depends on part of composite key.',
                        '3NF Violation (Transitive Dependency): CustomerName -> CustomerEmail.'
                    ],
                    decomposedTables: [
                        { name: 'Customers', primaryKey: ['OrderID'], attributes: ['OrderID', 'CustomerName', 'CustomerEmail'], normalForm: '3NF' },
                        { name: 'Products', primaryKey: ['ProductID'], attributes: ['ProductID', 'ProductName', 'ProductPrice'], normalForm: '3NF' },
                        { name: 'OrderLineItems', primaryKey: ['OrderID', 'ProductID'], attributes: ['OrderID', 'ProductID', 'Quantity'], normalForm: '3NF' }
                    ],
                    generatedSql: [
                        'CREATE TABLE Customers ( OrderID INT PRIMARY KEY, CustomerName VARCHAR(255), CustomerEmail VARCHAR(255) );',
                        'CREATE TABLE Products ( ProductID INT PRIMARY KEY, ProductName VARCHAR(255), ProductPrice DECIMAL(10,2) );',
                        'CREATE TABLE OrderLineItems ( OrderID INT, ProductID INT, Quantity INT, PRIMARY KEY(OrderID, ProductID) );'
                    ]
                }
            };
        }
    },
    simulateIndexing: async (data: Record<string, unknown>) => {
        try {
            return await request('/db-lab/indexing', { method: 'POST', body: JSON.stringify(data) });
        } catch {
            const size = Number(data.datasetSize) || 100000;
            return {
                success: true,
                datasetSize: size,
                targetId: Number(data.targetId) || 84920,
                indexType: data.indexType || 'B_TREE',
                executionPlan: {
                    query: 'SELECT * FROM users WHERE id = 84920;',
                    datasetSize: size,
                    withoutIndex: { nodeType: 'Seq Scan (Full Table Scan)', rowsExamined: 84920, executionTimeMs: 29.722, cost: '0.00..2500.00' },
                    withIndex: { nodeType: 'Index Scan using idx_users_id (B+ Tree)', treeDepth: 3, rowsExamined: 3, executionTimeMs: 0.036, cost: '0.28..8.30' },
                    speedupFactor: '825.6x faster'
                },
                bTreeVisualization: {
                    root: { keys: [25000, 50000, 75000], childrenCount: 4 },
                    level1: [
                        { range: '1..24999', keys: [6250, 12500, 18750] },
                        { range: '25000..49999', keys: [31250, 37500, 43750] },
                        { range: '50000..74999', keys: [56250, 62500, 68750] },
                        { range: '75000..100000', keys: [81250, 87500, 93750] }
                    ],
                    targetPath: ['Root Node -> Range 75000..100000', 'Leaf Block #849 -> Record 84920 Found']
                }
            };
        }
    },
    simulateTransactions: async (data: Record<string, unknown>) => {
        try {
            return await request('/db-lab/transactions', { method: 'POST', body: JSON.stringify(data) });
        } catch {
            return {
                success: true,
                concurrencyModel: data.concurrencyModel || '2PL',
                deadlockOccurred: Boolean(data.simulateDeadlock),
                transactions: [
                    { id: 'T1', name: 'Transfer Txn 1', state: 'RUNNING' },
                    { id: 'T2', name: 'Audit Txn 2', state: data.simulateDeadlock ? 'ABORTED' : 'RUNNING' }
                ],
                lockTable: [
                    { resource: 'Account_A', lockType: 'EXCLUSIVE (X)', grantedTo: 'T1', waiting: data.simulateDeadlock ? ['T2'] : [] },
                    { resource: 'Account_B', lockType: 'EXCLUSIVE (X)', grantedTo: 'T2', waiting: data.simulateDeadlock ? ['T1'] : [] }
                ],
                mvccVersions: [
                    { rowId: 'Row_101 (Account_A)', version: 1, createdByTx: 'T0 (Initial)', val: { balance: 1000 }, minTxId: 100, maxTxId: null },
                    { rowId: 'Row_101 (Account_A)', version: 2, createdByTx: 'T1 (Uncommitted)', val: { balance: 800 }, minTxId: 101, maxTxId: null }
                ],
                waitForGraph: data.simulateDeadlock ? [
                    { waitingTx: 'T1', blockedByTx: 'T2', resource: 'Account_B' },
                    { waitingTx: 'T2', blockedByTx: 'T1', resource: 'Account_A' }
                ] : [],
                timeline: [
                    { step: 1, txId: 'T1', action: 'ACQUIRE_LOCK', resource: 'Account_A', type: 'X', status: 'GRANTED' },
                    { step: 2, txId: 'T2', action: 'ACQUIRE_LOCK', resource: 'Account_B', type: 'X', status: 'GRANTED' }
                ]
            };
        }
    }
};

