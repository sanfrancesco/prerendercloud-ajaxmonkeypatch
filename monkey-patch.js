var originalXMLHttpRequestOpen = XMLHttpRequest.prototype.open;
var originalXMLHttpRequestSend = XMLHttpRequest.prototype.send;

function restore() {
  XMLHttpRequest.prototype.open = originalXMLHttpRequestOpen;
  XMLHttpRequest.prototype.send = originalXMLHttpRequestSend;
}

function ajaxMonkeyPatch(window, cachedResponses) {
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

  window.cachedResponses = cachedResponses;
  var xhrProto = XMLHttpRequest.prototype,
  origOpen = xhrProto.open;
  xhrProto.open = function (method, url) {
    this._url = url;
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