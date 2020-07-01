var fork = require('child_process').fork;
// var cpus = require('os').cpus();
// console.log(cpus.length);
// for (var i = 0; i < cpus.length; i++) {
//   fork('./worker.js');
// }

// var n = fork('./worker.js');
// n.on('message', function(m) {
//   console.log('master received message:', m);
// });
// n.send({hello: 'world'});
// console.log('master end');

var child1 = fork('./worker.js');
var child2 = fork('./worker.js');
child1.kill('SIGTERM');
var server = require('net').createServer();
server.on('connection', function(socket) {
  socket.end('handle by parent\n');
})
server.listen(1337, function() {
  child1.send('server', server)
  child2.send('server', server)
  server.close();
})

