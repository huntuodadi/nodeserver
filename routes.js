const http = require('http');
const url = require('url');
const settingCtr = require('./controller/setting');
const routes = {
  all: []
};
var app = {};
app.use = function (path) {
  var handle;
  if(typeof path === 'string') {
    handle = {
      path: pathRegexp(path),
      stack: Array.prototype.slice.call(arguments, 1),
    };
  }else {
    handle = {
      path: pathRegexp('/'),
      stack: Array.prototype.slice.call(arguments, 0),
    };
  }
  routes.all.push(handle);
}
var methods = ['get', 'post', 'update', 'delete'];
methods.forEach((method) => {
  routes[method] = [];
  app[method] = function (path) {
    routes[method].push({
      path: pathRegexp(path),
      stack: Array.prototype.slice.call(arguments, 1),
    });
  }
})
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
function match(pathname, routes, req, res) {
  // console.log('req:', req);
  var stacks = [];
  for (let i = 0; i < routes.length; i++) {
    var route = routes[i];
    // 正则匹配
    var regexp = route.path.regexp;
    var keys = route.path.keys;
    var matched = regexp.test(pathname);
    var matchedArr = pathname.match(regexp);
    if (matched) {
      var params = {};
      for (var j = 0; j < keys.length; j++) {
        var value = matchedArr[j + 1];
        var key = keys[j];
        if (value) {
          params[key] = value;
        }
      }
      // req.params = params;
      // console.log('stack:', route.stack);
      stacks = stacks.concat(route.stack);
      // handle(req, res, route.stack)
      // var action = route[1];
      // action(req, res);
      // return true;
    }
    console.log('stacks:', stacks);
    return stacks;;
  }
}
function handle(req, res, stack) {
  var next = function () {
    var middleware = stack.shift();
    if (middleware) {
      middleware(req, res, next);
    }
  }
  next();
}

var querystring = function (req, res, next) {
  req.query = url.parse(req.url, true).query;
  console.log('do next');
  next();
};
app.use(querystring);
app.get('/user/:username/:userid', settingCtr);
app.post('/user/:username/:userid', settingCtr);
http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;
  const method = req.method.toLowerCase();
  console.log('do match:', routes.all);
  var stacks = match(pathname, routes.all, req, res);
  if (routes.hasOwnProperty(method)) {
    stacks.concat(match(pathname, routes[method])); }
    if (stacks.length) { handle(req, res, stacks);
    } else {
      handle404(req, res);
    }
}).listen(1337)


console.log('start at 1337');