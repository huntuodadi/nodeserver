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

// 每个子进程有一个server  但是tcp只有一个 那就是主进程传过来的
process.on('message', function (m, tcp) {
  // console.log('message:', m, process.pid);
  if (m === 'server') {
    tcp.on('connection', function (socket) {
      console.log('tcp on connection');
      server.emit('connection', socket);
    })
  }
})

process.on('SIGTERM', () => {
  console.log('get sigterm:', process.pid);
  process.exit(1);
})

// process.kill(process.pid, 'SIGTERM');