function ajaxMonkeyPatch(window, cachedResponses) {
  // https://coolaj86.com/articles/base64-unicode-utf-8-javascript-and-you/
  function b64ToUtf8(b64) {
    var binstr = atob(b64);
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
  } catch(error) {
    return;
  }

  window.pcCachedResponses = cachedResponses;
  var xhrProto = XMLHttpRequest.prototype,
  origOpen = xhrProto.open;
  xhrProto.open = function (method, url) {
    this._url = url;

    // normalize relative paths as absolute paths on same origin (because that's what the server does)
    if (this._url && this._url.startsWith('/')) this._url = window.location.origin + this._url;

    return origOpen.apply(this, arguments);
  };

  var send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function() {
    if (cachedResponses[this._url]) {
      // http://stackoverflow.com/questions/26447335/how-can-i-modify-the-xmlhttprequest-responsetext-received-by-another-function
      Object.defineProperty(this, 'responseText', {writable: true});
      Object.defineProperty(this, 'readyState', {writable: true});
      Object.defineProperty(this, 'status', {writable: true});
      this.readyState = 4
      this.status = 200
      this.responseText = cachedResponses[this._url];
      delete cachedResponses[this._url];
      return this.onreadystatechange();
    } else {
      return send.apply(this, arguments);
    }
  }
}