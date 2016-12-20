function ajaxOnReadyStateChange(url, cb) {
  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
      if (xhr.readyState>3 && xhr.status==200) cb(xhr.responseText);
  };
  xhr.send();

  return xhr;
}