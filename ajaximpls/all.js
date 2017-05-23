var ajaxImpls = {
  onReadyStatechange: ajaxOnReadyStateChange,
  onReadyStatechangePost: function(params, url, cb) {
    return ajaxOnReadyStateChange(url, cb, { method: "POST", params: params });
  },
  listener: ajaxListener,
  angular: ajaxAngular,
  reqwest: reqwest,
  jQuery: function(url, cb) {
    jQuery.ajax(url, { method: "GET" }).then(cb);
  },
  fetch: function(url, cb) {
    return window.fetch(url).then(res => res.json().then(cb));
  },
  fetchRequestObj: function(url, cb) {
    return window.fetch(new Request(url)).then(res => res.json().then(cb));
  }
};
