const http = require('http');
const url = require('url');
const querystring = require('querystring');
const parseCookie = require('./parseCookie');
console.log(parseCookie)
http.createServer((req, res) => {
  const query = url.parse(req.url, true).query;
  req.query = query;
  console.log('query:', query);
  const cookies = parseCookie(req.headers.cookie);
  req.cookies = cookies;
  handle(req, res);
}).listen(1337)

function handle(req, res) {
  if(!req.cookies.isVisit) {
    res.setHeader('Set-Cookie', serialize('isVisit', '1', {maxAge: 5}));
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('first zoo');
  }else {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('again');
  }
}

function serialize(name, val, opt) {
  var pairs = [`${name}=${val}`];
  opt = opt || {};
  if (opt.maxAge) pairs.push('Max-Age=' + opt.maxAge);
  if (opt.domain) pairs.push('Domain=' + opt.domain);
  if (opt.path) pairs.push('Path=' + opt.path);
  if (opt.expires) pairs.push('Expires=' + opt.expires.toUTCString()); if (opt.httpOnly) pairs.push('HttpOnly');
  if (opt.secure) pairs.push('Secure');
  return pairs.join('; ');
}

console.log('start at 1337');