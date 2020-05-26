const http = require('http');
const url = require('url');
const querystring = require('querystring');
const parseCookie = require('./parseCookie');
const fs = require('fs');
const path = require('path');
const settingCtr = require('./controller/setting');

const sessions = {};
const key = 'session_id';
var EXPIRES = 5 * 1000;
const routes = [];
const use = function(path, action) {
  routes.push([path, action]);
}
const handle404 = function(req, res) {
  res.writeHead(200);
  res.end('404');
}
use('/user/setting', settingCtr);
http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;
  for(let i = 0; i < routes.length; i++) {
    var route = routes[i];
    if(route[0] === pathname) {
      route[1](req, res);
      return;
    }
  }
  handle404(req, res)
}).listen(1337)


console.log('start at 1337');