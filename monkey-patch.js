// eslint-disable-next-line no-unused-vars
function ajaxMonkeyPatch (window, cachedResponses) {
  // https://coolaj86.com/articles/base64-unicode-utf-8-javascript-and-you/
  function b64ToUtf8 (b64) {
    var binstr = window.atob(b64);
    var escstr = binstr.replace(/(.)/g, function (m, p) {
      var code = p.charCodeAt(0).toString(16).toUpperCase();
      if (code.length < 2) {
        code = '0' + code;
      }
      return '%' + code;
    });
    return decodeURIComponent(escstr);
  }
  try {
    cachedResponses = JSON.parse(b64ToUtf8(cachedResponses));
  } catch (error) {
    return;
  }

  window.pcCachedResponses = cachedResponses;
  var origOpen = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function (method, url) {
    this._precloudurl = url;

    // normalize relative paths as absolute paths on same origin (because that's what the server does)
    if (this._precloudurl && this._precloudurl.startsWith('/')) this._precloudurl = window.location.origin + this._precloudurl;

    return origOpen.apply(this, arguments);
  };

  var send = window.XMLHttpRequest.prototype.send;
  window.XMLHttpRequest.prototype.send = function () {
    if (cachedResponses[this._precloudurl]) {
      // http://stackoverflow.com/questions/26447335/how-can-i-modify-the-xmlhttprequest-responsetext-received-by-another-function
      Object.defineProperty(this, 'responseText', {writable: true});
      Object.defineProperty(this, 'readyState', {writable: true});
      Object.defineProperty(this, 'status', {writable: true});
      this.readyState = 4;
      this.status = 200;
      this.responseText = cachedResponses[this._precloudurl];
      delete cachedResponses[this._precloudurl];
      return this.onreadystatechange();
    } else {
      return send.apply(this, arguments);
    }
  };
}
