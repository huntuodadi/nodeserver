const http = require('http');
const url = require('url');
const querystring = require('querystring');
const parseCookie = require('./parseCookie');

const sessions = {};
const key = 'session_id';
var EXPIRES = 5 * 1000;
const generate = () => {
  const session = {};
  session.id = (new Date()).getTime() + Math.random();
  session.cookie = {
    expire: (new Date()).getTime() + EXPIRES
  };
  sessions[session.id] = session;
  return session;
}

http.createServer((req, res) => {
  const query = url.parse(req.url, true).query;
  req.query = query;
  const cookies = parseCookie(req.headers.cookie);
  req.cookies = cookies;
  // 检查更新session
  const id = req.cookies[key];
  if(!id) {
    req.session = generate();
  }else {
    const session = sessions[id];
    if(session) {
      if(session.cookie.expire > (new Date()).getTime()) {
        // 没过期 更新session时间 
        session.cookie.expire = (new Date()).getTime() + EXPIRES;
        req.session = session;
      }else {
        delete sessions[id];
        req.session = generate();
      }
    }else {
      req.session = generate();
    }
  }

  const writeHead = res.writeHead;
  res.writeHead = () => {
    let cookies = res.getHeader('Set-Cookie');
    const session = serialize(key, req.session.id);
    console.log('session:', session);
    cookies = Array.isArray(cookies) ? cookies.concat(session) : [cookies, session];
    console.log(cookies);
    res.setHeader('Set-Cookie', cookies);
    return writeHead.apply(this, arguments);
  }
  handle(req, res);
}).listen(1337)

function handle(req, res) {
  if(!req.session.isVisit) {
    // res.session.isVisit = true;
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