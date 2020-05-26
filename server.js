const http = require('http');
const url = require('url');
const querystring = require('querystring');
const parseCookie = require('./parseCookie');
const fs = require('fs');
const path = require('path');

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

const handles = {
  api: apiHandle,
  file: fileHandle,
  'favicon.ico': facHandle,
};

http.createServer((req, res) => {
  const {query, pathname} = url.parse(req.url, true);
  console.log('pathname:', pathname);
  console.log(pathname.split('/'));
  const [,controller, fileName] = pathname.split('/');
  console.log('controller:', controller);
  const handle = handles[controller];
  req.fileName = fileName;
  req.query = query;
  const cookies = parseCookie(req.headers.cookie);
  req.cookies = cookies;
  // 检查更新session
  const id = req.cookies[key];
  req.isExpired = true;
  if(!id) {
    req.session = generate();
  }else {
    const session = sessions[id];
    if(session) {
      if(session.cookie.expire > (new Date()).getTime()) {
        // 没过期 更新session时间 
        session.cookie.expire = (new Date()).getTime() + EXPIRES;
        req.session = session;
        req.isExpired = false;
      }else {
        delete sessions[id];
        req.session = generate();
      }
    }else {
      req.session = generate();
    }
  }

  const writeHead = res.writeHead;
  res.writeHead = function() {
    let cookies = res.getHeader('Set-Cookie') || [];
    const session = serialize(key, req.session.id);
    cookies = Array.isArray(cookies) ? cookies.concat(session) : [cookies, session];
    res.setHeader('Set-Cookie', cookies);
    return writeHead.apply(this, arguments);
  }

  // 处理上传数据
  if(hasBody(req)) {
    const buffers = [];
    req.on('data', (chunk) => {
      buffers.push(chunk);

    })
    req.on('end', () => {
      req.rawBody = Buffer.concat(buffers).toString();
      handle(req, res);
    })
  }else {
    handle(req, res);
  }
}).listen(1337)


function fileHandle(req, res) {
  const { fileName } = req;
  console.log('fileName:', fileName);
  console.log(path.resolve(`./page/${fileName}`));
  fs.readFile(path.resolve(`./page/${fileName}`), (err, file) => {
    if(err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200);
    res.end(file)
  })
}

function apiHandle(req, res) {
  // if(req.isExpired) {
  //   res.writeHead(200, {'Content-Type': 'text/plain'});
  //   res.end('please login');
  // }else {
  //   res.writeHead(200, {'Content-Type': 'text/plain'});
  //   res.end('welcome user');
  // }
  res.writeHead(200);
  console.log('rawbody:', req.rawBody);
  res.end('welcome user');
}

function facHandle(req, res) {
  res.writeHead(200);
  res.end('');
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

function hasBody(req) {
  return 'transfer-encoding' in req.headers || 'content-length' in req.headers;
}

console.log('start at 1337');