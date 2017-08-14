// eslint-disable-next-line no-unused-vars
function ajaxMonkeyPatchForBypass(window, inputPathsToIgnore) {
  if (!Array.prototype.indexOf) return;

  // pathsToIgnore are what service.prerender.cloud detected as
  // paths that redirect to another host, which means:
  //   1. we won't need this header
  //   2. leaving this header in would cause the following error for servers without proper CORS exceptions
  //      Request header field x-prerendered is not allowed by Access-Control-Allow-Headers in preflight response.
  //
  var pathsToIgnore;
  try {
    if (!inputPathsToIgnore) {
      pathsToIgnore = [];
    } else {
      pathsToIgnore = JSON.parse(inputPathsToIgnore);
    }
  } catch (err) {
    return;
  }

  window.pcPathsToIgnore = pathsToIgnore;

  if (!String.prototype.startsWith) {
    // eslint-disable-next-line no-extend-native
    String.prototype.startsWith = function(searchString, position) {
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
    };
  }

  var validUrlForBypass = function(url) {
    var startsWithOrigin = url.startsWith(window.location.origin);
    var relativePath = url.startsWith("/");
    var isPathToIgnore = pathsToIgnore.indexOf(url) !== -1;

    return (startsWithOrigin || relativePath) && !isPathToIgnore;
  };

  var open = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function() {
    var url = arguments[1];
    var ret = open.apply(this, arguments);
    if (url && validUrlForBypass(url)) {
      this.setRequestHeader("x-prerendered", "true");
    }
    return ret;
  };

  if (window.fetch) {
    var realFetch = window.fetch;
    window.fetch = function(urlOrReq, init) {
      if (urlOrReq && urlOrReq.headers) {
        if (urlOrReq && urlOrReq.url && validUrlForBypass(urlOrReq.url)) {
          urlOrReq.headers.set("x-prerendered", true);
        }
        return realFetch(urlOrReq, init || urlOrReq);
      } else {
        if (urlOrReq && validUrlForBypass(urlOrReq)) {
          init = init || {};
          init.headers = init.headers || {};
          init.headers["x-prerendered"] = "true";
        }
        return realFetch(urlOrReq, init);
      }
    };
  }
}
