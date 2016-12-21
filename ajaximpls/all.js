var ajaxImpls = {
  onReadyStatechange: ajaxOnReadyStateChange,
  onReadyStatechangePost: function(params, url, cb) { return ajaxOnReadyStateChange(url, cb, { method: 'POST', params: params })},
  listener: ajaxListener,
  angular: ajaxAngular,
  reqwest: reqwest
}