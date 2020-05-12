var parseCookie = function(cookie) {
  var cookies = {};
  if(!cookie) {
    return cookies;
  }
  var list = cookie.split(';');
  list.forEach((item) => {
    var pair = item.split('=');
    cookies[pair[0].trim()] = pair[1];
  })
  return cookies;
}
module.exports = parseCookie;