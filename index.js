const express = require('express')
  , app = express()
  , bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({}));


// https://coolaj86.com/articles/base64-unicode-utf-8-javascript-and-you/
// credit to @coolaj for the encoding research
app.get('/json1', (req, res) => {
  res.json({text: 'from-server: I ½ ♥ 𩶘'});
});
app.get('/text1', (req, res) => {
  res.send('from-server: I ½ ♥ 𩶘');
});
app.post('/echo', (req, res) => {
  res.json(req.body);
});

app.use(express.static('.'))

let port = process.env.PORT || 8888;
app.listen(port, function () {
  console.log('prerender.cloud ajax monkeypatch test on port:', port);
});
