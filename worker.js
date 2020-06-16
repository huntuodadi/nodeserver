// var http = require('http');
// var port = Math.round((1 + Math.random()) * 1000);
// console.log(port);
// http.createServer(function (req, res) {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end('Hello World\n');
// }).listen(port);

// process.on('message', function(m) {
//   console.log('child received message:', m);
// });
// process.send({foo: 'bar'});

var http = require('http');
var server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('handled by child, pid is ' + process.pid + '\n');
});

process.on('message', function (m, tcp) {
  // console.log('message:', m, process.pid);
  if (m === 'server') {
    tcp.on('connection', function (socket) {
      console.log('tcp on connection');
      server.emit('connection', socket);
    })
  }
})