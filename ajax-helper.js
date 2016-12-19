
// https://plainjs.com/javascript/ajax/send-ajax-get-and-post-requests-47/

function getAjax(url, cb) {
  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
      if (xhr.readyState>3 && xhr.status==200) cb(xhr.responseText);
  };
  xhr.send();

  return xhr;
}

function getAjaxWithEventListener(url, cb) {
  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
  xhr.open('GET', url);

  var ensureAll3ListenersAreCalled = function(listenerName) {
    xhr[listenerName] = true;
    if (xhr.__onreadystatechange && xhr.__readystatechangeEvent && xhr.__loadEvent) cb(xhr.responseText);
  }

  xhr.onreadystatechange = function() {
    if (this.readyState>3 && this.status==200) ensureAll3ListenersAreCalled('__onreadystatechange');
  };
  xhr.addEventListener('readystatechange', function() {
    if (this.readyState>3 && this.status==200) ensureAll3ListenersAreCalled('__readystatechangeEvent');
  });
  xhr.addEventListener('load', function() {
    if (this.readyState>3 && this.status==200) ensureAll3ListenersAreCalled('__loadEvent');
  });
  xhr.send();

  return xhr;
}

window.getAjax = getAjaxWithEventListener;