// eslint-disable-next-line no-unused-vars
function insertAppendMonkeyPatchForHeadDeDupe (window) {
  function toArray (obj) {
    var array = [];
    // iterate backwards ensuring that length is an UInt32
    for (var i = obj.length >>> 0; i--;) {
      array[i] = obj[i];
    }
    return array;
  }

  // Array.prototype.find polyfill
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find#Polyfill
  if (!Array.prototype.find) {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Array.prototype, 'find', {
      value: function (predicate) {
        // 1. Let O be ? ToObject(this value).
        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);

        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0;

        // 3. If IsCallable(predicate) is false, throw a TypeError exception.
        if (typeof predicate !== 'function') {
          throw new TypeError('predicate must be a function');
        }

        // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
        var thisArg = arguments[1];

        // 5. Let k be 0.
        var k = 0;

        // 6. Repeat, while k < len
        while (k < len) {
          // a. Let Pk be ! ToString(k).
          // b. Let kValue be ? Get(O, Pk).
          // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
          // d. If testResult is true, return kValue.
          var kValue = o[k];
          if (predicate.call(thisArg, kValue, k, o)) {
            return kValue;
          }
          // e. Increase k by 1.
          k++;
        }

        // 7. Return undefined.
        return undefined;
      }
    });
  }

  function serializeAttribute (attr, node) {
    if (
      node.tagName === 'META' &&
      attr.name &&
      attr.name.toLowerCase() === 'content'
    ) {
      return '';
    }
    // only 1 rel canonical
    if (
      node.getAttribute('rel') &&
      node.getAttribute('rel') === 'canonical' &&
      attr.name &&
      attr.name.toLowerCase() === 'href'
    ) {
      return '';
    }
    return (attr.name || '') + (attr.value || '');
  }

  function serializeNodeTagAndAttrs (node) {
    var attrs = [];
    Array.prototype.forEach.call(node.attributes || node.attrs, function (attr) {
      attrs.push(serializeAttribute(attr, node));
    });
    return node.tagName + attrs.sort().join(',');
  }

  // 1. link and meta have no outerHTML, and their attrs are order insensitive
  // 2. angular may insert meta/link with a template for the content attr
  //    so we hardcode specific tags we know are unique irrespective of the content
  //    a. meta rel=canonical (ignore href)
  //    b. any meta with a content attr (just assume the name or prop makes it unique)
  function compareNodes (ourNode, iteratingNode) {
    if (ourNode.tagName !== iteratingNode.tagName) return false;

    if (ourNode.tagName === 'LINK' || ourNode.tagName === 'META') {
      return serializeNodeTagAndAttrs(ourNode) ===
        serializeNodeTagAndAttrs(iteratingNode);
    } else {
      return ourNode.outerHTML === iteratingNode.outerHTML;
    }
  }

  function deleteExistingIfExist (nodeToInsert, parentElement) {
    var found = toArray(parentElement.children).find(function (child) {
      return compareNodes(nodeToInsert, child);
    });
    if (found) parentElement.removeChild(found);
  }

  // 1. these 2 monkey patches (appendChild, insertBefore) prevent duplicate meta,
  //    script, link etc... in the head tag by destroying the element from the
  //    server-side rendered HTML if it's the same as what we're appending/inserting
  // 2. we destroy the original (as opposed to bailing out and doing  nothing)
  //    because it:
  //    a. allows the client to control order (important for CSS)
  //    b. allows the client to control meta information on the DOM
  var originalAppendChild = window.Node.prototype.appendChild;
  window.Node.prototype.appendChild = function (nodeToInsert) {
    try {
      if (this.nodeName === 'HEAD') deleteExistingIfExist(nodeToInsert, this);
      return originalAppendChild.apply(this, arguments);
    } catch (err) {
      return originalAppendChild.apply(this, arguments);
    }
  };

  // once nuance different than the appendChild implementation
  // if we try to insert, an element that already exists right before itself i.e.: <meta name="hello" /> before <meta name="hello" />
  // just bail out and return the original reference node (there's nothing to destroy/remove)
  var originalInsertBefore = window.Node.prototype.insertBefore;
  window.Node.prototype.insertBefore = function (newNode, referenceNode) {
    try {
      if (this.nodeName !== 'HEAD') {
        return originalInsertBefore.apply(this, arguments);
      }

      // if newNode and referenceNode are the same, remove the prerendered
      // node, and insert the new client generated node in the exact same spot
      // the placement is important for link tags (CSS) because order affects styling
      if (compareNodes(newNode, referenceNode)) {
        var insertBeforeRes = originalInsertBefore.apply(this, arguments);
        this.removeChild(referenceNode);
        return insertBeforeRes;
      }

      deleteExistingIfExist(newNode, this);
      return originalInsertBefore.apply(this, arguments);
    } catch (err) {
      return originalInsertBefore.apply(this, arguments);
    }
  };
}
