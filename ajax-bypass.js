// eslint-disable-next-line no-unused-vars
function ajaxMonkeyPatchForBypass (window) {
  if (!String.prototype.startsWith) {
    // eslint-disable-next-line no-extend-native
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
    };
  }

  var open = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function () {
    var url = arguments[1];
    var ret = open.apply(this, arguments);
    if (url.startsWith(window.location.origin) || url.startsWith('/')) {
      this.setRequestHeader('x-prerendered', 'true');
    }
    return ret;
  };

  if (window.fetch) {
    var realFetch = window.fetch;
    window.fetch = function (urlOrReq, init) {
      if (urlOrReq && urlOrReq.headers) {
        if ((urlOrReq && urlOrReq.url) && (urlOrReq.url.startsWith('/') || urlOrReq.url.startsWith(window.location.origin))) {
          urlOrReq.headers.set('x-prerendered', true);
        }
        return realFetch(urlOrReq, init || urlOrReq);
      } else {
        if ((urlOrReq) && (urlOrReq.startsWith('/') || urlOrReq.startsWith(window.location.origin))) {
          init = init || {};
          init.headers = init.headers || {};
          init.headers['x-prerendered'] = 'true';
        }
        return realFetch(urlOrReq, init);
      }
    };
  }
}
