const http = require('http');
const fs = require('fs');
const path = require('path');

const fileName = 'HEC-eServices-release.apk';

http.createServer((request, response) => {
  if (request.url !== `/${fileName}`) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': 'application/vnd.android.package-archive',
    'Content-Disposition': `attachment; filename="${fileName}"`,
  });
  fs.createReadStream(path.join(__dirname, fileName)).pipe(response);
}).listen(8765, '0.0.0.0');
