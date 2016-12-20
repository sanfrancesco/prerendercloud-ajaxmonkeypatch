// eslint-disable-next-line no-unused-vars
function ajaxMonkeyPatch (window, cachedResponses) {
  if (!window.XMLHttpRequest) return;
  if (!window.atob) return;
  if (!window.decodeURIComponent) return;
  if (!window.JSON) return;
  if (!(window.location && window.location.origin)) return;
  if (!Object.defineProperty) return;

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
    return window.decodeURIComponent(escstr);
  }
  try {
    cachedResponses = window.JSON.parse(b64ToUtf8(cachedResponses));
  } catch (error) {
    return;
  }

  // for debugging purposes only
  window.pcCachedResponses = cachedResponses;

  var origAddEventListener = window.XMLHttpRequest.prototype.addEventListener;
  window.XMLHttpRequest.prototype.addEventListener = function (eventName) {
    if (!this._precloudListeners) this._precloudListeners = {};

    this._precloudListeners[eventName] = true;

    return origAddEventListener.apply(this, arguments);
  };

  // keep track of the URL
  var origOpen = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function (method, url) {
    this._precloudurl = url;

    // normalize relative paths as absolute paths on same origin (because that's what the server does)
    if (this._precloudurl && this._precloudurl.substr(0, 1) === '/') this._precloudurl = window.location.origin + this._precloudurl;

    return origOpen.apply(this, arguments);
  };

  // immediately call the callbacks/listeners on send with the stubbed results
  var origSend = window.XMLHttpRequest.prototype.send;
  window.XMLHttpRequest.prototype.send = function () {
    if (cachedResponses[this._precloudurl]) {
      var response = cachedResponses[this._precloudurl];
      delete cachedResponses[this._precloudurl];

      // angular uses: response, statusText, and the onload callback

      // http://stackoverflow.com/questions/26447335/how-can-i-modify-the-xmlhttprequest-responsetext-received-by-another-function
      // see above link with one exception: to get IE11 to work, use getters, not values
      Object.defineProperty(this, 'response', {get: function () { return response; }});
      Object.defineProperty(this, 'responseText', {get: function () { return response; }});
      Object.defineProperty(this, 'readyState', {get: function () { return 4; }});
      Object.defineProperty(this, 'status', {get: function () { return 200; }});
      Object.defineProperty(this, 'statusText', {get: function () { return 200; }});

      // dispatching events also calls handlers, so if there are event listeners, do dispatchEvent only, even if there are also handlers
      // if there are only handlers, call handlers.
      // in other words, do not call listeners and handlers (will break any ajax lib that clears state, like angular)
      var events = ['readystatechange', 'load'];

      for (var i = 0; i < events.length; i++) {
        var eventName = events[i];
        if (this._precloudListeners && this._precloudListeners[eventName]) {
          var ev = document.createEvent('Event');
          ev.initEvent(eventName, true, true);
          this.dispatchEvent(ev);
        } else {
          var handler = this['on' + eventName];
          if (handler) handler();
        }
      }
    } else {
      return origSend.apply(this, arguments);
    }
  };
}
