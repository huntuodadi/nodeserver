// var http = require('http');
// var port = Math.round((1 + Math.random()) * 1000);
// console.log(port);
// http.createServer(function (req, res) {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end('Hello World\n');
// }).listen(port);

process.on('message', function(m) {
  console.log('child received message:', m);
});
process.send({foo: 'bar'});