const fs = require('fs');
const https = require('https');
const buildInfo = require('./new_build_info.json');

https.get(buildInfo.logFiles[0], (res) => {
  const dest = fs.createWriteStream('parsed_logs.txt');
  res.pipe(dest);
});
