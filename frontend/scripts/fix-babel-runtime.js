const fs = require('fs');
const path = require('path');

try {
  const pkgPath = path.join(__dirname, '../node_modules/@babel/runtime/package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.exports && !pkg.exports['./regenerator']) {
      pkg.exports['./regenerator'] = './regenerator/index.js';
      pkg.exports['./regenerator/index.js'] = './regenerator/index.js';
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      console.log('[postinstall] Exposed ./regenerator in @babel/runtime/package.json');
    }
  }
} catch (err) {
  // Ignore errors
}
