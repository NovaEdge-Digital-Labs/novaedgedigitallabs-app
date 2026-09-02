const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(filePath));
        } else {
            if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.js')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = walkDir(srcDir);
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace hex (case insensitive)
    content = content.replace(/#9127FF/gi, '#6E56CF');
    content = content.replace(/#9127ff/gi, '#6E56CF');
    
    // Replace rgb numbers
    content = content.replace(/145,\s*39,\s*255/g, '110, 86, 207');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
        changedCount++;
    }
});

console.log(`Done! Changed ${changedCount} files.`);
