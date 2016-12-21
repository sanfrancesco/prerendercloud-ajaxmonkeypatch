function ajaxOnReadyStateChange(url, cb, options) {
  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
  xhr.open(options && options.method || 'GET', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState>3 && xhr.status==200) cb(xhr.responseText);
  };

  if (options && options.params) {
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(options.params);
  } else {
    xhr.send();
  }

  return xhr;
}