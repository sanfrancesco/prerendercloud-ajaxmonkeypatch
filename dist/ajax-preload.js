'use strict';function ajaxMonkeyPatchForPreload(a,b){function c(g){var h=a.atob(g),j=h.replace(/(.)/g,function(k,l){var n=l.charCodeAt(0).toString(16).toUpperCase();return 2>n.length&&(n='0'+n),'%'+n});return a.decodeURIComponent(j)}if(a.XMLHttpRequest&&a.atob&&a.decodeURIComponent&&a.JSON&&a.location&&a.location.origin&&Object.defineProperty){try{b=a.JSON.parse(c(b))}catch(g){return}a.pcCachedResponses=b;var d=a.XMLHttpRequest.prototype.addEventListener;a.XMLHttpRequest.prototype.addEventListener=function(g){return this._precloudListeners||(this._precloudListeners={}),this._precloudListeners[g]=!0,d.apply(this,arguments)};var e=a.XMLHttpRequest.prototype.open;a.XMLHttpRequest.prototype.open=function(g,h){return this._precloudurl=h,this._precloudMethod=g,this._precloudurl=this._precloudurl.replace(new RegExp('^'+a.location.origin),''),e.apply(this,arguments)};var f=a.XMLHttpRequest.prototype.send;a.XMLHttpRequest.prototype.send=function(){if(this._precloudMethod&&!this._precloudMethod.match(/get/i))return f.apply(this,arguments);if(!b[this._precloudurl])return f.apply(this,arguments);var g=function g(){if(b[this._precloudurl]){var h=b[this._precloudurl][0],j=b[this._precloudurl][1];delete b[this._precloudurl],Object.defineProperty(this,'response',{get:function get(){return j}}),Object.defineProperty(this,'responseText',{get:function get(){return j}}),Object.defineProperty(this,'readyState',{get:function get(){return 4}}),Object.defineProperty(this,'status',{get:function get(){return 200}}),Object.defineProperty(this,'statusText',{get:function get(){return 200}}),Object.defineProperty(this,'getResponseHeader',{value:function value(r){if(r&&r.match(/content-type/i))return h}});var k=['readystatechange','load'];for(var l=0;l<k.length;l++){var n=k[l];if(this._precloudListeners&&this._precloudListeners[n]){var o=document.createEvent('Event');o.initEvent(n,!0,!0),this.dispatchEvent(o)}else{var q=this['on'+n];q&&q()}}}else return f.apply(this,arguments)};return g=g.apply.bind(g,this,arguments),a.requestAnimationFrame?a.requestAnimationFrame(g):setTimeout(g,0)}}}
