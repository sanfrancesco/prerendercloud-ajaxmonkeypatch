'use strict';function ajaxMonkeyPatchForBypass(a){String.prototype.startsWith||(String.prototype.startsWith=function(d,e){return e=e||0,this.substr(e,d.length)===d});var b=a.XMLHttpRequest.prototype.open;if(a.XMLHttpRequest.prototype.open=function(){var d=arguments[1],e=b.apply(this,arguments);return(d.startsWith(a.location.origin)||d.startsWith('/'))&&this.setRequestHeader('x-prerendered','true'),e},a.fetch){var c=a.fetch;a.fetch=function(d,e){return d&&d.headers?(d&&d.url&&(d.url.startsWith('/')||d.url.startsWith(a.location.origin))&&d.headers.set('x-prerendered',!0),c(d,e||d)):(d&&(d.startsWith('/')||d.startsWith(a.location.origin))&&(e=e||{},e.headers=e.headers||{},e.headers['x-prerendered']='true'),c(d,e))}}}
