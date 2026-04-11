const http = require('http');

const data = JSON.stringify({
  expanded_skills: [{name: "Test Tool", url: "http"}]
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/skills/1',
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
