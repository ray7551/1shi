Function.prototype.bind || (Function.prototype.bind = function (oThis) {
  if (typeof this !== 'function') {
    // closest thing possible to the ECMAScript 5
    // internal IsCallable function
    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
  }

  var aArgs = Array.prototype.slice.call(arguments, 1),
    fToBind = this,
    fNOP = function () {},
    fBound = function () {
      return fToBind.apply(this instanceof fNOP ? this : oThis,
        aArgs.concat(Array.prototype.slice.call(arguments)));
    };

  if (this.prototype) {
    // Function.prototype doesn't have a prototype property
    fNOP.prototype = this.prototype;
  }
  fBound.prototype = new fNOP();

  return fBound;
});

Array.isArray || (Array.isArray = function (val) {
  return '' + a !== a && // is not the string '[object Array]' and
    // test with Object.prototype.toString
    {}.toString.call(val) === '[object Array]'
});

/**
 * @param {function(T=, number=, Array.<T>=)} callback
 * @param {*} [thisArg]
 * @return {void}
 */
Array.prototype.forEach || (Array.prototype.forEach = function (callback, thisArg) {
  if (this == null) {
    throw new TypeError(' this is null or not defined');
  }

  var T, k;
  var O = Object(this);
  var len = O.length >>> 0;

  if (typeof callback !== "function") {
    throw new TypeError(callback + ' is not a function');
  }

  if (arguments.length > 1) {
    T = thisArg;
  }
  k = 0;

  while (k < len) {
    var kValue;
    if (k in O) {
      kValue = O[k];
      callback.call(T, kValue, k, O);
    }
    k++;
  }
});

Array.prototype.filter || (Array.prototype.filter = function (fun /*, thisArg*/ ) {
  'use strict';

  if (this === void 0 || this === null) {
    throw new TypeError();
  }

  var t = Object(this);
  var len = t.length >>> 0;
  if (typeof fun !== 'function') {
    throw new TypeError();
  }

  var res = [];
  var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
  for (var i = 0; i < len; i++) {
    if (i in t) {
      var val = t[i];

      // NOTE: Technically this should Object.defineProperty at
      //       the next index, as push can be affected by
      //       properties on Object.prototype and Array.prototype.
      //       But that method's new, and collisions should be
      //       rare, so use the more-compatible alternative.
      if (fun.call(thisArg, val, i, t)) {
        res.push(val);
      }
    }
  }

  return res;
});

// PIXI have this polyfill
// Object.assign || (Object.assign = function (target /*[, ...sources]*/) {
//   'use strict';
//   if (target === undefined || target === null) {
//     throw new TypeError('Cannot convert undefined or null to object');
//   }
//
//   var output = Object(target);
//   for (var index = 1; index < arguments.length; index++) {
//     var source = arguments[index];
//     if (source !== undefined && source !== null) {
//       for (var nextKey in source) {
//         if (Object.prototype.hasOwnProperty.call(source, nextKey)) {
//           output[nextKey] = source[nextKey];
//         }
//       }
//     }
//   }
//   return output;
// });

// PIXI have this polyfill
// Math.sign || (Math.sign = function(x) {
//   x = +x; // convert to a number
//   if (x === 0 || isNaN(x)) {
//     return x;
//   }
//   return x > 0 ? 1 : -1;
// });

var Util = {};
/**
 * Util.sign like Math.sign, but not return 0
 * @param x {number}
 * @return {number} 1(if egt 0) or -1(if lt 0)
 */
Util.sign = function (x) {
  x = +x; // convert to a number
  if (isNaN(x)) {
    return x;
  }
  return x >= 0 ? 1 : -1;
};
