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
const use = function (path, action) {
  routes.push([pathRegexp(path), action]);
}
const handle404 = function (req, res) {
  res.writeHead(200);
  res.end('404');
}
function pathRegexp(path) {
  var keys = [];
  path = path
    .concat('/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function (_, slash, format, key, capture,
      optional, star) {
      keys.push(key);
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '')
        + (star ? '(/*)?' : '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');
  return {
    keys: keys,
    regexp: new RegExp('^' + path + '$'),
  };
}
use('/user/setting/:username/:userid', settingCtr);
http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;
  for (let i = 0; i < routes.length; i++) {
    var route = routes[i];
    // 正则匹配
    var regexp = route[0].regexp;
    var keys = route[0].keys;
    var matched = regexp.test(pathname);
    var matchedArr = pathname.match(regexp);
    if(matched) {
      var params = {};
      for(var j = 0; j < keys.length; j++) {
        var value = matchedArr[j + 1];
        var key = keys[j];
        if(value) {
          params[key] = value;
        }
      }
      req.params = params;
      var action = route[1];
      action(req, res);
      return;
    }
  }
  handle404(req, res)
}).listen(1337)


console.log('start at 1337');