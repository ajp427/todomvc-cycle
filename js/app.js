(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

require("core-js/shim");

require("regenerator/runtime");

if (global._babelPolyfill) {
  throw new Error("only one instance of babel/polyfill is allowed");
}
global._babelPolyfill = true;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"core-js/shim":85,"regenerator/runtime":86}],2:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
'use strict';

var $ = require('./$');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = $.toObject($this),
        length = $.toLength(O.length),
        index = $.toIndex(fromIndex, length),
        value;
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      if (value != value) return true;
    } else for (; length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index;
    }return !IS_INCLUDES && -1;
  };
};

},{"./$":22}],3:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
'use strict';

var $ = require('./$'),
    ctx = require('./$.ctx');
module.exports = function (TYPE) {
  var IS_MAP = TYPE == 1,
      IS_FILTER = TYPE == 2,
      IS_SOME = TYPE == 3,
      IS_EVERY = TYPE == 4,
      IS_FIND_INDEX = TYPE == 6,
      NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that) {
    var O = Object($.assertDefined($this)),
        self = $.ES5Object(O),
        f = ctx(callbackfn, that, 3),
        length = $.toLength(self.length),
        index = 0,
        result = IS_MAP ? Array(length) : IS_FILTER ? [] : undefined,
        val,
        res;
    for (; length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res; // map
        else if (res) switch (TYPE) {
          case 3:
            return true; // some
          case 5:
            return val; // find
          case 6:
            return index; // findIndex
          case 2:
            result.push(val); // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

},{"./$":22,"./$.ctx":11}],4:[function(require,module,exports){
'use strict';

var $ = require('./$');
function assert(condition, msg1, msg2) {
  if (!condition) throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
assert.def = $.assertDefined;
assert.fn = function (it) {
  if (!$.isFunction(it)) throw TypeError(it + ' is not a function!');
  return it;
};
assert.obj = function (it) {
  if (!$.isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};
assert.inst = function (it, Constructor, name) {
  if (!(it instanceof Constructor)) throw TypeError(name + ': use the \'new\' operator!');
  return it;
};
module.exports = assert;

},{"./$":22}],5:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    enumKeys = require('./$.enum-keys');
// 19.1.2.1 Object.assign(target, source, ...)
/* eslint-disable no-unused-vars */
module.exports = Object.assign || function assign(target, source) {
  /* eslint-enable no-unused-vars */
  var T = Object($.assertDefined(target)),
      l = arguments.length,
      i = 1;
  while (l > i) {
    var S = $.ES5Object(arguments[i++]),
        keys = enumKeys(S),
        length = keys.length,
        j = 0,
        key;
    while (length > j) T[key = keys[j++]] = S[key];
  }
  return T;
};

},{"./$":22,"./$.enum-keys":14}],6:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    TAG = require('./$.wks')('toStringTag'),
    toString = ({}).toString;
function cof(it) {
  return toString.call(it).slice(8, -1);
}
cof.classof = function (it) {
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null' : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
};
cof.set = function (it, tag, stat) {
  if (it && !$.has(it = stat ? it : it.prototype, TAG)) $.hide(it, TAG, tag);
};
module.exports = cof;

},{"./$":22,"./$.wks":36}],7:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    ctx = require('./$.ctx'),
    safe = require('./$.uid').safe,
    assert = require('./$.assert'),
    forOf = require('./$.for-of'),
    step = require('./$.iter').step,
    has = $.has,
    set = $.set,
    isObject = $.isObject,
    hide = $.hide,
    isFrozen = Object.isFrozen || $.core.Object.isFrozen,
    ID = safe('id'),
    O1 = safe('O1'),
    LAST = safe('last'),
    FIRST = safe('first'),
    ITER = safe('iter'),
    SIZE = $.DESC ? safe('size') : 'size',
    id = 0;

function fastKey(it, create) {
  // return primitive with prefix
  if (!isObject(it)) return (typeof it == 'string' ? 'S' : 'P') + it;
  // can't set id to frozen object
  if (isFrozen(it)) return 'F';
  if (!has(it, ID)) {
    // not necessary to add id
    if (!create) return 'E';
    // add missing object id
    hide(it, ID, ++id);
    // return object id with prefix
  }return 'O' + it[ID];
}

function getEntry(that, key) {
  // fast case
  var index = fastKey(key),
      entry;
  if (index != 'F') return that[O1][index];
  // frozen object case
  for (entry = that[FIRST]; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
}

module.exports = {
  getConstructor: function getConstructor(NAME, IS_MAP, ADDER) {
    function C() {
      var that = assert.inst(this, C, NAME),
          iterable = arguments[0];
      set(that, O1, $.create(null));
      set(that, SIZE, 0);
      set(that, LAST, undefined);
      set(that, FIRST, undefined);
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    }
    $.mix(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that[FIRST] = that[LAST] = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function _delete(key) {
        var that = this,
            entry = getEntry(that, key);
        if (entry) {
          var next = entry.n,
              prev = entry.p;
          delete that[O1][entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that[FIRST] == entry) that[FIRST] = next;
          if (that[LAST] == entry) that[LAST] = prev;
          that[SIZE]--;
        }return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */) {
        var f = ctx(callbackfn, arguments[1], 3),
            entry;
        while (entry = entry ? entry.n : this[FIRST]) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(this, key);
      }
    });
    if ($.DESC) $.setDesc(C.prototype, 'size', {
      get: function get() {
        return assert.def(this[SIZE]);
      }
    });
    return C;
  },
  def: function def(that, key, value) {
    var entry = getEntry(that, key),
        prev,
        index;
    // change existing entry
    if (entry) {
      entry.v = value;
      // create new entry
    } else {
      that[LAST] = entry = {
        i: index = fastKey(key, true), // <- index
        k: key, // <- key
        v: value, // <- value
        p: prev = that[LAST], // <- previous entry
        n: undefined, // <- next entry
        r: false // <- removed
      };
      if (!that[FIRST]) that[FIRST] = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index != 'F') that[O1][index] = entry;
    }return that;
  },
  getEntry: getEntry,
  // add .keys, .values, .entries, [@@iterator]
  // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
  setIter: function setIter(C, NAME, IS_MAP) {
    require('./$.iter-define')(C, NAME, function (iterated, kind) {
      set(this, ITER, { o: iterated, k: kind });
    }, function () {
      var iter = this[ITER],
          kind = iter.k,
          entry = iter.l;
      // revert to the last existing entry
      while (entry && entry.r) entry = entry.p;
      // get next entry
      if (!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])) {
        // or finish the iteration
        iter.o = undefined;
        return step(1);
      }
      // return step by kind
      if (kind == 'keys') return step(0, entry.k);
      if (kind == 'values') return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);
  }
};

},{"./$":22,"./$.assert":4,"./$.ctx":11,"./$.for-of":15,"./$.iter":21,"./$.iter-define":19,"./$.uid":34}],8:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
'use strict';

var $def = require('./$.def'),
    forOf = require('./$.for-of');
module.exports = function (NAME) {
  $def($def.P, NAME, {
    toJSON: function toJSON() {
      var arr = [];
      forOf(this, false, arr.push, arr);
      return arr;
    }
  });
};

},{"./$.def":12,"./$.for-of":15}],9:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    safe = require('./$.uid').safe,
    assert = require('./$.assert'),
    forOf = require('./$.for-of'),
    _has = $.has,
    isObject = $.isObject,
    hide = $.hide,
    isFrozen = Object.isFrozen || $.core.Object.isFrozen,
    id = 0,
    ID = safe('id'),
    WEAK = safe('weak'),
    LEAK = safe('leak'),
    method = require('./$.array-methods'),
    find = method(5),
    findIndex = method(6);
function findFrozen(store, key) {
  return find(store.array, function (it) {
    return it[0] === key;
  });
}
// fallback for frozen keys
function leakStore(that) {
  return that[LEAK] || hide(that, LEAK, {
    array: [],
    get: function get(key) {
      var entry = findFrozen(this, key);
      if (entry) return entry[1];
    },
    has: function has(key) {
      return !!findFrozen(this, key);
    },
    set: function set(key, value) {
      var entry = findFrozen(this, key);
      if (entry) entry[1] = value;else this.array.push([key, value]);
    },
    'delete': function _delete(key) {
      var index = findIndex(this.array, function (it) {
        return it[0] === key;
      });
      if (~index) this.array.splice(index, 1);
      return !! ~index;
    }
  })[LEAK];
}

module.exports = {
  getConstructor: function getConstructor(NAME, IS_MAP, ADDER) {
    function C() {
      $.set(assert.inst(this, C, NAME), ID, id++);
      var iterable = arguments[0];
      if (iterable != undefined) forOf(iterable, IS_MAP, this[ADDER], this);
    }
    $.mix(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function _delete(key) {
        if (!isObject(key)) return false;
        if (isFrozen(key)) return leakStore(this)['delete'](key);
        return _has(key, WEAK) && _has(key[WEAK], this[ID]) && delete key[WEAK][this[ID]];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key) {
        if (!isObject(key)) return false;
        if (isFrozen(key)) return leakStore(this).has(key);
        return _has(key, WEAK) && _has(key[WEAK], this[ID]);
      }
    });
    return C;
  },
  def: function def(that, key, value) {
    if (isFrozen(assert.obj(key))) {
      leakStore(that).set(key, value);
    } else {
      _has(key, WEAK) || hide(key, WEAK, {});
      key[WEAK][that[ID]] = value;
    }return that;
  },
  leakStore: leakStore,
  WEAK: WEAK,
  ID: ID
};

},{"./$":22,"./$.array-methods":3,"./$.assert":4,"./$.for-of":15,"./$.uid":34}],10:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    $def = require('./$.def'),
    BUGGY = require('./$.iter').BUGGY,
    forOf = require('./$.for-of'),
    species = require('./$.species'),
    assertInstance = require('./$.assert').inst;

module.exports = function (NAME, methods, common, IS_MAP, IS_WEAK) {
  var Base = $.g[NAME],
      C = Base,
      ADDER = IS_MAP ? 'set' : 'add',
      proto = C && C.prototype,
      O = {};
  function fixMethod(KEY, CHAIN) {
    var method = proto[KEY];
    if ($.FW) proto[KEY] = function (a, b) {
      var result = method.call(this, a === 0 ? 0 : a, b);
      return CHAIN ? this : result;
    };
  }
  if (!$.isFunction(C) || !(IS_WEAK || !BUGGY && proto.forEach && proto.entries)) {
    // create collection constructor
    C = common.getConstructor(NAME, IS_MAP, ADDER);
    $.mix(C.prototype, methods);
  } else {
    var inst = new C(),
        chain = inst[ADDER](IS_WEAK ? {} : -0, 1),
        buggyZero;
    // wrap for init collections from iterable
    if (!require('./$.iter-detect')(function (iter) {
      new C(iter);
    })) {
      // eslint-disable-line no-new
      C = function () {
        assertInstance(this, C, NAME);
        var that = new Base(),
            iterable = arguments[0];
        if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      };
      C.prototype = proto;
      if ($.FW) proto.constructor = C;
    }
    IS_WEAK || inst.forEach(function (val, key) {
      buggyZero = 1 / key === -Infinity;
    });
    // fix converting -0 key to +0
    if (buggyZero) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    // + fix .add & .set for chaining
    if (buggyZero || chain !== inst) fixMethod(ADDER, true);
  }

  require('./$.cof').set(C, NAME);

  O[NAME] = C;
  $def($def.G + $def.W + $def.F * (C != Base), O);
  species(C);
  species($.core[NAME]); // for wrapper

  if (!IS_WEAK) common.setIter(C, NAME, IS_MAP);

  return C;
};

},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.def":12,"./$.for-of":15,"./$.iter":21,"./$.iter-detect":20,"./$.species":28}],11:[function(require,module,exports){
// Optional / simple context binding
'use strict';

var assertFunction = require('./$.assert').fn;
module.exports = function (fn, that, length) {
  assertFunction(fn);
  if (~length && that === undefined) return fn;
  switch (length) {
    case 1:
      return function (a) {
        return fn.call(that, a);
      };
    case 2:
      return function (a, b) {
        return fn.call(that, a, b);
      };
    case 3:
      return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
  }return function () {
    return fn.apply(that, arguments);
  };
};
/* ...args */

},{"./$.assert":4}],12:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    global = $.g,
    core = $.core,
    isFunction = $.isFunction;
function ctx(fn, that) {
  return function () {
    return fn.apply(that, arguments);
  };
}
global.core = core;
// type bitmap
$def.F = 1; // forced
$def.G = 2; // global
$def.S = 4; // static
$def.P = 8; // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source) {
  var key,
      own,
      out,
      exp,
      isGlobal = type & $def.G,
      target = isGlobal ? global : type & $def.S ? global[name] : (global[name] || {}).prototype,
      exports = isGlobal ? core : core[name] || (core[name] = {});
  if (isGlobal) source = name;
  for (key in source) {
    // contains in native
    own = !(type & $def.F) && target && key in target;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    if (type & $def.B && own) exp = ctx(out, global);else exp = type & $def.P && isFunction(out) ? ctx(Function.call, out) : out;
    // extend global
    if (target && !own) {
      if (isGlobal) target[key] = out;else delete target[key] && $.hide(target, key, out);
    }
    // export
    if (exports[key] != out) $.hide(exports, key, exp);
  }
}
module.exports = $def;

},{"./$":22}],13:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    document = $.g.document,
    isObject = $.isObject
// in old IE typeof document.createElement is 'object'
,
    is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./$":22}],14:[function(require,module,exports){
'use strict';

var $ = require('./$');
module.exports = function (it) {
  var keys = $.getKeys(it),
      getDesc = $.getDesc,
      getSymbols = $.getSymbols;
  if (getSymbols) $.each.call(getSymbols(it), function (key) {
    if (getDesc(it, key).enumerable) keys.push(key);
  });
  return keys;
};

},{"./$":22}],15:[function(require,module,exports){
'use strict';

var ctx = require('./$.ctx'),
    get = require('./$.iter').get,
    call = require('./$.iter-call');
module.exports = function (iterable, entries, fn, that) {
  var iterator = get(iterable),
      f = ctx(fn, that, entries ? 2 : 1),
      step;
  while (!(step = iterator.next()).done) {
    if (call(iterator, f, step.value, entries) === false) {
      return call.close(iterator);
    }
  }
};

},{"./$.ctx":11,"./$.iter":21,"./$.iter-call":18}],16:[function(require,module,exports){
"use strict";

module.exports = function ($) {
  $.FW = true;
  $.path = $.g;
  return $;
};

},{}],17:[function(require,module,exports){
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
"use strict";

module.exports = function (fn, args, that) {
                  var un = that === undefined;
                  switch (args.length) {
                                    case 0:
                                                      return un ? fn() : fn.call(that);
                                    case 1:
                                                      return un ? fn(args[0]) : fn.call(that, args[0]);
                                    case 2:
                                                      return un ? fn(args[0], args[1]) : fn.call(that, args[0], args[1]);
                                    case 3:
                                                      return un ? fn(args[0], args[1], args[2]) : fn.call(that, args[0], args[1], args[2]);
                                    case 4:
                                                      return un ? fn(args[0], args[1], args[2], args[3]) : fn.call(that, args[0], args[1], args[2], args[3]);
                                    case 5:
                                                      return un ? fn(args[0], args[1], args[2], args[3], args[4]) : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
                  }return fn.apply(that, args);
};

},{}],18:[function(require,module,exports){
'use strict';

var assertObject = require('./$.assert').obj;
function close(iterator) {
  var ret = iterator['return'];
  if (ret !== undefined) assertObject(ret.call(iterator));
}
function call(iterator, fn, value, entries) {
  try {
    return entries ? fn(assertObject(value)[0], value[1]) : fn(value);
  } catch (e) {
    close(iterator);
    throw e;
  }
}
call.close = close;
module.exports = call;

},{"./$.assert":4}],19:[function(require,module,exports){
'use strict';

var $def = require('./$.def'),
    $ = require('./$'),
    cof = require('./$.cof'),
    $iter = require('./$.iter'),
    SYMBOL_ITERATOR = require('./$.wks')('iterator'),
    FF_ITERATOR = '@@iterator',
    KEYS = 'keys',
    VALUES = 'values',
    Iterators = $iter.Iterators;
module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE) {
  $iter.create(Constructor, NAME, next);
  function createMethod(kind) {
    function $$(that) {
      return new Constructor(that, kind);
    }
    switch (kind) {
      case KEYS:
        return function keys() {
          return $$(this);
        };
      case VALUES:
        return function values() {
          return $$(this);
        };
    }return function entries() {
      return $$(this);
    };
  }
  var TAG = NAME + ' Iterator',
      proto = Base.prototype,
      _native = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT],
      _default = _native || createMethod(DEFAULT),
      methods,
      key;
  // Fix native
  if (_native) {
    var IteratorPrototype = $.getProto(_default.call(new Base()));
    // Set @@toStringTag to native iterators
    cof.set(IteratorPrototype, TAG, true);
    // FF fix
    if ($.FW && $.has(proto, FF_ITERATOR)) $iter.set(IteratorPrototype, $.that);
  }
  // Define iterator
  if ($.FW) $iter.set(proto, _default);
  // Plug for library
  Iterators[NAME] = _default;
  Iterators[TAG] = $.that;
  if (DEFAULT) {
    methods = {
      keys: IS_SET ? _default : createMethod(KEYS),
      values: DEFAULT == VALUES ? _default : createMethod(VALUES),
      entries: DEFAULT != VALUES ? _default : createMethod('entries')
    };
    if (FORCE) for (key in methods) {
      if (!(key in proto)) $.hide(proto, key, methods[key]);
    } else $def($def.P + $def.F * $iter.BUGGY, NAME, methods);
  }
};

},{"./$":22,"./$.cof":6,"./$.def":12,"./$.iter":21,"./$.wks":36}],20:[function(require,module,exports){
'use strict';

var SYMBOL_ITERATOR = require('./$.wks')('iterator'),
    SAFE_CLOSING = false;
try {
  var riter = [7][SYMBOL_ITERATOR]();
  riter['return'] = function () {
    SAFE_CLOSING = true;
  };
  Array.from(riter, function () {
    throw 2;
  });
} catch (e) {}
module.exports = function (exec) {
  if (!SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7],
        iter = arr[SYMBOL_ITERATOR]();
    iter.next = function () {
      safe = true;
    };
    arr[SYMBOL_ITERATOR] = function () {
      return iter;
    };
    exec(arr);
  } catch (e) {}
  return safe;
};
/* empty */ /* empty */

},{"./$.wks":36}],21:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    cof = require('./$.cof'),
    assertObject = require('./$.assert').obj,
    SYMBOL_ITERATOR = require('./$.wks')('iterator'),
    FF_ITERATOR = '@@iterator',
    Iterators = {},
    IteratorPrototype = {};
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, $.that);
function setIterator(O, value) {
  $.hide(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  if (FF_ITERATOR in []) $.hide(O, FF_ITERATOR, value);
}

module.exports = {
  // Safari has buggy iterators w/o `next`
  BUGGY: 'keys' in [] && !('next' in [].keys()),
  Iterators: Iterators,
  step: function step(done, value) {
    return { value: value, done: !!done };
  },
  is: function is(it) {
    var O = Object(it),
        Symbol = $.g.Symbol,
        SYM = Symbol && Symbol.iterator || FF_ITERATOR;
    return SYM in O || SYMBOL_ITERATOR in O || $.has(Iterators, cof.classof(O));
  },
  get: function get(it) {
    var Symbol = $.g.Symbol,
        ext = it[Symbol && Symbol.iterator || FF_ITERATOR],
        getIter = ext || it[SYMBOL_ITERATOR] || Iterators[cof.classof(it)];
    return assertObject(getIter.call(it));
  },
  set: setIterator,
  create: function create(Constructor, NAME, next, proto) {
    Constructor.prototype = $.create(proto || IteratorPrototype, { next: $.desc(1, next) });
    cof.set(Constructor, NAME + ' Iterator');
  }
};

},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.wks":36}],22:[function(require,module,exports){
'use strict';
var global = typeof self != 'undefined' ? self : Function('return this')(),
    core = {},
    defineProperty = Object.defineProperty,
    hasOwnProperty = ({}).hasOwnProperty,
    ceil = Math.ceil,
    floor = Math.floor,
    max = Math.max,
    min = Math.min;
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!(function () {
  try {
    return defineProperty({}, 'a', { get: function get() {
        return 2;
      } }).a == 2;
  } catch (e) {}
})();
var hide = createDefiner(1);
// 7.1.4 ToInteger
function toInteger(it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
}
function desc(bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
}
function simpleSet(object, key, value) {
  object[key] = value;
  return object;
}
function createDefiner(bitmap) {
  return DESC ? function (object, key, value) {
    return $.setDesc(object, key, desc(bitmap, value));
  } : simpleSet;
}

function isObject(it) {
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it) {
  return typeof it == 'function';
}
function assertDefined(it) {
  if (it == undefined) throw TypeError('Can\'t call method on  ' + it);
  return it;
}

var $ = module.exports = require('./$.fw')({
  g: global,
  core: core,
  html: global.document && document.documentElement,
  // http://jsperf.com/core-js-isobject
  isObject: isObject,
  isFunction: isFunction,
  it: function it(_it) {
    return _it;
  },
  that: function that() {
    return this;
  },
  // 7.1.4 ToInteger
  toInteger: toInteger,
  // 7.1.15 ToLength
  toLength: function toLength(it) {
    return it > 0 ? min(toInteger(it), 9007199254740991) : 0; // pow(2, 53) - 1 == 9007199254740991
  },
  toIndex: function toIndex(index, length) {
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  },
  has: function has(it, key) {
    return hasOwnProperty.call(it, key);
  },
  create: Object.create,
  getProto: Object.getPrototypeOf,
  DESC: DESC,
  desc: desc,
  getDesc: Object.getOwnPropertyDescriptor,
  setDesc: defineProperty,
  setDescs: Object.defineProperties,
  getKeys: Object.keys,
  getNames: Object.getOwnPropertyNames,
  getSymbols: Object.getOwnPropertySymbols,
  assertDefined: assertDefined,
  // Dummy, fix for not array-like ES3 string in es5 module
  ES5Object: Object,
  toObject: function toObject(it) {
    return $.ES5Object(assertDefined(it));
  },
  hide: hide,
  def: createDefiner(0),
  set: global.Symbol ? simpleSet : hide,
  mix: function mix(target, src) {
    for (var key in src) hide(target, key, src[key]);
    return target;
  },
  each: [].forEach
});
/* eslint-disable no-undef */
if (typeof __e != 'undefined') __e = core;
if (typeof __g != 'undefined') __g = global;
/* empty */

},{"./$.fw":16}],23:[function(require,module,exports){
'use strict';

var $ = require('./$');
module.exports = function (object, el) {
  var O = $.toObject(object),
      keys = $.getKeys(O),
      length = keys.length,
      index = 0,
      key;
  while (length > index) if (O[key = keys[index++]] === el) return key;
};

},{"./$":22}],24:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    assertObject = require('./$.assert').obj;
module.exports = function ownKeys(it) {
  assertObject(it);
  var keys = $.getNames(it),
      getSymbols = $.getSymbols;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};

},{"./$":22,"./$.assert":4}],25:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    invoke = require('./$.invoke'),
    assertFunction = require('./$.assert').fn;
module.exports = function () {
  var fn = assertFunction(this),
      length = arguments.length,
      pargs = Array(length),
      i = 0,
      _ = $.path._,
      holder = false;
  while (length > i) if ((pargs[i] = arguments[i++]) === _) holder = true;
  return function () {
    var that = this,
        _length = arguments.length,
        j = 0,
        k = 0,
        args;
    if (!holder && !_length) return invoke(fn, pargs, that);
    args = pargs.slice();
    if (holder) for (; length > j; j++) if (args[j] === _) args[j] = arguments[k++];
    while (_length > k) args.push(arguments[k++]);
    return invoke(fn, args, that);
  };
};
/* ...pargs */ /* ...args */

},{"./$":22,"./$.assert":4,"./$.invoke":17}],26:[function(require,module,exports){
'use strict';
module.exports = function (regExp, replace, isStatic) {
  var replacer = replace === Object(replace) ? function (part) {
    return replace[part];
  } : replace;
  return function (it) {
    return String(isStatic ? it : this).replace(regExp, replacer);
  };
};

},{}],27:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
'use strict';

var $ = require('./$'),
    assert = require('./$.assert');
function check(O, proto) {
  assert.obj(O);
  assert(proto === null || $.isObject(proto), proto, ': can\'t set as prototype!');
}
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
  ? (function (buggy, set) {
    try {
      set = require('./$.ctx')(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
      set({}, []);
    } catch (e) {
      buggy = true;
    }
    return function setPrototypeOf(O, proto) {
      check(O, proto);
      if (buggy) O.__proto__ = proto;else set(O, proto);
      return O;
    };
  })() : undefined),
  check: check
};

},{"./$":22,"./$.assert":4,"./$.ctx":11}],28:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    SPECIES = require('./$.wks')('species');
module.exports = function (C) {
  if ($.DESC && !(SPECIES in C)) $.setDesc(C, SPECIES, {
    configurable: true,
    get: $.that
  });
};

},{"./$":22,"./$.wks":36}],29:[function(require,module,exports){
// true  -> String#at
// false -> String#codePointAt
'use strict';

var $ = require('./$');
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String($.assertDefined(that)),
        i = $.toInteger(pos),
        l = s.length,
        a,
        b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 55296 || a > 56319 || i + 1 === l || (b = s.charCodeAt(i + 1)) < 56320 || b > 57343 ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 55296 << 10) + (b - 56320) + 65536;
  };
};

},{"./$":22}],30:[function(require,module,exports){
// http://wiki.ecmascript.org/doku.php?id=strawman:string_padding
'use strict';

var $ = require('./$'),
    repeat = require('./$.string-repeat');

module.exports = function (that, minLength, fillChar, left) {
  // 1. Let O be CheckObjectCoercible(this value).
  // 2. Let S be ToString(O).
  var S = String($.assertDefined(that));
  // 4. If intMinLength is undefined, return S.
  if (minLength === undefined) return S;
  // 4. Let intMinLength be ToInteger(minLength).
  var intMinLength = $.toInteger(minLength);
  // 5. Let fillLen be the number of characters in S minus intMinLength.
  var fillLen = intMinLength - S.length;
  // 6. If fillLen < 0, then throw a RangeError exception.
  // 7. If fillLen is +∞, then throw a RangeError exception.
  if (fillLen < 0 || fillLen === Infinity) {
    throw new RangeError('Cannot satisfy string length ' + minLength + ' for string: ' + S);
  }
  // 8. Let sFillStr be the string represented by fillStr.
  // 9. If sFillStr is undefined, let sFillStr be a space character.
  var sFillStr = fillChar === undefined ? ' ' : String(fillChar);
  // 10. Let sFillVal be a String made of sFillStr, repeated until fillLen is met.
  var sFillVal = repeat.call(sFillStr, Math.ceil(fillLen / sFillStr.length));
  // truncate if we overflowed
  if (sFillVal.length > fillLen) sFillVal = left ? sFillVal.slice(sFillVal.length - fillLen) : sFillVal.slice(0, fillLen);
  // 11. Return a string made from sFillVal, followed by S.
  // 11. Return a String made from S, followed by sFillVal.
  return left ? sFillVal.concat(S) : S.concat(sFillVal);
};

},{"./$":22,"./$.string-repeat":31}],31:[function(require,module,exports){
'use strict';
var $ = require('./$');

module.exports = function repeat(count) {
  var str = String($.assertDefined(this)),
      res = '',
      n = $.toInteger(count);
  if (n < 0 || n == Infinity) throw RangeError('Count can\'t be negative');
  for (; n > 0; (n >>>= 1) && (str += str)) if (n & 1) res += str;
  return res;
};

},{"./$":22}],32:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    ctx = require('./$.ctx'),
    cof = require('./$.cof'),
    invoke = require('./$.invoke'),
    cel = require('./$.dom-create'),
    global = $.g,
    isFunction = $.isFunction,
    html = $.html,
    process = global.process,
    setTask = global.setImmediate,
    clearTask = global.clearImmediate,
    postMessage = global.postMessage,
    addEventListener = global.addEventListener,
    MessageChannel = global.MessageChannel,
    counter = 0,
    queue = {},
    ONREADYSTATECHANGE = 'onreadystatechange',
    defer,
    channel,
    port;
function run() {
  var id = +this;
  if ($.has(queue, id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
}
function listner(event) {
  run.call(event.data);
}
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!isFunction(setTask) || !isFunction(clearTask)) {
  setTask = function (fn) {
    var args = [],
        i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      invoke(isFunction(fn) ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function (id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (cof(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
    // Modern browsers, skip implementation for WebWorkers
    // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if (addEventListener && isFunction(postMessage) && !global.importScripts) {
    defer = function (id) {
      postMessage(id, '*');
    };
    addEventListener('message', listner, false);
    // WebWorkers
  } else if (isFunction(MessageChannel)) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
    // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
    // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};

},{"./$":22,"./$.cof":6,"./$.ctx":11,"./$.dom-create":13,"./$.invoke":17}],33:[function(require,module,exports){
"use strict";

module.exports = function (exec) {
  try {
    exec();
    return false;
  } catch (e) {
    return true;
  }
};

},{}],34:[function(require,module,exports){
'use strict';

var sid = 0;
function uid(key) {
  return 'Symbol(' + key + ')_' + (++sid + Math.random()).toString(36);
}
uid.safe = require('./$').g.Symbol || uid;
module.exports = uid;

},{"./$":22}],35:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
'use strict';

var $ = require('./$'),
    UNSCOPABLES = require('./$.wks')('unscopables');
if ($.FW && !(UNSCOPABLES in [])) $.hide(Array.prototype, UNSCOPABLES, {});
module.exports = function (key) {
  if ($.FW) [][UNSCOPABLES][key] = true;
};

},{"./$":22,"./$.wks":36}],36:[function(require,module,exports){
'use strict';

var global = require('./$').g,
    store = {};
module.exports = function (name) {
  return store[name] || (store[name] = global.Symbol && global.Symbol[name] || require('./$.uid').safe('Symbol.' + name));
};

},{"./$":22,"./$.uid":34}],37:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    cel = require('./$.dom-create'),
    cof = require('./$.cof'),
    $def = require('./$.def'),
    invoke = require('./$.invoke'),
    arrayMethod = require('./$.array-methods'),
    IE_PROTO = require('./$.uid').safe('__proto__'),
    assert = require('./$.assert'),
    assertObject = assert.obj,
    ObjectProto = Object.prototype,
    html = $.html,
    A = [],
    _slice = A.slice,
    _join = A.join,
    classof = cof.classof,
    has = $.has,
    defineProperty = $.setDesc,
    getOwnDescriptor = $.getDesc,
    defineProperties = $.setDescs,
    isFunction = $.isFunction,
    toObject = $.toObject,
    toLength = $.toLength,
    toIndex = $.toIndex,
    IE8_DOM_DEFINE = false,
    $indexOf = require('./$.array-includes')(false),
    $forEach = arrayMethod(0),
    $map = arrayMethod(1),
    $filter = arrayMethod(2),
    $some = arrayMethod(3),
    $every = arrayMethod(4);

if (!$.DESC) {
  try {
    IE8_DOM_DEFINE = defineProperty(cel('div'), 'x', { get: function get() {
        return 8;
      } }).x == 8;
  } catch (e) {}
  $.setDesc = function (O, P, Attributes) {
    if (IE8_DOM_DEFINE) try {
      return defineProperty(O, P, Attributes);
    } catch (e) {}
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
    if ('value' in Attributes) assertObject(O)[P] = Attributes.value;
    return O;
  };
  $.getDesc = function (O, P) {
    if (IE8_DOM_DEFINE) try {
      return getOwnDescriptor(O, P);
    } catch (e) {}
    if (has(O, P)) return $.desc(!ObjectProto.propertyIsEnumerable.call(O, P), O[P]);
  };
  $.setDescs = defineProperties = function (O, Properties) {
    assertObject(O);
    var keys = $.getKeys(Properties),
        length = keys.length,
        i = 0,
        P;
    while (length > i) $.setDesc(O, P = keys[i++], Properties[P]);
    return O;
  };
}
$def($def.S + $def.F * !$.DESC, 'Object', {
  // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $.getDesc,
  // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
  defineProperty: $.setDesc,
  // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
  defineProperties: defineProperties
});

// IE 8- don't enum bug keys
var keys1 = ('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,' + 'toLocaleString,toString,valueOf').split(',')
// Additional keys for getOwnPropertyNames
,
    keys2 = keys1.concat('length', 'prototype'),
    keysLen1 = keys1.length;

// Create object with `null` prototype: use iframe Object with cleared prototype
var _createDict = function createDict() {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = cel('iframe'),
      i = keysLen1,
      gt = '>',
      iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script' + gt);
  iframeDocument.close();
  _createDict = iframeDocument.F;
  while (i--) delete _createDict.prototype[keys1[i]];
  return _createDict();
};
function createGetKeys(names, length) {
  return function (object) {
    var O = toObject(object),
        i = 0,
        result = [],
        key;
    for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while (length > i) if (has(O, key = names[i++])) {
      ~$indexOf(result, key) || result.push(key);
    }
    return result;
  };
}
function isPrimitive(it) {
  return !$.isObject(it);
}
function Empty() {}
$def($def.S, 'Object', {
  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
  getPrototypeOf: $.getProto = $.getProto || function (O) {
    O = Object(assert.def(O));
    if (has(O, IE_PROTO)) return O[IE_PROTO];
    if (isFunction(O.constructor) && O instanceof O.constructor) {
      return O.constructor.prototype;
    }return O instanceof Object ? ObjectProto : null;
  },
  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $.getNames = $.getNames || createGetKeys(keys2, keys2.length, true),
  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  create: $.create = $.create || function (O, /*?*/Properties) {
    var result;
    if (O !== null) {
      Empty.prototype = assertObject(O);
      result = new Empty();
      Empty.prototype = null;
      // add "__proto__" for Object.getPrototypeOf shim
      result[IE_PROTO] = O;
    } else result = _createDict();
    return Properties === undefined ? result : defineProperties(result, Properties);
  },
  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
  keys: $.getKeys = $.getKeys || createGetKeys(keys1, keysLen1, false),
  // 19.1.2.17 / 15.2.3.8 Object.seal(O)
  seal: $.it, // <- cap
  // 19.1.2.5 / 15.2.3.9 Object.freeze(O)
  freeze: $.it, // <- cap
  // 19.1.2.15 / 15.2.3.10 Object.preventExtensions(O)
  preventExtensions: $.it, // <- cap
  // 19.1.2.13 / 15.2.3.11 Object.isSealed(O)
  isSealed: isPrimitive, // <- cap
  // 19.1.2.12 / 15.2.3.12 Object.isFrozen(O)
  isFrozen: isPrimitive, // <- cap
  // 19.1.2.11 / 15.2.3.13 Object.isExtensible(O)
  isExtensible: $.isObject // <- cap
});

// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
$def($def.P, 'Function', {
  bind: function bind(that /*, args... */) {
    var fn = assert.fn(this),
        partArgs = _slice.call(arguments, 1);
    function bound() {
      var args = partArgs.concat(_slice.call(arguments));
      return invoke(fn, args, this instanceof bound ? $.create(fn.prototype) : that);
    }
    if (fn.prototype) bound.prototype = fn.prototype;
    return bound;
  }
});

// Fix for not array-like ES3 string and DOM objects
if (!(0 in Object('z') && 'z'[0] == 'z')) {
  $.ES5Object = function (it) {
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
}

var buggySlice = true;
try {
  if (html) _slice.call(html);
  buggySlice = false;
} catch (e) {}

$def($def.P + $def.F * buggySlice, 'Array', {
  slice: function slice(begin, end) {
    var len = toLength(this.length),
        klass = cof(this);
    end = end === undefined ? len : end;
    if (klass == 'Array') return _slice.call(this, begin, end);
    var start = toIndex(begin, len),
        upTo = toIndex(end, len),
        size = toLength(upTo - start),
        cloned = Array(size),
        i = 0;
    for (; i < size; i++) cloned[i] = klass == 'String' ? this.charAt(start + i) : this[start + i];
    return cloned;
  }
});

$def($def.P + $def.F * ($.ES5Object != Object), 'Array', {
  join: function join() {
    return _join.apply($.ES5Object(this), arguments);
  }
});

// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
$def($def.S, 'Array', {
  isArray: function isArray(arg) {
    return cof(arg) == 'Array';
  }
});
function createArrayReduce(isRight) {
  return function (callbackfn, memo) {
    assert.fn(callbackfn);
    var O = toObject(this),
        length = toLength(O.length),
        index = isRight ? length - 1 : 0,
        i = isRight ? -1 : 1;
    if (arguments.length < 2) for (;;) {
      if (index in O) {
        memo = O[index];
        index += i;
        break;
      }
      index += i;
      assert(isRight ? index >= 0 : length > index, 'Reduce of empty array with no initial value');
    }
    for (; isRight ? index >= 0 : length > index; index += i) if (index in O) {
      memo = callbackfn(memo, O[index], index, this);
    }
    return memo;
  };
}
$def($def.P, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: $.each = $.each || function forEach(callbackfn /*, that = undefined */) {
    return $forEach(this, callbackfn, arguments[1]);
  },
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn /*, that = undefined */) {
    return $map(this, callbackfn, arguments[1]);
  },
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn /*, that = undefined */) {
    return $filter(this, callbackfn, arguments[1]);
  },
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn /*, that = undefined */) {
    return $some(this, callbackfn, arguments[1]);
  },
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: function every(callbackfn /*, that = undefined */) {
    return $every(this, callbackfn, arguments[1]);
  },
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: createArrayReduce(false),
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: createArrayReduce(true),
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: function indexOf(el /*, fromIndex = 0 */) {
    return $indexOf(this, el, arguments[1]);
  },
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function lastIndexOf(el, fromIndex /* = @[*-1] */) {
    var O = toObject(this),
        length = toLength(O.length),
        index = length - 1;
    if (arguments.length > 1) index = Math.min(index, $.toInteger(fromIndex));
    if (index < 0) index = toLength(length + index);
    for (; index >= 0; index--) if (index in O) if (O[index] === el) return index;
    return -1;
  }
});

// 21.1.3.25 / 15.5.4.20 String.prototype.trim()
$def($def.P, 'String', { trim: require('./$.replacer')(/^\s*([\s\S]*\S)?\s*$/, '$1') });

// 20.3.3.1 / 15.9.4.4 Date.now()
$def($def.S, 'Date', { now: function now() {
    return +new Date();
  } });

function lz(num) {
  return num > 9 ? num : '0' + num;
}

// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
// PhantomJS and old webkit had a broken Date implementation.
var date = new Date(-50000000000000 - 1),
    brokenDate = !(date.toISOString && date.toISOString() == '0385-07-25T07:06:39.999Z' && require('./$.throws')(function () {
  new Date(NaN).toISOString();
}));
$def($def.P + $def.F * brokenDate, 'Date', { toISOString: function toISOString() {
    if (!isFinite(this)) throw RangeError('Invalid time value');
    var d = this,
        y = d.getUTCFullYear(),
        m = d.getUTCMilliseconds(),
        s = y < 0 ? '-' : y > 9999 ? '+' : '';
    return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) + '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) + 'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) + ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
  } });

if (classof((function () {
  return arguments;
})()) == 'Object') cof.classof = function (it) {
  var tag = classof(it);
  return tag == 'Object' && isFunction(it.callee) ? 'Arguments' : tag;
};
/* empty */ /* empty */ /* empty */ /* args... */ /* empty */

},{"./$":22,"./$.array-includes":2,"./$.array-methods":3,"./$.assert":4,"./$.cof":6,"./$.def":12,"./$.dom-create":13,"./$.invoke":17,"./$.replacer":26,"./$.throws":33,"./$.uid":34}],38:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    $def = require('./$.def'),
    toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
  copyWithin: function copyWithin(target, /* = 0 */start /* = 0, end = @length */) {
    var O = Object($.assertDefined(this)),
        len = $.toLength(O.length),
        to = toIndex(target, len),
        from = toIndex(start, len),
        end = arguments[2],
        fin = end === undefined ? len : toIndex(end, len),
        count = Math.min(fin - from, len - to),
        inc = 1;
    if (from < to && to < from + count) {
      inc = -1;
      from = from + count - 1;
      to = to + count - 1;
    }
    while (count-- > 0) {
      if (from in O) O[to] = O[from];else delete O[to];
      to += inc;
      from += inc;
    }return O;
  }
});
require('./$.unscope')('copyWithin');

},{"./$":22,"./$.def":12,"./$.unscope":35}],39:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    $def = require('./$.def'),
    toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
  fill: function fill(value /*, start = 0, end = @length */) {
    var O = Object($.assertDefined(this)),
        length = $.toLength(O.length),
        index = toIndex(arguments[1], length),
        end = arguments[2],
        endPos = end === undefined ? length : toIndex(end, length);
    while (endPos > index) O[index++] = value;
    return O;
  }
});
require('./$.unscope')('fill');

},{"./$":22,"./$.def":12,"./$.unscope":35}],40:[function(require,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var KEY = 'findIndex',
    $def = require('./$.def'),
    forced = true,
    $find = require('./$.array-methods')(6);
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () {
  forced = false;
});
$def($def.P + $def.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn /*, that = undefined */) {
    return $find(this, callbackfn, arguments[1]);
  }
});
require('./$.unscope')(KEY);

},{"./$.array-methods":3,"./$.def":12,"./$.unscope":35}],41:[function(require,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var KEY = 'find',
    $def = require('./$.def'),
    forced = true,
    $find = require('./$.array-methods')(5);
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () {
  forced = false;
});
$def($def.P + $def.F * forced, 'Array', {
  find: function find(callbackfn /*, that = undefined */) {
    return $find(this, callbackfn, arguments[1]);
  }
});
require('./$.unscope')(KEY);

},{"./$.array-methods":3,"./$.def":12,"./$.unscope":35}],42:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    ctx = require('./$.ctx'),
    $def = require('./$.def'),
    $iter = require('./$.iter'),
    call = require('./$.iter-call');
$def($def.S + $def.F * !require('./$.iter-detect')(function (iter) {
  Array.from(iter);
}), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /*, mapfn = undefined, thisArg = undefined*/) {
    var O = Object($.assertDefined(arrayLike)),
        mapfn = arguments[1],
        mapping = mapfn !== undefined,
        f = mapping ? ctx(mapfn, arguments[2], 2) : undefined,
        index = 0,
        length,
        result,
        step,
        iterator;
    if ($iter.is(O)) {
      iterator = $iter.get(O);
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result = new (typeof this == 'function' ? this : Array)();
      for (; !(step = iterator.next()).done; index++) {
        result[index] = mapping ? call(iterator, f, [step.value, index], true) : step.value;
      }
    } else {
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result = new (typeof this == 'function' ? this : Array)(length = $.toLength(O.length));
      for (; length > index; index++) {
        result[index] = mapping ? f(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});

},{"./$":22,"./$.ctx":11,"./$.def":12,"./$.iter":21,"./$.iter-call":18,"./$.iter-detect":20}],43:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    setUnscope = require('./$.unscope'),
    ITER = require('./$.uid').safe('iter'),
    $iter = require('./$.iter'),
    step = $iter.step,
    Iterators = $iter.Iterators;

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
require('./$.iter-define')(Array, 'Array', function (iterated, kind) {
  $.set(this, ITER, { o: $.toObject(iterated), i: 0, k: kind });
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var iter = this[ITER],
      O = iter.o,
      kind = iter.k,
      index = iter.i++;
  if (!O || index >= O.length) {
    iter.o = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

setUnscope('keys');
setUnscope('values');
setUnscope('entries');

},{"./$":22,"./$.iter":21,"./$.iter-define":19,"./$.uid":34,"./$.unscope":35}],44:[function(require,module,exports){
'use strict';

var $def = require('./$.def');
$def($def.S, 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function of() {
    var index = 0,
        length = arguments.length
    // strange IE quirks mode bug -> use typeof instead of isFunction
    ,
        result = new (typeof this == 'function' ? this : Array)(length);
    while (length > index) result[index] = arguments[index++];
    result.length = length;
    return result;
  }
});
/* ...args */

},{"./$.def":12}],45:[function(require,module,exports){
'use strict';

require('./$.species')(Array);

},{"./$.species":28}],46:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    HAS_INSTANCE = require('./$.wks')('hasInstance'),
    FunctionProto = Function.prototype;
// 19.2.3.6 Function.prototype[@@hasInstance](V)
if (!(HAS_INSTANCE in FunctionProto)) $.setDesc(FunctionProto, HAS_INSTANCE, { value: function value(O) {
    if (!$.isFunction(this) || !$.isObject(O)) return false;
    if (!$.isObject(this.prototype)) return O instanceof this;
    // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
    while (O = $.getProto(O)) if (this.prototype === O) return true;
    return false;
  } });

},{"./$":22,"./$.wks":36}],47:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    NAME = 'name',
    setDesc = $.setDesc,
    FunctionProto = Function.prototype;
// 19.2.4.2 name
NAME in FunctionProto || $.FW && $.DESC && setDesc(FunctionProto, NAME, {
  configurable: true,
  get: function get() {
    var match = String(this).match(/^\s*function ([^ (]*)/),
        name = match ? match[1] : '';
    $.has(this, NAME) || setDesc(this, NAME, $.desc(5, name));
    return name;
  },
  set: function set(value) {
    $.has(this, NAME) || setDesc(this, NAME, $.desc(0, value));
  }
});

},{"./$":22}],48:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.1 Map Objects
require('./$.collection')('Map', {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);

},{"./$.collection":10,"./$.collection-strong":7}],49:[function(require,module,exports){
'use strict';

var Infinity = 1 / 0,
    $def = require('./$.def'),
    E = Math.E,
    pow = Math.pow,
    abs = Math.abs,
    exp = Math.exp,
    log = Math.log,
    sqrt = Math.sqrt,
    ceil = Math.ceil,
    floor = Math.floor,
    EPSILON = pow(2, -52),
    EPSILON32 = pow(2, -23),
    MAX32 = pow(2, 127) * (2 - EPSILON32),
    MIN32 = pow(2, -126);
function roundTiesToEven(n) {
  return n + 1 / EPSILON - 1 / EPSILON;
}

// 20.2.2.28 Math.sign(x)
function sign(x) {
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
}
// 20.2.2.5 Math.asinh(x)
function asinh(x) {
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
}
// 20.2.2.14 Math.expm1(x)
function expm1(x) {
  return (x = +x) == 0 ? x : x > -0.000001 && x < 0.000001 ? x + x * x / 2 : exp(x) - 1;
}

$def($def.S, 'Math', {
  // 20.2.2.3 Math.acosh(x)
  acosh: function acosh(x) {
    return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
  },
  // 20.2.2.5 Math.asinh(x)
  asinh: asinh,
  // 20.2.2.7 Math.atanh(x)
  atanh: function atanh(x) {
    return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
  },
  // 20.2.2.9 Math.cbrt(x)
  cbrt: function cbrt(x) {
    return sign(x = +x) * pow(abs(x), 1 / 3);
  },
  // 20.2.2.11 Math.clz32(x)
  clz32: function clz32(x) {
    return (x >>>= 0) ? 31 - floor(log(x + 0.5) * Math.LOG2E) : 32;
  },
  // 20.2.2.12 Math.cosh(x)
  cosh: function cosh(x) {
    return (exp(x = +x) + exp(-x)) / 2;
  },
  // 20.2.2.14 Math.expm1(x)
  expm1: expm1,
  // 20.2.2.16 Math.fround(x)
  fround: function fround(x) {
    var $abs = abs(x),
        $sign = sign(x),
        a,
        result;
    if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
    a = (1 + EPSILON32 / EPSILON) * $abs;
    result = a - (a - $abs);
    if (result > MAX32 || result != result) return $sign * Infinity;
    return $sign * result;
  },
  // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
  hypot: function hypot(value1, value2) {
    // eslint-disable-line no-unused-vars
    var sum = 0,
        len1 = arguments.length,
        len2 = len1,
        args = Array(len1),
        larg = 0,
        arg;
    while (len1--) {
      arg = args[len1] = abs(arguments[len1]);
      if (arg == Infinity) return Infinity;
      if (arg > larg) larg = arg;
    }
    larg = larg || 1;
    while (len2--) sum += pow(args[len2] / larg, 2);
    return larg * sqrt(sum);
  },
  // 20.2.2.18 Math.imul(x, y)
  imul: function imul(x, y) {
    var UInt16 = 65535,
        xn = +x,
        yn = +y,
        xl = UInt16 & xn,
        yl = UInt16 & yn;
    return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
  },
  // 20.2.2.20 Math.log1p(x)
  log1p: function log1p(x) {
    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
  },
  // 20.2.2.21 Math.log10(x)
  log10: function log10(x) {
    return log(x) / Math.LN10;
  },
  // 20.2.2.22 Math.log2(x)
  log2: function log2(x) {
    return log(x) / Math.LN2;
  },
  // 20.2.2.28 Math.sign(x)
  sign: sign,
  // 20.2.2.30 Math.sinh(x)
  sinh: function sinh(x) {
    return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
  },
  // 20.2.2.33 Math.tanh(x)
  tanh: function tanh(x) {
    var a = expm1(x = +x),
        b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  },
  // 20.2.2.34 Math.trunc(x)
  trunc: function trunc(it) {
    return (it > 0 ? floor : ceil)(it);
  }
});

},{"./$.def":12}],50:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    isObject = $.isObject,
    isFunction = $.isFunction,
    NUMBER = 'Number',
    $Number = $.g[NUMBER],
    Base = $Number,
    proto = $Number.prototype;
function toPrimitive(it) {
  var fn, val;
  if (isFunction(fn = it.valueOf) && !isObject(val = fn.call(it))) return val;
  if (isFunction(fn = it.toString) && !isObject(val = fn.call(it))) return val;
  throw TypeError('Can\'t convert object to number');
}
function toNumber(it) {
  if (isObject(it)) it = toPrimitive(it);
  if (typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48) {
    var binary = false;
    switch (it.charCodeAt(1)) {
      case 66:case 98:
        binary = true;
      case 79:case 111:
        return parseInt(it.slice(2), binary ? 2 : 8);
    }
  }return +it;
}
if ($.FW && !($Number('0o1') && $Number('0b1'))) {
  $Number = function Number(it) {
    return this instanceof $Number ? new Base(toNumber(it)) : toNumber(it);
  };
  $.each.call($.DESC ? $.getNames(Base) : (
  // ES3:
  'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
  // ES6 (in case, if modules with ES6 Number statics required before):
  'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' + 'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger').split(','), function (key) {
    if ($.has(Base, key) && !$.has($Number, key)) {
      $.setDesc($Number, key, $.getDesc(Base, key));
    }
  });
  $Number.prototype = proto;
  proto.constructor = $Number;
  $.hide($.g, NUMBER, $Number);
}

},{"./$":22}],51:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    $def = require('./$.def'),
    abs = Math.abs,
    floor = Math.floor,
    _isFinite = $.g.isFinite,
    MAX_SAFE_INTEGER = 9007199254740991; // pow(2, 53) - 1 == 9007199254740991;
function isInteger(it) {
  return !$.isObject(it) && _isFinite(it) && floor(it) === it;
}
$def($def.S, 'Number', {
  // 20.1.2.1 Number.EPSILON
  EPSILON: Math.pow(2, -52),
  // 20.1.2.2 Number.isFinite(number)
  isFinite: function isFinite(it) {
    return typeof it == 'number' && _isFinite(it);
  },
  // 20.1.2.3 Number.isInteger(number)
  isInteger: isInteger,
  // 20.1.2.4 Number.isNaN(number)
  isNaN: function isNaN(number) {
    return number != number;
  },
  // 20.1.2.5 Number.isSafeInteger(number)
  isSafeInteger: function isSafeInteger(number) {
    return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
  },
  // 20.1.2.6 Number.MAX_SAFE_INTEGER
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
  // 20.1.2.10 Number.MIN_SAFE_INTEGER
  MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
  // 20.1.2.12 Number.parseFloat(string)
  parseFloat: parseFloat,
  // 20.1.2.13 Number.parseInt(string, radix)
  parseInt: parseInt
});

},{"./$":22,"./$.def":12}],52:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
'use strict';

var $def = require('./$.def');
$def($def.S, 'Object', { assign: require('./$.assign') });

},{"./$.assign":5,"./$.def":12}],53:[function(require,module,exports){
// 19.1.3.10 Object.is(value1, value2)
'use strict';

var $def = require('./$.def');
$def($def.S, 'Object', {
  is: function is(x, y) {
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  }
});

},{"./$.def":12}],54:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
'use strict';

var $def = require('./$.def');
$def($def.S, 'Object', { setPrototypeOf: require('./$.set-proto').set });

},{"./$.def":12,"./$.set-proto":27}],55:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    $def = require('./$.def'),
    isObject = $.isObject,
    toObject = $.toObject;
function wrapObjectMethod(METHOD, MODE) {
  var fn = ($.core.Object || {})[METHOD] || Object[METHOD],
      f = 0,
      o = {};
  o[METHOD] = MODE == 1 ? function (it) {
    return isObject(it) ? fn(it) : it;
  } : MODE == 2 ? function (it) {
    return isObject(it) ? fn(it) : true;
  } : MODE == 3 ? function (it) {
    return isObject(it) ? fn(it) : false;
  } : MODE == 4 ? function getOwnPropertyDescriptor(it, key) {
    return fn(toObject(it), key);
  } : MODE == 5 ? function getPrototypeOf(it) {
    return fn(Object($.assertDefined(it)));
  } : function (it) {
    return fn(toObject(it));
  };
  try {
    fn('z');
  } catch (e) {
    f = 1;
  }
  $def($def.S + $def.F * f, 'Object', o);
}
wrapObjectMethod('freeze', 1);
wrapObjectMethod('seal', 1);
wrapObjectMethod('preventExtensions', 1);
wrapObjectMethod('isFrozen', 2);
wrapObjectMethod('isSealed', 2);
wrapObjectMethod('isExtensible', 3);
wrapObjectMethod('getOwnPropertyDescriptor', 4);
wrapObjectMethod('getPrototypeOf', 5);
wrapObjectMethod('keys');
wrapObjectMethod('getOwnPropertyNames');

},{"./$":22,"./$.def":12}],56:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var $ = require('./$'),
    cof = require('./$.cof'),
    src = String(({}).toString),
    tmp = {};
function toString() {
  return '[object ' + cof.classof(this) + ']';
}
// lodash uses String(Object.prototype.toString) in isNative
toString.toString = function () {
  return src;
};
tmp[require('./$.wks')('toStringTag')] = 'z';
if ($.FW && cof(tmp) != 'z') $.hide(Object.prototype, 'toString', toString);

},{"./$":22,"./$.cof":6,"./$.wks":36}],57:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    ctx = require('./$.ctx'),
    cof = require('./$.cof'),
    $def = require('./$.def'),
    assert = require('./$.assert'),
    forOf = require('./$.for-of'),
    setProto = require('./$.set-proto').set,
    species = require('./$.species'),
    SPECIES = require('./$.wks')('species'),
    RECORD = require('./$.uid').safe('record'),
    PROMISE = 'Promise',
    global = $.g,
    process = global.process,
    asap = process && process.nextTick || require('./$.task').set,
    P = global[PROMISE],
    isFunction = $.isFunction,
    isObject = $.isObject,
    assertFunction = assert.fn,
    assertObject = assert.obj;

var useNative = (function () {
  var test,
      works = false;
  function P2(x) {
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = isFunction(P) && isFunction(P.resolve) && P.resolve(test = new P(function () {})) == test;
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, { constructor: { value: P2 } });
    // actual Firefox has broken subclass support, test that
    if (!(P2.resolve(5).then(function () {}) instanceof P2)) {
      works = false;
    }
  } catch (e) {
    works = false;
  }
  return works;
})();

// helpers
function getConstructor(C) {
  var S = assertObject(C)[SPECIES];
  return S != undefined ? S : C;
}
function isThenable(it) {
  var then;
  if (isObject(it)) then = it.then;
  return isFunction(then) ? then : false;
}
function notify(record) {
  var chain = record.c;
  if (chain.length) asap(function () {
    var value = record.v,
        ok = record.s == 1,
        i = 0;
    function run(react) {
      var cb = ok ? react.ok : react.fail,
          ret,
          then;
      try {
        if (cb) {
          if (!ok) record.h = true;
          ret = cb === true ? value : cb(value);
          if (ret === react.P) {
            react.rej(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(ret)) {
            then.call(ret, react.res, react.rej);
          } else react.res(ret);
        } else react.rej(value);
      } catch (err) {
        react.rej(err);
      }
    }
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    chain.length = 0;
  });
}
function isUnhandled(promise) {
  var record = promise[RECORD],
      chain = record.a || record.c,
      i = 0,
      react;
  if (record.h) return false;
  while (chain.length > i) {
    react = chain[i++];
    if (react.fail || !isUnhandled(react.P)) return false;
  }return true;
}
function $reject(value) {
  var record = this,
      promise;
  if (record.d) return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  record.a = record.c.slice();
  setTimeout(function () {
    asap(function () {
      if (isUnhandled(promise = record.p)) {
        if (cof(process) == 'process') {
          process.emit('unhandledRejection', value, promise);
        } else if (global.console && isFunction(console.error)) {
          console.error('Unhandled promise rejection', value);
        }
      }
      record.a = undefined;
    });
  }, 1);
  notify(record);
}
function $resolve(value) {
  var record = this,
      then,
      wrapper;
  if (record.d) return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if (then = isThenable(value)) {
      wrapper = { r: record, d: false }; // wrap
      then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
    } else {
      record.v = value;
      record.s = 1;
      notify(record);
    }
  } catch (err) {
    $reject.call(wrapper || { r: record, d: false }, err); // wrap
  }
}

// constructor polyfill
if (!useNative) {
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor) {
    assertFunction(executor);
    var record = {
      p: assert.inst(this, P, PROMISE), // <- promise
      c: [], // <- awaiting reactions
      a: undefined, // <- checked in isUnhandled reactions
      s: 0, // <- state
      d: false, // <- done
      v: undefined, // <- value
      h: false // <- handled rejection
    };
    $.hide(this, RECORD, record);
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch (err) {
      $reject.call(record, err);
    }
  };
  $.mix(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var S = assertObject(assertObject(this).constructor)[SPECIES];
      var react = {
        ok: isFunction(onFulfilled) ? onFulfilled : true,
        fail: isFunction(onRejected) ? onRejected : false
      };
      var promise = react.P = new (S != undefined ? S : P)(function (res, rej) {
        react.res = assertFunction(res);
        react.rej = assertFunction(rej);
      });
      var record = this[RECORD];
      record.c.push(react);
      if (record.a) record.a.push(react);
      record.s && notify(record);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function _catch(onRejected) {
      return this.then(undefined, onRejected);
    }
  });
}

// export
$def($def.G + $def.W + $def.F * !useNative, { Promise: P });
cof.set(P, PROMISE);
species(P);
species($.core[PROMISE]); // for wrapper

// statics
$def($def.S + $def.F * !useNative, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    return new (getConstructor(this))(function (res, rej) {
      rej(r);
    });
  },
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return isObject(x) && RECORD in x && $.getProto(x) === this.prototype ? x : new (getConstructor(this))(function (res) {
      res(x);
    });
  }
});
$def($def.S + $def.F * !(useNative && require('./$.iter-detect')(function (iter) {
  P.all(iter)['catch'](function () {});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = getConstructor(this),
        values = [];
    return new C(function (res, rej) {
      forOf(iterable, false, values.push, values);
      var remaining = values.length,
          results = Array(remaining);
      if (remaining) $.each.call(values, function (promise, index) {
        C.resolve(promise).then(function (value) {
          results[index] = value;
          --remaining || res(results);
        }, rej);
      });else res(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = getConstructor(this);
    return new C(function (res, rej) {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(res, rej);
      });
    });
  }
});

},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.ctx":11,"./$.def":12,"./$.for-of":15,"./$.iter-detect":20,"./$.set-proto":27,"./$.species":28,"./$.task":32,"./$.uid":34,"./$.wks":36}],58:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    $def = require('./$.def'),
    setProto = require('./$.set-proto'),
    $iter = require('./$.iter'),
    ITERATOR = require('./$.wks')('iterator'),
    ITER = require('./$.uid').safe('iter'),
    step = $iter.step,
    assert = require('./$.assert'),
    isObject = $.isObject,
    getProto = $.getProto,
    $Reflect = $.g.Reflect,
    _apply = Function.apply,
    assertObject = assert.obj,
    _isExtensible = Object.isExtensible || $.isObject,
    _preventExtensions = Object.preventExtensions || $.it
// IE TP has broken Reflect.enumerate
,
    buggyEnumerate = !($Reflect && $Reflect.enumerate && ITERATOR in $Reflect.enumerate({}));

function Enumerate(iterated) {
  $.set(this, ITER, { o: iterated, k: undefined, i: 0 });
}
$iter.create(Enumerate, 'Object', function () {
  var iter = this[ITER],
      keys = iter.k,
      key;
  if (keys == undefined) {
    iter.k = keys = [];
    for (key in iter.o) keys.push(key);
  }
  do {
    if (iter.i >= keys.length) return step(1);
  } while (!((key = keys[iter.i++]) in iter.o));
  return step(0, key);
});

var reflect = {
  // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
  apply: function apply(target, thisArgument, argumentsList) {
    return _apply.call(target, thisArgument, argumentsList);
  },
  // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
  construct: function construct(target, argumentsList /*, newTarget*/) {
    var proto = assert.fn(arguments.length < 3 ? target : arguments[2]).prototype,
        instance = $.create(isObject(proto) ? proto : Object.prototype),
        result = _apply.call(target, instance, argumentsList);
    return isObject(result) ? result : instance;
  },
  // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
  defineProperty: function defineProperty(target, propertyKey, attributes) {
    assertObject(target);
    try {
      $.setDesc(target, propertyKey, attributes);
      return true;
    } catch (e) {
      return false;
    }
  },
  // 26.1.4 Reflect.deleteProperty(target, propertyKey)
  deleteProperty: function deleteProperty(target, propertyKey) {
    var desc = $.getDesc(assertObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  },
  // 26.1.6 Reflect.get(target, propertyKey [, receiver])
  get: function get(_x, _x2) {
    var _arguments = arguments;
    var _again = true;

    _function: while (_again) {
      receiver = desc = proto = undefined;
      _again = false;
      var target = _x,
          propertyKey /*, receiver*/ = _x2;

      var receiver = _arguments.length < 3 ? target : _arguments[2],
          desc = $.getDesc(assertObject(target), propertyKey),
          proto;
      if (desc) return $.has(desc, 'value') ? desc.value : desc.get === undefined ? undefined : desc.get.call(receiver);
      if (isObject(proto = getProto(target))) {
        _arguments = [_x = proto, _x2 = propertyKey, receiver];
        _again = true;
        continue _function;
      } else {
        return undefined;
      }
    }
  },
  // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
    return $.getDesc(assertObject(target), propertyKey);
  },
  // 26.1.8 Reflect.getPrototypeOf(target)
  getPrototypeOf: function getPrototypeOf(target) {
    return getProto(assertObject(target));
  },
  // 26.1.9 Reflect.has(target, propertyKey)
  has: function has(target, propertyKey) {
    return propertyKey in target;
  },
  // 26.1.10 Reflect.isExtensible(target)
  isExtensible: function isExtensible(target) {
    return _isExtensible(assertObject(target));
  },
  // 26.1.11 Reflect.ownKeys(target)
  ownKeys: require('./$.own-keys'),
  // 26.1.12 Reflect.preventExtensions(target)
  preventExtensions: function preventExtensions(target) {
    assertObject(target);
    try {
      _preventExtensions(target);
      return true;
    } catch (e) {
      return false;
    }
  },
  // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
  set: function set(_x3, _x4, _x5) {
    var _arguments2 = arguments;
    var _again2 = true;

    _function2: while (_again2) {
      receiver = ownDesc = existingDescriptor = proto = undefined;
      _again2 = false;
      var target = _x3,
          propertyKey = _x4,
          V /*, receiver*/ = _x5;

      var receiver = _arguments2.length < 4 ? target : _arguments2[3],
          ownDesc = $.getDesc(assertObject(target), propertyKey),
          existingDescriptor,
          proto;
      if (!ownDesc) {
        if (isObject(proto = getProto(target))) {
          _arguments2 = [_x3 = proto, _x4 = propertyKey, _x5 = V, receiver];
          _again2 = true;
          continue _function2;
        }
        ownDesc = $.desc(0);
      }
      if ($.has(ownDesc, 'value')) {
        if (ownDesc.writable === false || !isObject(receiver)) return false;
        existingDescriptor = $.getDesc(receiver, propertyKey) || $.desc(0);
        existingDescriptor.value = V;
        $.setDesc(receiver, propertyKey, existingDescriptor);
        return true;
      }
      return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
    }
  }
};
// 26.1.14 Reflect.setPrototypeOf(target, proto)
if (setProto) reflect.setPrototypeOf = function setPrototypeOf(target, proto) {
  setProto.check(target, proto);
  try {
    setProto.set(target, proto);
    return true;
  } catch (e) {
    return false;
  }
};

$def($def.G, { Reflect: {} });

$def($def.S + $def.F * buggyEnumerate, 'Reflect', {
  // 26.1.5 Reflect.enumerate(target)
  enumerate: function enumerate(target) {
    return new Enumerate(assertObject(target));
  }
});

$def($def.S, 'Reflect', reflect);

},{"./$":22,"./$.assert":4,"./$.def":12,"./$.iter":21,"./$.own-keys":24,"./$.set-proto":27,"./$.uid":34,"./$.wks":36}],59:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    cof = require('./$.cof'),
    $RegExp = $.g.RegExp,
    Base = $RegExp,
    proto = $RegExp.prototype,
    re = /a/g
// "new" creates a new object
,
    CORRECT_NEW = new $RegExp(re) !== re
// RegExp allows a regex with flags as the pattern
,
    ALLOWS_RE_WITH_FLAGS = (function () {
  try {
    return $RegExp(re, 'i') == '/a/i';
  } catch (e) {}
})();
if ($.FW && $.DESC) {
  if (!CORRECT_NEW || !ALLOWS_RE_WITH_FLAGS) {
    $RegExp = function RegExp(pattern, flags) {
      var patternIsRegExp = cof(pattern) == 'RegExp',
          flagsIsUndefined = flags === undefined;
      if (!(this instanceof $RegExp) && patternIsRegExp && flagsIsUndefined) return pattern;
      return CORRECT_NEW ? new Base(patternIsRegExp && !flagsIsUndefined ? pattern.source : pattern, flags) : new Base(patternIsRegExp ? pattern.source : pattern, patternIsRegExp && flagsIsUndefined ? pattern.flags : flags);
    };
    $.each.call($.getNames(Base), function (key) {
      key in $RegExp || $.setDesc($RegExp, key, {
        configurable: true,
        get: function get() {
          return Base[key];
        },
        set: function set(it) {
          Base[key] = it;
        }
      });
    });
    proto.constructor = $RegExp;
    $RegExp.prototype = proto;
    $.hide($.g, 'RegExp', $RegExp);
  }
  // 21.2.5.3 get RegExp.prototype.flags()
  if (/./g.flags != 'g') $.setDesc(proto, 'flags', {
    configurable: true,
    get: require('./$.replacer')(/^.*\/(\w*)$/, '$1')
  });
}
require('./$.species')($RegExp);
/* empty */

},{"./$":22,"./$.cof":6,"./$.replacer":26,"./$.species":28}],60:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.2 Set Objects
require('./$.collection')('Set', {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);

},{"./$.collection":10,"./$.collection-strong":7}],61:[function(require,module,exports){
'use strict';
var $def = require('./$.def'),
    $at = require('./$.string-at')(false);
$def($def.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos) {
    return $at(this, pos);
  }
});

},{"./$.def":12,"./$.string-at":29}],62:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    cof = require('./$.cof'),
    $def = require('./$.def'),
    toLength = $.toLength;

// should throw error on regex
$def($def.P + $def.F * !require('./$.throws')(function () {
  'q'.endsWith(/./);
}), 'String', {
  // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
  endsWith: function endsWith(searchString /*, endPosition = @length */) {
    if (cof(searchString) == 'RegExp') throw TypeError();
    var that = String($.assertDefined(this)),
        endPosition = arguments[1],
        len = toLength(that.length),
        end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    searchString += '';
    return that.slice(end - searchString.length, end) === searchString;
  }
});

},{"./$":22,"./$.cof":6,"./$.def":12,"./$.throws":33}],63:[function(require,module,exports){
'use strict';

var $def = require('./$.def'),
    toIndex = require('./$').toIndex,
    fromCharCode = String.fromCharCode,
    $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
$def($def.S + $def.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x) {
    // eslint-disable-line no-unused-vars
    var res = [],
        len = arguments.length,
        i = 0,
        code;
    while (len > i) {
      code = +arguments[i++];
      if (toIndex(code, 1114111) !== code) throw RangeError(code + ' is not a valid code point');
      res.push(code < 65536 ? fromCharCode(code) : fromCharCode(((code -= 65536) >> 10) + 55296, code % 1024 + 56320));
    }return res.join('');
  }
});

},{"./$":22,"./$.def":12}],64:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    cof = require('./$.cof'),
    $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.7 String.prototype.includes(searchString, position = 0)
  includes: function includes(searchString /*, position = 0 */) {
    if (cof(searchString) == 'RegExp') throw TypeError();
    return !! ~String($.assertDefined(this)).indexOf(searchString, arguments[1]);
  }
});

},{"./$":22,"./$.cof":6,"./$.def":12}],65:[function(require,module,exports){
'use strict';

var set = require('./$').set,
    $at = require('./$.string-at')(true),
    ITER = require('./$.uid').safe('iter'),
    $iter = require('./$.iter'),
    step = $iter.step;

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function (iterated) {
  set(this, ITER, { o: String(iterated), i: 0 });
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var iter = this[ITER],
      O = iter.o,
      index = iter.i,
      point;
  if (index >= O.length) return step(1);
  point = $at(O, index);
  iter.i += point.length;
  return step(0, point);
});

},{"./$":22,"./$.iter":21,"./$.iter-define":19,"./$.string-at":29,"./$.uid":34}],66:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    $def = require('./$.def');

$def($def.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite) {
    var tpl = $.toObject(callSite.raw),
        len = $.toLength(tpl.length),
        sln = arguments.length,
        res = [],
        i = 0;
    while (len > i) {
      res.push(String(tpl[i++]));
      if (i < sln) res.push(String(arguments[i]));
    }return res.join('');
  }
});

},{"./$":22,"./$.def":12}],67:[function(require,module,exports){
'use strict';

var $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: require('./$.string-repeat')
});

},{"./$.def":12,"./$.string-repeat":31}],68:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    cof = require('./$.cof'),
    $def = require('./$.def');

// should throw error on regex
$def($def.P + $def.F * !require('./$.throws')(function () {
  'q'.startsWith(/./);
}), 'String', {
  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
  startsWith: function startsWith(searchString /*, position = 0 */) {
    if (cof(searchString) == 'RegExp') throw TypeError();
    var that = String($.assertDefined(this)),
        index = $.toLength(Math.min(arguments[1], that.length));
    searchString += '';
    return that.slice(index, index + searchString.length) === searchString;
  }
});

},{"./$":22,"./$.cof":6,"./$.def":12,"./$.throws":33}],69:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var $ = require('./$'),
    setTag = require('./$.cof').set,
    uid = require('./$.uid'),
    $def = require('./$.def'),
    keyOf = require('./$.keyof'),
    enumKeys = require('./$.enum-keys'),
    assertObject = require('./$.assert').obj,
    has = $.has,
    $create = $.create,
    getDesc = $.getDesc,
    setDesc = $.setDesc,
    desc = $.desc,
    getNames = $.getNames,
    toObject = $.toObject,
    $Symbol = $.g.Symbol,
    setter = false,
    TAG = uid('tag'),
    HIDDEN = uid('hidden'),
    SymbolRegistry = {},
    AllSymbols = {},
    useNative = $.isFunction($Symbol);

function wrap(tag) {
  var sym = AllSymbols[tag] = $.set($create($Symbol.prototype), TAG, tag);
  $.DESC && setter && setDesc(Object.prototype, tag, {
    configurable: true,
    set: function set(value) {
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setDesc(this, tag, desc(1, value));
    }
  });
  return sym;
}

function defineProperty(it, key, D) {
  if (D && has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) setDesc(it, HIDDEN, desc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D.enumerable = false;
    }
  }return setDesc(it, key, D);
}
function defineProperties(it, P) {
  assertObject(it);
  var keys = enumKeys(P = toObject(P)),
      i = 0,
      l = keys.length,
      key;
  while (l > i) defineProperty(it, key = keys[i++], P[key]);
  return it;
}
function create(it, P) {
  return P === undefined ? $create(it) : defineProperties($create(it), P);
}
function getOwnPropertyDescriptor(it, key) {
  var D = getDesc(it = toObject(it), key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
}
function getOwnPropertyNames(it) {
  var names = getNames(toObject(it)),
      result = [],
      i = 0,
      key;
  while (names.length > i) if (!has(AllSymbols, key = names[i++]) && key != HIDDEN) result.push(key);
  return result;
}
function getOwnPropertySymbols(it) {
  var names = getNames(toObject(it)),
      result = [],
      i = 0,
      key;
  while (names.length > i) if (has(AllSymbols, key = names[i++])) result.push(AllSymbols[key]);
  return result;
}

// 19.4.1.1 Symbol([description])
if (!useNative) {
  $Symbol = function Symbol(description) {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
    return wrap(uid(description));
  };
  $.hide($Symbol.prototype, 'toString', function () {
    return this[TAG];
  });

  $.create = create;
  $.setDesc = defineProperty;
  $.getDesc = getOwnPropertyDescriptor;
  $.setDescs = defineProperties;
  $.getNames = getOwnPropertyNames;
  $.getSymbols = getOwnPropertySymbols;
}

var symbolStatics = {
  // 19.4.2.1 Symbol.for(key)
  'for': function _for(key) {
    return has(SymbolRegistry, key += '') ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key) {
    return keyOf(SymbolRegistry, key);
  },
  useSetter: function useSetter() {
    setter = true;
  },
  useSimple: function useSimple() {
    setter = false;
  }
};
// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
$.each.call(('hasInstance,isConcatSpreadable,iterator,match,replace,search,' + 'species,split,toPrimitive,toStringTag,unscopables').split(','), function (it) {
  var sym = require('./$.wks')(it);
  symbolStatics[it] = useNative ? sym : wrap(sym);
});

setter = true;

$def($def.G + $def.W, { Symbol: $Symbol });

$def($def.S, 'Symbol', symbolStatics);

$def($def.S + $def.F * !useNative, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: getOwnPropertySymbols
});

// 19.4.3.5 Symbol.prototype[@@toStringTag]
setTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setTag($.g.JSON, 'JSON', true);

},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.def":12,"./$.enum-keys":14,"./$.keyof":23,"./$.uid":34,"./$.wks":36}],70:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    weak = require('./$.collection-weak'),
    leakStore = weak.leakStore,
    ID = weak.ID,
    WEAK = weak.WEAK,
    has = $.has,
    isObject = $.isObject,
    isFrozen = Object.isFrozen || $.core.Object.isFrozen,
    tmp = {};

// 23.3 WeakMap Objects
var WeakMap = require('./$.collection')('WeakMap', {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key) {
    if (isObject(key)) {
      if (isFrozen(key)) return leakStore(this).get(key);
      if (has(key, WEAK)) return key[WEAK][this[ID]];
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value) {
    return weak.def(this, key, value);
  }
}, weak, true, true);

// IE11 WeakMap frozen keys fix
if ($.FW && new WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7) {
  $.each.call(['delete', 'has', 'get', 'set'], function (key) {
    var method = WeakMap.prototype[key];
    WeakMap.prototype[key] = function (a, b) {
      // store frozen objects on leaky map
      if (isObject(a) && isFrozen(a)) {
        var result = leakStore(this)[key](a, b);
        return key == 'set' ? this : result;
        // store all the rest on native weakmap
      }return method.call(this, a, b);
    };
  });
}

},{"./$":22,"./$.collection":10,"./$.collection-weak":9}],71:[function(require,module,exports){
'use strict';
var weak = require('./$.collection-weak');

// 23.4 WeakSet Objects
require('./$.collection')('WeakSet', {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value) {
    return weak.def(this, value, true);
  }
}, weak, false, true);

},{"./$.collection":10,"./$.collection-weak":9}],72:[function(require,module,exports){
// https://github.com/domenic/Array.prototype.includes
'use strict';

var $def = require('./$.def'),
    $includes = require('./$.array-includes')(true);
$def($def.P, 'Array', {
  includes: function includes(el /*, fromIndex = 0 */) {
    return $includes(this, el, arguments[1]);
  }
});
require('./$.unscope')('includes');

},{"./$.array-includes":2,"./$.def":12,"./$.unscope":35}],73:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
'use strict';

require('./$.collection-to-json')('Map');

},{"./$.collection-to-json":8}],74:[function(require,module,exports){
// https://gist.github.com/WebReflection/9353781
'use strict';

var $ = require('./$'),
    $def = require('./$.def'),
    ownKeys = require('./$.own-keys');

$def($def.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = $.toObject(object),
        result = {};
    $.each.call(ownKeys(O), function (key) {
      $.setDesc(result, key, $.desc(0, $.getDesc(O, key)));
    });
    return result;
  }
});

},{"./$":22,"./$.def":12,"./$.own-keys":24}],75:[function(require,module,exports){
// http://goo.gl/XkBrjD
'use strict';

var $ = require('./$'),
    $def = require('./$.def');
function createObjectToArray(isEntries) {
  return function (object) {
    var O = $.toObject(object),
        keys = $.getKeys(O),
        length = keys.length,
        i = 0,
        result = Array(length),
        key;
    if (isEntries) while (length > i) result[i] = [key = keys[i++], O[key]];else while (length > i) result[i] = O[keys[i++]];
    return result;
  };
}
$def($def.S, 'Object', {
  values: createObjectToArray(false),
  entries: createObjectToArray(true)
});

},{"./$":22,"./$.def":12}],76:[function(require,module,exports){
// https://gist.github.com/kangax/9698100
'use strict';

var $def = require('./$.def');
$def($def.S, 'RegExp', {
  escape: require('./$.replacer')(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
});

},{"./$.def":12,"./$.replacer":26}],77:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
'use strict';

require('./$.collection-to-json')('Set');

},{"./$.collection-to-json":8}],78:[function(require,module,exports){
// https://github.com/mathiasbynens/String.prototype.at
'use strict';
var $def = require('./$.def'),
    $at = require('./$.string-at')(true);
$def($def.P, 'String', {
  at: function at(pos) {
    return $at(this, pos);
  }
});

},{"./$.def":12,"./$.string-at":29}],79:[function(require,module,exports){
'use strict';
var $def = require('./$.def'),
    $pad = require('./$.string-pad');
$def($def.P, 'String', {
  lpad: function lpad(n) {
    return $pad(this, n, arguments[1], true);
  }
});

},{"./$.def":12,"./$.string-pad":30}],80:[function(require,module,exports){
'use strict';
var $def = require('./$.def'),
    $pad = require('./$.string-pad');
$def($def.P, 'String', {
  rpad: function rpad(n) {
    return $pad(this, n, arguments[1], false);
  }
});

},{"./$.def":12,"./$.string-pad":30}],81:[function(require,module,exports){
// JavaScript 1.6 / Strawman array statics shim
'use strict';

var $ = require('./$'),
    $def = require('./$.def'),
    $Array = $.core.Array || Array,
    statics = {};
function setStatics(keys, length) {
  $.each.call(keys.split(','), function (key) {
    if (length == undefined && key in $Array) statics[key] = $Array[key];else if (key in []) statics[key] = require('./$.ctx')(Function.call, [][key], length);
  });
}
setStatics('pop,reverse,shift,keys,values,entries', 1);
setStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
setStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' + 'reduce,reduceRight,copyWithin,fill,turn');
$def($def.S, 'Array', statics);

},{"./$":22,"./$.ctx":11,"./$.def":12}],82:[function(require,module,exports){
'use strict';

require('./es6.array.iterator');
var $ = require('./$'),
    Iterators = require('./$.iter').Iterators,
    ITERATOR = require('./$.wks')('iterator'),
    ArrayValues = Iterators.Array,
    NodeList = $.g.NodeList;
if ($.FW && NodeList && !(ITERATOR in NodeList.prototype)) {
  $.hide(NodeList.prototype, ITERATOR, ArrayValues);
}
Iterators.NodeList = ArrayValues;

},{"./$":22,"./$.iter":21,"./$.wks":36,"./es6.array.iterator":43}],83:[function(require,module,exports){
'use strict';

var $def = require('./$.def'),
    $task = require('./$.task');
$def($def.G + $def.B, {
  setImmediate: $task.set,
  clearImmediate: $task.clear
});

},{"./$.def":12,"./$.task":32}],84:[function(require,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
'use strict';

var $ = require('./$'),
    $def = require('./$.def'),
    invoke = require('./$.invoke'),
    partial = require('./$.partial'),
    navigator = $.g.navigator,
    MSIE = !!navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
function wrap(set) {
  return MSIE ? function (fn, time /*, ...args */) {
    return set(invoke(partial, [].slice.call(arguments, 2), $.isFunction(fn) ? fn : Function(fn)), time);
  } : set;
}
$def($def.G + $def.B + $def.F * MSIE, {
  setTimeout: wrap($.g.setTimeout),
  setInterval: wrap($.g.setInterval)
});

},{"./$":22,"./$.def":12,"./$.invoke":17,"./$.partial":25}],85:[function(require,module,exports){
'use strict';

require('./modules/es5');
require('./modules/es6.symbol');
require('./modules/es6.object.assign');
require('./modules/es6.object.is');
require('./modules/es6.object.set-prototype-of');
require('./modules/es6.object.to-string');
require('./modules/es6.object.statics-accept-primitives');
require('./modules/es6.function.name');
require('./modules/es6.function.has-instance');
require('./modules/es6.number.constructor');
require('./modules/es6.number.statics');
require('./modules/es6.math');
require('./modules/es6.string.from-code-point');
require('./modules/es6.string.raw');
require('./modules/es6.string.iterator');
require('./modules/es6.string.code-point-at');
require('./modules/es6.string.ends-with');
require('./modules/es6.string.includes');
require('./modules/es6.string.repeat');
require('./modules/es6.string.starts-with');
require('./modules/es6.array.from');
require('./modules/es6.array.of');
require('./modules/es6.array.iterator');
require('./modules/es6.array.species');
require('./modules/es6.array.copy-within');
require('./modules/es6.array.fill');
require('./modules/es6.array.find');
require('./modules/es6.array.find-index');
require('./modules/es6.regexp');
require('./modules/es6.promise');
require('./modules/es6.map');
require('./modules/es6.set');
require('./modules/es6.weak-map');
require('./modules/es6.weak-set');
require('./modules/es6.reflect');
require('./modules/es7.array.includes');
require('./modules/es7.string.at');
require('./modules/es7.string.lpad');
require('./modules/es7.string.rpad');
require('./modules/es7.regexp.escape');
require('./modules/es7.object.get-own-property-descriptors');
require('./modules/es7.object.to-array');
require('./modules/es7.map.to-json');
require('./modules/es7.set.to-json');
require('./modules/js.array.statics');
require('./modules/web.timers');
require('./modules/web.immediate');
require('./modules/web.dom.iterable');
module.exports = require('./modules/$').core;

},{"./modules/$":22,"./modules/es5":37,"./modules/es6.array.copy-within":38,"./modules/es6.array.fill":39,"./modules/es6.array.find":41,"./modules/es6.array.find-index":40,"./modules/es6.array.from":42,"./modules/es6.array.iterator":43,"./modules/es6.array.of":44,"./modules/es6.array.species":45,"./modules/es6.function.has-instance":46,"./modules/es6.function.name":47,"./modules/es6.map":48,"./modules/es6.math":49,"./modules/es6.number.constructor":50,"./modules/es6.number.statics":51,"./modules/es6.object.assign":52,"./modules/es6.object.is":53,"./modules/es6.object.set-prototype-of":54,"./modules/es6.object.statics-accept-primitives":55,"./modules/es6.object.to-string":56,"./modules/es6.promise":57,"./modules/es6.reflect":58,"./modules/es6.regexp":59,"./modules/es6.set":60,"./modules/es6.string.code-point-at":61,"./modules/es6.string.ends-with":62,"./modules/es6.string.from-code-point":63,"./modules/es6.string.includes":64,"./modules/es6.string.iterator":65,"./modules/es6.string.raw":66,"./modules/es6.string.repeat":67,"./modules/es6.string.starts-with":68,"./modules/es6.symbol":69,"./modules/es6.weak-map":70,"./modules/es6.weak-set":71,"./modules/es7.array.includes":72,"./modules/es7.map.to-json":73,"./modules/es7.object.get-own-property-descriptors":74,"./modules/es7.object.to-array":75,"./modules/es7.regexp.escape":76,"./modules/es7.set.to-json":77,"./modules/es7.string.at":78,"./modules/es7.string.lpad":79,"./modules/es7.string.rpad":80,"./modules/js.array.statics":81,"./modules/web.dom.iterable":82,"./modules/web.immediate":83,"./modules/web.timers":84}],86:[function(require,module,exports){
(function (global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

"use strict";

!(function (global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol = typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = Object.create((outerFn || Generator).prototype);

    generator._invoke = makeInvokeMethod(innerFn, self || null, new Context(tryLocsList || []));

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  runtime.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction ||
    // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  runtime.mark = function (genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  runtime.async = function (innerFn, outerFn, self, tryLocsList) {
    return new Promise(function (resolve, reject) {
      var generator = wrap(innerFn, outerFn, self, tryLocsList);
      var callNext = step.bind(generator, "next");
      var callThrow = step.bind(generator, "throw");

      function step(method, arg) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
          return;
        }

        var info = record.arg;
        if (info.done) {
          resolve(info.value);
        } else {
          Promise.resolve(info.value).then(callNext, callThrow);
        }
      }

      callNext();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" || method === "throw" && delegate.iterator[method] === undefined) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(delegate.iterator[method], delegate.iterator, arg);

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
          }
        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }
        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }
        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  function defineGeneratorMethod(method) {
    Gp[method] = function (arg) {
      return this._invoke(method, arg);
    };
  }
  defineGeneratorMethod("next");
  defineGeneratorMethod("throw");
  defineGeneratorMethod("return");

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset();
  }

  runtime.keys = function (object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function reset() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName; hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20; ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function stop() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function dispatchException(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function complete(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          return this.complete(entry.completion, entry.afterLoc);
        }
      }
    },

    "catch": function _catch(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
// Among the various tricks for obtaining a reference to the global
// object, this seems to be the most reliable technique that does not
// use indirect eval (which violates Content Security Policy).
typeof global === "object" ? global : typeof window === "object" ? window : typeof self === "object" ? self : undefined);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],87:[function(require,module,exports){
"use strict";

module.exports = require("./lib/babel/polyfill");

},{"./lib/babel/polyfill":1}],88:[function(require,module,exports){
"use strict";

module.exports = require("babel-core/polyfill");

},{"babel-core/polyfill":87}],89:[function(require,module,exports){
"use strict";

},{}],90:[function(require,module,exports){
// shim for using process in browser

'use strict';

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () {
    return '/';
};
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function () {
    return 0;
};

},{}],91:[function(require,module,exports){
'use strict';
var Rx = require('rx');

function makeDispatchFunction(element, eventName) {
  return function dispatchCustomEvent(evData) {
    //console.log('%cdispatchCustomEvent ' + eventName,
    //  'background-color: #CCCCFF; color: black');
    var event;
    try {
      event = new Event(eventName);
    } catch (err) {
      event = document.createEvent('Event');
      event.initEvent(eventName, true, true);
    }
    event.data = evData;
    element.dispatchEvent(event);
  };
}

function subscribeDispatchers(element) {
  var customEvents = element.cycleCustomElementMetadata.customEvents;

  var disposables = new Rx.CompositeDisposable();
  for (var _name in customEvents) {
    if (customEvents.hasOwnProperty(_name)) {
      if (/\$$/.test(_name) && _name !== 'vtree$' && typeof customEvents[_name].subscribe === 'function') {
        var eventName = _name.slice(0, -1);
        var disposable = customEvents[_name].subscribe(makeDispatchFunction(element, eventName));
        disposables.add(disposable);
      }
    }
  }
  return disposables;
}

function subscribeDispatchersWhenRootChanges(metadata) {
  return metadata.rootElem$.distinctUntilChanged(Rx.helpers.identity, function (x, y) {
    return x && y && x.isEqualNode && x.isEqualNode(y);
  }).subscribe(function resubscribeDispatchers(rootElem) {
    if (metadata.eventDispatchingSubscription) {
      metadata.eventDispatchingSubscription.dispose();
    }
    metadata.eventDispatchingSubscription = subscribeDispatchers(rootElem);
  });
}

function makePropertiesProxy() {
  var propertiesProxy = {
    type: 'PropertiesProxy',
    get: function get(streamKey) {
      var comparer = arguments[1] === undefined ? Rx.helpers.defaultComparer : arguments[1];

      if (typeof this[streamKey] === 'undefined') {
        this[streamKey] = new Rx.ReplaySubject(1);
      }
      return this[streamKey].distinctUntilChanged(Rx.helpers.identity, comparer);
    }
  };

  return propertiesProxy;
}

function createContainerElement(tagName, vtreeProperties) {
  var element = document.createElement('div');
  element.id = vtreeProperties.id || '';
  element.className = vtreeProperties.className || '';
  element.className += ' cycleCustomElement-' + tagName.toUpperCase();
  return element;
}

function warnIfVTreeHasNoKey(vtree) {
  if (typeof vtree.key === 'undefined') {
    console.warn('Missing `key` property for Cycle custom element ' + vtree.tagName);
  }
}

function throwIfVTreeHasPropertyChildren(vtree) {
  if (typeof vtree.properties.children !== 'undefined') {
    throw new Error('Custom element should not have property `children`. ' + 'It is reserved for children elements nested into this custom element.');
  }
}

function makeConstructor() {
  return function customElementConstructor(vtree) {
    //console.log('%cnew (constructor) custom element ' + vtree.tagName,
    //  'color: #880088');
    warnIfVTreeHasNoKey(vtree);
    throwIfVTreeHasPropertyChildren(vtree);
    this.type = 'Widget';
    this.properties = vtree.properties;
    this.properties.children = vtree.children;
    this.key = vtree.key;
    this.isCustomElementWidget = true;
    this.rootElem$ = new Rx.ReplaySubject(1);
    this.disposables = new Rx.CompositeDisposable();
  };
}

function makeInit(tagName, definitionFn) {
  var _require = require('./render-dom');

  var applyToDOM = _require.applyToDOM;

  return function initCustomElement() {
    //console.log('%cInit() custom element ' + tagName, 'color: #880088');
    var widget = this;
    var element = createContainerElement(tagName, widget.properties);
    var propertiesProxy = makePropertiesProxy();
    var domUI = applyToDOM(element, definitionFn, {
      observer: widget.rootElem$.asObserver(),
      props: propertiesProxy
    });
    element.cycleCustomElementMetadata = {
      propertiesProxy: propertiesProxy,
      rootElem$: domUI.rootElem$,
      customEvents: domUI.customEvents,
      eventDispatchingSubscription: false
    };
    element.cycleCustomElementMetadata.eventDispatchingSubscription = subscribeDispatchers(element);
    widget.disposables.add(element.cycleCustomElementMetadata.eventDispatchingSubscription);
    widget.disposables.add(subscribeDispatchersWhenRootChanges(element.cycleCustomElementMetadata));
    widget.disposables.add(domUI);
    widget.disposables.add(widget.rootElem$);
    widget.update(null, element);
    return element;
  };
}

function validatePropertiesProxyInMetadata(element, fnName) {
  if (!element) {
    throw new Error('Missing DOM element when calling ' + fnName + ' on custom ' + 'element Widget.');
  }
  if (!element.cycleCustomElementMetadata) {
    throw new Error('Missing custom element metadata on DOM element when ' + 'calling ' + fnName + ' on custom element Widget.');
  }
  var metadata = element.cycleCustomElementMetadata;
  if (metadata.propertiesProxy.type !== 'PropertiesProxy') {
    throw new Error('Custom element metadata\'s propertiesProxy type is ' + 'invalid: ' + metadata.propertiesProxy.type + '.');
  }
}

function makeUpdate() {
  return function updateCustomElement(previous, element) {
    if (previous) {
      this.disposables = previous.disposables;
      // This is a new rootElem$ which is not being used by init(),
      // but used by render-dom for creating rootElemAfterChildren$.
      this.rootElem$.onNext(null);
      this.rootElem$.onCompleted();
    }
    validatePropertiesProxyInMetadata(element, 'update()');

    //console.log(`%cupdate() custom el ${element.className}`,'color: #880088');
    var proxiedProps = element.cycleCustomElementMetadata.propertiesProxy;
    if (proxiedProps.hasOwnProperty('*')) {
      proxiedProps['*'].onNext(this.properties);
    }
    for (var prop in proxiedProps) {
      if (proxiedProps.hasOwnProperty(prop)) {
        if (this.properties.hasOwnProperty(prop)) {
          proxiedProps[prop].onNext(this.properties[prop]);
        }
      }
    }
  };
}

function makeDestroy() {
  return function destroyCustomElement(element) {
    //console.log(`%cdestroy() custom el ${element.className}`, 'color: #808');
    // Dispose propertiesProxy
    var proxiedProps = element.cycleCustomElementMetadata.propertiesProxy;
    for (var prop in proxiedProps) {
      if (proxiedProps.hasOwnProperty(prop)) {
        this.disposables.add(proxiedProps[prop]);
      }
    }
    if (element.cycleCustomElementMetadata.eventDispatchingSubscription) {
      // This subscription has to be disposed.
      // Because disposing subscribeDispatchersWhenRootChanges only
      // is not enough.
      this.disposables.add(element.cycleCustomElementMetadata.eventDispatchingSubscription);
    }
    this.disposables.dispose();
  };
}

module.exports = {
  makeDispatchFunction: makeDispatchFunction,
  subscribeDispatchers: subscribeDispatchers,
  subscribeDispatchersWhenRootChanges: subscribeDispatchersWhenRootChanges,
  makePropertiesProxy: makePropertiesProxy,
  createContainerElement: createContainerElement,
  warnIfVTreeHasNoKey: warnIfVTreeHasNoKey,
  throwIfVTreeHasPropertyChildren: throwIfVTreeHasPropertyChildren,

  makeConstructor: makeConstructor,
  makeInit: makeInit,
  makeUpdate: makeUpdate,
  makeDestroy: makeDestroy
};

},{"./render-dom":94,"rx":96}],92:[function(require,module,exports){
'use strict';
var CustomElementWidget = require('./custom-element-widget');
require('babel/polyfill');
var CustomElementsRegistry = new Map();

function replaceCustomElementsWithSomething(vtree, toSomethingFn) {
  // Silently ignore corner cases
  if (!vtree || vtree.type === 'VirtualText') {
    return vtree;
  }
  var tagName = (vtree.tagName || '').toUpperCase();
  // Replace vtree itself
  if (tagName && CustomElementsRegistry.has(tagName)) {
    var WidgetClass = CustomElementsRegistry.get(tagName);
    return toSomethingFn(vtree, WidgetClass);
  }
  // Or replace children recursively
  if (Array.isArray(vtree.children)) {
    for (var i = vtree.children.length - 1; i >= 0; i--) {
      vtree.children[i] = replaceCustomElementsWithSomething(vtree.children[i], toSomethingFn);
    }
  }
  return vtree;
}

function registerCustomElement(givenTagName, definitionFn) {
  if (typeof givenTagName !== 'string' || typeof definitionFn !== 'function') {
    throw new Error('registerCustomElement requires parameters `tagName` and ' + '`definitionFn`.');
  }
  var tagName = givenTagName.toUpperCase();
  if (CustomElementsRegistry.has(tagName)) {
    throw new Error('Cannot register custom element `' + tagName + '` ' + 'for the DOMUser because that tagName is already registered.');
  }

  var WidgetClass = CustomElementWidget.makeConstructor();
  WidgetClass.definitionFn = definitionFn;
  WidgetClass.prototype.init = CustomElementWidget.makeInit(tagName, definitionFn);
  WidgetClass.prototype.update = CustomElementWidget.makeUpdate();
  WidgetClass.prototype.destroy = CustomElementWidget.makeDestroy();
  CustomElementsRegistry.set(tagName, WidgetClass);
}

function unregisterAllCustomElements() {
  CustomElementsRegistry.clear();
}

module.exports = {
  replaceCustomElementsWithSomething: replaceCustomElementsWithSomething,
  registerCustomElement: registerCustomElement,
  unregisterAllCustomElements: unregisterAllCustomElements
};

},{"./custom-element-widget":91,"babel/polyfill":88}],93:[function(require,module,exports){
'use strict';
var VirtualDOM = require('virtual-dom');
var Rx = require('rx');
var CustomElements = require('./custom-elements');
var RenderingDOM = require('./render-dom');
var RenderingHTML = require('./render-html');

var Cycle = {
  /**
   * Takes a `computer` function which outputs an Observable of virtual DOM
   * elements, and renders that into the DOM element indicated by `container`,
   * which can be either a CSS selector or an actual element. At the same time,
   * provides the `interactions` input to the `computer` function, which is a
   * collection of all possible events happening on all elements which were
   * rendered. You must query this collection with
   * `interactions.get(selector, eventName)` in order to get an Observable of
   * interactions of type `eventName` happening on the element identified by
   * `selector`.
   * Example: `interactions.get('.mybutton', 'click').map(ev => ...)`
   *
   * @param {(String|HTMLElement)} container the DOM selector for the element
   * (or the element itself) to contain the rendering of the VTrees.
   * @param {Function} computer a function that takes `interactions` as input
   * and outputs an Observable of virtual DOM elements.
   * @return {Object} an object containing properties `rootElem$`,
   * `interactions`, `dispose()` that can be used for debugging or testing.
   * @function applyToDOM
   */
  applyToDOM: RenderingDOM.applyToDOM,

  /**
   * Converts a given Observable of virtual DOM elements (`vtree$`) into an
   * Observable of corresponding HTML strings (`html$`). The provided `vtree$`
   * must complete (must call onCompleted on its observers) in finite time,
   * otherwise the output `html$` will never emit an HTML string.
   *
   * @param {Rx.Observable} vtree$ Observable of virtual DOM elements.
   * @return {Rx.Observable} an Observable emitting a string as the HTML
   * renderization of the virtual DOM element.
   * @function renderAsHTML
   */
  renderAsHTML: RenderingHTML.renderAsHTML,

  /**
   * Informs Cycle to recognize the given `tagName` as a custom element
   * implemented as the given function whenever `tagName` is used in VTrees
   * rendered in the context of some parent (in `applyToDOM` or in other custom
   * elements).
   * The given `definitionFn` function takes two parameters as input, in this
   * order: `interactions` and `properties`. The former works just like it does
   * in the `computer` function given to `applyToDOM`, and the later contains
   * Observables representing properties of the custom element, given from the
   * parent context. `properties.get('foo')` will return the Observable `foo$`.
   *
   * The `definitionFn` must output an object containing the property `vtree$`
   * as an Observable. If the output object contains other Observables, then
   * they are treated as custom events of the custom element.
   *
   * @param {String} tagName a name for identifying the custom element.
   * @param {Function} definitionFn the implementation for the custom element.
   * This function takes two arguments: `interactions`, and `properties`, and
   * should output an object of Observables.
   * @function registerCustomElement
   */
  registerCustomElement: CustomElements.registerCustomElement,

  /**
   * A shortcut to the root object of
   * [RxJS](https://github.com/Reactive-Extensions/RxJS).
   * @name Rx
   */
  Rx: Rx,

  /**
   * A shortcut to [virtual-hyperscript](
   * https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript).
   * This is a helper for creating VTrees in Views.
   * @name h
   */
  h: VirtualDOM.h
};

module.exports = Cycle;

},{"./custom-elements":92,"./render-dom":94,"./render-html":95,"rx":96,"virtual-dom":112}],94:[function(require,module,exports){
/* jshint maxparams: 4 */
'use strict';

function _slicedToArray(arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  } else if (Symbol.iterator in Object(arr)) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i['return']) _i['return']();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  } else {
    throw new TypeError('Invalid attempt to destructure non-iterable instance');
  }
}

var Rx = require('rx');
var VDOM = {
  h: require('virtual-dom').h,
  diff: require('virtual-dom/diff'),
  patch: require('virtual-dom/patch')
};

var _require = require('./custom-elements');

var replaceCustomElementsWithSomething = _require.replaceCustomElementsWithSomething;

function isElement(obj) {
  return typeof HTMLElement === 'object' ? obj instanceof HTMLElement || obj instanceof DocumentFragment : //DOM2
  obj && typeof obj === 'object' && obj !== null && (obj.nodeType === 1 || obj.nodeType === 11) && typeof obj.nodeName === 'string';
}

function fixRootElem$(rawRootElem$, domContainer) {
  // Create rootElem stream and automatic className correction
  var originalClasses = (domContainer.className || '').trim().split(/\s+/);
  //console.log('%coriginalClasses: ' + originalClasses, 'color: lightgray');
  return rawRootElem$.map(function fixRootElemClassName(rootElem) {
    var previousClasses = rootElem.className.trim().split(/\s+/);
    var missingClasses = originalClasses.filter(function (clss) {
      return previousClasses.indexOf(clss) < 0;
    });
    //console.log('%cfixRootElemClassName(), missingClasses: ' +
    //  missingClasses, 'color: lightgray');
    rootElem.className = previousClasses.concat(missingClasses).join(' ');
    //console.log('%c  result: ' + rootElem.className, 'color: lightgray');
    //console.log('%cEmit rootElem$ ' + rootElem.tagName + '.' +
    //  rootElem.className, 'color: #009988');
    return rootElem;
  }).replay(null, 1);
}

function isVTreeCustomElement(vtree) {
  return vtree.type === 'Widget' && vtree.isCustomElementWidget;
}

function replaceCustomElementsWithWidgets(vtree) {
  return replaceCustomElementsWithSomething(vtree, function (_vtree, WidgetClass) {
    return new WidgetClass(_vtree);
  });
}

function getArrayOfAllWidgetRootElemStreams(vtree) {
  if (vtree.type === 'Widget' && vtree.rootElem$) {
    return [vtree.rootElem$];
  }
  // Or replace children recursively
  var array = [];
  if (Array.isArray(vtree.children)) {
    for (var i = vtree.children.length - 1; i >= 0; i--) {
      array = array.concat(getArrayOfAllWidgetRootElemStreams(vtree.children[i]));
    }
  }
  return array;
}

function checkRootVTreeNotCustomElement(vtree) {
  if (isVTreeCustomElement(vtree)) {
    throw new Error('Illegal to use a Cycle custom element as the root of ' + 'a View.');
  }
}

function makeDiffAndPatchToElement$(rootElem) {
  return function diffAndPatchToElement$(_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var oldVTree = _ref2[0];
    var newVTree = _ref2[1];

    if (typeof newVTree === 'undefined') {
      return Rx.Observable.empty();
    }

    var arrayOfAll = getArrayOfAllWidgetRootElemStreams(newVTree);
    var rootElemAfterChildren$ = Rx.Observable.combineLatest(arrayOfAll, function () {
      //console.log('%cEmit rawRootElem$ (1) ', 'color: #008800');
      return rootElem;
    });
    var cycleCustomElementMetadata = rootElem.cycleCustomElementMetadata;
    //let isCustomElement = !!rootElem.cycleCustomElementMetadata;
    //let k = isCustomElement ? ' is custom element ' : ' is top level';
    //console.log('%cVDOM diff and patch START' + k, 'color: #636300');
    /* eslint-disable */
    rootElem = VDOM.patch(rootElem, VDOM.diff(oldVTree, newVTree));
    /* eslint-enable */
    //console.log('%cVDOM diff and patch END' + k, 'color: #636300');
    if (cycleCustomElementMetadata) {
      rootElem.cycleCustomElementMetadata = cycleCustomElementMetadata;
    }
    if (arrayOfAll.length === 0) {
      //console.log('%cEmit rawRootElem$ (2)', 'color: #008800');
      return Rx.Observable.just(rootElem);
    } else {
      return rootElemAfterChildren$;
    }
  };
}

function getRenderRootElem(domContainer) {
  var rootElem = undefined;
  if (/cycleCustomElement-[^\b]+/.exec(domContainer.className) !== null) {
    rootElem = domContainer;
  } else {
    rootElem = document.createElement('div');
    domContainer.innerHTML = '';
    domContainer.appendChild(rootElem);
  }
  return rootElem;
}

function renderRawRootElem$(vtree$, domContainer) {
  var rootElem = getRenderRootElem(domContainer);
  var diffAndPatchToElement$ = makeDiffAndPatchToElement$(rootElem);
  return vtree$.startWith(VDOM.h()).map(replaceCustomElementsWithWidgets).doOnNext(checkRootVTreeNotCustomElement).pairwise().flatMap(diffAndPatchToElement$).startWith(rootElem);
}

function makeInteractions(rootElem$) {
  return {
    get: function get(selector, eventName) {
      if (typeof selector !== 'string') {
        throw new Error('interactions.get() expects first argument to be a ' + 'string as a CSS selector');
      }
      if (typeof eventName !== 'string') {
        throw new Error('interactions.get() expects second argument to be a ' + 'string representing the event type to listen for.');
      }

      //console.log(`%cget("${selector}", "${eventName}")`, 'color: #0000BB');
      return rootElem$.flatMapLatest(function rootElemToEvent$(rootElem) {
        if (!rootElem) {
          return Rx.Observable.empty();
        }
        //let isCustomElement = !!rootElem.cycleCustomElementMetadata;
        //console.log(`%cget('${selector}', '${eventName}') flatMapper` +
        //  (isCustomElement ? ' for a custom element' : ' for top-level View'),
        //  'color: #0000BB');
        var klass = selector.replace('.', '');
        if (rootElem.className.search(new RegExp('\\b' + klass + '\\b')) >= 0) {
          //console.log('%c  Good return. (A)', 'color:#0000BB');
          return Rx.Observable.fromEvent(rootElem, eventName);
        }
        var targetElements = rootElem.querySelectorAll(selector);
        if (targetElements && targetElements.length > 0) {
          //console.log('%c  Good return. (B)', 'color:#0000BB');
          return Rx.Observable.fromEvent(targetElements, eventName);
        } else {
          //console.log('%c  returning empty!', 'color: #0000BB');
          return Rx.Observable.empty();
        }
      });
    }
  };
}

function digestDefinitionFnOutput(output) {
  var vtree$ = undefined;
  var customEvents = {};
  if (typeof output.subscribe === 'function') {
    vtree$ = output;
  } else if (output.hasOwnProperty('vtree$') && typeof output.vtree$.subscribe === 'function') {
    vtree$ = output.vtree$;
    customEvents = output;
  } else {
    throw new Error('definitionFn given to applyToDOM must return an ' + 'Observable of virtual DOM elements, or an object containing such ' + 'Observable named as `vtree$`');
  }
  return { vtree$: vtree$, customEvents: customEvents };
}

function applyToDOM(container, definitionFn) {
  var _ref3 = arguments[2] === undefined ? {} : arguments[2];

  var _ref3$observer = _ref3.observer;
  var observer = _ref3$observer === undefined ? null : _ref3$observer;
  var _ref3$props = _ref3.props;
  var props = _ref3$props === undefined ? null : _ref3$props;

  // Find and prepare the container
  var domContainer = typeof container === 'string' ? document.querySelector(container) : container;
  // Check pre-conditions
  if (typeof container === 'string' && domContainer === null) {
    throw new Error('Cannot render into unknown element \'' + container + '\'');
  } else if (!isElement(domContainer)) {
    throw new Error('Given container is not a DOM element neither a selector ' + 'string.');
  }
  var proxyVTree$$ = new Rx.AsyncSubject();
  var rawRootElem$ = renderRawRootElem$(proxyVTree$$.mergeAll(), domContainer);
  var rootElem$ = fixRootElem$(rawRootElem$, domContainer);
  var interactions = makeInteractions(rootElem$);
  var output = definitionFn(interactions, props);

  var _digestDefinitionFnOutput = digestDefinitionFnOutput(output);

  var vtree$ = _digestDefinitionFnOutput.vtree$;
  var customEvents = _digestDefinitionFnOutput.customEvents;

  var connection = rootElem$.connect();
  var subscription = observer ? rootElem$.subscribe(observer) : rootElem$.subscribe();
  proxyVTree$$.onNext(vtree$.shareReplay(1));
  proxyVTree$$.onCompleted();

  return {
    dispose: function dispose() {
      subscription.dispose();
      connection.dispose();
      proxyVTree$$.dispose();
    },
    rootElem$: rootElem$,
    interactions: interactions,
    customEvents: customEvents
  };
}

module.exports = {
  isElement: isElement,
  fixRootElem$: fixRootElem$,
  isVTreeCustomElement: isVTreeCustomElement,
  replaceCustomElementsWithWidgets: replaceCustomElementsWithWidgets,
  getArrayOfAllWidgetRootElemStreams: getArrayOfAllWidgetRootElemStreams,
  checkRootVTreeNotCustomElement: checkRootVTreeNotCustomElement,
  makeDiffAndPatchToElement$: makeDiffAndPatchToElement$,
  getRenderRootElem: getRenderRootElem,
  renderRawRootElem$: renderRawRootElem$,
  makeInteractions: makeInteractions,
  digestDefinitionFnOutput: digestDefinitionFnOutput,

  applyToDOM: applyToDOM
};

},{"./custom-elements":92,"rx":96,"virtual-dom":112,"virtual-dom/diff":110,"virtual-dom/patch":120}],95:[function(require,module,exports){
'use strict';
var Rx = require('rx');
var toHTML = require('vdom-to-html');

var _require = require('./custom-elements');

var replaceCustomElementsWithSomething = _require.replaceCustomElementsWithSomething;

function makePropertiesProxyFromVTree(vtree) {
  return {
    get: function get(propertyName) {
      return Rx.Observable.just(vtree.properties[propertyName]);
    }
  };
}

/**
 * Converts a tree of VirtualNode|Observable<VirtualNode> into
 * Observable<VirtualNode>.
 */
function transposeVTree(vtree) {
  if (typeof vtree.subscribe === 'function') {
    return vtree;
  } else if (vtree.type === 'VirtualText') {
    return Rx.Observable.just(vtree);
  } else if (vtree.type === 'VirtualNode' && Array.isArray(vtree.children) && vtree.children.length > 0) {
    return Rx.Observable.combineLatest(vtree.children.map(transposeVTree), function () {
      for (var _len = arguments.length, arr = Array(_len), _key = 0; _key < _len; _key++) {
        arr[_key] = arguments[_key];
      }

      vtree.children = arr;
      return vtree;
    });
  } else if (vtree.type === 'VirtualNode') {
    return Rx.Observable.just(vtree);
  } else {
    throw new Error('Unhandled case in transposeVTree()');
  }
}

function makeEmptyInteractions() {
  return {
    get: function get() {
      return Rx.Observable.empty();
    }
  };
}

function replaceCustomElementsWithVTree$(vtree) {
  return replaceCustomElementsWithSomething(vtree, function toVTree$(_vtree, WidgetClass) {
    var interactions = makeEmptyInteractions();
    var props = makePropertiesProxyFromVTree(_vtree);
    var output = WidgetClass.definitionFn(interactions, props);
    /*eslint-disable no-use-before-define */
    return convertCustomElementsToVTree(output.vtree$.last());
    /*eslint-enable no-use-before-define */
  });
}

function convertCustomElementsToVTree(vtree$) {
  return vtree$.map(replaceCustomElementsWithVTree$).flatMap(transposeVTree);
}

function renderAsHTML(input) {
  var vtree$ = undefined;
  var computerFn = undefined;
  if (typeof input === 'function') {
    computerFn = input;
    vtree$ = computerFn(makeEmptyInteractions());
  } else if (typeof input.subscribe === 'function') {
    vtree$ = input;
  }
  return convertCustomElementsToVTree(vtree$.last()).map(function (vtree) {
    return toHTML(vtree);
  });
}

module.exports = {
  makePropertiesProxyFromVTree: makePropertiesProxyFromVTree,
  replaceCustomElementsWithVTree$: replaceCustomElementsWithVTree$,
  convertCustomElementsToVTree: convertCustomElementsToVTree,

  renderAsHTML: renderAsHTML
};

},{"./custom-elements":92,"rx":96,"vdom-to-html":98}],96:[function(require,module,exports){
(function (process,global){
'use strict';;(function(undefined){var objectTypes={'boolean':false, 'function':true, 'object':true, 'number':false, 'string':false, 'undefined':false};var root=objectTypes[typeof window] && window || this, freeExports=objectTypes[typeof exports] && exports && !exports.nodeType && exports, freeModule=objectTypes[typeof module] && module && !module.nodeType && module, moduleExports=freeModule && freeModule.exports === freeExports && freeExports, freeGlobal=objectTypes[typeof global] && global;if(freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)){root = freeGlobal;}var Rx={internals:{}, config:{Promise:root.Promise}, helpers:{}};var noop=Rx.helpers.noop = function(){}, notDefined=Rx.helpers.notDefined = function(x){return typeof x === 'undefined';}, identity=Rx.helpers.identity = function(x){return x;}, pluck=Rx.helpers.pluck = function(property){return function(x){return x[property];};}, just=Rx.helpers.just = function(value){return function(){return value;};}, defaultNow=Rx.helpers.defaultNow = Date.now, defaultComparer=Rx.helpers.defaultComparer = function(x, y){return isEqual(x, y);}, defaultSubComparer=Rx.helpers.defaultSubComparer = function(x, y){return x > y?1:x < y?-1:0;}, defaultKeySerializer=Rx.helpers.defaultKeySerializer = function(x){return x.toString();}, defaultError=Rx.helpers.defaultError = function(err){throw err;}, isPromise=Rx.helpers.isPromise = function(p){return !!p && typeof p.then === 'function';}, asArray=Rx.helpers.asArray = function(){return Array.prototype.slice.call(arguments);}, not=Rx.helpers.not = function(a){return !a;}, isFunction=Rx.helpers.isFunction = (function(){var isFn=function isFn(value){return typeof value == 'function' || false;};if(isFn(/x/)){isFn = function(value){return typeof value == 'function' && toString.call(value) == '[object Function]';};}return isFn;})();function cloneArray(arr){for(var a=[], i=0, len=arr.length; i < len; i++) {a.push(arr[i]);}return a;}Rx.config.longStackSupport = false;var hasStacks=false;try{throw new Error();}catch(e) {hasStacks = !!e.stack;}var rStartingLine=captureLine(), rFileName;var STACK_JUMP_SEPARATOR='From previous event:';function makeStackTraceLong(error, observable){if(hasStacks && observable.stack && typeof error === 'object' && error !== null && error.stack && error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1){var stacks=[];for(var o=observable; !!o; o = o.source) {if(o.stack){stacks.unshift(o.stack);}}stacks.unshift(error.stack);var concatedStacks=stacks.join('\n' + STACK_JUMP_SEPARATOR + '\n');error.stack = filterStackString(concatedStacks);}}function filterStackString(stackString){var lines=stackString.split('\n'), desiredLines=[];for(var i=0, len=lines.length; i < len; i++) {var line=lines[i];if(!isInternalFrame(line) && !isNodeFrame(line) && line){desiredLines.push(line);}}return desiredLines.join('\n');}function isInternalFrame(stackLine){var fileNameAndLineNumber=getFileNameAndLineNumber(stackLine);if(!fileNameAndLineNumber){return false;}var fileName=fileNameAndLineNumber[0], lineNumber=fileNameAndLineNumber[1];return fileName === rFileName && lineNumber >= rStartingLine && lineNumber <= rEndingLine;}function isNodeFrame(stackLine){return stackLine.indexOf('(module.js:') !== -1 || stackLine.indexOf('(node.js:') !== -1;}function captureLine(){if(!hasStacks){return;}try{throw new Error();}catch(e) {var lines=e.stack.split('\n');var firstLine=lines[0].indexOf('@') > 0?lines[1]:lines[2];var fileNameAndLineNumber=getFileNameAndLineNumber(firstLine);if(!fileNameAndLineNumber){return;}rFileName = fileNameAndLineNumber[0];return fileNameAndLineNumber[1];}}function getFileNameAndLineNumber(stackLine){var attempt1=/at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);if(attempt1){return [attempt1[1], Number(attempt1[2])];}var attempt2=/at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);if(attempt2){return [attempt2[1], Number(attempt2[2])];}var attempt3=/.*@(.+):(\d+)$/.exec(stackLine);if(attempt3){return [attempt3[1], Number(attempt3[2])];}}var EmptyError=Rx.EmptyError = function(){this.message = 'Sequence contains no elements.';Error.call(this);};EmptyError.prototype = Error.prototype;var ObjectDisposedError=Rx.ObjectDisposedError = function(){this.message = 'Object has been disposed';Error.call(this);};ObjectDisposedError.prototype = Error.prototype;var ArgumentOutOfRangeError=Rx.ArgumentOutOfRangeError = function(){this.message = 'Argument out of range';Error.call(this);};ArgumentOutOfRangeError.prototype = Error.prototype;var NotSupportedError=Rx.NotSupportedError = function(message){this.message = message || 'This operation is not supported';Error.call(this);};NotSupportedError.prototype = Error.prototype;var NotImplementedError=Rx.NotImplementedError = function(message){this.message = message || 'This operation is not implemented';Error.call(this);};NotImplementedError.prototype = Error.prototype;var notImplemented=Rx.helpers.notImplemented = function(){throw new NotImplementedError();};var notSupported=Rx.helpers.notSupported = function(){throw new NotSupportedError();};var $iterator$=typeof Symbol === 'function' && Symbol.iterator || '_es6shim_iterator_';if(root.Set && typeof new root.Set()['@@iterator'] === 'function'){$iterator$ = '@@iterator';}var doneEnumerator=Rx.doneEnumerator = {done:true, value:undefined};var isIterable=Rx.helpers.isIterable = function(o){return o[$iterator$] !== undefined;};var isArrayLike=Rx.helpers.isArrayLike = function(o){return o && o.length !== undefined;};Rx.helpers.iterator = $iterator$;var bindCallback=Rx.internals.bindCallback = function(func, thisArg, argCount){if(typeof thisArg === 'undefined'){return func;}switch(argCount){case 0:return function(){return func.call(thisArg);};case 1:return function(arg){return func.call(thisArg, arg);};case 2:return function(value, index){return func.call(thisArg, value, index);};case 3:return function(value, index, collection){return func.call(thisArg, value, index, collection);};}return function(){return func.apply(thisArg, arguments);};};var dontEnums=['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'], dontEnumsLength=dontEnums.length;var argsClass='[object Arguments]', arrayClass='[object Array]', boolClass='[object Boolean]', dateClass='[object Date]', errorClass='[object Error]', funcClass='[object Function]', numberClass='[object Number]', objectClass='[object Object]', regexpClass='[object RegExp]', stringClass='[object String]';var toString=Object.prototype.toString, hasOwnProperty=Object.prototype.hasOwnProperty, supportsArgsClass=toString.call(arguments) == argsClass, supportNodeClass, errorProto=Error.prototype, objectProto=Object.prototype, stringProto=String.prototype, propertyIsEnumerable=objectProto.propertyIsEnumerable;try{supportNodeClass = !(toString.call(document) == objectClass && !({'toString':0} + ''));}catch(e) {supportNodeClass = true;}var nonEnumProps={};nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = {'constructor':true, 'toLocaleString':true, 'toString':true, 'valueOf':true};nonEnumProps[boolClass] = nonEnumProps[stringClass] = {'constructor':true, 'toString':true, 'valueOf':true};nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = {'constructor':true, 'toString':true};nonEnumProps[objectClass] = {'constructor':true};var support={};(function(){var ctor=function ctor(){this.x = 1;}, props=[];ctor.prototype = {'valueOf':1, 'y':1};for(var key in new ctor()) {props.push(key);}for(key in arguments) {}support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');support.nonEnumArgs = key != 0;support.nonEnumShadows = !/valueOf/.test(props);})(1);var isObject=Rx.internals.isObject = function(value){var type=typeof value;return value && (type == 'function' || type == 'object') || false;};function keysIn(object){var result=[];if(!isObject(object)){return result;}if(support.nonEnumArgs && object.length && isArguments(object)){object = slice.call(object);}var skipProto=support.enumPrototypes && typeof object == 'function', skipErrorProps=support.enumErrorProps && (object === errorProto || object instanceof Error);for(var key in object) {if(!(skipProto && key == 'prototype') && !(skipErrorProps && (key == 'message' || key == 'name'))){result.push(key);}}if(support.nonEnumShadows && object !== objectProto){var ctor=object.constructor, index=-1, length=dontEnumsLength;if(object === (ctor && ctor.prototype)){var className=object === stringProto?stringClass:object === errorProto?errorClass:toString.call(object), nonEnum=nonEnumProps[className];}while(++index < length) {key = dontEnums[index];if(!(nonEnum && nonEnum[key]) && hasOwnProperty.call(object, key)){result.push(key);}}}return result;}function internalFor(object, callback, keysFunc){var index=-1, props=keysFunc(object), length=props.length;while(++index < length) {var key=props[index];if(callback(object[key], key, object) === false){break;}}return object;}function internalForIn(object, callback){return internalFor(object, callback, keysIn);}function isNode(value){return typeof value.toString != 'function' && typeof (value + '') == 'string';}var isArguments=function isArguments(value){return value && typeof value == 'object'?toString.call(value) == argsClass:false;};if(!supportsArgsClass){isArguments = function(value){return value && typeof value == 'object'?hasOwnProperty.call(value, 'callee'):false;};}var isEqual=Rx.internals.isEqual = function(x, y){return deepEquals(x, y, [], []);};function deepEquals(a, b, stackA, stackB){if(a === b){return a !== 0 || 1 / a == 1 / b;}var type=typeof a, otherType=typeof b;if(a === a && (a == null || b == null || type != 'function' && type != 'object' && otherType != 'function' && otherType != 'object')){return false;}var className=toString.call(a), otherClass=toString.call(b);if(className == argsClass){className = objectClass;}if(otherClass == argsClass){otherClass = objectClass;}if(className != otherClass){return false;}switch(className){case boolClass:case dateClass:return +a == +b;case numberClass:return a != +a?b != +b:a == 0?1 / a == 1 / b:a == +b;case regexpClass:case stringClass:return a == String(b);}var isArr=className == arrayClass;if(!isArr){if(className != objectClass || !support.nodeClass && (isNode(a) || isNode(b))){return false;}var ctorA=!support.argsObject && isArguments(a)?Object:a.constructor, ctorB=!support.argsObject && isArguments(b)?Object:b.constructor;if(ctorA != ctorB && !(hasOwnProperty.call(a, 'constructor') && hasOwnProperty.call(b, 'constructor')) && !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) && ('constructor' in a && 'constructor' in b)){return false;}}var initedStack=!stackA;stackA || (stackA = []);stackB || (stackB = []);var length=stackA.length;while(length--) {if(stackA[length] == a){return stackB[length] == b;}}var size=0;var result=true;stackA.push(a);stackB.push(b);if(isArr){length = a.length;size = b.length;result = size == length;if(result){while(size--) {var index=length, value=b[size];if(!(result = deepEquals(a[size], value, stackA, stackB))){break;}}}}else {internalForIn(b, function(value, key, b){if(hasOwnProperty.call(b, key)){size++;return result = hasOwnProperty.call(a, key) && deepEquals(a[key], value, stackA, stackB);}});if(result){internalForIn(a, function(value, key, a){if(hasOwnProperty.call(a, key)){return result = --size > -1;}});}}stackA.pop();stackB.pop();return result;}var hasProp=({}).hasOwnProperty, slice=Array.prototype.slice;var inherits=this.inherits = Rx.internals.inherits = function(child, parent){function __(){this.constructor = child;}__.prototype = parent.prototype;child.prototype = new __();};var addProperties=Rx.internals.addProperties = function(obj){for(var sources=[], i=1, len=arguments.length; i < len; i++) {sources.push(arguments[i]);}for(var idx=0, ln=sources.length; idx < ln; idx++) {var source=sources[idx];for(var prop in source) {obj[prop] = source[prop];}}};var addRef=Rx.internals.addRef = function(xs, r){return new AnonymousObservable(function(observer){return new CompositeDisposable(r.getDisposable(), xs.subscribe(observer));});};function arrayInitialize(count, factory){var a=new Array(count);for(var i=0; i < count; i++) {a[i] = factory();}return a;}var errorObj={e:{}};var tryCatchTarget;function tryCatcher(){try{return tryCatchTarget.apply(this, arguments);}catch(e) {errorObj.e = e;return errorObj;}}function tryCatch(fn){if(!isFunction(fn)){throw new TypeError('fn must be a function');}tryCatchTarget = fn;return tryCatcher;}function thrower(e){throw e;}function IndexedItem(id, value){this.id = id;this.value = value;}IndexedItem.prototype.compareTo = function(other){var c=this.value.compareTo(other.value);c === 0 && (c = this.id - other.id);return c;};var PriorityQueue=Rx.internals.PriorityQueue = function(capacity){this.items = new Array(capacity);this.length = 0;};var priorityProto=PriorityQueue.prototype;priorityProto.isHigherPriority = function(left, right){return this.items[left].compareTo(this.items[right]) < 0;};priorityProto.percolate = function(index){if(index >= this.length || index < 0){return;}var parent=index - 1 >> 1;if(parent < 0 || parent === index){return;}if(this.isHigherPriority(index, parent)){var temp=this.items[index];this.items[index] = this.items[parent];this.items[parent] = temp;this.percolate(parent);}};priorityProto.heapify = function(index){+index || (index = 0);if(index >= this.length || index < 0){return;}var left=2 * index + 1, right=2 * index + 2, first=index;if(left < this.length && this.isHigherPriority(left, first)){first = left;}if(right < this.length && this.isHigherPriority(right, first)){first = right;}if(first !== index){var temp=this.items[index];this.items[index] = this.items[first];this.items[first] = temp;this.heapify(first);}};priorityProto.peek = function(){return this.items[0].value;};priorityProto.removeAt = function(index){this.items[index] = this.items[--this.length];this.items[this.length] = undefined;this.heapify();};priorityProto.dequeue = function(){var result=this.peek();this.removeAt(0);return result;};priorityProto.enqueue = function(item){var index=this.length++;this.items[index] = new IndexedItem(PriorityQueue.count++, item);this.percolate(index);};priorityProto.remove = function(item){for(var i=0; i < this.length; i++) {if(this.items[i].value === item){this.removeAt(i);return true;}}return false;};PriorityQueue.count = 0;var CompositeDisposable=Rx.CompositeDisposable = function(){var args=[], i, len;if(Array.isArray(arguments[0])){args = arguments[0];len = args.length;}else {len = arguments.length;args = new Array(len);for(i = 0; i < len; i++) {args[i] = arguments[i];}}for(i = 0; i < len; i++) {if(!isDisposable(args[i])){throw new TypeError('Not a disposable');}}this.disposables = args;this.isDisposed = false;this.length = args.length;};var CompositeDisposablePrototype=CompositeDisposable.prototype;CompositeDisposablePrototype.add = function(item){if(this.isDisposed){item.dispose();}else {this.disposables.push(item);this.length++;}};CompositeDisposablePrototype.remove = function(item){var shouldDispose=false;if(!this.isDisposed){var idx=this.disposables.indexOf(item);if(idx !== -1){shouldDispose = true;this.disposables.splice(idx, 1);this.length--;item.dispose();}}return shouldDispose;};CompositeDisposablePrototype.dispose = function(){if(!this.isDisposed){this.isDisposed = true;var len=this.disposables.length, currentDisposables=new Array(len);for(var i=0; i < len; i++) {currentDisposables[i] = this.disposables[i];}this.disposables = [];this.length = 0;for(i = 0; i < len; i++) {currentDisposables[i].dispose();}}};var Disposable=Rx.Disposable = function(action){this.isDisposed = false;this.action = action || noop;};Disposable.prototype.dispose = function(){if(!this.isDisposed){this.action();this.isDisposed = true;}};var disposableCreate=Disposable.create = function(action){return new Disposable(action);};var disposableEmpty=Disposable.empty = {dispose:noop};var isDisposable=Disposable.isDisposable = function(d){return d && isFunction(d.dispose);};var checkDisposed=Disposable.checkDisposed = function(disposable){if(disposable.isDisposed){throw new ObjectDisposedError();}};var SingleAssignmentDisposable=Rx.SingleAssignmentDisposable = function(){this.isDisposed = false;this.current = null;};SingleAssignmentDisposable.prototype.getDisposable = function(){return this.current;};SingleAssignmentDisposable.prototype.setDisposable = function(value){if(this.current){throw new Error('Disposable has already been assigned');}var shouldDispose=this.isDisposed;!shouldDispose && (this.current = value);shouldDispose && value && value.dispose();};SingleAssignmentDisposable.prototype.dispose = function(){if(!this.isDisposed){this.isDisposed = true;var old=this.current;this.current = null;}old && old.dispose();};var SerialDisposable=Rx.SerialDisposable = function(){this.isDisposed = false;this.current = null;};SerialDisposable.prototype.getDisposable = function(){return this.current;};SerialDisposable.prototype.setDisposable = function(value){var shouldDispose=this.isDisposed;if(!shouldDispose){var old=this.current;this.current = value;}old && old.dispose();shouldDispose && value && value.dispose();};SerialDisposable.prototype.dispose = function(){if(!this.isDisposed){this.isDisposed = true;var old=this.current;this.current = null;}old && old.dispose();};var RefCountDisposable=Rx.RefCountDisposable = (function(){function InnerDisposable(disposable){this.disposable = disposable;this.disposable.count++;this.isInnerDisposed = false;}InnerDisposable.prototype.dispose = function(){if(!this.disposable.isDisposed && !this.isInnerDisposed){this.isInnerDisposed = true;this.disposable.count--;if(this.disposable.count === 0 && this.disposable.isPrimaryDisposed){this.disposable.isDisposed = true;this.disposable.underlyingDisposable.dispose();}}};function RefCountDisposable(disposable){this.underlyingDisposable = disposable;this.isDisposed = false;this.isPrimaryDisposed = false;this.count = 0;}RefCountDisposable.prototype.dispose = function(){if(!this.isDisposed && !this.isPrimaryDisposed){this.isPrimaryDisposed = true;if(this.count === 0){this.isDisposed = true;this.underlyingDisposable.dispose();}}};RefCountDisposable.prototype.getDisposable = function(){return this.isDisposed?disposableEmpty:new InnerDisposable(this);};return RefCountDisposable;})();function ScheduledDisposable(scheduler, disposable){this.scheduler = scheduler;this.disposable = disposable;this.isDisposed = false;}function scheduleItem(s, self){if(!self.isDisposed){self.isDisposed = true;self.disposable.dispose();}}ScheduledDisposable.prototype.dispose = function(){this.scheduler.scheduleWithState(this, scheduleItem);};var ScheduledItem=Rx.internals.ScheduledItem = function(scheduler, state, action, dueTime, comparer){this.scheduler = scheduler;this.state = state;this.action = action;this.dueTime = dueTime;this.comparer = comparer || defaultSubComparer;this.disposable = new SingleAssignmentDisposable();};ScheduledItem.prototype.invoke = function(){this.disposable.setDisposable(this.invokeCore());};ScheduledItem.prototype.compareTo = function(other){return this.comparer(this.dueTime, other.dueTime);};ScheduledItem.prototype.isCancelled = function(){return this.disposable.isDisposed;};ScheduledItem.prototype.invokeCore = function(){return this.action(this.scheduler, this.state);};var Scheduler=Rx.Scheduler = (function(){function Scheduler(now, schedule, scheduleRelative, scheduleAbsolute){this.now = now;this._schedule = schedule;this._scheduleRelative = scheduleRelative;this._scheduleAbsolute = scheduleAbsolute;}Scheduler.isScheduler = function(s){return s instanceof Scheduler;};function invokeAction(scheduler, action){action();return disposableEmpty;}var schedulerProto=Scheduler.prototype;schedulerProto.schedule = function(action){return this._schedule(action, invokeAction);};schedulerProto.scheduleWithState = function(state, action){return this._schedule(state, action);};schedulerProto.scheduleWithRelative = function(dueTime, action){return this._scheduleRelative(action, dueTime, invokeAction);};schedulerProto.scheduleWithRelativeAndState = function(state, dueTime, action){return this._scheduleRelative(state, dueTime, action);};schedulerProto.scheduleWithAbsolute = function(dueTime, action){return this._scheduleAbsolute(action, dueTime, invokeAction);};schedulerProto.scheduleWithAbsoluteAndState = function(state, dueTime, action){return this._scheduleAbsolute(state, dueTime, action);};Scheduler.now = defaultNow;Scheduler.normalize = function(timeSpan){timeSpan < 0 && (timeSpan = 0);return timeSpan;};return Scheduler;})();var normalizeTime=Scheduler.normalize, isScheduler=Scheduler.isScheduler;(function(schedulerProto){function invokeRecImmediate(scheduler, pair){var state=pair[0], action=pair[1], group=new CompositeDisposable();function recursiveAction(state1){action(state1, function(state2){var isAdded=false, isDone=false, d=scheduler.scheduleWithState(state2, function(scheduler1, state3){if(isAdded){group.remove(d);}else {isDone = true;}recursiveAction(state3);return disposableEmpty;});if(!isDone){group.add(d);isAdded = true;}});}recursiveAction(state);return group;}function invokeRecDate(scheduler, pair, method){var state=pair[0], action=pair[1], group=new CompositeDisposable();function recursiveAction(state1){action(state1, function(state2, dueTime1){var isAdded=false, isDone=false, d=scheduler[method](state2, dueTime1, function(scheduler1, state3){if(isAdded){group.remove(d);}else {isDone = true;}recursiveAction(state3);return disposableEmpty;});if(!isDone){group.add(d);isAdded = true;}});};recursiveAction(state);return group;}function scheduleInnerRecursive(action, self){action(function(dt){self(action, dt);});}schedulerProto.scheduleRecursive = function(action){return this.scheduleRecursiveWithState(action, function(_action, self){_action(function(){self(_action);});});};schedulerProto.scheduleRecursiveWithState = function(state, action){return this.scheduleWithState([state, action], invokeRecImmediate);};schedulerProto.scheduleRecursiveWithRelative = function(dueTime, action){return this.scheduleRecursiveWithRelativeAndState(action, dueTime, scheduleInnerRecursive);};schedulerProto.scheduleRecursiveWithRelativeAndState = function(state, dueTime, action){return this._scheduleRelative([state, action], dueTime, function(s, p){return invokeRecDate(s, p, 'scheduleWithRelativeAndState');});};schedulerProto.scheduleRecursiveWithAbsolute = function(dueTime, action){return this.scheduleRecursiveWithAbsoluteAndState(action, dueTime, scheduleInnerRecursive);};schedulerProto.scheduleRecursiveWithAbsoluteAndState = function(state, dueTime, action){return this._scheduleAbsolute([state, action], dueTime, function(s, p){return invokeRecDate(s, p, 'scheduleWithAbsoluteAndState');});};})(Scheduler.prototype);(function(schedulerProto){Scheduler.prototype.schedulePeriodic = function(period, action){return this.schedulePeriodicWithState(null, period, action);};Scheduler.prototype.schedulePeriodicWithState = function(state, period, action){if(typeof root.setInterval === 'undefined'){throw new NotSupportedError();}period = normalizeTime(period);var s=state, id=root.setInterval(function(){s = action(s);}, period);return disposableCreate(function(){root.clearInterval(id);});};})(Scheduler.prototype);(function(schedulerProto){schedulerProto.catchError = schedulerProto['catch'] = function(handler){return new CatchScheduler(this, handler);};})(Scheduler.prototype);var SchedulePeriodicRecursive=Rx.internals.SchedulePeriodicRecursive = (function(){function tick(command, recurse){recurse(0, this._period);try{this._state = this._action(this._state);}catch(e) {this._cancel.dispose();throw e;}}function SchedulePeriodicRecursive(scheduler, state, period, action){this._scheduler = scheduler;this._state = state;this._period = period;this._action = action;}SchedulePeriodicRecursive.prototype.start = function(){var d=new SingleAssignmentDisposable();this._cancel = d;d.setDisposable(this._scheduler.scheduleRecursiveWithRelativeAndState(0, this._period, tick.bind(this)));return d;};return SchedulePeriodicRecursive;})();var immediateScheduler=Scheduler.immediate = (function(){function scheduleNow(state, action){return action(this, state);}return new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);})();var currentThreadScheduler=Scheduler.currentThread = (function(){var queue;function runTrampoline(){while(queue.length > 0) {var item=queue.dequeue();!item.isCancelled() && item.invoke();}}function scheduleNow(state, action){var si=new ScheduledItem(this, state, action, this.now());if(!queue){queue = new PriorityQueue(4);queue.enqueue(si);var result=tryCatch(runTrampoline)();queue = null;if(result === errorObj){return thrower(result.e);}}else {queue.enqueue(si);}return si.disposable;}var currentScheduler=new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);currentScheduler.scheduleRequired = function(){return !queue;};return currentScheduler;})();var scheduleMethod, clearMethod;var localTimer=(function(){var localSetTimeout, localClearTimeout=noop;if(!!root.setTimeout){localSetTimeout = root.setTimeout;localClearTimeout = root.clearTimeout;}else if(!!root.WScript){localSetTimeout = function(fn, time){root.WScript.Sleep(time);fn();};}else {throw new NotSupportedError();}return {setTimeout:localSetTimeout, clearTimeout:localClearTimeout};})();var localSetTimeout=localTimer.setTimeout, localClearTimeout=localTimer.clearTimeout;(function(){var nextHandle=1, tasksByHandle={}, currentlyRunning=false;clearMethod = function(handle){delete tasksByHandle[handle];};function runTask(handle){if(currentlyRunning){localSetTimeout(function(){runTask(handle);}, 0);}else {var task=tasksByHandle[handle];if(task){currentlyRunning = true;var result=tryCatch(task)();clearMethod(handle);currentlyRunning = false;if(result === errorObj){return thrower(result.e);}}}}var reNative=RegExp('^' + String(toString).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/toString| for [^\]]+/g, '.*?') + '$');var setImmediate=typeof (setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == 'function' && !reNative.test(setImmediate) && setImmediate;function postMessageSupported(){if(!root.postMessage || root.importScripts){return false;}var isAsync=false, oldHandler=root.onmessage;root.onmessage = function(){isAsync = true;};root.postMessage('', '*');root.onmessage = oldHandler;return isAsync;}if(isFunction(setImmediate)){scheduleMethod = function(action){var id=nextHandle++;tasksByHandle[id] = action;setImmediate(function(){runTask(id);});return id;};}else if(typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]'){scheduleMethod = function(action){var id=nextHandle++;tasksByHandle[id] = action;process.nextTick(function(){runTask(id);});return id;};}else if(postMessageSupported()){var onGlobalPostMessage=function(event){if(typeof event.data === 'string' && event.data.substring(0, MSG_PREFIX.length) === MSG_PREFIX){runTask(event.data.substring(MSG_PREFIX.length));}};var MSG_PREFIX='ms.rx.schedule' + Math.random();if(root.addEventListener){root.addEventListener('message', onGlobalPostMessage, false);}else if(root.attachEvent){root.attachEvent('onmessage', onGlobalPostMessage);}else {root.onmessage = onGlobalPostMessage;}scheduleMethod = function(action){var id=nextHandle++;tasksByHandle[id] = action;root.postMessage(MSG_PREFIX + currentId, '*');return id;};}else if(!!root.MessageChannel){var channel=new root.MessageChannel();channel.port1.onmessage = function(e){runTask(e.data);};scheduleMethod = function(action){var id=nextHandle++;tasksByHandle[id] = action;channel.port2.postMessage(id);return id;};}else if('document' in root && 'onreadystatechange' in root.document.createElement('script')){scheduleMethod = function(action){var scriptElement=root.document.createElement('script');var id=nextHandle++;tasksByHandle[id] = action;scriptElement.onreadystatechange = function(){runTask(id);scriptElement.onreadystatechange = null;scriptElement.parentNode.removeChild(scriptElement);scriptElement = null;};root.document.documentElement.appendChild(scriptElement);return id;};}else {scheduleMethod = function(action){var id=nextHandle++;tasksByHandle[id] = action;localSetTimeout(function(){runTask(id);}, 0);return id;};}})();var timeoutScheduler=Scheduler.timeout = Scheduler['default'] = (function(){function scheduleNow(state, action){var scheduler=this, disposable=new SingleAssignmentDisposable();var id=scheduleMethod(function(){!disposable.isDisposed && disposable.setDisposable(action(scheduler, state));});return new CompositeDisposable(disposable, disposableCreate(function(){clearMethod(id);}));}function scheduleRelative(state, dueTime, action){var scheduler=this, dt=Scheduler.normalize(dueTime), disposable=new SingleAssignmentDisposable();if(dt === 0){return scheduler.scheduleWithState(state, action);}var id=localSetTimeout(function(){!disposable.isDisposed && disposable.setDisposable(action(scheduler, state));}, dt);return new CompositeDisposable(disposable, disposableCreate(function(){localClearTimeout(id);}));}function scheduleAbsolute(state, dueTime, action){return this.scheduleWithRelativeAndState(state, dueTime - this.now(), action);}return new Scheduler(defaultNow, scheduleNow, scheduleRelative, scheduleAbsolute);})();var CatchScheduler=(function(__super__){function scheduleNow(state, action){return this._scheduler.scheduleWithState(state, this._wrap(action));}function scheduleRelative(state, dueTime, action){return this._scheduler.scheduleWithRelativeAndState(state, dueTime, this._wrap(action));}function scheduleAbsolute(state, dueTime, action){return this._scheduler.scheduleWithAbsoluteAndState(state, dueTime, this._wrap(action));}inherits(CatchScheduler, __super__);function CatchScheduler(scheduler, handler){this._scheduler = scheduler;this._handler = handler;this._recursiveOriginal = null;this._recursiveWrapper = null;__super__.call(this, this._scheduler.now.bind(this._scheduler), scheduleNow, scheduleRelative, scheduleAbsolute);}CatchScheduler.prototype._clone = function(scheduler){return new CatchScheduler(scheduler, this._handler);};CatchScheduler.prototype._wrap = function(action){var parent=this;return function(self, state){try{return action(parent._getRecursiveWrapper(self), state);}catch(e) {if(!parent._handler(e)){throw e;}return disposableEmpty;}};};CatchScheduler.prototype._getRecursiveWrapper = function(scheduler){if(this._recursiveOriginal !== scheduler){this._recursiveOriginal = scheduler;var wrapper=this._clone(scheduler);wrapper._recursiveOriginal = scheduler;wrapper._recursiveWrapper = wrapper;this._recursiveWrapper = wrapper;}return this._recursiveWrapper;};CatchScheduler.prototype.schedulePeriodicWithState = function(state, period, action){var self=this, failed=false, d=new SingleAssignmentDisposable();d.setDisposable(this._scheduler.schedulePeriodicWithState(state, period, function(state1){if(failed){return null;}try{return action(state1);}catch(e) {failed = true;if(!self._handler(e)){throw e;}d.dispose();return null;}}));return d;};return CatchScheduler;})(Scheduler);var Notification=Rx.Notification = (function(){function Notification(kind, value, exception, accept, acceptObservable, toString){this.kind = kind;this.value = value;this.exception = exception;this._accept = accept;this._acceptObservable = acceptObservable;this.toString = toString;}Notification.prototype.accept = function(observerOrOnNext, onError, onCompleted){return observerOrOnNext && typeof observerOrOnNext === 'object'?this._acceptObservable(observerOrOnNext):this._accept(observerOrOnNext, onError, onCompleted);};Notification.prototype.toObservable = function(scheduler){var self=this;isScheduler(scheduler) || (scheduler = immediateScheduler);return new AnonymousObservable(function(observer){return scheduler.scheduleWithState(self, function(_, notification){notification._acceptObservable(observer);notification.kind === 'N' && observer.onCompleted();});});};return Notification;})();var notificationCreateOnNext=Notification.createOnNext = (function(){function _accept(onNext){return onNext(this.value);}function _acceptObservable(observer){return observer.onNext(this.value);}function toString(){return 'OnNext(' + this.value + ')';}return function(value){return new Notification('N', value, null, _accept, _acceptObservable, toString);};})();var notificationCreateOnError=Notification.createOnError = (function(){function _accept(onNext, onError){return onError(this.exception);}function _acceptObservable(observer){return observer.onError(this.exception);}function toString(){return 'OnError(' + this.exception + ')';}return function(e){return new Notification('E', null, e, _accept, _acceptObservable, toString);};})();var notificationCreateOnCompleted=Notification.createOnCompleted = (function(){function _accept(onNext, onError, onCompleted){return onCompleted();}function _acceptObservable(observer){return observer.onCompleted();}function toString(){return 'OnCompleted()';}return function(){return new Notification('C', null, null, _accept, _acceptObservable, toString);};})();var Enumerator=Rx.internals.Enumerator = function(next){this._next = next;};Enumerator.prototype.next = function(){return this._next();};Enumerator.prototype[$iterator$] = function(){return this;};var Enumerable=Rx.internals.Enumerable = function(iterator){this._iterator = iterator;};Enumerable.prototype[$iterator$] = function(){return this._iterator();};Enumerable.prototype.concat = function(){var sources=this;return new AnonymousObservable(function(o){var e=sources[$iterator$]();var isDisposed, subscription=new SerialDisposable();var cancelable=immediateScheduler.scheduleRecursive(function(self){if(isDisposed){return;}try{var currentItem=e.next();}catch(ex) {return o.onError(ex);}if(currentItem.done){return o.onCompleted();}var currentValue=currentItem.value;isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));var d=new SingleAssignmentDisposable();subscription.setDisposable(d);d.setDisposable(currentValue.subscribe(function(x){o.onNext(x);}, function(err){o.onError(err);}, self));});return new CompositeDisposable(subscription, cancelable, disposableCreate(function(){isDisposed = true;}));});};Enumerable.prototype.catchError = function(){var sources=this;return new AnonymousObservable(function(o){var e=sources[$iterator$]();var isDisposed, subscription=new SerialDisposable();var cancelable=immediateScheduler.scheduleRecursiveWithState(null, function(lastException, self){if(isDisposed){return;}try{var currentItem=e.next();}catch(ex) {return observer.onError(ex);}if(currentItem.done){if(lastException !== null){o.onError(lastException);}else {o.onCompleted();}return;}var currentValue=currentItem.value;isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));var d=new SingleAssignmentDisposable();subscription.setDisposable(d);d.setDisposable(currentValue.subscribe(function(x){o.onNext(x);}, self, function(){o.onCompleted();}));});return new CompositeDisposable(subscription, cancelable, disposableCreate(function(){isDisposed = true;}));});};Enumerable.prototype.catchErrorWhen = function(notificationHandler){var sources=this;return new AnonymousObservable(function(o){var exceptions=new Subject(), notifier=new Subject(), handled=notificationHandler(exceptions), notificationDisposable=handled.subscribe(notifier);var e=sources[$iterator$]();var isDisposed, lastException, subscription=new SerialDisposable();var cancelable=immediateScheduler.scheduleRecursive(function(self){if(isDisposed){return;}try{var currentItem=e.next();}catch(ex) {return o.onError(ex);}if(currentItem.done){if(lastException){o.onError(lastException);}else {o.onCompleted();}return;}var currentValue=currentItem.value;isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));var outer=new SingleAssignmentDisposable();var inner=new SingleAssignmentDisposable();subscription.setDisposable(new CompositeDisposable(inner, outer));outer.setDisposable(currentValue.subscribe(function(x){o.onNext(x);}, function(exn){inner.setDisposable(notifier.subscribe(self, function(ex){o.onError(ex);}, function(){o.onCompleted();}));exceptions.onNext(exn);}, function(){o.onCompleted();}));});return new CompositeDisposable(notificationDisposable, subscription, cancelable, disposableCreate(function(){isDisposed = true;}));});};var enumerableRepeat=Enumerable.repeat = function(value, repeatCount){if(repeatCount == null){repeatCount = -1;}return new Enumerable(function(){var left=repeatCount;return new Enumerator(function(){if(left === 0){return doneEnumerator;}if(left > 0){left--;}return {done:false, value:value};});});};var enumerableOf=Enumerable.of = function(source, selector, thisArg){if(selector){var selectorFn=bindCallback(selector, thisArg, 3);}return new Enumerable(function(){var index=-1;return new Enumerator(function(){return ++index < source.length?{done:false, value:!selector?source[index]:selectorFn(source[index], index, source)}:doneEnumerator;});});};var Observer=Rx.Observer = function(){};Observer.prototype.toNotifier = function(){var observer=this;return function(n){return n.accept(observer);};};Observer.prototype.asObserver = function(){return new AnonymousObserver(this.onNext.bind(this), this.onError.bind(this), this.onCompleted.bind(this));};Observer.prototype.checked = function(){return new CheckedObserver(this);};var observerCreate=Observer.create = function(onNext, onError, onCompleted){onNext || (onNext = noop);onError || (onError = defaultError);onCompleted || (onCompleted = noop);return new AnonymousObserver(onNext, onError, onCompleted);};Observer.fromNotifier = function(handler, thisArg){return new AnonymousObserver(function(x){return handler.call(thisArg, notificationCreateOnNext(x));}, function(e){return handler.call(thisArg, notificationCreateOnError(e));}, function(){return handler.call(thisArg, notificationCreateOnCompleted());});};Observer.prototype.notifyOn = function(scheduler){return new ObserveOnObserver(scheduler, this);};Observer.prototype.makeSafe = function(disposable){return new AnonymousSafeObserver(this._onNext, this._onError, this._onCompleted, disposable);};var AbstractObserver=Rx.internals.AbstractObserver = (function(__super__){inherits(AbstractObserver, __super__);function AbstractObserver(){this.isStopped = false;__super__.call(this);}AbstractObserver.prototype.next = notImplemented;AbstractObserver.prototype.error = notImplemented;AbstractObserver.prototype.completed = notImplemented;AbstractObserver.prototype.onNext = function(value){if(!this.isStopped){this.next(value);}};AbstractObserver.prototype.onError = function(error){if(!this.isStopped){this.isStopped = true;this.error(error);}};AbstractObserver.prototype.onCompleted = function(){if(!this.isStopped){this.isStopped = true;this.completed();}};AbstractObserver.prototype.dispose = function(){this.isStopped = true;};AbstractObserver.prototype.fail = function(e){if(!this.isStopped){this.isStopped = true;this.error(e);return true;}return false;};return AbstractObserver;})(Observer);var AnonymousObserver=Rx.AnonymousObserver = (function(__super__){inherits(AnonymousObserver, __super__);function AnonymousObserver(onNext, onError, onCompleted){__super__.call(this);this._onNext = onNext;this._onError = onError;this._onCompleted = onCompleted;}AnonymousObserver.prototype.next = function(value){this._onNext(value);};AnonymousObserver.prototype.error = function(error){this._onError(error);};AnonymousObserver.prototype.completed = function(){this._onCompleted();};return AnonymousObserver;})(AbstractObserver);var CheckedObserver=(function(__super__){inherits(CheckedObserver, __super__);function CheckedObserver(observer){__super__.call(this);this._observer = observer;this._state = 0;}var CheckedObserverPrototype=CheckedObserver.prototype;CheckedObserverPrototype.onNext = function(value){this.checkAccess();var res=tryCatch(this._observer.onNext).call(this._observer, value);this._state = 0;res === errorObj && thrower(res.e);};CheckedObserverPrototype.onError = function(err){this.checkAccess();var res=tryCatch(this._observer.onError).call(this._observer, err);this._state = 2;res === errorObj && thrower(res.e);};CheckedObserverPrototype.onCompleted = function(){this.checkAccess();var res=tryCatch(this._observer.onCompleted).call(this._observer);this._state = 2;res === errorObj && thrower(res.e);};CheckedObserverPrototype.checkAccess = function(){if(this._state === 1){throw new Error('Re-entrancy detected');}if(this._state === 2){throw new Error('Observer completed');}if(this._state === 0){this._state = 1;}};return CheckedObserver;})(Observer);var ScheduledObserver=Rx.internals.ScheduledObserver = (function(__super__){inherits(ScheduledObserver, __super__);function ScheduledObserver(scheduler, observer){__super__.call(this);this.scheduler = scheduler;this.observer = observer;this.isAcquired = false;this.hasFaulted = false;this.queue = [];this.disposable = new SerialDisposable();}ScheduledObserver.prototype.next = function(value){var self=this;this.queue.push(function(){self.observer.onNext(value);});};ScheduledObserver.prototype.error = function(e){var self=this;this.queue.push(function(){self.observer.onError(e);});};ScheduledObserver.prototype.completed = function(){var self=this;this.queue.push(function(){self.observer.onCompleted();});};ScheduledObserver.prototype.ensureActive = function(){var isOwner=false, parent=this;if(!this.hasFaulted && this.queue.length > 0){isOwner = !this.isAcquired;this.isAcquired = true;}if(isOwner){this.disposable.setDisposable(this.scheduler.scheduleRecursive(function(self){var work;if(parent.queue.length > 0){work = parent.queue.shift();}else {parent.isAcquired = false;return;}try{work();}catch(ex) {parent.queue = [];parent.hasFaulted = true;throw ex;}self();}));}};ScheduledObserver.prototype.dispose = function(){__super__.prototype.dispose.call(this);this.disposable.dispose();};return ScheduledObserver;})(AbstractObserver);var ObserveOnObserver=(function(__super__){inherits(ObserveOnObserver, __super__);function ObserveOnObserver(scheduler, observer, cancel){__super__.call(this, scheduler, observer);this._cancel = cancel;}ObserveOnObserver.prototype.next = function(value){__super__.prototype.next.call(this, value);this.ensureActive();};ObserveOnObserver.prototype.error = function(e){__super__.prototype.error.call(this, e);this.ensureActive();};ObserveOnObserver.prototype.completed = function(){__super__.prototype.completed.call(this);this.ensureActive();};ObserveOnObserver.prototype.dispose = function(){__super__.prototype.dispose.call(this);this._cancel && this._cancel.dispose();this._cancel = null;};return ObserveOnObserver;})(ScheduledObserver);var observableProto;var Observable=Rx.Observable = (function(){function Observable(subscribe){if(Rx.config.longStackSupport && hasStacks){try{throw new Error();}catch(e) {this.stack = e.stack.substring(e.stack.indexOf('\n') + 1);}var self=this;this._subscribe = function(observer){var oldOnError=observer.onError.bind(observer);observer.onError = function(err){makeStackTraceLong(err, self);oldOnError(err);};return subscribe.call(self, observer);};}else {this._subscribe = subscribe;}}observableProto = Observable.prototype;observableProto.subscribe = observableProto.forEach = function(observerOrOnNext, onError, onCompleted){return this._subscribe(typeof observerOrOnNext === 'object'?observerOrOnNext:observerCreate(observerOrOnNext, onError, onCompleted));};observableProto.subscribeOnNext = function(onNext, thisArg){return this._subscribe(observerCreate(typeof thisArg !== 'undefined'?function(x){onNext.call(thisArg, x);}:onNext));};observableProto.subscribeOnError = function(onError, thisArg){return this._subscribe(observerCreate(null, typeof thisArg !== 'undefined'?function(e){onError.call(thisArg, e);}:onError));};observableProto.subscribeOnCompleted = function(onCompleted, thisArg){return this._subscribe(observerCreate(null, null, typeof thisArg !== 'undefined'?function(){onCompleted.call(thisArg);}:onCompleted));};return Observable;})();var ObservableBase=Rx.ObservableBase = (function(__super__){inherits(ObservableBase, __super__);function fixSubscriber(subscriber){return subscriber && isFunction(subscriber.dispose)?subscriber:isFunction(subscriber)?disposableCreate(subscriber):disposableEmpty;}function setDisposable(s, state){var ado=state[0], self=state[1];var sub=tryCatch(self.subscribeCore).call(self, ado);if(sub === errorObj){if(!ado.fail(errorObj.e)){return thrower(errorObj.e);}}ado.setDisposable(fixSubscriber(sub));}function subscribe(observer){var ado=new AutoDetachObserver(observer), state=[ado, this];if(currentThreadScheduler.scheduleRequired()){currentThreadScheduler.scheduleWithState(state, setDisposable);}else {setDisposable(null, state);}return ado;}function ObservableBase(){__super__.call(this, subscribe);}ObservableBase.prototype.subscribeCore = notImplemented;return ObservableBase;})(Observable);observableProto.observeOn = function(scheduler){var source=this;return new AnonymousObservable(function(observer){return source.subscribe(new ObserveOnObserver(scheduler, observer));}, source);};observableProto.subscribeOn = function(scheduler){var source=this;return new AnonymousObservable(function(observer){var m=new SingleAssignmentDisposable(), d=new SerialDisposable();d.setDisposable(m);m.setDisposable(scheduler.schedule(function(){d.setDisposable(new ScheduledDisposable(scheduler, source.subscribe(observer)));}));return d;}, source);};var observableFromPromise=Observable.fromPromise = function(promise){return observableDefer(function(){var subject=new Rx.AsyncSubject();promise.then(function(value){subject.onNext(value);subject.onCompleted();}, subject.onError.bind(subject));return subject;});};observableProto.toPromise = function(promiseCtor){promiseCtor || (promiseCtor = Rx.config.Promise);if(!promiseCtor){throw new NotSupportedError('Promise type not provided nor in Rx.config.Promise');}var source=this;return new promiseCtor(function(resolve, reject){var value, hasValue=false;source.subscribe(function(v){value = v;hasValue = true;}, reject, function(){hasValue && resolve(value);});});};var ToArrayObservable=(function(__super__){inherits(ToArrayObservable, __super__);function ToArrayObservable(source){this.source = source;__super__.call(this);}ToArrayObservable.prototype.subscribeCore = function(observer){return this.source.subscribe(new ToArrayObserver(observer));};return ToArrayObservable;})(ObservableBase);function ToArrayObserver(observer){this.observer = observer;this.a = [];this.isStopped = false;}ToArrayObserver.prototype.onNext = function(x){if(!this.isStopped){this.a.push(x);}};ToArrayObserver.prototype.onError = function(e){if(!this.isStopped){this.isStopped = true;this.observer.onError(e);}};ToArrayObserver.prototype.onCompleted = function(){if(!this.isStopped){this.isStopped = true;this.observer.onNext(this.a);this.observer.onCompleted();}};ToArrayObserver.prototype.dispose = function(){this.isStopped = true;};ToArrayObserver.prototype.fail = function(e){if(!this.isStopped){this.isStopped = true;this.observer.onError(e);return true;}return false;};observableProto.toArray = function(){return new ToArrayObservable(this);};Observable.create = Observable.createWithDisposable = function(subscribe, parent){return new AnonymousObservable(subscribe, parent);};var observableDefer=Observable.defer = function(observableFactory){return new AnonymousObservable(function(observer){var result;try{result = observableFactory();}catch(e) {return observableThrow(e).subscribe(observer);}isPromise(result) && (result = observableFromPromise(result));return result.subscribe(observer);});};var EmptyObservable=(function(__super__){inherits(EmptyObservable, __super__);function EmptyObservable(scheduler){this.scheduler = scheduler;__super__.call(this);}EmptyObservable.prototype.subscribeCore = function(observer){var sink=new EmptySink(observer, this);return sink.run();};function EmptySink(observer, parent){this.observer = observer;this.parent = parent;}function scheduleItem(s, state){state.onCompleted();}EmptySink.prototype.run = function(){return this.parent.scheduler.scheduleWithState(this.observer, scheduleItem);};return EmptyObservable;})(ObservableBase);var observableEmpty=Observable.empty = function(scheduler){isScheduler(scheduler) || (scheduler = immediateScheduler);return new EmptyObservable(scheduler);};var FromObservable=(function(__super__){inherits(FromObservable, __super__);function FromObservable(iterable, mapper, scheduler){this.iterable = iterable;this.mapper = mapper;this.scheduler = scheduler;__super__.call(this);}FromObservable.prototype.subscribeCore = function(observer){var sink=new FromSink(observer, this);return sink.run();};return FromObservable;})(ObservableBase);var FromSink=(function(){function FromSink(observer, parent){this.observer = observer;this.parent = parent;}FromSink.prototype.run = function(){var list=Object(this.parent.iterable), it=getIterable(list), observer=this.observer, mapper=this.parent.mapper;function loopRecursive(i, recurse){try{var next=it.next();}catch(e) {return observer.onError(e);}if(next.done){return observer.onCompleted();}var result=next.value;if(mapper){try{result = mapper(result, i);}catch(e) {return observer.onError(e);}}observer.onNext(result);recurse(i + 1);}return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);};return FromSink;})();var maxSafeInteger=Math.pow(2, 53) - 1;function StringIterable(str){this._s = s;}StringIterable.prototype[$iterator$] = function(){return new StringIterator(this._s);};function StringIterator(str){this._s = s;this._l = s.length;this._i = 0;}StringIterator.prototype[$iterator$] = function(){return this;};StringIterator.prototype.next = function(){return this._i < this._l?{done:false, value:this._s.charAt(this._i++)}:doneEnumerator;};function ArrayIterable(a){this._a = a;}ArrayIterable.prototype[$iterator$] = function(){return new ArrayIterator(this._a);};function ArrayIterator(a){this._a = a;this._l = toLength(a);this._i = 0;}ArrayIterator.prototype[$iterator$] = function(){return this;};ArrayIterator.prototype.next = function(){return this._i < this._l?{done:false, value:this._a[this._i++]}:doneEnumerator;};function numberIsFinite(value){return typeof value === 'number' && root.isFinite(value);}function isNan(n){return n !== n;}function getIterable(o){var i=o[$iterator$], it;if(!i && typeof o === 'string'){it = new StringIterable(o);return it[$iterator$]();}if(!i && o.length !== undefined){it = new ArrayIterable(o);return it[$iterator$]();}if(!i){throw new TypeError('Object is not iterable');}return o[$iterator$]();}function sign(value){var number=+value;if(number === 0){return number;}if(isNaN(number)){return number;}return number < 0?-1:1;}function toLength(o){var len=+o.length;if(isNaN(len)){return 0;}if(len === 0 || !numberIsFinite(len)){return len;}len = sign(len) * Math.floor(Math.abs(len));if(len <= 0){return 0;}if(len > maxSafeInteger){return maxSafeInteger;}return len;}var observableFrom=Observable.from = function(iterable, mapFn, thisArg, scheduler){if(iterable == null){throw new Error('iterable cannot be null.');}if(mapFn && !isFunction(mapFn)){throw new Error('mapFn when provided must be a function');}if(mapFn){var mapper=bindCallback(mapFn, thisArg, 2);}isScheduler(scheduler) || (scheduler = currentThreadScheduler);return new FromObservable(iterable, mapper, scheduler);};var FromArrayObservable=(function(__super__){inherits(FromArrayObservable, __super__);function FromArrayObservable(args, scheduler){this.args = args;this.scheduler = scheduler;__super__.call(this);}FromArrayObservable.prototype.subscribeCore = function(observer){var sink=new FromArraySink(observer, this);return sink.run();};return FromArrayObservable;})(ObservableBase);function FromArraySink(observer, parent){this.observer = observer;this.parent = parent;}FromArraySink.prototype.run = function(){var observer=this.observer, args=this.parent.args, len=args.length;function loopRecursive(i, recurse){if(i < len){observer.onNext(args[i]);recurse(i + 1);}else {observer.onCompleted();}}return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);};var observableFromArray=Observable.fromArray = function(array, scheduler){isScheduler(scheduler) || (scheduler = currentThreadScheduler);return new FromArrayObservable(array, scheduler);};Observable.generate = function(initialState, condition, iterate, resultSelector, scheduler){isScheduler(scheduler) || (scheduler = currentThreadScheduler);return new AnonymousObservable(function(o){var first=true;return scheduler.scheduleRecursiveWithState(initialState, function(state, self){var hasResult, result;try{if(first){first = false;}else {state = iterate(state);}hasResult = condition(state);hasResult && (result = resultSelector(state));}catch(e) {return o.onError(e);}if(hasResult){o.onNext(result);self(state);}else {o.onCompleted();}});});};function observableOf(scheduler, array){isScheduler(scheduler) || (scheduler = currentThreadScheduler);return new FromArrayObservable(array, scheduler);}Observable.of = function(){var len=arguments.length, args=new Array(len);for(var i=0; i < len; i++) {args[i] = arguments[i];}return new FromArrayObservable(args, currentThreadScheduler);};Observable.ofWithScheduler = function(scheduler){var len=arguments.length, args=new Array(len - 1);for(var i=1; i < len; i++) {args[i - 1] = arguments[i];}return new FromArrayObservable(args, scheduler);};Observable.ofArrayChanges = function(array){if(!Array.isArray(array)){throw new TypeError('Array.observe only accepts arrays.');}if(typeof Array.observe !== 'function' && typeof Array.unobserve !== 'function'){throw new TypeError('Array.observe is not supported on your platform');}return new AnonymousObservable(function(observer){function observerFn(changes){for(var i=0, len=changes.length; i < len; i++) {observer.onNext(changes[i]);}}Array.observe(array, observerFn);return function(){Array.unobserve(array, observerFn);};});};Observable.ofObjectChanges = function(obj){if(obj == null){throw new TypeError('object must not be null or undefined.');}if(typeof Object.observe !== 'function' && typeof Object.unobserve !== 'function'){throw new TypeError('Array.observe is not supported on your platform');}return new AnonymousObservable(function(observer){function observerFn(changes){for(var i=0, len=changes.length; i < len; i++) {observer.onNext(changes[i]);}}Object.observe(obj, observerFn);return function(){Object.unobserve(obj, observerFn);};});};var NeverObservable=(function(__super__){inherits(NeverObservable, __super__);function NeverObservable(){__super__.call(this);}NeverObservable.prototype.subscribeCore = function(observer){return disposableEmpty;};return NeverObservable;})(ObservableBase);var observableNever=Observable.never = function(){return new NeverObservable();};var PairsObservable=(function(__super__){inherits(PairsObservable, __super__);function PairsObservable(obj, scheduler){this.obj = obj;this.keys = Object.keys(obj);this.scheduler = scheduler;__super__.call(this);}PairsObservable.prototype.subscribeCore = function(observer){var sink=new PairsSink(observer, this);return sink.run();};return PairsObservable;})(ObservableBase);function PairsSink(observer, parent){this.observer = observer;this.parent = parent;}PairsSink.prototype.run = function(){var observer=this.observer, obj=this.parent.obj, keys=this.parent.keys, len=keys.length;function loopRecursive(i, recurse){if(i < len){var key=keys[i];observer.onNext([key, obj[key]]);recurse(i + 1);}else {observer.onCompleted();}}return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);};Observable.pairs = function(obj, scheduler){scheduler || (scheduler = currentThreadScheduler);return new PairsObservable(obj, scheduler);};var RangeObservable=(function(__super__){inherits(RangeObservable, __super__);function RangeObservable(start, count, scheduler){this.start = start;this.count = count;this.scheduler = scheduler;__super__.call(this);}RangeObservable.prototype.subscribeCore = function(observer){var sink=new RangeSink(observer, this);return sink.run();};return RangeObservable;})(ObservableBase);var RangeSink=(function(){function RangeSink(observer, parent){this.observer = observer;this.parent = parent;}RangeSink.prototype.run = function(){var start=this.parent.start, count=this.parent.count, observer=this.observer;function loopRecursive(i, recurse){if(i < count){observer.onNext(start + i);recurse(i + 1);}else {observer.onCompleted();}}return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);};return RangeSink;})();Observable.range = function(start, count, scheduler){isScheduler(scheduler) || (scheduler = currentThreadScheduler);return new RangeObservable(start, count, scheduler);};var RepeatObservable=(function(__super__){inherits(RepeatObservable, __super__);function RepeatObservable(value, repeatCount, scheduler){this.value = value;this.repeatCount = repeatCount == null?-1:repeatCount;this.scheduler = scheduler;__super__.call(this);}RepeatObservable.prototype.subscribeCore = function(observer){var sink=new RepeatSink(observer, this);return sink.run();};return RepeatObservable;})(ObservableBase);function RepeatSink(observer, parent){this.observer = observer;this.parent = parent;}RepeatSink.prototype.run = function(){var observer=this.observer, value=this.parent.value;function loopRecursive(i, recurse){if(i === -1 || i > 0){observer.onNext(value);i > 0 && i--;}if(i === 0){return observer.onCompleted();}recurse(i);}return this.parent.scheduler.scheduleRecursiveWithState(this.parent.repeatCount, loopRecursive);};Observable.repeat = function(value, repeatCount, scheduler){isScheduler(scheduler) || (scheduler = currentThreadScheduler);return new RepeatObservable(value, repeatCount, scheduler);};var JustObservable=(function(__super__){inherits(JustObservable, __super__);function JustObservable(value, scheduler){this.value = value;this.scheduler = scheduler;__super__.call(this);}JustObservable.prototype.subscribeCore = function(observer){var sink=new JustSink(observer, this);return sink.run();};function JustSink(observer, parent){this.observer = observer;this.parent = parent;}function scheduleItem(s, state){var value=state[0], observer=state[1];observer.onNext(value);observer.onCompleted();}JustSink.prototype.run = function(){return this.parent.scheduler.scheduleWithState([this.parent.value, this.observer], scheduleItem);};return JustObservable;})(ObservableBase);var observableReturn=Observable['return'] = Observable.just = Observable.returnValue = function(value, scheduler){isScheduler(scheduler) || (scheduler = immediateScheduler);return new JustObservable(value, scheduler);};var ThrowObservable=(function(__super__){inherits(ThrowObservable, __super__);function ThrowObservable(error, scheduler){this.error = error;this.scheduler = scheduler;__super__.call(this);}ThrowObservable.prototype.subscribeCore = function(observer){var sink=new ThrowSink(observer, this);return sink.run();};function ThrowSink(observer, parent){this.observer = observer;this.parent = parent;}function scheduleItem(s, state){var error=state[0], observer=state[1];observer.onError(error);}ThrowSink.prototype.run = function(){return this.parent.scheduler.scheduleWithState([this.parent.error, this.observer], scheduleItem);};return ThrowObservable;})(ObservableBase);var observableThrow=Observable['throw'] = Observable.throwError = Observable.throwException = function(error, scheduler){isScheduler(scheduler) || (scheduler = immediateScheduler);return new ThrowObservable(error, scheduler);};Observable.using = function(resourceFactory, observableFactory){return new AnonymousObservable(function(observer){var disposable=disposableEmpty, resource, source;try{resource = resourceFactory();resource && (disposable = resource);source = observableFactory(resource);}catch(exception) {return new CompositeDisposable(observableThrow(exception).subscribe(observer), disposable);}return new CompositeDisposable(source.subscribe(observer), disposable);});};observableProto.amb = function(rightSource){var leftSource=this;return new AnonymousObservable(function(observer){var choice, leftChoice='L', rightChoice='R', leftSubscription=new SingleAssignmentDisposable(), rightSubscription=new SingleAssignmentDisposable();isPromise(rightSource) && (rightSource = observableFromPromise(rightSource));function choiceL(){if(!choice){choice = leftChoice;rightSubscription.dispose();}}function choiceR(){if(!choice){choice = rightChoice;leftSubscription.dispose();}}leftSubscription.setDisposable(leftSource.subscribe(function(left){choiceL();if(choice === leftChoice){observer.onNext(left);}}, function(err){choiceL();if(choice === leftChoice){observer.onError(err);}}, function(){choiceL();if(choice === leftChoice){observer.onCompleted();}}));rightSubscription.setDisposable(rightSource.subscribe(function(right){choiceR();if(choice === rightChoice){observer.onNext(right);}}, function(err){choiceR();if(choice === rightChoice){observer.onError(err);}}, function(){choiceR();if(choice === rightChoice){observer.onCompleted();}}));return new CompositeDisposable(leftSubscription, rightSubscription);});};Observable.amb = function(){var acc=observableNever(), items=[];if(Array.isArray(arguments[0])){items = arguments[0];}else {for(var i=0, len=arguments.length; i < len; i++) {items.push(arguments[i]);}}function func(previous, current){return previous.amb(current);}for(var i=0, len=items.length; i < len; i++) {acc = func(acc, items[i]);}return acc;};function observableCatchHandler(source, handler){return new AnonymousObservable(function(o){var d1=new SingleAssignmentDisposable(), subscription=new SerialDisposable();subscription.setDisposable(d1);d1.setDisposable(source.subscribe(function(x){o.onNext(x);}, function(e){try{var result=handler(e);}catch(ex) {return o.onError(ex);}isPromise(result) && (result = observableFromPromise(result));var d=new SingleAssignmentDisposable();subscription.setDisposable(d);d.setDisposable(result.subscribe(o));}, function(x){o.onCompleted(x);}));return subscription;}, source);}observableProto['catch'] = observableProto.catchError = observableProto.catchException = function(handlerOrSecond){return typeof handlerOrSecond === 'function'?observableCatchHandler(this, handlerOrSecond):observableCatch([this, handlerOrSecond]);};var observableCatch=Observable.catchError = Observable['catch'] = Observable.catchException = function(){var items=[];if(Array.isArray(arguments[0])){items = arguments[0];}else {for(var i=0, len=arguments.length; i < len; i++) {items.push(arguments[i]);}}return enumerableOf(items).catchError();};observableProto.combineLatest = function(){var len=arguments.length, args=new Array(len);for(var i=0; i < len; i++) {args[i] = arguments[i];}if(Array.isArray(args[0])){args[0].unshift(this);}else {args.unshift(this);}return combineLatest.apply(this, args);};var combineLatest=Observable.combineLatest = function(){var len=arguments.length, args=new Array(len);for(var i=0; i < len; i++) {args[i] = arguments[i];}var resultSelector=args.pop();Array.isArray(args[0]) && (args = args[0]);return new AnonymousObservable(function(o){var n=args.length, falseFactory=function falseFactory(){return false;}, hasValue=arrayInitialize(n, falseFactory), hasValueAll=false, isDone=arrayInitialize(n, falseFactory), values=new Array(n);function next(i){hasValue[i] = true;if(hasValueAll || (hasValueAll = hasValue.every(identity))){try{var res=resultSelector.apply(null, values);}catch(e) {return o.onError(e);}o.onNext(res);}else if(isDone.filter(function(x, j){return j !== i;}).every(identity)){o.onCompleted();}}function done(i){isDone[i] = true;isDone.every(identity) && o.onCompleted();}var subscriptions=new Array(n);for(var idx=0; idx < n; idx++) {(function(i){var source=args[i], sad=new SingleAssignmentDisposable();isPromise(source) && (source = observableFromPromise(source));sad.setDisposable(source.subscribe(function(x){values[i] = x;next(i);}, function(e){o.onError(e);}, function(){done(i);}));subscriptions[i] = sad;})(idx);}return new CompositeDisposable(subscriptions);}, this);};observableProto.concat = function(){for(var args=[], i=0, len=arguments.length; i < len; i++) {args.push(arguments[i]);}args.unshift(this);return observableConcat.apply(null, args);};var observableConcat=Observable.concat = function(){var args;if(Array.isArray(arguments[0])){args = arguments[0];}else {args = new Array(arguments.length);for(var i=0, len=arguments.length; i < len; i++) {args[i] = arguments[i];}}return enumerableOf(args).concat();};observableProto.concatAll = observableProto.concatObservable = function(){return this.merge(1);};var MergeObservable=(function(__super__){inherits(MergeObservable, __super__);function MergeObservable(source, maxConcurrent){this.source = source;this.maxConcurrent = maxConcurrent;__super__.call(this);}MergeObservable.prototype.subscribeCore = function(observer){var g=new CompositeDisposable();g.add(this.source.subscribe(new MergeObserver(observer, this.maxConcurrent, g)));return g;};return MergeObservable;})(ObservableBase);var MergeObserver=(function(){function MergeObserver(o, max, g){this.o = o;this.max = max;this.g = g;this.done = false;this.q = [];this.activeCount = 0;this.isStopped = false;}MergeObserver.prototype.handleSubscribe = function(xs){var sad=new SingleAssignmentDisposable();this.g.add(sad);isPromise(xs) && (xs = observableFromPromise(xs));sad.setDisposable(xs.subscribe(new InnerObserver(this, sad)));};MergeObserver.prototype.onNext = function(innerSource){if(this.isStopped){return;}if(this.activeCount < this.max){this.activeCount++;this.handleSubscribe(innerSource);}else {this.q.push(innerSource);}};MergeObserver.prototype.onError = function(e){if(!this.isStopped){this.isStopped = true;this.o.onError(e);}};MergeObserver.prototype.onCompleted = function(){if(!this.isStopped){this.isStopped = true;this.done = true;this.activeCount === 0 && this.o.onCompleted();}};MergeObserver.prototype.dispose = function(){this.isStopped = true;};MergeObserver.prototype.fail = function(e){if(!this.isStopped){this.isStopped = true;this.o.onError(e);return true;}return false;};function InnerObserver(parent, sad){this.parent = parent;this.sad = sad;this.isStopped = false;}InnerObserver.prototype.onNext = function(x){if(!this.isStopped){this.parent.o.onNext(x);}};InnerObserver.prototype.onError = function(e){if(!this.isStopped){this.isStopped = true;this.parent.o.onError(e);}};InnerObserver.prototype.onCompleted = function(){if(!this.isStopped){this.isStopped = true;var parent=this.parent;parent.g.remove(this.sad);if(parent.q.length > 0){parent.handleSubscribe(parent.q.shift());}else {parent.activeCount--;parent.done && parent.activeCount === 0 && parent.o.onCompleted();}}};InnerObserver.prototype.dispose = function(){this.isStopped = true;};InnerObserver.prototype.fail = function(e){if(!this.isStopped){this.isStopped = true;this.parent.o.onError(e);return true;}return false;};return MergeObserver;})();observableProto.merge = function(maxConcurrentOrOther){return typeof maxConcurrentOrOther !== 'number'?observableMerge(this, maxConcurrentOrOther):new MergeObservable(this, maxConcurrentOrOther);};var observableMerge=Observable.merge = function(){var scheduler, sources=[], i, len=arguments.length;if(!arguments[0]){scheduler = immediateScheduler;for(i = 1; i < len; i++) {sources.push(arguments[i]);}}else if(isScheduler(arguments[0])){scheduler = arguments[0];for(i = 1; i < len; i++) {sources.push(arguments[i]);}}else {scheduler = immediateScheduler;for(i = 0; i < len; i++) {sources.push(arguments[i]);}}if(Array.isArray(sources[0])){sources = sources[0];}return observableOf(scheduler, sources).mergeAll();};var MergeAllObservable=(function(__super__){inherits(MergeAllObservable, __super__);function MergeAllObservable(source){this.source = source;__super__.call(this);}MergeAllObservable.prototype.subscribeCore = function(observer){var g=new CompositeDisposable(), m=new SingleAssignmentDisposable();g.add(m);m.setDisposable(this.source.subscribe(new MergeAllObserver(observer, g)));return g;};return MergeAllObservable;})(ObservableBase);var MergeAllObserver=(function(){function MergeAllObserver(o, g){this.o = o;this.g = g;this.isStopped = false;this.done = false;}MergeAllObserver.prototype.onNext = function(innerSource){if(this.isStopped){return;}var sad=new SingleAssignmentDisposable();this.g.add(sad);isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));sad.setDisposable(innerSource.subscribe(new InnerObserver(this, this.g, sad)));};MergeAllObserver.prototype.onError = function(e){if(!this.isStopped){this.isStopped = true;this.o.onError(e);}};MergeAllObserver.prototype.onCompleted = function(){if(!this.isStopped){this.isStopped = true;this.done = true;this.g.length === 1 && this.o.onCompleted();}};MergeAllObserver.prototype.dispose = function(){this.isStopped = true;};MergeAllObserver.prototype.fail = function(e){if(!this.isStopped){this.isStopped = true;this.o.onError(e);return true;}return false;};function InnerObserver(parent, g, sad){this.parent = parent;this.g = g;this.sad = sad;this.isStopped = false;}InnerObserver.prototype.onNext = function(x){if(!this.isStopped){this.parent.o.onNext(x);}};InnerObserver.prototype.onError = function(e){if(!this.isStopped){this.isStopped = true;this.parent.o.onError(e);}};InnerObserver.prototype.onCompleted = function(){if(!this.isStopped){var parent=this.parent;this.isStopped = true;parent.g.remove(this.sad);parent.done && parent.g.length === 1 && parent.o.onCompleted();}};InnerObserver.prototype.dispose = function(){this.isStopped = true;};InnerObserver.prototype.fail = function(e){if(!this.isStopped){this.isStopped = true;this.parent.o.onError(e);return true;}return false;};return MergeAllObserver;})();observableProto.mergeAll = observableProto.mergeObservable = function(){return new MergeAllObservable(this);};var CompositeError=Rx.CompositeError = function(errors){this.name = 'NotImplementedError';this.innerErrors = errors;this.message = 'This contains multiple errors. Check the innerErrors';Error.call(this);};CompositeError.prototype = Error.prototype;Observable.mergeDelayError = function(){var args;if(Array.isArray(arguments[0])){args = arguments[0];}else {var len=arguments.length;args = new Array(len);for(var i=0; i < len; i++) {args[i] = arguments[i];}}var source=observableOf(null, args);return new AnonymousObservable(function(o){var group=new CompositeDisposable(), m=new SingleAssignmentDisposable(), isStopped=false, errors=[];function setCompletion(){if(errors.length === 0){o.onCompleted();}else if(errors.length === 1){o.onError(errors[0]);}else {o.onError(new CompositeError(errors));}}group.add(m);m.setDisposable(source.subscribe(function(innerSource){var innerSubscription=new SingleAssignmentDisposable();group.add(innerSubscription);isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));innerSubscription.setDisposable(innerSource.subscribe(function(x){o.onNext(x);}, function(e){errors.push(e);group.remove(innerSubscription);isStopped && group.length === 1 && setCompletion();}, function(){group.remove(innerSubscription);isStopped && group.length === 1 && setCompletion();}));}, function(e){errors.push(e);isStopped = true;group.length === 1 && setCompletion();}, function(){isStopped = true;group.length === 1 && setCompletion();}));return group;});};observableProto.onErrorResumeNext = function(second){if(!second){throw new Error('Second observable is required');}return onErrorResumeNext([this, second]);};var onErrorResumeNext=Observable.onErrorResumeNext = function(){var sources=[];if(Array.isArray(arguments[0])){sources = arguments[0];}else {for(var i=0, len=arguments.length; i < len; i++) {sources.push(arguments[i]);}}return new AnonymousObservable(function(observer){var pos=0, subscription=new SerialDisposable(), cancelable=immediateScheduler.scheduleRecursive(function(self){var current, d;if(pos < sources.length){current = sources[pos++];isPromise(current) && (current = observableFromPromise(current));d = new SingleAssignmentDisposable();subscription.setDisposable(d);d.setDisposable(current.subscribe(observer.onNext.bind(observer), self, self));}else {observer.onCompleted();}});return new CompositeDisposable(subscription, cancelable);});};observableProto.skipUntil = function(other){var source=this;return new AnonymousObservable(function(o){var isOpen=false;var disposables=new CompositeDisposable(source.subscribe(function(left){isOpen && o.onNext(left);}, function(e){o.onError(e);}, function(){isOpen && o.onCompleted();}));isPromise(other) && (other = observableFromPromise(other));var rightSubscription=new SingleAssignmentDisposable();disposables.add(rightSubscription);rightSubscription.setDisposable(other.subscribe(function(){isOpen = true;rightSubscription.dispose();}, function(e){o.onError(e);}, function(){rightSubscription.dispose();}));return disposables;}, source);};observableProto['switch'] = observableProto.switchLatest = function(){var sources=this;return new AnonymousObservable(function(observer){var hasLatest=false, innerSubscription=new SerialDisposable(), isStopped=false, latest=0, subscription=sources.subscribe(function(innerSource){var d=new SingleAssignmentDisposable(), id=++latest;hasLatest = true;innerSubscription.setDisposable(d);isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));d.setDisposable(innerSource.subscribe(function(x){latest === id && observer.onNext(x);}, function(e){latest === id && observer.onError(e);}, function(){if(latest === id){hasLatest = false;isStopped && observer.onCompleted();}}));}, function(e){observer.onError(e);}, function(){isStopped = true;!hasLatest && observer.onCompleted();});return new CompositeDisposable(subscription, innerSubscription);}, sources);};observableProto.takeUntil = function(other){var source=this;return new AnonymousObservable(function(o){isPromise(other) && (other = observableFromPromise(other));return new CompositeDisposable(source.subscribe(o), other.subscribe(function(){o.onCompleted();}, function(e){o.onError(e);}, noop));}, source);};observableProto.withLatestFrom = function(){var len=arguments.length, args=new Array(len);for(var i=0; i < len; i++) {args[i] = arguments[i];}var resultSelector=args.pop(), source=this;if(typeof source === 'undefined'){throw new Error('Source observable not found for withLatestFrom().');}if(typeof resultSelector !== 'function'){throw new Error('withLatestFrom() expects a resultSelector function.');}if(Array.isArray(args[0])){args = args[0];}return new AnonymousObservable(function(observer){var falseFactory=function falseFactory(){return false;}, n=args.length, hasValue=arrayInitialize(n, falseFactory), hasValueAll=false, values=new Array(n);var subscriptions=new Array(n + 1);for(var idx=0; idx < n; idx++) {(function(i){var other=args[i], sad=new SingleAssignmentDisposable();isPromise(other) && (other = observableFromPromise(other));sad.setDisposable(other.subscribe(function(x){values[i] = x;hasValue[i] = true;hasValueAll = hasValue.every(identity);}, observer.onError.bind(observer), function(){}));subscriptions[i] = sad;})(idx);}var sad=new SingleAssignmentDisposable();sad.setDisposable(source.subscribe(function(x){var res;var allValues=[x].concat(values);if(!hasValueAll)return;try{res = resultSelector.apply(null, allValues);}catch(ex) {observer.onError(ex);return;}observer.onNext(res);}, observer.onError.bind(observer), function(){observer.onCompleted();}));subscriptions[n] = sad;return new CompositeDisposable(subscriptions);}, this);};function zipArray(second, resultSelector){var first=this;return new AnonymousObservable(function(observer){var index=0, len=second.length;return first.subscribe(function(left){if(index < len){var right=second[index++], result;try{result = resultSelector(left, right);}catch(e) {return observer.onError(e);}observer.onNext(result);}else {observer.onCompleted();}}, function(e){observer.onError(e);}, function(){observer.onCompleted();});}, first);}function falseFactory(){return false;}function emptyArrayFactory(){return [];}observableProto.zip = function(){if(Array.isArray(arguments[0])){return zipArray.apply(this, arguments);}var len=arguments.length, args=new Array(len);for(var i=0; i < len; i++) {args[i] = arguments[i];}var parent=this, resultSelector=args.pop();args.unshift(parent);return new AnonymousObservable(function(observer){var n=args.length, queues=arrayInitialize(n, emptyArrayFactory), isDone=arrayInitialize(n, falseFactory);function next(i){var res, queuedValues;if(queues.every(function(x){return x.length > 0;})){try{queuedValues = queues.map(function(x){return x.shift();});res = resultSelector.apply(parent, queuedValues);}catch(ex) {observer.onError(ex);return;}observer.onNext(res);}else if(isDone.filter(function(x, j){return j !== i;}).every(identity)){observer.onCompleted();}};function done(i){isDone[i] = true;if(isDone.every(function(x){return x;})){observer.onCompleted();}}var subscriptions=new Array(n);for(var idx=0; idx < n; idx++) {(function(i){var source=args[i], sad=new SingleAssignmentDisposable();isPromise(source) && (source = observableFromPromise(source));sad.setDisposable(source.subscribe(function(x){queues[i].push(x);next(i);}, function(e){observer.onError(e);}, function(){done(i);}));subscriptions[i] = sad;})(idx);}return new CompositeDisposable(subscriptions);}, parent);};Observable.zip = function(){var len=arguments.length, args=new Array(len);for(var i=0; i < len; i++) {args[i] = arguments[i];}var first=args.shift();return first.zip.apply(first, args);};Observable.zipArray = function(){var sources;if(Array.isArray(arguments[0])){sources = arguments[0];}else {var len=arguments.length;sources = new Array(len);for(var i=0; i < len; i++) {sources[i] = arguments[i];}}return new AnonymousObservable(function(observer){var n=sources.length, queues=arrayInitialize(n, function(){return [];}), isDone=arrayInitialize(n, function(){return false;});function next(i){if(queues.every(function(x){return x.length > 0;})){var res=queues.map(function(x){return x.shift();});observer.onNext(res);}else if(isDone.filter(function(x, j){return j !== i;}).every(identity)){observer.onCompleted();return;}};function done(i){isDone[i] = true;if(isDone.every(identity)){observer.onCompleted();return;}}var subscriptions=new Array(n);for(var idx=0; idx < n; idx++) {(function(i){subscriptions[i] = new SingleAssignmentDisposable();subscriptions[i].setDisposable(sources[i].subscribe(function(x){queues[i].push(x);next(i);}, function(e){observer.onError(e);}, function(){done(i);}));})(idx);}return new CompositeDisposable(subscriptions);});};observableProto.asObservable = function(){var source=this;return new AnonymousObservable(function(o){return source.subscribe(o);}, this);};observableProto.bufferWithCount = function(count, skip){if(typeof skip !== 'number'){skip = count;}return this.windowWithCount(count, skip).selectMany(function(x){return x.toArray();}).where(function(x){return x.length > 0;});};observableProto.dematerialize = function(){var source=this;return new AnonymousObservable(function(o){return source.subscribe(function(x){return x.accept(o);}, function(e){o.onError(e);}, function(){o.onCompleted();});}, this);};observableProto.distinctUntilChanged = function(keySelector, comparer){var source=this;comparer || (comparer = defaultComparer);return new AnonymousObservable(function(o){var hasCurrentKey=false, currentKey;return source.subscribe(function(value){var key=value;if(keySelector){try{key = keySelector(value);}catch(e) {o.onError(e);return;}}if(hasCurrentKey){try{var comparerEquals=comparer(currentKey, key);}catch(e) {o.onError(e);return;}}if(!hasCurrentKey || !comparerEquals){hasCurrentKey = true;currentKey = key;o.onNext(value);}}, function(e){o.onError(e);}, function(){o.onCompleted();});}, this);};observableProto['do'] = observableProto.tap = observableProto.doAction = function(observerOrOnNext, onError, onCompleted){var source=this;return new AnonymousObservable(function(observer){var tapObserver=!observerOrOnNext || isFunction(observerOrOnNext)?observerCreate(observerOrOnNext || noop, onError || noop, onCompleted || noop):observerOrOnNext;return source.subscribe(function(x){try{tapObserver.onNext(x);}catch(e) {observer.onError(e);}observer.onNext(x);}, function(err){try{tapObserver.onError(err);}catch(e) {observer.onError(e);}observer.onError(err);}, function(){try{tapObserver.onCompleted();}catch(e) {observer.onError(e);}observer.onCompleted();});}, this);};observableProto.doOnNext = observableProto.tapOnNext = function(onNext, thisArg){return this.tap(typeof thisArg !== 'undefined'?function(x){onNext.call(thisArg, x);}:onNext);};observableProto.doOnError = observableProto.tapOnError = function(onError, thisArg){return this.tap(noop, typeof thisArg !== 'undefined'?function(e){onError.call(thisArg, e);}:onError);};observableProto.doOnCompleted = observableProto.tapOnCompleted = function(onCompleted, thisArg){return this.tap(noop, null, typeof thisArg !== 'undefined'?function(){onCompleted.call(thisArg);}:onCompleted);};observableProto['finally'] = observableProto.ensure = function(action){var source=this;return new AnonymousObservable(function(observer){var subscription;try{subscription = source.subscribe(observer);}catch(e) {action();throw e;}return disposableCreate(function(){try{subscription.dispose();}catch(e) {throw e;}finally {action();}});}, this);};observableProto.finallyAction = function(action){return this.ensure(action);};observableProto.ignoreElements = function(){var source=this;return new AnonymousObservable(function(o){return source.subscribe(noop, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};observableProto.materialize = function(){var source=this;return new AnonymousObservable(function(observer){return source.subscribe(function(value){observer.onNext(notificationCreateOnNext(value));}, function(e){observer.onNext(notificationCreateOnError(e));observer.onCompleted();}, function(){observer.onNext(notificationCreateOnCompleted());observer.onCompleted();});}, source);};observableProto.repeat = function(repeatCount){return enumerableRepeat(this, repeatCount).concat();};observableProto.retry = function(retryCount){return enumerableRepeat(this, retryCount).catchError();};observableProto.retryWhen = function(notifier){return enumerableRepeat(this).catchErrorWhen(notifier);};observableProto.scan = function(){var hasSeed=false, seed, accumulator, source=this;if(arguments.length === 2){hasSeed = true;seed = arguments[0];accumulator = arguments[1];}else {accumulator = arguments[0];}return new AnonymousObservable(function(o){var hasAccumulation, accumulation, hasValue;return source.subscribe(function(x){!hasValue && (hasValue = true);try{if(hasAccumulation){accumulation = accumulator(accumulation, x);}else {accumulation = hasSeed?accumulator(seed, x):x;hasAccumulation = true;}}catch(e) {o.onError(e);return;}o.onNext(accumulation);}, function(e){o.onError(e);}, function(){!hasValue && hasSeed && o.onNext(seed);o.onCompleted();});}, source);};observableProto.skipLast = function(count){if(count < 0){throw new ArgumentOutOfRangeError();}var source=this;return new AnonymousObservable(function(o){var q=[];return source.subscribe(function(x){q.push(x);q.length > count && o.onNext(q.shift());}, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};observableProto.startWith = function(){var values, scheduler, start=0;if(!!arguments.length && isScheduler(arguments[0])){scheduler = arguments[0];start = 1;}else {scheduler = immediateScheduler;}for(var args=[], i=start, len=arguments.length; i < len; i++) {args.push(arguments[i]);}return enumerableOf([observableFromArray(args, scheduler), this]).concat();};observableProto.takeLast = function(count){if(count < 0){throw new ArgumentOutOfRangeError();}var source=this;return new AnonymousObservable(function(o){var q=[];return source.subscribe(function(x){q.push(x);q.length > count && q.shift();}, function(e){o.onError(e);}, function(){while(q.length > 0) {o.onNext(q.shift());}o.onCompleted();});}, source);};observableProto.takeLastBuffer = function(count){var source=this;return new AnonymousObservable(function(o){var q=[];return source.subscribe(function(x){q.push(x);q.length > count && q.shift();}, function(e){o.onError(e);}, function(){o.onNext(q);o.onCompleted();});}, source);};observableProto.windowWithCount = function(count, skip){var source=this;+count || (count = 0);Math.abs(count) === Infinity && (count = 0);if(count <= 0){throw new ArgumentOutOfRangeError();}skip == null && (skip = count);+skip || (skip = 0);Math.abs(skip) === Infinity && (skip = 0);if(skip <= 0){throw new ArgumentOutOfRangeError();}return new AnonymousObservable(function(observer){var m=new SingleAssignmentDisposable(), refCountDisposable=new RefCountDisposable(m), n=0, q=[];function createWindow(){var s=new Subject();q.push(s);observer.onNext(addRef(s, refCountDisposable));}createWindow();m.setDisposable(source.subscribe(function(x){for(var i=0, len=q.length; i < len; i++) {q[i].onNext(x);}var c=n - count + 1;c >= 0 && c % skip === 0 && q.shift().onCompleted();++n % skip === 0 && createWindow();}, function(e){while(q.length > 0) {q.shift().onError(e);}observer.onError(e);}, function(){while(q.length > 0) {q.shift().onCompleted();}observer.onCompleted();}));return refCountDisposable;}, source);};function concatMap(source, selector, thisArg){var selectorFunc=bindCallback(selector, thisArg, 3);return source.map(function(x, i){var result=selectorFunc(x, i, source);isPromise(result) && (result = observableFromPromise(result));(isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));return result;}).concatAll();}observableProto.selectConcat = observableProto.concatMap = function(selector, resultSelector, thisArg){if(isFunction(selector) && isFunction(resultSelector)){return this.concatMap(function(x, i){var selectorResult=selector(x, i);isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));(isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));return selectorResult.map(function(y, i2){return resultSelector(x, y, i, i2);});});}return isFunction(selector)?concatMap(this, selector, thisArg):concatMap(this, function(){return selector;});};observableProto.concatMapObserver = observableProto.selectConcatObserver = function(onNext, onError, onCompleted, thisArg){var source=this, onNextFunc=bindCallback(onNext, thisArg, 2), onErrorFunc=bindCallback(onError, thisArg, 1), onCompletedFunc=bindCallback(onCompleted, thisArg, 0);return new AnonymousObservable(function(observer){var index=0;return source.subscribe(function(x){var result;try{result = onNextFunc(x, index++);}catch(e) {observer.onError(e);return;}isPromise(result) && (result = observableFromPromise(result));observer.onNext(result);}, function(err){var result;try{result = onErrorFunc(err);}catch(e) {observer.onError(e);return;}isPromise(result) && (result = observableFromPromise(result));observer.onNext(result);observer.onCompleted();}, function(){var result;try{result = onCompletedFunc();}catch(e) {observer.onError(e);return;}isPromise(result) && (result = observableFromPromise(result));observer.onNext(result);observer.onCompleted();});}, this).concatAll();};observableProto.defaultIfEmpty = function(defaultValue){var source=this;defaultValue === undefined && (defaultValue = null);return new AnonymousObservable(function(observer){var found=false;return source.subscribe(function(x){found = true;observer.onNext(x);}, function(e){observer.onError(e);}, function(){!found && observer.onNext(defaultValue);observer.onCompleted();});}, source);};function arrayIndexOfComparer(array, item, comparer){for(var i=0, len=array.length; i < len; i++) {if(comparer(array[i], item)){return i;}}return -1;}function HashSet(comparer){this.comparer = comparer;this.set = [];}HashSet.prototype.push = function(value){var retValue=arrayIndexOfComparer(this.set, value, this.comparer) === -1;retValue && this.set.push(value);return retValue;};observableProto.distinct = function(keySelector, comparer){var source=this;comparer || (comparer = defaultComparer);return new AnonymousObservable(function(o){var hashSet=new HashSet(comparer);return source.subscribe(function(x){var key=x;if(keySelector){try{key = keySelector(x);}catch(e) {o.onError(e);return;}}hashSet.push(key) && o.onNext(x);}, function(e){o.onError(e);}, function(){o.onCompleted();});}, this);};observableProto.groupBy = function(keySelector, elementSelector, comparer){return this.groupByUntil(keySelector, elementSelector, observableNever, comparer);};observableProto.groupByUntil = function(keySelector, elementSelector, durationSelector, comparer){var source=this;elementSelector || (elementSelector = identity);comparer || (comparer = defaultComparer);return new AnonymousObservable(function(observer){function handleError(e){return function(item){item.onError(e);};}var map=new Dictionary(0, comparer), groupDisposable=new CompositeDisposable(), refCountDisposable=new RefCountDisposable(groupDisposable);groupDisposable.add(source.subscribe(function(x){var key;try{key = keySelector(x);}catch(e) {map.getValues().forEach(handleError(e));observer.onError(e);return;}var fireNewMapEntry=false, writer=map.tryGetValue(key);if(!writer){writer = new Subject();map.set(key, writer);fireNewMapEntry = true;}if(fireNewMapEntry){var group=new GroupedObservable(key, writer, refCountDisposable), durationGroup=new GroupedObservable(key, writer);try{duration = durationSelector(durationGroup);}catch(e) {map.getValues().forEach(handleError(e));observer.onError(e);return;}observer.onNext(group);var md=new SingleAssignmentDisposable();groupDisposable.add(md);var expire=function expire(){map.remove(key) && writer.onCompleted();groupDisposable.remove(md);};md.setDisposable(duration.take(1).subscribe(noop, function(exn){map.getValues().forEach(handleError(exn));observer.onError(exn);}, expire));}var element;try{element = elementSelector(x);}catch(e) {map.getValues().forEach(handleError(e));observer.onError(e);return;}writer.onNext(element);}, function(ex){map.getValues().forEach(handleError(ex));observer.onError(ex);}, function(){map.getValues().forEach(function(item){item.onCompleted();});observer.onCompleted();}));return refCountDisposable;}, source);};var MapObservable=(function(__super__){inherits(MapObservable, __super__);function MapObservable(source, selector, thisArg){this.source = source;this.selector = bindCallback(selector, thisArg, 3);__super__.call(this);}MapObservable.prototype.internalMap = function(selector, thisArg){var self=this;return new MapObservable(this.source, function(x, i, o){return selector.call(this, self.selector(x, i, o), i, o);}, thisArg);};MapObservable.prototype.subscribeCore = function(observer){return this.source.subscribe(new MapObserver(observer, this.selector, this));};return MapObservable;})(ObservableBase);function MapObserver(observer, selector, source){this.observer = observer;this.selector = selector;this.source = source;this.i = 0;this.isStopped = false;}MapObserver.prototype.onNext = function(x){if(this.isStopped){return;}var result=tryCatch(this.selector).call(this, x, this.i++, this.source);if(result === errorObj){return this.observer.onError(result.e);}this.observer.onNext(result);};MapObserver.prototype.onError = function(e){if(!this.isStopped){this.isStopped = true;this.observer.onError(e);}};MapObserver.prototype.onCompleted = function(){if(!this.isStopped){this.isStopped = true;this.observer.onCompleted();}};MapObserver.prototype.dispose = function(){this.isStopped = true;};MapObserver.prototype.fail = function(e){if(!this.isStopped){this.isStopped = true;this.observer.onError(e);return true;}return false;};observableProto.map = observableProto.select = function(selector, thisArg){var selectorFn=typeof selector === 'function'?selector:function(){return selector;};return this instanceof MapObservable?this.internalMap(selectorFn, thisArg):new MapObservable(this, selectorFn, thisArg);};observableProto.pluck = function(){var args=arguments, len=arguments.length;if(len === 0){throw new Error('List of properties cannot be empty.');}return this.map(function(x){var currentProp=x;for(var i=0; i < len; i++) {var p=currentProp[args[i]];if(typeof p !== 'undefined'){currentProp = p;}else {return undefined;}}return currentProp;});};function flatMap(source, selector, thisArg){var selectorFunc=bindCallback(selector, thisArg, 3);return source.map(function(x, i){var result=selectorFunc(x, i, source);isPromise(result) && (result = observableFromPromise(result));(isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));return result;}).mergeAll();}observableProto.selectMany = observableProto.flatMap = function(selector, resultSelector, thisArg){if(isFunction(selector) && isFunction(resultSelector)){return this.flatMap(function(x, i){var selectorResult=selector(x, i);isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));(isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));return selectorResult.map(function(y, i2){return resultSelector(x, y, i, i2);});}, thisArg);}return isFunction(selector)?flatMap(this, selector, thisArg):flatMap(this, function(){return selector;});};observableProto.flatMapObserver = observableProto.selectManyObserver = function(onNext, onError, onCompleted, thisArg){var source=this;return new AnonymousObservable(function(observer){var index=0;return source.subscribe(function(x){var result;try{result = onNext.call(thisArg, x, index++);}catch(e) {observer.onError(e);return;}isPromise(result) && (result = observableFromPromise(result));observer.onNext(result);}, function(err){var result;try{result = onError.call(thisArg, err);}catch(e) {observer.onError(e);return;}isPromise(result) && (result = observableFromPromise(result));observer.onNext(result);observer.onCompleted();}, function(){var result;try{result = onCompleted.call(thisArg);}catch(e) {observer.onError(e);return;}isPromise(result) && (result = observableFromPromise(result));observer.onNext(result);observer.onCompleted();});}, source).mergeAll();};observableProto.selectSwitch = observableProto.flatMapLatest = observableProto.switchMap = function(selector, thisArg){return this.select(selector, thisArg).switchLatest();};observableProto.skip = function(count){if(count < 0){throw new ArgumentOutOfRangeError();}var source=this;return new AnonymousObservable(function(o){var remaining=count;return source.subscribe(function(x){if(remaining <= 0){o.onNext(x);}else {remaining--;}}, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};observableProto.skipWhile = function(predicate, thisArg){var source=this, callback=bindCallback(predicate, thisArg, 3);return new AnonymousObservable(function(o){var i=0, running=false;return source.subscribe(function(x){if(!running){try{running = !callback(x, i++, source);}catch(e) {o.onError(e);return;}}running && o.onNext(x);}, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};observableProto.take = function(count, scheduler){if(count < 0){throw new ArgumentOutOfRangeError();}if(count === 0){return observableEmpty(scheduler);}var source=this;return new AnonymousObservable(function(o){var remaining=count;return source.subscribe(function(x){if(remaining-- > 0){o.onNext(x);remaining === 0 && o.onCompleted();}}, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};observableProto.takeWhile = function(predicate, thisArg){var source=this, callback=bindCallback(predicate, thisArg, 3);return new AnonymousObservable(function(o){var i=0, running=true;return source.subscribe(function(x){if(running){try{running = callback(x, i++, source);}catch(e) {o.onError(e);return;}if(running){o.onNext(x);}else {o.onCompleted();}}}, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};var FilterObservable=(function(__super__){inherits(FilterObservable, __super__);function FilterObservable(source, predicate, thisArg){this.source = source;this.predicate = bindCallback(predicate, thisArg, 3);__super__.call(this);}FilterObservable.prototype.subscribeCore = function(observer){return this.source.subscribe(new FilterObserver(observer, this.predicate, this));};FilterObservable.prototype.internalFilter = function(predicate, thisArg){var self=this;return new FilterObservable(this.source, function(x, i, o){return self.predicate(x, i, o) && predicate.call(this, x, i, o);}, thisArg);};return FilterObservable;})(ObservableBase);function FilterObserver(observer, predicate, source){this.observer = observer;this.predicate = predicate;this.source = source;this.i = 0;this.isStopped = false;}FilterObserver.prototype.onNext = function(x){if(this.isStopped){return;}var shouldYield=tryCatch(this.predicate).call(this, x, this.i++, this.source);if(shouldYield === errorObj){return this.observer.onError(shouldYield.e);}shouldYield && this.observer.onNext(x);};FilterObserver.prototype.onError = function(e){if(!this.isStopped){this.isStopped = true;this.observer.onError(e);}};FilterObserver.prototype.onCompleted = function(){if(!this.isStopped){this.isStopped = true;this.observer.onCompleted();}};FilterObserver.prototype.dispose = function(){this.isStopped = true;};FilterObserver.prototype.fail = function(e){if(!this.isStopped){this.isStopped = true;this.observer.onError(e);return true;}return false;};observableProto.filter = observableProto.where = function(predicate, thisArg){return this instanceof FilterObservable?this.internalFilter(predicate, thisArg):new FilterObservable(this, predicate, thisArg);};function extremaBy(source, keySelector, comparer){return new AnonymousObservable(function(o){var hasValue=false, lastKey=null, list=[];return source.subscribe(function(x){var comparison, key;try{key = keySelector(x);}catch(ex) {o.onError(ex);return;}comparison = 0;if(!hasValue){hasValue = true;lastKey = key;}else {try{comparison = comparer(key, lastKey);}catch(ex1) {o.onError(ex1);return;}}if(comparison > 0){lastKey = key;list = [];}if(comparison >= 0){list.push(x);}}, function(e){o.onError(e);}, function(){o.onNext(list);o.onCompleted();});}, source);}function firstOnly(x){if(x.length === 0){throw new EmptyError();}return x[0];}observableProto.aggregate = function(){var hasSeed=false, accumulator, seed, source=this;if(arguments.length === 2){hasSeed = true;seed = arguments[0];accumulator = arguments[1];}else {accumulator = arguments[0];}return new AnonymousObservable(function(o){var hasAccumulation, accumulation, hasValue;return source.subscribe(function(x){!hasValue && (hasValue = true);try{if(hasAccumulation){accumulation = accumulator(accumulation, x);}else {accumulation = hasSeed?accumulator(seed, x):x;hasAccumulation = true;}}catch(e) {return o.onError(e);}}, function(e){o.onError(e);}, function(){hasValue && o.onNext(accumulation);!hasValue && hasSeed && o.onNext(seed);!hasValue && !hasSeed && o.onError(new EmptyError());o.onCompleted();});}, source);};observableProto.reduce = function(accumulator){var hasSeed=false, seed, source=this;if(arguments.length === 2){hasSeed = true;seed = arguments[1];}return new AnonymousObservable(function(o){var hasAccumulation, accumulation, hasValue;return source.subscribe(function(x){!hasValue && (hasValue = true);try{if(hasAccumulation){accumulation = accumulator(accumulation, x);}else {accumulation = hasSeed?accumulator(seed, x):x;hasAccumulation = true;}}catch(e) {return o.onError(e);}}, function(e){o.onError(e);}, function(){hasValue && o.onNext(accumulation);!hasValue && hasSeed && o.onNext(seed);!hasValue && !hasSeed && o.onError(new EmptyError());o.onCompleted();});}, source);};observableProto.some = function(predicate, thisArg){var source=this;return predicate?source.filter(predicate, thisArg).some():new AnonymousObservable(function(observer){return source.subscribe(function(){observer.onNext(true);observer.onCompleted();}, function(e){observer.onError(e);}, function(){observer.onNext(false);observer.onCompleted();});}, source);};observableProto.any = function(){return this.some.apply(this, arguments);};observableProto.isEmpty = function(){return this.any().map(not);};observableProto.every = function(predicate, thisArg){return this.filter(function(v){return !predicate(v);}, thisArg).some().map(not);};observableProto.all = function(){return this.every.apply(this, arguments);};observableProto.includes = function(searchElement, fromIndex){var source=this;function comparer(a, b){return a === 0 && b === 0 || (a === b || isNaN(a) && isNaN(b));}return new AnonymousObservable(function(o){var i=0, n=+fromIndex || 0;Math.abs(n) === Infinity && (n = 0);if(n < 0){o.onNext(false);o.onCompleted();return disposableEmpty;}return source.subscribe(function(x){if(i++ >= n && comparer(x, searchElement)){o.onNext(true);o.onCompleted();}}, function(e){o.onError(e);}, function(){o.onNext(false);o.onCompleted();});}, this);};observableProto.contains = function(searchElement, fromIndex){observableProto.includes(searchElement, fromIndex);};observableProto.count = function(predicate, thisArg){return predicate?this.filter(predicate, thisArg).count():this.reduce(function(count){return count + 1;}, 0);};observableProto.indexOf = function(searchElement, fromIndex){var source=this;return new AnonymousObservable(function(o){var i=0, n=+fromIndex || 0;Math.abs(n) === Infinity && (n = 0);if(n < 0){o.onNext(-1);o.onCompleted();return disposableEmpty;}return source.subscribe(function(x){if(i >= n && x === searchElement){o.onNext(i);o.onCompleted();}i++;}, function(e){o.onError(e);}, function(){o.onNext(-1);o.onCompleted();});}, source);};observableProto.sum = function(keySelector, thisArg){return keySelector && isFunction(keySelector)?this.map(keySelector, thisArg).sum():this.reduce(function(prev, curr){return prev + curr;}, 0);};observableProto.minBy = function(keySelector, comparer){comparer || (comparer = defaultSubComparer);return extremaBy(this, keySelector, function(x, y){return comparer(x, y) * -1;});};observableProto.min = function(comparer){return this.minBy(identity, comparer).map(function(x){return firstOnly(x);});};observableProto.maxBy = function(keySelector, comparer){comparer || (comparer = defaultSubComparer);return extremaBy(this, keySelector, comparer);};observableProto.max = function(comparer){return this.maxBy(identity, comparer).map(function(x){return firstOnly(x);});};observableProto.average = function(keySelector, thisArg){return keySelector && isFunction(keySelector)?this.map(keySelector, thisArg).average():this.reduce(function(prev, cur){return {sum:prev.sum + cur, count:prev.count + 1};}, {sum:0, count:0}).map(function(s){if(s.count === 0){throw new EmptyError();}return s.sum / s.count;});};observableProto.sequenceEqual = function(second, comparer){var first=this;comparer || (comparer = defaultComparer);return new AnonymousObservable(function(o){var donel=false, doner=false, ql=[], qr=[];var subscription1=first.subscribe(function(x){var equal, v;if(qr.length > 0){v = qr.shift();try{equal = comparer(v, x);}catch(e) {o.onError(e);return;}if(!equal){o.onNext(false);o.onCompleted();}}else if(doner){o.onNext(false);o.onCompleted();}else {ql.push(x);}}, function(e){o.onError(e);}, function(){donel = true;if(ql.length === 0){if(qr.length > 0){o.onNext(false);o.onCompleted();}else if(doner){o.onNext(true);o.onCompleted();}}});(isArrayLike(second) || isIterable(second)) && (second = observableFrom(second));isPromise(second) && (second = observableFromPromise(second));var subscription2=second.subscribe(function(x){var equal;if(ql.length > 0){var v=ql.shift();try{equal = comparer(v, x);}catch(exception) {o.onError(exception);return;}if(!equal){o.onNext(false);o.onCompleted();}}else if(donel){o.onNext(false);o.onCompleted();}else {qr.push(x);}}, function(e){o.onError(e);}, function(){doner = true;if(qr.length === 0){if(ql.length > 0){o.onNext(false);o.onCompleted();}else if(donel){o.onNext(true);o.onCompleted();}}});return new CompositeDisposable(subscription1, subscription2);}, first);};function elementAtOrDefault(source, index, hasDefault, defaultValue){if(index < 0){throw new ArgumentOutOfRangeError();}return new AnonymousObservable(function(o){var i=index;return source.subscribe(function(x){if(i-- === 0){o.onNext(x);o.onCompleted();}}, function(e){o.onError(e);}, function(){if(!hasDefault){o.onError(new ArgumentOutOfRangeError());}else {o.onNext(defaultValue);o.onCompleted();}});}, source);}observableProto.elementAt = function(index){return elementAtOrDefault(this, index, false);};observableProto.elementAtOrDefault = function(index, defaultValue){return elementAtOrDefault(this, index, true, defaultValue);};function singleOrDefaultAsync(source, hasDefault, defaultValue){return new AnonymousObservable(function(o){var value=defaultValue, seenValue=false;return source.subscribe(function(x){if(seenValue){o.onError(new Error('Sequence contains more than one element'));}else {value = x;seenValue = true;}}, function(e){o.onError(e);}, function(){if(!seenValue && !hasDefault){o.onError(new EmptyError());}else {o.onNext(value);o.onCompleted();}});}, source);}observableProto.single = function(predicate, thisArg){return predicate && isFunction(predicate)?this.where(predicate, thisArg).single():singleOrDefaultAsync(this, false);};observableProto.singleOrDefault = function(predicate, defaultValue, thisArg){return predicate && isFunction(predicate)?this.filter(predicate, thisArg).singleOrDefault(null, defaultValue):singleOrDefaultAsync(this, true, defaultValue);};function firstOrDefaultAsync(source, hasDefault, defaultValue){return new AnonymousObservable(function(o){return source.subscribe(function(x){o.onNext(x);o.onCompleted();}, function(e){o.onError(e);}, function(){if(!hasDefault){o.onError(new EmptyError());}else {o.onNext(defaultValue);o.onCompleted();}});}, source);}observableProto.first = function(predicate, thisArg){return predicate?this.where(predicate, thisArg).first():firstOrDefaultAsync(this, false);};observableProto.firstOrDefault = function(predicate, defaultValue, thisArg){return predicate?this.where(predicate).firstOrDefault(null, defaultValue):firstOrDefaultAsync(this, true, defaultValue);};function lastOrDefaultAsync(source, hasDefault, defaultValue){return new AnonymousObservable(function(o){var value=defaultValue, seenValue=false;return source.subscribe(function(x){value = x;seenValue = true;}, function(e){o.onError(e);}, function(){if(!seenValue && !hasDefault){o.onError(new EmptyError());}else {o.onNext(value);o.onCompleted();}});}, source);}observableProto.last = function(predicate, thisArg){return predicate?this.where(predicate, thisArg).last():lastOrDefaultAsync(this, false);};observableProto.lastOrDefault = function(predicate, defaultValue, thisArg){return predicate?this.where(predicate, thisArg).lastOrDefault(null, defaultValue):lastOrDefaultAsync(this, true, defaultValue);};function findValue(source, predicate, thisArg, yieldIndex){var callback=bindCallback(predicate, thisArg, 3);return new AnonymousObservable(function(o){var i=0;return source.subscribe(function(x){var shouldRun;try{shouldRun = callback(x, i, source);}catch(e) {o.onError(e);return;}if(shouldRun){o.onNext(yieldIndex?i:x);o.onCompleted();}else {i++;}}, function(e){o.onError(e);}, function(){o.onNext(yieldIndex?-1:undefined);o.onCompleted();});}, source);}observableProto.find = function(predicate, thisArg){return findValue(this, predicate, thisArg, false);};observableProto.findIndex = function(predicate, thisArg){return findValue(this, predicate, thisArg, true);};observableProto.toSet = function(){if(typeof root.Set === 'undefined'){throw new TypeError();}var source=this;return new AnonymousObservable(function(o){var s=new root.Set();return source.subscribe(function(x){s.add(x);}, function(e){o.onError(e);}, function(){o.onNext(s);o.onCompleted();});}, source);};observableProto.toMap = function(keySelector, elementSelector){if(typeof root.Map === 'undefined'){throw new TypeError();}var source=this;return new AnonymousObservable(function(o){var m=new root.Map();return source.subscribe(function(x){var key;try{key = keySelector(x);}catch(e) {o.onError(e);return;}var element=x;if(elementSelector){try{element = elementSelector(x);}catch(e) {o.onError(e);return;}}m.set(key, element);}, function(e){o.onError(e);}, function(){o.onNext(m);o.onCompleted();});}, source);};var fnString='function', throwString='throw', isObject=Rx.internals.isObject;function toThunk(obj, ctx){if(Array.isArray(obj)){return objectToThunk.call(ctx, obj);}if(isGeneratorFunction(obj)){return observableSpawn(obj.call(ctx));}if(isGenerator(obj)){return observableSpawn(obj);}if(isObservable(obj)){return observableToThunk(obj);}if(isPromise(obj)){return promiseToThunk(obj);}if(typeof obj === fnString){return obj;}if(isObject(obj) || Array.isArray(obj)){return objectToThunk.call(ctx, obj);}return obj;}function objectToThunk(obj){var ctx=this;return function(done){var keys=Object.keys(obj), pending=keys.length, results=new obj.constructor(), finished;if(!pending){timeoutScheduler.schedule(function(){done(null, results);});return;}for(var i=0, len=keys.length; i < len; i++) {run(obj[keys[i]], keys[i]);}function run(fn, key){if(finished){return;}try{fn = toThunk(fn, ctx);if(typeof fn !== fnString){results[key] = fn;return --pending || done(null, results);}fn.call(ctx, function(err, res){if(finished){return;}if(err){finished = true;return done(err);}results[key] = res;--pending || done(null, results);});}catch(e) {finished = true;done(e);}}};}function observableToThunk(observable){return function(fn){var value, hasValue=false;observable.subscribe(function(v){value = v;hasValue = true;}, fn, function(){hasValue && fn(null, value);});};}function promiseToThunk(promise){return function(fn){promise.then(function(res){fn(null, res);}, fn);};}function isObservable(obj){return obj && typeof obj.subscribe === fnString;}function isGeneratorFunction(obj){return obj && obj.constructor && obj.constructor.name === 'GeneratorFunction';}function isGenerator(obj){return obj && typeof obj.next === fnString && typeof obj[throwString] === fnString;}var observableSpawn=Rx.spawn = function(fn){var isGenFun=isGeneratorFunction(fn);return function(done){var ctx=this, gen=fn;if(isGenFun){for(var args=[], i=0, len=arguments.length; i < len; i++) {args.push(arguments[i]);}var len=args.length, hasCallback=len && typeof args[len - 1] === fnString;done = hasCallback?args.pop():handleError;gen = fn.apply(this, args);}else {done = done || handleError;}next();function exit(err, res){timeoutScheduler.schedule(done.bind(ctx, err, res));}function next(err, res){var ret;if(arguments.length > 2){for(var res=[], i=1, len=arguments.length; i < len; i++) {res.push(arguments[i]);}}if(err){try{ret = gen[throwString](err);}catch(e) {return exit(e);}}if(!err){try{ret = gen.next(res);}catch(e) {return exit(e);}}if(ret.done){return exit(null, ret.value);}ret.value = toThunk(ret.value, ctx);if(typeof ret.value === fnString){var called=false;try{ret.value.call(ctx, function(){if(called){return;}called = true;next.apply(ctx, arguments);});}catch(e) {timeoutScheduler.schedule(function(){if(called){return;}called = true;next.call(ctx, e);});}return;}next(new TypeError('Rx.spawn only supports a function, Promise, Observable, Object or Array.'));}};};function handleError(err){if(!err){return;}timeoutScheduler.schedule(function(){throw err;});}Observable.start = function(func, context, scheduler){return observableToAsync(func, context, scheduler)();};var observableToAsync=Observable.toAsync = function(func, context, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);return function(){var args=arguments, subject=new AsyncSubject();scheduler.schedule(function(){var result;try{result = func.apply(context, args);}catch(e) {subject.onError(e);return;}subject.onNext(result);subject.onCompleted();});return subject.asObservable();};};Observable.fromCallback = function(func, context, selector){return function(){var len=arguments.length, args=new Array(len);for(var i=0; i < len; i++) {args[i] = arguments[i];}return new AnonymousObservable(function(observer){function handler(){var len=arguments.length, results=new Array(len);for(var i=0; i < len; i++) {results[i] = arguments[i];}if(selector){try{results = selector.apply(context, results);}catch(e) {return observer.onError(e);}observer.onNext(results);}else {if(results.length <= 1){observer.onNext.apply(observer, results);}else {observer.onNext(results);}}observer.onCompleted();}args.push(handler);func.apply(context, args);}).publishLast().refCount();};};Observable.fromNodeCallback = function(func, context, selector){return function(){var len=arguments.length, args=new Array(len);for(var i=0; i < len; i++) {args[i] = arguments[i];}return new AnonymousObservable(function(observer){function handler(err){if(err){observer.onError(err);return;}var len=arguments.length, results=[];for(var i=1; i < len; i++) {results[i - 1] = arguments[i];}if(selector){try{results = selector.apply(context, results);}catch(e) {return observer.onError(e);}observer.onNext(results);}else {if(results.length <= 1){observer.onNext.apply(observer, results);}else {observer.onNext(results);}}observer.onCompleted();}args.push(handler);func.apply(context, args);}).publishLast().refCount();};};function createListener(element, name, handler){if(element.addEventListener){element.addEventListener(name, handler, false);return disposableCreate(function(){element.removeEventListener(name, handler, false);});}throw new Error('No listener found');}function createEventListener(el, eventName, handler){var disposables=new CompositeDisposable();if(Object.prototype.toString.call(el) === '[object NodeList]'){for(var i=0, len=el.length; i < len; i++) {disposables.add(createEventListener(el.item(i), eventName, handler));}}else if(el){disposables.add(createListener(el, eventName, handler));}return disposables;}Rx.config.useNativeEvents = false;Observable.fromEvent = function(element, eventName, selector){if(element.addListener){return fromEventPattern(function(h){element.addListener(eventName, h);}, function(h){element.removeListener(eventName, h);}, selector);}if(!Rx.config.useNativeEvents){if(typeof element.on === 'function' && typeof element.off === 'function'){return fromEventPattern(function(h){element.on(eventName, h);}, function(h){element.off(eventName, h);}, selector);}}return new AnonymousObservable(function(observer){return createEventListener(element, eventName, function handler(e){var results=e;if(selector){try{results = selector(arguments);}catch(err) {return observer.onError(err);}}observer.onNext(results);});}).publish().refCount();};var fromEventPattern=Observable.fromEventPattern = function(addHandler, removeHandler, selector){return new AnonymousObservable(function(observer){function innerHandler(e){var result=e;if(selector){try{result = selector(arguments);}catch(err) {return observer.onError(err);}}observer.onNext(result);}var returnValue=addHandler(innerHandler);return disposableCreate(function(){if(removeHandler){removeHandler(innerHandler, returnValue);}});}).publish().refCount();};Observable.startAsync = function(functionAsync){var promise;try{promise = functionAsync();}catch(e) {return observableThrow(e);}return observableFromPromise(promise);};var PausableObservable=(function(__super__){inherits(PausableObservable, __super__);function subscribe(observer){var conn=this.source.publish(), subscription=conn.subscribe(observer), connection=disposableEmpty;var pausable=this.pauser.distinctUntilChanged().subscribe(function(b){if(b){connection = conn.connect();}else {connection.dispose();connection = disposableEmpty;}});return new CompositeDisposable(subscription, connection, pausable);}function PausableObservable(source, pauser){this.source = source;this.controller = new Subject();if(pauser && pauser.subscribe){this.pauser = this.controller.merge(pauser);}else {this.pauser = this.controller;}__super__.call(this, subscribe, source);}PausableObservable.prototype.pause = function(){this.controller.onNext(false);};PausableObservable.prototype.resume = function(){this.controller.onNext(true);};return PausableObservable;})(Observable);observableProto.pausable = function(pauser){return new PausableObservable(this, pauser);};function combineLatestSource(source, subject, resultSelector){return new AnonymousObservable(function(o){var hasValue=[false, false], hasValueAll=false, isDone=false, values=new Array(2), err;function next(x, i){values[i] = x;var res;hasValue[i] = true;if(hasValueAll || (hasValueAll = hasValue.every(identity))){if(err){o.onError(err);return;}try{res = resultSelector.apply(null, values);}catch(ex) {o.onError(ex);return;}o.onNext(res);}if(isDone && values[1]){o.onCompleted();}}return new CompositeDisposable(source.subscribe(function(x){next(x, 0);}, function(e){if(values[1]){o.onError(e);}else {err = e;}}, function(){isDone = true;values[1] && o.onCompleted();}), subject.subscribe(function(x){next(x, 1);}, function(e){o.onError(e);}, function(){isDone = true;next(true, 1);}));}, source);}var PausableBufferedObservable=(function(__super__){inherits(PausableBufferedObservable, __super__);function subscribe(o){var q=[], previousShouldFire;var subscription=combineLatestSource(this.source, this.pauser.distinctUntilChanged().startWith(false), function(data, shouldFire){return {data:data, shouldFire:shouldFire};}).subscribe(function(results){if(previousShouldFire !== undefined && results.shouldFire != previousShouldFire){previousShouldFire = results.shouldFire;if(results.shouldFire){while(q.length > 0) {o.onNext(q.shift());}}}else {previousShouldFire = results.shouldFire;if(results.shouldFire){o.onNext(results.data);}else {q.push(results.data);}}}, function(err){while(q.length > 0) {o.onNext(q.shift());}o.onError(err);}, function(){while(q.length > 0) {o.onNext(q.shift());}o.onCompleted();});return subscription;}function PausableBufferedObservable(source, pauser){this.source = source;this.controller = new Subject();if(pauser && pauser.subscribe){this.pauser = this.controller.merge(pauser);}else {this.pauser = this.controller;}__super__.call(this, subscribe, source);}PausableBufferedObservable.prototype.pause = function(){this.controller.onNext(false);};PausableBufferedObservable.prototype.resume = function(){this.controller.onNext(true);};return PausableBufferedObservable;})(Observable);observableProto.pausableBuffered = function(subject){return new PausableBufferedObservable(this, subject);};var ControlledObservable=(function(__super__){inherits(ControlledObservable, __super__);function subscribe(observer){return this.source.subscribe(observer);}function ControlledObservable(source, enableQueue, scheduler){__super__.call(this, subscribe, source);this.subject = new ControlledSubject(enableQueue, scheduler);this.source = source.multicast(this.subject).refCount();}ControlledObservable.prototype.request = function(numberOfItems){return this.subject.request(numberOfItems == null?-1:numberOfItems);};return ControlledObservable;})(Observable);var ControlledSubject=(function(__super__){function subscribe(observer){return this.subject.subscribe(observer);}inherits(ControlledSubject, __super__);function ControlledSubject(enableQueue, scheduler){enableQueue == null && (enableQueue = true);__super__.call(this, subscribe);this.subject = new Subject();this.enableQueue = enableQueue;this.queue = enableQueue?[]:null;this.requestedCount = 0;this.requestedDisposable = disposableEmpty;this.error = null;this.hasFailed = false;this.hasCompleted = false;this.scheduler = scheduler || currentThreadScheduler;}addProperties(ControlledSubject.prototype, Observer, {onCompleted:function onCompleted(){this.hasCompleted = true;if(!this.enableQueue || this.queue.length === 0){this.subject.onCompleted();}else {this.queue.push(Notification.createOnCompleted());}}, onError:function onError(error){this.hasFailed = true;this.error = error;if(!this.enableQueue || this.queue.length === 0){this.subject.onError(error);}else {this.queue.push(Notification.createOnError(error));}}, onNext:function onNext(value){var hasRequested=false;if(this.requestedCount === 0){this.enableQueue && this.queue.push(Notification.createOnNext(value));}else {this.requestedCount !== -1 && this.requestedCount-- === 0 && this.disposeCurrentRequest();hasRequested = true;}hasRequested && this.subject.onNext(value);}, _processRequest:function _processRequest(numberOfItems){if(this.enableQueue){while(this.queue.length >= numberOfItems && numberOfItems > 0 || this.queue.length > 0 && this.queue[0].kind !== 'N') {var first=this.queue.shift();first.accept(this.subject);if(first.kind === 'N'){numberOfItems--;}else {this.disposeCurrentRequest();this.queue = [];}}return {numberOfItems:numberOfItems, returnValue:this.queue.length !== 0};}return {numberOfItems:numberOfItems, returnValue:false};}, request:function request(number){this.disposeCurrentRequest();var self=this;this.requestedDisposable = this.scheduler.scheduleWithState(number, function(s, i){var r=self._processRequest(i), remaining=r.numberOfItems;if(!r.returnValue){self.requestedCount = remaining;self.requestedDisposable = disposableCreate(function(){self.requestedCount = 0;});}});return this.requestedDisposable;}, disposeCurrentRequest:function disposeCurrentRequest(){this.requestedDisposable.dispose();this.requestedDisposable = disposableEmpty;}});return ControlledSubject;})(Observable);observableProto.controlled = function(enableQueue, scheduler){if(enableQueue && isScheduler(enableQueue)){scheduler = enableQueue;enableQueue = true;}if(enableQueue == null){enableQueue = true;}return new ControlledObservable(this, enableQueue, scheduler);};var StopAndWaitObservable=(function(__super__){function subscribe(observer){this.subscription = this.source.subscribe(new StopAndWaitObserver(observer, this, this.subscription));var self=this;timeoutScheduler.schedule(function(){self.source.request(1);});return this.subscription;}inherits(StopAndWaitObservable, __super__);function StopAndWaitObservable(source){__super__.call(this, subscribe, source);this.source = source;}var StopAndWaitObserver=(function(__sub__){inherits(StopAndWaitObserver, __sub__);function StopAndWaitObserver(observer, observable, cancel){__sub__.call(this);this.observer = observer;this.observable = observable;this.cancel = cancel;}var stopAndWaitObserverProto=StopAndWaitObserver.prototype;stopAndWaitObserverProto.completed = function(){this.observer.onCompleted();this.dispose();};stopAndWaitObserverProto.error = function(error){this.observer.onError(error);this.dispose();};stopAndWaitObserverProto.next = function(value){this.observer.onNext(value);var self=this;timeoutScheduler.schedule(function(){self.observable.source.request(1);});};stopAndWaitObserverProto.dispose = function(){this.observer = null;if(this.cancel){this.cancel.dispose();this.cancel = null;}__sub__.prototype.dispose.call(this);};return StopAndWaitObserver;})(AbstractObserver);return StopAndWaitObservable;})(Observable);ControlledObservable.prototype.stopAndWait = function(){return new StopAndWaitObservable(this);};var WindowedObservable=(function(__super__){function subscribe(observer){this.subscription = this.source.subscribe(new WindowedObserver(observer, this, this.subscription));var self=this;timeoutScheduler.schedule(function(){self.source.request(self.windowSize);});return this.subscription;}inherits(WindowedObservable, __super__);function WindowedObservable(source, windowSize){__super__.call(this, subscribe, source);this.source = source;this.windowSize = windowSize;}var WindowedObserver=(function(__sub__){inherits(WindowedObserver, __sub__);function WindowedObserver(observer, observable, cancel){this.observer = observer;this.observable = observable;this.cancel = cancel;this.received = 0;}var windowedObserverPrototype=WindowedObserver.prototype;windowedObserverPrototype.completed = function(){this.observer.onCompleted();this.dispose();};windowedObserverPrototype.error = function(error){this.observer.onError(error);this.dispose();};windowedObserverPrototype.next = function(value){this.observer.onNext(value);this.received = ++this.received % this.observable.windowSize;if(this.received === 0){var self=this;timeoutScheduler.schedule(function(){self.observable.source.request(self.observable.windowSize);});}};windowedObserverPrototype.dispose = function(){this.observer = null;if(this.cancel){this.cancel.dispose();this.cancel = null;}__sub__.prototype.dispose.call(this);};return WindowedObserver;})(AbstractObserver);return WindowedObservable;})(Observable);ControlledObservable.prototype.windowed = function(windowSize){return new WindowedObservable(this, windowSize);};observableProto.pipe = function(dest){var source=this.pausableBuffered();function onDrain(){source.resume();}dest.addListener('drain', onDrain);source.subscribe(function(x){!dest.write(String(x)) && source.pause();}, function(err){dest.emit('error', err);}, function(){!dest._isStdio && dest.end();dest.removeListener('drain', onDrain);});source.resume();return dest;};observableProto.multicast = function(subjectOrSubjectSelector, selector){var source=this;return typeof subjectOrSubjectSelector === 'function'?new AnonymousObservable(function(observer){var connectable=source.multicast(subjectOrSubjectSelector());return new CompositeDisposable(selector(connectable).subscribe(observer), connectable.connect());}, source):new ConnectableObservable(source, subjectOrSubjectSelector);};observableProto.publish = function(selector){return selector && isFunction(selector)?this.multicast(function(){return new Subject();}, selector):this.multicast(new Subject());};observableProto.share = function(){return this.publish().refCount();};observableProto.publishLast = function(selector){return selector && isFunction(selector)?this.multicast(function(){return new AsyncSubject();}, selector):this.multicast(new AsyncSubject());};observableProto.publishValue = function(initialValueOrSelector, initialValue){return arguments.length === 2?this.multicast(function(){return new BehaviorSubject(initialValue);}, initialValueOrSelector):this.multicast(new BehaviorSubject(initialValueOrSelector));};observableProto.shareValue = function(initialValue){return this.publishValue(initialValue).refCount();};observableProto.replay = function(selector, bufferSize, windowSize, scheduler){return selector && isFunction(selector)?this.multicast(function(){return new ReplaySubject(bufferSize, windowSize, scheduler);}, selector):this.multicast(new ReplaySubject(bufferSize, windowSize, scheduler));};observableProto.shareReplay = function(bufferSize, windowSize, scheduler){return this.replay(null, bufferSize, windowSize, scheduler).refCount();};var InnerSubscription=function InnerSubscription(subject, observer){this.subject = subject;this.observer = observer;};InnerSubscription.prototype.dispose = function(){if(!this.subject.isDisposed && this.observer !== null){var idx=this.subject.observers.indexOf(this.observer);this.subject.observers.splice(idx, 1);this.observer = null;}};var BehaviorSubject=Rx.BehaviorSubject = (function(__super__){function subscribe(observer){checkDisposed(this);if(!this.isStopped){this.observers.push(observer);observer.onNext(this.value);return new InnerSubscription(this, observer);}if(this.hasError){observer.onError(this.error);}else {observer.onCompleted();}return disposableEmpty;}inherits(BehaviorSubject, __super__);function BehaviorSubject(value){__super__.call(this, subscribe);this.value = value, this.observers = [], this.isDisposed = false, this.isStopped = false, this.hasError = false;}addProperties(BehaviorSubject.prototype, Observer, {getValue:function getValue(){checkDisposed(this);if(this.hasError){throw this.error;}return this.value;}, hasObservers:function hasObservers(){return this.observers.length > 0;}, onCompleted:function onCompleted(){checkDisposed(this);if(this.isStopped){return;}this.isStopped = true;for(var i=0, os=cloneArray(this.observers), len=os.length; i < len; i++) {os[i].onCompleted();}this.observers.length = 0;}, onError:function onError(error){checkDisposed(this);if(this.isStopped){return;}this.isStopped = true;this.hasError = true;this.error = error;for(var i=0, os=cloneArray(this.observers), len=os.length; i < len; i++) {os[i].onError(error);}this.observers.length = 0;}, onNext:function onNext(value){checkDisposed(this);if(this.isStopped){return;}this.value = value;for(var i=0, os=cloneArray(this.observers), len=os.length; i < len; i++) {os[i].onNext(value);}}, dispose:function dispose(){this.isDisposed = true;this.observers = null;this.value = null;this.exception = null;}});return BehaviorSubject;})(Observable);var ReplaySubject=Rx.ReplaySubject = (function(__super__){var maxSafeInteger=Math.pow(2, 53) - 1;function createRemovableDisposable(subject, observer){return disposableCreate(function(){observer.dispose();!subject.isDisposed && subject.observers.splice(subject.observers.indexOf(observer), 1);});}function subscribe(observer){var so=new ScheduledObserver(this.scheduler, observer), subscription=createRemovableDisposable(this, so);checkDisposed(this);this._trim(this.scheduler.now());this.observers.push(so);for(var i=0, len=this.q.length; i < len; i++) {so.onNext(this.q[i].value);}if(this.hasError){so.onError(this.error);}else if(this.isStopped){so.onCompleted();}so.ensureActive();return subscription;}inherits(ReplaySubject, __super__);function ReplaySubject(bufferSize, windowSize, scheduler){this.bufferSize = bufferSize == null?maxSafeInteger:bufferSize;this.windowSize = windowSize == null?maxSafeInteger:windowSize;this.scheduler = scheduler || currentThreadScheduler;this.q = [];this.observers = [];this.isStopped = false;this.isDisposed = false;this.hasError = false;this.error = null;__super__.call(this, subscribe);}addProperties(ReplaySubject.prototype, Observer.prototype, {hasObservers:function hasObservers(){return this.observers.length > 0;}, _trim:function _trim(now){while(this.q.length > this.bufferSize) {this.q.shift();}while(this.q.length > 0 && now - this.q[0].interval > this.windowSize) {this.q.shift();}}, onNext:function onNext(value){checkDisposed(this);if(this.isStopped){return;}var now=this.scheduler.now();this.q.push({interval:now, value:value});this._trim(now);for(var i=0, os=cloneArray(this.observers), len=os.length; i < len; i++) {var observer=os[i];observer.onNext(value);observer.ensureActive();}}, onError:function onError(error){checkDisposed(this);if(this.isStopped){return;}this.isStopped = true;this.error = error;this.hasError = true;var now=this.scheduler.now();this._trim(now);for(var i=0, os=cloneArray(this.observers), len=os.length; i < len; i++) {var observer=os[i];observer.onError(error);observer.ensureActive();}this.observers.length = 0;}, onCompleted:function onCompleted(){checkDisposed(this);if(this.isStopped){return;}this.isStopped = true;var now=this.scheduler.now();this._trim(now);for(var i=0, os=cloneArray(this.observers), len=os.length; i < len; i++) {var observer=os[i];observer.onCompleted();observer.ensureActive();}this.observers.length = 0;}, dispose:function dispose(){this.isDisposed = true;this.observers = null;}});return ReplaySubject;})(Observable);var ConnectableObservable=Rx.ConnectableObservable = (function(__super__){inherits(ConnectableObservable, __super__);function ConnectableObservable(source, subject){var hasSubscription=false, subscription, sourceObservable=source.asObservable();this.connect = function(){if(!hasSubscription){hasSubscription = true;subscription = new CompositeDisposable(sourceObservable.subscribe(subject), disposableCreate(function(){hasSubscription = false;}));}return subscription;};__super__.call(this, function(o){return subject.subscribe(o);});}ConnectableObservable.prototype.refCount = function(){var connectableSubscription, count=0, source=this;return new AnonymousObservable(function(observer){var shouldConnect=++count === 1, subscription=source.subscribe(observer);shouldConnect && (connectableSubscription = source.connect());return function(){subscription.dispose();--count === 0 && connectableSubscription.dispose();};});};return ConnectableObservable;})(Observable);var Dictionary=(function(){var primes=[1, 3, 7, 13, 31, 61, 127, 251, 509, 1021, 2039, 4093, 8191, 16381, 32749, 65521, 131071, 262139, 524287, 1048573, 2097143, 4194301, 8388593, 16777213, 33554393, 67108859, 134217689, 268435399, 536870909, 1073741789, 2147483647], noSuchkey='no such key', duplicatekey='duplicate key';function isPrime(candidate){if((candidate & 1) === 0){return candidate === 2;}var num1=Math.sqrt(candidate), num2=3;while(num2 <= num1) {if(candidate % num2 === 0){return false;}num2 += 2;}return true;}function getPrime(min){var index, num, candidate;for(index = 0; index < primes.length; ++index) {num = primes[index];if(num >= min){return num;}}candidate = min | 1;while(candidate < primes[primes.length - 1]) {if(isPrime(candidate)){return candidate;}candidate += 2;}return min;}function stringHashFn(str){var hash=757602046;if(!str.length){return hash;}for(var i=0, len=str.length; i < len; i++) {var character=str.charCodeAt(i);hash = (hash << 5) - hash + character;hash = hash & hash;}return hash;}function numberHashFn(key){var c2=668265261;key = key ^ 61 ^ key >>> 16;key = key + (key << 3);key = key ^ key >>> 4;key = key * c2;key = key ^ key >>> 15;return key;}var getHashCode=(function(){var uniqueIdCounter=0;return function(obj){if(obj == null){throw new Error(noSuchkey);}if(typeof obj === 'string'){return stringHashFn(obj);}if(typeof obj === 'number'){return numberHashFn(obj);}if(typeof obj === 'boolean'){return obj === true?1:0;}if(obj instanceof Date){return numberHashFn(obj.valueOf());}if(obj instanceof RegExp){return stringHashFn(obj.toString());}if(typeof obj.valueOf === 'function'){var valueOf=obj.valueOf();if(typeof valueOf === 'number'){return numberHashFn(valueOf);}if(typeof valueOf === 'string'){return stringHashFn(valueOf);}}if(obj.hashCode){return obj.hashCode();}var id=17 * uniqueIdCounter++;obj.hashCode = function(){return id;};return id;};})();function newEntry(){return {key:null, value:null, next:0, hashCode:0};}function Dictionary(capacity, comparer){if(capacity < 0){throw new ArgumentOutOfRangeError();}if(capacity > 0){this._initialize(capacity);}this.comparer = comparer || defaultComparer;this.freeCount = 0;this.size = 0;this.freeList = -1;}var dictionaryProto=Dictionary.prototype;dictionaryProto._initialize = function(capacity){var prime=getPrime(capacity), i;this.buckets = new Array(prime);this.entries = new Array(prime);for(i = 0; i < prime; i++) {this.buckets[i] = -1;this.entries[i] = newEntry();}this.freeList = -1;};dictionaryProto.add = function(key, value){this._insert(key, value, true);};dictionaryProto._insert = function(key, value, add){if(!this.buckets){this._initialize(0);}var index3, num=getHashCode(key) & 2147483647, index1=num % this.buckets.length;for(var index2=this.buckets[index1]; index2 >= 0; index2 = this.entries[index2].next) {if(this.entries[index2].hashCode === num && this.comparer(this.entries[index2].key, key)){if(add){throw new Error(duplicatekey);}this.entries[index2].value = value;return;}}if(this.freeCount > 0){index3 = this.freeList;this.freeList = this.entries[index3].next;--this.freeCount;}else {if(this.size === this.entries.length){this._resize();index1 = num % this.buckets.length;}index3 = this.size;++this.size;}this.entries[index3].hashCode = num;this.entries[index3].next = this.buckets[index1];this.entries[index3].key = key;this.entries[index3].value = value;this.buckets[index1] = index3;};dictionaryProto._resize = function(){var prime=getPrime(this.size * 2), numArray=new Array(prime);for(index = 0; index < numArray.length; ++index) {numArray[index] = -1;}var entryArray=new Array(prime);for(index = 0; index < this.size; ++index) {entryArray[index] = this.entries[index];}for(var index=this.size; index < prime; ++index) {entryArray[index] = newEntry();}for(var index1=0; index1 < this.size; ++index1) {var index2=entryArray[index1].hashCode % prime;entryArray[index1].next = numArray[index2];numArray[index2] = index1;}this.buckets = numArray;this.entries = entryArray;};dictionaryProto.remove = function(key){if(this.buckets){var num=getHashCode(key) & 2147483647, index1=num % this.buckets.length, index2=-1;for(var index3=this.buckets[index1]; index3 >= 0; index3 = this.entries[index3].next) {if(this.entries[index3].hashCode === num && this.comparer(this.entries[index3].key, key)){if(index2 < 0){this.buckets[index1] = this.entries[index3].next;}else {this.entries[index2].next = this.entries[index3].next;}this.entries[index3].hashCode = -1;this.entries[index3].next = this.freeList;this.entries[index3].key = null;this.entries[index3].value = null;this.freeList = index3;++this.freeCount;return true;}else {index2 = index3;}}}return false;};dictionaryProto.clear = function(){var index, len;if(this.size <= 0){return;}for(index = 0, len = this.buckets.length; index < len; ++index) {this.buckets[index] = -1;}for(index = 0; index < this.size; ++index) {this.entries[index] = newEntry();}this.freeList = -1;this.size = 0;};dictionaryProto._findEntry = function(key){if(this.buckets){var num=getHashCode(key) & 2147483647;for(var index=this.buckets[num % this.buckets.length]; index >= 0; index = this.entries[index].next) {if(this.entries[index].hashCode === num && this.comparer(this.entries[index].key, key)){return index;}}}return -1;};dictionaryProto.count = function(){return this.size - this.freeCount;};dictionaryProto.tryGetValue = function(key){var entry=this._findEntry(key);return entry >= 0?this.entries[entry].value:undefined;};dictionaryProto.getValues = function(){var index=0, results=[];if(this.entries){for(var index1=0; index1 < this.size; index1++) {if(this.entries[index1].hashCode >= 0){results[index++] = this.entries[index1].value;}}}return results;};dictionaryProto.get = function(key){var entry=this._findEntry(key);if(entry >= 0){return this.entries[entry].value;}throw new Error(noSuchkey);};dictionaryProto.set = function(key, value){this._insert(key, value, false);};dictionaryProto.containskey = function(key){return this._findEntry(key) >= 0;};return Dictionary;})();observableProto.join = function(right, leftDurationSelector, rightDurationSelector, resultSelector){var left=this;return new AnonymousObservable(function(observer){var group=new CompositeDisposable();var leftDone=false, rightDone=false;var leftId=0, rightId=0;var leftMap=new Dictionary(), rightMap=new Dictionary();group.add(left.subscribe(function(value){var id=leftId++;var md=new SingleAssignmentDisposable();leftMap.add(id, value);group.add(md);var expire=function expire(){leftMap.remove(id) && leftMap.count() === 0 && leftDone && observer.onCompleted();group.remove(md);};var duration;try{duration = leftDurationSelector(value);}catch(e) {observer.onError(e);return;}md.setDisposable(duration.take(1).subscribe(noop, observer.onError.bind(observer), expire));rightMap.getValues().forEach(function(v){var result;try{result = resultSelector(value, v);}catch(exn) {observer.onError(exn);return;}observer.onNext(result);});}, observer.onError.bind(observer), function(){leftDone = true;(rightDone || leftMap.count() === 0) && observer.onCompleted();}));group.add(right.subscribe(function(value){var id=rightId++;var md=new SingleAssignmentDisposable();rightMap.add(id, value);group.add(md);var expire=function expire(){rightMap.remove(id) && rightMap.count() === 0 && rightDone && observer.onCompleted();group.remove(md);};var duration;try{duration = rightDurationSelector(value);}catch(e) {observer.onError(e);return;}md.setDisposable(duration.take(1).subscribe(noop, observer.onError.bind(observer), expire));leftMap.getValues().forEach(function(v){var result;try{result = resultSelector(v, value);}catch(exn) {observer.onError(exn);return;}observer.onNext(result);});}, observer.onError.bind(observer), function(){rightDone = true;(leftDone || rightMap.count() === 0) && observer.onCompleted();}));return group;}, left);};observableProto.groupJoin = function(right, leftDurationSelector, rightDurationSelector, resultSelector){var left=this;return new AnonymousObservable(function(observer){var group=new CompositeDisposable();var r=new RefCountDisposable(group);var leftMap=new Dictionary(), rightMap=new Dictionary();var leftId=0, rightId=0;function handleError(e){return function(v){v.onError(e);};};group.add(left.subscribe(function(value){var s=new Subject();var id=leftId++;leftMap.add(id, s);var result;try{result = resultSelector(value, addRef(s, r));}catch(e) {leftMap.getValues().forEach(handleError(e));observer.onError(e);return;}observer.onNext(result);rightMap.getValues().forEach(function(v){s.onNext(v);});var md=new SingleAssignmentDisposable();group.add(md);var expire=function expire(){leftMap.remove(id) && s.onCompleted();group.remove(md);};var duration;try{duration = leftDurationSelector(value);}catch(e) {leftMap.getValues().forEach(handleError(e));observer.onError(e);return;}md.setDisposable(duration.take(1).subscribe(noop, function(e){leftMap.getValues().forEach(handleError(e));observer.onError(e);}, expire));}, function(e){leftMap.getValues().forEach(handleError(e));observer.onError(e);}, observer.onCompleted.bind(observer)));group.add(right.subscribe(function(value){var id=rightId++;rightMap.add(id, value);var md=new SingleAssignmentDisposable();group.add(md);var expire=function expire(){rightMap.remove(id);group.remove(md);};var duration;try{duration = rightDurationSelector(value);}catch(e) {leftMap.getValues().forEach(handleError(e));observer.onError(e);return;}md.setDisposable(duration.take(1).subscribe(noop, function(e){leftMap.getValues().forEach(handleError(e));observer.onError(e);}, expire));leftMap.getValues().forEach(function(v){v.onNext(value);});}, function(e){leftMap.getValues().forEach(handleError(e));observer.onError(e);}));return r;}, left);};observableProto.buffer = function(bufferOpeningsOrClosingSelector, bufferClosingSelector){return this.window.apply(this, arguments).selectMany(function(x){return x.toArray();});};observableProto.window = function(windowOpeningsOrClosingSelector, windowClosingSelector){if(arguments.length === 1 && typeof arguments[0] !== 'function'){return observableWindowWithBoundaries.call(this, windowOpeningsOrClosingSelector);}return typeof windowOpeningsOrClosingSelector === 'function'?observableWindowWithClosingSelector.call(this, windowOpeningsOrClosingSelector):observableWindowWithOpenings.call(this, windowOpeningsOrClosingSelector, windowClosingSelector);};function observableWindowWithOpenings(windowOpenings, windowClosingSelector){return windowOpenings.groupJoin(this, windowClosingSelector, observableEmpty, function(_, win){return win;});}function observableWindowWithBoundaries(windowBoundaries){var source=this;return new AnonymousObservable(function(observer){var win=new Subject(), d=new CompositeDisposable(), r=new RefCountDisposable(d);observer.onNext(addRef(win, r));d.add(source.subscribe(function(x){win.onNext(x);}, function(err){win.onError(err);observer.onError(err);}, function(){win.onCompleted();observer.onCompleted();}));isPromise(windowBoundaries) && (windowBoundaries = observableFromPromise(windowBoundaries));d.add(windowBoundaries.subscribe(function(w){win.onCompleted();win = new Subject();observer.onNext(addRef(win, r));}, function(err){win.onError(err);observer.onError(err);}, function(){win.onCompleted();observer.onCompleted();}));return r;}, source);}function observableWindowWithClosingSelector(windowClosingSelector){var source=this;return new AnonymousObservable(function(observer){var m=new SerialDisposable(), d=new CompositeDisposable(m), r=new RefCountDisposable(d), win=new Subject();observer.onNext(addRef(win, r));d.add(source.subscribe(function(x){win.onNext(x);}, function(err){win.onError(err);observer.onError(err);}, function(){win.onCompleted();observer.onCompleted();}));function createWindowClose(){var windowClose;try{windowClose = windowClosingSelector();}catch(e) {observer.onError(e);return;}isPromise(windowClose) && (windowClose = observableFromPromise(windowClose));var m1=new SingleAssignmentDisposable();m.setDisposable(m1);m1.setDisposable(windowClose.take(1).subscribe(noop, function(err){win.onError(err);observer.onError(err);}, function(){win.onCompleted();win = new Subject();observer.onNext(addRef(win, r));createWindowClose();}));}createWindowClose();return r;}, source);}observableProto.pairwise = function(){var source=this;return new AnonymousObservable(function(observer){var previous, hasPrevious=false;return source.subscribe(function(x){if(hasPrevious){observer.onNext([previous, x]);}else {hasPrevious = true;}previous = x;}, observer.onError.bind(observer), observer.onCompleted.bind(observer));}, source);};observableProto.partition = function(predicate, thisArg){return [this.filter(predicate, thisArg), this.filter(function(x, i, o){return !predicate.call(thisArg, x, i, o);})];};function enumerableWhile(condition, source){return new Enumerable(function(){return new Enumerator(function(){return condition()?{done:false, value:source}:{done:true, value:undefined};});});}observableProto.letBind = observableProto['let'] = function(func){return func(this);};Observable['if'] = Observable.ifThen = function(condition, thenSource, elseSourceOrScheduler){return observableDefer(function(){elseSourceOrScheduler || (elseSourceOrScheduler = observableEmpty());isPromise(thenSource) && (thenSource = observableFromPromise(thenSource));isPromise(elseSourceOrScheduler) && (elseSourceOrScheduler = observableFromPromise(elseSourceOrScheduler));typeof elseSourceOrScheduler.now === 'function' && (elseSourceOrScheduler = observableEmpty(elseSourceOrScheduler));return condition()?thenSource:elseSourceOrScheduler;});};Observable['for'] = Observable.forIn = function(sources, resultSelector, thisArg){return enumerableOf(sources, resultSelector, thisArg).concat();};var observableWhileDo=Observable['while'] = Observable.whileDo = function(condition, source){isPromise(source) && (source = observableFromPromise(source));return enumerableWhile(condition, source).concat();};observableProto.doWhile = function(condition){return observableConcat([this, observableWhileDo(condition, this)]);};Observable['case'] = Observable.switchCase = function(selector, sources, defaultSourceOrScheduler){return observableDefer(function(){isPromise(defaultSourceOrScheduler) && (defaultSourceOrScheduler = observableFromPromise(defaultSourceOrScheduler));defaultSourceOrScheduler || (defaultSourceOrScheduler = observableEmpty());typeof defaultSourceOrScheduler.now === 'function' && (defaultSourceOrScheduler = observableEmpty(defaultSourceOrScheduler));var result=sources[selector()];isPromise(result) && (result = observableFromPromise(result));return result || defaultSourceOrScheduler;});};observableProto.expand = function(selector, scheduler){isScheduler(scheduler) || (scheduler = immediateScheduler);var source=this;return new AnonymousObservable(function(observer){var q=[], m=new SerialDisposable(), d=new CompositeDisposable(m), activeCount=0, isAcquired=false;var ensureActive=function ensureActive(){var isOwner=false;if(q.length > 0){isOwner = !isAcquired;isAcquired = true;}if(isOwner){m.setDisposable(scheduler.scheduleRecursive(function(self){var work;if(q.length > 0){work = q.shift();}else {isAcquired = false;return;}var m1=new SingleAssignmentDisposable();d.add(m1);m1.setDisposable(work.subscribe(function(x){observer.onNext(x);var result=null;try{result = selector(x);}catch(e) {observer.onError(e);}q.push(result);activeCount++;ensureActive();}, observer.onError.bind(observer), function(){d.remove(m1);activeCount--;if(activeCount === 0){observer.onCompleted();}}));self();}));}};q.push(source);activeCount++;ensureActive();return d;}, this);};Observable.forkJoin = function(){var allSources=[];if(Array.isArray(arguments[0])){allSources = arguments[0];}else {for(var i=0, len=arguments.length; i < len; i++) {allSources.push(arguments[i]);}}return new AnonymousObservable(function(subscriber){var count=allSources.length;if(count === 0){subscriber.onCompleted();return disposableEmpty;}var group=new CompositeDisposable(), finished=false, hasResults=new Array(count), hasCompleted=new Array(count), results=new Array(count);for(var idx=0; idx < count; idx++) {(function(i){var source=allSources[i];isPromise(source) && (source = observableFromPromise(source));group.add(source.subscribe(function(value){if(!finished){hasResults[i] = true;results[i] = value;}}, function(e){finished = true;subscriber.onError(e);group.dispose();}, function(){if(!finished){if(!hasResults[i]){subscriber.onCompleted();return;}hasCompleted[i] = true;for(var ix=0; ix < count; ix++) {if(!hasCompleted[ix]){return;}}finished = true;subscriber.onNext(results);subscriber.onCompleted();}}));})(idx);}return group;});};observableProto.forkJoin = function(second, resultSelector){var first=this;return new AnonymousObservable(function(observer){var leftStopped=false, rightStopped=false, hasLeft=false, hasRight=false, lastLeft, lastRight, leftSubscription=new SingleAssignmentDisposable(), rightSubscription=new SingleAssignmentDisposable();isPromise(second) && (second = observableFromPromise(second));leftSubscription.setDisposable(first.subscribe(function(left){hasLeft = true;lastLeft = left;}, function(err){rightSubscription.dispose();observer.onError(err);}, function(){leftStopped = true;if(rightStopped){if(!hasLeft){observer.onCompleted();}else if(!hasRight){observer.onCompleted();}else {var result;try{result = resultSelector(lastLeft, lastRight);}catch(e) {observer.onError(e);return;}observer.onNext(result);observer.onCompleted();}}}));rightSubscription.setDisposable(second.subscribe(function(right){hasRight = true;lastRight = right;}, function(err){leftSubscription.dispose();observer.onError(err);}, function(){rightStopped = true;if(leftStopped){if(!hasLeft){observer.onCompleted();}else if(!hasRight){observer.onCompleted();}else {var result;try{result = resultSelector(lastLeft, lastRight);}catch(e) {observer.onError(e);return;}observer.onNext(result);observer.onCompleted();}}}));return new CompositeDisposable(leftSubscription, rightSubscription);}, first);};observableProto.manySelect = function(selector, scheduler){isScheduler(scheduler) || (scheduler = immediateScheduler);var source=this;return observableDefer(function(){var chain;return source.map(function(x){var curr=new ChainObservable(x);chain && chain.onNext(x);chain = curr;return curr;}).tap(noop, function(e){chain && chain.onError(e);}, function(){chain && chain.onCompleted();}).observeOn(scheduler).map(selector);}, source);};var ChainObservable=(function(__super__){function subscribe(observer){var self=this, g=new CompositeDisposable();g.add(currentThreadScheduler.schedule(function(){observer.onNext(self.head);g.add(self.tail.mergeAll().subscribe(observer));}));return g;}inherits(ChainObservable, __super__);function ChainObservable(head){__super__.call(this, subscribe);this.head = head;this.tail = new AsyncSubject();}addProperties(ChainObservable.prototype, Observer, {onCompleted:function onCompleted(){this.onNext(Observable.empty());}, onError:function onError(e){this.onNext(Observable.throwError(e));}, onNext:function onNext(v){this.tail.onNext(v);this.tail.onCompleted();}});return ChainObservable;})(Observable);var Map=root.Map || (function(){function Map(){this._keys = [];this._values = [];}Map.prototype.get = function(key){var i=this._keys.indexOf(key);return i !== -1?this._values[i]:undefined;};Map.prototype.set = function(key, value){var i=this._keys.indexOf(key);i !== -1 && (this._values[i] = value);this._values[this._keys.push(key) - 1] = value;};Map.prototype.forEach = function(callback, thisArg){for(var i=0, len=this._keys.length; i < len; i++) {callback.call(thisArg, this._values[i], this._keys[i]);}};return Map;})();function Pattern(patterns){this.patterns = patterns;}Pattern.prototype.and = function(other){return new Pattern(this.patterns.concat(other));};Pattern.prototype.thenDo = function(selector){return new Plan(this, selector);};function Plan(expression, selector){this.expression = expression;this.selector = selector;}Plan.prototype.activate = function(externalSubscriptions, observer, deactivate){var self=this;var joinObservers=[];for(var i=0, len=this.expression.patterns.length; i < len; i++) {joinObservers.push(planCreateObserver(externalSubscriptions, this.expression.patterns[i], observer.onError.bind(observer)));}var activePlan=new ActivePlan(joinObservers, function(){var result;try{result = self.selector.apply(self, arguments);}catch(e) {observer.onError(e);return;}observer.onNext(result);}, function(){for(var j=0, jlen=joinObservers.length; j < jlen; j++) {joinObservers[j].removeActivePlan(activePlan);}deactivate(activePlan);});for(i = 0, len = joinObservers.length; i < len; i++) {joinObservers[i].addActivePlan(activePlan);}return activePlan;};function planCreateObserver(externalSubscriptions, observable, onError){var entry=externalSubscriptions.get(observable);if(!entry){var observer=new JoinObserver(observable, onError);externalSubscriptions.set(observable, observer);return observer;}return entry;}function ActivePlan(joinObserverArray, onNext, onCompleted){this.joinObserverArray = joinObserverArray;this.onNext = onNext;this.onCompleted = onCompleted;this.joinObservers = new Map();for(var i=0, len=this.joinObserverArray.length; i < len; i++) {var joinObserver=this.joinObserverArray[i];this.joinObservers.set(joinObserver, joinObserver);}}ActivePlan.prototype.dequeue = function(){this.joinObservers.forEach(function(v){v.queue.shift();});};ActivePlan.prototype.match = function(){var i, len, hasValues=true;for(i = 0, len = this.joinObserverArray.length; i < len; i++) {if(this.joinObserverArray[i].queue.length === 0){hasValues = false;break;}}if(hasValues){var firstValues=[], isCompleted=false;for(i = 0, len = this.joinObserverArray.length; i < len; i++) {firstValues.push(this.joinObserverArray[i].queue[0]);this.joinObserverArray[i].queue[0].kind === 'C' && (isCompleted = true);}if(isCompleted){this.onCompleted();}else {this.dequeue();var values=[];for(i = 0, len = firstValues.length; i < firstValues.length; i++) {values.push(firstValues[i].value);}this.onNext.apply(this, values);}}};var JoinObserver=(function(__super__){inherits(JoinObserver, __super__);function JoinObserver(source, onError){__super__.call(this);this.source = source;this.onError = onError;this.queue = [];this.activePlans = [];this.subscription = new SingleAssignmentDisposable();this.isDisposed = false;}var JoinObserverPrototype=JoinObserver.prototype;JoinObserverPrototype.next = function(notification){if(!this.isDisposed){if(notification.kind === 'E'){return this.onError(notification.exception);}this.queue.push(notification);var activePlans=this.activePlans.slice(0);for(var i=0, len=activePlans.length; i < len; i++) {activePlans[i].match();}}};JoinObserverPrototype.error = noop;JoinObserverPrototype.completed = noop;JoinObserverPrototype.addActivePlan = function(activePlan){this.activePlans.push(activePlan);};JoinObserverPrototype.subscribe = function(){this.subscription.setDisposable(this.source.materialize().subscribe(this));};JoinObserverPrototype.removeActivePlan = function(activePlan){this.activePlans.splice(this.activePlans.indexOf(activePlan), 1);this.activePlans.length === 0 && this.dispose();};JoinObserverPrototype.dispose = function(){__super__.prototype.dispose.call(this);if(!this.isDisposed){this.isDisposed = true;this.subscription.dispose();}};return JoinObserver;})(AbstractObserver);observableProto.and = function(right){return new Pattern([this, right]);};observableProto.thenDo = function(selector){return new Pattern([this]).thenDo(selector);};Observable.when = function(){var len=arguments.length, plans;if(Array.isArray(arguments[0])){plans = arguments[0];}else {plans = new Array(len);for(var i=0; i < len; i++) {plans[i] = arguments[i];}}return new AnonymousObservable(function(o){var activePlans=[], externalSubscriptions=new Map();var outObserver=observerCreate(function(x){o.onNext(x);}, function(err){externalSubscriptions.forEach(function(v){v.onError(err);});o.onError(err);}, function(x){o.onCompleted();});try{for(var i=0, len=plans.length; i < len; i++) {activePlans.push(plans[i].activate(externalSubscriptions, outObserver, function(activePlan){var idx=activePlans.indexOf(activePlan);activePlans.splice(idx, 1);activePlans.length === 0 && o.onCompleted();}));}}catch(e) {observableThrow(e).subscribe(o);}var group=new CompositeDisposable();externalSubscriptions.forEach(function(joinObserver){joinObserver.subscribe();group.add(joinObserver);});return group;});};function observableTimerDate(dueTime, scheduler){return new AnonymousObservable(function(observer){return scheduler.scheduleWithAbsolute(dueTime, function(){observer.onNext(0);observer.onCompleted();});});}function observableTimerDateAndPeriod(dueTime, period, scheduler){return new AnonymousObservable(function(observer){var d=dueTime, p=normalizeTime(period);return scheduler.scheduleRecursiveWithAbsoluteAndState(0, d, function(count, self){if(p > 0){var now=scheduler.now();d = d + p;d <= now && (d = now + p);}observer.onNext(count);self(count + 1, d);});});}function observableTimerTimeSpan(dueTime, scheduler){return new AnonymousObservable(function(observer){return scheduler.scheduleWithRelative(normalizeTime(dueTime), function(){observer.onNext(0);observer.onCompleted();});});}function observableTimerTimeSpanAndPeriod(dueTime, period, scheduler){return dueTime === period?new AnonymousObservable(function(observer){return scheduler.schedulePeriodicWithState(0, period, function(count){observer.onNext(count);return count + 1;});}):observableDefer(function(){return observableTimerDateAndPeriod(scheduler.now() + dueTime, period, scheduler);});}var observableinterval=Observable.interval = function(period, scheduler){return observableTimerTimeSpanAndPeriod(period, period, isScheduler(scheduler)?scheduler:timeoutScheduler);};var observableTimer=Observable.timer = function(dueTime, periodOrScheduler, scheduler){var period;isScheduler(scheduler) || (scheduler = timeoutScheduler);if(periodOrScheduler !== undefined && typeof periodOrScheduler === 'number'){period = periodOrScheduler;}else if(isScheduler(periodOrScheduler)){scheduler = periodOrScheduler;}if(dueTime instanceof Date && period === undefined){return observableTimerDate(dueTime.getTime(), scheduler);}if(dueTime instanceof Date && period !== undefined){period = periodOrScheduler;return observableTimerDateAndPeriod(dueTime.getTime(), period, scheduler);}return period === undefined?observableTimerTimeSpan(dueTime, scheduler):observableTimerTimeSpanAndPeriod(dueTime, period, scheduler);};function observableDelayTimeSpan(source, dueTime, scheduler){return new AnonymousObservable(function(observer){var active=false, cancelable=new SerialDisposable(), exception=null, q=[], running=false, subscription;subscription = source.materialize().timestamp(scheduler).subscribe(function(notification){var d, shouldRun;if(notification.value.kind === 'E'){q = [];q.push(notification);exception = notification.value.exception;shouldRun = !running;}else {q.push({value:notification.value, timestamp:notification.timestamp + dueTime});shouldRun = !active;active = true;}if(shouldRun){if(exception !== null){observer.onError(exception);}else {d = new SingleAssignmentDisposable();cancelable.setDisposable(d);d.setDisposable(scheduler.scheduleRecursiveWithRelative(dueTime, function(self){var e, recurseDueTime, result, shouldRecurse;if(exception !== null){return;}running = true;do {result = null;if(q.length > 0 && q[0].timestamp - scheduler.now() <= 0){result = q.shift().value;}if(result !== null){result.accept(observer);}}while(result !== null);shouldRecurse = false;recurseDueTime = 0;if(q.length > 0){shouldRecurse = true;recurseDueTime = Math.max(0, q[0].timestamp - scheduler.now());}else {active = false;}e = exception;running = false;if(e !== null){observer.onError(e);}else if(shouldRecurse){self(recurseDueTime);}}));}}});return new CompositeDisposable(subscription, cancelable);}, source);}function observableDelayDate(source, dueTime, scheduler){return observableDefer(function(){return observableDelayTimeSpan(source, dueTime - scheduler.now(), scheduler);});}observableProto.delay = function(dueTime, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);return dueTime instanceof Date?observableDelayDate(this, dueTime.getTime(), scheduler):observableDelayTimeSpan(this, dueTime, scheduler);};observableProto.debounce = observableProto.throttleWithTimeout = function(dueTime, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);var source=this;return new AnonymousObservable(function(observer){var cancelable=new SerialDisposable(), hasvalue=false, value, id=0;var subscription=source.subscribe(function(x){hasvalue = true;value = x;id++;var currentId=id, d=new SingleAssignmentDisposable();cancelable.setDisposable(d);d.setDisposable(scheduler.scheduleWithRelative(dueTime, function(){hasvalue && id === currentId && observer.onNext(value);hasvalue = false;}));}, function(e){cancelable.dispose();observer.onError(e);hasvalue = false;id++;}, function(){cancelable.dispose();hasvalue && observer.onNext(value);observer.onCompleted();hasvalue = false;id++;});return new CompositeDisposable(subscription, cancelable);}, this);};observableProto.throttle = function(dueTime, scheduler){return this.debounce(dueTime, scheduler);};observableProto.windowWithTime = function(timeSpan, timeShiftOrScheduler, scheduler){var source=this, timeShift;timeShiftOrScheduler == null && (timeShift = timeSpan);isScheduler(scheduler) || (scheduler = timeoutScheduler);if(typeof timeShiftOrScheduler === 'number'){timeShift = timeShiftOrScheduler;}else if(isScheduler(timeShiftOrScheduler)){timeShift = timeSpan;scheduler = timeShiftOrScheduler;}return new AnonymousObservable(function(observer){var groupDisposable, nextShift=timeShift, nextSpan=timeSpan, q=[], refCountDisposable, timerD=new SerialDisposable(), totalTime=0;groupDisposable = new CompositeDisposable(timerD), refCountDisposable = new RefCountDisposable(groupDisposable);function createTimer(){var m=new SingleAssignmentDisposable(), isSpan=false, isShift=false;timerD.setDisposable(m);if(nextSpan === nextShift){isSpan = true;isShift = true;}else if(nextSpan < nextShift){isSpan = true;}else {isShift = true;}var newTotalTime=isSpan?nextSpan:nextShift, ts=newTotalTime - totalTime;totalTime = newTotalTime;if(isSpan){nextSpan += timeShift;}if(isShift){nextShift += timeShift;}m.setDisposable(scheduler.scheduleWithRelative(ts, function(){if(isShift){var s=new Subject();q.push(s);observer.onNext(addRef(s, refCountDisposable));}isSpan && q.shift().onCompleted();createTimer();}));};q.push(new Subject());observer.onNext(addRef(q[0], refCountDisposable));createTimer();groupDisposable.add(source.subscribe(function(x){for(var i=0, len=q.length; i < len; i++) {q[i].onNext(x);}}, function(e){for(var i=0, len=q.length; i < len; i++) {q[i].onError(e);}observer.onError(e);}, function(){for(var i=0, len=q.length; i < len; i++) {q[i].onCompleted();}observer.onCompleted();}));return refCountDisposable;}, source);};observableProto.windowWithTimeOrCount = function(timeSpan, count, scheduler){var source=this;isScheduler(scheduler) || (scheduler = timeoutScheduler);return new AnonymousObservable(function(observer){var timerD=new SerialDisposable(), groupDisposable=new CompositeDisposable(timerD), refCountDisposable=new RefCountDisposable(groupDisposable), n=0, windowId=0, s=new Subject();function createTimer(id){var m=new SingleAssignmentDisposable();timerD.setDisposable(m);m.setDisposable(scheduler.scheduleWithRelative(timeSpan, function(){if(id !== windowId){return;}n = 0;var newId=++windowId;s.onCompleted();s = new Subject();observer.onNext(addRef(s, refCountDisposable));createTimer(newId);}));}observer.onNext(addRef(s, refCountDisposable));createTimer(0);groupDisposable.add(source.subscribe(function(x){var newId=0, newWindow=false;s.onNext(x);if(++n === count){newWindow = true;n = 0;newId = ++windowId;s.onCompleted();s = new Subject();observer.onNext(addRef(s, refCountDisposable));}newWindow && createTimer(newId);}, function(e){s.onError(e);observer.onError(e);}, function(){s.onCompleted();observer.onCompleted();}));return refCountDisposable;}, source);};observableProto.bufferWithTime = function(timeSpan, timeShiftOrScheduler, scheduler){return this.windowWithTime.apply(this, arguments).selectMany(function(x){return x.toArray();});};observableProto.bufferWithTimeOrCount = function(timeSpan, count, scheduler){return this.windowWithTimeOrCount(timeSpan, count, scheduler).selectMany(function(x){return x.toArray();});};observableProto.timeInterval = function(scheduler){var source=this;isScheduler(scheduler) || (scheduler = timeoutScheduler);return observableDefer(function(){var last=scheduler.now();return source.map(function(x){var now=scheduler.now(), span=now - last;last = now;return {value:x, interval:span};});});};observableProto.timestamp = function(scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);return this.map(function(x){return {value:x, timestamp:scheduler.now()};});};function sampleObservable(source, sampler){return new AnonymousObservable(function(observer){var atEnd, value, hasValue;function sampleSubscribe(){if(hasValue){hasValue = false;observer.onNext(value);}atEnd && observer.onCompleted();}return new CompositeDisposable(source.subscribe(function(newValue){hasValue = true;value = newValue;}, observer.onError.bind(observer), function(){atEnd = true;}), sampler.subscribe(sampleSubscribe, observer.onError.bind(observer), sampleSubscribe));}, source);}observableProto.sample = observableProto.throttleLatest = function(intervalOrSampler, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);return typeof intervalOrSampler === 'number'?sampleObservable(this, observableinterval(intervalOrSampler, scheduler)):sampleObservable(this, intervalOrSampler);};observableProto.timeout = function(dueTime, other, scheduler){(other == null || typeof other === 'string') && (other = observableThrow(new Error(other || 'Timeout')));isScheduler(scheduler) || (scheduler = timeoutScheduler);var source=this, schedulerMethod=dueTime instanceof Date?'scheduleWithAbsolute':'scheduleWithRelative';return new AnonymousObservable(function(observer){var id=0, original=new SingleAssignmentDisposable(), subscription=new SerialDisposable(), switched=false, timer=new SerialDisposable();subscription.setDisposable(original);function createTimer(){var myId=id;timer.setDisposable(scheduler[schedulerMethod](dueTime, function(){if(id === myId){isPromise(other) && (other = observableFromPromise(other));subscription.setDisposable(other.subscribe(observer));}}));}createTimer();original.setDisposable(source.subscribe(function(x){if(!switched){id++;observer.onNext(x);createTimer();}}, function(e){if(!switched){id++;observer.onError(e);}}, function(){if(!switched){id++;observer.onCompleted();}}));return new CompositeDisposable(subscription, timer);}, source);};Observable.generateWithAbsoluteTime = function(initialState, condition, iterate, resultSelector, timeSelector, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);return new AnonymousObservable(function(observer){var first=true, hasResult=false, result, state=initialState, time;return scheduler.scheduleRecursiveWithAbsolute(scheduler.now(), function(self){hasResult && observer.onNext(result);try{if(first){first = false;}else {state = iterate(state);}hasResult = condition(state);if(hasResult){result = resultSelector(state);time = timeSelector(state);}}catch(e) {observer.onError(e);return;}if(hasResult){self(time);}else {observer.onCompleted();}});});};Observable.generateWithRelativeTime = function(initialState, condition, iterate, resultSelector, timeSelector, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);return new AnonymousObservable(function(observer){var first=true, hasResult=false, result, state=initialState, time;return scheduler.scheduleRecursiveWithRelative(0, function(self){hasResult && observer.onNext(result);try{if(first){first = false;}else {state = iterate(state);}hasResult = condition(state);if(hasResult){result = resultSelector(state);time = timeSelector(state);}}catch(e) {observer.onError(e);return;}if(hasResult){self(time);}else {observer.onCompleted();}});});};observableProto.delaySubscription = function(dueTime, scheduler){var scheduleMethod=dueTime instanceof Date?'scheduleWithAbsolute':'scheduleWithRelative';var source=this;isScheduler(scheduler) || (scheduler = timeoutScheduler);return new AnonymousObservable(function(o){var d=new SerialDisposable();d.setDisposable(scheduler[scheduleMethod](dueTime, function(){d.setDisposable(source.subscribe(o));}));return d;}, this);};observableProto.delayWithSelector = function(subscriptionDelay, delayDurationSelector){var source=this, subDelay, selector;if(isFunction(subscriptionDelay)){selector = subscriptionDelay;}else {subDelay = subscriptionDelay;selector = delayDurationSelector;}return new AnonymousObservable(function(observer){var delays=new CompositeDisposable(), atEnd=false, subscription=new SerialDisposable();function start(){subscription.setDisposable(source.subscribe(function(x){var delay=tryCatch(selector)(x);if(delay === errorObj){return observer.onError(delay.e);}var d=new SingleAssignmentDisposable();delays.add(d);d.setDisposable(delay.subscribe(function(){observer.onNext(x);delays.remove(d);done();}, function(e){observer.onError(e);}, function(){observer.onNext(x);delays.remove(d);done();}));}, function(e){observer.onError(e);}, function(){atEnd = true;subscription.dispose();done();}));}function done(){atEnd && delays.length === 0 && observer.onCompleted();}if(!subDelay){start();}else {subscription.setDisposable(subDelay.subscribe(start, function(e){observer.onError(e);}, start));}return new CompositeDisposable(subscription, delays);}, this);};observableProto.timeoutWithSelector = function(firstTimeout, timeoutdurationSelector, other){if(arguments.length === 1){timeoutdurationSelector = firstTimeout;firstTimeout = observableNever();}other || (other = observableThrow(new Error('Timeout')));var source=this;return new AnonymousObservable(function(observer){var subscription=new SerialDisposable(), timer=new SerialDisposable(), original=new SingleAssignmentDisposable();subscription.setDisposable(original);var id=0, switched=false;function setTimer(timeout){var myId=id;function timerWins(){return id === myId;}var d=new SingleAssignmentDisposable();timer.setDisposable(d);d.setDisposable(timeout.subscribe(function(){timerWins() && subscription.setDisposable(other.subscribe(observer));d.dispose();}, function(e){timerWins() && observer.onError(e);}, function(){timerWins() && subscription.setDisposable(other.subscribe(observer));}));};setTimer(firstTimeout);function observerWins(){var res=!switched;if(res){id++;}return res;}original.setDisposable(source.subscribe(function(x){if(observerWins()){observer.onNext(x);var timeout;try{timeout = timeoutdurationSelector(x);}catch(e) {observer.onError(e);return;}setTimer(isPromise(timeout)?observableFromPromise(timeout):timeout);}}, function(e){observerWins() && observer.onError(e);}, function(){observerWins() && observer.onCompleted();}));return new CompositeDisposable(subscription, timer);}, source);};observableProto.debounceWithSelector = function(durationSelector){var source=this;return new AnonymousObservable(function(observer){var value, hasValue=false, cancelable=new SerialDisposable(), id=0;var subscription=source.subscribe(function(x){var throttle;try{throttle = durationSelector(x);}catch(e) {observer.onError(e);return;}isPromise(throttle) && (throttle = observableFromPromise(throttle));hasValue = true;value = x;id++;var currentid=id, d=new SingleAssignmentDisposable();cancelable.setDisposable(d);d.setDisposable(throttle.subscribe(function(){hasValue && id === currentid && observer.onNext(value);hasValue = false;d.dispose();}, observer.onError.bind(observer), function(){hasValue && id === currentid && observer.onNext(value);hasValue = false;d.dispose();}));}, function(e){cancelable.dispose();observer.onError(e);hasValue = false;id++;}, function(){cancelable.dispose();hasValue && observer.onNext(value);observer.onCompleted();hasValue = false;id++;});return new CompositeDisposable(subscription, cancelable);}, source);};observableProto.throttleWithSelector = function(durationSelector){return this.debounceWithSelector(durationSelector);};observableProto.skipLastWithTime = function(duration, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);var source=this;return new AnonymousObservable(function(o){var q=[];return source.subscribe(function(x){var now=scheduler.now();q.push({interval:now, value:x});while(q.length > 0 && now - q[0].interval >= duration) {o.onNext(q.shift().value);}}, function(e){o.onError(e);}, function(){var now=scheduler.now();while(q.length > 0 && now - q[0].interval >= duration) {o.onNext(q.shift().value);}o.onCompleted();});}, source);};observableProto.takeLastWithTime = function(duration, scheduler){var source=this;isScheduler(scheduler) || (scheduler = timeoutScheduler);return new AnonymousObservable(function(o){var q=[];return source.subscribe(function(x){var now=scheduler.now();q.push({interval:now, value:x});while(q.length > 0 && now - q[0].interval >= duration) {q.shift();}}, function(e){o.onError(e);}, function(){var now=scheduler.now();while(q.length > 0) {var next=q.shift();if(now - next.interval <= duration){o.onNext(next.value);}}o.onCompleted();});}, source);};observableProto.takeLastBufferWithTime = function(duration, scheduler){var source=this;isScheduler(scheduler) || (scheduler = timeoutScheduler);return new AnonymousObservable(function(o){var q=[];return source.subscribe(function(x){var now=scheduler.now();q.push({interval:now, value:x});while(q.length > 0 && now - q[0].interval >= duration) {q.shift();}}, function(e){o.onError(e);}, function(){var now=scheduler.now(), res=[];while(q.length > 0) {var next=q.shift();now - next.interval <= duration && res.push(next.value);}o.onNext(res);o.onCompleted();});}, source);};observableProto.takeWithTime = function(duration, scheduler){var source=this;isScheduler(scheduler) || (scheduler = timeoutScheduler);return new AnonymousObservable(function(o){return new CompositeDisposable(scheduler.scheduleWithRelative(duration, function(){o.onCompleted();}), source.subscribe(o));}, source);};observableProto.skipWithTime = function(duration, scheduler){var source=this;isScheduler(scheduler) || (scheduler = timeoutScheduler);return new AnonymousObservable(function(observer){var open=false;return new CompositeDisposable(scheduler.scheduleWithRelative(duration, function(){open = true;}), source.subscribe(function(x){open && observer.onNext(x);}, observer.onError.bind(observer), observer.onCompleted.bind(observer)));}, source);};observableProto.skipUntilWithTime = function(startTime, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);var source=this, schedulerMethod=startTime instanceof Date?'scheduleWithAbsolute':'scheduleWithRelative';return new AnonymousObservable(function(o){var open=false;return new CompositeDisposable(scheduler[schedulerMethod](startTime, function(){open = true;}), source.subscribe(function(x){open && o.onNext(x);}, function(e){o.onError(e);}, function(){o.onCompleted();}));}, source);};observableProto.takeUntilWithTime = function(endTime, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);var source=this, schedulerMethod=endTime instanceof Date?'scheduleWithAbsolute':'scheduleWithRelative';return new AnonymousObservable(function(o){return new CompositeDisposable(scheduler[schedulerMethod](endTime, function(){o.onCompleted();}), source.subscribe(o));}, source);};observableProto.throttleFirst = function(windowDuration, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);var duration=+windowDuration || 0;if(duration <= 0){throw new RangeError('windowDuration cannot be less or equal zero.');}var source=this;return new AnonymousObservable(function(o){var lastOnNext=0;return source.subscribe(function(x){var now=scheduler.now();if(lastOnNext === 0 || now - lastOnNext >= duration){lastOnNext = now;o.onNext(x);}}, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};observableProto.transduce = function(transducer){var source=this;function transformForObserver(o){return {'@@transducer/init':function transducerInit(){return o;}, '@@transducer/step':function transducerStep(obs, input){return obs.onNext(input);}, '@@transducer/result':function transducerResult(obs){return obs.onCompleted();}};}return new AnonymousObservable(function(o){var xform=transducer(transformForObserver(o));return source.subscribe(function(v){try{xform['@@transducer/step'](o, v);}catch(e) {o.onError(e);}}, function(e){o.onError(e);}, function(){xform['@@transducer/result'](o);});}, source);};observableProto.exclusive = function(){var sources=this;return new AnonymousObservable(function(observer){var hasCurrent=false, isStopped=false, m=new SingleAssignmentDisposable(), g=new CompositeDisposable();g.add(m);m.setDisposable(sources.subscribe(function(innerSource){if(!hasCurrent){hasCurrent = true;isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));var innerSubscription=new SingleAssignmentDisposable();g.add(innerSubscription);innerSubscription.setDisposable(innerSource.subscribe(observer.onNext.bind(observer), observer.onError.bind(observer), function(){g.remove(innerSubscription);hasCurrent = false;if(isStopped && g.length === 1){observer.onCompleted();}}));}}, observer.onError.bind(observer), function(){isStopped = true;if(!hasCurrent && g.length === 1){observer.onCompleted();}}));return g;}, this);};observableProto.exclusiveMap = function(selector, thisArg){var sources=this, selectorFunc=bindCallback(selector, thisArg, 3);return new AnonymousObservable(function(observer){var index=0, hasCurrent=false, isStopped=true, m=new SingleAssignmentDisposable(), g=new CompositeDisposable();g.add(m);m.setDisposable(sources.subscribe(function(innerSource){if(!hasCurrent){hasCurrent = true;innerSubscription = new SingleAssignmentDisposable();g.add(innerSubscription);isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));innerSubscription.setDisposable(innerSource.subscribe(function(x){var result;try{result = selectorFunc(x, index++, innerSource);}catch(e) {observer.onError(e);return;}observer.onNext(result);}, function(e){observer.onError(e);}, function(){g.remove(innerSubscription);hasCurrent = false;if(isStopped && g.length === 1){observer.onCompleted();}}));}}, function(e){observer.onError(e);}, function(){isStopped = true;if(g.length === 1 && !hasCurrent){observer.onCompleted();}}));return g;}, this);};Rx.VirtualTimeScheduler = (function(__super__){function localNow(){return this.toDateTimeOffset(this.clock);}function scheduleNow(state, action){return this.scheduleAbsoluteWithState(state, this.clock, action);}function scheduleRelative(state, dueTime, action){return this.scheduleRelativeWithState(state, this.toRelative(dueTime), action);}function scheduleAbsolute(state, dueTime, action){return this.scheduleRelativeWithState(state, this.toRelative(dueTime - this.now()), action);}function invokeAction(scheduler, action){action();return disposableEmpty;}inherits(VirtualTimeScheduler, __super__);function VirtualTimeScheduler(initialClock, comparer){this.clock = initialClock;this.comparer = comparer;this.isEnabled = false;this.queue = new PriorityQueue(1024);__super__.call(this, localNow, scheduleNow, scheduleRelative, scheduleAbsolute);}var VirtualTimeSchedulerPrototype=VirtualTimeScheduler.prototype;VirtualTimeSchedulerPrototype.add = notImplemented;VirtualTimeSchedulerPrototype.toDateTimeOffset = notImplemented;VirtualTimeSchedulerPrototype.toRelative = notImplemented;VirtualTimeSchedulerPrototype.schedulePeriodicWithState = function(state, period, action){var s=new SchedulePeriodicRecursive(this, state, period, action);return s.start();};VirtualTimeSchedulerPrototype.scheduleRelativeWithState = function(state, dueTime, action){var runAt=this.add(this.clock, dueTime);return this.scheduleAbsoluteWithState(state, runAt, action);};VirtualTimeSchedulerPrototype.scheduleRelative = function(dueTime, action){return this.scheduleRelativeWithState(action, dueTime, invokeAction);};VirtualTimeSchedulerPrototype.start = function(){if(!this.isEnabled){this.isEnabled = true;do {var next=this.getNext();if(next !== null){this.comparer(next.dueTime, this.clock) > 0 && (this.clock = next.dueTime);next.invoke();}else {this.isEnabled = false;}}while(this.isEnabled);}};VirtualTimeSchedulerPrototype.stop = function(){this.isEnabled = false;};VirtualTimeSchedulerPrototype.advanceTo = function(time){var dueToClock=this.comparer(this.clock, time);if(this.comparer(this.clock, time) > 0){throw new ArgumentOutOfRangeError();}if(dueToClock === 0){return;}if(!this.isEnabled){this.isEnabled = true;do {var next=this.getNext();if(next !== null && this.comparer(next.dueTime, time) <= 0){this.comparer(next.dueTime, this.clock) > 0 && (this.clock = next.dueTime);next.invoke();}else {this.isEnabled = false;}}while(this.isEnabled);this.clock = time;}};VirtualTimeSchedulerPrototype.advanceBy = function(time){var dt=this.add(this.clock, time), dueToClock=this.comparer(this.clock, dt);if(dueToClock > 0){throw new ArgumentOutOfRangeError();}if(dueToClock === 0){return;}this.advanceTo(dt);};VirtualTimeSchedulerPrototype.sleep = function(time){var dt=this.add(this.clock, time);if(this.comparer(this.clock, dt) >= 0){throw new ArgumentOutOfRangeError();}this.clock = dt;};VirtualTimeSchedulerPrototype.getNext = function(){while(this.queue.length > 0) {var next=this.queue.peek();if(next.isCancelled()){this.queue.dequeue();}else {return next;}}return null;};VirtualTimeSchedulerPrototype.scheduleAbsolute = function(dueTime, action){return this.scheduleAbsoluteWithState(action, dueTime, invokeAction);};VirtualTimeSchedulerPrototype.scheduleAbsoluteWithState = function(state, dueTime, action){var self=this;function run(scheduler, state1){self.queue.remove(si);return action(scheduler, state1);}var si=new ScheduledItem(this, state, run, dueTime, this.comparer);this.queue.enqueue(si);return si.disposable;};return VirtualTimeScheduler;})(Scheduler);Rx.HistoricalScheduler = (function(__super__){inherits(HistoricalScheduler, __super__);function HistoricalScheduler(initialClock, comparer){var clock=initialClock == null?0:initialClock;var cmp=comparer || defaultSubComparer;__super__.call(this, clock, cmp);}var HistoricalSchedulerProto=HistoricalScheduler.prototype;HistoricalSchedulerProto.add = function(absolute, relative){return absolute + relative;};HistoricalSchedulerProto.toDateTimeOffset = function(absolute){return new Date(absolute).getTime();};HistoricalSchedulerProto.toRelative = function(timeSpan){return timeSpan;};return HistoricalScheduler;})(Rx.VirtualTimeScheduler);var AnonymousObservable=Rx.AnonymousObservable = (function(__super__){inherits(AnonymousObservable, __super__);function fixSubscriber(subscriber){return subscriber && isFunction(subscriber.dispose)?subscriber:isFunction(subscriber)?disposableCreate(subscriber):disposableEmpty;}function setDisposable(s, state){var ado=state[0], subscribe=state[1];var sub=tryCatch(subscribe)(ado);if(sub === errorObj){if(!ado.fail(errorObj.e)){return thrower(errorObj.e);}}ado.setDisposable(fixSubscriber(sub));}function AnonymousObservable(subscribe, parent){this.source = parent;function s(observer){var ado=new AutoDetachObserver(observer), state=[ado, subscribe];if(currentThreadScheduler.scheduleRequired()){currentThreadScheduler.scheduleWithState(state, setDisposable);}else {setDisposable(null, state);}return ado;}__super__.call(this, s);}return AnonymousObservable;})(Observable);var AutoDetachObserver=(function(__super__){inherits(AutoDetachObserver, __super__);function AutoDetachObserver(observer){__super__.call(this);this.observer = observer;this.m = new SingleAssignmentDisposable();}var AutoDetachObserverPrototype=AutoDetachObserver.prototype;AutoDetachObserverPrototype.next = function(value){var result=tryCatch(this.observer.onNext).call(this.observer, value);if(result === errorObj){this.dispose();thrower(result.e);}};AutoDetachObserverPrototype.error = function(err){var result=tryCatch(this.observer.onError).call(this.observer, err);this.dispose();result === errorObj && thrower(result.e);};AutoDetachObserverPrototype.completed = function(){var result=tryCatch(this.observer.onCompleted).call(this.observer);this.dispose();result === errorObj && thrower(result.e);};AutoDetachObserverPrototype.setDisposable = function(value){this.m.setDisposable(value);};AutoDetachObserverPrototype.getDisposable = function(){return this.m.getDisposable();};AutoDetachObserverPrototype.dispose = function(){__super__.prototype.dispose.call(this);this.m.dispose();};return AutoDetachObserver;})(AbstractObserver);var GroupedObservable=(function(__super__){inherits(GroupedObservable, __super__);function subscribe(observer){return this.underlyingObservable.subscribe(observer);}function GroupedObservable(key, underlyingObservable, mergedDisposable){__super__.call(this, subscribe);this.key = key;this.underlyingObservable = !mergedDisposable?underlyingObservable:new AnonymousObservable(function(observer){return new CompositeDisposable(mergedDisposable.getDisposable(), underlyingObservable.subscribe(observer));});}return GroupedObservable;})(Observable);var Subject=Rx.Subject = (function(__super__){function subscribe(observer){checkDisposed(this);if(!this.isStopped){this.observers.push(observer);return new InnerSubscription(this, observer);}if(this.hasError){observer.onError(this.error);return disposableEmpty;}observer.onCompleted();return disposableEmpty;}inherits(Subject, __super__);function Subject(){__super__.call(this, subscribe);this.isDisposed = false, this.isStopped = false, this.observers = [];this.hasError = false;}addProperties(Subject.prototype, Observer.prototype, {hasObservers:function hasObservers(){return this.observers.length > 0;}, onCompleted:function onCompleted(){checkDisposed(this);if(!this.isStopped){this.isStopped = true;for(var i=0, os=cloneArray(this.observers), len=os.length; i < len; i++) {os[i].onCompleted();}this.observers.length = 0;}}, onError:function onError(error){checkDisposed(this);if(!this.isStopped){this.isStopped = true;this.error = error;this.hasError = true;for(var i=0, os=cloneArray(this.observers), len=os.length; i < len; i++) {os[i].onError(error);}this.observers.length = 0;}}, onNext:function onNext(value){checkDisposed(this);if(!this.isStopped){for(var i=0, os=cloneArray(this.observers), len=os.length; i < len; i++) {os[i].onNext(value);}}}, dispose:function dispose(){this.isDisposed = true;this.observers = null;}});Subject.create = function(observer, observable){return new AnonymousSubject(observer, observable);};return Subject;})(Observable);var AsyncSubject=Rx.AsyncSubject = (function(__super__){function subscribe(observer){checkDisposed(this);if(!this.isStopped){this.observers.push(observer);return new InnerSubscription(this, observer);}if(this.hasError){observer.onError(this.error);}else if(this.hasValue){observer.onNext(this.value);observer.onCompleted();}else {observer.onCompleted();}return disposableEmpty;}inherits(AsyncSubject, __super__);function AsyncSubject(){__super__.call(this, subscribe);this.isDisposed = false;this.isStopped = false;this.hasValue = false;this.observers = [];this.hasError = false;}addProperties(AsyncSubject.prototype, Observer, {hasObservers:function hasObservers(){checkDisposed(this);return this.observers.length > 0;}, onCompleted:function onCompleted(){var i, len;checkDisposed(this);if(!this.isStopped){this.isStopped = true;var os=cloneArray(this.observers), len=os.length;if(this.hasValue){for(i = 0; i < len; i++) {var o=os[i];o.onNext(this.value);o.onCompleted();}}else {for(i = 0; i < len; i++) {os[i].onCompleted();}}this.observers.length = 0;}}, onError:function onError(error){checkDisposed(this);if(!this.isStopped){this.isStopped = true;this.hasError = true;this.error = error;for(var i=0, os=cloneArray(this.observers), len=os.length; i < len; i++) {os[i].onError(error);}this.observers.length = 0;}}, onNext:function onNext(value){checkDisposed(this);if(this.isStopped){return;}this.value = value;this.hasValue = true;}, dispose:function dispose(){this.isDisposed = true;this.observers = null;this.exception = null;this.value = null;}});return AsyncSubject;})(Observable);var AnonymousSubject=Rx.AnonymousSubject = (function(__super__){inherits(AnonymousSubject, __super__);function subscribe(observer){return this.observable.subscribe(observer);}function AnonymousSubject(observer, observable){this.observer = observer;this.observable = observable;__super__.call(this, subscribe);}addProperties(AnonymousSubject.prototype, Observer.prototype, {onCompleted:function onCompleted(){this.observer.onCompleted();}, onError:function onError(error){this.observer.onError(error);}, onNext:function onNext(value){this.observer.onNext(value);}});return AnonymousSubject;})(Observable);Rx.Pauser = (function(__super__){inherits(Pauser, __super__);function Pauser(){__super__.call(this);}Pauser.prototype.pause = function(){this.onNext(false);};Pauser.prototype.resume = function(){this.onNext(true);};return Pauser;})(Subject);if(typeof define == 'function' && typeof define.amd == 'object' && define.amd){root.Rx = Rx;define(function(){return Rx;});}else if(freeExports && freeModule){if(moduleExports){(freeModule.exports = Rx).Rx = Rx;}else {freeExports.Rx = Rx;}}else {root.Rx = Rx;}var rEndingLine=captureLine();}).call(undefined);

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":90}],97:[function(require,module,exports){
'use strict';

var escape = require('escape-html');
var propConfig = require('./property-config');
var types = propConfig.attributeTypes;
var properties = propConfig.properties;
var attributeNames = propConfig.attributeNames;

var prefixAttribute = memoizeString(function (name) {
  return escape(name) + '="';
});

module.exports = createAttribute;

/**
 * Create attribute string.
 *
 * @param {String} name The name of the property or attribute
 * @param {*} value The value
 * @param {Boolean} [isAttribute] Denotes whether `name` is an attribute.
 * @return {?String} Attribute string || null if not a valid property or custom attribute.
 */

function createAttribute(name, value, isAttribute) {
  var attrType = properties[name];
  if (attrType) {
    if (shouldSkip(name, value)) return '';
    name = (attributeNames[name] || name).toLowerCase();
    // for BOOLEAN `value` only has to be truthy
    // for OVERLOADED_BOOLEAN `value` has to be === true
    if (attrType === types.BOOLEAN || attrType === types.OVERLOADED_BOOLEAN && value === true) {
      return escape(name);
    }
    return prefixAttribute(name) + escape(value) + '"';
  } else if (isAttribute) {
    if (value == null) return '';
    return prefixAttribute(name) + escape(value) + '"';
  }
  // return null if `name` is neither a valid property nor an attribute
  return null;
}

/**
 * Should skip false boolean attributes.
 */

function shouldSkip(name, value) {
  var attrType = properties[name];
  return value == null || attrType === types.BOOLEAN && !value || attrType === types.OVERLOADED_BOOLEAN && value === false;
}

/**
 * Memoizes the return value of a function that accepts one string argument.
 *
 * @param {function} callback
 * @return {function}
 */

function memoizeString(callback) {
  var cache = {};
  return function (string) {
    if (cache.hasOwnProperty(string)) {
      return cache[string];
    } else {
      return cache[string] = callback.call(this, string);
    }
  };
}

},{"./property-config":107,"escape-html":99}],98:[function(require,module,exports){
'use strict';

var escape = require('escape-html');
var extend = require('xtend');
var isVNode = require('virtual-dom/vnode/is-vnode');
var isVText = require('virtual-dom/vnode/is-vtext');
var isThunk = require('virtual-dom/vnode/is-thunk');
var softHook = require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook');
var attrHook = require('virtual-dom/virtual-hyperscript/hooks/attribute-hook');
var paramCase = require('param-case');
var createAttribute = require('./create-attribute');
var voidElements = require('./void-elements');

module.exports = toHTML;

function toHTML(node, parent) {
  if (!node) return '';

  if (isThunk(node)) {
    node = node.render();
  }

  if (isVNode(node)) {
    return openTag(node) + tagContent(node) + closeTag(node);
  } else if (isVText(node)) {
    if (parent && parent.tagName.toLowerCase() === 'script') return String(node.text);
    return escape(String(node.text));
  }

  return '';
}

function openTag(node) {
  var props = node.properties;
  var ret = '<' + node.tagName.toLowerCase();

  for (var name in props) {
    var value = props[name];
    if (value == null) continue;

    if (name == 'attributes') {
      value = extend({}, value);
      for (var attrProp in value) {
        ret += ' ' + createAttribute(attrProp, value[attrProp], true);
      }
      continue;
    }

    if (name == 'style') {
      var css = '';
      value = extend({}, value);
      for (var styleProp in value) {
        css += paramCase(styleProp) + ': ' + value[styleProp] + '; ';
      }
      value = css.trim();
    }

    if (value instanceof softHook || value instanceof attrHook) {
      ret += ' ' + createAttribute(name, value.value, true);
      continue;
    }

    var attr = createAttribute(name, value);
    if (attr) ret += ' ' + attr;
  }

  return ret + '>';
}

function tagContent(node) {
  var innerHTML = node.properties.innerHTML;
  if (innerHTML != null) return innerHTML;else {
    var ret = '';
    if (node.children && node.children.length) {
      for (var i = 0, l = node.children.length; i < l; i++) {
        var child = node.children[i];
        ret += toHTML(child, node);
      }
    }
    return ret;
  }
}

function closeTag(node) {
  var tag = node.tagName.toLowerCase();
  return voidElements[tag] ? '' : '</' + tag + '>';
}

},{"./create-attribute":97,"./void-elements":108,"escape-html":99,"param-case":105,"virtual-dom/virtual-hyperscript/hooks/attribute-hook":127,"virtual-dom/virtual-hyperscript/hooks/soft-set-hook":129,"virtual-dom/vnode/is-thunk":133,"virtual-dom/vnode/is-vnode":135,"virtual-dom/vnode/is-vtext":136,"xtend":106}],99:[function(require,module,exports){
/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} html
 * @return {String}
 * @api private
 */

'use strict';

module.exports = function (html) {
  return String(html).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

},{}],100:[function(require,module,exports){
/**
 * Special language-specific overrides.
 *
 * Source: ftp://ftp.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
 *
 * @type {Object}
 */
'use strict';

var LANGUAGES = {
  tr: {
    regexp: /\u0130|\u0049|\u0049\u0307/g,
    map: {
      'İ': 'i',
      'I': 'ı',
      'İ': 'i'
    }
  },
  az: {
    regexp: /[\u0130]/g,
    map: {
      'İ': 'i',
      'I': 'ı',
      'İ': 'i'
    }
  },
  lt: {
    regexp: /[\u0049\u004A\u012E\u00CC\u00CD\u0128]/g,
    map: {
      'I': 'i̇',
      'J': 'j̇',
      'Į': 'į̇',
      'Ì': 'i̇̀',
      'Í': 'i̇́',
      'Ĩ': 'i̇̃'
    }
  }
};

/**
 * Lowercase a string.
 *
 * @param  {String} str
 * @return {String}
 */
module.exports = function (str, locale) {
  var lang = LANGUAGES[locale];

  str = str == null ? '' : String(str);

  if (lang) {
    str = str.replace(lang.regexp, function (m) {
      return lang.map[m];
    });
  }

  return str.toLowerCase();
};

},{}],101:[function(require,module,exports){
'use strict';

var lowerCase = require('lower-case');

var NON_WORD_REGEXP = require('./vendor/non-word-regexp');
var CAMEL_CASE_REGEXP = require('./vendor/camel-case-regexp');
var TRAILING_DIGIT_REGEXP = require('./vendor/trailing-digit-regexp');

/**
 * Sentence case a string.
 *
 * @param  {String} str
 * @param  {String} locale
 * @param  {String} replacement
 * @return {String}
 */
module.exports = function (str, locale, replacement) {
  if (str == null) {
    return '';
  }

  replacement = replacement || ' ';

  function replace(match, index, string) {
    if (index === 0 || index === string.length - match.length) {
      return '';
    }

    return replacement;
  }

  str = String(str)
  // Support camel case ("camelCase" -> "camel Case").
  .replace(CAMEL_CASE_REGEXP, '$1 $2')
  // Support digit groups ("test2012" -> "test 2012").
  .replace(TRAILING_DIGIT_REGEXP, '$1 $2')
  // Remove all non-word characters and replace with a single space.
  .replace(NON_WORD_REGEXP, replace);

  // Lower case the entire string.
  return lowerCase(str, locale);
};

},{"./vendor/camel-case-regexp":102,"./vendor/non-word-regexp":103,"./vendor/trailing-digit-regexp":104,"lower-case":100}],102:[function(require,module,exports){
"use strict";

module.exports = /([\u0061-\u007A\u00B5\u00DF-\u00F6\u00F8-\u00FF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0561-\u0587\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7FA\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A])([\u0041-\u005A\u00C0-\u00D6\u00D8-\u00DE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA\uFF21-\uFF3A\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])/g;

},{}],103:[function(require,module,exports){
"use strict";

module.exports = /[^\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]+/g;

},{}],104:[function(require,module,exports){
"use strict";

module.exports = /([\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])([^\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])/g;

},{}],105:[function(require,module,exports){
'use strict';

var sentenceCase = require('sentence-case');

/**
 * Param case a string.
 *
 * @param  {String} string
 * @param  {String} [locale]
 * @return {String}
 */
module.exports = function (string, locale) {
  return sentenceCase(string, locale, '-');
};

},{"sentence-case":101}],106:[function(require,module,exports){
"use strict";

module.exports = extend;

function extend() {
    var target = {};

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }

    return target;
}

},{}],107:[function(require,module,exports){
/**
 * Attribute types.
 */

'use strict';

var types = {
  BOOLEAN: 1,
  OVERLOADED_BOOLEAN: 2
};

/**
 * Properties.
 *
 * Taken from https://github.com/facebook/react/blob/847357e42e5267b04dd6e297219eaa125ab2f9f4/src/browser/ui/dom/HTMLDOMPropertyConfig.js
 *
 */

var properties = {
  /**
   * Standard Properties
   */
  accept: true,
  acceptCharset: true,
  accessKey: true,
  action: true,
  allowFullScreen: types.BOOLEAN,
  allowTransparency: true,
  alt: true,
  async: types.BOOLEAN,
  autocomplete: true,
  autofocus: types.BOOLEAN,
  autoplay: types.BOOLEAN,
  cellPadding: true,
  cellSpacing: true,
  charset: true,
  checked: types.BOOLEAN,
  classID: true,
  className: true,
  cols: true,
  colSpan: true,
  content: true,
  contentEditable: true,
  contextMenu: true,
  controls: types.BOOLEAN,
  coords: true,
  crossOrigin: true,
  data: true, // For `<object />` acts as `src`.
  dateTime: true,
  defer: types.BOOLEAN,
  dir: true,
  disabled: types.BOOLEAN,
  download: types.OVERLOADED_BOOLEAN,
  draggable: true,
  enctype: true,
  form: true,
  formAction: true,
  formEncType: true,
  formMethod: true,
  formNoValidate: types.BOOLEAN,
  formTarget: true,
  frameBorder: true,
  headers: true,
  height: true,
  hidden: types.BOOLEAN,
  href: true,
  hreflang: true,
  htmlFor: true,
  httpEquiv: true,
  icon: true,
  id: true,
  label: true,
  lang: true,
  list: true,
  loop: types.BOOLEAN,
  manifest: true,
  marginHeight: true,
  marginWidth: true,
  max: true,
  maxLength: true,
  media: true,
  mediaGroup: true,
  method: true,
  min: true,
  multiple: types.BOOLEAN,
  muted: types.BOOLEAN,
  name: true,
  noValidate: types.BOOLEAN,
  open: true,
  pattern: true,
  placeholder: true,
  poster: true,
  preload: true,
  radiogroup: true,
  readOnly: types.BOOLEAN,
  rel: true,
  required: types.BOOLEAN,
  role: true,
  rows: true,
  rowSpan: true,
  sandbox: true,
  scope: true,
  scrolling: true,
  seamless: types.BOOLEAN,
  selected: types.BOOLEAN,
  shape: true,
  size: true,
  sizes: true,
  span: true,
  spellcheck: true,
  src: true,
  srcdoc: true,
  srcset: true,
  start: true,
  step: true,
  style: true,
  tabIndex: true,
  target: true,
  title: true,
  type: true,
  useMap: true,
  value: true,
  width: true,
  wmode: true,

  /**
   * Non-standard Properties
   */
  // autoCapitalize and autoCorrect are supported in Mobile Safari for
  // keyboard hints.
  autocapitalize: true,
  autocorrect: true,
  // itemProp, itemScope, itemType are for Microdata support. See
  // http://schema.org/docs/gs.html
  itemProp: true,
  itemScope: types.BOOLEAN,
  itemType: true,
  // property is supported for OpenGraph in meta tags.
  property: true
};

/**
 * Properties to attributes mapping.
 *
 * The ones not here are simply converted to lower case.
 */

var attributeNames = {
  acceptCharset: 'accept-charset',
  className: 'class',
  htmlFor: 'for',
  httpEquiv: 'http-equiv'
};

/**
 * Exports.
 */

module.exports = {
  attributeTypes: types,
  properties: properties,
  attributeNames: attributeNames
};

},{}],108:[function(require,module,exports){

/**
 * Void elements.
 *
 * https://github.com/facebook/react/blob/v0.12.0/src/browser/ui/ReactDOMComponent.js#L99
 */

'use strict';

module.exports = {
  'area': true,
  'base': true,
  'br': true,
  'col': true,
  'embed': true,
  'hr': true,
  'img': true,
  'input': true,
  'keygen': true,
  'link': true,
  'meta': true,
  'param': true,
  'source': true,
  'track': true,
  'wbr': true
};

},{}],109:[function(require,module,exports){
"use strict";

var createElement = require("./vdom/create-element.js");

module.exports = createElement;

},{"./vdom/create-element.js":122}],110:[function(require,module,exports){
"use strict";

var diff = require("./vtree/diff.js");

module.exports = diff;

},{"./vtree/diff.js":143}],111:[function(require,module,exports){
"use strict";

var h = require("./virtual-hyperscript/index.js");

module.exports = h;

},{"./virtual-hyperscript/index.js":130}],112:[function(require,module,exports){
"use strict";

var diff = require("./diff.js");
var patch = require("./patch.js");
var h = require("./h.js");
var create = require("./create-element.js");
var VNode = require("./vnode/vnode.js");
var VText = require("./vnode/vtext.js");

module.exports = {
    diff: diff,
    patch: patch,
    h: h,
    create: create,
    VNode: VNode,
    VText: VText
};

},{"./create-element.js":109,"./diff.js":110,"./h.js":111,"./patch.js":120,"./vnode/vnode.js":139,"./vnode/vtext.js":141}],113:[function(require,module,exports){
/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
"use strict";

module.exports = (function split(undef) {

  var nativeSplit = String.prototype.split,
      compliantExecNpcg = /()??/.exec("")[1] === undef,

  // NPCG: nonparticipating capturing group
  self;

  self = function (str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
        flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + (separator.sticky ? "y" : ""),

    // Firefox 3+
    lastLastIndex = 0,

    // Make `global` and avoid `lastIndex` issues by working with a copy
    separator = new RegExp(separator.source, flags + "g"),
        separator2,
        match,
        lastIndex,
        lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function () {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();
// Proposed for ES6

},{}],114:[function(require,module,exports){
'use strict';

var OneVersionConstraint = require('individual/one-version');

var MY_VERSION = '7';
OneVersionConstraint('ev-store', MY_VERSION);

var hashKey = '__EV_STORE_KEY@' + MY_VERSION;

module.exports = EvStore;

function EvStore(elem) {
    var hash = elem[hashKey];

    if (!hash) {
        hash = elem[hashKey] = {};
    }

    return hash;
}

},{"individual/one-version":116}],115:[function(require,module,exports){
(function (global){
'use strict';

/*global window, global*/

var root = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {};

module.exports = Individual;

function Individual(key, value) {
    if (key in root) {
        return root[key];
    }

    root[key] = value;

    return value;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],116:[function(require,module,exports){
'use strict';

var Individual = require('./index.js');

module.exports = OneVersion;

function OneVersion(moduleName, version, defaultValue) {
    var key = '__INDIVIDUAL_ONE_VERSION_' + moduleName;
    var enforceKey = key + '_ENFORCE_SINGLETON';

    var versionValue = Individual(enforceKey, version);

    if (versionValue !== version) {
        throw new Error('Can only have one copy of ' + moduleName + '.\n' + 'You already have version ' + versionValue + ' installed.\n' + 'This means you cannot install version ' + version);
    }

    return Individual(key, defaultValue);
}

},{"./index.js":115}],117:[function(require,module,exports){
(function (global){
'use strict';

var topLevel = typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : {};
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":89}],118:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],119:[function(require,module,exports){
"use strict";

var nativeIsArray = Array.isArray;
var toString = Object.prototype.toString;

module.exports = nativeIsArray || isArray;

function isArray(obj) {
    return toString.call(obj) === "[object Array]";
}

},{}],120:[function(require,module,exports){
"use strict";

var patch = require("./vdom/patch.js");

module.exports = patch;

},{"./vdom/patch.js":125}],121:[function(require,module,exports){
"use strict";

var isObject = require("is-object");
var isHook = require("../vnode/is-vhook.js");

module.exports = applyProperties;

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName];

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        } else if (isHook(propValue)) {
            removeProperty(node, propName, propValue, previous);
            if (propValue.hook) {
                propValue.hook(node, propName, previous ? previous[propName] : undefined);
            }
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                node[propName] = propValue;
            }
        }
    }
}

function removeProperty(node, propName, propValue, previous) {
    if (previous) {
        var previousValue = previous[propName];

        if (!isHook(previousValue)) {
            if (propName === "attributes") {
                for (var attrName in previousValue) {
                    node.removeAttribute(attrName);
                }
            } else if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = "";
                }
            } else if (typeof previousValue === "string") {
                node[propName] = "";
            } else {
                node[propName] = null;
            }
        } else if (previousValue.unhook) {
            previousValue.unhook(node, propName, propValue);
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    var previousValue = previous ? previous[propName] : undefined;

    // Set attributes
    if (propName === "attributes") {
        for (var attrName in propValue) {
            var attrValue = propValue[attrName];

            if (attrValue === undefined) {
                node.removeAttribute(attrName);
            } else {
                node.setAttribute(attrName, attrValue);
            }
        }

        return;
    }

    if (previousValue && isObject(previousValue) && getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue;
        return;
    }

    if (!isObject(node[propName])) {
        node[propName] = {};
    }

    var replacer = propName === "style" ? "" : undefined;

    for (var k in propValue) {
        var value = propValue[k];
        node[propName][k] = value === undefined ? replacer : value;
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value);
    } else if (value.__proto__) {
        return value.__proto__;
    } else if (value.constructor) {
        return value.constructor.prototype;
    }
}

},{"../vnode/is-vhook.js":134,"is-object":118}],122:[function(require,module,exports){
"use strict";

var document = require("global/document");

var applyProperties = require("./apply-properties");

var isVNode = require("../vnode/is-vnode.js");
var isVText = require("../vnode/is-vtext.js");
var isWidget = require("../vnode/is-widget.js");
var handleThunk = require("../vnode/handle-thunk.js");

module.exports = createElement;

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document;
    var warn = opts ? opts.warn : null;

    vnode = handleThunk(vnode).a;

    if (isWidget(vnode)) {
        return vnode.init();
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text);
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode);
        }
        return null;
    }

    var node = vnode.namespace === null ? doc.createElement(vnode.tagName) : doc.createElementNS(vnode.namespace, vnode.tagName);

    var props = vnode.properties;
    applyProperties(node, props);

    var children = vnode.children;

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts);
        if (childNode) {
            node.appendChild(childNode);
        }
    }

    return node;
}

},{"../vnode/handle-thunk.js":132,"../vnode/is-vnode.js":135,"../vnode/is-vtext.js":136,"../vnode/is-widget.js":137,"./apply-properties":121,"global/document":117}],123:[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

"use strict";

var noChild = {};

module.exports = domIndex;

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {};
    } else {
        indices.sort(ascending);
        return recurse(rootNode, tree, indices, nodes, 0);
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {};

    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode;
        }

        var vChildren = tree.children;

        if (vChildren) {

            var childNodes = rootNode.childNodes;

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1;

                var vChild = vChildren[i] || noChild;
                var nextIndex = rootIndex + (vChild.count || 0);

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex);
                }

                rootIndex = nextIndex;
            }
        }
    }

    return nodes;
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false;
    }

    var minIndex = 0;
    var maxIndex = indices.length - 1;
    var currentIndex;
    var currentItem;

    while (minIndex <= maxIndex) {
        currentIndex = (maxIndex + minIndex) / 2 >> 0;
        currentItem = indices[currentIndex];

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right;
        } else if (currentItem < left) {
            minIndex = currentIndex + 1;
        } else if (currentItem > right) {
            maxIndex = currentIndex - 1;
        } else {
            return true;
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1;
}

},{}],124:[function(require,module,exports){
"use strict";

var applyProperties = require("./apply-properties");

var isWidget = require("../vnode/is-widget.js");
var VPatch = require("../vnode/vpatch.js");

var render = require("./create-element");
var updateWidget = require("./update-widget");

module.exports = applyPatch;

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type;
    var vNode = vpatch.vNode;
    var patch = vpatch.patch;

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode);
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions);
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions);
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions);
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions);
        case VPatch.ORDER:
            reorderChildren(domNode, patch);
            return domNode;
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties);
            return domNode;
        case VPatch.THUNK:
            return replaceRoot(domNode, renderOptions.patch(domNode, patch, renderOptions));
        default:
            return domNode;
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode;

    if (parentNode) {
        parentNode.removeChild(domNode);
    }

    destroyWidget(domNode, vNode);

    return null;
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = render(vNode, renderOptions);

    if (parentNode) {
        parentNode.appendChild(newNode);
    }

    return parentNode;
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode;

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text);
        newNode = domNode;
    } else {
        var parentNode = domNode.parentNode;
        newNode = render(vText, renderOptions);

        if (parentNode && newNode !== domNode) {
            parentNode.replaceChild(newNode, domNode);
        }
    }

    return newNode;
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    var updating = updateWidget(leftVNode, widget);
    var newNode;

    if (updating) {
        newNode = widget.update(leftVNode, domNode) || domNode;
    } else {
        newNode = render(widget, renderOptions);
    }

    var parentNode = domNode.parentNode;

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode);
    }

    if (!updating) {
        destroyWidget(domNode, leftVNode);
    }

    return newNode;
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode;
    var newNode = render(vNode, renderOptions);

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode);
    }

    return newNode;
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode);
    }
}

function reorderChildren(domNode, moves) {
    var childNodes = domNode.childNodes;
    var keyMap = {};
    var node;
    var remove;
    var insert;

    for (var i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i];
        node = childNodes[remove.from];
        if (remove.key) {
            keyMap[remove.key] = node;
        }
        domNode.removeChild(node);
    }

    var length = childNodes.length;
    for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j];
        node = keyMap[insert.key];
        // this is the weirdest bug i've ever seen in webkit
        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to]);
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        oldRoot.parentNode.replaceChild(newRoot, oldRoot);
    }

    return newRoot;
}

},{"../vnode/is-widget.js":137,"../vnode/vpatch.js":140,"./apply-properties":121,"./create-element":122,"./update-widget":126}],125:[function(require,module,exports){
"use strict";

var document = require("global/document");
var isArray = require("x-is-array");

var domIndex = require("./dom-index");
var patchOp = require("./patch-op");
module.exports = patch;

function patch(rootNode, patches) {
    return patchRecursive(rootNode, patches);
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches);

    if (indices.length === 0) {
        return rootNode;
    }

    var index = domIndex(rootNode, patches.a, indices);
    var ownerDocument = rootNode.ownerDocument;

    if (!renderOptions) {
        renderOptions = { patch: patchRecursive };
        if (ownerDocument !== document) {
            renderOptions.document = ownerDocument;
        }
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i];
        rootNode = applyPatch(rootNode, index[nodeIndex], patches[nodeIndex], renderOptions);
    }

    return rootNode;
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode;
    }

    var newNode;

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions);

            if (domNode === rootNode) {
                rootNode = newNode;
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions);

        if (domNode === rootNode) {
            rootNode = newNode;
        }
    }

    return rootNode;
}

function patchIndices(patches) {
    var indices = [];

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key));
        }
    }

    return indices;
}

},{"./dom-index":123,"./patch-op":124,"global/document":117,"x-is-array":119}],126:[function(require,module,exports){
"use strict";

var isWidget = require("../vnode/is-widget.js");

module.exports = updateWidget;

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id;
        } else {
            return a.init === b.init;
        }
    }

    return false;
}

},{"../vnode/is-widget.js":137}],127:[function(require,module,exports){
'use strict';

module.exports = AttributeHook;

function AttributeHook(namespace, value) {
    if (!(this instanceof AttributeHook)) {
        return new AttributeHook(namespace, value);
    }

    this.namespace = namespace;
    this.value = value;
}

AttributeHook.prototype.hook = function (node, prop, prev) {
    if (prev && prev.type === 'AttributeHook' && prev.value === this.value && prev.namespace === this.namespace) {
        return;
    }

    node.setAttributeNS(this.namespace, prop, this.value);
};

AttributeHook.prototype.unhook = function (node, prop, next) {
    if (next && next.type === 'AttributeHook' && next.namespace === this.namespace) {
        return;
    }

    var colonPosition = prop.indexOf(':');
    var localName = colonPosition > -1 ? prop.substr(colonPosition + 1) : prop;
    node.removeAttributeNS(this.namespace, localName);
};

AttributeHook.prototype.type = 'AttributeHook';

},{}],128:[function(require,module,exports){
'use strict';

var EvStore = require('ev-store');

module.exports = EvHook;

function EvHook(value) {
    if (!(this instanceof EvHook)) {
        return new EvHook(value);
    }

    this.value = value;
}

EvHook.prototype.hook = function (node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = this.value;
};

EvHook.prototype.unhook = function (node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = undefined;
};

},{"ev-store":114}],129:[function(require,module,exports){
'use strict';

module.exports = SoftSetHook;

function SoftSetHook(value) {
    if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
    }

    this.value = value;
}

SoftSetHook.prototype.hook = function (node, propertyName) {
    if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
    }
};

},{}],130:[function(require,module,exports){
'use strict';

var isArray = require('x-is-array');

var VNode = require('../vnode/vnode.js');
var VText = require('../vnode/vtext.js');
var isVNode = require('../vnode/is-vnode');
var isVText = require('../vnode/is-vtext');
var isWidget = require('../vnode/is-widget');
var isHook = require('../vnode/is-vhook');
var isVThunk = require('../vnode/is-thunk');

var parseTag = require('./parse-tag.js');
var softSetHook = require('./hooks/soft-set-hook.js');
var evHook = require('./hooks/ev-hook.js');

module.exports = h;

function h(tagName, properties, children) {
    var childNodes = [];
    var tag, props, key, namespace;

    if (!children && isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = props || properties || {};
    tag = parseTag(tagName, props);

    // support keys
    if (props.hasOwnProperty('key')) {
        key = props.key;
        props.key = undefined;
    }

    // support namespace
    if (props.hasOwnProperty('namespace')) {
        namespace = props.namespace;
        props.namespace = undefined;
    }

    // fix cursor bug
    if (tag === 'INPUT' && !namespace && props.hasOwnProperty('value') && props.value !== undefined && !isHook(props.value)) {
        props.value = softSetHook(props.value);
    }

    transformProperties(props);

    if (children !== undefined && children !== null) {
        addChild(children, childNodes, tag, props);
    }

    return new VNode(tag, props, childNodes, key, namespace);
}

function addChild(c, childNodes, tag, props) {
    if (typeof c === 'string') {
        childNodes.push(new VText(c));
    } else if (isChild(c)) {
        childNodes.push(c);
    } else if (isArray(c)) {
        for (var i = 0; i < c.length; i++) {
            addChild(c[i], childNodes, tag, props);
        }
    } else if (c === null || c === undefined) {
        return;
    } else {
        throw UnexpectedVirtualElement({
            foreignObject: c,
            parentVnode: {
                tagName: tag,
                properties: props
            }
        });
    }
}

function transformProperties(props) {
    for (var propName in props) {
        if (props.hasOwnProperty(propName)) {
            var value = props[propName];

            if (isHook(value)) {
                continue;
            }

            if (propName.substr(0, 3) === 'ev-') {
                // add ev-foo support
                props[propName] = evHook(value);
            }
        }
    }
}

function isChild(x) {
    return isVNode(x) || isVText(x) || isWidget(x) || isVThunk(x);
}

function isChildren(x) {
    return typeof x === 'string' || isArray(x) || isChild(x);
}

function UnexpectedVirtualElement(data) {
    var err = new Error();

    err.type = 'virtual-hyperscript.unexpected.virtual-element';
    err.message = 'Unexpected virtual child passed to h().\n' + 'Expected a VNode / Vthunk / VWidget / string but:\n' + 'got:\n' + errorString(data.foreignObject) + '.\n' + 'The parent vnode is:\n' + errorString(data.parentVnode);
    '\n' + 'Suggested fix: change your `h(..., [ ... ])` callsite.';
    err.foreignObject = data.foreignObject;
    err.parentVnode = data.parentVnode;

    return err;
}

function errorString(obj) {
    try {
        return JSON.stringify(obj, null, '    ');
    } catch (e) {
        return String(obj);
    }
}

},{"../vnode/is-thunk":133,"../vnode/is-vhook":134,"../vnode/is-vnode":135,"../vnode/is-vtext":136,"../vnode/is-widget":137,"../vnode/vnode.js":139,"../vnode/vtext.js":141,"./hooks/ev-hook.js":128,"./hooks/soft-set-hook.js":129,"./parse-tag.js":131,"x-is-array":119}],131:[function(require,module,exports){
'use strict';

var split = require('browser-split');

var classIdSplit = /([\.#]?[a-zA-Z0-9_:-]+)/;
var notClassId = /^\.|#/;

module.exports = parseTag;

function parseTag(tag, props) {
    if (!tag) {
        return 'DIV';
    }

    var noId = !props.hasOwnProperty('id');

    var tagParts = split(tag, classIdSplit);
    var tagName = null;

    if (notClassId.test(tagParts[1])) {
        tagName = 'DIV';
    }

    var classes, part, type, i;

    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i];

        if (!part) {
            continue;
        }

        type = part.charAt(0);

        if (!tagName) {
            tagName = part;
        } else if (type === '.') {
            classes = classes || [];
            classes.push(part.substring(1, part.length));
        } else if (type === '#' && noId) {
            props.id = part.substring(1, part.length);
        }
    }

    if (classes) {
        if (props.className) {
            classes.push(props.className);
        }

        props.className = classes.join(' ');
    }

    return props.namespace ? tagName : tagName.toUpperCase();
}

},{"browser-split":113}],132:[function(require,module,exports){
"use strict";

var isVNode = require("./is-vnode");
var isVText = require("./is-vtext");
var isWidget = require("./is-widget");
var isThunk = require("./is-thunk");

module.exports = handleThunk;

function handleThunk(a, b) {
    var renderedA = a;
    var renderedB = b;

    if (isThunk(b)) {
        renderedB = renderThunk(b, a);
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null);
    }

    return {
        a: renderedA,
        b: renderedB
    };
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode;

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous);
    }

    if (!(isVNode(renderedThunk) || isVText(renderedThunk) || isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk;
}

},{"./is-thunk":133,"./is-vnode":135,"./is-vtext":136,"./is-widget":137}],133:[function(require,module,exports){
"use strict";

module.exports = isThunk;

function isThunk(t) {
    return t && t.type === "Thunk";
}

},{}],134:[function(require,module,exports){
"use strict";

module.exports = isHook;

function isHook(hook) {
  return hook && (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") || typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"));
}

},{}],135:[function(require,module,exports){
"use strict";

var version = require("./version");

module.exports = isVirtualNode;

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version;
}

},{"./version":138}],136:[function(require,module,exports){
"use strict";

var version = require("./version");

module.exports = isVirtualText;

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version;
}

},{"./version":138}],137:[function(require,module,exports){
"use strict";

module.exports = isWidget;

function isWidget(w) {
    return w && w.type === "Widget";
}

},{}],138:[function(require,module,exports){
"use strict";

module.exports = "2";

},{}],139:[function(require,module,exports){
"use strict";

var version = require("./version");
var isVNode = require("./is-vnode");
var isWidget = require("./is-widget");
var isThunk = require("./is-thunk");
var isVHook = require("./is-vhook");

module.exports = VirtualNode;

var noProperties = {};
var noChildren = [];

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName;
    this.properties = properties || noProperties;
    this.children = children || noChildren;
    this.key = key != null ? String(key) : undefined;
    this.namespace = typeof namespace === "string" ? namespace : null;

    var count = children && children.length || 0;
    var descendants = 0;
    var hasWidgets = false;
    var hasThunks = false;
    var descendantHooks = false;
    var hooks;

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName];
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {};
                }

                hooks[propName] = property;
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i];
        if (isVNode(child)) {
            descendants += child.count || 0;

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true;
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true;
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true;
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true;
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants;
    this.hasWidgets = hasWidgets;
    this.hasThunks = hasThunks;
    this.hooks = hooks;
    this.descendantHooks = descendantHooks;
}

VirtualNode.prototype.version = version;
VirtualNode.prototype.type = "VirtualNode";

},{"./is-thunk":133,"./is-vhook":134,"./is-vnode":135,"./is-widget":137,"./version":138}],140:[function(require,module,exports){
"use strict";

var version = require("./version");

VirtualPatch.NONE = 0;
VirtualPatch.VTEXT = 1;
VirtualPatch.VNODE = 2;
VirtualPatch.WIDGET = 3;
VirtualPatch.PROPS = 4;
VirtualPatch.ORDER = 5;
VirtualPatch.INSERT = 6;
VirtualPatch.REMOVE = 7;
VirtualPatch.THUNK = 8;

module.exports = VirtualPatch;

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type);
    this.vNode = vNode;
    this.patch = patch;
}

VirtualPatch.prototype.version = version;
VirtualPatch.prototype.type = "VirtualPatch";

},{"./version":138}],141:[function(require,module,exports){
"use strict";

var version = require("./version");

module.exports = VirtualText;

function VirtualText(text) {
    this.text = String(text);
}

VirtualText.prototype.version = version;
VirtualText.prototype.type = "VirtualText";

},{"./version":138}],142:[function(require,module,exports){
"use strict";

var isObject = require("is-object");
var isHook = require("../vnode/is-vhook");

module.exports = diffProps;

function diffProps(a, b) {
    var diff;

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {};
            diff[aKey] = undefined;
        }

        var aValue = a[aKey];
        var bValue = b[aKey];

        if (aValue === bValue) {
            continue;
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {};
                diff[aKey] = bValue;
            } else if (isHook(bValue)) {
                diff = diff || {};
                diff[aKey] = bValue;
            } else {
                var objectDiff = diffProps(aValue, bValue);
                if (objectDiff) {
                    diff = diff || {};
                    diff[aKey] = objectDiff;
                }
            }
        } else {
            diff = diff || {};
            diff[aKey] = bValue;
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {};
            diff[bKey] = b[bKey];
        }
    }

    return diff;
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value);
    } else if (value.__proto__) {
        return value.__proto__;
    } else if (value.constructor) {
        return value.constructor.prototype;
    }
}

},{"../vnode/is-vhook":134,"is-object":118}],143:[function(require,module,exports){
"use strict";

var isArray = require("x-is-array");

var VPatch = require("../vnode/vpatch");
var isVNode = require("../vnode/is-vnode");
var isVText = require("../vnode/is-vtext");
var isWidget = require("../vnode/is-widget");
var isThunk = require("../vnode/is-thunk");
var handleThunk = require("../vnode/handle-thunk");

var diffProps = require("./diff-props");

module.exports = diff;

function diff(a, b) {
    var patch = { a: a };
    walk(a, b, patch, 0);
    return patch;
}

function walk(a, b, patch, index) {
    if (a === b) {
        return;
    }

    var apply = patch[index];
    var applyClear = false;

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index);
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index);
            apply = patch[index];
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b));
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName && a.namespace === b.namespace && a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties);
                if (propsPatch) {
                    apply = appendPatch(apply, new VPatch(VPatch.PROPS, a, propsPatch));
                }
                apply = diffChildren(a, b, patch, apply, index);
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b));
                applyClear = true;
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b));
            applyClear = true;
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b));
            applyClear = true;
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b));
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            applyClear = true;
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b));
    }

    if (apply) {
        patch[index] = apply;
    }

    if (applyClear) {
        clearState(a, patch, index);
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children;
    var orderedSet = reorder(aChildren, b.children);
    var bChildren = orderedSet.children;

    var aLen = aChildren.length;
    var bLen = bChildren.length;
    var len = aLen > bLen ? aLen : bLen;

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i];
        var rightNode = bChildren[i];
        index += 1;

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply, new VPatch(VPatch.INSERT, null, rightNode));
            }
        } else {
            walk(leftNode, rightNode, patch, index);
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count;
        }
    }

    if (orderedSet.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(VPatch.ORDER, a, orderedSet.moves));
    }

    return apply;
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index);
    destroyWidgets(vNode, patch, index);
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(patch[index], new VPatch(VPatch.REMOVE, vNode, null));
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children;
        var len = children.length;
        for (var i = 0; i < len; i++) {
            var child = children[i];
            index += 1;

            destroyWidgets(child, patch, index);

            if (isVNode(child) && child.count) {
                index += child.count;
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index);
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b);
    var thunkPatch = diff(nodes.a, nodes.b);
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch);
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true;
        }
    }

    return false;
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(patch[index], new VPatch(VPatch.PROPS, vNode, undefinedKeys(vNode.hooks)));
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children;
            var len = children.length;
            for (var i = 0; i < len; i++) {
                var child = children[i];
                index += 1;

                unhook(child, patch, index);

                if (isVNode(child) && child.count) {
                    index += child.count;
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index);
    }
}

function undefinedKeys(obj) {
    var result = {};

    for (var key in obj) {
        result[key] = undefined;
    }

    return result;
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {
    // O(M) time, O(M) memory
    var bChildIndex = keyIndex(bChildren);
    var bKeys = bChildIndex.keys;
    var bFree = bChildIndex.free;

    if (bFree.length === bChildren.length) {
        return {
            children: bChildren,
            moves: null
        };
    }

    // O(N) time, O(N) memory
    var aChildIndex = keyIndex(aChildren);
    var aKeys = aChildIndex.keys;
    var aFree = aChildIndex.free;

    if (aFree.length === aChildren.length) {
        return {
            children: bChildren,
            moves: null
        };
    }

    // O(MAX(N, M)) memory
    var newChildren = [];

    var freeIndex = 0;
    var freeCount = bFree.length;
    var deletedItems = 0;

    // Iterate through a and match a node in b
    // O(N) time,
    for (var i = 0; i < aChildren.length; i++) {
        var aItem = aChildren[i];
        var itemIndex;

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                itemIndex = bKeys[aItem.key];
                newChildren.push(bChildren[itemIndex]);
            } else {
                // Remove old keyed items
                itemIndex = i - deletedItems++;
                newChildren.push(null);
            }
        } else {
            // Match the item in a with the next free item in b
            if (freeIndex < freeCount) {
                itemIndex = bFree[freeIndex++];
                newChildren.push(bChildren[itemIndex]);
            } else {
                // There are no free items in b to match with
                // the free items in a, so the extra free nodes
                // are deleted.
                itemIndex = i - deletedItems++;
                newChildren.push(null);
            }
        }
    }

    var lastFreeIndex = freeIndex >= bFree.length ? bChildren.length : bFree[freeIndex];

    // Iterate through b and append any new keys
    // O(M) time
    for (var j = 0; j < bChildren.length; j++) {
        var newItem = bChildren[j];

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                // We are adding new items to the end and then sorting them
                // in place. In future we should insert new items in place.
                newChildren.push(newItem);
            }
        } else if (j >= lastFreeIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem);
        }
    }

    var simulate = newChildren.slice();
    var simulateIndex = 0;
    var removes = [];
    var inserts = [];
    var simulateItem;

    for (var k = 0; k < bChildren.length;) {
        var wantedItem = bChildren[k];
        simulateItem = simulate[simulateIndex];

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null));
            simulateItem = simulate[simulateIndex];
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            // if we need a key in this position...
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    // if an insert doesn't put this key in place, it needs to move
                    if (bKeys[simulateItem.key] !== k + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key));
                        simulateItem = simulate[simulateIndex];
                        // if the remove didn't put the wanted item in place, we need to insert it
                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({ key: wantedItem.key, to: k });
                        }
                        // items are matching, so skip ahead
                        else {
                            simulateIndex++;
                        }
                    } else {
                        inserts.push({ key: wantedItem.key, to: k });
                    }
                } else {
                    inserts.push({ key: wantedItem.key, to: k });
                }
                k++;
            }
            // a key in simulate has no matching wanted key, remove it
            else if (simulateItem && simulateItem.key) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key));
            }
        } else {
            simulateIndex++;
            k++;
        }
    }

    // remove all the remaining nodes from simulate
    while (simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex];
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key));
    }

    // If the only moves we have are deletes then we can just
    // let the delete patch remove these items.
    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        };
    }

    return {
        children: newChildren,
        moves: {
            removes: removes,
            inserts: inserts
        }
    };
}

function remove(arr, index, key) {
    arr.splice(index, 1);

    return {
        from: index,
        key: key
    };
}

function keyIndex(children) {
    var keys = {};
    var free = [];
    var length = children.length;

    for (var i = 0; i < length; i++) {
        var child = children[i];

        if (child.key) {
            keys[child.key] = i;
        } else {
            free.push(i);
        }
    }

    return {
        keys: keys, // A hash of key name to index
        free: free };
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch);
        } else {
            apply = [apply, patch];
        }

        return apply;
    } else {
        return patch;
    }
}
// An array of unkeyed item indices

},{"../vnode/handle-thunk":132,"../vnode/is-thunk":133,"../vnode/is-vnode":135,"../vnode/is-vtext":136,"../vnode/is-widget":137,"../vnode/vpatch":140,"./diff-props":142,"x-is-array":119}],144:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cyclejs = require('cyclejs');

var _cyclejs2 = _interopRequireDefault(_cyclejs);

var _utils = require('../utils');

'use strict';
var Rx = _cyclejs2['default'].Rx;
var h = _cyclejs2['default'].h;

_cyclejs2['default'].registerCustomElement('todo-item', function (interactions, props) {
  var intent = {
    destroy$: interactions.get('.destroy', 'click'),
    toggle$: interactions.get('.toggle', 'change'),
    startEdit$: interactions.get('label', 'dblclick'),
    stopEdit$: interactions.get('.edit', 'keyup').filter(function (ev) {
      return ev.keyCode === _utils.ESC_KEY || ev.keyCode === _utils.ENTER_KEY;
    }).merge(interactions.get('.edit', 'blur')).map(function (ev) {
      return ev.currentTarget.value;
    }).share()
  };

  var propId$ = props.get('todoid').startWith(0).shareReplay(1);
  var propContent$ = props.get('content').startWith('');
  var propCompleted$ = props.get('completed').startWith(false);

  var editing$ = Rx.Observable.merge(intent.startEdit$.map(function () {
    return true;
  }), intent.stopEdit$.map(function () {
    return false;
  })).startWith(false);

  var vtree$ = Rx.Observable.combineLatest(propId$, propContent$, propCompleted$, editing$, function (id, content, completed, editing) {
    var classes = (completed ? '.completed' : '') + (editing ? '.editing' : '');
    return h('li.todoRoot' + classes, [h('div.view', [h('input.toggle', {
      type: 'checkbox',
      checked: _utils.propHook(function (elem) {
        return elem.checked = completed;
      })
    }), h('label', content), h('button.destroy')]), h('input.edit', {
      type: 'text',
      value: _utils.propHook(function (element) {
        element.value = content;
        if (editing) {
          element.focus();
          element.selectionStart = element.value.length;
        }
      })
    })]);
  });

  return {
    vtree$: vtree$,
    destroy$: intent.destroy$.withLatestFrom(propId$, function (ev, id) {
      return id;
    }),
    toggle$: intent.toggle$.withLatestFrom(propId$, function (ev, id) {
      return id;
    }),
    newContent$: intent.stopEdit$.withLatestFrom(propId$, function (content, id) {
      return { content: content, id: id };
    })
  };
});

},{"../utils":149,"cyclejs":93}],145:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = intent;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cyclejs = require('cyclejs');

var _cyclejs2 = _interopRequireDefault(_cyclejs);

var _utils = require('../utils');

'use strict';

function intent(interactions) {
  return {
    changeRoute$: _cyclejs2['default'].Rx.Observable.fromEvent(window, 'hashchange').map(function (ev) {
      return ev.newURL.match(/\#[^\#]*$/)[0].replace('#', '');
    }).startWith(window.location.hash.replace('#', '')),

    clearInput$: interactions.get('#new-todo', 'keyup').filter(function (ev) {
      return ev.keyCode === _utils.ESC_KEY;
    }),

    insertTodo$: interactions.get('#new-todo', 'keyup').filter(function (ev) {
      var trimmedVal = String(ev.target.value).trim();
      return ev.keyCode === _utils.ENTER_KEY && trimmedVal;
    }).map(function (ev) {
      return String(ev.target.value).trim();
    }),

    editTodo$: interactions.get('.todo-item', 'newContent').map(function (ev) {
      return ev.data;
    }),

    toggleTodo$: interactions.get('.todo-item', 'toggle').map(function (ev) {
      return ev.data;
    }),

    toggleAll$: interactions.get('#toggle-all', 'click'),

    deleteTodo$: interactions.get('.todo-item', 'destroy').map(function (ev) {
      return ev.data;
    }),

    deleteCompleteds$: interactions.get('#clear-completed', 'click')
  };
}

;
module.exports = exports['default'];

},{"../utils":149,"cyclejs":93}],146:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cyclejs = require('cyclejs');

var _cyclejs2 = _interopRequireDefault(_cyclejs);

'use strict';

function getFilterFn(route) {
  switch (route) {
    case '/active':
      return function (task) {
        return task.completed === false;
      };
    case '/completed':
      return function (task) {
        return task.completed === true;
      };
    default:
      return function () {
        return true;
      }; // allow anything
  }
}

function determineFilter(todosData, route) {
  todosData.filter = route.replace('/', '').trim();
  todosData.filterFn = getFilterFn(route);
  return todosData;
}

function searchTodoIndex(todosList, todoid) {
  var top = todosList.length;
  var bottom = 0;
  var pointerId = undefined;
  var index = undefined;
  while (true) {
    // binary search
    index = bottom + (top - bottom >> 1);
    pointerId = todosList[index].id;
    if (pointerId === todoid) {
      return index;
    } else if (pointerId < todoid) {
      bottom = index;
    } else if (pointerId > todoid) {
      top = index;
    }
  }
}

function makeModification$(intent) {
  var clearInputMod$ = intent.clearInput$.map(function () {
    return function (todosData) {
      todosData.input = '';
      return todosData;
    };
  });

  var insertTodoMod$ = intent.insertTodo$.map(function (todoTitle) {
    return function (todosData) {
      var lastId = todosData.list.length > 0 ? todosData.list[todosData.list.length - 1].id : 0;
      todosData.list.push({
        id: lastId + 1,
        title: todoTitle,
        completed: false
      });
      todosData.input = '';
      return todosData;
    };
  });

  var editTodoMod$ = intent.editTodo$.map(function (evdata) {
    return function (todosData) {
      var todoIndex = searchTodoIndex(todosData.list, evdata.id);
      todosData.list[todoIndex].title = evdata.content;
      return todosData;
    };
  });

  var toggleTodoMod$ = intent.toggleTodo$.map(function (todoid) {
    return function (todosData) {
      var todoIndex = searchTodoIndex(todosData.list, todoid);
      var previousCompleted = todosData.list[todoIndex].completed;
      todosData.list[todoIndex].completed = !previousCompleted;
      return todosData;
    };
  });

  var toggleAllMod$ = intent.toggleAll$.map(function () {
    return function (todosData) {
      var allAreCompleted = todosData.list.reduce(function (x, y) {
        return x && y.completed;
      }, true);
      todosData.list.forEach(function (todoData) {
        todoData.completed = allAreCompleted ? false : true;
      });
      return todosData;
    };
  });

  var deleteTodoMod$ = intent.deleteTodo$.map(function (todoid) {
    return function (todosData) {
      var todoIndex = searchTodoIndex(todosData.list, todoid);
      todosData.list.splice(todoIndex, 1);
      return todosData;
    };
  });

  var deleteCompletedsMod$ = intent.deleteCompleteds$.map(function () {
    return function (todosData) {
      todosData.list = todosData.list.filter(function (todoData) {
        return todoData.completed === false;
      });
      return todosData;
    };
  });

  return _cyclejs2['default'].Rx.Observable.merge(insertTodoMod$, deleteTodoMod$, toggleTodoMod$, toggleAllMod$, clearInputMod$, deleteCompletedsMod$, editTodoMod$);
}

function model(intent, source) {
  var modification$ = makeModification$(intent);
  var route$ = _cyclejs2['default'].Rx.Observable.just('/').merge(intent.changeRoute$);

  return modification$.merge(source.todosData$).scan(function (todosData, modFn) {
    return modFn(todosData);
  }).combineLatest(route$, determineFilter).shareReplay(1);
}

exports['default'] = model;
module.exports = exports['default'];

},{"cyclejs":93}],147:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = localStorageSink;
'use strict';

function localStorageSink(todosData) {
  // Observe all todos data and save them to localStorage
  var savedTodosData = {
    list: todosData.list.map(function (todoData) {
      return {
        title: todoData.title,
        completed: todoData.completed,
        id: todoData.id
      };
    })
  };
  localStorage.setItem('todos-cycle', JSON.stringify(savedTodosData));
}

;
module.exports = exports['default'];

},{}],148:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cyclejs = require('cyclejs');

var _cyclejs2 = _interopRequireDefault(_cyclejs);

'use strict';

function merge() {
  var result = {};
  for (var i = 0; i < arguments.length; i++) {
    var object = arguments[i];
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        result[key] = object[key];
      }
    }
  }
  return result;
}

var defaultTodosData = {
  list: [],
  input: '',
  filter: '',
  filterFn: function filterFn() {
    return true // allow anything
    ;
  } };

var storedTodosData = JSON.parse(localStorage.getItem('todos-cycle')) || {};

var initialTodosData = merge(defaultTodosData, storedTodosData);

exports['default'] = {
  todosData$: _cyclejs2['default'].Rx.Observable.just(initialTodosData)
};
module.exports = exports['default'];

},{"cyclejs":93}],149:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

'use strict';

var PropertyHook = (function () {
  function PropertyHook(fn) {
    _classCallCheck(this, PropertyHook);

    this.fn = fn;
  }

  _createClass(PropertyHook, [{
    key: 'hook',
    value: function hook() {
      this.fn.apply(this, arguments);
    }
  }]);

  return PropertyHook;
})();

function propHook(fn) {
  return new PropertyHook(fn);
}

var ENTER_KEY = 13;
var ESC_KEY = 27;

exports.propHook = propHook;
exports.ENTER_KEY = ENTER_KEY;
exports.ESC_KEY = ESC_KEY;

},{}],150:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = view;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cyclejs = require('cyclejs');

var _cyclejs2 = _interopRequireDefault(_cyclejs);

var _utils = require('../utils');

'use strict';
var Rx = _cyclejs2['default'].Rx;
var h = _cyclejs2['default'].h;

function vrenderHeader(todosData) {
  return h('header#header', [h('h1', 'todos'), h('input#new-todo', {
    type: 'text',
    value: _utils.propHook(function (elem) {
      elem.value = todosData.input;
    }),
    attributes: {
      placeholder: 'What needs to be done?'
    },
    autofocus: true,
    name: 'newTodo'
  })]);
}

function vrenderMainSection(todosData) {
  var allCompleted = todosData.list.reduce(function (x, y) {
    return x && y.completed;
  }, true);
  return h('section#main', {
    style: { 'display': todosData.list.length ? '' : 'none' }
  }, [h('input#toggle-all', {
    type: 'checkbox',
    checked: allCompleted
  }), h('ul#todo-list', todosData.list.filter(todosData.filterFn).map(function (todoData) {
    return h('todo-item.todo-item', {
      key: todoData.id,
      todoid: todoData.id,
      content: todoData.title,
      completed: todoData.completed
    });
  }))]);
}

function vrenderFooter(todosData) {
  var amountCompleted = todosData.list.filter(function (todoData) {
    return todoData.completed;
  }).length;
  var amountActive = todosData.list.length - amountCompleted;
  return h('footer#footer', {
    style: { 'display': todosData.list.length ? '' : 'none' }
  }, [h('span#todo-count', [h('strong', String(amountActive)), ' item' + (amountActive !== 1 ? 's' : '') + ' left']), h('ul#filters', [h('li', [h('a' + (todosData.filter === '' ? '.selected' : ''), {
    attributes: { 'href': '#/' }
  }, 'All')]), h('li', [h('a' + (todosData.filter === 'active' ? '.selected' : ''), {
    attributes: { 'href': '#/active' }
  }, 'Active')]), h('li', [h('a' + (todosData.filter === 'completed' ? '.selected' : ''), {
    attributes: { 'href': '#/completed' }
  }, 'Completed')])]), amountCompleted > 0 ? h('button#clear-completed', 'Clear completed (' + amountCompleted + ')') : null]);
}

function view(todos$) {
  return todos$.map(function (todos) {
    return h('div', [vrenderHeader(todos), vrenderMainSection(todos), vrenderFooter(todos)]);
  });
}

;
module.exports = exports['default'];

},{"../utils":149,"cyclejs":93}],151:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cyclejs = require('cyclejs');

var _cyclejs2 = _interopRequireDefault(_cyclejs);

require('./components/todo-item');

var _sourcesTodos = require('./sources/todos');

var _sourcesTodos2 = _interopRequireDefault(_sourcesTodos);

var _intentsTodos = require('./intents/todos');

var _intentsTodos2 = _interopRequireDefault(_intentsTodos);

var _modelsTodos = require('./models/todos');

var _modelsTodos2 = _interopRequireDefault(_modelsTodos);

var _viewsTodos = require('./views/todos');

var _viewsTodos2 = _interopRequireDefault(_viewsTodos);

var _sinksLocalStorageJs = require('./sinks/local-storage.js');

var _sinksLocalStorageJs2 = _interopRequireDefault(_sinksLocalStorageJs);

'use strict';

function app(interactions) {
  var todos$ = _modelsTodos2['default'](_intentsTodos2['default'](interactions), _sourcesTodos2['default']);
  todos$.subscribe(_sinksLocalStorageJs2['default']);
  return _viewsTodos2['default'](todos$);
}

_cyclejs2['default'].applyToDOM('#todoapp', app);

},{"./components/todo-item":144,"./intents/todos":145,"./models/todos":146,"./sinks/local-storage.js":147,"./sources/todos":148,"./views/todos":150,"cyclejs":93}]},{},[151]);
