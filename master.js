var fork = require('child_process').fork;
// var cpus = require('os').cpus();
// console.log(cpus.length);
// for (var i = 0; i < cpus.length; i++) {
//   fork('./worker.js');
// }

var n = fork('./worker.js');
n.on('message', function(m) {
  console.log('master received message:', m);
});
n.send({hello: 'world'});
console.log('master end');