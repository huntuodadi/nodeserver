module.exports = function(req, res) {
  console.log('setting controller:', req.params);
  res.writeHead(200);
  res.end('setting controller');
}