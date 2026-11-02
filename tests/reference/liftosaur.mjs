/* Liftosaur interpreter, AGPL-3.0. Upstream commit 421ca47fc13031c5c1df894055525cf96e45a18c. See LICENSE.txt and third-party/liftosaur/NOTICE.txt. */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/lens-shmens@1.6.0/node_modules/lens-shmens/dist/utils/object.js
var require_object = __commonJS({
  "node_modules/.pnpm/lens-shmens@1.6.0/node_modules/lens-shmens/dist/utils/object.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ObjectUtils = void 0;
    var ObjectUtils;
    (function(ObjectUtils2) {
      function keys(obj) {
        return Object.keys(obj);
      }
      ObjectUtils2.keys = keys;
    })(ObjectUtils = exports.ObjectUtils || (exports.ObjectUtils = {}));
  }
});

// node_modules/.pnpm/lens-shmens@1.6.0/node_modules/lens-shmens/dist/index.js
var require_dist = __commonJS({
  "node_modules/.pnpm/lens-shmens@1.6.0/node_modules/lens-shmens/dist/index.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    })();
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t) {
        for (var s, i = 1, n2 = arguments.length; i < n2; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
        }
        return t;
      };
      return __assign.apply(this, arguments);
    };
    var __spreadArrays = exports && exports.__spreadArrays || function() {
      for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
      for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
      return r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Lens = exports.lf = exports.lbu = exports.lb = exports.LensBuilder = exports.LensBuilderWithObject = exports.LensError = void 0;
    var object_1 = require_object();
    var LENS_OPTIONAL_BREAK = /* @__PURE__ */ Symbol("LENS_OPTIONAL_BREAK");
    var LensError = (
      /** @class */
      (function(_super) {
        __extends(LensError2, _super);
        function LensError2(m, lens, type, err, value) {
          var _this = _super.call(this, m) || this;
          _this.lens = lens;
          _this.type = type;
          _this.err = err;
          _this.value = value;
          Object.setPrototypeOf(_this, LensError2.prototype);
          return _this;
        }
        return LensError2;
      })(Error)
    );
    exports.LensError = LensError;
    var AbstractLensBuilder = (
      /** @class */
      (function() {
        function AbstractLensBuilder2(lens) {
          this.lens = lens;
        }
        AbstractLensBuilder2.prototype.get = function() {
          return this.lens;
        };
        return AbstractLensBuilder2;
      })()
    );
    var LensBuilderWithObject = (
      /** @class */
      (function(_super) {
        __extends(LensBuilderWithObject2, _super);
        function LensBuilderWithObject2(lens, obj) {
          var _this = _super.call(this, lens) || this;
          _this.obj = obj;
          return _this;
        }
        LensBuilderWithObject2.start = function(lensFactory, obj) {
          return {
            p: function(key) {
              return new LensBuilderWithObject2(lensFactory(key), obj);
            },
            pi: (function(key, fallback) {
              var baseLens = lensFactory(key);
              if (fallback !== void 0) {
                var lens = new Lens(function(s) {
                  var _a;
                  return (_a = baseLens.get(s)) !== null && _a !== void 0 ? _a : fallback;
                }, baseLens.set, { from: baseLens.from, to: baseLens.to });
                return new LensBuilderWithObject2(lens, obj);
              }
              baseLens._optional = true;
              return new LensBuilderWithObject2(baseLens, obj);
            }),
            i: function(index) {
              return new LensBuilderWithObject2(lensFactory(index), obj);
            },
            find: function(cb) {
              return new LensBuilderWithObject2(lensFactory(cb), obj);
            },
            findBy: function(key, value, isReverse) {
              return new LensBuilderWithObject2(lensFactory(key, value, isReverse), obj);
            },
            get: function() {
              return new Lens(function(s) {
                return s;
              }, function(s, v) {
                return v;
              }, { from: "obj", to: "obj" });
            },
            record: function(value, name) {
              return Lens.buildLensRecording(new Lens(function(s) {
                return s;
              }, function(s, v) {
                return v;
              }, { from: "obj", to: "obj" }), value, name);
            },
            recordModify: function(fn, name) {
              return Lens.buildLensModifyRecording(new Lens(function(s) {
                return s;
              }, function(s, v) {
                return v;
              }, { from: "obj", to: "obj" }), fn, {}, name);
            }
          };
        };
        LensBuilderWithObject2.prototype.p = function(key) {
          return new LensBuilderWithObject2(this.lens.then(Lens.prop()(key)), this.obj);
        };
        LensBuilderWithObject2.prototype.pi = function(key, fallback) {
          var propLens = Lens.prop()(key);
          if (fallback !== void 0) {
            var lens = new Lens(function(s) {
              var _a;
              return (_a = propLens.get(s)) !== null && _a !== void 0 ? _a : fallback;
            }, propLens.set, { from: propLens.from, to: propLens.to });
            return new LensBuilderWithObject2(this.lens.then(lens), this.obj);
          }
          propLens._optional = true;
          return new LensBuilderWithObject2(this.lens.then(propLens), this.obj);
        };
        LensBuilderWithObject2.prototype.i = function(index) {
          return new LensBuilderWithObject2(this.lens.then(Lens.index()(index)), this.obj);
        };
        LensBuilderWithObject2.prototype.find = function(cb) {
          return new LensBuilderWithObject2(this.lens.then(Lens.find()(cb)), this.obj);
        };
        LensBuilderWithObject2.prototype.findBy = function(key, value, isReverse) {
          return new LensBuilderWithObject2(this.lens.then(Lens.findBy()(key, value, isReverse)), this.obj);
        };
        LensBuilderWithObject2.prototype.set = function(value) {
          return this.lens.set(this.obj, value);
        };
        LensBuilderWithObject2.prototype.modify = function(fn) {
          return this.lens.modify(this.obj, fn);
        };
        return LensBuilderWithObject2;
      })(AbstractLensBuilder)
    );
    exports.LensBuilderWithObject = LensBuilderWithObject;
    var LensBuilder2 = (
      /** @class */
      (function(_super) {
        __extends(LensBuilder3, _super);
        function LensBuilder3(lens, lensGetters) {
          var _this = _super.call(this, lens) || this;
          _this.lensGetters = lensGetters;
          return _this;
        }
        LensBuilder3.start = function(lensFactory, lensGetters) {
          var _this = this;
          return {
            p: function(key) {
              return new LensBuilder3(lensFactory(key), lensGetters);
            },
            pi: (function(key, fallback) {
              var baseLens = lensFactory(key);
              if (fallback !== void 0) {
                var lens = new Lens(function(s) {
                  var _a;
                  return (_a = baseLens.get(s)) !== null && _a !== void 0 ? _a : fallback;
                }, baseLens.set, { from: baseLens.from, to: baseLens.to });
                return new LensBuilder3(lens, lensGetters);
              }
              baseLens._optional = true;
              return new LensBuilder3(baseLens, lensGetters);
            }),
            i: function(index) {
              return new LensBuilder3(lensFactory(index), lensGetters);
            },
            find: function(cb) {
              return new LensBuilder3(lensFactory(cb), _this.lensGetters);
            },
            findBy: function(key, value, isReverse) {
              return new LensBuilder3(lensFactory(key, value, isReverse), _this.lensGetters);
            },
            get: function() {
              return new Lens(function(s) {
                return s;
              }, function(s, v) {
                return v;
              }, { from: "obj", to: "obj" });
            },
            record: function(value, name) {
              return Lens.buildLensRecording(new Lens(function(s) {
                return s;
              }, function(s, v) {
                return v;
              }, { from: "obj", to: "obj" }), value, name);
            },
            recordModify: function(fn, name) {
              return Lens.buildLensModifyRecording(new Lens(function(s) {
                return s;
              }, function(s, v) {
                return v;
              }, { from: "obj", to: "obj" }), fn, {}, name);
            }
          };
        };
        LensBuilder3.prototype.p = function(key) {
          return new LensBuilder3(this.lens.then(Lens.prop()(key)), this.lensGetters);
        };
        LensBuilder3.prototype.i = function(index) {
          return new LensBuilder3(this.lens.then(Lens.index()(index)), this.lensGetters);
        };
        LensBuilder3.prototype.pi = function(key, fallback) {
          var propLens = Lens.prop()(key);
          if (fallback !== void 0) {
            var lens = new Lens(function(s) {
              var _a;
              return (_a = propLens.get(s)) !== null && _a !== void 0 ? _a : fallback;
            }, propLens.set, { from: propLens.from, to: propLens.to });
            return new LensBuilder3(this.lens.then(lens), this.lensGetters);
          }
          propLens._optional = true;
          return new LensBuilder3(this.lens.then(propLens), this.lensGetters);
        };
        LensBuilder3.prototype.find = function(cb) {
          return new LensBuilder3(this.lens.then(Lens.find()(cb)), this.lensGetters);
        };
        LensBuilder3.prototype.findBy = function(key, value, isReverse) {
          return new LensBuilder3(this.lens.then(Lens.findBy()(key, value, isReverse)), this.lensGetters);
        };
        LensBuilder3.prototype.set = function(obj, value) {
          return this.lens.set(obj, value);
        };
        LensBuilder3.prototype.modify = function(obj, fn) {
          return this.lens.modify(obj, fn);
        };
        LensBuilder3.prototype.record = function(value, name) {
          return Lens.buildLensRecording(this.lens, value, name);
        };
        LensBuilder3.prototype.recordModify = function(fn, name) {
          return Lens.buildLensModifyRecording(this.lens, fn, this.lensGetters, name);
        };
        return LensBuilder3;
      })(AbstractLensBuilder)
    );
    exports.LensBuilder = LensBuilder2;
    function lb5() {
      return Lens.build({});
    }
    exports.lb = lb5;
    function lbu(lens) {
      return Lens.build(lens);
    }
    exports.lbu = lbu;
    function lf2(obj) {
      return Lens.from(obj);
    }
    exports.lf = lf2;
    var Lens = (
      /** @class */
      (function() {
        function Lens2(getter, setter, args) {
          var _this = this;
          this._optional = false;
          this._getRaw = function(obj) {
            try {
              return getter(obj);
            } catch (e) {
              var nestedErr = e instanceof LensError ? e.err : e;
              throw new LensError("LensError: Error when getting " + args.from + " -> " + args.to + " (" + nestedErr.message + ")", _this, "get", nestedErr);
            }
          };
          this.get = function(obj) {
            var result = _this._getRaw(obj);
            if (result === LENS_OPTIONAL_BREAK) {
              return void 0;
            }
            return result;
          };
          this.set = function(obj, value) {
            try {
              return setter(obj, value);
            } catch (e) {
              var nestedErr = e instanceof LensError ? e.err : e;
              throw new LensError("LensError: Error when setting " + args.from + " -> " + args.to + " - " + value + " (" + nestedErr.message + ")", _this, "set", nestedErr, value);
            }
          };
          this.from = Array.isArray(args.from) ? args.from : [args.from];
          this.to = args.to;
        }
        Lens2.buildLensModifyRecording = function(aLens, modifyFn, lensGetters, name) {
          var _this = this;
          var lens = aLens instanceof Lens2 ? aLens : aLens.get();
          var value = { v: void 0 };
          var fn = function(obj) {
            var getters = object_1.ObjectUtils.keys(lensGetters).reduce(function(memo, key) {
              memo[key] = lensGetters[key].get(obj);
              return memo;
            }, {});
            return lens.modify(obj, function(v) {
              var newValue = modifyFn(v, getters);
              value.v = newValue;
              return newValue;
            });
          };
          fn.toString = function() {
            return lens.toString() + " = `modify`";
          };
          var log = function(startName) {
            for (var _i = 0, _a = Object.keys(lensGetters); _i < _a.length; _i++) {
              var g = _a[_i];
              var l = lensGetters[g];
              var lensGetterStr = __spreadArrays([startName], l.from.slice(1), [l.to]).join(" -> ");
              console.log("getter: ", lensGetterStr);
            }
            if (name != null) {
              console.log(name + ": ");
            }
            console.log(__spreadArrays([startName], lens.from.slice(1), [lens.to]).join(" -> "), "=", "`modify`");
          };
          return {
            fn,
            str: fn.toString(),
            lens,
            lensGetters,
            value,
            log,
            type: "modify",
            prepend: function(newLensOrBuilder) {
              var newLens = newLensOrBuilder instanceof Lens2 ? newLensOrBuilder : newLensOrBuilder.get();
              var combinedLens = newLens.then(lens);
              var newLensGetters = object_1.ObjectUtils.keys(lensGetters).reduce(function(memo, key) {
                var newGetter = newLens.then(lensGetters[key]);
                memo[key] = newGetter;
                return memo;
              }, {});
              return _this.buildLensModifyRecording(combinedLens, modifyFn, newLensGetters, name);
            }
          };
        };
        Lens2.buildLensRecording = function(aLens, value, name) {
          var _this = this;
          var lens = aLens instanceof Lens2 ? aLens : aLens.get();
          var fn = function(obj) {
            return lens.set(obj, value);
          };
          fn.toString = function() {
            return lens.toString() + " = " + value;
          };
          var log = function(startName) {
            if (name != null) {
              console.log(name + ": ");
            }
            console.log(__spreadArrays([startName], lens.from.slice(1), [lens.to]).join(" -> "), "=", value);
          };
          return {
            fn,
            str: fn.toString(),
            lens,
            value: { v: value },
            log,
            type: "set",
            prepend: function(newLensOrBuilder) {
              var newLens = newLensOrBuilder instanceof Lens2 ? newLensOrBuilder : newLensOrBuilder.get();
              var combinedLens = newLens.then(lens);
              return _this.buildLensRecording(combinedLens, value, name);
            }
          };
        };
        Lens2.build = function(lens) {
          return LensBuilder2.start(Lens2.prop(), lens);
        };
        Lens2.from = function(obj) {
          return LensBuilderWithObject.start(Lens2.prop(), obj);
        };
        Lens2.propKey = function(key) {
          return new Lens2(function(s) {
            return s[key];
          }, function(s, v) {
            var _a;
            if (s != null && s[key] === v) {
              return s;
            }
            if (Array.isArray(s)) {
              return s.map(function(e, i) {
                return i === key ? v : e;
              });
            } else {
              return __assign(__assign({}, s), (_a = {}, _a[key] = v, _a));
            }
          }, { from: "obj", to: "" + key });
        };
        Lens2.prop = function() {
          return function(key) {
            return Lens2.propKey(key);
          };
        };
        Lens2.index = function() {
          return function(index) {
            return new Lens2(function(a) {
              return a[index];
            }, function(a, v) {
              return a[index] === v ? a : a.map(function(e, i) {
                return i === index ? v : e;
              });
            }, { from: "obj", to: "" + index });
          };
        };
        Lens2.find = function() {
          return function(cb) {
            return new Lens2(function(a) {
              return a.filter(cb)[0];
            }, function(a, v) {
              var changed = false;
              var result = a.map(function(e) {
                if (cb(e) && e !== v) {
                  changed = true;
                  return v;
                }
                return e;
              });
              return changed ? result : a;
            }, { from: "obj", to: "find()" });
          };
        };
        Lens2.findBy = function() {
          return function(key, value, isReverse) {
            return new Lens2(function(a) {
              if (isReverse) {
                return a.filter(function(e) {
                  return e[key] === value;
                }).reverse()[0];
              } else {
                return a.filter(function(e) {
                  return e[key] === value;
                })[0];
              }
            }, function(a, v) {
              var index = -1;
              if (isReverse) {
                for (var i = a.length - 1; i >= 0; i--) {
                  if (a[i][key] === value) {
                    index = i;
                    break;
                  }
                }
              } else {
                for (var i = 0; i < a.length; i++) {
                  if (a[i][key] === value) {
                    index = i;
                    break;
                  }
                }
              }
              if (index === -1 || a[index] === v) {
                return a;
              }
              return a.map(function(e, i2) {
                return i2 === index ? v : e;
              });
            }, { from: "obj", to: key + " == " + value });
          };
        };
        Lens2.prototype.modify = function(obj, f) {
          if (this._optional) {
            var current = this._getRaw(obj);
            if (current === LENS_OPTIONAL_BREAK) {
              return obj;
            }
            return this.set(obj, f(current));
          }
          return this.set(obj, f(this.get(obj)));
        };
        Lens2.prototype.then = function(lens) {
          var isOptional = this._optional;
          var thisGetRaw = this._getRaw;
          var thisSet = this.set;
          var result = new Lens2(function(obj) {
            var nextObj = thisGetRaw(obj);
            if (isOptional && (nextObj == null || nextObj === LENS_OPTIONAL_BREAK)) {
              return LENS_OPTIONAL_BREAK;
            }
            return lens._getRaw(nextObj);
          }, function(obj, value) {
            var parent = thisGetRaw(obj);
            if (isOptional && (parent == null || parent === LENS_OPTIONAL_BREAK)) {
              return obj;
            }
            var newParent = lens.set(parent, value);
            if (newParent === parent) {
              return obj;
            }
            return thisSet(obj, newParent);
          }, {
            from: __spreadArrays(this.from, [this.to]),
            to: lens.to
          });
          if (this._optional || lens._optional) {
            result._optional = true;
          }
          return result;
        };
        Lens2.prototype.toString = function() {
          if (this.from != null && this.to != null) {
            return this.from.join(" -> ") + " -> " + this.to;
          } else {
            return "Lens";
          }
        };
        Lens2.prototype.record = function(value, name) {
          return Lens2.buildLensRecording(this, value, name);
        };
        Lens2.prototype.recordModify = function(fn, name) {
          return Lens2.buildLensModifyRecording(this, fn, {}, name);
        };
        return Lens2;
      })()
    );
    exports.Lens = Lens;
  }
});

// node_modules/.pnpm/micro-memoize@4.2.0/node_modules/micro-memoize/dist/micro-memoize.js
var require_micro_memoize = __commonJS({
  "node_modules/.pnpm/micro-memoize@4.2.0/node_modules/micro-memoize/dist/micro-memoize.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global["micro-memoize"] = factory());
    })(exports, (function() {
      "use strict";
      var DEFAULT_OPTIONS_KEYS = {
        isEqual: true,
        isMatchingKey: true,
        isPromise: true,
        maxSize: true,
        onCacheAdd: true,
        onCacheChange: true,
        onCacheHit: true,
        transformKey: true
      };
      var slice = Array.prototype.slice;
      function cloneArray(arrayLike) {
        var length = arrayLike.length;
        if (!length) {
          return [];
        }
        if (length === 1) {
          return [arrayLike[0]];
        }
        if (length === 2) {
          return [arrayLike[0], arrayLike[1]];
        }
        if (length === 3) {
          return [arrayLike[0], arrayLike[1], arrayLike[2]];
        }
        return slice.call(arrayLike, 0);
      }
      function getCustomOptions(options) {
        var customOptions = {};
        for (var key in options) {
          if (!DEFAULT_OPTIONS_KEYS[key]) {
            customOptions[key] = options[key];
          }
        }
        return customOptions;
      }
      function isMemoized(fn) {
        return typeof fn === "function" && fn.isMemoized;
      }
      function isSameValueZero(object1, object2) {
        return object1 === object2 || object1 !== object1 && object2 !== object2;
      }
      function mergeOptions(existingOptions, newOptions) {
        var target = {};
        for (var key in existingOptions) {
          target[key] = existingOptions[key];
        }
        for (var key in newOptions) {
          target[key] = newOptions[key];
        }
        return target;
      }
      var Cache = (
        /** @class */
        (function() {
          function Cache2(options) {
            this.keys = [];
            this.values = [];
            this.options = options;
            var isMatchingKeyFunction = typeof options.isMatchingKey === "function";
            if (isMatchingKeyFunction) {
              this.getKeyIndex = this._getKeyIndexFromMatchingKey;
            } else if (options.maxSize > 1) {
              this.getKeyIndex = this._getKeyIndexForMany;
            } else {
              this.getKeyIndex = this._getKeyIndexForSingle;
            }
            this.canTransformKey = typeof options.transformKey === "function";
            this.shouldCloneArguments = this.canTransformKey || isMatchingKeyFunction;
            this.shouldUpdateOnAdd = typeof options.onCacheAdd === "function";
            this.shouldUpdateOnChange = typeof options.onCacheChange === "function";
            this.shouldUpdateOnHit = typeof options.onCacheHit === "function";
          }
          Object.defineProperty(Cache2.prototype, "size", {
            /**
             * The number of cached [key,value] results.
             */
            get: function() {
              return this.keys.length;
            },
            enumerable: false,
            configurable: true
          });
          Object.defineProperty(Cache2.prototype, "snapshot", {
            /**
             * A copy of the cache at a moment in time. This is useful
             * to compare changes over time, since the cache mutates
             * internally for performance reasons.
             */
            get: function() {
              return {
                keys: cloneArray(this.keys),
                size: this.size,
                values: cloneArray(this.values)
              };
            },
            enumerable: false,
            configurable: true
          });
          Cache2.prototype._getKeyIndexFromMatchingKey = function(keyToMatch) {
            var _a = this.options, isMatchingKey = _a.isMatchingKey, maxSize = _a.maxSize;
            var keys = this.keys;
            var keysLength = keys.length;
            if (!keysLength) {
              return -1;
            }
            if (isMatchingKey(keys[0], keyToMatch)) {
              return 0;
            }
            if (maxSize > 1) {
              for (var index = 1; index < keysLength; index++) {
                if (isMatchingKey(keys[index], keyToMatch)) {
                  return index;
                }
              }
            }
            return -1;
          };
          Cache2.prototype._getKeyIndexForMany = function(keyToMatch) {
            var isEqual = this.options.isEqual;
            var keys = this.keys;
            var keysLength = keys.length;
            if (!keysLength) {
              return -1;
            }
            if (keysLength === 1) {
              return this._getKeyIndexForSingle(keyToMatch);
            }
            var keyLength = keyToMatch.length;
            var existingKey;
            var argIndex;
            if (keyLength > 1) {
              for (var index = 0; index < keysLength; index++) {
                existingKey = keys[index];
                if (existingKey.length === keyLength) {
                  argIndex = 0;
                  for (; argIndex < keyLength; argIndex++) {
                    if (!isEqual(existingKey[argIndex], keyToMatch[argIndex])) {
                      break;
                    }
                  }
                  if (argIndex === keyLength) {
                    return index;
                  }
                }
              }
            } else {
              for (var index = 0; index < keysLength; index++) {
                existingKey = keys[index];
                if (existingKey.length === keyLength && isEqual(existingKey[0], keyToMatch[0])) {
                  return index;
                }
              }
            }
            return -1;
          };
          Cache2.prototype._getKeyIndexForSingle = function(keyToMatch) {
            var keys = this.keys;
            if (!keys.length) {
              return -1;
            }
            var existingKey = keys[0];
            var length = existingKey.length;
            if (keyToMatch.length !== length) {
              return -1;
            }
            var isEqual = this.options.isEqual;
            if (length > 1) {
              for (var index = 0; index < length; index++) {
                if (!isEqual(existingKey[index], keyToMatch[index])) {
                  return -1;
                }
              }
              return 0;
            }
            return isEqual(existingKey[0], keyToMatch[0]) ? 0 : -1;
          };
          Cache2.prototype.orderByLru = function(key, value, startingIndex) {
            var keys = this.keys;
            var values = this.values;
            var currentLength = keys.length;
            var index = startingIndex;
            while (index--) {
              keys[index + 1] = keys[index];
              values[index + 1] = values[index];
            }
            keys[0] = key;
            values[0] = value;
            var maxSize = this.options.maxSize;
            if (currentLength === maxSize && startingIndex === currentLength) {
              keys.pop();
              values.pop();
            } else if (startingIndex >= maxSize) {
              keys.length = values.length = maxSize;
            }
          };
          Cache2.prototype.updateAsyncCache = function(memoized) {
            var _this = this;
            var _a = this.options, onCacheChange = _a.onCacheChange, onCacheHit = _a.onCacheHit;
            var firstKey = this.keys[0];
            var firstValue = this.values[0];
            this.values[0] = firstValue.then(function(value) {
              if (_this.shouldUpdateOnHit) {
                onCacheHit(_this, _this.options, memoized);
              }
              if (_this.shouldUpdateOnChange) {
                onCacheChange(_this, _this.options, memoized);
              }
              return value;
            }, function(error) {
              var keyIndex = _this.getKeyIndex(firstKey);
              if (keyIndex !== -1) {
                _this.keys.splice(keyIndex, 1);
                _this.values.splice(keyIndex, 1);
              }
              throw error;
            });
          };
          return Cache2;
        })()
      );
      function createMemoizedFunction(fn, options) {
        if (options === void 0) {
          options = {};
        }
        if (isMemoized(fn)) {
          return createMemoizedFunction(fn.fn, mergeOptions(fn.options, options));
        }
        if (typeof fn !== "function") {
          throw new TypeError("You must pass a function to `memoize`.");
        }
        var _a = options.isEqual, isEqual = _a === void 0 ? isSameValueZero : _a, isMatchingKey = options.isMatchingKey, _b = options.isPromise, isPromise = _b === void 0 ? false : _b, _c = options.maxSize, maxSize = _c === void 0 ? 1 : _c, onCacheAdd = options.onCacheAdd, onCacheChange = options.onCacheChange, onCacheHit = options.onCacheHit, transformKey = options.transformKey;
        var normalizedOptions = mergeOptions({
          isEqual,
          isMatchingKey,
          isPromise,
          maxSize,
          onCacheAdd,
          onCacheChange,
          onCacheHit,
          transformKey
        }, getCustomOptions(options));
        var cache = new Cache(normalizedOptions);
        var keys = cache.keys, values = cache.values, canTransformKey = cache.canTransformKey, shouldCloneArguments = cache.shouldCloneArguments, shouldUpdateOnAdd = cache.shouldUpdateOnAdd, shouldUpdateOnChange = cache.shouldUpdateOnChange, shouldUpdateOnHit = cache.shouldUpdateOnHit;
        var memoized = function() {
          var key = shouldCloneArguments ? cloneArray(arguments) : arguments;
          if (canTransformKey) {
            key = transformKey(key);
          }
          var keyIndex = keys.length ? cache.getKeyIndex(key) : -1;
          if (keyIndex !== -1) {
            if (shouldUpdateOnHit) {
              onCacheHit(cache, normalizedOptions, memoized);
            }
            if (keyIndex) {
              cache.orderByLru(keys[keyIndex], values[keyIndex], keyIndex);
              if (shouldUpdateOnChange) {
                onCacheChange(cache, normalizedOptions, memoized);
              }
            }
          } else {
            var newValue = fn.apply(this, arguments);
            var newKey = shouldCloneArguments ? key : cloneArray(arguments);
            cache.orderByLru(newKey, newValue, keys.length);
            if (isPromise) {
              cache.updateAsyncCache(memoized);
            }
            if (shouldUpdateOnAdd) {
              onCacheAdd(cache, normalizedOptions, memoized);
            }
            if (shouldUpdateOnChange) {
              onCacheChange(cache, normalizedOptions, memoized);
            }
          }
          return values[0];
        };
        memoized.cache = cache;
        memoized.fn = fn;
        memoized.isMemoized = true;
        memoized.options = normalizedOptions;
        return memoized;
      }
      return createMemoizedFunction;
    }));
  }
});

// node_modules/.pnpm/deepmerge@4.3.1/node_modules/deepmerge/dist/cjs.js
var require_cjs = __commonJS({
  "node_modules/.pnpm/deepmerge@4.3.1/node_modules/deepmerge/dist/cjs.js"(exports, module) {
    "use strict";
    var isMergeableObject = function isMergeableObject2(value) {
      return isNonNullObject(value) && !isSpecial(value);
    };
    function isNonNullObject(value) {
      return !!value && typeof value === "object";
    }
    function isSpecial(value) {
      var stringValue = Object.prototype.toString.call(value);
      return stringValue === "[object RegExp]" || stringValue === "[object Date]" || isReactElement(value);
    }
    var canUseSymbol = typeof Symbol === "function" && Symbol.for;
    var REACT_ELEMENT_TYPE = canUseSymbol ? /* @__PURE__ */ Symbol.for("react.element") : 60103;
    function isReactElement(value) {
      return value.$$typeof === REACT_ELEMENT_TYPE;
    }
    function emptyTarget(val) {
      return Array.isArray(val) ? [] : {};
    }
    function cloneUnlessOtherwiseSpecified(value, options) {
      return options.clone !== false && options.isMergeableObject(value) ? deepmerge2(emptyTarget(value), value, options) : value;
    }
    function defaultArrayMerge(target, source, options) {
      return target.concat(source).map(function(element) {
        return cloneUnlessOtherwiseSpecified(element, options);
      });
    }
    function getMergeFunction(key, options) {
      if (!options.customMerge) {
        return deepmerge2;
      }
      var customMerge = options.customMerge(key);
      return typeof customMerge === "function" ? customMerge : deepmerge2;
    }
    function getEnumerableOwnPropertySymbols(target) {
      return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function(symbol) {
        return Object.propertyIsEnumerable.call(target, symbol);
      }) : [];
    }
    function getKeys(target) {
      return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
    }
    function propertyIsOnObject(object2, property) {
      try {
        return property in object2;
      } catch (_) {
        return false;
      }
    }
    function propertyIsUnsafe(target, key) {
      return propertyIsOnObject(target, key) && !(Object.hasOwnProperty.call(target, key) && Object.propertyIsEnumerable.call(target, key));
    }
    function mergeObject(target, source, options) {
      var destination = {};
      if (options.isMergeableObject(target)) {
        getKeys(target).forEach(function(key) {
          destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
        });
      }
      getKeys(source).forEach(function(key) {
        if (propertyIsUnsafe(target, key)) {
          return;
        }
        if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
          destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
        } else {
          destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
        }
      });
      return destination;
    }
    function deepmerge2(target, source, options) {
      options = options || {};
      options.arrayMerge = options.arrayMerge || defaultArrayMerge;
      options.isMergeableObject = options.isMergeableObject || isMergeableObject;
      options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
      var sourceIsArray = Array.isArray(source);
      var targetIsArray = Array.isArray(target);
      var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
      if (!sourceAndTargetTypesMatch) {
        return cloneUnlessOtherwiseSpecified(source, options);
      } else if (sourceIsArray) {
        return options.arrayMerge(target, source, options);
      } else {
        return mergeObject(target, source, options);
      }
    }
    deepmerge2.all = function deepmergeAll(array2, options) {
      if (!Array.isArray(array2)) {
        throw new Error("first argument should be an array");
      }
      return array2.reduce(function(prev, next) {
        return deepmerge2(prev, next, options);
      }, {});
    };
    var deepmerge_1 = deepmerge2;
    module.exports = deepmerge_1;
  }
});

// third-party/liftosaur/upstream/src/utils/collection.ts
function CollectionUtils_compact(arr) {
  return arr.filter((i) => i);
}
function CollectionUtils_sortBy(arr, key, isReverse) {
  const arrCopy = [...arr];
  arrCopy.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    return isReverse ? bVal - aVal : aVal - bVal;
  });
  return arrCopy;
}
function CollectionUtils_remove(from, item) {
  return from.filter((t) => t !== item);
}
function CollectionUtils_findIndexReverse(from, cb) {
  for (let i = from.length - 1; i >= 0; i -= 1) {
    if (cb(from[i])) {
      return i;
    }
  }
  return -1;
}

// third-party/liftosaur/upstream/src/utils/object.ts
function ObjectUtils_keys(obj) {
  return Object.keys(obj);
}
function ObjectUtils_values(obj) {
  if ("values" in Object) {
    return Object.values(obj);
  } else {
    return ObjectUtils_keys(obj).map((key) => obj[key]);
  }
}
function ObjectUtils_entries(obj) {
  return ObjectUtils_keys(obj).map((key) => [key, obj[key]]);
}
function ObjectUtils_isEqual(obj1, obj2, ignoreKeys = []) {
  if (obj1 === obj2) {
    return true;
  }
  const stack = [[obj1, obj2]];
  while (stack.length > 0) {
    const [currentObj1, currentObj2] = stack.pop();
    if (currentObj1 === currentObj2) {
      continue;
    }
    if (typeof currentObj1 !== "object" || typeof currentObj2 !== "object" || currentObj1 == null || currentObj2 == null) {
      if (currentObj1 !== currentObj2) {
        return false;
      }
      continue;
    }
    const keys1 = Object.keys(currentObj1);
    const keys2 = Object.keys(currentObj2);
    for (const key of /* @__PURE__ */ new Set([...keys1, ...keys2])) {
      if (ignoreKeys.indexOf(key) !== -1) {
        continue;
      }
      stack.push([currentObj1[key], currentObj2[key]]);
    }
  }
  return true;
}
function ObjectUtils_diff(oldObj, newObj) {
  const chKeys = ObjectUtils_changedKeys(oldObj, newObj);
  const result = {};
  for (const key of ObjectUtils_keys(chKeys)) {
    const value = chKeys[key];
    if (value === "add" || value === "update") {
      result[key] = newObj[key];
    }
  }
  return result;
}
function ObjectUtils_changedKeys(oldObj, newObj, eq = (a, b) => a === b) {
  let oldKeys = ObjectUtils_keys(oldObj);
  const newKeys = ObjectUtils_keys(newObj);
  const changes = {};
  for (const newKey of newKeys) {
    if (newObj[newKey] != null && oldObj[newKey] == null) {
      changes[newKey] = "add";
    } else if (newObj[newKey] == null && oldObj[newKey] != null) {
      changes[newKey] = "delete";
    } else if (newObj[newKey] != null && oldObj[newKey] != null) {
      if (!eq(newObj[newKey], oldObj[newKey])) {
        changes[newKey] = "update";
      }
    }
    oldKeys = CollectionUtils_remove(oldKeys, newKey);
  }
  for (const oldKey of oldKeys) {
    if (oldObj[oldKey] != null && newObj[oldKey] == null) {
      changes[oldKey] = "delete";
    }
  }
  return changes;
}
function ObjectUtils_filter(obj, cb) {
  const filteredKeys = ObjectUtils_keys(obj).filter((key) => {
    const value = obj[key];
    return cb(key, value);
  });
  return filteredKeys.reduce((memo, k) => {
    memo[k] = obj[k];
    return memo;
  }, {});
}
function ObjectUtils_pick(obj, theKeys) {
  return ObjectUtils_keys(obj).reduce((memo, key) => {
    if (theKeys.indexOf(key) !== -1) {
      memo[key] = obj[key];
    }
    return memo;
  }, {});
}
function ObjectUtils_findKeyByExpression(obj, expression) {
  for (const key of ObjectUtils_keys(obj)) {
    if (expression(key, obj[key])) {
      return key;
    }
  }
  return void 0;
}
function ObjectUtils_clone(obj) {
  return structuredCloneLike(obj, /* @__PURE__ */ new WeakMap());
}
function structuredCloneLike(obj, seen) {
  if (obj === null) {
    return obj;
  }
  const type = typeof obj;
  if (type !== "object") {
    return type === "function" || type === "symbol" ? void 0 : obj;
  }
  const value = obj;
  const existing = seen.get(value);
  if (existing !== void 0) {
    return existing;
  }
  if (value instanceof Date) {
    const result2 = new Date(value.getTime());
    seen.set(value, result2);
    return result2;
  }
  if (value instanceof RegExp) {
    const result2 = new RegExp(value.source, value.flags);
    seen.set(value, result2);
    return result2;
  }
  if (value instanceof ArrayBuffer) {
    const result2 = value.slice(0);
    seen.set(value, result2);
    return result2;
  }
  if (ArrayBuffer.isView(value)) {
    const view = value;
    const buffer = structuredCloneLike(view.buffer, seen);
    const result2 = value instanceof DataView ? new DataView(buffer, view.byteOffset, view.byteLength) : new value.constructor(
      buffer,
      view.byteOffset,
      view.length
    );
    seen.set(value, result2);
    return result2;
  }
  if (value instanceof Map) {
    const result2 = /* @__PURE__ */ new Map();
    seen.set(value, result2);
    for (const [k, v] of value) {
      result2.set(structuredCloneLike(k, seen), structuredCloneLike(v, seen));
    }
    return result2;
  }
  if (value instanceof Set) {
    const result2 = /* @__PURE__ */ new Set();
    seen.set(value, result2);
    for (const v of value) {
      result2.add(structuredCloneLike(v, seen));
    }
    return result2;
  }
  if (Array.isArray(value)) {
    const result2 = new Array(value.length);
    seen.set(value, result2);
    for (let i = 0; i < value.length; i += 1) {
      if (i in value) {
        result2[i] = structuredCloneLike(value[i], seen);
      }
    }
    return result2;
  }
  const result = {};
  seen.set(value, result);
  for (const key of Object.keys(value)) {
    const item = value[key];
    if (typeof item === "function" || typeof item === "symbol") {
      continue;
    }
    result[key] = structuredCloneLike(item, seen);
  }
  return result;
}

// third-party/liftosaur/upstream/src/utils/math.ts
function MathUtils_round(value, to) {
  return MathUtils_roundFloat(Math.round(value / to) * to, 4);
}
function MathUtils_roundTo005(value) {
  return MathUtils_round(value, 0.05);
}
function MathUtils_roundTo0005(value) {
  return MathUtils_round(value, 5e-3);
}
function MathUtils_roundTo000005(value) {
  return MathUtils_round(value, 5e-5);
}
function MathUtils_roundFloat(value, precision) {
  if (typeof value !== "number" || isNaN(value)) {
    return 0;
  }
  return +value.toFixed(precision);
}
function MathUtils_applyOp(a, b, opr) {
  if (opr === "=") {
    return b;
  } else if (opr === "+=") {
    return a + b;
  } else if (opr === "-=") {
    return a - b;
  } else if (opr === "*=") {
    return MathUtils_roundTo005(a * b);
  } else {
    return MathUtils_roundTo005(a / b);
  }
}
function MathUtils_clamp(value, min2, max2) {
  if (min2 != null && max2 != null) {
    return Math.max(min2, Math.min(max2, value));
  } else if (min2 != null) {
    return Math.max(min2, value);
  } else if (max2 != null) {
    return Math.min(max2, value);
  } else {
    return value;
  }
}
function n(value, precision = 2) {
  return `${MathUtils_roundFloat(value, precision)}`;
}

// node_modules/.pnpm/valibot@1.5.0_typescript@6.0.3/node_modules/valibot/dist/index.mjs
var store$4;
var DEFAULT_CONFIG = {
  lang: void 0,
  message: void 0,
  abortEarly: void 0,
  abortPipeEarly: void 0
};
// @__NO_SIDE_EFFECTS__
function getGlobalConfig(config$1) {
  if (!config$1 && !store$4) return DEFAULT_CONFIG;
  return {
    lang: config$1?.lang ?? store$4?.lang,
    message: config$1?.message,
    abortEarly: config$1?.abortEarly ?? store$4?.abortEarly,
    abortPipeEarly: config$1?.abortPipeEarly ?? store$4?.abortPipeEarly
  };
}
var store$3;
// @__NO_SIDE_EFFECTS__
function getGlobalMessage(lang) {
  return store$3?.get(lang);
}
var store$2;
// @__NO_SIDE_EFFECTS__
function getSchemaMessage(lang) {
  return store$2?.get(lang);
}
var store$1;
// @__NO_SIDE_EFFECTS__
function getSpecificMessage(reference, lang) {
  return store$1?.get(reference)?.get(lang);
}
// @__NO_SIDE_EFFECTS__
function _stringify(input) {
  const type = typeof input;
  if (type === "string") return `"${input}"`;
  if (type === "number" || type === "bigint" || type === "boolean") return `${input}`;
  if (type === "object" || type === "function") return (input && Object.getPrototypeOf(input)?.constructor?.name) ?? "null";
  return type;
}
function _addIssue(context, label, dataset, config$1, other) {
  const input = other && "input" in other ? other.input : dataset.value;
  const expected = other?.expected ?? context.expects ?? null;
  const received = other?.received ?? /* @__PURE__ */ _stringify(input);
  const issue = {
    kind: context.kind,
    type: context.type,
    input,
    expected,
    received,
    message: `Invalid ${label}: ${expected ? `Expected ${expected} but r` : "R"}eceived ${received}`,
    requirement: context.requirement,
    path: other?.path,
    issues: other?.issues,
    lang: config$1.lang,
    abortEarly: config$1.abortEarly,
    abortPipeEarly: config$1.abortPipeEarly
  };
  const isSchema = context.kind === "schema";
  const message$1 = other?.message ?? context.message ?? /* @__PURE__ */ getSpecificMessage(context.reference, issue.lang) ?? (isSchema ? /* @__PURE__ */ getSchemaMessage(issue.lang) : null) ?? config$1.message ?? /* @__PURE__ */ getGlobalMessage(issue.lang);
  if (message$1 !== void 0) issue.message = typeof message$1 === "function" ? message$1(issue) : message$1;
  if (isSchema) dataset.typed = false;
  if (dataset.issues) dataset.issues.push(issue);
  else dataset.issues = [issue];
}
// @__NO_SIDE_EFFECTS__
function _isSameValueZero(value1, value2) {
  return value1 === value2 || Number.isNaN(value1) && Number.isNaN(value2);
}
// @__NO_SIDE_EFFECTS__
function _isValidObjectKey(object$1, key) {
  return Object.prototype.hasOwnProperty.call(object$1, key) && key !== "__proto__" && key !== "prototype" && key !== "constructor";
}
// @__NO_SIDE_EFFECTS__
function _joinExpects(values$1, separator) {
  const list = [...new Set(values$1)];
  if (list.length > 1) return `(${list.join(` ${separator} `)})`;
  return list[0] ?? "never";
}
function _standardSchema(schema) {
  schema["~standard"] = {
    version: 1,
    vendor: "valibot",
    validate: (value$1) => schema["~run"]({ value: value$1 }, /* @__PURE__ */ getGlobalConfig())
  };
  return schema;
}
var ABORT_EARLY_CONFIG = { abortEarly: true };
// @__NO_SIDE_EFFECTS__
function getFallback(schema, dataset, config$1) {
  return typeof schema.fallback === "function" ? schema.fallback(dataset, config$1) : schema.fallback;
}
// @__NO_SIDE_EFFECTS__
function getDefault(schema, dataset, config$1) {
  return typeof schema.default === "function" ? schema.default(dataset, config$1) : schema.default;
}
// @__NO_SIDE_EFFECTS__
function is(schema, input) {
  return !schema["~run"]({ value: input }, ABORT_EARLY_CONFIG).issues;
}
// @__NO_SIDE_EFFECTS__
function any() {
  return _standardSchema({
    kind: "schema",
    type: "any",
    reference: any,
    expects: "any",
    async: false,
    "~run"(dataset) {
      dataset.typed = true;
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function array(item, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "array",
    reference: array,
    expects: "Array",
    async: false,
    item,
    message: message$1,
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        for (let key = 0; key < input.length; key++) {
          const value$1 = input[key];
          const itemDataset = this.item["~run"]({ value: value$1 }, config$1);
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value$1
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) issue.path.unshift(pathItem);
              else issue.path = [pathItem];
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) dataset.issues = itemDataset.issues;
            if (config$1.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) dataset.typed = false;
          dataset.value.push(itemDataset.value);
        }
      } else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function boolean(message$1) {
  return _standardSchema({
    kind: "schema",
    type: "boolean",
    reference: boolean,
    expects: "boolean",
    async: false,
    message: message$1,
    "~run"(dataset, config$1) {
      if (typeof dataset.value === "boolean") dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function lazy(getter) {
  return _standardSchema({
    kind: "schema",
    type: "lazy",
    reference: lazy,
    expects: "unknown",
    async: false,
    getter,
    "~run"(dataset, config$1) {
      return this.getter(dataset.value)["~run"](dataset, config$1);
    }
  });
}
// @__NO_SIDE_EFFECTS__
function literal(literal_, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "literal",
    reference: literal,
    expects: /* @__PURE__ */ _stringify(literal_),
    async: false,
    literal: literal_,
    message: message$1,
    "~run"(dataset, config$1) {
      if (/* @__PURE__ */ _isSameValueZero(dataset.value, this.literal)) dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function null_(message$1) {
  return _standardSchema({
    kind: "schema",
    type: "null",
    reference: null_,
    expects: "null",
    async: false,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.value === null) dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function nullish(wrapped, default_) {
  return _standardSchema({
    kind: "schema",
    type: "nullish",
    reference: nullish,
    expects: `(${wrapped.expects} | null | undefined)`,
    async: false,
    wrapped,
    default: default_,
    "~run"(dataset, config$1) {
      if (dataset.value === null || dataset.value === void 0) {
        if (this.default !== void 0) dataset.value = /* @__PURE__ */ getDefault(this, dataset, config$1);
        if (dataset.value === null || dataset.value === void 0) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config$1);
    }
  });
}
// @__NO_SIDE_EFFECTS__
function number(message$1) {
  return _standardSchema({
    kind: "schema",
    type: "number",
    reference: number,
    expects: "number",
    async: false,
    message: message$1,
    "~run"(dataset, config$1) {
      if (typeof dataset.value === "number" && !isNaN(dataset.value)) dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function object(entries$1, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "object",
    reference: object,
    expects: "Object",
    async: false,
    entries: entries$1,
    message: message$1,
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        for (const key in this.entries) {
          const valueSchema = this.entries[key];
          if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && valueSchema.default !== void 0) {
            const value$1 = key in input ? input[key] : /* @__PURE__ */ getDefault(valueSchema);
            const valueDataset = valueSchema["~run"]({ value: value$1 }, config$1);
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key,
                value: value$1
              };
              for (const issue of valueDataset.issues) {
                if (issue.path) issue.path.unshift(pathItem);
                else issue.path = [pathItem];
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) dataset.issues = valueDataset.issues;
              if (config$1.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!valueDataset.typed) dataset.typed = false;
            dataset.value[key] = valueDataset.value;
          } else if (valueSchema.fallback !== void 0) dataset.value[key] = /* @__PURE__ */ getFallback(valueSchema);
          else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
            _addIssue(this, "key", dataset, config$1, {
              input: void 0,
              expected: `"${key}"`,
              path: [{
                type: "object",
                origin: "key",
                input,
                key,
                value: input[key]
              }]
            });
            if (config$1.abortEarly) break;
          }
        }
      } else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function optional(wrapped, default_) {
  return _standardSchema({
    kind: "schema",
    type: "optional",
    reference: optional,
    expects: `(${wrapped.expects} | undefined)`,
    async: false,
    wrapped,
    default: default_,
    "~run"(dataset, config$1) {
      if (dataset.value === void 0) {
        if (this.default !== void 0) dataset.value = /* @__PURE__ */ getDefault(this, dataset, config$1);
        if (dataset.value === void 0) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config$1);
    }
  });
}
// @__NO_SIDE_EFFECTS__
function picklist(options, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "picklist",
    reference: picklist,
    expects: /* @__PURE__ */ _joinExpects(options.map(_stringify), "|"),
    async: false,
    options,
    message: message$1,
    "~run"(dataset, config$1) {
      if (this.options.includes(dataset.value)) dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function record(key, value$1, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "record",
    reference: record,
    expects: "Object",
    async: false,
    key,
    value: value$1,
    message: message$1,
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        for (const entryKey in input) if (/* @__PURE__ */ _isValidObjectKey(input, entryKey)) {
          const entryValue = input[entryKey];
          const keyDataset = this.key["~run"]({ value: entryKey }, config$1);
          if (keyDataset.issues) {
            const pathItem = {
              type: "object",
              origin: "key",
              input,
              key: entryKey,
              value: entryValue
            };
            for (const issue of keyDataset.issues) {
              issue.path = [pathItem];
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) dataset.issues = keyDataset.issues;
            if (config$1.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          const valueDataset = this.value["~run"]({ value: entryValue }, config$1);
          if (valueDataset.issues) {
            const pathItem = {
              type: "object",
              origin: "value",
              input,
              key: entryKey,
              value: entryValue
            };
            for (const issue of valueDataset.issues) {
              if (issue.path) issue.path.unshift(pathItem);
              else issue.path = [pathItem];
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) dataset.issues = valueDataset.issues;
            if (config$1.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!keyDataset.typed || !valueDataset.typed) dataset.typed = false;
          if (keyDataset.typed) dataset.value[keyDataset.value] = valueDataset.value;
        }
      } else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function string(message$1) {
  return _standardSchema({
    kind: "schema",
    type: "string",
    reference: string,
    expects: "string",
    async: false,
    message: message$1,
    "~run"(dataset, config$1) {
      if (typeof dataset.value === "string") dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function tuple(items, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "tuple",
    reference: tuple,
    expects: "Array",
    async: false,
    items,
    message: message$1,
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        for (let key = 0; key < this.items.length; key++) {
          const value$1 = input[key];
          const itemDataset = this.items[key]["~run"]({ value: value$1 }, config$1);
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value$1
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) issue.path.unshift(pathItem);
              else issue.path = [pathItem];
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) dataset.issues = itemDataset.issues;
            if (config$1.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) dataset.typed = false;
          dataset.value.push(itemDataset.value);
        }
      } else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function undefined_(message$1) {
  return _standardSchema({
    kind: "schema",
    type: "undefined",
    reference: undefined_,
    expects: "undefined",
    async: false,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.value === void 0) dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function _subIssues(datasets) {
  let issues;
  if (datasets) for (const dataset of datasets) if (issues) for (const issue of dataset.issues) issues.push(issue);
  else issues = dataset.issues;
  return issues;
}
// @__NO_SIDE_EFFECTS__
function union(options, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "union",
    reference: union,
    expects: /* @__PURE__ */ _joinExpects(options.map((option) => option.expects), "|"),
    async: false,
    options,
    message: message$1,
    "~run"(dataset, config$1) {
      let validDataset;
      let typedDatasets;
      let untypedDatasets;
      for (const schema of this.options) {
        const optionDataset = schema["~run"]({ value: dataset.value }, config$1);
        if (optionDataset.typed) if (optionDataset.issues) if (typedDatasets) typedDatasets.push(optionDataset);
        else typedDatasets = [optionDataset];
        else {
          validDataset = optionDataset;
          break;
        }
        else if (untypedDatasets) untypedDatasets.push(optionDataset);
        else untypedDatasets = [optionDataset];
      }
      if (validDataset) return validDataset;
      if (typedDatasets) {
        if (typedDatasets.length === 1) return typedDatasets[0];
        _addIssue(this, "type", dataset, config$1, { issues: /* @__PURE__ */ _subIssues(typedDatasets) });
        dataset.typed = true;
      } else if (untypedDatasets?.length === 1) return untypedDatasets[0];
      else _addIssue(this, "type", dataset, config$1, { issues: /* @__PURE__ */ _subIssues(untypedDatasets) });
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function unknown() {
  return _standardSchema({
    kind: "schema",
    type: "unknown",
    reference: unknown,
    expects: "unknown",
    async: false,
    "~run"(dataset) {
      dataset.typed = true;
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function variant(key, options, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "variant",
    reference: variant,
    expects: "Object",
    async: false,
    key,
    options,
    message: message$1,
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        let outputDataset;
        let maxDiscriminatorPriority = 0;
        let invalidDiscriminatorKey = this.key;
        let expectedDiscriminators = [];
        const parseOptions = (variant$1, allKeys) => {
          for (const schema of variant$1.options) {
            if (schema.type === "variant") parseOptions(schema, new Set(allKeys).add(schema.key));
            else {
              let keysAreValid = true;
              let currentPriority = 0;
              for (const currentKey of allKeys) {
                const discriminatorSchema = schema.entries[currentKey];
                if (currentKey in input ? discriminatorSchema["~run"]({
                  typed: false,
                  value: input[currentKey]
                }, ABORT_EARLY_CONFIG).issues : discriminatorSchema.type !== "exact_optional" && discriminatorSchema.type !== "optional" && discriminatorSchema.type !== "nullish") {
                  keysAreValid = false;
                  if (invalidDiscriminatorKey !== currentKey && (maxDiscriminatorPriority < currentPriority || maxDiscriminatorPriority === currentPriority && currentKey in input && !(invalidDiscriminatorKey in input))) {
                    maxDiscriminatorPriority = currentPriority;
                    invalidDiscriminatorKey = currentKey;
                    expectedDiscriminators = [];
                  }
                  if (invalidDiscriminatorKey === currentKey) expectedDiscriminators.push(schema.entries[currentKey].expects);
                  break;
                }
                currentPriority++;
              }
              if (keysAreValid) {
                const optionDataset = schema["~run"]({ value: input }, config$1);
                if (!outputDataset || !outputDataset.typed && optionDataset.typed) outputDataset = optionDataset;
              }
            }
            if (outputDataset && !outputDataset.issues) break;
          }
        };
        parseOptions(this, /* @__PURE__ */ new Set([this.key]));
        if (outputDataset) return outputDataset;
        _addIssue(this, "type", dataset, config$1, {
          input: input[invalidDiscriminatorKey],
          expected: /* @__PURE__ */ _joinExpects(expectedDiscriminators, "|"),
          path: [{
            type: "object",
            origin: "value",
            input,
            key: invalidDiscriminatorKey,
            value: input[invalidDiscriminatorKey]
          }]
        });
      } else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
// @__NO_SIDE_EFFECTS__
function partial(schema, keys) {
  const entries$1 = {};
  for (const key in schema.entries) entries$1[key] = !keys || keys.includes(key) ? /* @__PURE__ */ optional(schema.entries[key]) : schema.entries[key];
  return _standardSchema({
    ...schema,
    entries: entries$1
  });
}
// @__NO_SIDE_EFFECTS__
function safeParse(schema, input, config$1) {
  const dataset = schema["~run"]({ value: input }, /* @__PURE__ */ getGlobalConfig(config$1));
  return {
    typed: dataset.typed,
    success: !dataset.issues,
    output: dataset.value,
    issues: dataset.issues
  };
}

// third-party/liftosaur/upstream/src/types.ts
var equipments = [
  "barbell",
  "cable",
  "dumbbell",
  "smith",
  "band",
  "kettlebell",
  "bodyweight",
  "leverageMachine",
  "medicineball",
  "ezbar",
  "trapbar"
];
var availableMuscles = [
  "Adductor Brevis",
  "Adductor Longus",
  "Adductor Magnus",
  "Biceps Brachii",
  "Brachialis",
  "Brachioradialis",
  "Deltoid Anterior",
  "Deltoid Lateral",
  "Deltoid Posterior",
  "Erector Spinae",
  "Gastrocnemius",
  "Gluteus Maximus",
  "Gluteus Medius",
  "Hamstrings",
  "Iliopsoas",
  "Infraspinatus",
  "Latissimus Dorsi",
  "Levator Scapulae",
  "Obliques",
  "Pectineous",
  "Pectoralis Major Clavicular Head",
  "Pectoralis Major Sternal Head",
  "Quadriceps",
  "Rectus Abdominis",
  "Sartorius",
  "Serratus Anterior",
  "Soleus",
  "Splenius",
  "Sternocleidomastoid",
  "Tensor Fasciae Latae",
  "Teres Major",
  "Teres Minor",
  "Tibialis Anterior",
  "Trapezius Lower Fibers",
  "Trapezius Middle Fibers",
  "Trapezius Upper Fibers",
  "Triceps Brachii",
  "Wrist Extensors",
  "Wrist Flexors"
];
var availableBodyParts = [
  "Back",
  "Calves",
  "Chest",
  "Forearms",
  "Hips",
  "Shoulders",
  "Thighs",
  "Upper Arms",
  "Waist"
];
var exerciseKinds = ["core", "pull", "push", "legs", "upper", "lower"];
var graphExerciseSelectedTypes = ["weight", "volume"];
var graphMuscleGroupSelectedTypes = ["volume", "sets"];
var units = ["kg", "lb"];
var percentageUnits = ["%"];
var lengthUnits = ["in", "cm"];
var historyRecordChange = ["order"];
var targetTypes = ["target", "lasttime", "platescalculator", "e1rm"];
var exercisePickerSorts = ["name_asc", "similar_muscles"];
var screenMuscles = [
  "chest",
  "lats",
  "upperBack",
  "frontDelts",
  "sideDelts",
  "rearDelts",
  "biceps",
  "triceps",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "abs",
  "upperTraps",
  "lowerBack",
  "neck",
  "rotatorCuff",
  "forearmFlexors",
  "forearmExtensors",
  "obliques",
  "hipFlexors",
  "abductors",
  "adductors"
];
var statsWeightDef = ["weight"];
var statsLengthDef = [
  "neck",
  "shoulders",
  "bicepLeft",
  "bicepRight",
  "forearmLeft",
  "forearmRight",
  "chest",
  "waist",
  "hips",
  "thighLeft",
  "thighRight",
  "calfLeft",
  "calfRight"
];
var statsPercentageDef = ["bodyfat"];
var statsHealthDef = ["sleep", "calories", "protein"];
var VUnit = picklist(units);
var VPercentageUnit = picklist(percentageUnits);
var VLengthUnit = picklist(lengthUnits);
var VExerciseKind = picklist(exerciseKinds);
var VMuscle = picklist(availableMuscles);
var VBodyPart = picklist(availableBodyParts);
var VBarKey = picklist(["barbell", "ezbar", "dumbbell"]);
var VBuiltinEquipment = picklist(equipments);
var VExercisePickerSort = picklist(exercisePickerSorts);
var VExercisePickerScreen = picklist(["exercisePicker", "customExercise", "filter", "settings"]);
var VHistoryRecordChange = picklist(historyRecordChange);
var VTargetType = picklist(targetTypes);
var VProgressMode = picklist(["warmup", "workout"]);
var VTimedSetSide = picklist(["left", "right", "bilateral"]);
var VProgramTag = picklist([
  "first-starter",
  "beginner",
  "barbell",
  "dumbbell",
  "intermediate",
  "woman",
  "ppl",
  "hypertrophy"
]);
var VGraphExerciseSelectedType = picklist(graphExerciseSelectedTypes);
var VGraphMuscleGroupSelectedType = picklist(graphMuscleGroupSelectedTypes);
var VScreenMuscle = union([picklist(screenMuscles), string()]);
var VEquipment = string();
var VExerciseId = string();
var _VWeight = object({
  value: number(),
  unit: VUnit
});
var VWeight = _VWeight;
var _VPercentage = object({
  value: number(),
  unit: VPercentageUnit
});
var VPercentage = _VPercentage;
var _VLength = object({
  value: number(),
  unit: VLengthUnit
});
var VLength = _VLength;
var _VPlate = object({
  weight: VWeight,
  num: number()
});
var VBars = record(string(), VWeight);
var _VMetaExercises = object({
  bodyParts: array(VBodyPart),
  targetMuscles: array(VMuscle),
  synergistMuscles: array(VMuscle),
  sortedEquipment: optional(array(VEquipment))
});
var VMetaExercises = _VMetaExercises;
var _VExerciseType = object({
  id: VExerciseId,
  equipment: optional(VEquipment)
});
var VExerciseType = _VExerciseType;
var _VCustomExercise = object({
  vtype: literal("custom_exercise"),
  id: VExerciseId,
  name: string(),
  isDeleted: boolean(),
  meta: VMetaExercises,
  defaultEquipment: optional(VEquipment),
  types: optional(array(VExerciseKind)),
  clonedFrom: optional(VExerciseType),
  reuseImageFrom: optional(VExerciseType),
  largeImageUrl: optional(string()),
  smallImageUrl: optional(string())
});
var VCustomExercise = _VCustomExercise;
var _VSet = object({
  vtype: literal("set"),
  index: number(),
  id: string(),
  reps: optional(number()),
  originalWeight: optional(union([VWeight, VPercentage])),
  weight: optional(VWeight),
  minReps: optional(number()),
  rpe: optional(number()),
  logRpe: optional(boolean()),
  timestamp: optional(number()),
  isAmrap: optional(boolean()),
  label: optional(string()),
  timer: optional(number()),
  setTimer: optional(number()),
  isOverflowSetTimer: optional(boolean()),
  auto: optional(boolean()),
  askWeight: optional(boolean()),
  isCompleted: optional(boolean()),
  isUnilateral: optional(boolean()),
  completedRepsLeft: optional(number()),
  completedReps: optional(number()),
  completedWeight: optional(VWeight),
  completedRpe: optional(number()),
  completedSetTimer: optional(number()),
  completedSetTimerLeft: optional(number()),
  programSetIndex: optional(number())
});
var VSet = _VSet;
var VProgramState = record(string(), union([number(), VWeight, VPercentage]));
var _VHistoryEntryProgressSnapshot = object({
  diffState: optional(record(string(), string())),
  diffVars: optional(record(string(), string())),
  prints: optional(array(array(union([number(), VWeight, VPercentage])))),
  updatePrints: optional(array(array(union([number(), VWeight, VPercentage])))),
  printLines: optional(array(string())),
  updatePrintLines: optional(array(string()))
});
var VHistoryEntryProgressSnapshot = _VHistoryEntryProgressSnapshot;
var _VHistoryEntry = object({
  vtype: literal("history_entry"),
  exercise: VExerciseType,
  sets: array(VSet),
  warmupSets: array(VSet),
  index: number(),
  id: string(),
  programExerciseId: optional(string()),
  state: optional(VProgramState),
  vars: optional(VProgramState),
  notes: optional(string()),
  changed: optional(boolean()),
  isSuppressed: optional(boolean()),
  superset: optional(string()),
  updatePrints: optional(array(array(union([number(), VWeight, VPercentage])))),
  updatePrintLines: optional(array(string())),
  descriptionSnapshot: optional(string()),
  progressSnapshot: optional(VHistoryEntryProgressSnapshot)
});
var VHistoryEntry = _VHistoryEntry;
var _VProgramStateMetadataValue = object({
  userPrompted: optional(boolean())
});
var VProgramStateMetadataValue = _VProgramStateMetadataValue;
var VProgramStateMetadata = record(string(), optional(VProgramStateMetadataValue));
var _VProgramSet = object({
  repsExpr: string(),
  weightExpr: string(),
  isAmrap: optional(boolean()),
  rpeExpr: optional(string()),
  minRepsExpr: optional(string()),
  logRpe: optional(boolean()),
  askWeight: optional(boolean()),
  label: optional(string()),
  timerExpr: optional(string())
});
var VProgramSet = _VProgramSet;
var _VProgramExerciseVariation = object({
  sets: array(VProgramSet),
  quickAddSets: optional(boolean())
});
var VProgramExerciseVariation = _VProgramExerciseVariation;
var _VProgramExerciseWarmupSet = object({
  reps: number(),
  value: union([VWeight, number()]),
  threshold: VWeight
});
var VProgramExerciseWarmupSet = _VProgramExerciseWarmupSet;
var _VProgramExerciseReuseLogic = object({
  selected: optional(string()),
  states: record(string(), VProgramState)
});
var VProgramExerciseReuseLogic = _VProgramExerciseReuseLogic;
var _VProgramExercise = object({
  exerciseType: VExerciseType,
  id: string(),
  name: string(),
  variations: array(VProgramExerciseVariation),
  state: VProgramState,
  variationExpr: string(),
  finishDayExpr: string(),
  descriptions: array(string()),
  tags: optional(array(number())),
  updateDayExpr: optional(string()),
  diffPaths: optional(array(string())),
  description: optional(string()),
  descriptionExpr: optional(string()),
  quickAddSets: optional(boolean()),
  enableRepRanges: optional(boolean()),
  enableRpe: optional(boolean()),
  stateMetadata: optional(VProgramStateMetadata),
  timerExpr: optional(string()),
  reuseLogic: optional(VProgramExerciseReuseLogic),
  warmupSets: optional(array(VProgramExerciseWarmupSet)),
  reuseFinishDayScript: optional(string()),
  reuseUpdateDayScript: optional(string())
});
var VProgramExercise = _VProgramExercise;
var _VExercisePickerFilters = object({
  equipment: optional(array(VBuiltinEquipment)),
  type: optional(array(VExerciseKind)),
  muscles: optional(array(VMuscle)),
  isStarred: optional(boolean())
});
var VExercisePickerFilters = _VExercisePickerFilters;
var _VExercisePickerProgramExercise = object({
  type: literal("program"),
  exerciseType: VExerciseType,
  week: number(),
  dayInWeek: number()
});
var VExercisePickerProgramExercise = _VExercisePickerProgramExercise;
var _VExercisePickerAdhocExercise = object({
  type: literal("adhoc"),
  exerciseType: VExerciseType,
  label: optional(string())
});
var VExercisePickerAdhocExercise = _VExercisePickerAdhocExercise;
var _VExercisePickerTemplate = object({
  type: literal("template"),
  name: string(),
  label: optional(string())
});
var VExercisePickerTemplate = _VExercisePickerTemplate;
var VExercisePickerSelectedExercise = union([
  VExercisePickerProgramExercise,
  VExercisePickerAdhocExercise,
  VExercisePickerTemplate
]);
var _VExercisePickerState = object({
  screenStack: array(VExercisePickerScreen),
  sort: VExercisePickerSort,
  filters: VExercisePickerFilters,
  selectedExercises: array(VExercisePickerSelectedExercise),
  mode: union([literal("workout"), literal("program")]),
  showMuscles: optional(boolean()),
  customExerciseName: optional(string()),
  label: optional(string()),
  templateName: optional(string()),
  selectedTab: optional(number()),
  editCustomExercise: optional(VCustomExercise),
  search: optional(string()),
  exerciseType: optional(VExerciseType),
  entryIndex: optional(number()),
  hideLabel: optional(boolean()),
  hideTemplate: optional(boolean())
});
var VExercisePickerState = _VExercisePickerState;
var _VProgressUi = object({
  vtype: optional(literal("progress_ui")),
  id: optional(string()),
  editModal: optional(
    object({
      programExerciseId: string(),
      entryIndex: number()
    })
  ),
  dateModal: optional(
    object({
      date: string(),
      time: number()
    })
  ),
  exercisePicker: optional(
    object({
      state: optional(VExercisePickerState)
    })
  ),
  equipmentModal: optional(
    object({
      exerciseType: optional(VExerciseType)
    })
  ),
  rm1Modal: optional(
    object({
      exerciseType: optional(VExerciseType)
    })
  ),
  editSetModal: optional(
    object({
      isWarmup: boolean(),
      entryIndex: number(),
      exerciseType: optional(VExerciseType),
      programExerciseId: optional(string()),
      set: VSet,
      setIndex: optional(number())
    })
  ),
  setTimerEditModal: optional(
    object({
      entryIndex: number(),
      setIndex: number()
    })
  ),
  roundingModal: optional(
    object({
      entryIndex: number(),
      setIndex: number()
    })
  ),
  exerciseBottomSheet: optional(
    object({
      entryIndex: number()
    })
  ),
  entryIndexEditMode: optional(number()),
  showSupersetPicker: optional(lazy(() => VHistoryEntry)),
  forceUpdateEntryIndex: optional(boolean()),
  isExternal: optional(boolean()),
  nativeNotificationScheduled: optional(boolean())
});
var VProgressUi = _VProgressUi;
var VIntervals = array(tuple([number(), union([number(), undefined_(), null_()])]));
var _VHistoryRecord = object({
  vtype: union([literal("history_record"), literal("progress")]),
  date: string(),
  programId: string(),
  programName: string(),
  day: number(),
  dayName: string(),
  entries: array(VHistoryEntry),
  startTime: number(),
  id: number(),
  endTime: optional(number()),
  week: optional(number()),
  dayInWeek: optional(number()),
  ui: optional(VProgressUi),
  intervals: optional(VIntervals),
  deletedProgramExercises: optional(record(string(), optional(boolean()))),
  userPromptedStateVars: optional(record(string(), optional(VProgramState))),
  changes: optional(array(VHistoryRecordChange)),
  timerSince: optional(number()),
  timerMode: optional(VProgressMode),
  timer: optional(number()),
  timerEntryIndex: optional(number()),
  timerSetIndex: optional(number()),
  setTimer: optional(
    object({
      entryIndex: number(),
      setIndex: number(),
      setId: string(),
      id: string(),
      side: VTimedSetSide,
      startedAt: number(),
      nonce: optional(number()),
      keepTiming: optional(boolean())
    })
  ),
  setTimerGetReady: optional(
    object({
      entryIndex: number(),
      setIndex: number(),
      setId: string(),
      id: string(),
      side: VTimedSetSide,
      startedAt: number(),
      getReady: number(),
      nonce: optional(number())
    })
  ),
  amrapModal: optional(
    object({
      entryIndex: number(),
      setIndex: number(),
      isAmrap: optional(boolean()),
      logRpe: optional(boolean()),
      askWeight: optional(boolean()),
      userVars: optional(boolean()),
      nonce: optional(number())
    })
  ),
  currentEntryIndex: optional(number()),
  notes: optional(string()),
  updatedAt: optional(number()),
  source: optional(string())
});
var VHistoryRecord = _VHistoryRecord;
var _VProgramDayEntry = object({
  exercise: VExerciseType,
  sets: array(VProgramSet)
});
var _VProgramWeek = object({
  id: string(),
  name: string(),
  days: array(object({ id: string() })),
  description: optional(string())
});
var VProgramWeek = _VProgramWeek;
var _VProgramDay = object({
  id: string(),
  name: string(),
  exercises: array(object({ id: string() })),
  description: optional(string())
});
var VProgramDay = _VProgramDay;
var _VPlannerProgramDay = object({
  name: string(),
  exerciseText: string(),
  id: optional(string()),
  description: optional(string())
});
var VPlannerProgramDay = _VPlannerProgramDay;
var _VPlannerProgramWeek = object({
  name: string(),
  days: array(VPlannerProgramDay),
  id: optional(string()),
  description: optional(string())
});
var VPlannerProgramWeek = _VPlannerProgramWeek;
var _VPlannerProgram = object({
  vtype: literal("planner"),
  name: string(),
  weeks: array(VPlannerProgramWeek)
});
var VPlannerProgram = _VPlannerProgram;
var _VProgram = object({
  vtype: literal("program"),
  exercises: array(VProgramExercise),
  id: string(),
  name: string(),
  description: string(),
  url: string(),
  author: string(),
  nextDay: number(),
  days: array(VProgramDay),
  weeks: array(VProgramWeek),
  isMultiweek: boolean(),
  tags: array(VProgramTag),
  clonedAt: optional(number()),
  shortDescription: optional(string()),
  planner: optional(VPlannerProgram),
  updatedAt: optional(number()),
  authorid: optional(union([string(), null_()])),
  source: optional(union([string(), null_()]))
});
var VProgram = _VProgram;
var _VStatsWeightValue = object({
  vtype: literal("stat"),
  value: VWeight,
  timestamp: number(),
  updatedAt: optional(number()),
  appleUuid: optional(string()),
  googleUuid: optional(string())
});
var VStatsWeightValue = _VStatsWeightValue;
var VStatsWeight = object({
  weight: optional(array(VStatsWeightValue))
});
var _VStatsLengthValue = object({
  vtype: literal("stat"),
  value: VLength,
  timestamp: number(),
  updatedAt: optional(number()),
  appleUuid: optional(string()),
  googleUuid: optional(string())
});
var VStatsLengthValue = _VStatsLengthValue;
var VStatsLength = object(
  statsLengthDef.reduce((memo, key) => {
    memo[key] = optional(array(VStatsLengthValue));
    return memo;
  }, {})
);
var _VStatsPercentageValue = object({
  vtype: literal("stat"),
  value: VPercentage,
  timestamp: number(),
  updatedAt: optional(number()),
  appleUuid: optional(string()),
  googleUuid: optional(string())
});
var VStatsPercentageValue = _VStatsPercentageValue;
var VStatsPercentage = object({
  bodyfat: optional(array(VStatsPercentageValue))
});
var _VStatsHealthValue = object({
  vtype: literal("stat"),
  value: number(),
  timestamp: number(),
  updatedAt: optional(number()),
  appleUuid: optional(string()),
  googleUuid: optional(string()),
  hidden: optional(boolean())
});
var VStatsHealthValue = _VStatsHealthValue;
var VStatsHealth = object(
  statsHealthDef.reduce((memo, key) => {
    memo[key] = optional(array(VStatsHealthValue));
    return memo;
  }, {})
);
function buildBoolPartial(keys) {
  const entries = keys.reduce((memo, key) => {
    memo[key] = optional(boolean());
    return memo;
  }, {});
  return object(entries);
}
var VStatsWeightEnabled = buildBoolPartial(statsWeightDef);
var VStatsLengthEnabled = buildBoolPartial(statsLengthDef);
var VStatsPercentageEnabled = buildBoolPartial(statsPercentageDef);
var _VStatsEnabled = object({
  weight: VStatsWeightEnabled,
  length: VStatsLengthEnabled,
  percentage: VStatsPercentageEnabled
});
var VStatsEnabled = _VStatsEnabled;
var _VSettingsTimers = object({
  warmup: optional(union([number(), null_()])),
  workout: optional(union([number(), null_()])),
  reminder: optional(number()),
  superset: optional(number()),
  getReady: optional(number())
});
var VSettingsTimers = _VSettingsTimers;
var VGraph = union([
  object({ vtype: literal("graph"), type: literal("exercise"), id: VExerciseId }),
  object({
    vtype: literal("graph"),
    type: literal("statsWeight"),
    id: picklist(statsWeightDef)
  }),
  object({
    vtype: literal("graph"),
    type: literal("statsLength"),
    id: picklist(statsLengthDef)
  }),
  object({
    vtype: literal("graph"),
    type: literal("statsPercentage"),
    id: picklist(statsPercentageDef)
  }),
  object({ vtype: literal("graph"), type: literal("muscleGroup"), id: string() })
]);
var _VWeightRange = object({ from: number(), to: number(), step: number() });
var _VPlateCount = object({ weight: number(), num: number() });
var _equipmentSetupBaseEntries = {
  unit: VUnit,
  rounding: optional(picklist(["down", "nearest"])),
  direction: optional(picklist(["adds", "assists"])),
  bodyweight: optional(object({ share: optional(number()) }))
};
var _VStackSetup = object({
  ..._equipmentSetupBaseEntries,
  type: literal("stack"),
  base: optional(number()),
  ranges: array(_VWeightRange),
  builtin: optional(array(number())),
  addOn: optional(array(_VPlateCount)),
  skipAddOnsInWarmups: optional(boolean()),
  pullRatio: optional(number()),
  stackCount: optional(number()),
  showPinNumbers: optional(boolean())
});
var _VPlatesSetup = object({
  ..._equipmentSetupBaseEntries,
  type: literal("plates"),
  base: number(),
  plates: array(_VPlateCount),
  sides: number(),
  horns: optional(array(object({ name: string(), ratio: number() }))),
  warmupPlates: optional(array(number()))
});
var _VFixedSetup = object({
  ..._equipmentSetupBaseEntries,
  type: literal("fixed"),
  ranges: array(_VWeightRange),
  values: array(number()),
  addOn: optional(array(_VPlateCount))
});
var _VElectricSetup = object({
  ..._equipmentSetupBaseEntries,
  type: literal("electric"),
  min: number(),
  max: number(),
  step: number()
});
var _VBandsSetup = object({
  ..._equipmentSetupBaseEntries,
  type: literal("bands"),
  bands: array(object({ name: string(), color: optional(string()), weight: number(), num: number() })),
  combine: boolean()
});
var _VEquipmentSetup = variant("type", [_VStackSetup, _VPlatesSetup, _VFixedSetup, _VElectricSetup, _VBandsSetup]);
var _VEquipmentData = object({
  vtype: literal("equipment_data"),
  bar: object({ lb: VWeight, kg: VWeight }),
  multiplier: number(),
  plates: array(object({ weight: VWeight, num: number() })),
  fixed: array(VWeight),
  isFixed: boolean(),
  unit: optional(VUnit),
  name: optional(string()),
  similarTo: optional(string()),
  isDeleted: optional(boolean()),
  useBodyweightForBar: optional(boolean()),
  isAssisting: optional(boolean()),
  notes: optional(string()),
  setup: optional(_VEquipmentSetup),
  setupLegacyHash: optional(string())
});
var VEquipmentData = _VEquipmentData;
var _VGraphOptions = object({
  movingAverageWindowSize: optional(number())
});
var VGraphOptions = _VGraphOptions;
var _VMuscleMultiplier = object({
  muscle: VMuscle,
  multiplier: number()
});
var _VExerciseDataValue = object({
  rm1: optional(VWeight),
  rounding: optional(number()),
  equipment: optional(record(string(), optional(string()))),
  notes: optional(string()),
  muscleMultipliers: optional(record(string(), optional(number()))),
  isUnilateral: optional(boolean()),
  volumeMultiplier: optional(number())
});
var VExerciseDataValue = _VExerciseDataValue;
var _VPlannerSettings = object({
  synergistMultiplier: number(),
  strengthSetsPct: number(),
  hypertrophySetsPct: number(),
  weeklyRangeSets: record(VScreenMuscle, optional(tuple([number(), number()]))),
  weeklyFrequency: record(VScreenMuscle, optional(number()))
});
var VPlannerSettings = _VPlannerSettings;
var _VGym = object({
  vtype: literal("gym"),
  id: string(),
  name: string(),
  equipment: record(VEquipment, optional(VEquipmentData))
});
var VGym = _VGym;
var _VWorkoutSettings = object({
  targetType: VTargetType,
  shouldHideGraphs: optional(boolean()),
  shouldKeepProgramExerciseId: optional(boolean()),
  shouldShowInvisibleEquipment: optional(boolean()),
  pickerSort: optional(VExercisePickerSort),
  showWorkoutNotes: optional(boolean()),
  showExerciseNotes: optional(boolean()),
  shouldCollapseSets: optional(boolean())
});
var VWorkoutSettings = _VWorkoutSettings;
var _VGraphs = object({
  vtype: literal("graphs"),
  graphs: array(VGraph)
});
var VGraphs = _VGraphs;
var _VMuscleGroupsSettings = object({
  vtype: literal("muscle_groups_settings"),
  data: record(
    string(),
    optional(
      object({
        name: optional(string()),
        isHidden: optional(boolean()),
        muscles: optional(array(VMuscle))
      })
    )
  )
});
var VMuscleGroupsSettings = _VMuscleGroupsSettings;
var _VSettings = object({
  timers: VSettingsTimers,
  gyms: array(VGym),
  deletedGyms: optional(array(string())),
  graphs: VGraphs,
  graphOptions: record(string(), optional(VGraphOptions)),
  graphsSettings: object({
    isSameXAxis: optional(boolean()),
    isWithBodyweight: optional(boolean()),
    isWithOneRm: optional(boolean()),
    isWithProgramLines: optional(boolean()),
    defaultType: optional(VGraphExerciseSelectedType),
    defaultMuscleGroupType: optional(VGraphMuscleGroupSelectedType)
  }),
  exerciseStatsSettings: object({
    ascendingSort: optional(boolean()),
    hideWithoutWorkoutNotes: optional(boolean()),
    hideWithoutExerciseNotes: optional(boolean())
  }),
  exercises: record(string(), optional(VCustomExercise)),
  statsEnabled: VStatsEnabled,
  units: VUnit,
  lengthUnits: VLengthUnit,
  volume: number(),
  exerciseData: record(string(), optional(VExerciseDataValue)),
  planner: VPlannerSettings,
  workoutSettings: VWorkoutSettings,
  muscleGroups: VMuscleGroupsSettings,
  appleHealthSyncWorkout: optional(boolean()),
  appleHealthSyncMeasurements: optional(boolean()),
  appleHealthSyncSleepNutrition: optional(boolean()),
  appleHealthAnchor: optional(string()),
  googleHealthSyncWorkout: optional(boolean()),
  googleHealthSyncMeasurements: optional(boolean()),
  googleHealthSyncSleepNutrition: optional(boolean()),
  googleHealthAnchor: optional(string()),
  healthConfirmation: optional(boolean()),
  ignoreDoNotDisturb: optional(boolean()),
  currentGymId: optional(string()),
  isPublicProfile: optional(boolean()),
  nickname: optional(string()),
  alwaysOnDisplay: optional(boolean()),
  vibration: optional(boolean()),
  startWeekFromMonday: optional(boolean()),
  textSize: optional(number()),
  starredExercises: optional(record(VExerciseId, optional(boolean()))),
  recentExercises: optional(record(VExerciseId, optional(array(VExerciseId)))),
  theme: optional(union([literal("dark"), literal("light")])),
  currentBodyweight: optional(VWeight),
  affiliateEnabled: optional(boolean())
});
var VSettings = _VSettings;
var _VStats = object({
  weight: VStatsWeight,
  length: VStatsLength,
  percentage: VStatsPercentage,
  health: optional(VStatsHealth)
});
var VStats = _VStats;
var _VSubscriptionReceipt = object({
  vtype: literal("subscription_receipt"),
  id: string(),
  value: string(),
  createdAt: number()
});
var VSubscriptionReceipt = _VSubscriptionReceipt;
var _VSubscription = object({
  apple: array(VSubscriptionReceipt),
  google: array(VSubscriptionReceipt),
  key: optional(string())
});
var VSubscription = _VSubscription;
var _VAffiliateData = object({
  id: string(),
  timestamp: number(),
  type: union([literal("coupon"), literal("program")]),
  vtype: literal("affiliate")
});
var VAffiliateData = _VAffiliateData;
var _VImportSession = object({
  vtype: literal("import_session"),
  id: string(),
  timestamp: number(),
  source: union([literal("hevy"), literal("liftosaurCsv")]),
  historyRecordIds: array(number()),
  customExerciseIds: array(string()),
  workoutCount: number()
});
var VImportSession = _VImportSession;
var _VWorkoutOutcome = object({
  vtype: literal("workout_outcome"),
  id: number(),
  outcome: union([literal("finish"), literal("discard")]),
  healthSync: boolean(),
  endTime: number()
});
var VWorkoutOutcome = _VWorkoutOutcome;
var _VHearAboutUs = object({
  result: optional(
    object({
      source: string(),
      detail: optional(string()),
      freeform: optional(string()),
      ts: number()
    })
  ),
  requests: array(number()),
  done: optional(boolean())
});
var _VStorage = object({
  history: array(VHistoryRecord),
  deletedHistory: optional(array(number())),
  stats: VStats,
  deletedStats: optional(array(number())),
  settings: VSettings,
  currentProgramId: optional(string()),
  version: string(),
  programs: array(VProgram),
  deletedPrograms: optional(array(number())),
  reviewRequests: array(number()),
  signupRequests: array(number()),
  hearAboutUs: optional(_VHearAboutUs),
  helps: array(string()),
  tempUserId: string(),
  email: optional(string()),
  affiliates: record(string(), optional(VAffiliateData)),
  subscription: VSubscription,
  whatsNew: optional(string()),
  progress: array(VHistoryRecord),
  originalId: optional(number()),
  id: optional(number()),
  referrer: optional(string()),
  landingPage: optional(string()),
  attribution: optional(string()),
  importSessions: optional(array(VImportSession)),
  workoutOutcomes: optional(array(VWorkoutOutcome)),
  subscriptionPrices: optional(record(string(), optional(string()))),
  _versions: optional(unknown())
});
var _VMuscleGeneratorResponse = object({
  targetMuscles: array(VMuscle),
  synergistMuscles: array(VMuscle),
  types: array(VExerciseKind)
});
function vIs(schema) {
  return { is: (u) => safeParse(schema, u).success };
}
var _VWebEditorSettings = object({
  units: optional(VUnit),
  timers: optional(VSettingsTimers),
  planner: optional(VPlannerSettings),
  muscleGroups: optional(VMuscleGroupsSettings),
  exerciseData: optional(record(string(), optional(VExerciseDataValue))),
  workoutSettings: optional(partial(_VWorkoutSettings)),
  exercises: optional(record(string(), optional(VCustomExercise))),
  starredExercises: optional(record(VExerciseId, optional(boolean()))),
  plannerUpdate: optional(partial(_VPlannerSettings)),
  muscleGroupsUpdate: optional(_VMuscleGroupsSettings.entries.data)
});
var VDeletedSettingsKeys = array(string());
var ATOMIC_TYPES = [
  "history_record",
  "progress_ui",
  "set",
  "equipment_data",
  "custom_exercise",
  "planner",
  "stat",
  "graph",
  "graphs",
  "subscription_receipt",
  "affiliate",
  "muscle_groups_settings",
  "import_session",
  "workout_outcome"
];
var CONTROLLED_TYPES = ["program", "gym", "progress", "history_entry"];
var CONTROLLED_FIELDS = {
  program: ["name", "nextDay", "planner"],
  gym: ["name", "equipment"],
  progress: [
    "entries",
    "endTime",
    "intervals",
    "notes",
    "deletedProgramExercises",
    "userPromptedStateVars",
    "updatedAt",
    "changes",
    "timerSince",
    "timerMode",
    "timer",
    "timerEntryIndex",
    "timerSetIndex",
    "setTimer",
    "setTimerGetReady",
    "amrapModal",
    "currentEntryIndex"
  ],
  history_entry: [
    "exercise",
    "sets",
    "warmupSets",
    "index",
    "isSuppressed",
    "programExerciseId",
    "state",
    "vars",
    "notes",
    "changed",
    "superset",
    "updatePrints",
    "updatePrintLines"
  ]
};
var TYPE_ID_MAPPING = {
  affiliate: "id",
  program: "clonedAt",
  history_record: "id",
  set: "id",
  progress_ui: "id",
  history_entry: "id",
  progress: "startTime",
  gym: "id",
  custom_exercise: "id",
  stat: "timestamp",
  equipment_data: "id",
  planner: "name",
  subscription_receipt: "id",
  graph: "id",
  graphs: "id",
  muscle_groups_settings: "vtype",
  import_session: "id",
  workout_outcome: "id"
};
var DICTIONARY_FIELDS = [
  "settings.exercises",
  "settings.exerciseData",
  "settings.gyms.equipment",
  "affiliates"
];
var EXCLUDED_FIELDS = {
  progress: ["ui"]
};
var STORAGE_VERSION_TYPES = {
  atomicTypes: ATOMIC_TYPES,
  controlledTypes: CONTROLLED_TYPES,
  typeIdMapping: TYPE_ID_MAPPING,
  controlledFields: CONTROLLED_FIELDS,
  excludedFields: EXCLUDED_FIELDS,
  dictionaryFields: DICTIONARY_FIELDS,
  compactionThresholds: {
    "subscription.apple": 14 * 24 * 60 * 60 * 1e3,
    "subscription.google": 14 * 24 * 60 * 60 * 1e3,
    history: 180 * 24 * 60 * 60 * 1e3,
    progress: 30 * 24 * 60 * 60 * 1e3,
    workoutOutcomes: 30 * 24 * 60 * 60 * 1e3
  },
  typeValidators: {
    progress: vIs(VHistoryRecord)
  }
};

// third-party/liftosaur/upstream/src/utils/string.ts
function StringUtils_unindent(string2) {
  const indent2 = string2.split("\n").reduce((memo, line) => {
    const match = line.match(/^(\s*)\S/);
    if (match != null) {
      const spaces = match[1];
      if (memo == null || memo > spaces.length) {
        return spaces.length;
      }
    }
    return memo;
  }, void 0);
  if (indent2 != null) {
    return string2.split("\n").map((s) => s.trim() === "" ? "" : s.slice(indent2, s.length).trimEnd()).join("\n");
  } else {
    return string2;
  }
}
function StringUtils_hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
function StringUtils_hashString(str) {
  return new Uint32Array([StringUtils_hashCode(str)])[0].toString(16);
}

// third-party/liftosaur/upstream/src/models/equipmentLoadSolver.ts
var LB_PER_KG = 2.205;
var EPSILON = 1e-6;
var STEP_OFFSET = 1e-3;
var CONVERTED_ROUNDING_STEP = 0.5;
var CONVERSION_TOLERANCE = CONVERTED_ROUNDING_STEP / 2;
var MAX_STEPS = 1e4;
var MAX_COMBINATIONS = 2e3;
var MAX_SPLIT_STEPS = 200;
function clean(value) {
  return Math.round(value * 1e6) / 1e6;
}
function convertExact(value, from, to) {
  if (from === to) {
    return value;
  }
  return from === "kg" ? value * LB_PER_KG : value / LB_PER_KG;
}
function convertForCaller(value, from, to) {
  if (from === to) {
    return MathUtils_roundTo000005(value) + 0;
  }
  const converted = from === "kg" ? value * LB_PER_KG : value / LB_PER_KG;
  return Math.round(converted / CONVERTED_ROUNDING_STEP) * CONVERTED_ROUNDING_STEP + 0;
}
function mergePlates(plates) {
  const merged = /* @__PURE__ */ new Map();
  for (const plate of plates) {
    if (plate.num > 0 && plate.weight > 0) {
      merged.set(plate.weight, (merged.get(plate.weight) ?? 0) + plate.num);
    }
  }
  return Array.from(merged.entries()).map(([weight, num]) => ({ weight, num })).sort((a, b) => b.weight - a.weight);
}
function lastInRange(range) {
  return clean(range.from + Math.floor((range.to - range.from) / range.step + EPSILON) * range.step);
}
function rangeFloor(range, x) {
  if (range.step <= 0 || x < range.from - EPSILON) {
    return void 0;
  }
  const n2 = Math.floor((Math.min(x, range.to) - range.from) / range.step + EPSILON);
  return clean(range.from + n2 * range.step);
}
function rangeCeil(range, x) {
  if (range.step <= 0) {
    return void 0;
  }
  const last = lastInRange(range);
  if (x > last + EPSILON) {
    return void 0;
  }
  if (x <= range.from) {
    return clean(range.from);
  }
  const n2 = Math.ceil((x - range.from) / range.step - EPSILON);
  return clean(range.from + n2 * range.step);
}
function valuesFloor(ranges, values, x) {
  let best;
  for (const range of ranges) {
    const candidate = rangeFloor(range, x);
    if (candidate != null && (best == null || candidate > best)) {
      best = candidate;
    }
  }
  for (const value of values) {
    if (value <= x + EPSILON && (best == null || value > best)) {
      best = value;
    }
  }
  return best;
}
function valuesCeil(ranges, values, x) {
  let best;
  for (const range of ranges) {
    const candidate = rangeCeil(range, x);
    if (candidate != null && (best == null || candidate < best)) {
      best = candidate;
    }
  }
  for (const value of values) {
    if (value >= x - EPSILON && (best == null || value < best)) {
      best = value;
    }
  }
  return best;
}
function combinations(entries) {
  const result = /* @__PURE__ */ new Map([[0, { total: 0, items: [] }]]);
  const sorted = entries.filter((e) => e.num > 0 && e.weight > 0).sort((a, b) => b.weight - a.weight);
  for (const entry of sorted) {
    const before = Array.from(result.values());
    for (const combination of before) {
      for (let count = 1; count <= entry.num; count += 1) {
        if (result.size >= MAX_COMBINATIONS) {
          return Array.from(result.values()).sort((a, b) => a.total - b.total);
        }
        const total = clean(combination.total + entry.weight * count);
        if (!result.has(total)) {
          result.set(total, { total, items: [...combination.items, { item: entry.item, num: count }] });
        }
      }
    }
  }
  return Array.from(result.values()).sort((a, b) => a.total - b.total);
}
function pinNumber(ranges, pin) {
  let count = 0;
  let previousLast;
  for (const range of ranges) {
    if (pin < range.from - EPSILON) {
      break;
    }
    const last = lastInRange(range);
    const steps = Math.floor((Math.min(pin, last) - range.from) / range.step + EPSILON);
    const isShared = previousLast != null && Math.abs(range.from - previousLast) < EPSILON;
    count += steps + (isShared ? 0 : 1);
    previousLast = last;
    if (pin <= last + EPSILON) {
      break;
    }
  }
  return count;
}
function addOnOptions(builtin, addOn) {
  const builtins = [void 0, ...builtin.filter((b) => b > 0)];
  const plateSets = combinations(mergePlates(addOn).map((p) => ({ item: p.weight, weight: p.weight, num: p.num })));
  const options = /* @__PURE__ */ new Map();
  for (const b of builtins) {
    for (const set of plateSets) {
      const total = clean((b ?? 0) + set.total);
      if (!options.has(total)) {
        options.set(total, { total, builtin: b, plates: set.items.map((i) => ({ weight: i.item, num: i.num })) });
      }
    }
  }
  return Array.from(options.values()).sort((a, b) => a.total - b.total);
}
function rangesPicker(ranges, values, addOns, toInstruction) {
  const pick = (x, direction) => {
    let best;
    for (const addOn of addOns) {
      const value = direction === "floor" ? valuesFloor(ranges, values, x - addOn.total) : valuesCeil(ranges, values, x - addOn.total);
      if (value == null) {
        continue;
      }
      const load = clean(value + addOn.total);
      if (best == null || (direction === "floor" ? load > best.load : load < best.load)) {
        best = { load, value, addOn };
      }
    }
    if (best == null) {
      return void 0;
    }
    const chosen = best;
    return { load: chosen.load, build: () => toInstruction(chosen.value, chosen.addOn) };
  };
  return {
    floor: (x) => pick(x, "floor"),
    ceil: (x) => pick(x, "ceil"),
    min: () => pick(-Infinity, "ceil")
  };
}
function precisionOf(values) {
  let maxDecimals = 0;
  for (const value of values) {
    const s = value.toString();
    const dot = s.indexOf(".");
    if (dot >= 0) {
      maxDecimals = Math.max(maxDecimals, s.length - dot - 1);
    }
  }
  return Math.pow(10, Math.min(maxDecimals, 6));
}
function largestPlatesAtMost(inventory, target) {
  if (target < -EPSILON) {
    return void 0;
  }
  const types = inventory.filter((p) => p.num > 0 && p.weight > 0).sort((a, b) => b.weight - a.weight);
  if (target < EPSILON || types.length === 0) {
    return [];
  }
  const precision = precisionOf([target, ...types.map((t) => t.weight)]);
  const intTarget = Math.round(target * precision);
  const intWeights = types.map((t) => Math.round(t.weight * precision));
  const maxFrom = new Array(types.length + 1).fill(0);
  for (let i = types.length - 1; i >= 0; i--) {
    maxFrom[i] = maxFrom[i + 1] + intWeights[i] * types[i].num;
  }
  const best = new Array(types.length).fill(0);
  const current = new Array(types.length).fill(0);
  let bestRemaining = intTarget + 1;
  let iterations = 0;
  function search(index, remaining) {
    if (bestRemaining === 0 || iterations >= MAX_STEPS) {
      return;
    }
    if (remaining === 0 || index >= types.length) {
      if (remaining < bestRemaining) {
        bestRemaining = remaining;
        for (let i = 0; i < types.length; i++) {
          best[i] = i < index ? current[i] : 0;
        }
      }
      return;
    }
    iterations += 1;
    const w = intWeights[index];
    const maxCount = Math.min(types[index].num, w > 0 ? Math.floor(remaining / w) : 0);
    for (let count = maxCount; count >= 0; count--) {
      const newRemaining = remaining - count * w;
      if (newRemaining - maxFrom[index + 1] >= bestRemaining) {
        continue;
      }
      current[index] = count;
      search(index + 1, newRemaining);
      if (bestRemaining === 0) {
        return;
      }
    }
  }
  search(0, intTarget);
  return types.map((t, i) => ({ weight: t.weight, num: best[i] })).filter((p) => p.num > 0);
}
function platesTotal(plates) {
  return clean(plates.reduce((memo, p) => memo + p.weight * p.num, 0));
}
function subtractPlates(inventory, used) {
  return inventory.map((p) => {
    const taken = used.find((u) => u.weight === p.weight)?.num ?? 0;
    return { weight: p.weight, num: p.num - taken };
  });
}
function smallestPlatesAtLeast(inventory, target) {
  const all = platesTotal(inventory);
  if (target > all + EPSILON) {
    return void 0;
  }
  const leftOut = largestPlatesAtMost(inventory, all - target);
  return leftOut == null ? void 0 : subtractPlates(inventory, leftOut).filter((p) => p.num > 0);
}
function splitByHorns(inventory, plates, horns) {
  const loaded = horns.filter((h) => h.ratio > 0);
  if (loaded.length === 0) {
    return [{ plates }];
  }
  const total = platesTotal(plates);
  const ratioSum = loaded.reduce((memo, h) => memo + h.ratio, 0);
  const shares = loaded.map((h) => total * h.ratio / ratioSum);
  const greedy = loadHornByHorn(inventory, total, shares);
  const split = closestSplit(inventory, total, shares, { steps: 0 }, greedy?.deviation ?? Infinity) ?? greedy;
  const byHorn = split != null ? new Map(loaded.map((h, i) => [h, split.plates[i]])) : handOut(plates, loaded, shares);
  return horns.map((h) => ({ name: h.name, plates: byHorn.get(h) ?? [] }));
}
function loadHornByHorn(inventory, total, shares) {
  const plates = [];
  let remaining = inventory;
  let loadedSoFar = 0;
  let deviation = 0;
  for (let i = 0; i < shares.length; i++) {
    const isLast = i === shares.length - 1;
    const goal = isLast ? clean(total - loadedSoFar) : shares[i];
    const picked = largestPlatesAtMost(remaining, goal) ?? [];
    if (isLast && Math.abs(platesTotal(picked) - goal) > EPSILON) {
      return void 0;
    }
    plates.push(picked);
    deviation += Math.abs(platesTotal(picked) - shares[i]);
    loadedSoFar = clean(loadedSoFar + platesTotal(picked));
    remaining = subtractPlates(remaining, picked);
  }
  return { plates, deviation };
}
function plateSubsets(inventory, maxTotal) {
  let result = [{ plates: [], total: 0 }];
  for (const type of inventory.filter((p) => p.num > 0 && p.weight > 0)) {
    const next = [];
    for (const subset of result) {
      for (let count = 0; count <= type.num; count += 1) {
        const total = clean(subset.total + type.weight * count);
        if (total > maxTotal + EPSILON || next.length >= MAX_COMBINATIONS) {
          break;
        }
        next.push({
          plates: count > 0 ? [...subset.plates, { weight: type.weight, num: count }] : subset.plates,
          total
        });
      }
    }
    result = next;
  }
  return result;
}
function plateCount(plates) {
  return plates.reduce((memo, p) => memo + p.num, 0);
}
function compareHeavierFirst(a, b) {
  const weights = Array.from(new Set([...a, ...b].map((p) => p.weight))).sort((x, y) => y - x);
  for (const weight of weights) {
    const diff = (b.find((p) => p.weight === weight)?.num ?? 0) - (a.find((p) => p.weight === weight)?.num ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}
function closestSplit(inventory, total, shares, budget, maxDeviation) {
  if (shares.length === 1) {
    const deviation = Math.abs(total - shares[0]);
    const picked = deviation < maxDeviation - EPSILON ? largestPlatesAtMost(inventory, total) : void 0;
    return picked == null || Math.abs(platesTotal(picked) - total) > EPSILON ? void 0 : { plates: [picked], deviation };
  }
  const restShares = shares.slice(1).reduce((memo, s) => memo + s, 0);
  const deviationOf = (candidate) => Math.abs(candidate.total - shares[0]);
  const lowerBoundOf = (candidate) => deviationOf(candidate) + Math.abs(total - candidate.total - restShares);
  const candidates = plateSubsets(inventory, total).filter((c) => lowerBoundOf(c) < maxDeviation - EPSILON).sort(
    (a, b) => lowerBoundOf(a) - lowerBoundOf(b) || plateCount(a.plates) - plateCount(b.plates) || compareHeavierFirst(a.plates, b.plates)
  );
  let best;
  let limit = maxDeviation;
  for (const candidate of candidates) {
    const deviation = deviationOf(candidate);
    if (lowerBoundOf(candidate) >= limit - EPSILON || budget.steps >= MAX_SPLIT_STEPS) {
      break;
    }
    budget.steps += 1;
    const rest = closestSplit(
      subtractPlates(inventory, candidate.plates),
      clean(total - candidate.total),
      shares.slice(1),
      budget,
      limit - deviation
    );
    if (rest != null) {
      best = { plates: [candidate.plates, ...rest.plates], deviation: deviation + rest.deviation };
      limit = best.deviation;
    }
  }
  return best;
}
function handOut(plates, horns, shares) {
  const loads = horns.map(() => 0);
  const result = new Map(horns.map((h) => [h, []]));
  const singles = [...plates].sort((a, b) => b.weight - a.weight).flatMap((p) => new Array(p.num).fill(p.weight));
  for (const weight of singles) {
    let target = 0;
    for (let i = 1; i < horns.length; i++) {
      if (shares[i] - loads[i] > shares[target] - loads[target]) {
        target = i;
      }
    }
    loads[target] += weight;
    const list = result.get(horns[target]);
    const existing = list.find((p) => p.weight === weight);
    if (existing) {
      existing.num += 1;
    } else {
      list.push({ weight, num: 1 });
    }
  }
  return result;
}
function platesPicker(inventory, sides, horns) {
  const perSide = mergePlates(inventory).map((p) => ({ weight: p.weight, num: Math.floor(p.num / sides) })).filter((p) => p.num > 0);
  const toOption = (plates) => ({
    load: clean(platesTotal(plates) * sides),
    build: () => ({
      type: "plates",
      sides,
      horns: horns && horns.length > 0 ? splitByHorns(perSide, plates, horns) : [{ plates }]
    })
  });
  return {
    floor: (x) => {
      const plates = largestPlatesAtMost(perSide, x / sides);
      return plates == null ? void 0 : toOption(plates);
    },
    ceil: (x) => {
      const plates = smallestPlatesAtLeast(perSide, Math.max(0, x / sides));
      return plates == null ? void 0 : toOption(plates);
    },
    min: () => toOption([])
  };
}
function bandsPicker(setup) {
  const bands = setup.bands.filter((b) => b.num > 0 && b.weight > 0);
  const options = setup.combine ? combinations(bands.map((b) => ({ item: b.name, weight: b.weight, num: b.num }))).filter((c) => c.total > 0).map((c) => ({
    load: c.total,
    build: () => ({ type: "bands", bands: c.items.map((i) => ({ name: i.item, num: i.num })) })
  })) : bands.map((b) => ({ load: b.weight, build: () => ({ type: "bands", bands: [{ name: b.name, num: 1 }] }) })).sort((a, b) => a.load - b.load);
  return {
    floor: (x) => [...options].reverse().find((o) => o.load <= x + EPSILON),
    ceil: (x) => options.find((o) => o.load >= x - EPSILON),
    min: () => options[0]
  };
}
function pickerFor(setup, isWarmup) {
  switch (setup.type) {
    case "stack": {
      const skipAddOns = isWarmup && setup.skipAddOnsInWarmups;
      const addOns = skipAddOns ? addOnOptions([], []) : addOnOptions(setup.builtin ?? [], setup.addOn ?? []);
      const stacks = setup.stackCount ?? 1;
      const allStacks = setup.ranges.map((r) => ({ from: r.from * stacks, to: r.to * stacks, step: r.step * stacks }));
      return rangesPicker(allStacks, [], addOns, (value, addOn) => {
        const pin = clean(value / stacks);
        return {
          type: "stack",
          pin,
          ...setup.showPinNumbers ? { pinNumber: pinNumber(setup.ranges, pin) } : {},
          ...stacks > 1 ? { stacks } : {},
          builtin: addOn.builtin,
          addOn: addOn.plates
        };
      });
    }
    case "plates": {
      const inventory = isWarmup && setup.warmupPlates != null ? setup.plates.filter((p) => setup.warmupPlates.indexOf(p.weight) !== -1) : setup.plates;
      return platesPicker(inventory, Math.max(1, setup.sides), setup.horns);
    }
    case "fixed":
      return rangesPicker(setup.ranges, setup.values, addOnOptions([], setup.addOn ?? []), (value, addOn) => ({
        type: "fixed",
        value,
        addOn: addOn.plates
      }));
    case "electric":
      return rangesPicker(
        [{ from: setup.min, to: setup.max, step: setup.step }],
        [],
        addOnOptions([], []),
        (value) => ({ type: "electric", value })
      );
    case "bands":
      return bandsPicker(setup);
  }
}
function hasWarmupInventory(setup) {
  return setup.type === "plates" && setup.warmupPlates != null || setup.type === "stack" && !!setup.skipAddOnsInWarmups;
}
function scaleFor(setup, query) {
  const ratio = setup.type === "stack" ? setup.pullRatio ?? 1 : 1;
  const base = setup.type === "plates" ? setup.base : setup.type === "stack" ? (setup.base ?? 0) * ratio : 0;
  const hasBodyweight = setup.bodyweight != null && query.bodyweight != null;
  const bodyweight = hasBodyweight && query.bodyweight ? convertForCaller(query.bodyweight.value, query.bodyweight.unit, setup.unit) * (setup.bodyweight?.share ?? 1) : 0;
  const start = base + bodyweight;
  const sign = setup.direction === "assists" ? -1 : 1;
  const maxLoad = sign === -1 && hasBodyweight ? clean(start / ratio) : Infinity;
  return { start, ratio, sign, maxLoad };
}
function effective(scale, load) {
  return clean(scale.start + scale.sign * load * scale.ratio);
}
function isMirroredTarget(scale, target) {
  const isAssistanceOnly2 = scale.sign === -1 && scale.start <= 0;
  return target < 0 && !isAssistanceOnly2;
}
function loadFor(scale, value) {
  return clean(scale.sign * (value - scale.start) / scale.ratio);
}
function withinBounds(scale, option) {
  return option != null && option.load <= scale.maxLoad + EPSILON ? option : void 0;
}
function roundLoad(picker, scale, loadTarget, rounding) {
  const below = picker.floor(Math.min(loadTarget, scale.maxLoad));
  if (rounding === "down") {
    return below ?? withinBounds(scale, picker.min());
  }
  const above = withinBounds(scale, picker.ceil(loadTarget));
  if (below == null || above == null) {
    return below ?? above ?? withinBounds(scale, picker.min());
  }
  return above.load - loadTarget < loadTarget - below.load - EPSILON ? above : below;
}
function capLoad(picker, scale, option, cap) {
  if (effective(scale, option.load) <= cap + EPSILON) {
    return option;
  }
  const capLoadValue = loadFor(scale, cap);
  return scale.sign === 1 ? picker.floor(capLoadValue) : withinBounds(scale, picker.ceil(capLoadValue));
}
function callerValueOf(setup, scale, option, caller, isMirrored) {
  const value = effective(scale, option.load);
  return convertForCaller(isMirrored ? -value : value, setup.unit, caller.unit);
}
function matchingCallerValue(setup, scale, picker, loadTarget, caller, isMirrored) {
  const candidates = [picker.floor(Math.min(loadTarget, scale.maxLoad)), withinBounds(scale, picker.ceil(loadTarget))];
  return candidates.find(
    (c) => c != null && callerValueOf(setup, scale, c, caller, isMirrored) === convertForCaller(caller.value, caller.unit, caller.unit)
  );
}
function toResult(setup, scale, option, caller, isMirrored) {
  if (option == null) {
    return { total: { value: caller.value, unit: caller.unit }, exact: false, unit: setup.unit };
  }
  const value = callerValueOf(setup, scale, option, caller, isMirrored);
  return {
    total: { value, unit: caller.unit },
    exact: value === convertForCaller(caller.value, caller.unit, caller.unit),
    unit: setup.unit,
    instruction: option.build()
  };
}
function selectIn(setup, caller, query, rounding) {
  const scale = scaleFor(setup, query);
  const target = convertExact(caller.value, caller.unit, setup.unit);
  const isMirrored = isMirroredTarget(scale, target);
  const goal = isMirrored ? -target : target;
  const loadTarget = loadFor(scale, goal);
  const hasConversionTolerance = rounding === "down" && scale.sign === 1 && caller.unit !== setup.unit;
  const roundingTarget = hasConversionTolerance ? loadFor(scale, goal + CONVERSION_TOLERANCE) : loadTarget;
  const warmup2 = query.warmup;
  const cap = warmup2?.firstWorkingWeight != null && !isMirrored ? convertExact(warmup2.firstWorkingWeight.value, warmup2.firstWorkingWeight.unit, setup.unit) : void 0;
  const pickers = warmup2 != null && hasWarmupInventory(setup) ? [pickerFor(setup, true), pickerFor(setup, false)] : [pickerFor(setup, false)];
  for (const picker of pickers) {
    const option = matchingCallerValue(setup, scale, picker, loadTarget, caller, isMirrored) ?? roundLoad(picker, scale, roundingTarget, rounding);
    const capped = option != null && cap != null ? capLoad(picker, scale, option, cap) : option;
    if (capped != null || option == null) {
      return toResult(setup, scale, capped, caller, isMirrored);
    }
  }
  return toResult(setup, scale, withinBounds(scale, pickers[pickers.length - 1].min()), caller, isMirrored);
}
function EquipmentLoadSolver_select(setup, target, query) {
  return selectIn(setup, target, query, setup.rounding ?? "down");
}
function step(setup, weight, query, direction) {
  const picker = pickerFor(setup, false);
  const scale = scaleFor(setup, query);
  let value = convertExact(weight.value, weight.unit, setup.unit);
  const isMirrored = isMirroredTarget(scale, value);
  const towards = (isMirrored ? -direction : direction) * scale.sign;
  if (isMirrored) {
    value = -value;
  }
  for (let attempt = 0; attempt < 50; attempt++) {
    const load = loadFor(scale, value);
    const option = towards === 1 ? withinBounds(scale, picker.ceil(load + STEP_OFFSET)) : picker.floor(load - STEP_OFFSET);
    if (option == null) {
      return weight;
    }
    value = effective(scale, option.load);
    const result = convertForCaller(isMirrored ? -value : value, setup.unit, weight.unit);
    if (result !== weight.value) {
      return { value: result, unit: weight.unit };
    }
  }
  return weight;
}
function EquipmentLoadSolver_next(setup, weight, query) {
  return step(setup, weight, query, 1);
}
function EquipmentLoadSolver_previous(setup, weight, query) {
  return step(setup, weight, query, -1);
}
function EquipmentLoadSolver_reachable(setup, query, limit) {
  const picker = pickerFor(setup, false);
  const scale = scaleFor(setup, query);
  const values = [];
  let option = withinBounds(scale, picker.min());
  while (option != null && values.length < limit) {
    values.push(effective(scale, option.load));
    const next = withinBounds(scale, picker.ceil(option.load + STEP_OFFSET));
    option = next != null && next.load > option.load ? next : void 0;
  }
  values.sort((a, b) => a - b);
  return { values, truncated: option != null };
}

// third-party/liftosaur/upstream/src/models/equipmentSetup.ts
var LEGACY_HASH_VERSION = "v2";
var MAX_LEGACY_FIXED = 200;
var MAX_LEGACY_BAND_TOTALS = 50;
var PLATE_EQUIVALENTS = [
  [55, 25],
  [45, 20],
  [35, 15],
  [25, 10],
  [10, 5],
  [5, 2.5],
  [2.5, 1.25],
  [1.25, 0.5]
];
function convertWeight(value, from, to) {
  if (from === to) {
    return value;
  }
  const pair2 = PLATE_EQUIVALENTS.find(([lb5, kg]) => (from === "lb" ? lb5 : kg) === value);
  if (pair2 != null) {
    return to === "lb" ? pair2[0] : pair2[1];
  }
  return Weight_smartConvert({ value, unit: from }, to).value;
}
function weightsIn(weights, unit) {
  return weights.filter((w) => w.unit === unit).map((w) => w.value);
}
function EquipmentSetup_fromLegacy(data, unit) {
  if (data.isFixed) {
    const fixedUnit = data.unit ?? unit;
    return { type: "fixed", unit: fixedUnit, ranges: [], values: weightsIn(data.fixed, fixedUnit) };
  }
  const usesBodyweight = !!data.useBodyweightForBar;
  return {
    type: "plates",
    unit,
    base: usesBodyweight ? 0 : data.bar[unit].value,
    plates: heaviestFirst(
      data.plates.filter((p) => p.weight.unit === unit).map((p) => ({ weight: p.weight.value, num: p.num }))
    ),
    sides: data.multiplier || 1,
    ...data.isAssisting ? { direction: "assists" } : {},
    ...usesBodyweight ? { bodyweight: {} } : {}
  };
}
function legacyBar(value, unit) {
  const other = unit === "lb" ? "kg" : "lb";
  const otherValue = convertWeight(value, unit, other);
  return unit === "lb" ? { lb: { value, unit: "lb" }, kg: { value: otherValue, unit: "kg" } } : { lb: { value: otherValue, unit: "lb" }, kg: { value, unit: "kg" } };
}
function legacyPlates(plates, unit) {
  return plates.map((p) => ({ weight: { value: p.weight, unit }, num: p.num }));
}
function rangeValues(ranges, limit) {
  const values = [];
  for (const range of ranges) {
    for (let value = range.from; value <= range.to + 1e-6 && values.length < limit && range.step > 0; value += range.step) {
      values.push(Math.round(value * 1e6) / 1e6);
    }
  }
  return values;
}
function isAssistanceOnly(setup, base) {
  return setup.direction === "assists" && setup.bodyweight == null && base === 0;
}
function legacyAssisting(setup, base) {
  return setup.direction === "assists" && !isAssistanceOnly(setup, base);
}
function legacyStepPlates(setup, bar, step2, count) {
  return {
    bar: legacyBar(bar, setup.unit),
    multiplier: 1,
    plates: count > 0 && step2 > 0 ? legacyPlates([{ weight: step2, num: count }], setup.unit) : [],
    fixed: [],
    isFixed: false,
    useBodyweightForBar: setup.bodyweight != null,
    isAssisting: legacyAssisting(setup, bar)
  };
}
function legacyFixed(setup, values) {
  const unique = Array.from(new Set(values)).sort((a, b) => a - b);
  return {
    bar: legacyBar(0, setup.unit),
    multiplier: 1,
    plates: [],
    fixed: unique.map((value) => ({ value, unit: setup.unit })),
    isFixed: true,
    useBodyweightForBar: setup.bodyweight != null,
    isAssisting: legacyAssisting(setup, 0)
  };
}
function stackToLegacy(setup) {
  const ratio = setup.pullRatio ?? 1;
  const stacks = setup.stackCount ?? 1;
  const first = setup.ranges[0];
  if (first == null) {
    return legacyFixed(setup, []);
  }
  const step2 = first.step * stacks * ratio;
  if (setup.direction === "assists") {
    const start = setup.bodyweight != null ? 0 : (setup.base ?? 0) * ratio;
    return legacyStepPlates(setup, start, step2, Math.floor(first.to / first.step + 1e-6));
  }
  const count = Math.floor((first.to - first.from) / first.step + 1e-6);
  return legacyStepPlates(setup, ((setup.base ?? 0) + first.from * stacks) * ratio, step2, count);
}
function EquipmentSetup_toLegacy(setup) {
  switch (setup.type) {
    case "plates":
      return {
        bar: legacyBar(setup.base, setup.unit),
        multiplier: setup.sides,
        plates: legacyPlates(setup.plates, setup.unit),
        fixed: [],
        isFixed: false,
        useBodyweightForBar: setup.bodyweight != null,
        isAssisting: legacyAssisting(setup, setup.base)
      };
    case "stack":
      return stackToLegacy(setup);
    case "electric":
      return legacyStepPlates(setup, setup.min, setup.step, Math.floor((setup.max - setup.min) / setup.step + 1e-6));
    case "fixed":
      return legacyFixed(setup, [...rangeValues(setup.ranges, MAX_LEGACY_FIXED), ...setup.values]);
    case "bands":
      return legacyFixed(setup, EquipmentLoadSolver_reachable(setup, {}, MAX_LEGACY_BAND_TOTALS).values);
  }
}
function EquipmentSetup_legacyHash(data) {
  const weight = (w) => [w.value, w.unit];
  const canonical = JSON.stringify([
    weight(data.bar.lb),
    weight(data.bar.kg),
    data.plates.map((p) => [...weight(p.weight), p.num]),
    data.fixed.map(weight),
    data.isFixed,
    data.multiplier,
    !!data.useBodyweightForBar,
    !!data.isAssisting,
    data.unit ?? null
  ]);
  return `${LEGACY_HASH_VERSION}:${StringUtils_hashString(canonical)}`;
}
function heaviestFirst(plates) {
  return [...plates].sort((a, b) => b.weight - a.weight);
}
function EquipmentSetup_sortPlates(setup) {
  switch (setup.type) {
    case "plates":
      return { ...setup, plates: heaviestFirst(setup.plates) };
    case "stack":
    case "fixed":
      return setup.addOn != null ? { ...setup, addOn: heaviestFirst(setup.addOn) } : setup;
    default:
      return setup;
  }
}
function EquipmentSetup_save(data, unsortedSetup) {
  const setup = EquipmentSetup_sortPlates(unsortedSetup);
  const saved = { ...data, ...EquipmentSetup_toLegacy(setup), setup };
  return { ...saved, setupLegacyHash: EquipmentSetup_legacyHash(saved) };
}

// third-party/liftosaur/upstream/src/models/equipment.ts
function Equipment_build(name) {
  return {
    vtype: "equipment_data",
    name,
    multiplier: 1,
    bar: {
      lb: Weight_build(0, "lb"),
      kg: Weight_build(0, "kg")
    },
    plates: [
      { weight: Weight_build(10, "lb"), num: 4 },
      { weight: Weight_build(5, "kg"), num: 4 }
    ],
    fixed: [],
    isFixed: false
  };
}
function Equipment_getGymByIdOrCurrent(settings, gymId) {
  return settings.gyms.find((g) => g.id === (gymId ?? settings.currentGymId)) ?? settings.gyms[0];
}
function Equipment_getCurrentGym(settings) {
  return settings.gyms.find((g) => g.id === settings.currentGymId) ?? settings.gyms[0];
}
function Equipment_getEquipmentIdForExerciseType(settings, exerciseType, gymId) {
  if (exerciseType == null) {
    return void 0;
  }
  const key = Exercise_toKey(exerciseType);
  if (!(settings.exerciseData[key] && ("equipment" in settings.exerciseData[key] || "rounding" in settings.exerciseData[key]))) {
    return exerciseType.equipment;
  }
  const exerciseData = settings.exerciseData[key];
  const exerciseEquipment = exerciseData?.equipment;
  if (exerciseEquipment == null) {
    return void 0;
  }
  const currentGym = Equipment_getGymByIdOrCurrent(settings, gymId);
  return exerciseEquipment[currentGym.id];
}
function Equipment_getEquipmentDataForExerciseType(settings, exerciseType) {
  const equipment = Equipment_getEquipmentIdForExerciseType(settings, exerciseType);
  const currentGym = Equipment_getCurrentGym(settings);
  return equipment ? currentGym.equipment[equipment] : void 0;
}
function Equipment_legacyChanged(data) {
  return data.setup != null && data.setupLegacyHash !== EquipmentSetup_legacyHash(data);
}
function Equipment_setupIn(data, unit) {
  if (data.setup != null && !Equipment_legacyChanged(data)) {
    return data.setup;
  }
  return EquipmentSetup_fromLegacy(data, unit);
}
function Equipment_getUnitOrDefaultForExerciseType(settings, exerciseType) {
  const equipment = Equipment_getEquipmentDataForExerciseType(settings, exerciseType);
  return equipment?.unit ?? settings.units;
}
function Equipment_getUnitForExerciseType(settings, exerciseType) {
  const equipment = Equipment_getEquipmentDataForExerciseType(settings, exerciseType);
  const equipmentUnit = equipment?.unit;
  return equipmentUnit == null || equipmentUnit === settings.units ? void 0 : equipmentUnit;
}
function Equipment_currentEquipment(settings) {
  const currentGym = settings.gyms.find((g) => g.id === settings.currentGymId) ?? settings.gyms[0];
  return currentGym?.equipment;
}

// third-party/liftosaur/upstream/src/models/weight.ts
var prebuiltWeights = {};
function Weight_rpePct(reps, rpe) {
  return Weight_buildPct(MathUtils_roundTo005(Weight_rpeMultiplier(reps, rpe) * 100));
}
function Weight_evaluateWeight(weight, exerciseType, settings) {
  if (Weight_is(weight)) {
    return weight;
  } else if (Weight_isPct(weight)) {
    const exercise = Exercise_get(exerciseType, settings.exercises);
    const onerm = Exercise_onerm(exercise, settings);
    return Weight_multiply(onerm, weight.value / 100);
  } else {
    const unit = Equipment_getUnitOrDefaultForExerciseType(settings, exerciseType);
    return Weight_build(0, unit);
  }
}
function Weight_smartConvert(weight, toUnit) {
  if (weight.unit === toUnit) {
    return weight;
  }
  const value = weight.value;
  if (weight.unit === "kg") {
    if (value < 15) {
      return Weight_build(value * 2, toUnit);
    } else {
      return Weight_build(MathUtils_round(value * 2.25, 5), toUnit);
    }
  } else {
    if (value < 15) {
      return Weight_build(MathUtils_round(value / 2, 0.25), toUnit);
    } else {
      return Weight_build(MathUtils_round(value / 2.25, 2.5), toUnit);
    }
  }
}
function Weight_print(weight) {
  if (typeof weight === "number") {
    return `${n(weight)}`;
  } else {
    return `${n(weight.value)}${weight.unit}`;
  }
}
function Weight_printNull(weight) {
  if (weight == null) {
    return "";
  } else if (typeof weight === "number") {
    return `${n(weight)}`;
  } else {
    return `${n(weight.value)}${weight.unit}`;
  }
}
function Weight_parsePct(str) {
  if (str == null) {
    return void 0;
  }
  const match = str.match(/^([\-+]?[0-9.]+)%$/);
  if (match) {
    return Weight_buildPct(MathUtils_roundFloat(parseFloat(match[1]), 2));
  } else {
    return Weight_parse(str);
  }
}
function Weight_parse(str) {
  const match = str.match(/^([\-+]?[0-9.]+)\s*(kg|lb)$/);
  if (match) {
    return Weight_build(MathUtils_roundFloat(parseFloat(match[1]), 2), match[2]);
  } else {
    return void 0;
  }
}
function Weight_buildPct(value) {
  return { value, unit: "%" };
}
function Weight_buildAny(value, unit) {
  if (unit === "%") {
    return Weight_buildPct(value);
  } else {
    return Weight_build(value, unit);
  }
}
function Weight_build(value, unit) {
  const key = `${value}_${unit}`;
  const prebuiltWeight = prebuiltWeights[key];
  if (prebuiltWeight != null) {
    return prebuiltWeight;
  } else {
    const v = { value: typeof value === "string" ? parseFloat(value) : value, unit };
    prebuiltWeights[`${value}_${unit}`] = v;
    return v;
  }
}
function Weight_is(object2) {
  const objWeight = object2;
  return objWeight && typeof objWeight === "object" && "unit" in objWeight && "value" in objWeight && (objWeight.unit === "kg" || objWeight.unit === "lb");
}
function Weight_isPct(object2) {
  const objWeight = object2;
  return objWeight && typeof objWeight === "object" && "unit" in objWeight && "value" in objWeight && objWeight.unit === "%";
}
function Weight_round(weight, settings, unit, exerciseType) {
  if (exerciseType == null) {
    return Weight_roundTo005(weight);
  }
  return Weight_calculatePlates(weight, settings, unit, exerciseType).totalWeight;
}
function stepWeight(weight, settings, exerciseType, direction) {
  const equipmentData = exerciseType ? Equipment_getEquipmentDataForExerciseType(settings, exerciseType) : void 0;
  if (equipmentData != null) {
    const setup = Equipment_setupIn(equipmentData, equipmentData.unit ?? weight.unit);
    const query = { bodyweight: settings.currentBodyweight };
    const rounded = EquipmentLoadSolver_select(setup, weight, query).total;
    return direction === 1 ? EquipmentLoadSolver_next(setup, rounded, query) : EquipmentLoadSolver_previous(setup, rounded, query);
  }
  const roundWeight = Weight_round(weight, settings, weight.unit, exerciseType);
  const rounding = exerciseType ? Exercise_defaultRounding(exerciseType, settings) : 1;
  return Weight_build(roundWeight.value + direction * rounding, roundWeight.unit);
}
function Weight_increment(weight, settings, exerciseType) {
  return stepWeight(weight, settings, exerciseType, 1);
}
function Weight_decrement(weight, settings, exerciseType) {
  return stepWeight(weight, settings, exerciseType, -1);
}
function Weight_getOneRepMax(weight, reps, rpe) {
  if (reps === 0) {
    return Weight_build(0, weight.unit);
  } else if (reps === 1) {
    return weight;
  } else {
    return Weight_roundTo005(Weight_divide(weight, Weight_rpeMultiplier(reps, rpe ?? 10)));
  }
}
function Weight_getTrainingMax(weight, reps, settings) {
  return Weight_round(Weight_multiply(Weight_getOneRepMax(weight, reps), 0.9), settings, weight.unit);
}
function Weight_roundTo005(weight) {
  return Weight_build(MathUtils_roundTo005(weight.value), weight.unit);
}
function Weight_loadPlates(load) {
  const instruction = load.instruction;
  if (instruction?.type !== "plates" || instruction.horns.length !== 1) {
    return [];
  }
  return instruction.horns[0].plates.map((p) => ({
    weight: Weight_build(p.weight, load.unit),
    num: p.num * instruction.sides
  }));
}
function calculateLoad(allWeight, settings, units2, exerciseType, warmup2) {
  const equipmentData = Equipment_getEquipmentDataForExerciseType(settings, exerciseType);
  if (equipmentData == null) {
    const rounding = Exercise_defaultRounding(exerciseType, settings);
    const rounded = Weight_build(MathUtils_round(allWeight.value, rounding), allWeight.unit);
    return { plates: [], totalWeight: rounded };
  }
  const setup = Equipment_setupIn(equipmentData, units2);
  const load = EquipmentLoadSolver_select(setup, allWeight, { bodyweight: settings.currentBodyweight, warmup: warmup2 });
  return { plates: Weight_loadPlates(load), totalWeight: load.total, load };
}
function Weight_calculatePlates(allWeight, settings, units2, exerciseType) {
  return calculateLoad(allWeight, settings, units2, exerciseType);
}
function Weight_roundWarmup(weight, settings, unit, exerciseType, firstWorkingWeight) {
  const converted = Weight_convertTo(weight, unit);
  if (exerciseType == null) {
    return Weight_roundTo005(converted);
  }
  return calculateLoad(converted, settings, unit, exerciseType, { firstWorkingWeight }).totalWeight;
}
function Weight_add(weight, value) {
  return Weight_operation(weight, value, (a, b) => a + b);
}
function Weight_multiply(weight, value) {
  return Weight_operation(weight, value, (a, b) => a * b);
}
function Weight_divide(weight, value) {
  return Weight_operation(weight, value, (a, b) => a / b);
}
function Weight_gt(weight, value) {
  return comparison(weight, value, (a, b) => a > b);
}
function Weight_lt(weight, value) {
  return comparison(weight, value, (a, b) => a < b);
}
function Weight_gte(weight, value) {
  return comparison(weight, value, (a, b) => a >= b);
}
function Weight_lte(weight, value) {
  return comparison(weight, value, (a, b) => a <= b);
}
function Weight_eqNull(weight, value) {
  if (weight == null && value == null) {
    return true;
  } else if (weight == null && value != null) {
    return false;
  } else if (weight != null && value == null) {
    return false;
  } else {
    return comparison(weight, value, (a, b) => a === b);
  }
}
function Weight_eq(weight, value) {
  return comparison(weight, value, (a, b) => a === b);
}
function Weight_roundConvertTo(weight, settings, unit, exerciseType) {
  return Weight_round(Weight_convertTo(weight, unit), settings, unit, exerciseType);
}
function Weight_type(value) {
  if (typeof value === "number") {
    return "number";
  } else if (Weight_isPct(value)) {
    return "percentage";
  } else {
    return "weight";
  }
}
function Weight_convertTo(weight, unit) {
  if (typeof weight === "number") {
    return weight;
  } else if (weight.unit === "%" || unit === "%") {
    return weight;
  } else {
    if (weight.unit === unit) {
      return weight;
    } else if (weight.unit === "kg" && unit === "lb") {
      return Weight_build(Math.round(weight.value * 2.205 / 0.5) * 0.5, unit);
    } else {
      return Weight_build(Math.round(weight.value / 2.205 / 0.5) * 0.5, unit);
    }
  }
}
function comparison(weight, value, o) {
  if (typeof weight === "number" && typeof value === "number") {
    return o(weight, value);
  } else if (typeof weight === "number" && typeof value !== "number") {
    return o(weight, value.value);
  } else if (typeof weight !== "number" && typeof value === "number") {
    return o(weight.value, value);
  } else if (typeof weight !== "number" && typeof value !== "number") {
    if (weight.unit === "%" && value.unit === "%") {
      return o(weight.value, value.value);
    } else if (Weight_is(weight) && Weight_is(value)) {
      return o(weight.value, Weight_convertTo(value, weight.unit).value);
    } else {
      return false;
    }
  } else {
    return false;
  }
}
function Weight_applyOp(onerm, oldValue, value, opr) {
  if (opr === "=") {
    return value;
  } else if (opr === "+=") {
    return Weight_op(onerm, oldValue, value, (a, b) => a + b);
  } else if (opr === "-=") {
    return Weight_op(onerm, oldValue, value, (a, b) => a - b);
  } else if (opr === "*=") {
    return Weight_op(onerm, oldValue, value, (a, b) => MathUtils_roundTo005(a * b));
  } else {
    return Weight_op(onerm, oldValue, value, (a, b) => MathUtils_roundTo005(a / b));
  }
}
function Weight_op(onerm, a, b, o) {
  if (typeof a === "number" && typeof b === "number") {
    return o(a, b);
  }
  if (typeof a === "number" && Weight_isPct(b)) {
    return Weight_buildPct(o(a, b.value));
  }
  if (typeof a === "number" && Weight_is(b)) {
    return Weight_operation(a, b, o);
  }
  if (Weight_isPct(a) && typeof b === "number") {
    return Weight_buildPct(o(a.value, b));
  }
  if (Weight_isPct(a) && Weight_isPct(b)) {
    return Weight_buildPct(o(a.value, b.value));
  }
  if (Weight_isPct(a) && Weight_is(b)) {
    const aWeight = onerm ? Weight_multiply(onerm, a.value / 100) : MathUtils_roundFloat(a.value / 100, 4);
    return Weight_operation(aWeight, b, o);
  }
  if (Weight_is(a) && typeof b === "number") {
    return Weight_operation(a, b, o);
  }
  if (Weight_is(a) && Weight_isPct(b)) {
    const bWeight = onerm ? Weight_multiply(onerm, b.value / 100) : MathUtils_roundFloat(b.value / 100, 4);
    return Weight_operation(a, bWeight, o);
  }
  if (Weight_is(a) && Weight_is(b)) {
    return Weight_operation(a, b, o);
  }
  throw new Error(`Can't apply operation to ${a} and ${b}`);
}
function Weight_operation(weight, value, o) {
  if (typeof weight === "number" && typeof value !== "number") {
    return Weight_build(o(weight, value.value), value.unit);
  } else if (typeof weight !== "number" && typeof value === "number") {
    return Weight_build(o(weight.value, value), weight.unit);
  } else if (typeof weight !== "number" && typeof value !== "number") {
    return Weight_build(o(weight.value, Weight_convertTo(value, weight.unit).value), weight.unit);
  } else {
    throw new Error("Weight.operation should never work with numbers only");
  }
}
function Weight_convertToWeight(onerm, value, unit) {
  if (typeof value === "number") {
    return Weight_build(value, unit);
  } else if (Weight_isPct(value)) {
    return Weight_convertTo(Weight_multiply(onerm, MathUtils_roundFloat(value.value / 100, 4)), unit);
  } else {
    return value;
  }
}
function Weight_rpeMultiplier(reps, rpe) {
  if (reps === 1 && rpe === 10) {
    return 1;
  }
  reps = Math.max(Math.min(reps, 24), 1);
  rpe = Math.max(Math.min(rpe, 10), 1);
  const x = 10 - rpe + (reps - 1);
  if (x >= 16) {
    return 0.5;
  }
  const intersection = 2.92;
  if (x <= intersection) {
    const a = 0.347619;
    const b = -4.60714;
    const c = 99.9667;
    return (a * x * x + b * x + c) / 100;
  } else {
    const m = -2.64249;
    const b = 97.0955;
    return (m * x + b) / 100;
  }
}
var Weight_zero = { value: 0, unit: "lb" };

// third-party/liftosaur/upstream/src/utils/generator.ts
function UidFactory_generateUid(length) {
  const domain = "abcdefghijklmnopqrstuvwxyz";
  let uid = "";
  for (let i = 0; i < length; i += 1) {
    uid += domain[Math.floor(Math.random() * domain.length)];
  }
  return uid;
}

// third-party/liftosaur/upstream/src/models/muscle.ts
var screenMuscleToMuscleMapping = {
  chest: ["Pectoralis Major Clavicular Head", "Pectoralis Major Sternal Head"],
  lats: ["Latissimus Dorsi", "Teres Major"],
  upperBack: ["Trapezius Middle Fibers", "Trapezius Lower Fibers"],
  frontDelts: ["Deltoid Anterior"],
  sideDelts: ["Deltoid Lateral"],
  rearDelts: ["Deltoid Posterior"],
  biceps: ["Biceps Brachii", "Brachialis", "Brachioradialis"],
  triceps: ["Triceps Brachii"],
  quadriceps: ["Quadriceps"],
  hamstrings: ["Hamstrings"],
  glutes: ["Gluteus Maximus"],
  calves: ["Gastrocnemius", "Soleus"],
  abs: ["Rectus Abdominis"],
  upperTraps: ["Trapezius Upper Fibers", "Levator Scapulae"],
  lowerBack: ["Erector Spinae"],
  neck: ["Sternocleidomastoid", "Splenius"],
  rotatorCuff: ["Infraspinatus", "Teres Minor"],
  forearmFlexors: ["Wrist Flexors"],
  forearmExtensors: ["Wrist Extensors"],
  obliques: ["Obliques"],
  hipFlexors: ["Iliopsoas", "Sartorius"],
  abductors: ["Gluteus Medius", "Tensor Fasciae Latae"],
  adductors: ["Adductor Magnus", "Adductor Brevis", "Adductor Longus", "Pectineous"]
};
var Muscle_groupsWithDefaultRange = [
  "chest",
  "lats",
  "upperBack",
  "frontDelts",
  "sideDelts",
  "rearDelts",
  "biceps",
  "triceps",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "abs"
];
function Muscle_getScreenMusclesFromMuscle(muscle, settings) {
  const availableMuscleGroups = Muscle_getAvailableMuscleGroups(settings);
  const matchingMuscleGroups = availableMuscleGroups.filter((mg) => {
    const muscles = settings.muscleGroups.data[mg]?.muscles ?? screenMuscleToMuscleMapping[mg] ?? [];
    return muscles.includes(muscle);
  });
  return matchingMuscleGroups;
}
function Muscle_getAvailableMuscleGroups(settings) {
  return [
    ...screenMuscles.filter((sm) => !settings.muscleGroups.data[sm]?.isHidden),
    ...Object.keys(settings.muscleGroups.data).filter((k) => !screenMuscles.includes(k))
  ];
}

// third-party/liftosaur/upstream/src/models/exercise.ts
var import_lens_shmens = __toESM(require_dist());
var allExercisesList = {
  abWheel: {
    id: "abWheel",
    name: "Ab Wheel",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  arnoldPress: {
    id: "arnoldPress",
    name: "Arnold Press",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 20, unit: "lb" },
    startingWeightKg: { value: 7.5, unit: "kg" }
  },
  aroundTheWorld: {
    id: "aroundTheWorld",
    name: "Around The World",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["core"],
    startingWeightLb: { value: 15, unit: "lb" },
    startingWeightKg: { value: 5, unit: "kg" }
  },
  backExtension: {
    id: "backExtension",
    name: "Back Extension",
    defaultWarmup: 10,
    defaultEquipment: "leverageMachine",
    types: ["lower", "core"],
    startingWeightLb: { value: 50, unit: "lb" },
    startingWeightKg: { value: 22.5, unit: "kg" }
  },
  ballSlams: {
    id: "ballSlams",
    name: "Ball Slams",
    defaultEquipment: "medicineball",
    types: ["core", "upper"],
    startingWeightLb: { value: 10, unit: "lb" },
    startingWeightKg: { value: 4.5, unit: "kg" }
  },
  battleRopes: {
    id: "battleRopes",
    name: "Battle Ropes",
    defaultEquipment: "bodyweight",
    types: ["upper", "core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  behindTheNeckPress: {
    id: "behindTheNeckPress",
    name: "Behind The Neck Press",
    defaultEquipment: "barbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 65, unit: "lb" },
    startingWeightKg: { value: 27.5, unit: "kg" }
  },
  benchDip: {
    id: "benchDip",
    name: "Bench Dip",
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  benchPress: {
    id: "benchPress",
    name: "Bench Press",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 135, unit: "lb" },
    startingWeightKg: { value: 60, unit: "kg" }
  },
  benchPressCloseGrip: {
    id: "benchPressCloseGrip",
    name: "Bench Press Close Grip",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 115, unit: "lb" },
    startingWeightKg: { value: 50, unit: "kg" }
  },
  benchPressWideGrip: {
    id: "benchPressWideGrip",
    name: "Bench Press Wide Grip",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 135, unit: "lb" },
    startingWeightKg: { value: 60, unit: "kg" }
  },
  bentOverOneArmRow: {
    id: "bentOverOneArmRow",
    name: "Bent Over One Arm Row",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 30, unit: "lb" },
    startingWeightKg: { value: 12.5, unit: "kg" }
  },
  bentOverRow: {
    id: "bentOverRow",
    name: "Bent Over Row",
    defaultWarmup: 95,
    defaultEquipment: "barbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 95, unit: "lb" },
    startingWeightKg: { value: 42.5, unit: "kg" }
  },
  bicepCurl: {
    id: "bicepCurl",
    name: "Bicep Curl",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 20, unit: "lb" },
    startingWeightKg: { value: 7.5, unit: "kg" }
  },
  bicycleCrunch: {
    id: "bicycleCrunch",
    name: "Bicycle Crunch",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  boxJump: {
    id: "boxJump",
    name: "Box Jump",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  boxSquat: {
    id: "boxSquat",
    name: "Box Squat",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 155, unit: "lb" },
    startingWeightKg: { value: 70, unit: "kg" }
  },
  bulgarianSplitSquat: {
    id: "bulgarianSplitSquat",
    name: "Bulgarian Split Squat",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 25, unit: "lb" },
    startingWeightKg: { value: 10, unit: "kg" }
  },
  burpee: {
    id: "burpee",
    name: "Burpee",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "lower", "core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  cableCrossover: {
    id: "cableCrossover",
    name: "Cable Crossover",
    defaultWarmup: 10,
    defaultEquipment: "cable",
    types: ["upper", "pull"],
    startingWeightLb: { value: 20, unit: "lb" },
    startingWeightKg: { value: 7.5, unit: "kg" }
  },
  cableCrunch: {
    id: "cableCrunch",
    name: "Cable Crunch",
    defaultWarmup: 10,
    defaultEquipment: "cable",
    types: ["core"],
    startingWeightLb: { value: 50, unit: "lb" },
    startingWeightKg: { value: 22.5, unit: "kg" }
  },
  cableKickback: {
    id: "cableKickback",
    name: "Cable Kickback",
    defaultWarmup: 10,
    defaultEquipment: "cable",
    types: ["upper", "push"],
    startingWeightLb: { value: 20, unit: "lb" },
    startingWeightKg: { value: 7.5, unit: "kg" }
  },
  cablePullThrough: {
    id: "cablePullThrough",
    name: "Cable Pull Through",
    defaultWarmup: 10,
    defaultEquipment: "cable",
    types: ["lower", "pull"],
    startingWeightLb: { value: 70, unit: "lb" },
    startingWeightKg: { value: 30, unit: "kg" }
  },
  cableTwist: {
    id: "cableTwist",
    name: "Cable Twist",
    defaultWarmup: 10,
    defaultEquipment: "cable",
    types: ["core"],
    startingWeightLb: { value: 30, unit: "lb" },
    startingWeightKg: { value: 12.5, unit: "kg" }
  },
  calfPressOnLegPress: {
    id: "calfPressOnLegPress",
    name: "Calf Press on Leg Press",
    defaultWarmup: 10,
    defaultEquipment: "leverageMachine",
    types: ["lower", "legs"],
    startingWeightLb: { value: 150, unit: "lb" },
    startingWeightKg: { value: 67.5, unit: "kg" }
  },
  calfPressOnSeatedLegPress: {
    id: "calfPressOnSeatedLegPress",
    name: "Calf Press on Seated Leg Press",
    defaultWarmup: 10,
    defaultEquipment: "leverageMachine",
    types: ["lower", "legs"],
    startingWeightLb: { value: 120, unit: "lb" },
    startingWeightKg: { value: 53.75, unit: "kg" }
  },
  chestDip: {
    id: "chestDip",
    name: "Chest Dip",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  chestFly: {
    id: "chestFly",
    name: "Chest Fly",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 20, unit: "lb" },
    startingWeightKg: { value: 7.5, unit: "kg" }
  },
  chestPress: {
    id: "chestPress",
    name: "Chest Press",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 30, unit: "lb" },
    startingWeightKg: { value: 12.5, unit: "kg" }
  },
  chestSupportedRow: {
    id: "chestSupportedRow",
    name: "Chest-Supported Row",
    defaultWarmup: 10,
    defaultEquipment: "barbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 85, unit: "lb" },
    startingWeightKg: { value: 37.5, unit: "kg" }
  },
  chinUp: {
    id: "chinUp",
    name: "Chin Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  clean: {
    id: "clean",
    name: "Clean",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "lower", "push"],
    startingWeightLb: { value: 95, unit: "lb" },
    startingWeightKg: { value: 42.5, unit: "kg" }
  },
  cleanandJerk: {
    id: "cleanandJerk",
    name: "Clean and Jerk",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "lower", "push"],
    startingWeightLb: { value: 95, unit: "lb" },
    startingWeightKg: { value: 42.5, unit: "kg" }
  },
  concentrationCurl: {
    id: "concentrationCurl",
    name: "Concentration Curl",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 20, unit: "lb" },
    startingWeightKg: { value: 7.5, unit: "kg" }
  },
  crossBodyCrunch: {
    id: "crossBodyCrunch",
    name: "Cross Body Crunch",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  crunch: {
    id: "crunch",
    name: "Crunch",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  cycling: {
    id: "cycling",
    name: "Cycling",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  deadlift: {
    id: "deadlift",
    name: "Deadlift",
    defaultWarmup: 95,
    defaultEquipment: "barbell",
    types: ["lower", "pull"],
    startingWeightLb: { value: 185, unit: "lb" },
    startingWeightKg: { value: 82.5, unit: "kg" }
  },
  deadliftHighPull: {
    id: "deadliftHighPull",
    name: "Deadlift High Pull",
    defaultWarmup: 95,
    defaultEquipment: "barbell",
    types: ["upper", "lower", "pull"],
    startingWeightLb: { value: 75, unit: "lb" },
    startingWeightKg: { value: 32.5, unit: "kg" }
  },
  declineBenchPress: {
    id: "declineBenchPress",
    name: "Decline Bench Press",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 125, unit: "lb" },
    startingWeightKg: { value: 55, unit: "kg" }
  },
  declineCrunch: {
    id: "declineCrunch",
    name: "Decline Crunch",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  deficitDeadlift: {
    id: "deficitDeadlift",
    name: "Deficit Deadlift",
    defaultWarmup: 95,
    defaultEquipment: "barbell",
    types: ["lower", "pull"],
    startingWeightLb: { value: 165, unit: "lb" },
    startingWeightKg: { value: 75, unit: "kg" }
  },
  ellipticalMachine: {
    id: "ellipticalMachine",
    name: "Elliptical Machine",
    defaultWarmup: 10,
    defaultEquipment: "leverageMachine",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  facePull: {
    id: "facePull",
    name: "Face Pull",
    defaultWarmup: 10,
    defaultEquipment: "band",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  flatKneeRaise: {
    id: "flatKneeRaise",
    name: "Flat Knee Raise",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  flatLegRaise: {
    id: "flatLegRaise",
    name: "Flat Leg Raise",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  frontRaise: {
    id: "frontRaise",
    name: "Front Raise",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 15, unit: "lb" },
    startingWeightKg: { value: 5, unit: "kg" }
  },
  frontSquat: {
    id: "frontSquat",
    name: "Front Squat",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 95, unit: "lb" },
    startingWeightKg: { value: 42.5, unit: "kg" }
  },
  gobletSquat: {
    id: "gobletSquat",
    name: "Goblet Squat",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 35, unit: "lb" },
    startingWeightKg: { value: 15, unit: "kg" }
  },
  goodMorning: {
    id: "goodMorning",
    name: "Good Morning",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 65, unit: "lb" },
    startingWeightKg: { value: 27.5, unit: "kg" }
  },
  gluteBridge: {
    id: "gluteBridge",
    name: "Glute Bridge",
    defaultWarmup: 45,
    defaultEquipment: "dumbbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 35, unit: "lb" },
    startingWeightKg: { value: 15, unit: "kg" }
  },
  gluteBridgeMarch: {
    id: "gluteBridgeMarch",
    name: "Glute Bridge March",
    defaultWarmup: 45,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  gluteKickback: {
    id: "gluteKickback",
    name: "Glute Kickback",
    defaultWarmup: 45,
    defaultEquipment: "cable",
    types: ["lower", "legs"],
    startingWeightLb: { value: 35, unit: "lb" },
    startingWeightKg: { value: 15, unit: "kg" }
  },
  hackSquat: {
    id: "hackSquat",
    name: "Hack Squat",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 115, unit: "lb" },
    startingWeightKg: { value: 50, unit: "kg" }
  },
  hammerCurl: {
    id: "hammerCurl",
    name: "Hammer Curl",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 25, unit: "lb" },
    startingWeightKg: { value: 10, unit: "kg" }
  },
  handstandPushUp: {
    id: "handstandPushUp",
    name: "Handstand Push Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  hangClean: {
    id: "hangClean",
    name: "Hang Clean",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "lower", "pull"],
    startingWeightLb: { value: 85, unit: "lb" },
    startingWeightKg: { value: 37.5, unit: "kg" }
  },
  hangSnatch: {
    id: "hangSnatch",
    name: "Hang Snatch",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "lower", "pull"],
    startingWeightLb: { value: 65, unit: "lb" },
    startingWeightKg: { value: 27.5, unit: "kg" }
  },
  hangingLegRaise: {
    id: "hangingLegRaise",
    name: "Hanging Leg Raise",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  highKneeSkips: {
    id: "highKneeSkips",
    name: "High Knee Skips",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  highRow: {
    id: "highRow",
    name: "High Row",
    defaultWarmup: 45,
    defaultEquipment: "leverageMachine",
    types: ["upper", "pull"],
    startingWeightLb: { value: 65, unit: "lb" },
    startingWeightKg: { value: 27.5, unit: "kg" }
  },
  hipAbductor: {
    id: "hipAbductor",
    name: "Hip Abductor",
    defaultWarmup: 10,
    defaultEquipment: "leverageMachine",
    types: ["lower", "legs"],
    startingWeightLb: { value: 60, unit: "lb" },
    startingWeightKg: { value: 26.25, unit: "kg" }
  },
  hipAdductor: {
    id: "hipAdductor",
    name: "Hip Adductor",
    defaultWarmup: 10,
    defaultEquipment: "leverageMachine",
    types: ["lower", "legs"],
    startingWeightLb: { value: 60, unit: "lb" },
    startingWeightKg: { value: 26.25, unit: "kg" }
  },
  hipThrust: {
    id: "hipThrust",
    name: "Hip Thrust",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 95, unit: "lb" },
    startingWeightKg: { value: 42.5, unit: "kg" }
  },
  inclineBenchPress: {
    id: "inclineBenchPress",
    name: "Incline Bench Press",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 115, unit: "lb" },
    startingWeightKg: { value: 50, unit: "kg" }
  },
  inclineBenchPressWideGrip: {
    id: "inclineBenchPressWideGrip",
    name: "Incline Bench Press Wide Grip",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 110, unit: "lb" },
    startingWeightKg: { value: 50, unit: "kg" }
  },
  inclineChestFly: {
    id: "inclineChestFly",
    name: "Incline Chest Fly",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 20, unit: "lb" },
    startingWeightKg: { value: 7.5, unit: "kg" }
  },
  inclineChestPress: {
    id: "inclineChestPress",
    name: "Incline Chest Press",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 25, unit: "lb" },
    startingWeightKg: { value: 10, unit: "kg" }
  },
  inclineCurl: {
    id: "inclineCurl",
    name: "Incline Curl",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 20, unit: "lb" },
    startingWeightKg: { value: 7.5, unit: "kg" }
  },
  inclineRow: {
    id: "inclineRow",
    name: "Incline Row",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 30, unit: "lb" },
    startingWeightKg: { value: 12.5, unit: "kg" }
  },
  invertedRow: {
    id: "invertedRow",
    name: "Inverted Row",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  isoLateralChestPress: {
    id: "isoLateralChestPress",
    name: "Iso-Lateral Chest Press",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 30, unit: "lb" },
    startingWeightKg: { value: 12.5, unit: "kg" }
  },
  isoLateralRow: {
    id: "isoLateralRow",
    name: "Iso-Lateral Row",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 30, unit: "lb" },
    startingWeightKg: { value: 12.5, unit: "kg" }
  },
  jackknifeSitUp: {
    id: "jackknifeSitUp",
    name: "Jackknife Sit Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  jumpRope: {
    id: "jumpRope",
    name: "Jump Rope",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  jumpSquat: {
    id: "jumpSquat",
    name: "Jump Squat",
    defaultWarmup: 10,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 65, unit: "lb" },
    startingWeightKg: { value: 27.5, unit: "kg" }
  },
  jumpingJack: {
    id: "jumpingJack",
    name: "Jumping Jack",
    defaultWarmup: 10,
    defaultEquipment: void 0,
    types: ["upper", "lower"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  kettlebellSwing: {
    id: "kettlebellSwing",
    name: "Kettlebell Swing",
    defaultWarmup: 10,
    defaultEquipment: "kettlebell",
    types: ["upper", "lower", "core"],
    startingWeightLb: { value: 35, unit: "lb" },
    startingWeightKg: { value: 16, unit: "kg" }
  },
  kettlebellTurkishGetUp: {
    id: "kettlebellTurkishGetUp",
    name: "Kettlebell Turkish Get Up",
    defaultWarmup: 10,
    defaultEquipment: "kettlebell",
    types: ["upper", "lower", "core"],
    startingWeightLb: { value: 25, unit: "lb" },
    startingWeightKg: { value: 8, unit: "kg" }
  },
  kippingPullUp: {
    id: "kippingPullUp",
    name: "Kipping Pull Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  kneeRaise: {
    id: "kneeRaise",
    name: "Knee Raise",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  kneelingPulldown: {
    id: "kneelingPulldown",
    name: "Kneeling Pulldown",
    defaultWarmup: 10,
    defaultEquipment: "band",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  kneestoElbows: {
    id: "kneestoElbows",
    name: "Knees to Elbows",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  latPulldown: {
    id: "latPulldown",
    name: "Lat Pulldown",
    defaultWarmup: 10,
    defaultEquipment: "cable",
    types: ["upper", "pull"],
    startingWeightLb: { value: 70, unit: "lb" },
    startingWeightKg: { value: 30, unit: "kg" }
  },
  lateralBoxJump: {
    id: "lateralBoxJump",
    name: "Lateral Box Jump",
    defaultWarmup: 10,
    defaultEquipment: void 0,
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  lateralRaise: {
    id: "lateralRaise",
    name: "Lateral Raise",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 15, unit: "lb" },
    startingWeightKg: { value: 5, unit: "kg" }
  },
  legsUpBenchPress: {
    id: "legsUpBenchPress",
    name: "Legs Up Bench Press",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 135, unit: "lb" },
    startingWeightKg: { value: 60, unit: "kg" }
  },
  legCurl: {
    id: "legCurl",
    name: "Leg Curl",
    defaultWarmup: 10,
    defaultEquipment: "leverageMachine",
    types: ["lower", "legs"],
    startingWeightLb: { value: 60, unit: "lb" },
    startingWeightKg: { value: 26.25, unit: "kg" }
  },
  legExtension: {
    id: "legExtension",
    name: "Leg Extension",
    defaultWarmup: 10,
    defaultEquipment: "leverageMachine",
    types: ["lower", "legs"],
    startingWeightLb: { value: 60, unit: "lb" },
    startingWeightKg: { value: 26.25, unit: "kg" }
  },
  legPress: {
    id: "legPress",
    name: "Leg Press",
    defaultWarmup: 10,
    defaultEquipment: "leverageMachine",
    types: ["lower", "legs"],
    startingWeightLb: { value: 250, unit: "lb" },
    startingWeightKg: { value: 112.5, unit: "kg" }
  },
  lunge: {
    id: "lunge",
    name: "Lunge",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 75, unit: "lb" },
    startingWeightKg: { value: 32.5, unit: "kg" }
  },
  lyingBicepCurl: {
    id: "lyingBicepCurl",
    name: "Lying Bicep Curl",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 15, unit: "lb" },
    startingWeightKg: { value: 5, unit: "kg" }
  },
  lyingLegCurl: {
    id: "lyingLegCurl",
    name: "Lying Leg Curl",
    defaultWarmup: 10,
    defaultEquipment: "leverageMachine",
    types: ["lower", "legs"],
    startingWeightLb: { value: 60, unit: "lb" },
    startingWeightKg: { value: 26.25, unit: "kg" }
  },
  mountainClimber: {
    id: "mountainClimber",
    name: "Mountain Climber",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core", "lower"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  muscleUp: {
    id: "muscleUp",
    name: "Muscle Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  obliqueCrunch: {
    id: "obliqueCrunch",
    name: "Oblique Crunch",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  overheadPress: {
    id: "overheadPress",
    name: "Overhead Press",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 75, unit: "lb" },
    startingWeightKg: { value: 32.5, unit: "kg" }
  },
  overheadSquat: {
    id: "overheadSquat",
    name: "Overhead Squat",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 55, unit: "lb" },
    startingWeightKg: { value: 25, unit: "kg" }
  },
  pecDeck: {
    id: "pecDeck",
    name: "Pec Deck",
    defaultWarmup: 10,
    defaultEquipment: "leverageMachine",
    types: ["upper", "push"],
    startingWeightLb: { value: 50, unit: "lb" },
    startingWeightKg: { value: 22.5, unit: "kg" }
  },
  pendlayRow: {
    id: "pendlayRow",
    name: "Pendlay Row",
    defaultWarmup: 10,
    defaultEquipment: "barbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 95, unit: "lb" },
    startingWeightKg: { value: 42.5, unit: "kg" }
  },
  pistolSquat: {
    id: "pistolSquat",
    name: "Pistol Squat",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  plank: {
    id: "plank",
    name: "Plank",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  powerClean: {
    id: "powerClean",
    name: "Power Clean",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "lower", "pull"],
    startingWeightLb: { value: 95, unit: "lb" },
    startingWeightKg: { value: 42.5, unit: "kg" }
  },
  powerSnatch: {
    id: "powerSnatch",
    name: "Power Snatch",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "lower", "pull"],
    startingWeightLb: { value: 65, unit: "lb" },
    startingWeightKg: { value: 27.5, unit: "kg" }
  },
  preacherCurl: {
    id: "preacherCurl",
    name: "Preacher Curl",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 20, unit: "lb" },
    startingWeightKg: { value: 7.5, unit: "kg" }
  },
  pressUnder: {
    id: "pressUnder",
    name: "Press Under",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 65, unit: "lb" },
    startingWeightKg: { value: 27.5, unit: "kg" }
  },
  pullUp: {
    id: "pullUp",
    name: "Pull Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  pullover: {
    id: "pullover",
    name: "Pullover",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 25, unit: "lb" },
    startingWeightKg: { value: 10, unit: "kg" }
  },
  pushPress: {
    id: "pushPress",
    name: "Push Press",
    defaultWarmup: 45,
    defaultEquipment: "kettlebell",
    types: ["upper", "push"],
    startingWeightLb: { value: 35, unit: "lb" },
    startingWeightKg: { value: 16, unit: "kg" }
  },
  pushUp: {
    id: "pushUp",
    name: "Push Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  reverseCrunch: {
    id: "reverseCrunch",
    name: "Reverse Crunch",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  reverseCurl: {
    id: "reverseCurl",
    name: "Reverse Curl",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 15, unit: "lb" },
    startingWeightKg: { value: 5, unit: "kg" }
  },
  reverseFly: {
    id: "reverseFly",
    name: "Reverse Fly",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 15, unit: "lb" },
    startingWeightKg: { value: 5, unit: "kg" }
  },
  reverseGripConcentrationCurl: {
    id: "reverseGripConcentrationCurl",
    name: "Reverse Grip Concentration Curl",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 20, unit: "lb" },
    startingWeightKg: { value: 7.5, unit: "kg" }
  },
  reversePlank: {
    id: "reversePlank",
    name: "Reverse Plank",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  reverseLatPulldown: {
    id: "reverseLatPulldown",
    name: "Reverse Lat Pulldown",
    defaultWarmup: 10,
    defaultEquipment: "cable",
    types: ["upper", "pull"],
    startingWeightLb: { value: 70, unit: "lb" },
    startingWeightKg: { value: 30, unit: "kg" }
  },
  reverseLunge: {
    id: "reverseLunge",
    name: "Reverse Lunge",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 25, unit: "lb" },
    startingWeightKg: { value: 10, unit: "kg" }
  },
  reverseWristCurl: {
    id: "reverseWristCurl",
    name: "Reverse Wrist Curl",
    defaultWarmup: 10,
    defaultEquipment: "barbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 25, unit: "lb" },
    startingWeightKg: { value: 10, unit: "kg" }
  },
  romanianDeadlift: {
    id: "romanianDeadlift",
    name: "Romanian Deadlift",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 40, unit: "lb" },
    startingWeightKg: { value: 17.5, unit: "kg" }
  },
  reverseHyperextension: {
    id: "reverseHyperextension",
    name: "Reverse Hyperextension",
    defaultWarmup: 45,
    defaultEquipment: "band",
    types: ["core", "lower"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  rowing: {
    id: "rowing",
    name: "Rowing",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  russianTwist: {
    id: "russianTwist",
    name: "Russian Twist",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  safetySquatBarSquat: {
    id: "safetySquatBarSquat",
    name: "Safety Squat Bar Squat",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 145, unit: "lb" },
    startingWeightKg: { value: 65, unit: "kg" }
  },
  seatedCalfRaise: {
    id: "seatedCalfRaise",
    name: "Seated Calf Raise",
    defaultWarmup: 10,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 90, unit: "lb" },
    startingWeightKg: { value: 40, unit: "kg" }
  },
  seatedFrontRaise: {
    id: "seatedFrontRaise",
    name: "Seated Front Raise",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 15, unit: "lb" },
    startingWeightKg: { value: 5, unit: "kg" }
  },
  seatedLegCurl: {
    id: "seatedLegCurl",
    name: "Seated Leg Curl",
    defaultWarmup: 10,
    defaultEquipment: "leverageMachine",
    types: ["lower", "legs"],
    startingWeightLb: { value: 60, unit: "lb" },
    startingWeightKg: { value: 26.25, unit: "kg" }
  },
  seatedLegPress: {
    id: "seatedLegPress",
    name: "Seated Leg Press",
    defaultWarmup: 10,
    defaultEquipment: "leverageMachine",
    types: ["lower", "legs"],
    startingWeightLb: { value: 200, unit: "lb" },
    startingWeightKg: { value: 90, unit: "kg" }
  },
  seatedOverheadPress: {
    id: "seatedOverheadPress",
    name: "Seated Overhead Press",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 75, unit: "lb" },
    startingWeightKg: { value: 32.5, unit: "kg" }
  },
  seatedPalmsUpWristCurl: {
    id: "seatedPalmsUpWristCurl",
    name: "Seated Palms Up Wrist Curl",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 15, unit: "lb" },
    startingWeightKg: { value: 5, unit: "kg" }
  },
  seatedRow: {
    id: "seatedRow",
    name: "Seated Row",
    defaultWarmup: 10,
    defaultEquipment: "cable",
    types: ["upper", "pull"],
    startingWeightLb: { value: 70, unit: "lb" },
    startingWeightKg: { value: 30, unit: "kg" }
  },
  seatedWideGripRow: {
    id: "seatedWideGripRow",
    name: "Seated Wide Grip Row",
    defaultWarmup: 10,
    defaultEquipment: "cable",
    types: ["upper", "pull"],
    startingWeightLb: { value: 65, unit: "lb" },
    startingWeightKg: { value: 27.5, unit: "kg" }
  },
  shoulderPress: {
    id: "shoulderPress",
    name: "Shoulder Press",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 25, unit: "lb" },
    startingWeightKg: { value: 10, unit: "kg" }
  },
  shoulderPressParallelGrip: {
    id: "shoulderPressParallelGrip",
    name: "Shoulder Press Parallel Grip",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 25, unit: "lb" },
    startingWeightKg: { value: 10, unit: "kg" }
  },
  shrug: {
    id: "shrug",
    name: "Shrug",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 45, unit: "lb" },
    startingWeightKg: { value: 20, unit: "kg" }
  },
  sideBend: {
    id: "sideBend",
    name: "Side Bend",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["core"],
    startingWeightLb: { value: 30, unit: "lb" },
    startingWeightKg: { value: 12.5, unit: "kg" }
  },
  sideCrunch: {
    id: "sideCrunch",
    name: "Side Crunch",
    defaultWarmup: 45,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  sideHipAbductor: {
    id: "sideHipAbductor",
    name: "Side Hip Abductor",
    defaultWarmup: 45,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  sideLyingClam: {
    id: "sideLyingClam",
    name: "Side Lying Clam",
    defaultWarmup: 45,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  sidePlank: {
    id: "sidePlank",
    name: "Side Plank",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  singleLegBridge: {
    id: "singleLegBridge",
    name: "Single Leg Bridge",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  singleLegCalfRaise: {
    id: "singleLegCalfRaise",
    name: "Single Leg Calf Raise",
    defaultWarmup: 10,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 85, unit: "lb" },
    startingWeightKg: { value: 37.5, unit: "kg" }
  },
  singleLegDeadlift: {
    id: "singleLegDeadlift",
    name: "Single Leg Deadlift",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 30, unit: "lb" },
    startingWeightKg: { value: 12.5, unit: "kg" }
  },
  singleLegGluteBridgeBench: {
    id: "singleLegGluteBridgeBench",
    name: "Single Leg Glute Bridge On Bench",
    defaultWarmup: 45,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  singleLegGluteBridgeStraight: {
    id: "singleLegGluteBridgeStraight",
    name: "Single Leg Glute Bridge Straight Leg",
    defaultWarmup: 45,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  singleLegGluteBridgeBentKnee: {
    id: "singleLegGluteBridgeBentKnee",
    name: "Single Leg Glute Bridge Bent Knee",
    defaultWarmup: 45,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  singleLegHipThrust: {
    id: "singleLegHipThrust",
    name: "Single Leg Hip Thrust",
    defaultWarmup: 45,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  sissySquat: {
    id: "sissySquat",
    name: "Sissy Squat",
    defaultWarmup: 45,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  sitUp: {
    id: "sitUp",
    name: "Sit Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  skullcrusher: {
    id: "skullcrusher",
    name: "Skullcrusher",
    defaultWarmup: 10,
    defaultEquipment: "ezbar",
    types: ["upper", "push"],
    startingWeightLb: { value: 45, unit: "lb" },
    startingWeightKg: { value: 20, unit: "kg" }
  },
  slingShotBenchPress: {
    id: "slingShotBenchPress",
    name: "Sling Shot Bench Press",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 140, unit: "lb" },
    startingWeightKg: { value: 62.5, unit: "kg" }
  },
  snatch: {
    id: "snatch",
    name: "Snatch",
    defaultWarmup: 45,
    defaultEquipment: "dumbbell",
    types: ["upper", "lower", "pull"],
    startingWeightLb: { value: 25, unit: "lb" },
    startingWeightKg: { value: 10, unit: "kg" }
  },
  snatchPull: {
    id: "snatchPull",
    name: "Snatch Pull",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 85, unit: "lb" },
    startingWeightKg: { value: 37.5, unit: "kg" }
  },
  splitSquat: {
    id: "splitSquat",
    name: "Split Squat",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 25, unit: "lb" },
    startingWeightKg: { value: 10, unit: "kg" }
  },
  splitJerk: {
    id: "splitJerk",
    name: "Split Jerk",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "lower", "push"],
    startingWeightLb: { value: 95, unit: "lb" },
    startingWeightKg: { value: 42.5, unit: "kg" }
  },
  squat: {
    id: "squat",
    name: "Squat",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 135, unit: "lb" },
    startingWeightKg: { value: 60, unit: "kg" }
  },
  squatRow: {
    id: "squatRow",
    name: "Squat Row",
    defaultWarmup: 10,
    defaultEquipment: "band",
    types: ["upper", "lower", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  standingCalfRaise: {
    id: "standingCalfRaise",
    name: "Standing Calf Raise",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 35, unit: "lb" },
    startingWeightKg: { value: 15, unit: "kg" }
  },
  standingRow: {
    id: "standingRow",
    name: "Standing Row",
    defaultWarmup: 10,
    defaultEquipment: "cable",
    types: ["upper", "pull"],
    startingWeightLb: { value: 70, unit: "lb" },
    startingWeightKg: { value: 30, unit: "kg" }
  },
  standingRowCloseGrip: {
    id: "standingRowCloseGrip",
    name: "Standing Row Close Grip",
    defaultWarmup: 10,
    defaultEquipment: "cable",
    types: ["upper", "pull"],
    startingWeightLb: { value: 65, unit: "lb" },
    startingWeightKg: { value: 27.5, unit: "kg" }
  },
  standingRowRearDeltWithRope: {
    id: "standingRowRearDeltWithRope",
    name: "Standing Row Rear Delt With Rope",
    defaultWarmup: 10,
    defaultEquipment: "cable",
    types: ["upper", "pull"],
    startingWeightLb: { value: 30, unit: "lb" },
    startingWeightKg: { value: 12.5, unit: "kg" }
  },
  standingRowRearHorizontalDeltWithRope: {
    id: "standingRowRearHorizontalDeltWithRope",
    name: "Standing Row Rear Delt, Horizontal, With Rope",
    defaultWarmup: 10,
    defaultEquipment: "cable",
    types: ["upper", "pull"],
    startingWeightLb: { value: 30, unit: "lb" },
    startingWeightKg: { value: 12.5, unit: "kg" }
  },
  standingRowVBar: {
    id: "standingRowVBar",
    name: "Standing Row V-Bar",
    defaultWarmup: 10,
    defaultEquipment: "cable",
    types: ["upper", "pull"],
    startingWeightLb: { value: 70, unit: "lb" },
    startingWeightKg: { value: 30, unit: "kg" }
  },
  stepUp: {
    id: "stepUp",
    name: "Step up",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 25, unit: "lb" },
    startingWeightKg: { value: 10, unit: "kg" }
  },
  stiffLegDeadlift: {
    id: "stiffLegDeadlift",
    name: "Stiff Leg Deadlift",
    defaultWarmup: 95,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 115, unit: "lb" },
    startingWeightKg: { value: 50, unit: "kg" }
  },
  straightLegDeadlift: {
    id: "straightLegDeadlift",
    name: "Straight Leg Deadlift",
    defaultWarmup: 10,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 110, unit: "lb" },
    startingWeightKg: { value: 50, unit: "kg" }
  },
  sumoDeadlift: {
    id: "sumoDeadlift",
    name: "Sumo Deadlift",
    defaultWarmup: 95,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 175, unit: "lb" },
    startingWeightKg: { value: 77.5, unit: "kg" }
  },
  sumoDeadliftHighPull: {
    id: "sumoDeadliftHighPull",
    name: "Sumo Deadlift High Pull",
    defaultWarmup: 95,
    defaultEquipment: "barbell",
    types: ["upper", "lower", "pull"],
    startingWeightLb: { value: 85, unit: "lb" },
    startingWeightKg: { value: 37.5, unit: "kg" }
  },
  superman: {
    id: "superman",
    name: "Superman",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  tBarRow: {
    id: "tBarRow",
    name: "T Bar Row",
    defaultWarmup: 10,
    defaultEquipment: "leverageMachine",
    types: ["upper", "pull"],
    startingWeightLb: { value: 90, unit: "lb" },
    startingWeightKg: { value: 40, unit: "kg" }
  },
  thruster: {
    id: "thruster",
    name: "Thruster",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["upper", "lower", "push"],
    startingWeightLb: { value: 65, unit: "lb" },
    startingWeightKg: { value: 27.5, unit: "kg" }
  },
  toesToBar: {
    id: "toesToBar",
    name: "Toes To Bar",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  torsoRotation: {
    id: "torsoRotation",
    name: "Torso Rotation",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  trapBarDeadlift: {
    id: "trapBarDeadlift",
    name: "Trap Bar Deadlift",
    defaultWarmup: 10,
    defaultEquipment: "trapbar",
    types: ["lower", "legs"],
    startingWeightLb: { value: 185, unit: "lb" },
    startingWeightKg: { value: 82.5, unit: "kg" }
  },
  tricepsDip: {
    id: "tricepsDip",
    name: "Triceps Dip",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  tricepsExtension: {
    id: "tricepsExtension",
    name: "Triceps Extension",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "push"],
    startingWeightLb: { value: 20, unit: "lb" },
    startingWeightKg: { value: 7.5, unit: "kg" }
  },
  tricepsPushdown: {
    id: "tricepsPushdown",
    name: "Triceps Pushdown",
    defaultWarmup: 10,
    defaultEquipment: "cable",
    types: ["upper", "push"],
    startingWeightLb: { value: 40, unit: "lb" },
    startingWeightKg: { value: 17.5, unit: "kg" }
  },
  uprightRow: {
    id: "uprightRow",
    name: "Upright Row",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 20, unit: "lb" },
    startingWeightKg: { value: 7.5, unit: "kg" }
  },
  vUp: {
    id: "vUp",
    name: "V Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  widePullUp: {
    id: "widePullUp",
    name: "Wide Pull Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  wristCurl: {
    id: "wristCurl",
    name: "Wrist Curl",
    defaultWarmup: 10,
    defaultEquipment: "barbell",
    types: ["upper", "pull"],
    startingWeightLb: { value: 25, unit: "lb" },
    startingWeightKg: { value: 10, unit: "kg" }
  },
  wristRoller: {
    id: "wristRoller",
    name: "Wrist Roller",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  zercherSquat: {
    id: "zercherSquat",
    name: "Zercher Squat",
    defaultWarmup: 45,
    defaultEquipment: "barbell",
    types: ["lower", "legs"],
    startingWeightLb: { value: 105, unit: "lb" },
    startingWeightKg: { value: 47.5, unit: "kg" }
  },
  wallPushup: {
    id: "wallPushup",
    name: "Wall Push Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  inclinePushup: {
    id: "inclinePushup",
    name: "Incline Push Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  kneePushup: {
    id: "kneePushup",
    name: "Knee Push Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  diamondPushup: {
    id: "diamondPushup",
    name: "Diamond Push Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  pseudoPlanchePushup: {
    id: "pseudoPlanchePushup",
    name: "Pseudo Planche Push Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  pikePushup: {
    id: "pikePushup",
    name: "Pike Push Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  ringDip: {
    id: "ringDip",
    name: "Ring Dip",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  negativeDip: {
    id: "negativeDip",
    name: "Negative Dip",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  verticalRow: {
    id: "verticalRow",
    name: "Vertical Row",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  wideRow: {
    id: "wideRow",
    name: "Wide Row",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  ringRow: {
    id: "ringRow",
    name: "Ring Row",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  tuckFrontLeverRow: {
    id: "tuckFrontLeverRow",
    name: "Tuck Front Lever Row",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  frontLeverRow: {
    id: "frontLeverRow",
    name: "Front Lever Row",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  scapularPullUp: {
    id: "scapularPullUp",
    name: "Scapular Pull Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  deadHang: {
    id: "deadHang",
    name: "Dead Hang",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  negativePullup: {
    id: "negativePullup",
    name: "Negative Pull Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  assistedSquat: {
    id: "assistedSquat",
    name: "Assisted Squat",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  shrimpSquat: {
    id: "shrimpSquat",
    name: "Shrimp Squat",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  nordicCurl: {
    id: "nordicCurl",
    name: "Nordic Curl",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["lower", "legs"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  handstand: {
    id: "handstand",
    name: "Handstand",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  wallHandstand: {
    id: "wallHandstand",
    name: "Wall Handstand",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  crowPose: {
    id: "crowPose",
    name: "Crow Pose",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  dragonFlag: {
    id: "dragonFlag",
    name: "Dragon Flag",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  copenhagenPlank: {
    id: "copenhagenPlank",
    name: "Copenhagen Plank",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  hangingKneeRaise: {
    id: "hangingKneeRaise",
    name: "Hanging Knee Raise",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  archHang: {
    id: "archHang",
    name: "Arch Hang",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  supportHold: {
    id: "supportHold",
    name: "Support Hold",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "push"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  pallofPress: {
    id: "pallofPress",
    name: "Pallof Press",
    defaultWarmup: 10,
    defaultEquipment: "band",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  renegadeRow: {
    id: "renegadeRow",
    name: "Renegade Row",
    defaultWarmup: 10,
    defaultEquipment: "dumbbell",
    types: ["upper", "pull", "core"],
    startingWeightLb: { value: 20, unit: "lb" },
    startingWeightKg: { value: 10, unit: "kg" }
  },
  ringAbRollout: {
    id: "ringAbRollout",
    name: "Ring Ab Rollout",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  kneelingRingAbRollout: {
    id: "kneelingRingAbRollout",
    name: "Kneeling Ring Ab Rollout",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  archerPullUp: {
    id: "archerPullUp",
    name: "Archer Pull Up",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  skinTheCat: {
    id: "skinTheCat",
    name: "Skin the Cat",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["upper", "pull", "core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  hollowBodyHold: {
    id: "hollowBodyHold",
    name: "Hollow Body Hold",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  deadBug: {
    id: "deadBug",
    name: "Dead Bug",
    defaultWarmup: 10,
    defaultEquipment: "bodyweight",
    types: ["core"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  },
  shoulderPassThrough: {
    id: "shoulderPassThrough",
    name: "Shoulder Pass Through",
    defaultWarmup: 10,
    defaultEquipment: "band",
    types: ["upper"],
    startingWeightLb: { value: 0, unit: "lb" },
    startingWeightKg: { value: 0, unit: "kg" }
  }
};
var nameToIdMapping = ObjectUtils_keys(allExercisesList).reduce(
  (acc, key) => {
    acc[allExercisesList[key].name.toLowerCase()] = allExercisesList[key].id;
    return acc;
  },
  // Null-prototype so arbitrary exercise names (e.g. "constructor", "__proto__") can't resolve to inherited props.
  /* @__PURE__ */ Object.create(null)
);
var metadata = {
  abWheel: {
    targetMuscles: ["Iliopsoas"],
    synergistMuscles: [
      "Adductor Brevis",
      "Adductor Longus",
      "Deltoid Posterior",
      "Latissimus Dorsi",
      "Pectineous",
      "Pectoralis Major Sternal Head",
      "Sartorius",
      "Serratus Anterior",
      "Tensor Fasciae Latae",
      "Teres Major"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  arnoldPress: {
    targetMuscles: ["Deltoid Anterior"],
    synergistMuscles: [
      "Deltoid Lateral",
      "Serratus Anterior",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Triceps Brachii"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["dumbbell", "kettlebell"]
  },
  aroundTheWorld: {
    targetMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Pectoralis Major Sternal Head"],
    synergistMuscles: ["Deltoid Lateral", "Deltoid Posterior", "Latissimus Dorsi", "Serratus Anterior"],
    bodyParts: ["Chest", "Shoulders"],
    sortedEquipment: ["dumbbell"]
  },
  backExtension: {
    targetMuscles: ["Erector Spinae"],
    synergistMuscles: ["Adductor Magnus", "Gluteus Maximus", "Hamstrings"],
    bodyParts: ["Hips"],
    sortedEquipment: ["bodyweight", "leverageMachine"]
  },
  ballSlams: {
    targetMuscles: [
      "Infraspinatus",
      "Latissimus Dorsi",
      "Teres Major",
      "Teres Minor",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Rectus Abdominis"],
    bodyParts: ["Back"],
    sortedEquipment: ["medicineball"]
  },
  battleRopes: {
    targetMuscles: ["Deltoid Posterior"],
    synergistMuscles: [
      "Brachialis",
      "Brachioradialis",
      "Deltoid Lateral",
      "Infraspinatus",
      "Teres Minor",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["bodyweight"]
  },
  behindTheNeckPress: {
    targetMuscles: ["Deltoid Anterior"],
    synergistMuscles: [
      "Deltoid Lateral",
      "Serratus Anterior",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Triceps Brachii"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["barbell"]
  },
  benchDip: {
    targetMuscles: ["Triceps Brachii"],
    synergistMuscles: [
      "Deltoid Anterior",
      "Latissimus Dorsi",
      "Levator Scapulae",
      "Pectoralis Major Clavicular Head",
      "Pectoralis Major Sternal Head",
      "Serratus Anterior",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Upper Arms"],
    sortedEquipment: ["bodyweight"]
  },
  benchPress: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Triceps Brachii"],
    bodyParts: ["Chest"],
    sortedEquipment: ["barbell", "cable", "dumbbell", "smith", "band", "kettlebell"]
  },
  benchPressCloseGrip: {
    targetMuscles: ["Triceps Brachii"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Pectoralis Major Sternal Head"],
    bodyParts: ["Upper Arms"],
    sortedEquipment: ["barbell", "ezbar", "smith"]
  },
  benchPressWideGrip: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Triceps Brachii"],
    bodyParts: ["Chest"],
    sortedEquipment: ["barbell", "smith"]
  },
  bentOverOneArmRow: {
    targetMuscles: ["Latissimus Dorsi", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Infraspinatus",
      "Teres Major",
      "Teres Minor",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Pectoralis Major Sternal Head"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["dumbbell"]
  },
  bentOverRow: {
    targetMuscles: ["Latissimus Dorsi", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Infraspinatus",
      "Pectoralis Major Sternal Head",
      "Teres Major",
      "Teres Minor"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["barbell", "cable", "dumbbell", "band", "leverageMachine", "smith"]
  },
  bicepCurl: {
    targetMuscles: ["Biceps Brachii"],
    synergistMuscles: ["Brachialis", "Brachioradialis"],
    bodyParts: ["Upper Arms"],
    sortedEquipment: ["barbell", "dumbbell", "band", "leverageMachine", "cable", "ezbar"]
  },
  bicycleCrunch: {
    targetMuscles: ["Obliques", "Rectus Abdominis"],
    synergistMuscles: ["Gluteus Maximus", "Iliopsoas", "Quadriceps"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  boxJump: {
    targetMuscles: ["Quadriceps", "Gluteus Maximus", "Gastrocnemius", "Soleus"],
    synergistMuscles: ["Hamstrings", "Adductor Magnus", "Erector Spinae", "Rectus Abdominis"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  boxSquat: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Adductor Magnus", "Quadriceps", "Soleus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["barbell", "dumbbell"]
  },
  bulgarianSplitSquat: {
    targetMuscles: ["Quadriceps"],
    synergistMuscles: ["Adductor Magnus", "Gluteus Maximus", "Soleus"],
    bodyParts: ["Hips", "Thighs"],
    sortedEquipment: ["dumbbell"]
  },
  burpee: {
    targetMuscles: [
      "Quadriceps",
      "Gluteus Maximus",
      "Pectoralis Major Clavicular Head",
      "Pectoralis Major Sternal Head",
      "Triceps Brachii",
      "Deltoid Anterior",
      "Deltoid Lateral",
      "Deltoid Posterior",
      "Rectus Abdominis"
    ],
    synergistMuscles: [
      "Hamstrings",
      "Biceps Brachii",
      "Brachialis",
      "Latissimus Dorsi",
      "Obliques",
      "Erector Spinae",
      "Obliques",
      "Soleus",
      "Gastrocnemius",
      "Tibialis Anterior"
    ],
    bodyParts: ["Chest", "Shoulders", "Upper Arms", "Waist", "Thighs"],
    sortedEquipment: ["bodyweight"]
  },
  cableCrossover: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: ["Deltoid Anterior", "Latissimus Dorsi", "Levator Scapulae", "Pectoralis Major Clavicular Head"],
    bodyParts: ["Chest"],
    sortedEquipment: ["cable"]
  },
  cableCrunch: {
    targetMuscles: ["Rectus Abdominis"],
    synergistMuscles: ["Obliques"],
    bodyParts: ["Waist"],
    sortedEquipment: ["cable"]
  },
  cableKickback: {
    targetMuscles: ["Triceps Brachii"],
    synergistMuscles: [],
    bodyParts: ["Upper Arms"],
    sortedEquipment: ["cable"]
  },
  cablePullThrough: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Adductor Magnus", "Hamstrings"],
    bodyParts: ["Hips"],
    sortedEquipment: ["cable"]
  },
  cableTwist: {
    targetMuscles: ["Obliques"],
    synergistMuscles: [
      "Adductor Brevis",
      "Adductor Longus",
      "Adductor Magnus",
      "Erector Spinae",
      "Gluteus Medius",
      "Iliopsoas",
      "Tensor Fasciae Latae"
    ],
    bodyParts: ["Waist"],
    sortedEquipment: ["barbell", "bodyweight", "cable", "leverageMachine", "band"]
  },
  calfPressOnLegPress: {
    targetMuscles: ["Gastrocnemius"],
    synergistMuscles: ["Soleus"],
    bodyParts: ["Calves"],
    sortedEquipment: ["leverageMachine"]
  },
  calfPressOnSeatedLegPress: {
    targetMuscles: ["Gastrocnemius"],
    synergistMuscles: ["Soleus"],
    bodyParts: ["Calves"],
    sortedEquipment: ["leverageMachine"]
  },
  chestDip: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: [
      "Deltoid Anterior",
      "Latissimus Dorsi",
      "Levator Scapulae",
      "Pectoralis Major Clavicular Head",
      "Serratus Anterior",
      "Teres Major",
      "Trapezius Middle Fibers",
      "Triceps Brachii"
    ],
    bodyParts: ["Chest"],
    sortedEquipment: ["bodyweight"]
  },
  chestFly: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: ["Biceps Brachii", "Deltoid Anterior", "Pectoralis Major Clavicular Head"],
    bodyParts: ["Chest"],
    sortedEquipment: ["barbell", "cable", "dumbbell", "leverageMachine"]
  },
  chestPress: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Triceps Brachii"],
    bodyParts: ["Chest"],
    sortedEquipment: ["leverageMachine", "band"]
  },
  chestSupportedRow: {
    targetMuscles: ["Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Infraspinatus",
      "Latissimus Dorsi",
      "Pectoralis Major Sternal Head",
      "Teres Major",
      "Teres Minor"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["barbell", "dumbbell"]
  },
  chinUp: {
    targetMuscles: ["Latissimus Dorsi"],
    synergistMuscles: [
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Levator Scapulae",
      "Pectoralis Major Sternal Head",
      "Teres Major",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["leverageMachine", "bodyweight"]
  },
  clean: {
    targetMuscles: [
      "Gluteus Maximus",
      "Hamstrings",
      "Quadriceps",
      "Latissimus Dorsi",
      "Trapezius Lower Fibers",
      "Deltoid Anterior",
      "Deltoid Lateral"
    ],
    synergistMuscles: [
      "Adductor Magnus",
      "Gastrocnemius",
      "Soleus",
      "Erector Spinae",
      "Biceps Brachii",
      "Pectoralis Major Clavicular Head",
      "Pectoralis Major Sternal Head",
      "Wrist Flexors"
    ],
    bodyParts: ["Hips", "Thighs", "Back", "Shoulders"],
    sortedEquipment: ["barbell"]
  },
  cleanandJerk: {
    targetMuscles: [
      "Gluteus Maximus",
      "Hamstrings",
      "Quadriceps",
      "Latissimus Dorsi",
      "Trapezius Lower Fibers",
      "Deltoid Anterior",
      "Deltoid Lateral"
    ],
    synergistMuscles: [
      "Adductor Magnus",
      "Gastrocnemius",
      "Soleus",
      "Erector Spinae",
      "Biceps Brachii",
      "Pectoralis Major Clavicular Head",
      "Pectoralis Major Sternal Head",
      "Wrist Flexors"
    ],
    bodyParts: ["Hips", "Thighs", "Back", "Shoulders"],
    sortedEquipment: ["barbell"]
  },
  concentrationCurl: {
    targetMuscles: ["Brachialis"],
    synergistMuscles: ["Biceps Brachii", "Brachioradialis"],
    bodyParts: ["Upper Arms"],
    sortedEquipment: ["barbell", "dumbbell", "band", "cable"]
  },
  crossBodyCrunch: {
    targetMuscles: ["Obliques"],
    synergistMuscles: ["Iliopsoas", "Rectus Abdominis"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  crunch: {
    targetMuscles: ["Rectus Abdominis"],
    synergistMuscles: ["Obliques"],
    bodyParts: ["Waist"],
    sortedEquipment: ["cable", "bodyweight", "leverageMachine"]
  },
  cycling: {
    targetMuscles: ["Quadriceps", "Hamstrings", "Gluteus Maximus", "Gastrocnemius", "Soleus", "Tibialis Anterior"],
    synergistMuscles: [
      "Adductor Magnus",
      "Adductor Longus",
      "Adductor Brevis",
      "Iliopsoas",
      "Erector Spinae",
      "Rectus Abdominis",
      "Obliques"
    ],
    bodyParts: ["Hips", "Thighs", "Calves", "Shins", "Back", "Waist"],
    sortedEquipment: ["bodyweight"]
  },
  deadlift: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Adductor Magnus", "Hamstrings", "Quadriceps", "Soleus"],
    bodyParts: ["Hips"],
    sortedEquipment: ["barbell", "cable", "dumbbell", "leverageMachine", "smith", "band", "kettlebell", "bodyweight"]
  },
  deadliftHighPull: {
    targetMuscles: ["Deltoid Lateral", "Gluteus Maximus", "Quadriceps"],
    synergistMuscles: [
      "Adductor Magnus",
      "Biceps Brachii",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Anterior",
      "Gastrocnemius",
      "Infraspinatus",
      "Soleus",
      "Teres Minor",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["barbell"]
  },
  declineBenchPress: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Triceps Brachii"],
    bodyParts: ["Chest"],
    sortedEquipment: ["dumbbell", "smith"]
  },
  declineCrunch: {
    targetMuscles: ["Rectus Abdominis"],
    synergistMuscles: ["Obliques"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  deficitDeadlift: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Adductor Magnus", "Erector Spinae", "Hamstrings", "Quadriceps", "Soleus"],
    bodyParts: ["Hips"],
    sortedEquipment: ["barbell", "trapbar"]
  },
  ellipticalMachine: {
    targetMuscles: [],
    synergistMuscles: [
      "Biceps Brachii",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Anterior",
      "Deltoid Lateral",
      "Deltoid Posterior",
      "Gluteus Maximus",
      "Hamstrings",
      "Latissimus Dorsi",
      "Levator Scapulae",
      "Pectoralis Major Clavicular Head",
      "Pectoralis Major Sternal Head",
      "Quadriceps",
      "Serratus Anterior"
    ],
    bodyParts: ["Hips", "Thighs", "Back", "Shoulders"],
    sortedEquipment: ["leverageMachine"]
  },
  facePull: {
    targetMuscles: ["Deltoid Posterior"],
    synergistMuscles: [
      "Brachialis",
      "Brachioradialis",
      "Deltoid Lateral",
      "Infraspinatus",
      "Teres Minor",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["band"]
  },
  flatKneeRaise: {
    targetMuscles: ["Iliopsoas"],
    synergistMuscles: ["Adductor Brevis", "Adductor Longus", "Pectineous", "Sartorius", "Tensor Fasciae Latae"],
    bodyParts: ["Hips"],
    sortedEquipment: ["bodyweight"]
  },
  flatLegRaise: {
    targetMuscles: ["Iliopsoas"],
    synergistMuscles: [
      "Adductor Brevis",
      "Adductor Longus",
      "Pectineous",
      "Quadriceps",
      "Sartorius",
      "Tensor Fasciae Latae"
    ],
    bodyParts: ["Hips", "Waist"],
    sortedEquipment: ["bodyweight"]
  },
  frontRaise: {
    targetMuscles: ["Deltoid Anterior"],
    synergistMuscles: [
      "Deltoid Lateral",
      "Pectoralis Major Clavicular Head",
      "Serratus Anterior",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["barbell", "cable", "dumbbell", "bodyweight", "band"]
  },
  gluteBridge: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Quadriceps"],
    bodyParts: ["Hips"],
    sortedEquipment: ["band", "barbell", "dumbbell"]
  },
  gluteBridgeMarch: {
    targetMuscles: ["Gluteus Maximus", "Rectus Abdominis"],
    synergistMuscles: ["Hamstrings", "Quadriceps", "Sartorius"],
    bodyParts: ["Hips"],
    sortedEquipment: ["bodyweight"]
  },
  gluteKickback: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Adductor Magnus"],
    bodyParts: ["Glute"],
    sortedEquipment: ["leverageMachine", "bodyweight", "cable", "band"]
  },
  frontSquat: {
    targetMuscles: ["Quadriceps"],
    synergistMuscles: ["Adductor Magnus", "Gluteus Maximus", "Soleus"],
    bodyParts: ["Hips"],
    sortedEquipment: ["barbell", "kettlebell", "dumbbell", "cable", "smith"]
  },
  gobletSquat: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Adductor Magnus", "Quadriceps", "Soleus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["kettlebell", "dumbbell"]
  },
  goodMorning: {
    targetMuscles: ["Hamstrings"],
    synergistMuscles: ["Adductor Magnus", "Gluteus Maximus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["barbell", "smith", "leverageMachine"]
  },
  hackSquat: {
    targetMuscles: ["Quadriceps"],
    synergistMuscles: ["Adductor Magnus", "Gluteus Maximus", "Soleus"],
    bodyParts: ["Hips"],
    sortedEquipment: ["barbell", "smith"]
  },
  hammerCurl: {
    targetMuscles: ["Brachioradialis"],
    synergistMuscles: ["Biceps Brachii", "Brachialis"],
    bodyParts: ["Forearms"],
    sortedEquipment: ["cable", "dumbbell", "band"]
  },
  handstandPushUp: {
    targetMuscles: ["Deltoid Anterior"],
    synergistMuscles: [
      "Deltoid Lateral",
      "Pectoralis Major Clavicular Head",
      "Serratus Anterior",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Triceps Brachii"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["bodyweight"]
  },
  hangClean: {
    targetMuscles: ["Biceps Brachii", "Brachialis", "Brachioradialis"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head"],
    bodyParts: ["Forearms"],
    sortedEquipment: ["kettlebell"]
  },
  hangSnatch: {
    targetMuscles: [
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Trapezius Upper Fibers",
      "Quadriceps",
      "Gluteus Maximus"
    ],
    synergistMuscles: [
      "Hamstrings",
      "Erector Spinae",
      "Deltoid Anterior",
      "Deltoid Lateral",
      "Deltoid Posterior",
      "Latissimus Dorsi",
      "Biceps Brachii",
      "Brachialis",
      "Brachioradialis",
      "Gastrocnemius",
      "Soleus",
      "Obliques",
      "Rectus Abdominis"
    ],
    bodyParts: ["Thighs", "Back", "Shoulders"],
    sortedEquipment: ["barbell"]
  },
  hangingLegRaise: {
    targetMuscles: ["Iliopsoas"],
    synergistMuscles: ["Adductor Brevis", "Adductor Longus", "Pectineous", "Sartorius", "Tensor Fasciae Latae"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight", "cable"]
  },
  highKneeSkips: {
    targetMuscles: ["Quadriceps", "Hamstrings", "Gluteus Maximus"],
    synergistMuscles: [
      "Iliopsoas",
      "Gastrocnemius",
      "Soleus",
      "Tibialis Anterior",
      "Rectus Abdominis",
      "Obliques",
      "Adductor Magnus",
      "Adductor Brevis",
      "Adductor Longus"
    ],
    bodyParts: ["Thighs", "Hips"],
    sortedEquipment: ["bodyweight"]
  },
  highRow: {
    targetMuscles: ["Latissimus Dorsi", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Erector Spinae",
      "Infraspinatus",
      "Pectoralis Major Sternal Head",
      "Teres Major",
      "Teres Minor"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["leverageMachine"]
  },
  hipAbductor: {
    targetMuscles: ["Gluteus Maximus", "Gluteus Medius"],
    synergistMuscles: ["Tensor Fasciae Latae"],
    bodyParts: ["Hips"],
    sortedEquipment: ["leverageMachine", "bodyweight", "cable", "band"]
  },
  hipAdductor: {
    targetMuscles: ["Adductor Brevis", "Adductor Longus", "Adductor Magnus"],
    synergistMuscles: ["Pectineous"],
    bodyParts: ["Hips"],
    sortedEquipment: ["leverageMachine", "cable", "band", "bodyweight"]
  },
  hipThrust: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Quadriceps"],
    bodyParts: ["Hips"],
    sortedEquipment: ["barbell", "leverageMachine", "band", "bodyweight"]
  },
  inclineBenchPress: {
    targetMuscles: ["Pectoralis Major Clavicular Head"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Sternal Head", "Triceps Brachii"],
    bodyParts: ["Chest"],
    sortedEquipment: ["barbell", "cable", "dumbbell", "smith"]
  },
  inclineBenchPressWideGrip: {
    targetMuscles: ["Pectoralis Major Clavicular Head"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Sternal Head", "Triceps Brachii"],
    bodyParts: ["Chest"],
    sortedEquipment: ["barbell"]
  },
  inclineChestFly: {
    targetMuscles: ["Pectoralis Major Clavicular Head"],
    synergistMuscles: ["Biceps Brachii", "Deltoid Anterior", "Pectoralis Major Sternal Head"],
    bodyParts: ["Chest"],
    sortedEquipment: ["cable", "dumbbell"]
  },
  inclineChestPress: {
    targetMuscles: ["Pectoralis Major Clavicular Head"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Sternal Head", "Triceps Brachii"],
    bodyParts: ["Chest"],
    sortedEquipment: ["leverageMachine", "band", "dumbbell"]
  },
  inclineCurl: {
    targetMuscles: ["Biceps Brachii"],
    synergistMuscles: ["Brachialis", "Brachioradialis"],
    bodyParts: ["Upper Arms"],
    sortedEquipment: ["dumbbell"]
  },
  inclineRow: {
    targetMuscles: ["Latissimus Dorsi", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Infraspinatus",
      "Pectoralis Major Sternal Head",
      "Teres Major",
      "Teres Minor"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["barbell", "bodyweight", "dumbbell"]
  },
  invertedRow: {
    targetMuscles: ["Latissimus Dorsi", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Infraspinatus",
      "Teres Major",
      "Teres Minor",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Pectoralis Major Sternal Head"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  isoLateralChestPress: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Triceps Brachii"],
    bodyParts: ["Chest"],
    sortedEquipment: ["dumbbell"]
  },
  isoLateralRow: {
    targetMuscles: ["Latissimus Dorsi", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Infraspinatus",
      "Pectoralis Major Sternal Head",
      "Teres Major",
      "Teres Minor"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["dumbbell"]
  },
  jackknifeSitUp: {
    targetMuscles: ["Rectus Abdominis"],
    synergistMuscles: ["Iliopsoas", "Obliques", "Quadriceps", "Sartorius", "Tensor Fasciae Latae"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  jumpRope: {
    targetMuscles: ["Soleus", "Gastrocnemius", "Quadriceps", "Hamstrings"],
    synergistMuscles: ["Gluteus Maximus", "Rectus Abdominis", "Obliques", "Tibialis Anterior"],
    bodyParts: ["Thighs", "Calves"],
    sortedEquipment: ["bodyweight"]
  },
  jumpSquat: {
    targetMuscles: ["Gluteus Maximus", "Quadriceps"],
    synergistMuscles: ["Adductor Magnus", "Gastrocnemius", "Soleus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["barbell", "bodyweight"]
  },
  jumpingJack: {
    targetMuscles: [
      "Gluteus Maximus",
      "Quadriceps",
      "Adductor Brevis",
      "Adductor Longus",
      "Adductor Magnus",
      "Deltoid Anterior",
      "Deltoid Lateral",
      "Deltoid Posterior"
    ],
    synergistMuscles: [
      "Gastrocnemius",
      "Soleus",
      "Hamstrings",
      "Rectus Abdominis",
      "Obliques",
      "Trapezius Upper Fibers",
      "Serratus Anterior"
    ],
    bodyParts: ["Thighs"],
    sortedEquipment: ["bodyweight"]
  },
  kettlebellSwing: {
    targetMuscles: ["Deltoid Anterior", "Gluteus Maximus"],
    synergistMuscles: [
      "Adductor Magnus",
      "Hamstrings",
      "Pectoralis Major Clavicular Head",
      "Serratus Anterior",
      "Soleus"
    ],
    bodyParts: ["Hips", "Shoulders"],
    sortedEquipment: ["dumbbell", "kettlebell"]
  },
  kettlebellTurkishGetUp: {
    targetMuscles: ["Deltoid Anterior", "Deltoid Lateral", "Deltoid Posterior", "Quadriceps", "Gluteus Maximus"],
    synergistMuscles: [
      "Obliques",
      "Rectus Abdominis",
      "Latissimus Dorsi",
      "Hamstrings",
      "Adductor Brevis",
      "Adductor Longus",
      "Adductor Magnus",
      "Triceps Brachii",
      "Erector Spinae",
      "Serratus Anterior"
    ],
    bodyParts: ["Hips", "Shoulders"],
    sortedEquipment: ["kettlebell"]
  },
  kippingPullUp: {
    targetMuscles: [
      "Latissimus Dorsi",
      "Brachialis",
      "Biceps Brachii",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    synergistMuscles: [
      "Deltoid Posterior",
      "Brachioradialis",
      "Pectoralis Major Sternal Head",
      "Rectus Abdominis",
      "Obliques",
      "Iliopsoas",
      "Tensor Fasciae Latae",
      "Adductor Longus",
      "Adductor Brevis",
      "Erector Spinae"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  kneeRaise: {
    targetMuscles: ["Iliopsoas"],
    synergistMuscles: ["Adductor Brevis", "Adductor Longus", "Pectineous", "Sartorius", "Tensor Fasciae Latae"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  kneelingPulldown: {
    targetMuscles: ["Latissimus Dorsi"],
    synergistMuscles: [
      "Biceps Brachii",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Levator Scapulae",
      "Pectoralis Major Sternal Head",
      "Serratus Anterior",
      "Teres Major",
      "Trapezius Middle Fibers",
      "Triceps Brachii"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["band"]
  },
  kneestoElbows: {
    targetMuscles: ["Rectus Abdominis"],
    synergistMuscles: [
      "Adductor Brevis",
      "Adductor Longus",
      "Iliopsoas",
      "Obliques",
      "Pectineous",
      "Sartorius",
      "Tensor Fasciae Latae"
    ],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  latPulldown: {
    targetMuscles: ["Latissimus Dorsi"],
    synergistMuscles: [
      "Biceps Brachii",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Infraspinatus",
      "Levator Scapulae",
      "Teres Major",
      "Teres Minor",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["cable"]
  },
  lateralBoxJump: {
    targetMuscles: ["Gluteus Maximus", "Quadriceps", "Hamstrings"],
    synergistMuscles: [
      "Adductor Brevis",
      "Adductor Longus",
      "Adductor Magnus",
      "Gluteus Medius",
      "Tensor Fasciae Latae",
      "Rectus Abdominis",
      "Obliques",
      "Deltoid Anterior",
      "Deltoid Posterior",
      "Deltoid Lateral"
    ],
    bodyParts: ["Thighs"],
    sortedEquipment: ["bodyweight"]
  },
  lateralRaise: {
    targetMuscles: ["Deltoid Lateral"],
    synergistMuscles: ["Deltoid Anterior", "Serratus Anterior", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["cable", "dumbbell", "leverageMachine", "band", "kettlebell"]
  },
  legsUpBenchPress: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Triceps Brachii"],
    bodyParts: ["Chest"],
    sortedEquipment: ["barbell"]
  },
  legCurl: {
    targetMuscles: ["Hamstrings"],
    synergistMuscles: ["Gastrocnemius", "Sartorius"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["leverageMachine"]
  },
  legExtension: {
    targetMuscles: ["Quadriceps"],
    synergistMuscles: [],
    bodyParts: ["Thighs"],
    sortedEquipment: ["leverageMachine", "band"]
  },
  legPress: {
    targetMuscles: ["Quadriceps"],
    synergistMuscles: ["Adductor Magnus", "Gluteus Maximus", "Soleus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["smith", "leverageMachine"]
  },
  lunge: {
    targetMuscles: ["Quadriceps"],
    synergistMuscles: ["Adductor Magnus", "Gluteus Maximus", "Soleus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["barbell", "dumbbell", "bodyweight", "cable"]
  },
  lyingBicepCurl: {
    targetMuscles: ["Biceps Brachii"],
    synergistMuscles: ["Brachialis", "Brachioradialis"],
    bodyParts: ["Upper Arms"],
    sortedEquipment: ["barbell", "dumbbell", "band", "leverageMachine", "cable", "ezbar"]
  },
  lyingLegCurl: {
    targetMuscles: ["Hamstrings"],
    synergistMuscles: ["Gastrocnemius", "Sartorius"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["leverageMachine", "band"]
  },
  mountainClimber: {
    targetMuscles: ["Iliopsoas"],
    synergistMuscles: ["Adductor Brevis", "Adductor Longus", "Pectineous", "Sartorius", "Tensor Fasciae Latae"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  muscleUp: {
    targetMuscles: [
      "Biceps Brachii",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Infraspinatus",
      "Latissimus Dorsi",
      "Pectoralis Major Sternal Head",
      "Teres Major",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Triceps Brachii"
    ],
    synergistMuscles: [],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  obliqueCrunch: {
    targetMuscles: ["Obliques"],
    synergistMuscles: ["Rectus Abdominis"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  overheadPress: {
    targetMuscles: ["Deltoid Anterior"],
    synergistMuscles: [
      "Deltoid Lateral",
      "Pectoralis Major Clavicular Head",
      "Serratus Anterior",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Triceps Brachii"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["barbell", "dumbbell", "ezbar"]
  },
  overheadSquat: {
    targetMuscles: ["Quadriceps"],
    synergistMuscles: ["Adductor Magnus", "Gluteus Maximus", "Soleus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["barbell", "dumbbell"]
  },
  pecDeck: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: ["Pectoralis Major Clavicular Head", "Serratus Anterior"],
    bodyParts: ["Chest"],
    sortedEquipment: ["leverageMachine"]
  },
  pendlayRow: {
    targetMuscles: [
      "Deltoid Posterior",
      "Infraspinatus",
      "Latissimus Dorsi",
      "Teres Major",
      "Teres Minor",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    synergistMuscles: ["Brachialis", "Brachioradialis", "Pectoralis Major Sternal Head"],
    bodyParts: ["Back"],
    sortedEquipment: ["barbell"]
  },
  pistolSquat: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Adductor Magnus", "Quadriceps", "Soleus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["kettlebell", "leverageMachine", "bodyweight"]
  },
  plank: {
    targetMuscles: ["Rectus Abdominis"],
    synergistMuscles: [],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  powerClean: {
    targetMuscles: ["Quadriceps", "Gluteus Maximus", "Deltoid Anterior"],
    synergistMuscles: [
      "Hamstrings",
      "Gastrocnemius",
      "Soleus",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Trapezius Upper Fibers",
      "Latissimus Dorsi",
      "Erector Spinae",
      "Biceps Brachii",
      "Wrist Flexors",
      "Rectus Abdominis",
      "Obliques"
    ],
    bodyParts: ["Thighs"],
    sortedEquipment: ["barbell"]
  },
  powerSnatch: {
    targetMuscles: ["Quadriceps", "Gluteus Maximus", "Deltoid Anterior", "Deltoid Lateral", "Deltoid Posterior"],
    synergistMuscles: [
      "Hamstrings",
      "Gastrocnemius",
      "Soleus",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Trapezius Upper Fibers",
      "Latissimus Dorsi",
      "Erector Spinae",
      "Biceps Brachii",
      "Wrist Flexors",
      "Rectus Abdominis",
      "Obliques"
    ],
    bodyParts: ["Thighs"],
    sortedEquipment: ["barbell"]
  },
  preacherCurl: {
    targetMuscles: ["Brachialis"],
    synergistMuscles: ["Biceps Brachii", "Brachioradialis"],
    bodyParts: ["Upper Arms"],
    sortedEquipment: ["barbell", "dumbbell", "ezbar", "leverageMachine"]
  },
  pressUnder: {
    targetMuscles: ["Quadriceps", "Deltoid Anterior", "Deltoid Lateral", "Deltoid Posterior"],
    synergistMuscles: [
      "Gluteus Maximus",
      "Hamstrings",
      "Erector Spinae",
      "Rectus Abdominis",
      "Obliques",
      "Triceps Brachii",
      "Biceps Brachii"
    ],
    bodyParts: ["Thighs"],
    sortedEquipment: ["barbell"]
  },
  pullUp: {
    targetMuscles: ["Latissimus Dorsi"],
    synergistMuscles: [
      "Biceps Brachii",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Infraspinatus",
      "Levator Scapulae",
      "Teres Major",
      "Teres Minor",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["leverageMachine", "bodyweight", "band"]
  },
  pullover: {
    targetMuscles: ["Latissimus Dorsi"],
    synergistMuscles: [
      "Deltoid Posterior",
      "Levator Scapulae",
      "Pectoralis Major Sternal Head",
      "Serratus Anterior",
      "Teres Major",
      "Trapezius Middle Fibers",
      "Triceps Brachii"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["barbell", "dumbbell"]
  },
  pushPress: {
    targetMuscles: ["Deltoid Anterior"],
    synergistMuscles: [
      "Biceps Brachii",
      "Brachialis",
      "Deltoid Lateral",
      "Pectoralis Major Clavicular Head",
      "Serratus Anterior"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["bodyweight", "kettlebell"]
  },
  pushUp: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Triceps Brachii"],
    bodyParts: ["Chest"],
    sortedEquipment: ["bodyweight", "band"]
  },
  reverseCrunch: {
    targetMuscles: ["Rectus Abdominis"],
    synergistMuscles: ["Iliopsoas", "Obliques"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight", "cable"]
  },
  reverseCurl: {
    targetMuscles: ["Brachioradialis"],
    synergistMuscles: ["Biceps Brachii", "Brachialis"],
    bodyParts: ["Forearms"],
    sortedEquipment: ["barbell", "cable", "dumbbell", "band"]
  },
  reverseFly: {
    targetMuscles: ["Deltoid Posterior"],
    synergistMuscles: [
      "Deltoid Lateral",
      "Infraspinatus",
      "Teres Minor",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["dumbbell", "leverageMachine", "band"]
  },
  reverseGripConcentrationCurl: {
    targetMuscles: ["Brachialis", "Brachioradialis"],
    synergistMuscles: ["Biceps Brachii", "Wrist Flexors"],
    bodyParts: ["Upper Arms"],
    sortedEquipment: ["dumbbell"]
  },
  reverseLatPulldown: {
    targetMuscles: ["Latissimus Dorsi"],
    synergistMuscles: [
      "Biceps Brachii",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Levator Scapulae",
      "Pectoralis Major Sternal Head",
      "Teres Major",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["cable"]
  },
  reverseLunge: {
    targetMuscles: ["Quadriceps"],
    synergistMuscles: ["Adductor Magnus", "Soleus", "Gluteus Maximus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["barbell", "dumbbell", "bodyweight", "cable"]
  },
  reverseWristCurl: {
    targetMuscles: ["Wrist Extensors"],
    synergistMuscles: [],
    bodyParts: ["Forearms"],
    sortedEquipment: ["barbell"]
  },
  reversePlank: {
    targetMuscles: ["Gluteus Maximus", "Rectus Abdominis", "Erector Spinae"],
    synergistMuscles: [
      "Hamstrings",
      "Quadriceps",
      "Deltoid Anterior",
      "Deltoid Lateral",
      "Deltoid Posterior",
      "Triceps Brachii",
      "Latissimus Dorsi",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  romanianDeadlift: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Adductor Magnus", "Erector Spinae", "Hamstrings"],
    bodyParts: ["Hips"],
    sortedEquipment: ["barbell", "dumbbell"]
  },
  reverseHyperextension: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Hamstrings"],
    bodyParts: ["Hips"],
    sortedEquipment: ["band", "bodyweight", "leverageMachine"]
  },
  rowing: {
    targetMuscles: ["Quadriceps", "Latissimus Dorsi", "Erector Spinae"],
    synergistMuscles: [
      "Hamstrings",
      "Gluteus Maximus",
      "Biceps Brachii",
      "Deltoid Anterior",
      "Deltoid Lateral",
      "Deltoid Posterior",
      "Wrist Flexors",
      "Rectus Abdominis",
      "Obliques",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Thighs"],
    sortedEquipment: ["cable"]
  },
  russianTwist: {
    targetMuscles: ["Obliques"],
    synergistMuscles: ["Erector Spinae", "Iliopsoas"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight", "dumbbell", "cable"]
  },
  safetySquatBarSquat: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Adductor Magnus", "Quadriceps", "Soleus"],
    bodyParts: ["Hips"],
    sortedEquipment: ["barbell"]
  },
  seatedCalfRaise: {
    targetMuscles: ["Soleus"],
    synergistMuscles: ["Gastrocnemius"],
    bodyParts: ["Calves"],
    sortedEquipment: ["barbell", "dumbbell", "leverageMachine"]
  },
  seatedFrontRaise: {
    targetMuscles: ["Deltoid Anterior"],
    synergistMuscles: [
      "Deltoid Lateral",
      "Pectoralis Major Clavicular Head",
      "Serratus Anterior",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["barbell", "dumbbell"]
  },
  seatedLegCurl: {
    targetMuscles: ["Hamstrings"],
    synergistMuscles: ["Gastrocnemius", "Sartorius"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["leverageMachine"]
  },
  seatedLegPress: {
    targetMuscles: ["Gluteus Maximus", "Quadriceps"],
    synergistMuscles: ["Adductor Magnus", "Soleus"],
    bodyParts: ["Hips", "Thighs"],
    sortedEquipment: ["leverageMachine"]
  },
  seatedOverheadPress: {
    targetMuscles: ["Deltoid Anterior"],
    synergistMuscles: [
      "Deltoid Lateral",
      "Pectoralis Major Clavicular Head",
      "Serratus Anterior",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Triceps Brachii"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["barbell"]
  },
  seatedPalmsUpWristCurl: {
    targetMuscles: ["Wrist Flexors"],
    synergistMuscles: [],
    bodyParts: ["Forearms"],
    sortedEquipment: ["dumbbell"]
  },
  seatedRow: {
    targetMuscles: ["Latissimus Dorsi", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Erector Spinae",
      "Infraspinatus",
      "Pectoralis Major Sternal Head",
      "Teres Major",
      "Teres Minor"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["cable", "band", "leverageMachine"]
  },
  seatedWideGripRow: {
    targetMuscles: ["Latissimus Dorsi", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Erector Spinae",
      "Infraspinatus",
      "Pectoralis Major Sternal Head",
      "Teres Major",
      "Teres Minor"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["cable"]
  },
  shoulderPress: {
    targetMuscles: ["Deltoid Anterior"],
    synergistMuscles: [
      "Deltoid Lateral",
      "Pectoralis Major Clavicular Head",
      "Serratus Anterior",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Triceps Brachii"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["cable", "dumbbell", "leverageMachine", "band", "smith"]
  },
  shoulderPressParallelGrip: {
    targetMuscles: ["Deltoid Anterior"],
    synergistMuscles: [
      "Deltoid Lateral",
      "Pectoralis Major Clavicular Head",
      "Serratus Anterior",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Triceps Brachii"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["dumbbell"]
  },
  shrug: {
    targetMuscles: ["Trapezius Upper Fibers"],
    synergistMuscles: ["Levator Scapulae", "Trapezius Middle Fibers"],
    bodyParts: ["Back"],
    sortedEquipment: ["barbell", "cable", "dumbbell", "leverageMachine", "band", "smith"]
  },
  sideBend: {
    targetMuscles: ["Obliques"],
    synergistMuscles: ["Erector Spinae", "Iliopsoas"],
    bodyParts: ["Waist"],
    sortedEquipment: ["cable", "dumbbell", "band"]
  },
  sideCrunch: {
    targetMuscles: ["Obliques"],
    synergistMuscles: ["Rectus Abdominis"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight", "band", "cable"]
  },
  sideHipAbductor: {
    targetMuscles: ["Gluteus Medius", "Tensor Fasciae Latae"],
    synergistMuscles: [],
    bodyParts: ["Hips"],
    sortedEquipment: ["bodyweight", "barbell", "leverageMachine"]
  },
  sideLyingClam: {
    targetMuscles: ["Gluteus Medius"],
    synergistMuscles: ["Tensor Fasciae Latae"],
    bodyParts: ["Hips"],
    sortedEquipment: ["bodyweight"]
  },
  sidePlank: {
    targetMuscles: ["Obliques"],
    synergistMuscles: [],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  singleLegBridge: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Hamstrings"],
    bodyParts: ["Hips"],
    sortedEquipment: ["bodyweight"]
  },
  singleLegCalfRaise: {
    targetMuscles: ["Gastrocnemius"],
    synergistMuscles: ["Soleus"],
    bodyParts: ["Calves"],
    sortedEquipment: ["barbell", "dumbbell", "leverageMachine", "bodyweight", "cable"]
  },
  singleLegDeadlift: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Adductor Magnus", "Hamstrings"],
    bodyParts: ["Hips"],
    sortedEquipment: ["dumbbell", "bodyweight"]
  },
  singleLegGluteBridgeBench: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: [],
    bodyParts: ["Hips"],
    sortedEquipment: ["bodyweight"]
  },
  singleLegGluteBridgeStraight: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: [],
    bodyParts: ["Hips"],
    sortedEquipment: ["bodyweight"]
  },
  singleLegGluteBridgeBentKnee: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: [],
    bodyParts: ["Hips"],
    sortedEquipment: ["bodyweight"]
  },
  singleLegHipThrust: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Quadriceps"],
    bodyParts: ["Hips"],
    sortedEquipment: ["barbell", "bodyweight", "leverageMachine"]
  },
  sissySquat: {
    targetMuscles: ["Quadriceps"],
    synergistMuscles: ["Adductor Magnus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["bodyweight"]
  },
  sitUp: {
    targetMuscles: ["Rectus Abdominis"],
    synergistMuscles: ["Iliopsoas", "Obliques", "Quadriceps", "Sartorius", "Tensor Fasciae Latae"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight", "kettlebell"]
  },
  slingShotBenchPress: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Triceps Brachii"],
    bodyParts: ["Chest"],
    sortedEquipment: ["barbell"]
  },
  skullcrusher: {
    targetMuscles: ["Triceps Brachii"],
    synergistMuscles: [],
    bodyParts: ["Upper Arms"],
    sortedEquipment: ["barbell", "cable", "dumbbell", "ezbar"]
  },
  snatch: {
    targetMuscles: ["Deltoid Anterior", "Erector Spinae", "Gluteus Maximus", "Quadriceps"],
    synergistMuscles: [
      "Adductor Magnus",
      "Deltoid Lateral",
      "Gastrocnemius",
      "Serratus Anterior",
      "Soleus",
      "Triceps Brachii"
    ],
    bodyParts: ["Hips", "Shoulders", "Thighs"],
    sortedEquipment: ["dumbbell"]
  },
  snatchPull: {
    targetMuscles: [
      "Erector Spinae",
      "Gluteus Maximus",
      "Hamstrings",
      "Quadriceps",
      "Latissimus Dorsi",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Trapezius Upper Fibers"
    ],
    synergistMuscles: [
      "Adductor Magnus",
      "Deltoid Anterior",
      "Deltoid Posterior",
      "Deltoid Lateral",
      "Biceps Brachii",
      "Brachialis",
      "Brachioradialis",
      "Triceps Brachii",
      "Wrist Flexors",
      "Wrist Extensors"
    ],
    bodyParts: ["Back", "Hips", "Thighs"],
    sortedEquipment: ["barbell"]
  },
  splitSquat: {
    targetMuscles: ["Quadriceps"],
    synergistMuscles: ["Adductor Magnus", "Gluteus Maximus", "Soleus"],
    bodyParts: ["Hips", "Thighs"],
    sortedEquipment: ["dumbbell"]
  },
  splitJerk: {
    targetMuscles: [
      "Deltoid Anterior",
      "Deltoid Posterior",
      "Deltoid Lateral",
      "Triceps Brachii",
      "Quadriceps",
      "Gluteus Maximus",
      "Erector Spinae"
    ],
    synergistMuscles: [
      "Pectoralis Major Sternal Head",
      "Pectoralis Major Clavicular Head",
      "Latissimus Dorsi",
      "Hamstrings",
      "Obliques",
      "Rectus Abdominis",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Trapezius Upper Fibers",
      "Adductor Magnus",
      "Tensor Fasciae Latae",
      "Wrist Extensors",
      "Wrist Flexors"
    ],
    bodyParts: ["Hips", "Shoulders", "Thighs"],
    sortedEquipment: ["barbell"]
  },
  squat: {
    targetMuscles: ["Quadriceps"],
    synergistMuscles: ["Adductor Magnus", "Gluteus Maximus", "Soleus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["barbell", "dumbbell", "bodyweight", "smith", "leverageMachine"]
  },
  squatRow: {
    targetMuscles: ["Gluteus Maximus", "Latissimus Dorsi", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Infraspinatus",
      "Teres Major",
      "Teres Minor",
      "Adductor Magnus",
      "Deltoid Posterior",
      "Pectoralis Major Sternal Head",
      "Quadriceps",
      "Soleus"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["band"]
  },
  standingCalfRaise: {
    targetMuscles: ["Gastrocnemius"],
    synergistMuscles: ["Soleus"],
    bodyParts: ["Calves"],
    sortedEquipment: ["barbell", "dumbbell", "leverageMachine", "bodyweight", "cable"]
  },
  standingRow: {
    targetMuscles: ["Latissimus Dorsi", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Infraspinatus",
      "Pectoralis Major Sternal Head",
      "Teres Major",
      "Teres Minor"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["cable"]
  },
  standingRowCloseGrip: {
    targetMuscles: ["Latissimus Dorsi", "Trapezius Upper Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Infraspinatus",
      "Teres Major",
      "Teres Minor",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["cable"]
  },
  standingRowRearDeltWithRope: {
    targetMuscles: ["Deltoid Posterior"],
    synergistMuscles: [
      "Brachialis",
      "Brachioradialis",
      "Deltoid Lateral",
      "Infraspinatus",
      "Teres Minor",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["cable"]
  },
  standingRowRearHorizontalDeltWithRope: {
    targetMuscles: ["Deltoid Posterior"],
    synergistMuscles: ["Infraspinatus", "Teres Minor", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["cable"]
  },
  standingRowVBar: {
    targetMuscles: ["Latissimus Dorsi", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Infraspinatus",
      "Teres Major",
      "Teres Minor",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Pectoralis Major Sternal Head"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["cable"]
  },
  stepUp: {
    targetMuscles: ["Quadriceps"],
    synergistMuscles: ["Adductor Magnus", "Gluteus Maximus", "Soleus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["barbell", "dumbbell", "bodyweight", "band"]
  },
  stiffLegDeadlift: {
    targetMuscles: ["Erector Spinae"],
    synergistMuscles: ["Adductor Magnus", "Gluteus Maximus", "Hamstrings"],
    bodyParts: ["Hips"],
    sortedEquipment: ["barbell", "dumbbell", "band"]
  },
  straightLegDeadlift: {
    targetMuscles: ["Hamstrings"],
    synergistMuscles: ["Adductor Magnus", "Erector Spinae", "Gluteus Maximus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["barbell", "dumbbell", "band", "kettlebell"]
  },
  sumoDeadlift: {
    targetMuscles: ["Erector Spinae"],
    synergistMuscles: ["Adductor Magnus", "Gluteus Maximus", "Quadriceps", "Soleus"],
    bodyParts: ["Hips"],
    sortedEquipment: ["barbell"]
  },
  sumoDeadliftHighPull: {
    targetMuscles: ["Deltoid Lateral", "Gluteus Maximus", "Quadriceps"],
    synergistMuscles: [
      "Adductor Magnus",
      "Biceps Brachii",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Anterior",
      "Gastrocnemius",
      "Infraspinatus",
      "Soleus",
      "Teres Minor",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["barbell"]
  },
  superman: {
    targetMuscles: ["Erector Spinae"],
    synergistMuscles: ["Gluteus Maximus", "Hamstrings"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight", "dumbbell"]
  },
  tBarRow: {
    targetMuscles: ["Latissimus Dorsi", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Infraspinatus",
      "Pectoralis Major Sternal Head",
      "Teres Major",
      "Teres Minor"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["leverageMachine"]
  },
  thruster: {
    targetMuscles: ["Deltoid Anterior", "Gluteus Maximus", "Quadriceps"],
    synergistMuscles: [
      "Adductor Magnus",
      "Deltoid Lateral",
      "Pectoralis Major Clavicular Head",
      "Serratus Anterior",
      "Soleus",
      "Triceps Brachii"
    ],
    bodyParts: ["Shoulders", "Thighs"],
    sortedEquipment: ["barbell"]
  },
  toesToBar: {
    targetMuscles: ["Rectus Abdominis"],
    synergistMuscles: ["Iliopsoas", "Obliques", "Quadriceps", "Sartorius", "Tensor Fasciae Latae"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  torsoRotation: {
    targetMuscles: ["Obliques"],
    synergistMuscles: ["Erector Spinae"],
    bodyParts: ["Waist"],
    sortedEquipment: ["cable"]
  },
  trapBarDeadlift: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Adductor Magnus", "Quadriceps", "Soleus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["trapbar"]
  },
  tricepsDip: {
    targetMuscles: ["Triceps Brachii"],
    synergistMuscles: [
      "Deltoid Anterior",
      "Latissimus Dorsi",
      "Levator Scapulae",
      "Pectoralis Major Clavicular Head",
      "Pectoralis Major Sternal Head"
    ],
    bodyParts: ["Upper Arms"],
    sortedEquipment: ["bodyweight", "leverageMachine"]
  },
  tricepsExtension: {
    targetMuscles: ["Triceps Brachii"],
    synergistMuscles: [],
    bodyParts: ["Upper Arms"],
    sortedEquipment: ["barbell", "cable", "band", "dumbbell"]
  },
  tricepsPushdown: {
    targetMuscles: ["Triceps Brachii"],
    synergistMuscles: [],
    bodyParts: ["Upper Arms"],
    sortedEquipment: ["cable"]
  },
  uprightRow: {
    targetMuscles: ["Deltoid Lateral"],
    synergistMuscles: [
      "Biceps Brachii",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Anterior",
      "Infraspinatus",
      "Serratus Anterior",
      "Teres Minor",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["barbell", "cable", "dumbbell", "band"]
  },
  vUp: {
    targetMuscles: ["Rectus Abdominis"],
    synergistMuscles: ["Iliopsoas", "Obliques", "Pectineous", "Quadriceps", "Sartorius", "Tensor Fasciae Latae"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight", "band", "dumbbell"]
  },
  widePullUp: {
    targetMuscles: ["Latissimus Dorsi"],
    synergistMuscles: [
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Infraspinatus",
      "Levator Scapulae",
      "Serratus Anterior",
      "Teres Major",
      "Teres Minor",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  wristCurl: {
    targetMuscles: ["Wrist Flexors"],
    synergistMuscles: [],
    bodyParts: ["Forearms"],
    sortedEquipment: ["barbell"]
  },
  wristRoller: {
    targetMuscles: ["Wrist Extensors", "Wrist Flexors"],
    synergistMuscles: [],
    bodyParts: ["Forearms"],
    sortedEquipment: ["bodyweight"]
  },
  zercherSquat: {
    targetMuscles: ["Quadriceps"],
    synergistMuscles: ["Adductor Magnus", "Gluteus Maximus", "Soleus"],
    bodyParts: ["Hips"],
    sortedEquipment: ["barbell"]
  },
  wallPushup: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Triceps Brachii"],
    bodyParts: ["Chest"],
    sortedEquipment: ["bodyweight"]
  },
  inclinePushup: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Triceps Brachii"],
    bodyParts: ["Chest"],
    sortedEquipment: ["bodyweight"]
  },
  kneePushup: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Triceps Brachii"],
    bodyParts: ["Chest"],
    sortedEquipment: ["bodyweight"]
  },
  diamondPushup: {
    targetMuscles: ["Triceps Brachii"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Pectoralis Major Sternal Head"],
    bodyParts: ["Upper Arms"],
    sortedEquipment: ["bodyweight"]
  },
  pseudoPlanchePushup: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Serratus Anterior", "Triceps Brachii"],
    bodyParts: ["Chest"],
    sortedEquipment: ["bodyweight"]
  },
  pikePushup: {
    targetMuscles: ["Deltoid Anterior"],
    synergistMuscles: ["Deltoid Lateral", "Pectoralis Major Clavicular Head", "Serratus Anterior", "Triceps Brachii"],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["bodyweight"]
  },
  ringDip: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: [
      "Deltoid Anterior",
      "Latissimus Dorsi",
      "Levator Scapulae",
      "Pectoralis Major Clavicular Head",
      "Serratus Anterior",
      "Teres Major",
      "Trapezius Middle Fibers",
      "Triceps Brachii"
    ],
    bodyParts: ["Chest"],
    sortedEquipment: ["bodyweight"]
  },
  negativeDip: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: [
      "Deltoid Anterior",
      "Latissimus Dorsi",
      "Levator Scapulae",
      "Pectoralis Major Clavicular Head",
      "Serratus Anterior",
      "Teres Major",
      "Trapezius Middle Fibers",
      "Triceps Brachii"
    ],
    bodyParts: ["Chest"],
    sortedEquipment: ["bodyweight"]
  },
  verticalRow: {
    targetMuscles: ["Latissimus Dorsi", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Infraspinatus",
      "Teres Major",
      "Teres Minor",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Pectoralis Major Sternal Head"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  wideRow: {
    targetMuscles: ["Latissimus Dorsi", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Deltoid Posterior",
      "Infraspinatus",
      "Teres Major",
      "Teres Minor",
      "Brachialis",
      "Brachioradialis"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  ringRow: {
    targetMuscles: ["Latissimus Dorsi", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: [
      "Infraspinatus",
      "Teres Major",
      "Teres Minor",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Pectoralis Major Sternal Head"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  tuckFrontLeverRow: {
    targetMuscles: ["Latissimus Dorsi"],
    synergistMuscles: [
      "Teres Major",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Deltoid Posterior",
      "Rectus Abdominis",
      "Brachialis"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  frontLeverRow: {
    targetMuscles: ["Latissimus Dorsi"],
    synergistMuscles: [
      "Teres Major",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Deltoid Posterior",
      "Rectus Abdominis",
      "Brachialis"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  scapularPullUp: {
    targetMuscles: ["Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    synergistMuscles: ["Latissimus Dorsi", "Levator Scapulae", "Serratus Anterior", "Teres Major"],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  deadHang: {
    targetMuscles: ["Latissimus Dorsi", "Wrist Flexors"],
    synergistMuscles: ["Teres Major", "Trapezius Lower Fibers", "Trapezius Middle Fibers"],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  negativePullup: {
    targetMuscles: ["Latissimus Dorsi"],
    synergistMuscles: [
      "Biceps Brachii",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Infraspinatus",
      "Levator Scapulae",
      "Teres Major",
      "Teres Minor",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  assistedSquat: {
    targetMuscles: ["Quadriceps"],
    synergistMuscles: ["Adductor Magnus", "Gluteus Maximus", "Soleus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["bodyweight"]
  },
  shrimpSquat: {
    targetMuscles: ["Gluteus Maximus"],
    synergistMuscles: ["Adductor Magnus", "Quadriceps", "Soleus"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["bodyweight"]
  },
  nordicCurl: {
    targetMuscles: ["Hamstrings"],
    synergistMuscles: ["Gastrocnemius", "Gluteus Maximus", "Erector Spinae"],
    bodyParts: ["Thighs"],
    sortedEquipment: ["bodyweight", "band"]
  },
  handstand: {
    targetMuscles: ["Deltoid Anterior"],
    synergistMuscles: [
      "Deltoid Lateral",
      "Trapezius Upper Fibers",
      "Triceps Brachii",
      "Serratus Anterior",
      "Rectus Abdominis"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["bodyweight"]
  },
  wallHandstand: {
    targetMuscles: ["Deltoid Anterior"],
    synergistMuscles: [
      "Deltoid Lateral",
      "Trapezius Upper Fibers",
      "Triceps Brachii",
      "Serratus Anterior",
      "Rectus Abdominis"
    ],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["bodyweight"]
  },
  crowPose: {
    targetMuscles: ["Deltoid Anterior"],
    synergistMuscles: ["Triceps Brachii", "Serratus Anterior", "Rectus Abdominis", "Wrist Flexors"],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["bodyweight"]
  },
  dragonFlag: {
    targetMuscles: ["Rectus Abdominis"],
    synergistMuscles: ["Obliques", "Iliopsoas", "Erector Spinae"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  copenhagenPlank: {
    targetMuscles: ["Adductor Magnus"],
    synergistMuscles: ["Adductor Brevis", "Adductor Longus", "Obliques", "Gluteus Medius"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  hangingKneeRaise: {
    targetMuscles: ["Iliopsoas"],
    synergistMuscles: [
      "Adductor Brevis",
      "Adductor Longus",
      "Pectineous",
      "Rectus Abdominis",
      "Sartorius",
      "Tensor Fasciae Latae"
    ],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  archHang: {
    targetMuscles: ["Latissimus Dorsi"],
    synergistMuscles: [
      "Teres Major",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Deltoid Posterior",
      "Wrist Flexors"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  supportHold: {
    targetMuscles: ["Pectoralis Major Sternal Head"],
    synergistMuscles: [
      "Deltoid Anterior",
      "Latissimus Dorsi",
      "Serratus Anterior",
      "Triceps Brachii",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers"
    ],
    bodyParts: ["Chest"],
    sortedEquipment: ["bodyweight"]
  },
  pallofPress: {
    targetMuscles: ["Obliques"],
    synergistMuscles: ["Rectus Abdominis"],
    bodyParts: ["Waist"],
    sortedEquipment: ["band"]
  },
  renegadeRow: {
    targetMuscles: ["Latissimus Dorsi", "Obliques"],
    synergistMuscles: [
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Teres Major",
      "Deltoid Posterior",
      "Brachialis",
      "Brachioradialis",
      "Rectus Abdominis"
    ],
    bodyParts: ["Back", "Waist"],
    sortedEquipment: ["dumbbell"]
  },
  ringAbRollout: {
    targetMuscles: ["Rectus Abdominis"],
    synergistMuscles: ["Obliques", "Latissimus Dorsi", "Serratus Anterior", "Deltoid Anterior", "Iliopsoas"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  kneelingRingAbRollout: {
    targetMuscles: ["Rectus Abdominis"],
    synergistMuscles: ["Obliques", "Latissimus Dorsi", "Serratus Anterior", "Deltoid Anterior"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  archerPullUp: {
    targetMuscles: ["Latissimus Dorsi"],
    synergistMuscles: [
      "Biceps Brachii",
      "Brachialis",
      "Brachioradialis",
      "Deltoid Posterior",
      "Teres Major",
      "Trapezius Lower Fibers",
      "Trapezius Middle Fibers",
      "Wrist Flexors"
    ],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  skinTheCat: {
    targetMuscles: ["Latissimus Dorsi"],
    synergistMuscles: ["Deltoid Posterior", "Teres Major", "Rectus Abdominis", "Iliopsoas", "Biceps Brachii"],
    bodyParts: ["Back"],
    sortedEquipment: ["bodyweight"]
  },
  hollowBodyHold: {
    targetMuscles: ["Rectus Abdominis"],
    synergistMuscles: ["Obliques", "Iliopsoas", "Quadriceps"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  deadBug: {
    targetMuscles: ["Rectus Abdominis"],
    synergistMuscles: ["Obliques", "Iliopsoas"],
    bodyParts: ["Waist"],
    sortedEquipment: ["bodyweight"]
  },
  shoulderPassThrough: {
    targetMuscles: ["Deltoid Anterior", "Deltoid Posterior"],
    synergistMuscles: ["Deltoid Lateral", "Infraspinatus", "Teres Minor", "Trapezius Middle Fibers"],
    bodyParts: ["Shoulders"],
    sortedEquipment: ["band"]
  }
};
function equipmentName(equipment, equipmentSettings) {
  const equipmentData = equipment && equipmentSettings ? equipmentSettings[equipment] : void 0;
  if (equipmentData?.name) {
    return equipmentData.name.trim();
  }
  switch (equipment) {
    case "barbell":
      return "Barbell";
    case "cable":
      return "Cable";
    case "dumbbell":
      return "Dumbbell";
    case "smith":
      return "Smith Machine";
    case "band":
      return "Band";
    case "kettlebell":
      return "Kettlebell";
    case "bodyweight":
      return "Bodyweight";
    case "leverageMachine":
      return "Leverage Machine";
    case "medicineball":
      return "Medicine Ball";
    case "ezbar":
      return "EZ Bar";
    case "trapbar":
      return "Trap Bar";
    default:
      return "";
  }
}
function warmupValues(units2) {
  return {
    10: [
      {
        reps: 5,
        threshold: units2 === "lb" ? Weight_build(60, "lb") : Weight_build(30, "kg"),
        value: 0.3
      },
      {
        reps: 5,
        threshold: units2 === "lb" ? Weight_build(30, "lb") : Weight_build(15, "kg"),
        value: 0.5
      },
      {
        reps: 5,
        threshold: units2 === "lb" ? Weight_build(10, "lb") : Weight_build(5, "kg"),
        value: 0.8
      }
    ],
    45: [
      {
        reps: 5,
        threshold: units2 === "lb" ? Weight_build(120, "lb") : Weight_build(60, "kg"),
        value: 0.3
      },
      {
        reps: 5,
        threshold: units2 === "lb" ? Weight_build(90, "lb") : Weight_build(45, "kg"),
        value: 0.5
      },
      {
        reps: 5,
        threshold: units2 === "lb" ? Weight_build(45, "lb") : Weight_build(20, "kg"),
        value: 0.8
      }
    ],
    95: [
      {
        reps: 5,
        threshold: units2 === "lb" ? Weight_build(150, "lb") : Weight_build(70, "kg"),
        value: 0.3
      },
      {
        reps: 5,
        threshold: units2 === "lb" ? Weight_build(125, "lb") : Weight_build(60, "kg"),
        value: 0.5
      },
      {
        reps: 5,
        threshold: units2 === "lb" ? Weight_build(95, "lb") : Weight_build(40, "kg"),
        value: 0.8
      }
    ]
  };
}
function warmup45(weight, settings, exerciseType) {
  return warmup(warmupValues(settings.units)[45] || [])(weight, settings, exerciseType);
}
function warmup95(weight, settings, exerciseType) {
  return warmup(warmupValues(settings.units)[95] || [])(weight, settings, exerciseType);
}
function warmup10(weight, settings, exerciseType) {
  return warmup(warmupValues(settings.units)[10] || [])(weight, settings, exerciseType);
}
function warmup(programExerciseWarmupSets, shouldSkipThreshold = false) {
  return (weight, settings, exerciseType) => {
    let index = 0;
    return programExerciseWarmupSets.reduce((memo, programExerciseWarmupSet) => {
      if (shouldSkipThreshold || weight != null && Weight_gt(weight, programExerciseWarmupSet.threshold)) {
        const value = programExerciseWarmupSet.value;
        const unit = Equipment_getUnitOrDefaultForExerciseType(settings, exerciseType);
        const isLessAssistance = typeof value === "number" && weight != null && weight.value < 0 && value < 1;
        if ((typeof value !== "number" || weight != null) && !isLessAssistance) {
          const warmupWeight = typeof value === "number" ? Weight_multiply(weight, value) : value;
          const roundedWeight = Weight_roundWarmup(warmupWeight, settings, unit, exerciseType, weight);
          memo.push({
            vtype: "set",
            index,
            id: UidFactory_generateUid(6),
            reps: programExerciseWarmupSet.reps,
            isUnilateral: exerciseType ? Exercise_getIsUnilateral(exerciseType, settings) : false,
            weight: roundedWeight,
            originalWeight: warmupWeight,
            isCompleted: false
          });
          index += 1;
        }
      }
      return memo;
    }, []);
  };
}
function warmupEmpty(weight) {
  return [];
}
function maybeGetExercise(id, customExercises) {
  const custom = customExercises[id];
  return custom != null ? {
    ...custom,
    defaultWarmup: 45,
    types: custom.types || [],
    startingWeightKg: Weight_build(0, "kg"),
    startingWeightLb: Weight_build(0, "lb")
  } : allExercisesList[id];
}
function getExercise(id, customExercises) {
  const exercise = maybeGetExercise(id, customExercises);
  return exercise != null ? exercise : allExercisesList.squat;
}
function Exercise_getMetadata(id) {
  return metadata[id] || {};
}
function Exercise_buildName(name, settings, label, equipment) {
  let str = name;
  if (equipment) {
    const allEquipment = Equipment_currentEquipment(settings);
    str = `${name}, ${equipmentName(equipment, allEquipment)}`;
  }
  if (label) {
    str = `${label}: ${str}`;
  }
  return str;
}
function Exercise_fullName(exercise, settings, label) {
  const equipment = exercise.equipment && exercise.defaultEquipment !== exercise.equipment ? exercise.equipment : void 0;
  return Exercise_buildName(exercise.name, settings, label, equipment);
}
function Exercise_findById(id, customExercises) {
  return maybeGetExercise(id, customExercises);
}
function normalizeExerciseName(name) {
  return name.toLowerCase().replace(/\s*,\s*/g, ",");
}
var customExercisesNameIndexCache = /* @__PURE__ */ new WeakMap();
function getCustomExercisesNameIndex(customExercises) {
  let index = customExercisesNameIndexCache.get(customExercises);
  if (index == null) {
    index = { live: /* @__PURE__ */ new Map(), deleted: /* @__PURE__ */ new Map() };
    for (const ce of ObjectUtils_values(customExercises)) {
      if (ce?.name && ce.id) {
        const key = normalizeExerciseName(ce.name);
        const map = ce.isDeleted ? index.deleted : index.live;
        if (!map.has(key)) {
          map.set(key, ce.id);
        }
      }
    }
    customExercisesNameIndexCache.set(customExercises, index);
  }
  return index;
}
var forbiddenExerciseNameChars = /[/{}()#[\]|!:\t\n\r]/;
var forbiddenExerciseNameCharsAll = new RegExp(forbiddenExerciseNameChars.source, "g");
function Exercise_findIdByName(name, customExercises) {
  const index = getCustomExercisesNameIndex(customExercises);
  const key = normalizeExerciseName(name);
  return index.live.get(key) || nameToIdMapping[name.toLowerCase()] || index.deleted.get(key);
}
function Exercise_get(type, customExercises) {
  const exercise = getExercise(type.id, customExercises);
  return { ...exercise, equipment: type.equipment };
}
function Exercise_onerm(type, settings) {
  const rm = settings.exerciseData[Exercise_toKey(type)]?.rm1;
  if (rm) {
    return Weight_convertTo(rm, settings.units);
  }
  const exercise = Exercise_get(type, settings.exercises);
  return settings.units === "kg" ? exercise.startingWeightKg : exercise.startingWeightLb;
}
function Exercise_defaultRounding(type, settings) {
  const units2 = Equipment_getUnitOrDefaultForExerciseType(settings, type);
  return Math.max(0.1, settings.exerciseData[Exercise_toKey(type)]?.rounding ?? (units2 === "kg" ? 2.5 : 5));
}
function Exercise_findByNameEquipment(customExercises, name, equipment) {
  const exerciseId = Exercise_findIdByName(name, customExercises);
  const exercise = exerciseId ? Exercise_findById(exerciseId, customExercises) : void 0;
  if (exercise == null) {
    return void 0;
  }
  return { ...exercise, equipment };
}
function Exercise_findByNameAndEquipment(nameAndEquipment, customExercises) {
  return Exercise_resolveNameAndEquipment(nameAndEquipment, customExercises)?.exercise;
}
function Exercise_resolveNameAndEquipment(nameAndEquipment, customExercises) {
  const parts = nameAndEquipment.split(",").map((p) => p.trim());
  let name;
  let equipment;
  if (parts.length > 1) {
    const foundEquipment = equipments.filter(
      (e) => equipmentName(e).toLowerCase() === parts[parts.length - 1].toLowerCase()
    )[0];
    if (foundEquipment != null) {
      equipment = foundEquipment;
      name = parts.slice(0, parts.length - 1).join(", ");
    } else {
      equipment = null;
    }
  }
  if (name == null) {
    name = nameAndEquipment;
  }
  let exerciseId = Exercise_findIdByName(name, customExercises);
  if (exerciseId != null && equipment !== null) {
    const bareNameCustom = customExercises[exerciseId];
    if (bareNameCustom != null) {
      const index = getCustomExercisesNameIndex(customExercises);
      const fullNameKey = normalizeExerciseName(nameAndEquipment);
      const fullNameExerciseId = index.live.get(fullNameKey) ?? (bareNameCustom.isDeleted ? index.deleted.get(fullNameKey) : void 0);
      if (fullNameExerciseId != null && fullNameExerciseId !== exerciseId) {
        const fullNameExercise = Exercise_findById(fullNameExerciseId, customExercises);
        if (fullNameExercise != null) {
          return { exercise: { ...fullNameExercise }, hasExplicitEquipment: false };
        }
      }
    }
    const exercise = Exercise_findById(exerciseId, customExercises);
    if (exercise != null) {
      return {
        exercise: { ...exercise, equipment: equipment || exercise.defaultEquipment },
        hasExplicitEquipment: equipment != null
      };
    }
  } else {
    exerciseId = Exercise_findIdByName(nameAndEquipment, customExercises);
    if (exerciseId != null) {
      const exercise = Exercise_findById(exerciseId, customExercises);
      if (exercise != null) {
        return { exercise: { ...exercise }, hasExplicitEquipment: false };
      }
    }
  }
  return void 0;
}
function Exercise_getIsUnilateral(exerciseType, settings) {
  const key = Exercise_toKey(exerciseType);
  const exerciseData = settings.exerciseData[key];
  if (exerciseData?.isUnilateral !== void 0) {
    return exerciseData.isUnilateral;
  }
  switch (exerciseType.id) {
    case "bulgarianSplitSquat":
    case "concentrationCurl":
    case "reverseGripConcentrationCurl":
    case "bentOverOneArmRow":
    case "cableKickback":
    case "cableTwist":
    case "russianTwist":
    case "lunge":
    case "reverseLunge":
    case "splitSquat":
    case "stepUp":
    case "pistolSquat":
    case "singleLegBridge":
    case "singleLegDeadlift":
    case "sideBend":
    case "sideCrunch":
    case "sideHipAbductor":
    case "sideLyingClam":
    case "sidePlank":
    case "singleLegBridge":
    case "singleLegCalfRaise":
    case "singleLegDeadlift":
    case "singleLegGluteBridgeBench":
    case "singleLegGluteBridgeStraight":
    case "singleLegGluteBridgeBentKnee":
    case "singleLegHipThrust":
      return true;
    case "bicepCurl":
    case "wristCurl":
    case "reverseWristCurl":
    case "seatedPalmsUpWristCurl":
    case "hammerCurl":
    case "preacherCurl":
    case "reverseCurl":
    case "lyingBicepCurl":
    case "inclineCurl":
      return exerciseType.equipment === "dumbbell";
    default:
      return false;
  }
}
function Exercise_findByName(name, customExercises) {
  const exerciseId = Exercise_findIdByName(name.trim(), customExercises);
  if (exerciseId != null) {
    const exercise = Exercise_findById(exerciseId, customExercises);
    if (exercise != null) {
      return { ...exercise, equipment: exercise.defaultEquipment };
    }
  }
  return void 0;
}
function Exercise_getWarmupSets(exercise, weight, settings, programExerciseWarmupSets) {
  const ex = Exercise_get(exercise, settings.exercises);
  if (programExerciseWarmupSets != null) {
    return warmup(programExerciseWarmupSets, true)(weight, settings, exercise);
  } else {
    let warmupSets = warmupEmpty(weight);
    if (ex.defaultWarmup === 10) {
      warmupSets = warmup10(weight, settings, exercise);
    } else if (ex.defaultWarmup === 45) {
      warmupSets = warmup45(weight, settings, exercise);
    } else if (ex.defaultWarmup === 95) {
      warmupSets = warmup95(weight, settings, exercise);
    }
    return warmupSets;
  }
}
function Exercise_defaultTargetMuscles(type, settings) {
  const customExercise = settings.exercises[type.id];
  if (customExercise) {
    return customExercise.meta.targetMuscles;
  } else {
    const meta = Exercise_getMetadata(type.id);
    return meta?.targetMuscles != null ? meta.targetMuscles : [];
  }
}
function Exercise_targetMuscles(type, settings) {
  const muscleMultipliers = settings.exerciseData[Exercise_toKey(type)]?.muscleMultipliers;
  if (muscleMultipliers) {
    return ObjectUtils_keys(muscleMultipliers).filter((m) => muscleMultipliers[m] === 1);
  } else {
    return Exercise_defaultTargetMuscles(type, settings);
  }
}
function Exercise_targetMusclesGroups(type, settings) {
  const muscles = Exercise_targetMuscles(type, settings);
  const allMuscleGroups = /* @__PURE__ */ new Set();
  for (const muscle of muscles) {
    const muscleGroups = Muscle_getScreenMusclesFromMuscle(muscle, settings);
    for (const muscleGroup of muscleGroups) {
      allMuscleGroups.add(muscleGroup);
    }
  }
  return Array.from(allMuscleGroups);
}
function Exercise_defaultSynergistMuscleMultipliers(type, settings) {
  const customExercise = settings.exercises[type.id];
  if (customExercise) {
    return customExercise.meta.synergistMuscles.map((m) => ({
      muscle: m,
      multiplier: settings.planner.synergistMultiplier
    }));
  } else {
    const meta = Exercise_getMetadata(type.id);
    return meta?.synergistMuscles != null ? meta.synergistMuscles.map((m) => {
      return { muscle: m, multiplier: settings.planner.synergistMultiplier };
    }) : [];
  }
}
function Exercise_defaultSynergistMuscles(type, settings) {
  return Exercise_defaultSynergistMuscleMultipliers(type, settings).map((m) => m.muscle);
}
function Exercise_synergistMuscles(type, settings) {
  const muscleMultipliers = settings.exerciseData[Exercise_toKey(type)]?.muscleMultipliers;
  if (muscleMultipliers) {
    return ObjectUtils_keys(muscleMultipliers).filter((m) => (muscleMultipliers[m] ?? 0) < 1);
  } else {
    return Exercise_defaultSynergistMuscles(type, settings);
  }
}
function Exercise_synergistMusclesGroups(type, settings) {
  const muscles = Exercise_synergistMuscles(type, settings);
  const allMuscleGroups = /* @__PURE__ */ new Set();
  for (const muscle of muscles) {
    const muscleGroups = Muscle_getScreenMusclesFromMuscle(muscle, settings);
    for (const muscleGroup of muscleGroups) {
      allMuscleGroups.add(muscleGroup);
    }
  }
  return Array.from(allMuscleGroups);
}
function Exercise_toKey(type) {
  return `${type.id}${type.equipment ? `_${type.equipment}` : ""}`;
}

// third-party/liftosaur/upstream/src/liftoscriptFns.ts
var optionalNumbers = array(optional(number()));
var optionalWeights = array(optional(VWeight));
var VScriptBindings = object({
  exercise: string(),
  day: number(),
  week: number(),
  dayInWeek: number(),
  originalWeights: array(union([VWeight, VPercentage])),
  weights: optionalWeights,
  completedWeights: optionalWeights,
  rm1: VWeight,
  reps: optionalNumbers,
  minReps: optionalNumbers,
  amraps: optionalNumbers,
  askweights: optionalNumbers,
  logrpes: optionalNumbers,
  timers: optionalNumbers,
  setTime: optionalNumbers,
  completedSetTime: optionalNumbers,
  completedSetTimeLeft: optionalNumbers,
  RPE: optionalNumbers,
  completedRPE: optionalNumbers,
  completedReps: optionalNumbers,
  completedRepsLeft: optionalNumbers,
  isCompleted: array(picklist([0, 1])),
  w: optionalWeights,
  r: optionalNumbers,
  mr: optionalNumbers,
  cr: optionalNumbers,
  cw: optionalWeights,
  ns: number(),
  programNumberOfSets: number(),
  numberOfSets: number(),
  completedNumberOfSets: number(),
  setVariationIndex: number(),
  exerciseVariationIndex: number(),
  bodyweight: VWeight,
  descriptionIndex: number(),
  setIndex: number()
});
var scalar = union([number(), VWeight, VPercentage]);
var numberOrWeight = union([number(), VWeight]);
var numberOrWeightArray = array(nullish(numberOrWeight));
var aggregatable = union([scalar, boolean(), array(nullish(scalar))]);
var liftoscriptFnSignatures = {
  roundWeight: {
    args: [{ name: "weight", schema: numberOrWeight, hint: "a weight or a number" }],
    returns: VWeight
  },
  roundConvertWeight: {
    args: [{ name: "weight", schema: numberOrWeight, hint: "a weight or a number" }],
    returns: VWeight
  },
  calculateTrainingMax: {
    args: [
      { name: "weight", schema: numberOrWeight, hint: "a weight or a number" },
      { name: "reps", schema: number(), hint: "a number of reps" }
    ],
    returns: VWeight
  },
  calculate1RM: {
    args: [
      { name: "weight", schema: numberOrWeight, hint: "a weight or a number" },
      { name: "reps", schema: number(), hint: "a number of reps" }
    ],
    returns: VWeight
  },
  rpeMultiplier: {
    args: [
      { name: "reps", schema: numberOrWeight, hint: "a number of reps" },
      { name: "rpe", schema: numberOrWeight, hint: "an RPE value", optional: true }
    ],
    returns: number()
  },
  floor: {
    args: [{ name: "value", schema: scalar, hint: "a number, weight or percentage" }],
    returns: scalar
  },
  ceil: {
    args: [{ name: "value", schema: scalar, hint: "a number, weight or percentage" }],
    returns: scalar
  },
  round: {
    args: [{ name: "value", schema: scalar, hint: "a number, weight or percentage" }],
    returns: scalar
  },
  sum: {
    variadic: { schema: aggregatable, hint: "numbers, weights, percentages or arrays of them" },
    returns: scalar
  },
  min: {
    variadic: { schema: aggregatable, hint: "numbers, weights, percentages or arrays of them" },
    returns: scalar
  },
  max: {
    variadic: { schema: aggregatable, hint: "numbers, weights, percentages or arrays of them" },
    returns: scalar
  },
  zeroOrGte: {
    args: [
      { name: "values", schema: numberOrWeightArray, hint: "an array, like 'completedReps'" },
      { name: "targets", schema: numberOrWeightArray, hint: "an array, like 'reps'" }
    ],
    returns: boolean()
  },
  print: {
    variadic: { schema: any(), hint: "any values" },
    returns: any()
  },
  isProgramExercise: {
    args: [{ name: "pattern", schema: string(), hint: "an exercise name as in the program, like 't1: Squat'" }],
    returns: boolean()
  },
  isExercise: {
    args: [{ name: "pattern", schema: string(), hint: "an exercise name, like 'Squat' or 'Squat, Barbell'" }],
    returns: boolean()
  },
  increment: {
    args: [{ name: "value", schema: scalar, hint: "a number, weight or percentage" }],
    returns: scalar
  },
  decrement: {
    args: [{ name: "value", schema: scalar, hint: "a number, weight or percentage" }],
    returns: scalar
  },
  sets: {
    args: [
      { name: "fromIndex", schema: number(), hint: "a number" },
      { name: "toIndex", schema: number(), hint: "a number" },
      { name: "minReps", schema: number(), hint: "a number" },
      { name: "maxReps", schema: number(), hint: "a number" },
      { name: "isAmrap", schema: number(), hint: "a number (0 or 1)" },
      { name: "weight", schema: scalar, hint: "a weight, number or percentage" },
      { name: "timer", schema: number(), hint: "a number of seconds" },
      { name: "rpe", schema: number(), hint: "a number" },
      { name: "shouldLogRpe", schema: number(), hint: "a number (0 or 1)" }
    ],
    returns: number()
  }
};
function LiftoscriptFns_isFnName(name) {
  return Object.prototype.hasOwnProperty.call(liftoscriptFnSignatures, name);
}
function LiftoscriptFns_arity(name) {
  const signature = liftoscriptFnSignatures[name];
  if (signature.args == null) {
    return { min: 0, max: void 0 };
  }
  const min2 = signature.args.filter((a) => !a.optional).length;
  return { min: min2, max: signature.args.length };
}
function LiftoscriptFns_argSignature(name, index) {
  const signature = liftoscriptFnSignatures[name];
  if (signature.variadic != null) {
    return { name: "values", schema: signature.variadic.schema, hint: signature.variadic.hint };
  }
  return signature.args?.[index];
}
function LiftoscriptFns_isValidArg(name, index, value) {
  const argSignature = LiftoscriptFns_argSignature(name, index);
  if (argSignature == null) {
    return true;
  }
  if (argSignature.optional && value == null) {
    return true;
  }
  return is(argSignature.schema, value);
}
function LiftoscriptFns_bindingStaticType(name) {
  const entries = VScriptBindings.entries;
  const schema = Object.prototype.hasOwnProperty.call(entries, name) ? entries[name] : void 0;
  if (schema == null) {
    return void 0;
  }
  const samples = [
    ["array", []],
    ["number", 1],
    ["weight", { value: 1, unit: "lb" }],
    ["percentage", { value: 1, unit: "%" }],
    ["string", "a"]
  ];
  return samples.find(([, sample]) => is(schema, sample))?.[0];
}
function LiftoscriptFns_acceptsTypeAt(name, index, type) {
  const samples = {
    number: [1],
    weight: [{ value: 1, unit: "lb" }],
    percentage: [{ value: 1, unit: "%" }],
    array: [[1], [{ value: 1, unit: "lb" }], [{ value: 1, unit: "%" }], []],
    string: ["a"]
  };
  return samples[type].some((sample) => LiftoscriptFns_isValidArg(name, index, sample));
}

// node_modules/.pnpm/@lezer+common@1.5.5/node_modules/@lezer/common/dist/index.js
var DefaultBufferLength = 1024;
var nextPropID = 0;
var Range = class {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
};
var NodeProp = class {
  /**
  Create a new node prop type.
  */
  constructor(config = {}) {
    this.id = nextPropID++;
    this.perNode = !!config.perNode;
    this.deserialize = config.deserialize || (() => {
      throw new Error("This node type doesn't define a deserialize function");
    });
    this.combine = config.combine || null;
  }
  /**
  This is meant to be used with
  [`NodeSet.extend`](#common.NodeSet.extend) or
  [`LRParser.configure`](#lr.ParserConfig.props) to compute
  prop values for each node type in the set. Takes a [match
  object](#common.NodeType^match) or function that returns undefined
  if the node type doesn't get this prop, and the prop's value if
  it does.
  */
  add(match) {
    if (this.perNode)
      throw new RangeError("Can't add per-node props to node types");
    if (typeof match != "function")
      match = NodeType.match(match);
    return (type) => {
      let result = match(type);
      return result === void 0 ? null : [this, result];
    };
  }
};
NodeProp.closedBy = new NodeProp({ deserialize: (str) => str.split(" ") });
NodeProp.openedBy = new NodeProp({ deserialize: (str) => str.split(" ") });
NodeProp.group = new NodeProp({ deserialize: (str) => str.split(" ") });
NodeProp.isolate = new NodeProp({ deserialize: (value) => {
  if (value && value != "rtl" && value != "ltr" && value != "auto")
    throw new RangeError("Invalid value for isolate: " + value);
  return value || "auto";
} });
NodeProp.contextHash = new NodeProp({ perNode: true });
NodeProp.lookAhead = new NodeProp({ perNode: true });
NodeProp.mounted = new NodeProp({ perNode: true });
var MountedTree = class {
  constructor(tree, overlay, parser3, bracketed = false) {
    this.tree = tree;
    this.overlay = overlay;
    this.parser = parser3;
    this.bracketed = bracketed;
  }
  /**
  @internal
  */
  static get(tree) {
    return tree && tree.props && tree.props[NodeProp.mounted.id];
  }
};
var noProps = /* @__PURE__ */ Object.create(null);
var NodeType = class _NodeType {
  /**
  @internal
  */
  constructor(name, props, id, flags = 0) {
    this.name = name;
    this.props = props;
    this.id = id;
    this.flags = flags;
  }
  /**
  Define a node type.
  */
  static define(spec) {
    let props = spec.props && spec.props.length ? /* @__PURE__ */ Object.create(null) : noProps;
    let flags = (spec.top ? 1 : 0) | (spec.skipped ? 2 : 0) | (spec.error ? 4 : 0) | (spec.name == null ? 8 : 0);
    let type = new _NodeType(spec.name || "", props, spec.id, flags);
    if (spec.props)
      for (let src of spec.props) {
        if (!Array.isArray(src))
          src = src(type);
        if (src) {
          if (src[0].perNode)
            throw new RangeError("Can't store a per-node prop on a node type");
          props[src[0].id] = src[1];
        }
      }
    return type;
  }
  /**
  Retrieves a node prop for this type. Will return `undefined` if
  the prop isn't present on this node.
  */
  prop(prop) {
    return this.props[prop.id];
  }
  /**
  True when this is the top node of a grammar.
  */
  get isTop() {
    return (this.flags & 1) > 0;
  }
  /**
  True when this node is produced by a skip rule.
  */
  get isSkipped() {
    return (this.flags & 2) > 0;
  }
  /**
  Indicates whether this is an error node.
  */
  get isError() {
    return (this.flags & 4) > 0;
  }
  /**
  When true, this node type doesn't correspond to a user-declared
  named node, for example because it is used to cache repetition.
  */
  get isAnonymous() {
    return (this.flags & 8) > 0;
  }
  /**
  Returns true when this node's name or one of its
  [groups](#common.NodeProp^group) matches the given string.
  */
  is(name) {
    if (typeof name == "string") {
      if (this.name == name)
        return true;
      let group = this.prop(NodeProp.group);
      return group ? group.indexOf(name) > -1 : false;
    }
    return this.id == name;
  }
  /**
  Create a function from node types to arbitrary values by
  specifying an object whose property names are node or
  [group](#common.NodeProp^group) names. Often useful with
  [`NodeProp.add`](#common.NodeProp.add). You can put multiple
  names, separated by spaces, in a single property name to map
  multiple node names to a single value.
  */
  static match(map) {
    let direct = /* @__PURE__ */ Object.create(null);
    for (let prop in map)
      for (let name of prop.split(" "))
        direct[name] = map[prop];
    return (node) => {
      for (let groups = node.prop(NodeProp.group), i = -1; i < (groups ? groups.length : 0); i++) {
        let found = direct[i < 0 ? node.name : groups[i]];
        if (found)
          return found;
      }
    };
  }
};
NodeType.none = new NodeType(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
var NodeSet = class _NodeSet {
  /**
  Create a set with the given types. The `id` property of each
  type should correspond to its position within the array.
  */
  constructor(types) {
    this.types = types;
    for (let i = 0; i < types.length; i++)
      if (types[i].id != i)
        throw new RangeError("Node type ids should correspond to array positions when creating a node set");
  }
  /**
  Create a copy of this set with some node properties added. The
  arguments to this method can be created with
  [`NodeProp.add`](#common.NodeProp.add).
  */
  extend(...props) {
    let newTypes = [];
    for (let type of this.types) {
      let newProps = null;
      for (let source of props) {
        let add = source(type);
        if (add) {
          if (!newProps)
            newProps = Object.assign({}, type.props);
          let value = add[1], prop = add[0];
          if (prop.combine && prop.id in newProps)
            value = prop.combine(newProps[prop.id], value);
          newProps[prop.id] = value;
        }
      }
      newTypes.push(newProps ? new NodeType(type.name, newProps, type.id, type.flags) : type);
    }
    return new _NodeSet(newTypes);
  }
};
var CachedNode = /* @__PURE__ */ new WeakMap();
var CachedInnerNode = /* @__PURE__ */ new WeakMap();
var IterMode;
(function(IterMode2) {
  IterMode2[IterMode2["ExcludeBuffers"] = 1] = "ExcludeBuffers";
  IterMode2[IterMode2["IncludeAnonymous"] = 2] = "IncludeAnonymous";
  IterMode2[IterMode2["IgnoreMounts"] = 4] = "IgnoreMounts";
  IterMode2[IterMode2["IgnoreOverlays"] = 8] = "IgnoreOverlays";
  IterMode2[IterMode2["EnterBracketed"] = 16] = "EnterBracketed";
})(IterMode || (IterMode = {}));
var Tree = class _Tree {
  /**
  Construct a new tree. See also [`Tree.build`](#common.Tree^build).
  */
  constructor(type, children, positions, length, props) {
    this.type = type;
    this.children = children;
    this.positions = positions;
    this.length = length;
    this.props = null;
    if (props && props.length) {
      this.props = /* @__PURE__ */ Object.create(null);
      for (let [prop, value] of props)
        this.props[typeof prop == "number" ? prop : prop.id] = value;
    }
  }
  /**
  @internal
  */
  toString() {
    let mounted = MountedTree.get(this);
    if (mounted && !mounted.overlay)
      return mounted.tree.toString();
    let children = "";
    for (let ch of this.children) {
      let str = ch.toString();
      if (str) {
        if (children)
          children += ",";
        children += str;
      }
    }
    return !this.type.name ? children : (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (children.length ? "(" + children + ")" : "");
  }
  /**
  Get a [tree cursor](#common.TreeCursor) positioned at the top of
  the tree. Mode can be used to [control](#common.IterMode) which
  nodes the cursor visits.
  */
  cursor(mode = 0) {
    return new TreeCursor(this.topNode, mode);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(pos, side = 0, mode = 0) {
    let scope = CachedNode.get(this) || this.topNode;
    let cursor = new TreeCursor(scope);
    cursor.moveTo(pos, side);
    CachedNode.set(this, cursor._tree);
    return cursor;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new TreeNode(this, 0, 0, null);
  }
  /**
  Get the [syntax node](#common.SyntaxNode) at the given position.
  If `side` is -1, this will move into nodes that end at the
  position. If 1, it'll move into nodes that start at the
  position. With 0, it'll only enter nodes that cover the position
  from both sides.
  
  Note that this will not enter
  [overlays](#common.MountedTree.overlay), and you often want
  [`resolveInner`](#common.Tree.resolveInner) instead.
  */
  resolve(pos, side = 0) {
    let node = resolveNode(CachedNode.get(this) || this.topNode, pos, side, false);
    CachedNode.set(this, node);
    return node;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(pos, side = 0) {
    let node = resolveNode(CachedInnerNode.get(this) || this.topNode, pos, side, true);
    CachedInnerNode.set(this, node);
    return node;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(pos, side = 0) {
    return stackIterator(this, pos, side);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(spec) {
    let { enter, leave, from = 0, to = this.length } = spec;
    let mode = spec.mode || 0, anon = (mode & IterMode.IncludeAnonymous) > 0;
    for (let c = this.cursor(mode | IterMode.IncludeAnonymous); ; ) {
      let entered = false;
      if (c.from <= to && c.to >= from && (!anon && c.type.isAnonymous || enter(c) !== false)) {
        if (c.firstChild())
          continue;
        entered = true;
      }
      for (; ; ) {
        if (entered && leave && (anon || !c.type.isAnonymous))
          leave(c);
        if (c.nextSibling())
          break;
        if (!c.parent())
          return;
        entered = true;
      }
    }
  }
  /**
  Get the value of the given [node prop](#common.NodeProp) for this
  node. Works with both per-node and per-type props.
  */
  prop(prop) {
    return !prop.perNode ? this.type.prop(prop) : this.props ? this.props[prop.id] : void 0;
  }
  /**
  Returns the node's [per-node props](#common.NodeProp.perNode) in a
  format that can be passed to the [`Tree`](#common.Tree)
  constructor.
  */
  get propValues() {
    let result = [];
    if (this.props)
      for (let id in this.props)
        result.push([+id, this.props[id]]);
    return result;
  }
  /**
  Balance the direct children of this tree, producing a copy of
  which may have children grouped into subtrees with type
  [`NodeType.none`](#common.NodeType^none).
  */
  balance(config = {}) {
    return this.children.length <= 8 ? this : balanceRange(NodeType.none, this.children, this.positions, 0, this.children.length, 0, this.length, (children, positions, length) => new _Tree(this.type, children, positions, length, this.propValues), config.makeTree || ((children, positions, length) => new _Tree(NodeType.none, children, positions, length)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(data) {
    return buildTree(data);
  }
};
Tree.empty = new Tree(NodeType.none, [], [], 0);
var FlatBufferCursor = class _FlatBufferCursor {
  constructor(buffer, index) {
    this.buffer = buffer;
    this.index = index;
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  get pos() {
    return this.index;
  }
  next() {
    this.index -= 4;
  }
  fork() {
    return new _FlatBufferCursor(this.buffer, this.index);
  }
};
var TreeBuffer = class _TreeBuffer {
  /**
  Create a tree buffer.
  */
  constructor(buffer, length, set) {
    this.buffer = buffer;
    this.length = length;
    this.set = set;
  }
  /**
  @internal
  */
  get type() {
    return NodeType.none;
  }
  /**
  @internal
  */
  toString() {
    let result = [];
    for (let index = 0; index < this.buffer.length; ) {
      result.push(this.childString(index));
      index = this.buffer[index + 3];
    }
    return result.join(",");
  }
  /**
  @internal
  */
  childString(index) {
    let id = this.buffer[index], endIndex = this.buffer[index + 3];
    let type = this.set.types[id], result = type.name;
    if (/\W/.test(result) && !type.isError)
      result = JSON.stringify(result);
    index += 4;
    if (endIndex == index)
      return result;
    let children = [];
    while (index < endIndex) {
      children.push(this.childString(index));
      index = this.buffer[index + 3];
    }
    return result + "(" + children.join(",") + ")";
  }
  /**
  @internal
  */
  findChild(startIndex, endIndex, dir, pos, side) {
    let { buffer } = this, pick = -1;
    for (let i = startIndex; i != endIndex; i = buffer[i + 3]) {
      if (checkSide(side, pos, buffer[i + 1], buffer[i + 2])) {
        pick = i;
        if (dir > 0)
          break;
      }
    }
    return pick;
  }
  /**
  @internal
  */
  slice(startI, endI, from) {
    let b = this.buffer;
    let copy = new Uint16Array(endI - startI), len = 0;
    for (let i = startI, j = 0; i < endI; ) {
      copy[j++] = b[i++];
      copy[j++] = b[i++] - from;
      let to = copy[j++] = b[i++] - from;
      copy[j++] = b[i++] - startI;
      len = Math.max(len, to);
    }
    return new _TreeBuffer(copy, len, this.set);
  }
};
function checkSide(side, pos, from, to) {
  switch (side) {
    case -2:
      return from < pos;
    case -1:
      return to >= pos && from < pos;
    case 0:
      return from < pos && to > pos;
    case 1:
      return from <= pos && to > pos;
    case 2:
      return to > pos;
    case 4:
      return true;
  }
}
function resolveNode(node, pos, side, overlays) {
  var _a;
  while (node.from == node.to || (side < 1 ? node.from >= pos : node.from > pos) || (side > -1 ? node.to <= pos : node.to < pos)) {
    let parent = !overlays && node instanceof TreeNode && node.index < 0 ? null : node.parent;
    if (!parent)
      return node;
    node = parent;
  }
  let mode = overlays ? 0 : IterMode.IgnoreOverlays;
  if (overlays)
    for (let scan = node, parent = scan.parent; parent; scan = parent, parent = scan.parent) {
      if (scan instanceof TreeNode && scan.index < 0 && ((_a = parent.enter(pos, side, mode)) === null || _a === void 0 ? void 0 : _a.from) != scan.from)
        node = parent;
    }
  for (; ; ) {
    let inner = node.enter(pos, side, mode);
    if (!inner)
      return node;
    node = inner;
  }
}
var BaseNode = class {
  cursor(mode = 0) {
    return new TreeCursor(this, mode);
  }
  getChild(type, before = null, after = null) {
    let r = getChildren(this, type, before, after);
    return r.length ? r[0] : null;
  }
  getChildren(type, before = null, after = null) {
    return getChildren(this, type, before, after);
  }
  resolve(pos, side = 0) {
    return resolveNode(this, pos, side, false);
  }
  resolveInner(pos, side = 0) {
    return resolveNode(this, pos, side, true);
  }
  matchContext(context) {
    return matchNodeContext(this.parent, context);
  }
  enterUnfinishedNodesBefore(pos) {
    let scan = this.childBefore(pos), node = this;
    while (scan) {
      let last = scan.lastChild;
      if (!last || last.to != scan.to)
        break;
      if (last.type.isError && last.from == last.to) {
        node = scan;
        scan = last.prevSibling;
      } else {
        scan = last;
      }
    }
    return node;
  }
  get node() {
    return this;
  }
  get next() {
    return this.parent;
  }
};
var TreeNode = class _TreeNode extends BaseNode {
  constructor(_tree, from, index, _parent) {
    super();
    this._tree = _tree;
    this.from = from;
    this.index = index;
    this._parent = _parent;
  }
  get type() {
    return this._tree.type;
  }
  get name() {
    return this._tree.type.name;
  }
  get to() {
    return this.from + this._tree.length;
  }
  nextChild(i, dir, pos, side, mode = 0) {
    for (let parent = this; ; ) {
      for (let { children, positions } = parent._tree, e = dir > 0 ? children.length : -1; i != e; i += dir) {
        let next = children[i], start = positions[i] + parent.from, mounted;
        if (!(mode & IterMode.EnterBracketed && next instanceof Tree && (mounted = MountedTree.get(next)) && !mounted.overlay && mounted.bracketed && pos >= start && pos <= start + next.length) && !checkSide(side, pos, start, start + next.length))
          continue;
        if (next instanceof TreeBuffer) {
          if (mode & IterMode.ExcludeBuffers)
            continue;
          let index = next.findChild(0, next.buffer.length, dir, pos - start, side);
          if (index > -1)
            return new BufferNode(new BufferContext(parent, next, i, start), null, index);
        } else if (mode & IterMode.IncludeAnonymous || (!next.type.isAnonymous || hasChild(next))) {
          let mounted2;
          if (!(mode & IterMode.IgnoreMounts) && (mounted2 = MountedTree.get(next)) && !mounted2.overlay)
            return new _TreeNode(mounted2.tree, start, i, parent);
          let inner = new _TreeNode(next, start, i, parent);
          return mode & IterMode.IncludeAnonymous || !inner.type.isAnonymous ? inner : inner.nextChild(dir < 0 ? next.children.length - 1 : 0, dir, pos, side, mode);
        }
      }
      if (mode & IterMode.IncludeAnonymous || !parent.type.isAnonymous)
        return null;
      if (parent.index >= 0)
        i = parent.index + dir;
      else
        i = dir < 0 ? -1 : parent._parent._tree.children.length;
      parent = parent._parent;
      if (!parent)
        return null;
    }
  }
  get firstChild() {
    return this.nextChild(
      0,
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(pos) {
    return this.nextChild(
      0,
      1,
      pos,
      2
      /* Side.After */
    );
  }
  childBefore(pos) {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      pos,
      -2
      /* Side.Before */
    );
  }
  prop(prop) {
    return this._tree.prop(prop);
  }
  enter(pos, side, mode = 0) {
    let mounted;
    if (!(mode & IterMode.IgnoreOverlays) && (mounted = MountedTree.get(this._tree)) && mounted.overlay) {
      let rPos = pos - this.from, enterBracketed = mode & IterMode.EnterBracketed && mounted.bracketed;
      for (let { from, to } of mounted.overlay) {
        if ((side > 0 || enterBracketed ? from <= rPos : from < rPos) && (side < 0 || enterBracketed ? to >= rPos : to > rPos))
          return new _TreeNode(mounted.tree, mounted.overlay[0].from + this.from, -1, this);
      }
    }
    return this.nextChild(0, 1, pos, side, mode);
  }
  nextSignificantParent() {
    let val = this;
    while (val.type.isAnonymous && val._parent)
      val = val._parent;
    return val;
  }
  get parent() {
    return this._parent ? this._parent.nextSignificantParent() : null;
  }
  get nextSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index + 1,
      1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get prevSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get tree() {
    return this._tree;
  }
  toTree() {
    return this._tree;
  }
  /**
  @internal
  */
  toString() {
    return this._tree.toString();
  }
};
function getChildren(node, type, before, after) {
  let cur = node.cursor(), result = [];
  if (!cur.firstChild())
    return result;
  if (before != null)
    for (let found = false; !found; ) {
      found = cur.type.is(before);
      if (!cur.nextSibling())
        return result;
    }
  for (; ; ) {
    if (after != null && cur.type.is(after))
      return result;
    if (cur.type.is(type))
      result.push(cur.node);
    if (!cur.nextSibling())
      return after == null ? result : [];
  }
}
function matchNodeContext(node, context, i = context.length - 1) {
  for (let p = node; i >= 0; p = p.parent) {
    if (!p)
      return false;
    if (!p.type.isAnonymous) {
      if (context[i] && context[i] != p.name)
        return false;
      i--;
    }
  }
  return true;
}
var BufferContext = class {
  constructor(parent, buffer, index, start) {
    this.parent = parent;
    this.buffer = buffer;
    this.index = index;
    this.start = start;
  }
};
var BufferNode = class _BufferNode extends BaseNode {
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  constructor(context, _parent, index) {
    super();
    this.context = context;
    this._parent = _parent;
    this.index = index;
    this.type = context.buffer.set.types[context.buffer.buffer[index]];
  }
  child(dir, pos, side) {
    let { buffer } = this.context;
    let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.context.start, side);
    return index < 0 ? null : new _BufferNode(this.context, this, index);
  }
  get firstChild() {
    return this.child(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.child(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(pos) {
    return this.child(
      1,
      pos,
      2
      /* Side.After */
    );
  }
  childBefore(pos) {
    return this.child(
      -1,
      pos,
      -2
      /* Side.Before */
    );
  }
  prop(prop) {
    return this.type.prop(prop);
  }
  enter(pos, side, mode = 0) {
    if (mode & IterMode.ExcludeBuffers)
      return null;
    let { buffer } = this.context;
    let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], side > 0 ? 1 : -1, pos - this.context.start, side);
    return index < 0 ? null : new _BufferNode(this.context, this, index);
  }
  get parent() {
    return this._parent || this.context.parent.nextSignificantParent();
  }
  externalSibling(dir) {
    return this._parent ? null : this.context.parent.nextChild(
      this.context.index + dir,
      dir,
      0,
      4
      /* Side.DontCare */
    );
  }
  get nextSibling() {
    let { buffer } = this.context;
    let after = buffer.buffer[this.index + 3];
    if (after < (this._parent ? buffer.buffer[this._parent.index + 3] : buffer.buffer.length))
      return new _BufferNode(this.context, this._parent, after);
    return this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer } = this.context;
    let parentStart = this._parent ? this._parent.index + 4 : 0;
    if (this.index == parentStart)
      return this.externalSibling(-1);
    return new _BufferNode(this.context, this._parent, buffer.findChild(
      parentStart,
      this.index,
      -1,
      0,
      4
      /* Side.DontCare */
    ));
  }
  get tree() {
    return null;
  }
  toTree() {
    let children = [], positions = [];
    let { buffer } = this.context;
    let startI = this.index + 4, endI = buffer.buffer[this.index + 3];
    if (endI > startI) {
      let from = buffer.buffer[this.index + 1];
      children.push(buffer.slice(startI, endI, from));
      positions.push(0);
    }
    return new Tree(this.type, children, positions, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
};
function iterStack(heads) {
  if (!heads.length)
    return null;
  let pick = 0, picked = heads[0];
  for (let i = 1; i < heads.length; i++) {
    let node = heads[i];
    if (node.from > picked.from || node.to < picked.to) {
      picked = node;
      pick = i;
    }
  }
  let next = picked instanceof TreeNode && picked.index < 0 ? null : picked.parent;
  let newHeads = heads.slice();
  if (next)
    newHeads[pick] = next;
  else
    newHeads.splice(pick, 1);
  return new StackIterator(newHeads, picked);
}
var StackIterator = class {
  constructor(heads, node) {
    this.heads = heads;
    this.node = node;
  }
  get next() {
    return iterStack(this.heads);
  }
};
function stackIterator(tree, pos, side) {
  let inner = tree.resolveInner(pos, side), layers = null;
  for (let scan = inner instanceof TreeNode ? inner : inner.context.parent; scan; scan = scan.parent) {
    if (scan.index < 0) {
      let parent = scan.parent;
      (layers || (layers = [inner])).push(parent.resolve(pos, side));
      scan = parent;
    } else {
      let mount = MountedTree.get(scan.tree);
      if (mount && mount.overlay && mount.overlay[0].from <= pos && mount.overlay[mount.overlay.length - 1].to >= pos) {
        let root = new TreeNode(mount.tree, mount.overlay[0].from + scan.from, -1, scan);
        (layers || (layers = [inner])).push(resolveNode(root, pos, side, false));
      }
    }
  }
  return layers ? iterStack(layers) : inner;
}
var TreeCursor = class {
  /**
  Shorthand for `.type.name`.
  */
  get name() {
    return this.type.name;
  }
  /**
  @internal
  */
  constructor(node, mode = 0) {
    this.buffer = null;
    this.stack = [];
    this.index = 0;
    this.bufferNode = null;
    this.mode = mode & ~IterMode.EnterBracketed;
    if (node instanceof TreeNode) {
      this.yieldNode(node);
    } else {
      this._tree = node.context.parent;
      this.buffer = node.context;
      for (let n2 = node._parent; n2; n2 = n2._parent)
        this.stack.unshift(n2.index);
      this.bufferNode = node;
      this.yieldBuf(node.index);
    }
  }
  yieldNode(node) {
    if (!node)
      return false;
    this._tree = node;
    this.type = node.type;
    this.from = node.from;
    this.to = node.to;
    return true;
  }
  yieldBuf(index, type) {
    this.index = index;
    let { start, buffer } = this.buffer;
    this.type = type || buffer.set.types[buffer.buffer[index]];
    this.from = start + buffer.buffer[index + 1];
    this.to = start + buffer.buffer[index + 2];
    return true;
  }
  /**
  @internal
  */
  yield(node) {
    if (!node)
      return false;
    if (node instanceof TreeNode) {
      this.buffer = null;
      return this.yieldNode(node);
    }
    this.buffer = node.context;
    return this.yieldBuf(node.index, node.type);
  }
  /**
  @internal
  */
  toString() {
    return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
  }
  /**
  @internal
  */
  enterChild(dir, pos, side) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(dir < 0 ? this._tree._tree.children.length - 1 : 0, dir, pos, side, this.mode));
    let { buffer } = this.buffer;
    let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.buffer.start, side);
    if (index < 0)
      return false;
    this.stack.push(this.index);
    return this.yieldBuf(index);
  }
  /**
  Move the cursor to this node's first child. When this returns
  false, the node has no child, and the cursor has not been moved.
  */
  firstChild() {
    return this.enterChild(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to this node's last child.
  */
  lastChild() {
    return this.enterChild(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to the first child that ends after `pos`.
  */
  childAfter(pos) {
    return this.enterChild(
      1,
      pos,
      2
      /* Side.After */
    );
  }
  /**
  Move to the last child that starts before `pos`.
  */
  childBefore(pos) {
    return this.enterChild(
      -1,
      pos,
      -2
      /* Side.Before */
    );
  }
  /**
  Move the cursor to the child around `pos`. If side is -1 the
  child may end at that position, when 1 it may start there. This
  will also enter [overlaid](#common.MountedTree.overlay)
  [mounted](#common.NodeProp^mounted) trees unless `overlays` is
  set to false.
  */
  enter(pos, side, mode = this.mode) {
    if (!this.buffer)
      return this.yield(this._tree.enter(pos, side, mode));
    return mode & IterMode.ExcludeBuffers ? false : this.enterChild(1, pos, side);
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & IterMode.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let parent = this.mode & IterMode.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    this.buffer = null;
    return this.yieldNode(parent);
  }
  /**
  @internal
  */
  sibling(dir) {
    if (!this.buffer)
      return !this._tree._parent ? false : this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + dir, dir, 0, 4, this.mode));
    let { buffer } = this.buffer, d = this.stack.length - 1;
    if (dir < 0) {
      let parentStart = d < 0 ? 0 : this.stack[d] + 4;
      if (this.index != parentStart)
        return this.yieldBuf(buffer.findChild(
          parentStart,
          this.index,
          -1,
          0,
          4
          /* Side.DontCare */
        ));
    } else {
      let after = buffer.buffer[this.index + 3];
      if (after < (d < 0 ? buffer.buffer.length : buffer.buffer[this.stack[d] + 3]))
        return this.yieldBuf(after);
    }
    return d < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + dir, dir, 0, 4, this.mode)) : false;
  }
  /**
  Move to this node's next sibling, if any.
  */
  nextSibling() {
    return this.sibling(1);
  }
  /**
  Move to this node's previous sibling, if any.
  */
  prevSibling() {
    return this.sibling(-1);
  }
  atLastNode(dir) {
    let index, parent, { buffer } = this;
    if (buffer) {
      if (dir > 0) {
        if (this.index < buffer.buffer.buffer.length)
          return false;
      } else {
        for (let i = 0; i < this.index; i++)
          if (buffer.buffer.buffer[i + 3] < this.index)
            return false;
      }
      ({ index, parent } = buffer);
    } else {
      ({ index, _parent: parent } = this._tree);
    }
    for (; parent; { index, _parent: parent } = parent) {
      if (index > -1)
        for (let i = index + dir, e = dir < 0 ? -1 : parent._tree.children.length; i != e; i += dir) {
          let child = parent._tree.children[i];
          if (this.mode & IterMode.IncludeAnonymous || child instanceof TreeBuffer || !child.type.isAnonymous || hasChild(child))
            return false;
        }
    }
    return true;
  }
  move(dir, enter) {
    if (enter && this.enterChild(
      dir,
      0,
      4
      /* Side.DontCare */
    ))
      return true;
    for (; ; ) {
      if (this.sibling(dir))
        return true;
      if (this.atLastNode(dir) || !this.parent())
        return false;
    }
  }
  /**
  Move to the next node in a
  [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order,_NLR)
  traversal, going from a node to its first child or, if the
  current node is empty or `enter` is false, its next sibling or
  the next sibling of the first parent node that has one.
  */
  next(enter = true) {
    return this.move(1, enter);
  }
  /**
  Move to the next node in a last-to-first pre-order traversal. A
  node is followed by its last child or, if it has none, its
  previous sibling or the previous sibling of the first parent
  node that has one.
  */
  prev(enter = true) {
    return this.move(-1, enter);
  }
  /**
  Move the cursor to the innermost node that covers `pos`. If
  `side` is -1, it will enter nodes that end at `pos`. If it is 1,
  it will enter nodes that start at `pos`.
  */
  moveTo(pos, side = 0) {
    while (this.from == this.to || (side < 1 ? this.from >= pos : this.from > pos) || (side > -1 ? this.to <= pos : this.to < pos))
      if (!this.parent())
        break;
    while (this.enterChild(1, pos, side)) {
    }
    return this;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) at the cursor's current
  position.
  */
  get node() {
    if (!this.buffer)
      return this._tree;
    let cache = this.bufferNode, result = null, depth = 0;
    if (cache && cache.context == this.buffer) {
      scan: for (let index = this.index, d = this.stack.length; d >= 0; ) {
        for (let c = cache; c; c = c._parent)
          if (c.index == index) {
            if (index == this.index)
              return c;
            result = c;
            depth = d + 1;
            break scan;
          }
        index = this.stack[--d];
      }
    }
    for (let i = depth; i < this.stack.length; i++)
      result = new BufferNode(this.buffer, result, this.stack[i]);
    return this.bufferNode = new BufferNode(this.buffer, result, this.index);
  }
  /**
  Get the [tree](#common.Tree) that represents the current node, if
  any. Will return null when the node is in a [tree
  buffer](#common.TreeBuffer).
  */
  get tree() {
    return this.buffer ? null : this._tree._tree;
  }
  /**
  Iterate over the current node and all its descendants, calling
  `enter` when entering a node and `leave`, if given, when leaving
  one. When `enter` returns `false`, any children of that node are
  skipped, and `leave` isn't called for it.
  */
  iterate(enter, leave) {
    for (let depth = 0; ; ) {
      let mustLeave = false;
      if (this.type.isAnonymous || enter(this) !== false) {
        if (this.firstChild()) {
          depth++;
          continue;
        }
        if (!this.type.isAnonymous)
          mustLeave = true;
      }
      for (; ; ) {
        if (mustLeave && leave)
          leave(this);
        mustLeave = this.type.isAnonymous;
        if (!depth)
          return;
        if (this.nextSibling())
          break;
        this.parent();
        depth--;
        mustLeave = true;
      }
    }
  }
  /**
  Test whether the current node matches a given context—a sequence
  of direct parent node names. Empty strings in the context array
  are treated as wildcards.
  */
  matchContext(context) {
    if (!this.buffer)
      return matchNodeContext(this.node.parent, context);
    let { buffer } = this.buffer, { types } = buffer.set;
    for (let i = context.length - 1, d = this.stack.length - 1; i >= 0; d--) {
      if (d < 0)
        return matchNodeContext(this._tree, context, i);
      let type = types[buffer.buffer[this.stack[d]]];
      if (!type.isAnonymous) {
        if (context[i] && context[i] != type.name)
          return false;
        i--;
      }
    }
    return true;
  }
};
function hasChild(tree) {
  return tree.children.some((ch) => ch instanceof TreeBuffer || !ch.type.isAnonymous || hasChild(ch));
}
function buildTree(data) {
  var _a;
  let { buffer, nodeSet, maxBufferLength = DefaultBufferLength, reused = [], minRepeatType = nodeSet.types.length } = data;
  let cursor = Array.isArray(buffer) ? new FlatBufferCursor(buffer, buffer.length) : buffer;
  let types = nodeSet.types;
  let contextHash = 0, lookAhead = 0;
  function takeNode(parentStart, minPos, children2, positions2, inRepeat, depth) {
    let { id, start, end, size } = cursor;
    let lookAheadAtStart = lookAhead, contextAtStart = contextHash;
    if (size < 0) {
      cursor.next();
      if (size == -1) {
        let node2 = reused[id];
        children2.push(node2);
        positions2.push(start - parentStart);
        return;
      } else if (size == -3) {
        contextHash = id;
        return;
      } else if (size == -4) {
        lookAhead = id;
        return;
      } else {
        throw new RangeError(`Unrecognized record size: ${size}`);
      }
    }
    let type = types[id], node, buffer2;
    let startPos = start - parentStart;
    if (end - start <= maxBufferLength && (buffer2 = findBufferSize(cursor.pos - minPos, inRepeat))) {
      let data2 = new Uint16Array(buffer2.size - buffer2.skip);
      let endPos = cursor.pos - buffer2.size, index = data2.length;
      while (cursor.pos > endPos)
        index = copyToBuffer(buffer2.start, data2, index);
      node = new TreeBuffer(data2, end - buffer2.start, nodeSet);
      startPos = buffer2.start - parentStart;
    } else {
      let endPos = cursor.pos - size;
      cursor.next();
      let localChildren = [], localPositions = [];
      let localInRepeat = id >= minRepeatType ? id : -1;
      let lastGroup = 0, lastEnd = end, groupLookAhead = lookAheadAtStart;
      while (cursor.pos > endPos) {
        if (localInRepeat >= 0 && cursor.id == localInRepeat && cursor.size >= 0) {
          if (cursor.end <= lastEnd - maxBufferLength) {
            makeRepeatLeaf(localChildren, localPositions, start, lastGroup, cursor.end, lastEnd, localInRepeat, groupLookAhead, contextAtStart);
            lastGroup = localChildren.length;
            lastEnd = cursor.end;
            groupLookAhead = lookAhead;
          }
          cursor.next();
        } else if (depth > 2500) {
          takeFlatNode(start, endPos, localChildren, localPositions);
        } else {
          if (localInRepeat >= 0 && cursor.size == -1 && reused[cursor.id].type == nodeSet.types[localInRepeat]) {
            if (lastGroup < localChildren.length)
              makeRepeatLeaf(localChildren, localPositions, start, lastGroup, cursor.end, lastEnd, localInRepeat, groupLookAhead, contextAtStart);
            lastGroup = localChildren.length + 1;
            lastEnd = cursor.start;
            groupLookAhead = lookAhead;
          }
          takeNode(start, endPos, localChildren, localPositions, localInRepeat, depth + 1);
        }
      }
      if (localInRepeat >= 0 && lastGroup > 0 && lastGroup < localChildren.length)
        makeRepeatLeaf(localChildren, localPositions, start, lastGroup, start, lastEnd, localInRepeat, groupLookAhead, contextAtStart);
      localChildren.reverse();
      localPositions.reverse();
      if (localInRepeat > -1 && lastGroup > 0) {
        let make = makeBalanced(type, contextAtStart);
        node = balanceRange(type, localChildren, localPositions, 0, localChildren.length, 0, end - start, make, make);
      } else {
        node = makeTree(type, localChildren, localPositions, end - start, lookAheadAtStart - end, contextAtStart);
      }
    }
    children2.push(node);
    positions2.push(startPos);
  }
  function takeFlatNode(parentStart, minPos, children2, positions2) {
    let nodes = [];
    let nodeCount = 0, stopAt = -1;
    while (cursor.pos > minPos) {
      let { id, start, end, size } = cursor;
      if (size > 4) {
        cursor.next();
      } else if (stopAt > -1 && start < stopAt) {
        break;
      } else {
        if (stopAt < 0)
          stopAt = end - maxBufferLength;
        nodes.push(id, start, end);
        nodeCount++;
        cursor.next();
      }
    }
    if (nodeCount) {
      let buffer2 = new Uint16Array(nodeCount * 4);
      let start = nodes[nodes.length - 2];
      for (let i = nodes.length - 3, j = 0; i >= 0; i -= 3) {
        buffer2[j++] = nodes[i];
        buffer2[j++] = nodes[i + 1] - start;
        buffer2[j++] = nodes[i + 2] - start;
        buffer2[j++] = j;
      }
      children2.push(new TreeBuffer(buffer2, nodes[2] - start, nodeSet));
      positions2.push(start - parentStart);
    }
  }
  function makeBalanced(type, contextHash2) {
    return (children2, positions2, length2) => {
      let lookAhead2 = 0, lastI = children2.length - 1, last, lookAheadProp;
      if (lastI >= 0 && (last = children2[lastI]) instanceof Tree) {
        if (!lastI && last.type == type && last.length == length2)
          return last;
        if (lookAheadProp = last.prop(NodeProp.lookAhead))
          lookAhead2 = positions2[lastI] + last.length + lookAheadProp - length2;
      }
      return makeTree(type, children2, positions2, length2, lookAhead2, contextHash2);
    };
  }
  function makeRepeatLeaf(children2, positions2, base, i, from, to, type, lookAhead2, contextHash2) {
    let localChildren = [], localPositions = [];
    while (children2.length > i) {
      localChildren.push(children2.pop());
      localPositions.push(positions2.pop() + base - from);
    }
    children2.push(makeTree(nodeSet.types[type], localChildren, localPositions, to - from, lookAhead2 - to, contextHash2));
    positions2.push(from - base);
  }
  function makeTree(type, children2, positions2, length2, lookAhead2, contextHash2, props) {
    if (contextHash2) {
      let pair2 = [NodeProp.contextHash, contextHash2];
      props = props ? [pair2].concat(props) : [pair2];
    }
    if (lookAhead2 > 25) {
      let pair2 = [NodeProp.lookAhead, lookAhead2];
      props = props ? [pair2].concat(props) : [pair2];
    }
    return new Tree(type, children2, positions2, length2, props);
  }
  function findBufferSize(maxSize, inRepeat) {
    let fork = cursor.fork();
    let size = 0, start = 0, skip = 0, minStart = fork.end - maxBufferLength;
    let result = { size: 0, start: 0, skip: 0 };
    scan: for (let minPos = fork.pos - maxSize; fork.pos > minPos; ) {
      let nodeSize2 = fork.size;
      if (fork.id == inRepeat && nodeSize2 >= 0) {
        result.size = size;
        result.start = start;
        result.skip = skip;
        skip += 4;
        size += 4;
        fork.next();
        continue;
      }
      let startPos = fork.pos - nodeSize2;
      if (nodeSize2 < 0 || startPos < minPos || fork.start < minStart)
        break;
      let localSkipped = fork.id >= minRepeatType ? 4 : 0;
      let nodeStart = fork.start;
      fork.next();
      while (fork.pos > startPos) {
        if (fork.size < 0) {
          if (fork.size == -3 || fork.size == -4)
            localSkipped += 4;
          else
            break scan;
        } else if (fork.id >= minRepeatType) {
          localSkipped += 4;
        }
        fork.next();
      }
      start = nodeStart;
      size += nodeSize2;
      skip += localSkipped;
    }
    if (inRepeat < 0 || size == maxSize) {
      result.size = size;
      result.start = start;
      result.skip = skip;
    }
    return result.size > 4 ? result : void 0;
  }
  function copyToBuffer(bufferStart, buffer2, index) {
    let { id, start, end, size } = cursor;
    cursor.next();
    if (size >= 0 && id < minRepeatType) {
      let startIndex = index;
      if (size > 4) {
        let endPos = cursor.pos - (size - 4);
        while (cursor.pos > endPos)
          index = copyToBuffer(bufferStart, buffer2, index);
      }
      buffer2[--index] = startIndex;
      buffer2[--index] = end - bufferStart;
      buffer2[--index] = start - bufferStart;
      buffer2[--index] = id;
    } else if (size == -3) {
      contextHash = id;
    } else if (size == -4) {
      lookAhead = id;
    }
    return index;
  }
  let children = [], positions = [];
  while (cursor.pos > 0)
    takeNode(data.start || 0, data.bufferStart || 0, children, positions, -1, 0);
  let length = (_a = data.length) !== null && _a !== void 0 ? _a : children.length ? positions[0] + children[0].length : 0;
  return new Tree(types[data.topID], children.reverse(), positions.reverse(), length);
}
var nodeSizeCache = /* @__PURE__ */ new WeakMap();
function nodeSize(balanceType, node) {
  if (!balanceType.isAnonymous || node instanceof TreeBuffer || node.type != balanceType)
    return 1;
  let size = nodeSizeCache.get(node);
  if (size == null) {
    size = 1;
    for (let child of node.children) {
      if (child.type != balanceType || !(child instanceof Tree)) {
        size = 1;
        break;
      }
      size += nodeSize(balanceType, child);
    }
    nodeSizeCache.set(node, size);
  }
  return size;
}
function balanceRange(balanceType, children, positions, from, to, start, length, mkTop, mkTree) {
  let total = 0;
  for (let i = from; i < to; i++)
    total += nodeSize(balanceType, children[i]);
  let maxChild = Math.ceil(
    total * 1.5 / 8
    /* Balance.BranchFactor */
  );
  let localChildren = [], localPositions = [];
  function divide(children2, positions2, from2, to2, offset) {
    for (let i = from2; i < to2; ) {
      let groupFrom = i, groupStart = positions2[i], groupSize = nodeSize(balanceType, children2[i]);
      i++;
      for (; i < to2; i++) {
        let nextSize = nodeSize(balanceType, children2[i]);
        if (groupSize + nextSize >= maxChild)
          break;
        groupSize += nextSize;
      }
      if (i == groupFrom + 1) {
        if (groupSize > maxChild) {
          let only = children2[groupFrom];
          divide(only.children, only.positions, 0, only.children.length, positions2[groupFrom] + offset);
          continue;
        }
        localChildren.push(children2[groupFrom]);
      } else {
        let length2 = positions2[i - 1] + children2[i - 1].length - groupStart;
        localChildren.push(balanceRange(balanceType, children2, positions2, groupFrom, i, groupStart, length2, null, mkTree));
      }
      localPositions.push(groupStart + offset - start);
    }
  }
  divide(children, positions, from, to, 0);
  return (mkTop || mkTree)(localChildren, localPositions, length);
}
var Parser = class {
  /**
  Start a parse, returning a [partial parse](#common.PartialParse)
  object. [`fragments`](#common.TreeFragment) can be passed in to
  make the parse incremental.
  
  By default, the entire input is parsed. You can pass `ranges`,
  which should be a sorted array of non-empty, non-overlapping
  ranges, to parse only those ranges. The tree returned in that
  case will start at `ranges[0].from`.
  */
  startParse(input, fragments, ranges) {
    if (typeof input == "string")
      input = new StringInput(input);
    ranges = !ranges ? [new Range(0, input.length)] : ranges.length ? ranges.map((r) => new Range(r.from, r.to)) : [new Range(0, 0)];
    return this.createParse(input, fragments || [], ranges);
  }
  /**
  Run a full parse, returning the resulting tree.
  */
  parse(input, fragments, ranges) {
    let parse = this.startParse(input, fragments, ranges);
    for (; ; ) {
      let done = parse.advance();
      if (done)
        return done;
    }
  }
};
var StringInput = class {
  constructor(string2) {
    this.string = string2;
  }
  get length() {
    return this.string.length;
  }
  chunk(from) {
    return this.string.slice(from);
  }
  get lineChunks() {
    return false;
  }
  read(from, to) {
    return this.string.slice(from, to);
  }
};
var stoppedInner = new NodeProp({ perNode: true });

// node_modules/.pnpm/@lezer+lr@1.4.12/node_modules/@lezer/lr/dist/index.js
var Stack = class _Stack {
  /**
  @internal
  */
  constructor(p, stack, state, reducePos, pos, score, buffer, bufferBase, curContext, lookAhead = 0, parent) {
    this.p = p;
    this.stack = stack;
    this.state = state;
    this.reducePos = reducePos;
    this.pos = pos;
    this.score = score;
    this.buffer = buffer;
    this.bufferBase = bufferBase;
    this.curContext = curContext;
    this.lookAhead = lookAhead;
    this.parent = parent;
  }
  /**
  @internal
  */
  toString() {
    return `[${this.stack.filter((_, i) => i % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
  }
  // Start an empty stack
  /**
  @internal
  */
  static start(p, state, pos = 0) {
    let cx = p.parser.context;
    return new _Stack(p, [], state, pos, pos, 0, [], 0, cx ? new StackContext(cx, cx.start) : null, 0, null);
  }
  /**
  The stack's current [context](#lr.ContextTracker) value, if
  any. Its type will depend on the context tracker's type
  parameter, or it will be `null` if there is no context
  tracker.
  */
  get context() {
    return this.curContext ? this.curContext.context : null;
  }
  // Push a state onto the stack, tracking its start position as well
  // as the buffer base at that point.
  /**
  @internal
  */
  pushState(state, start) {
    this.stack.push(this.state, start, this.bufferBase + this.buffer.length);
    this.state = state;
  }
  // Apply a reduce action
  /**
  @internal
  */
  reduce(action) {
    var _a;
    let depth = action >> 19, type = action & 65535;
    let { parser: parser3 } = this.p;
    let lookaheadRecord = this.reducePos < this.pos - 25 && this.setLookAhead(this.pos);
    let dPrec = parser3.dynamicPrecedence(type);
    if (dPrec)
      this.score += dPrec;
    if (depth == 0) {
      if (type < parser3.minRepeatTerm && this.reducePos < this.pos)
        this.reducePos = this.pos;
      this.pushState(parser3.getGoto(this.state, type, true), this.reducePos);
      if (type < parser3.minRepeatTerm)
        this.storeNode(type, this.reducePos, this.reducePos, lookaheadRecord ? 8 : 4, true);
      this.reduceContext(type, this.reducePos);
      return;
    }
    let base = this.stack.length - (depth - 1) * 3 - (action & 262144 ? 6 : 0);
    let start = base ? this.stack[base - 2] : this.p.ranges[0].from;
    if (type < parser3.minRepeatTerm && start == this.reducePos && this.reducePos < this.pos)
      this.reducePos = this.pos;
    let size = this.reducePos - start;
    if (size >= 2e3 && !((_a = this.p.parser.nodeSet.types[type]) === null || _a === void 0 ? void 0 : _a.isAnonymous)) {
      if (start == this.p.lastBigReductionStart) {
        this.p.bigReductionCount++;
        this.p.lastBigReductionSize = size;
      } else if (this.p.lastBigReductionSize < size) {
        this.p.bigReductionCount = 1;
        this.p.lastBigReductionStart = start;
        this.p.lastBigReductionSize = size;
      }
    }
    let bufferBase = base ? this.stack[base - 1] : 0, count = this.bufferBase + this.buffer.length - bufferBase;
    if (type < parser3.minRepeatTerm || action & 131072) {
      let pos = parser3.stateFlag(
        this.state,
        1
        /* StateFlag.Skipped */
      ) ? this.pos : this.reducePos;
      this.storeNode(type, start, pos, count + 4, true);
    }
    if (action & 262144) {
      this.state = this.stack[base];
    } else {
      let baseStateID = this.stack[base - 3];
      this.state = parser3.getGoto(baseStateID, type, true);
    }
    while (this.stack.length > base)
      this.stack.pop();
    this.reduceContext(type, start);
  }
  // Shift a value into the buffer
  /**
  @internal
  */
  storeNode(term, start, end, size = 4, mustSink = false) {
    if (term == 0 && (!this.stack.length || this.stack[this.stack.length - 1] < this.buffer.length + this.bufferBase)) {
      let top = this.buffer.length;
      if (top > 0 && this.buffer[top - 4] == 0 && this.buffer[top - 1] > -1) {
        if (start == end)
          return;
        if (this.buffer[top - 2] >= start) {
          this.buffer[top - 2] = end;
          return;
        }
      }
    }
    if (!mustSink || this.pos == end) {
      this.buffer.push(term, start, end, size);
    } else {
      let index = this.buffer.length;
      if (index > 0 && (this.buffer[index - 4] != 0 || this.buffer[index - 1] < 0)) {
        let mustMove = false;
        for (let scan = index; scan > 0 && this.buffer[scan - 2] > end; scan -= 4) {
          if (this.buffer[scan - 1] >= 0) {
            mustMove = true;
            break;
          }
        }
        if (mustMove)
          while (index > 0 && this.buffer[index - 2] > end) {
            this.buffer[index] = this.buffer[index - 4];
            this.buffer[index + 1] = this.buffer[index - 3];
            this.buffer[index + 2] = this.buffer[index - 2];
            this.buffer[index + 3] = this.buffer[index - 1];
            index -= 4;
            if (size > 4)
              size -= 4;
          }
      }
      this.buffer[index] = term;
      this.buffer[index + 1] = start;
      this.buffer[index + 2] = end;
      this.buffer[index + 3] = size;
    }
  }
  // Apply a shift action
  /**
  @internal
  */
  shift(action, type, start, end) {
    if (action & 131072) {
      this.pushState(action & 65535, this.pos);
    } else if ((action & 262144) == 0) {
      let nextState = action, { parser: parser3 } = this.p;
      this.pos = end;
      let skipped = parser3.stateFlag(
        nextState,
        1
        /* StateFlag.Skipped */
      );
      if (!skipped && (end > start || type <= parser3.maxNode))
        this.reducePos = end;
      this.pushState(nextState, skipped ? start : Math.min(start, this.reducePos));
      this.shiftContext(type, start);
      if (type <= parser3.maxNode)
        this.buffer.push(type, start, end, 4);
    } else {
      this.pos = end;
      this.shiftContext(type, start);
      if (type <= this.p.parser.maxNode)
        this.buffer.push(type, start, end, 4);
    }
  }
  // Apply an action
  /**
  @internal
  */
  apply(action, next, nextStart, nextEnd) {
    if (action & 65536)
      this.reduce(action);
    else
      this.shift(action, next, nextStart, nextEnd);
  }
  // Add a prebuilt (reused) node into the buffer.
  /**
  @internal
  */
  useNode(value, next, start) {
    let index = this.p.reused.length - 1;
    if (index < 0 || this.p.reused[index] != value) {
      this.p.reused.push(value);
      index++;
    }
    let end = this.reducePos = this.pos = start + value.length;
    this.pushState(next, start);
    this.buffer.push(
      index,
      start,
      end,
      -1
      /* size == -1 means this is a reused value */
    );
    if (this.curContext)
      this.updateContext(this.curContext.tracker.reuse(this.curContext.context, value, this, this.p.stream.reset(this.pos - value.length)));
  }
  // Split the stack. Due to the buffer sharing and the fact
  // that `this.stack` tends to stay quite shallow, this isn't very
  // expensive.
  /**
  @internal
  */
  split() {
    let parent = this;
    let off = parent.buffer.length;
    if (off && parent.buffer[off - 4] == 0)
      off -= 4;
    while (off > 0 && parent.buffer[off - 2] > parent.reducePos)
      off -= 4;
    let buffer = parent.buffer.slice(off), base = parent.bufferBase + off;
    while (parent && base == parent.bufferBase)
      parent = parent.parent;
    return new _Stack(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, buffer, base, this.curContext, this.lookAhead, parent);
  }
  // Try to recover from an error by 'deleting' (ignoring) one token.
  /**
  @internal
  */
  recoverByDelete(next, nextEnd) {
    let isNode = next <= this.p.parser.maxNode;
    if (isNode)
      this.storeNode(next, this.pos, nextEnd, 4);
    this.storeNode(0, this.pos, nextEnd, isNode ? 8 : 4);
    this.pos = this.reducePos = nextEnd;
    this.score -= 190;
  }
  /**
  Check if the given term would be able to be shifted (optionally
  after some reductions) on this stack. This can be useful for
  external tokenizers that want to make sure they only provide a
  given token when it applies.
  */
  canShift(term) {
    for (let sim = new SimulatedStack(this); ; ) {
      let action = this.p.parser.stateSlot(
        sim.state,
        4
        /* ParseState.DefaultReduce */
      ) || this.p.parser.hasAction(sim.state, term);
      if (action == 0)
        return false;
      if ((action & 65536) == 0)
        return true;
      sim.reduce(action);
    }
  }
  // Apply up to Recover.MaxNext recovery actions that conceptually
  // inserts some missing token or rule.
  /**
  @internal
  */
  recoverByInsert(next) {
    if (this.stack.length >= 300)
      return [];
    let nextStates = this.p.parser.nextStates(this.state);
    if (nextStates.length > 4 << 1 || this.stack.length >= 120) {
      let best = [];
      for (let i = 0, s; i < nextStates.length; i += 2) {
        if ((s = nextStates[i + 1]) != this.state && this.p.parser.hasAction(s, next))
          best.push(nextStates[i], s);
      }
      if (this.stack.length < 120)
        for (let i = 0; best.length < 4 << 1 && i < nextStates.length; i += 2) {
          let s = nextStates[i + 1];
          if (!best.some((v, i2) => i2 & 1 && v == s))
            best.push(nextStates[i], s);
        }
      nextStates = best;
    }
    let result = [];
    for (let i = 0; i < nextStates.length && result.length < 4; i += 2) {
      let s = nextStates[i + 1];
      if (s == this.state)
        continue;
      let stack = this.split();
      stack.pushState(s, this.pos);
      stack.storeNode(0, stack.pos, stack.pos, 4, true);
      stack.shiftContext(nextStates[i], this.pos);
      stack.reducePos = this.pos;
      stack.score -= 200;
      result.push(stack);
    }
    return result;
  }
  // Force a reduce, if possible. Return false if that can't
  // be done.
  /**
  @internal
  */
  forceReduce() {
    let { parser: parser3 } = this.p;
    let reduce = parser3.stateSlot(
      this.state,
      5
      /* ParseState.ForcedReduce */
    );
    if ((reduce & 65536) == 0)
      return false;
    if (!parser3.validAction(this.state, reduce)) {
      let depth = reduce >> 19, term = reduce & 65535;
      let target = this.stack.length - depth * 3;
      if (target < 0 || parser3.getGoto(this.stack[target], term, false) < 0) {
        let backup = this.findForcedReduction();
        if (backup == null)
          return false;
        reduce = backup;
      }
      this.storeNode(0, this.pos, this.pos, 4, true);
      this.score -= 100;
    }
    this.reducePos = this.pos;
    this.reduce(reduce);
    return true;
  }
  /**
  Try to scan through the automaton to find some kind of reduction
  that can be applied. Used when the regular ForcedReduce field
  isn't a valid action. @internal
  */
  findForcedReduction() {
    let { parser: parser3 } = this.p, seen = [];
    let explore = (state, depth) => {
      if (seen.includes(state))
        return;
      seen.push(state);
      return parser3.allActions(state, (action) => {
        if (action & (262144 | 131072)) ;
        else if (action & 65536) {
          let rDepth = (action >> 19) - depth;
          if (rDepth > 1) {
            let term = action & 65535, target = this.stack.length - rDepth * 3;
            if (target >= 0 && parser3.getGoto(this.stack[target], term, false) >= 0)
              return rDepth << 19 | 65536 | term;
          }
        } else {
          let found = explore(action, depth + 1);
          if (found != null)
            return found;
        }
      });
    };
    return explore(this.state, 0);
  }
  /**
  @internal
  */
  forceAll() {
    while (!this.p.parser.stateFlag(
      this.state,
      2
      /* StateFlag.Accepting */
    )) {
      if (!this.forceReduce()) {
        this.storeNode(0, this.pos, this.pos, 4, true);
        break;
      }
    }
    return this;
  }
  /**
  Check whether this state has no further actions (assumed to be a direct descendant of the
  top state, since any other states must be able to continue
  somehow). @internal
  */
  get deadEnd() {
    if (this.stack.length != 3)
      return false;
    let { parser: parser3 } = this.p;
    return parser3.data[parser3.stateSlot(
      this.state,
      1
      /* ParseState.Actions */
    )] == 65535 && !parser3.stateSlot(
      this.state,
      4
      /* ParseState.DefaultReduce */
    );
  }
  /**
  Restart the stack (put it back in its start state). Only safe
  when this.stack.length == 3 (state is directly below the top
  state). @internal
  */
  restart() {
    this.storeNode(0, this.pos, this.pos, 4, true);
    this.state = this.stack[0];
    this.stack.length = 0;
  }
  /**
  @internal
  */
  sameState(other) {
    if (this.state != other.state || this.stack.length != other.stack.length)
      return false;
    for (let i = 0; i < this.stack.length; i += 3)
      if (this.stack[i] != other.stack[i])
        return false;
    return true;
  }
  /**
  Get the parser used by this stack.
  */
  get parser() {
    return this.p.parser;
  }
  /**
  Test whether a given dialect (by numeric ID, as exported from
  the terms file) is enabled.
  */
  dialectEnabled(dialectID) {
    return this.p.parser.dialect.flags[dialectID];
  }
  shiftContext(term, start) {
    if (this.curContext)
      this.updateContext(this.curContext.tracker.shift(this.curContext.context, term, this, this.p.stream.reset(start)));
  }
  reduceContext(term, start) {
    if (this.curContext)
      this.updateContext(this.curContext.tracker.reduce(this.curContext.context, term, this, this.p.stream.reset(start)));
  }
  /**
  @internal
  */
  emitContext() {
    let last = this.buffer.length - 1;
    if (last < 0 || this.buffer[last] != -3)
      this.storeNode(this.curContext.hash, this.reducePos, this.reducePos, -3, true);
  }
  /**
  @internal
  */
  emitLookAhead() {
    let last = this.buffer.length - 1;
    if (last < 0 || this.buffer[last] != -4)
      this.buffer.push(this.lookAhead, this.pos, this.pos, -4);
  }
  updateContext(context) {
    if (context != this.curContext.context) {
      let newCx = new StackContext(this.curContext.tracker, context);
      if (newCx.hash != this.curContext.hash)
        this.emitContext();
      this.curContext = newCx;
    }
  }
  /**
  @internal
  */
  setLookAhead(lookAhead) {
    if (lookAhead <= this.lookAhead)
      return false;
    this.emitLookAhead();
    this.lookAhead = lookAhead;
    return true;
  }
  /**
  @internal
  */
  close() {
    if (this.curContext && this.curContext.tracker.strict)
      this.emitContext();
    if (this.lookAhead > 0)
      this.emitLookAhead();
  }
};
var StackContext = class {
  constructor(tracker, context) {
    this.tracker = tracker;
    this.context = context;
    this.hash = tracker.strict ? tracker.hash(context) : 0;
  }
};
var SimulatedStack = class {
  constructor(start) {
    this.start = start;
    this.state = start.state;
    this.stack = start.stack;
    this.base = this.stack.length;
  }
  reduce(action) {
    let term = action & 65535, depth = action >> 19;
    if (depth == 0) {
      if (this.stack == this.start.stack)
        this.stack = this.stack.slice();
      this.stack.push(this.state, 0, 0);
      this.base += 3;
    } else {
      this.base -= (depth - 1) * 3;
    }
    let goto = this.start.p.parser.getGoto(this.stack[this.base - 3], term, true);
    this.state = goto;
  }
};
var StackBufferCursor = class _StackBufferCursor {
  constructor(stack, pos, index) {
    this.stack = stack;
    this.pos = pos;
    this.index = index;
    this.buffer = stack.buffer;
    if (this.index == 0)
      this.maybeNext();
  }
  static create(stack, pos = stack.bufferBase + stack.buffer.length) {
    return new _StackBufferCursor(stack, pos, pos - stack.bufferBase);
  }
  maybeNext() {
    let next = this.stack.parent;
    if (next != null) {
      this.index = this.stack.bufferBase - next.bufferBase;
      this.stack = next;
      this.buffer = next.buffer;
    }
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  next() {
    this.index -= 4;
    this.pos -= 4;
    if (this.index == 0)
      this.maybeNext();
  }
  fork() {
    return new _StackBufferCursor(this.stack, this.pos, this.index);
  }
};
function decodeArray(input, Type = Uint16Array) {
  if (typeof input != "string")
    return input;
  let array2 = null;
  for (let pos = 0, out = 0; pos < input.length; ) {
    let value = 0;
    for (; ; ) {
      let next = input.charCodeAt(pos++), stop = false;
      if (next == 126) {
        value = 65535;
        break;
      }
      if (next >= 92)
        next--;
      if (next >= 34)
        next--;
      let digit = next - 32;
      if (digit >= 46) {
        digit -= 46;
        stop = true;
      }
      value += digit;
      if (stop)
        break;
      value *= 46;
    }
    if (array2)
      array2[out++] = value;
    else
      array2 = new Type(value);
  }
  return array2;
}
var CachedToken = class {
  constructor() {
    this.start = -1;
    this.value = -1;
    this.end = -1;
    this.extended = -1;
    this.lookAhead = 0;
    this.mask = 0;
    this.context = 0;
  }
};
var nullToken = new CachedToken();
var InputStream = class {
  /**
  @internal
  */
  constructor(input, ranges) {
    this.input = input;
    this.ranges = ranges;
    this.chunk = "";
    this.chunkOff = 0;
    this.chunk2 = "";
    this.chunk2Pos = 0;
    this.next = -1;
    this.token = nullToken;
    this.rangeIndex = 0;
    this.pos = this.chunkPos = ranges[0].from;
    this.range = ranges[0];
    this.end = ranges[ranges.length - 1].to;
    this.readNext();
  }
  /**
  @internal
  */
  resolveOffset(offset, assoc) {
    let range = this.range, index = this.rangeIndex;
    let pos = this.pos + offset;
    while (pos < range.from) {
      if (!index)
        return null;
      let next = this.ranges[--index];
      pos -= range.from - next.to;
      range = next;
    }
    while (assoc < 0 ? pos > range.to : pos >= range.to) {
      if (index == this.ranges.length - 1)
        return null;
      let next = this.ranges[++index];
      pos += next.from - range.to;
      range = next;
    }
    return pos;
  }
  /**
  @internal
  */
  clipPos(pos) {
    if (pos >= this.range.from && pos < this.range.to)
      return pos;
    for (let range of this.ranges)
      if (range.to > pos)
        return Math.max(pos, range.from);
    return this.end;
  }
  /**
  Look at a code unit near the stream position. `.peek(0)` equals
  `.next`, `.peek(-1)` gives you the previous character, and so
  on.
  
  Note that looking around during tokenizing creates dependencies
  on potentially far-away content, which may reduce the
  effectiveness incremental parsing—when looking forward—or even
  cause invalid reparses when looking backward more than 25 code
  units, since the library does not track lookbehind.
  */
  peek(offset) {
    let idx = this.chunkOff + offset, pos, result;
    if (idx >= 0 && idx < this.chunk.length) {
      pos = this.pos + offset;
      result = this.chunk.charCodeAt(idx);
    } else {
      let resolved = this.resolveOffset(offset, 1);
      if (resolved == null)
        return -1;
      pos = resolved;
      if (pos >= this.chunk2Pos && pos < this.chunk2Pos + this.chunk2.length) {
        result = this.chunk2.charCodeAt(pos - this.chunk2Pos);
      } else {
        let i = this.rangeIndex, range = this.range;
        while (range.to <= pos)
          range = this.ranges[++i];
        this.chunk2 = this.input.chunk(this.chunk2Pos = pos);
        if (pos + this.chunk2.length > range.to)
          this.chunk2 = this.chunk2.slice(0, range.to - pos);
        result = this.chunk2.charCodeAt(0);
      }
    }
    if (pos >= this.token.lookAhead)
      this.token.lookAhead = pos + 1;
    return result;
  }
  /**
  Accept a token. By default, the end of the token is set to the
  current stream position, but you can pass an offset (relative to
  the stream position) to change that.
  */
  acceptToken(token, endOffset = 0) {
    let end = endOffset ? this.resolveOffset(endOffset, -1) : this.pos;
    if (end == null || end < this.token.start)
      throw new RangeError("Token end out of bounds");
    this.token.value = token;
    this.token.end = end;
  }
  /**
  Accept a token ending at a specific given position.
  */
  acceptTokenTo(token, endPos) {
    this.token.value = token;
    this.token.end = endPos;
  }
  getChunk() {
    if (this.pos >= this.chunk2Pos && this.pos < this.chunk2Pos + this.chunk2.length) {
      let { chunk, chunkPos } = this;
      this.chunk = this.chunk2;
      this.chunkPos = this.chunk2Pos;
      this.chunk2 = chunk;
      this.chunk2Pos = chunkPos;
      this.chunkOff = this.pos - this.chunkPos;
    } else {
      this.chunk2 = this.chunk;
      this.chunk2Pos = this.chunkPos;
      let nextChunk = this.input.chunk(this.pos);
      let end = this.pos + nextChunk.length;
      this.chunk = end > this.range.to ? nextChunk.slice(0, this.range.to - this.pos) : nextChunk;
      this.chunkPos = this.pos;
      this.chunkOff = 0;
    }
  }
  readNext() {
    if (this.chunkOff >= this.chunk.length) {
      this.getChunk();
      if (this.chunkOff == this.chunk.length)
        return this.next = -1;
    }
    return this.next = this.chunk.charCodeAt(this.chunkOff);
  }
  /**
  Move the stream forward N (defaults to 1) code units. Returns
  the new value of [`next`](#lr.InputStream.next).
  */
  advance(n2 = 1) {
    this.chunkOff += n2;
    while (this.pos + n2 >= this.range.to) {
      if (this.rangeIndex == this.ranges.length - 1)
        return this.setDone();
      n2 -= this.range.to - this.pos;
      this.range = this.ranges[++this.rangeIndex];
      this.pos = this.range.from;
    }
    this.pos += n2;
    if (this.pos >= this.token.lookAhead)
      this.token.lookAhead = this.pos + 1;
    return this.readNext();
  }
  setDone() {
    this.pos = this.chunkPos = this.end;
    this.range = this.ranges[this.rangeIndex = this.ranges.length - 1];
    this.chunk = "";
    return this.next = -1;
  }
  /**
  @internal
  */
  reset(pos, token) {
    if (token) {
      this.token = token;
      token.start = pos;
      token.lookAhead = pos + 1;
      token.value = token.extended = -1;
    } else {
      this.token = nullToken;
    }
    if (this.pos != pos) {
      this.pos = pos;
      if (pos == this.end) {
        this.setDone();
        return this;
      }
      while (pos < this.range.from)
        this.range = this.ranges[--this.rangeIndex];
      while (pos >= this.range.to)
        this.range = this.ranges[++this.rangeIndex];
      if (pos >= this.chunkPos && pos < this.chunkPos + this.chunk.length) {
        this.chunkOff = pos - this.chunkPos;
      } else {
        this.chunk = "";
        this.chunkOff = 0;
      }
      this.readNext();
    }
    return this;
  }
  /**
  @internal
  */
  read(from, to) {
    if (from >= this.chunkPos && to <= this.chunkPos + this.chunk.length)
      return this.chunk.slice(from - this.chunkPos, to - this.chunkPos);
    if (from >= this.chunk2Pos && to <= this.chunk2Pos + this.chunk2.length)
      return this.chunk2.slice(from - this.chunk2Pos, to - this.chunk2Pos);
    if (from >= this.range.from && to <= this.range.to)
      return this.input.read(from, to);
    let result = "";
    for (let r of this.ranges) {
      if (r.from >= to)
        break;
      if (r.to > from)
        result += this.input.read(Math.max(r.from, from), Math.min(r.to, to));
    }
    return result;
  }
};
var TokenGroup = class {
  constructor(data, id) {
    this.data = data;
    this.id = id;
  }
  token(input, stack) {
    let { parser: parser3 } = stack.p;
    readToken(this.data, input, stack, this.id, parser3.data, parser3.tokenPrecTable);
  }
};
TokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
var LocalTokenGroup = class {
  constructor(data, precTable, elseToken) {
    this.precTable = precTable;
    this.elseToken = elseToken;
    this.data = typeof data == "string" ? decodeArray(data) : data;
  }
  token(input, stack) {
    let start = input.pos, skipped = 0;
    for (; ; ) {
      let atEof = input.next < 0, nextPos = input.resolveOffset(1, 1);
      readToken(this.data, input, stack, 0, this.data, this.precTable);
      if (input.token.value > -1)
        break;
      if (this.elseToken == null)
        return;
      if (!atEof)
        skipped++;
      if (nextPos == null)
        break;
      input.reset(nextPos, input.token);
    }
    if (skipped) {
      input.reset(start, input.token);
      input.acceptToken(this.elseToken, skipped);
    }
  }
};
LocalTokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
function readToken(data, input, stack, group, precTable, precOffset) {
  let state = 0, groupMask = 1 << group, { dialect } = stack.p.parser;
  scan: for (; ; ) {
    if ((groupMask & data[state]) == 0)
      break;
    let accEnd = data[state + 1];
    for (let i = state + 3; i < accEnd; i += 2)
      if ((data[i + 1] & groupMask) > 0) {
        let term = data[i];
        if (dialect.allows(term) && (input.token.value == -1 || input.token.value == term || overrides(term, input.token.value, precTable, precOffset))) {
          input.acceptToken(term);
          break;
        }
      }
    let next = input.next, low = 0, high = data[state + 2];
    if (input.next < 0 && high > low && data[accEnd + high * 3 - 3] == 65535) {
      state = data[accEnd + high * 3 - 1];
      continue scan;
    }
    for (; low < high; ) {
      let mid = low + high >> 1;
      let index = accEnd + mid + (mid << 1);
      let from = data[index], to = data[index + 1] || 65536;
      if (next < from)
        high = mid;
      else if (next >= to)
        low = mid + 1;
      else {
        state = data[index + 2];
        input.advance();
        continue scan;
      }
    }
    break;
  }
}
function findOffset(data, start, term) {
  for (let i = start, next; (next = data[i]) != 65535; i++)
    if (next == term)
      return i - start;
  return -1;
}
function overrides(token, prev, tableData, tableOffset) {
  let iPrev = findOffset(tableData, tableOffset, prev);
  return iPrev < 0 || findOffset(tableData, tableOffset, token) < iPrev;
}
var verbose = typeof process != "undefined" && process.env && /\bparse\b/.test(process.env.LOG);
var stackIDs = null;
function cutAt(tree, pos, side) {
  let cursor = tree.cursor(IterMode.IncludeAnonymous);
  cursor.moveTo(pos);
  for (; ; ) {
    if (!(side < 0 ? cursor.childBefore(pos) : cursor.childAfter(pos)))
      for (; ; ) {
        if ((side < 0 ? cursor.to < pos : cursor.from > pos) && !cursor.type.isError)
          return side < 0 ? Math.max(0, Math.min(
            cursor.to - 1,
            pos - 25
            /* Lookahead.Margin */
          )) : Math.min(tree.length, Math.max(
            cursor.from + 1,
            pos + 25
            /* Lookahead.Margin */
          ));
        if (side < 0 ? cursor.prevSibling() : cursor.nextSibling())
          break;
        if (!cursor.parent())
          return side < 0 ? 0 : tree.length;
      }
  }
}
var FragmentCursor = class {
  constructor(fragments, minRepeat) {
    this.fragments = fragments;
    this.minRepeat = minRepeat;
    this.i = 0;
    this.fragment = null;
    this.safeFrom = -1;
    this.safeTo = -1;
    this.trees = [];
    this.start = [];
    this.index = [];
    this.lastRepeat = null;
    this.lastRepeatPos = -1;
    this.nextFragment();
  }
  nextFragment() {
    let fr = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
    if (fr) {
      this.safeFrom = fr.openStart ? cutAt(fr.tree, fr.from + fr.offset, 1) - fr.offset : fr.from;
      this.safeTo = fr.openEnd ? cutAt(fr.tree, fr.to + fr.offset, -1) - fr.offset : fr.to;
      while (this.trees.length) {
        this.trees.pop();
        this.start.pop();
        this.index.pop();
      }
      this.trees.push(fr.tree);
      this.start.push(-fr.offset);
      this.index.push(0);
      this.nextStart = this.safeFrom;
    } else {
      this.nextStart = 1e9;
    }
  }
  // `pos` must be >= any previously given `pos` for this cursor
  nodeAt(pos) {
    if (pos < this.nextStart)
      return null;
    while (this.fragment && this.safeTo <= pos)
      this.nextFragment();
    if (!this.fragment)
      return null;
    for (; ; ) {
      let last = this.trees.length - 1;
      if (last < 0) {
        this.nextFragment();
        return null;
      }
      if (pos < this.safeFrom)
        return null;
      let top = this.trees[last], index = this.index[last];
      if (index == top.children.length) {
        this.trees.pop();
        this.start.pop();
        this.index.pop();
        continue;
      }
      let next = top.children[index];
      let start = this.start[last] + top.positions[index];
      if (start > pos) {
        this.nextStart = start;
        return null;
      }
      if (next instanceof Tree) {
        let storeRepeat = start > this.lastRepeatPos && next.type.id >= this.minRepeat;
        if (start == pos || storeRepeat) {
          let end = start + next.length, lookahead;
          if (start >= this.safeFrom && end <= this.safeTo && (!(lookahead = next.prop(NodeProp.lookAhead)) || end + lookahead < this.fragment.to)) {
            if (storeRepeat) {
              this.lastRepeat = next;
              this.lastRepeatPos = start;
            }
            if (start == pos)
              return next;
          }
        }
        this.index[last]++;
        if (start + next.length >= Math.max(this.safeFrom, pos)) {
          this.trees.push(next);
          this.start.push(start);
          this.index.push(0);
        }
      } else {
        this.index[last]++;
        this.nextStart = start + next.length;
      }
    }
  }
};
var TokenCache = class {
  constructor(parser3, stream) {
    this.stream = stream;
    this.tokens = [];
    this.mainToken = null;
    this.actions = [];
    this.tokens = parser3.tokenizers.map((_) => new CachedToken());
  }
  getActions(stack) {
    let actionIndex = 0;
    let main = null;
    let { parser: parser3 } = stack.p, { tokenizers } = parser3;
    let mask = parser3.stateSlot(
      stack.state,
      3
      /* ParseState.TokenizerMask */
    );
    let context = stack.curContext ? stack.curContext.hash : 0;
    let lookAhead = 0;
    for (let i = 0; i < tokenizers.length; i++) {
      if ((1 << i & mask) == 0)
        continue;
      let tokenizer = tokenizers[i], token = this.tokens[i];
      if (main && !tokenizer.fallback)
        continue;
      if (tokenizer.contextual || token.start != stack.pos || token.mask != mask || token.context != context) {
        this.updateCachedToken(token, tokenizer, stack);
        token.mask = mask;
        token.context = context;
      }
      if (token.lookAhead > token.end + 25)
        lookAhead = Math.max(token.lookAhead, lookAhead);
      if (token.value != 0) {
        let startIndex = actionIndex;
        if (token.extended > -1)
          actionIndex = this.addActions(stack, token.extended, token.end, actionIndex);
        actionIndex = this.addActions(stack, token.value, token.end, actionIndex);
        if (!tokenizer.extend) {
          main = token;
          if (actionIndex > startIndex)
            break;
        }
      }
    }
    while (this.actions.length > actionIndex)
      this.actions.pop();
    if (lookAhead)
      stack.setLookAhead(lookAhead);
    if (!main && stack.pos == this.stream.end) {
      main = new CachedToken();
      main.value = stack.p.parser.eofTerm;
      main.start = main.end = stack.pos;
      actionIndex = this.addActions(stack, main.value, main.end, actionIndex);
    }
    this.mainToken = main;
    return this.actions;
  }
  getMainToken(stack) {
    if (this.mainToken)
      return this.mainToken;
    let main = new CachedToken(), { pos, p } = stack;
    main.start = pos;
    main.end = Math.min(pos + 1, p.stream.end);
    main.value = pos == p.stream.end ? p.parser.eofTerm : 0;
    return main;
  }
  updateCachedToken(token, tokenizer, stack) {
    let start = this.stream.clipPos(stack.pos);
    tokenizer.token(this.stream.reset(start, token), stack);
    if (token.value > -1) {
      let { parser: parser3 } = stack.p;
      for (let i = 0; i < parser3.specialized.length; i++)
        if (parser3.specialized[i] == token.value) {
          let result = parser3.specializers[i](this.stream.read(token.start, token.end), stack);
          if (result >= 0 && stack.p.parser.dialect.allows(result >> 1)) {
            if ((result & 1) == 0)
              token.value = result >> 1;
            else
              token.extended = result >> 1;
            break;
          }
        }
    } else {
      token.value = 0;
      token.end = this.stream.clipPos(start + 1);
    }
  }
  putAction(action, token, end, index) {
    for (let i = 0; i < index; i += 3)
      if (this.actions[i] == action)
        return index;
    this.actions[index++] = action;
    this.actions[index++] = token;
    this.actions[index++] = end;
    return index;
  }
  addActions(stack, token, end, index) {
    let { state } = stack, { parser: parser3 } = stack.p, { data } = parser3;
    for (let set = 0; set < 2; set++) {
      for (let i = parser3.stateSlot(
        state,
        set ? 2 : 1
        /* ParseState.Actions */
      ); ; i += 3) {
        if (data[i] == 65535) {
          if (data[i + 1] == 1) {
            i = pair(data, i + 2);
          } else {
            if (index == 0 && data[i + 1] == 2)
              index = this.putAction(pair(data, i + 2), token, end, index);
            break;
          }
        }
        if (data[i] == token)
          index = this.putAction(pair(data, i + 1), token, end, index);
      }
    }
    return index;
  }
};
var Parse = class {
  constructor(parser3, input, fragments, ranges) {
    this.parser = parser3;
    this.input = input;
    this.ranges = ranges;
    this.recovering = 0;
    this.nextStackID = 9812;
    this.minStackPos = 0;
    this.reused = [];
    this.stoppedAt = null;
    this.lastBigReductionStart = -1;
    this.lastBigReductionSize = 0;
    this.bigReductionCount = 0;
    this.stream = new InputStream(input, ranges);
    this.tokens = new TokenCache(parser3, this.stream);
    this.topTerm = parser3.top[1];
    let { from } = ranges[0];
    this.stacks = [Stack.start(this, parser3.top[0], from)];
    this.fragments = fragments.length && this.stream.end - from > parser3.bufferLength * 4 ? new FragmentCursor(fragments, parser3.minRepeatTerm) : null;
  }
  get parsedPos() {
    return this.minStackPos;
  }
  // Move the parser forward. This will process all parse stacks at
  // `this.pos` and try to advance them to a further position. If no
  // stack for such a position is found, it'll start error-recovery.
  //
  // When the parse is finished, this will return a syntax tree. When
  // not, it returns `null`.
  advance() {
    let stacks = this.stacks, pos = this.minStackPos;
    let newStacks = this.stacks = [];
    let stopped, stoppedTokens;
    if (this.bigReductionCount > 300 && stacks.length == 1) {
      let [s] = stacks;
      while (s.forceReduce() && s.stack.length && s.stack[s.stack.length - 2] >= this.lastBigReductionStart) {
      }
      this.bigReductionCount = this.lastBigReductionSize = 0;
    }
    for (let i = 0; i < stacks.length; i++) {
      let stack = stacks[i];
      for (; ; ) {
        this.tokens.mainToken = null;
        if (stack.pos > pos) {
          newStacks.push(stack);
        } else if (this.advanceStack(stack, newStacks, stacks)) {
          continue;
        } else {
          if (!stopped) {
            stopped = [];
            stoppedTokens = [];
          }
          stopped.push(stack);
          let tok = this.tokens.getMainToken(stack);
          stoppedTokens.push(tok.value, tok.end);
        }
        break;
      }
    }
    if (!newStacks.length) {
      let finished = stopped && findFinished(stopped);
      if (finished) {
        if (verbose)
          console.log("Finish with " + this.stackID(finished));
        return this.stackToTree(finished);
      }
      if (this.parser.strict) {
        if (verbose && stopped)
          console.log("Stuck with token " + (this.tokens.mainToken ? this.parser.getName(this.tokens.mainToken.value) : "none"));
        throw new SyntaxError("No parse at " + pos);
      }
      if (!this.recovering)
        this.recovering = 5;
    }
    if (this.recovering && stopped) {
      let finished = this.stoppedAt != null && stopped[0].pos > this.stoppedAt ? stopped[0] : this.runRecovery(stopped, stoppedTokens, newStacks);
      if (finished) {
        if (verbose)
          console.log("Force-finish " + this.stackID(finished));
        return this.stackToTree(finished.forceAll());
      }
    }
    if (this.recovering) {
      let maxRemaining = this.recovering == 1 ? 1 : this.recovering * 3;
      if (newStacks.length > maxRemaining) {
        newStacks.sort((a, b) => b.score - a.score);
        while (newStacks.length > maxRemaining)
          newStacks.pop();
      }
      if (newStacks.some((s) => s.reducePos > pos))
        this.recovering--;
    } else if (newStacks.length > 1) {
      outer: for (let i = 0; i < newStacks.length - 1; i++) {
        let stack = newStacks[i];
        for (let j = i + 1; j < newStacks.length; j++) {
          let other = newStacks[j];
          if (stack.sameState(other) || stack.buffer.length > 500 && other.buffer.length > 500) {
            if ((stack.score - other.score || stack.buffer.length - other.buffer.length) > 0) {
              newStacks.splice(j--, 1);
            } else {
              newStacks.splice(i--, 1);
              continue outer;
            }
          }
        }
      }
      if (newStacks.length > 12) {
        newStacks.sort((a, b) => b.score - a.score);
        newStacks.splice(
          12,
          newStacks.length - 12
          /* Rec.MaxStackCount */
        );
      }
    }
    this.minStackPos = newStacks[0].pos;
    for (let i = 1; i < newStacks.length; i++)
      if (newStacks[i].pos < this.minStackPos)
        this.minStackPos = newStacks[i].pos;
    return null;
  }
  stopAt(pos) {
    if (this.stoppedAt != null && this.stoppedAt < pos)
      throw new RangeError("Can't move stoppedAt forward");
    this.stoppedAt = pos;
  }
  // See if a given tree, or a descendant right at its start, can be
  // reused in the given stack.
  tryReuse(stack, start, tree, repeatOnly) {
    if (!tree)
      return null;
    let strictCx = stack.curContext && stack.curContext.tracker.strict, cxHash = strictCx ? stack.curContext.hash : 0;
    for (; tree; ) {
      let match = this.parser.nodeSet.types[tree.type.id] != tree.type ? -1 : this.parser.getGoto(stack.state, tree.type.id);
      if (match > -1 && tree.length && (!strictCx || (tree.prop(NodeProp.contextHash) || 0) == cxHash)) {
        stack.useNode(tree, match, start);
        return tree;
      }
      if (tree.children.length == 0 || tree.positions[0] > 0)
        break;
      let inner = tree.children[0];
      if (inner instanceof Tree && (!repeatOnly || inner.type.id >= this.parser.minRepeatTerm))
        tree = inner;
      else
        break;
    }
    return null;
  }
  // Returns an updated version of the given stack, or null if the
  // stack can't advance normally. When `split` and `stacks` are
  // given, stacks split off by ambiguous operations will be pushed to
  // `split`, or added to `stacks` if they move `pos` forward.
  advanceStack(stack, stacks, split) {
    let start = stack.pos, { parser: parser3 } = this;
    let base = verbose ? this.stackID(stack) + " -> " : "";
    if (this.stoppedAt != null && start > this.stoppedAt)
      return stack.forceReduce() ? stack : null;
    if (this.fragments) {
      let reused = stack.reducePos < start && stack.buffer.length && stack.buffer[stack.buffer.length - 2] <= stack.reducePos && this.fragments.lastRepeatPos == stack.reducePos && this.tryReuse(stack, stack.reducePos, this.fragments.lastRepeat, true) || this.tryReuse(stack, start, this.fragments.nodeAt(start), false);
      if (reused) {
        if (verbose)
          console.log(base + this.stackID(stack) + ` (via reuse of ${parser3.getName(reused.type.id)})`);
        return true;
      }
    }
    let defaultReduce = parser3.stateSlot(
      stack.state,
      4
      /* ParseState.DefaultReduce */
    );
    if (defaultReduce > 0) {
      stack.reduce(defaultReduce);
      if (verbose)
        console.log(base + this.stackID(stack) + ` (via always-reduce ${parser3.getName(
          defaultReduce & 65535
          /* Action.ValueMask */
        )})`);
      return true;
    }
    if (stack.stack.length >= 8400) {
      while (stack.stack.length > 6e3 && stack.forceReduce()) {
      }
    }
    let actions = this.tokens.getActions(stack);
    for (let i = 0; i < actions.length; ) {
      let action = actions[i++], term = actions[i++], end = actions[i++];
      let last = i == actions.length || !split;
      let localStack = last ? stack : stack.split();
      let main = this.tokens.mainToken;
      localStack.apply(action, term, main ? main.start : localStack.pos, end);
      if (verbose)
        console.log(base + this.stackID(localStack) + ` (via ${(action & 65536) == 0 ? "shift" : `reduce of ${parser3.getName(
          action & 65535
          /* Action.ValueMask */
        )}`} for ${parser3.getName(term)} @ ${start}${localStack == stack ? "" : ", split"})`);
      if (last)
        return true;
      else if (localStack.pos > start)
        stacks.push(localStack);
      else
        split.push(localStack);
    }
    return false;
  }
  // Advance a given stack forward as far as it will go. Returns the
  // (possibly updated) stack if it got stuck, or null if it moved
  // forward and was given to `pushStackDedup`.
  advanceFully(stack, newStacks) {
    let pos = stack.pos;
    for (; ; ) {
      if (!this.advanceStack(stack, null, null))
        return false;
      if (stack.pos > pos) {
        pushStackDedup(stack, newStacks);
        return true;
      }
    }
  }
  runRecovery(stacks, tokens, newStacks) {
    let finished = null, restarted = false;
    for (let i = 0; i < stacks.length; i++) {
      let stack = stacks[i], token = tokens[i << 1], tokenEnd = tokens[(i << 1) + 1];
      let base = verbose ? this.stackID(stack) + " -> " : "";
      if (stack.deadEnd) {
        if (restarted)
          continue;
        restarted = true;
        stack.restart();
        if (verbose)
          console.log(base + this.stackID(stack) + " (restarted)");
        let done = this.advanceFully(stack, newStacks);
        if (done)
          continue;
      }
      let force = stack.split(), forceBase = base;
      for (let j = 0; j < 10 && force.forceReduce(); j++) {
        if (verbose)
          console.log(forceBase + this.stackID(force) + " (via force-reduce)");
        let done = this.advanceFully(force, newStacks);
        if (done)
          break;
        if (verbose)
          forceBase = this.stackID(force) + " -> ";
      }
      for (let insert of stack.recoverByInsert(token)) {
        if (verbose)
          console.log(base + this.stackID(insert) + " (via recover-insert)");
        this.advanceFully(insert, newStacks);
      }
      if (this.stream.end > stack.pos) {
        if (tokenEnd == stack.pos) {
          tokenEnd++;
          token = 0;
        }
        stack.recoverByDelete(token, tokenEnd);
        if (verbose)
          console.log(base + this.stackID(stack) + ` (via recover-delete ${this.parser.getName(token)})`);
        pushStackDedup(stack, newStacks);
      } else if (!finished || finished.score < force.score) {
        finished = force;
      }
    }
    return finished;
  }
  // Convert the stack's buffer to a syntax tree.
  stackToTree(stack) {
    stack.close();
    return Tree.build({
      buffer: StackBufferCursor.create(stack),
      nodeSet: this.parser.nodeSet,
      topID: this.topTerm,
      maxBufferLength: this.parser.bufferLength,
      reused: this.reused,
      start: this.ranges[0].from,
      length: stack.pos - this.ranges[0].from,
      minRepeatType: this.parser.minRepeatTerm
    });
  }
  stackID(stack) {
    let id = (stackIDs || (stackIDs = /* @__PURE__ */ new WeakMap())).get(stack);
    if (!id)
      stackIDs.set(stack, id = String.fromCodePoint(this.nextStackID++));
    return id + stack;
  }
};
function pushStackDedup(stack, newStacks) {
  for (let i = 0; i < newStacks.length; i++) {
    let other = newStacks[i];
    if (other.pos == stack.pos && other.sameState(stack)) {
      if (newStacks[i].score < stack.score)
        newStacks[i] = stack;
      return;
    }
  }
  newStacks.push(stack);
}
var Dialect = class {
  constructor(source, flags, disabled) {
    this.source = source;
    this.flags = flags;
    this.disabled = disabled;
  }
  allows(term) {
    return !this.disabled || this.disabled[term] == 0;
  }
};
var LRParser = class _LRParser extends Parser {
  /**
  @internal
  */
  constructor(spec) {
    super();
    this.wrappers = [];
    if (spec.version != 14)
      throw new RangeError(`Parser version (${spec.version}) doesn't match runtime version (${14})`);
    let nodeNames = spec.nodeNames.split(" ");
    this.minRepeatTerm = nodeNames.length;
    for (let i = 0; i < spec.repeatNodeCount; i++)
      nodeNames.push("");
    let topTerms = Object.keys(spec.topRules).map((r) => spec.topRules[r][1]);
    let nodeProps = [];
    for (let i = 0; i < nodeNames.length; i++)
      nodeProps.push([]);
    function setProp(nodeID, prop, value) {
      nodeProps[nodeID].push([prop, prop.deserialize(String(value))]);
    }
    if (spec.nodeProps)
      for (let propSpec of spec.nodeProps) {
        let prop = propSpec[0];
        if (typeof prop == "string")
          prop = NodeProp[prop];
        for (let i = 1; i < propSpec.length; ) {
          let next = propSpec[i++];
          if (next >= 0) {
            setProp(next, prop, propSpec[i++]);
          } else {
            let value = propSpec[i + -next];
            for (let j = -next; j > 0; j--)
              setProp(propSpec[i++], prop, value);
            i++;
          }
        }
      }
    this.nodeSet = new NodeSet(nodeNames.map((name, i) => NodeType.define({
      name: i >= this.minRepeatTerm ? void 0 : name,
      id: i,
      props: nodeProps[i],
      top: topTerms.indexOf(i) > -1,
      error: i == 0,
      skipped: spec.skippedNodes && spec.skippedNodes.indexOf(i) > -1
    })));
    if (spec.propSources)
      this.nodeSet = this.nodeSet.extend(...spec.propSources);
    this.strict = false;
    this.bufferLength = DefaultBufferLength;
    let tokenArray = decodeArray(spec.tokenData);
    this.context = spec.context;
    this.specializerSpecs = spec.specialized || [];
    this.specialized = new Uint16Array(this.specializerSpecs.length);
    for (let i = 0; i < this.specializerSpecs.length; i++)
      this.specialized[i] = this.specializerSpecs[i].term;
    this.specializers = this.specializerSpecs.map(getSpecializer);
    this.states = decodeArray(spec.states, Uint32Array);
    this.data = decodeArray(spec.stateData);
    this.goto = decodeArray(spec.goto);
    this.maxTerm = spec.maxTerm;
    this.tokenizers = spec.tokenizers.map((value) => typeof value == "number" ? new TokenGroup(tokenArray, value) : value);
    this.topRules = spec.topRules;
    this.dialects = spec.dialects || {};
    this.dynamicPrecedences = spec.dynamicPrecedences || null;
    this.tokenPrecTable = spec.tokenPrec;
    this.termNames = spec.termNames || null;
    this.maxNode = this.nodeSet.types.length - 1;
    this.dialect = this.parseDialect();
    this.top = this.topRules[Object.keys(this.topRules)[0]];
  }
  createParse(input, fragments, ranges) {
    let parse = new Parse(this, input, fragments, ranges);
    for (let w of this.wrappers)
      parse = w(parse, input, fragments, ranges);
    return parse;
  }
  /**
  Get a goto table entry @internal
  */
  getGoto(state, term, loose = false) {
    let table = this.goto;
    if (term >= table[0])
      return -1;
    for (let pos = table[term + 1]; ; ) {
      let groupTag = table[pos++], last = groupTag & 1;
      let target = table[pos++];
      if (last && loose)
        return target;
      for (let end = pos + (groupTag >> 1); pos < end; pos++)
        if (table[pos] == state)
          return target;
      if (last)
        return -1;
    }
  }
  /**
  Check if this state has an action for a given terminal @internal
  */
  hasAction(state, terminal) {
    let data = this.data;
    for (let set = 0; set < 2; set++) {
      for (let i = this.stateSlot(
        state,
        set ? 2 : 1
        /* ParseState.Actions */
      ), next; ; i += 3) {
        if ((next = data[i]) == 65535) {
          if (data[i + 1] == 1)
            next = data[i = pair(data, i + 2)];
          else if (data[i + 1] == 2)
            return pair(data, i + 2);
          else
            break;
        }
        if (next == terminal || next == 0)
          return pair(data, i + 1);
      }
    }
    return 0;
  }
  /**
  @internal
  */
  stateSlot(state, slot) {
    return this.states[state * 6 + slot];
  }
  /**
  @internal
  */
  stateFlag(state, flag) {
    return (this.stateSlot(
      state,
      0
      /* ParseState.Flags */
    ) & flag) > 0;
  }
  /**
  @internal
  */
  validAction(state, action) {
    return !!this.allActions(state, (a) => a == action ? true : null);
  }
  /**
  @internal
  */
  allActions(state, action) {
    let deflt = this.stateSlot(
      state,
      4
      /* ParseState.DefaultReduce */
    );
    let result = deflt ? action(deflt) : void 0;
    for (let i = this.stateSlot(
      state,
      1
      /* ParseState.Actions */
    ); result == null; i += 3) {
      if (this.data[i] == 65535) {
        if (this.data[i + 1] == 1)
          i = pair(this.data, i + 2);
        else
          break;
      }
      result = action(pair(this.data, i + 1));
    }
    return result;
  }
  /**
  Get the states that can follow this one through shift actions or
  goto jumps. @internal
  */
  nextStates(state) {
    let result = [];
    for (let i = this.stateSlot(
      state,
      1
      /* ParseState.Actions */
    ); ; i += 3) {
      if (this.data[i] == 65535) {
        if (this.data[i + 1] == 1)
          i = pair(this.data, i + 2);
        else
          break;
      }
      if ((this.data[i + 2] & 65536 >> 16) == 0) {
        let value = this.data[i + 1];
        if (!result.some((v, i2) => i2 & 1 && v == value))
          result.push(this.data[i], value);
      }
    }
    return result;
  }
  /**
  Configure the parser. Returns a new parser instance that has the
  given settings modified. Settings not provided in `config` are
  kept from the original parser.
  */
  configure(config) {
    let copy = Object.assign(Object.create(_LRParser.prototype), this);
    if (config.props)
      copy.nodeSet = this.nodeSet.extend(...config.props);
    if (config.top) {
      let info = this.topRules[config.top];
      if (!info)
        throw new RangeError(`Invalid top rule name ${config.top}`);
      copy.top = info;
    }
    if (config.tokenizers)
      copy.tokenizers = this.tokenizers.map((t) => {
        let found = config.tokenizers.find((r) => r.from == t);
        return found ? found.to : t;
      });
    if (config.specializers) {
      copy.specializers = this.specializers.slice();
      copy.specializerSpecs = this.specializerSpecs.map((s, i) => {
        let found = config.specializers.find((r) => r.from == s.external);
        if (!found)
          return s;
        let spec = Object.assign(Object.assign({}, s), { external: found.to });
        copy.specializers[i] = getSpecializer(spec);
        return spec;
      });
    }
    if (config.contextTracker)
      copy.context = config.contextTracker;
    if (config.dialect)
      copy.dialect = this.parseDialect(config.dialect);
    if (config.strict != null)
      copy.strict = config.strict;
    if (config.wrap)
      copy.wrappers = copy.wrappers.concat(config.wrap);
    if (config.bufferLength != null)
      copy.bufferLength = config.bufferLength;
    return copy;
  }
  /**
  Tells you whether any [parse wrappers](#lr.ParserConfig.wrap)
  are registered for this parser.
  */
  hasWrappers() {
    return this.wrappers.length > 0;
  }
  /**
  Returns the name associated with a given term. This will only
  work for all terms when the parser was generated with the
  `--names` option. By default, only the names of tagged terms are
  stored.
  */
  getName(term) {
    return this.termNames ? this.termNames[term] : String(term <= this.maxNode && this.nodeSet.types[term].name || term);
  }
  /**
  The eof term id is always allocated directly after the node
  types. @internal
  */
  get eofTerm() {
    return this.maxNode + 1;
  }
  /**
  The type of top node produced by the parser.
  */
  get topNode() {
    return this.nodeSet.types[this.top[1]];
  }
  /**
  @internal
  */
  dynamicPrecedence(term) {
    let prec = this.dynamicPrecedences;
    return prec == null ? 0 : prec[term] || 0;
  }
  /**
  @internal
  */
  parseDialect(dialect) {
    let values = Object.keys(this.dialects), flags = values.map(() => false);
    if (dialect)
      for (let part of dialect.split(" ")) {
        let id = values.indexOf(part);
        if (id >= 0)
          flags[id] = true;
      }
    let disabled = null;
    for (let i = 0; i < values.length; i++)
      if (!flags[i]) {
        for (let j = this.dialects[values[i]], id; (id = this.data[j++]) != 65535; )
          (disabled || (disabled = new Uint8Array(this.maxTerm + 1)))[id] = 1;
      }
    return new Dialect(dialect, flags, disabled);
  }
  /**
  Used by the output of the parser generator. Not available to
  user code. @hide
  */
  static deserialize(spec) {
    return new _LRParser(spec);
  }
};
function pair(data, off) {
  return data[off] | data[off + 1] << 16;
}
function findFinished(stacks) {
  let best = null;
  for (let stack of stacks) {
    let stopped = stack.p.stoppedAt;
    if ((stack.pos == stack.p.stream.end || stopped != null && stack.pos > stopped) && stack.p.parser.stateFlag(
      stack.state,
      2
      /* StateFlag.Accepting */
    ) && (!best || best.score < stack.score))
      best = stack;
  }
  return best;
}
function getSpecializer(spec) {
  if (spec.external) {
    let mask = spec.extend ? 1 : 0;
    return (value, stack) => spec.external(value, stack) << 1 | mask;
  }
  return spec.get;
}

// third-party/liftosaur/upstream/src/liftoscript.ts
var spec_Keyword = { __proto__: null, if: 102, else: 104, for: 106 };
var parser = LRParser.deserialize({
  version: 14,
  states: ",fQcQPOOO!lQPO'#DOOOQO'#Cd'#CdO#iQPO'#CdO%UQPO'#DYOcQPO'#CjO%]QPO'#CkO%dQPO'#CmO%iQPO'#CoO%nQQO'#CsO%vQPO'#CvO'gQPO'#DYOcQPO'#C|OOQO'#DY'#DYQcQPOOOcQPO,58yOcQPO,58yOcQPO,58yOcQPO,58yOcQPO,59WOOQO,59O,59OOOQO,59Q,59QO'qQPO,59UOOQO,59V,59VO'xQPO,59VO(PQPO,59XO(UQPO,59ZO(ZQPO,59_OcQPO,59_O(`QSO,59bO(gQPO,59gOcQPO,59^OcQPO,59eOOQO,59h,59hOOQO-E6|-E6|O*UQPO1G.eOOQO1G.e1G.eO*]QPO1G.eO*dQPO1G.eO+zQPO1G.rOOQO1G.p1G.pOOQO1G.q1G.qO,RQPO1G.sO-lQQO1G.uOOQO1G.y1G.yO-qQPO'#CuO-xQPO1G.yO-}QPO'#CwOOQO'#Cx'#CxOOQO'#Cw'#CwO.XQPO1G.|O.aQPO1G/ROcQPO'#DRO.kQPO1G/ROOQO1G/R1G/RO.sQPO1G.xO/|QPO1G/POcQPO7+$^O1VQPO7+$_O1_QPO7+$_OcQPO7+$aO2xQQO7+$eO(`QSO'#DQO2}QPO7+$hOOQO7+$h7+$hO3VQPO7+$mOOQO7+$m7+$mO3_QPO,59mOOQO-E7P-E7PO3iQPO<<GxO%dQPO,59kOOQO<<Gy<<GyO1VQPO<<GyOOQO-E6}-E6}O4rQPO'#CqO4yQPO<<G{O5OQPO<<HPOOQO,59l,59lOOQO-E7O-E7OOOQO<<HS<<HSOOQO<<HX<<HXO(PQPO1G/VOOQOAN=eAN=eP1YQPO'#DPO(PQPOAN=gOOQOAN=kAN=kOOQO7+$q7+$qOOQOG23RG23R",
  stateData: "5`~OxOSPOSyOSzOS{OS~OSROXQO[]O]]ObYOdZOhXOq[O}TO!PUO!TVO!VWO~OS_OT`OUaOVbO!RcO~OXrX[rX]rXbrXdrXhrXqrXvrX}rX!PrX!TrX!VrX!QrX~P!ZOXdO~OS|XT|XU|XV|XX|X[|X]|Xb|Xd|Xh|Xq|Xv|X}|X!P|X!R|X!T|X!V|X!O|X!Q|X!S|X!Y|X!^|X~OZeO~P#nO!QgO~PcO}TO~O}jO~O!XlO!ZkO~O}nO!XmOSjXTjXUjXVjXXjX[jX]jXbjXdjXhjXnjXqjXvjX!PjX!RjX!TjX!VjX!]jX!OjX!QjX!SjX!YjX!^jX~OnpO!]oO~P#nO!OxO~P!ZO!QyO~PcO!PUO~Od{O~Ob|O~O![!QO~PcO!O!WO!^!UO~PcOT`OURiVRiXRi[Ri]RibRidRihRiqRivRi}Ri!PRi!RRi!TRi!VRi!ORi!QRi!SRi!YRi!^Ri~OSRi~P(qOS_O~P(qOS_OT`OUaOVRiXRi[Ri]RibRidRihRiqRivRi}Ri!PRi!RRi!TRi!VRi!ORi!QRi!SRi!YRi!^Ri~O!S!ZO~P!ZO!U![OSaiTaiUaiVaiXai[ai]aibaidaihaiqaivai}ai!Pai!Rai!Tai!Vai!Oai!Qai!Sai!Yai!^ai~O!W!^O~O!YiX~P!ZO!Y!_O~O!SkX!YkX~P!ZO!S!`O!Y!bO~O!O!dO!^!UO~P!ZO!O!dO!^!UO~OXfi[fi]fibfidfihfiqfivfi}fi!Pfi!Tfi!Vfi!Ofi!Qfi!Sfi!Yfi!^fi~P!ZOXmi[mi]mibmidmihmiqmivmi}mi!Pmi!Tmi!Vmi!Omi!Qmi!Smi!Ymi!^mi~P!ZO!PUO!T!hO~O!U!jOSaqTaqUaqVaqXaq[aq]aqbaqdaqhaqqaqvaq}aq!Paq!Raq!Taq!Vaq!Oaq!Qaq!Saq!Yaq!^aq~O!Z!nO~O!S!`O!Y!qO~O!O!rO!^!UO~O!Oua!^ua~P!ZOX`y[`y]`yb`yd`yh`yq`yv`y}`y!P`y!T`y!V`y!O`y!Q`y!S`y!Y`y!^`y~P!ZO!OeX~P!ZO!O!vO~Ob!wO~OPTh[XSdZbZ~",
  goto: "'P}PPP!OPPPP!fP!OPPP!|#j!O!OP!OP$a!O$dP$z$d$}%T!OP!O!OP%X%c%i%oPPPPPP%yy]OTU[^_`abchlmnop!U!Z!^!`ySOTU[^_`abchlmnop!U!Z!^!`x]OTU[^_`abchlmnop!U!Z!^!`QiVR!s!hx]OTU[^_`abchlmnop!U!Z!^!`QziQ!i![Q!t!jQ!x!sR!y!vR!m!^yZOTU[^_`abchlmnop!U!Z!^!`R!OlQ!SmR!o!`T!Rm!`Q^OQhUTr^hQ!]zR!k!]Q!a!SR!p!aQ!VnQ!c!TT!f!V!cWPOU^hQfTQq[Qs_Qt`QuaQvbQwcQ}lS!Pm!`Q!TnQ!XoQ!YpQ!e!UQ!g!ZR!l!^",
  nodeNames: "\u26A0 LineComment Program BinaryExpression Plus Times Cmp AndOr NumberExpression Number WeightExpression Unit Percentage String ParenthesisExpression BlockExpression Ternary IfExpression Keyword ForExpression Variable ForInExpression AssignmentExpression StateVariable StateKeyword StateVariableIndex VariableExpression VariableIndex Wildcard IncAssignmentExpression IncAssignment BuiltinFunctionExpression UnaryExpression Not",
  maxTerm: 60,
  skippedNodes: [0, 1],
  repeatNodeCount: 4,
  tokenData: "2Q~R!OX^$Rpq$Rqr$vrs%Tuv&Ovw&Txy&`yz&ez{&j{|&y|}'R}!O&y!O!P'W!P!Q'p!Q![(d![!])c!]!^)h!^!_)m!_!`)u!`!a)m!a!b)}!c!}*S!}#O*e#P#Q*j#T#]*S#]#^*o#^#_*S#_#`+k#`#a,g#a#g*S#g#h-O#h#j*S#j#k/`#k#o*S#o#p1]#p#q1j#q#r1p#r#s1u#y#z$R$f$g$R#BY#BZ$R$IS$I_$R$I|$JO$R$JT$JU$R$KV$KW$R&FU&FV$R~$WYx~X^$Rpq$R#y#z$R$f$g$R#BY#BZ$R$IS$I_$R$I|$JO$R$JT$JU$R$KV$KW$R&FU&FV$R~${Pq~!_!`%O~%TOU~~%WXOY%TZ]%T^r%Trs%ss#O%T#P#r%T#s;'S%T;'S;=`%x<%lO%T~%xO]~~%{P;=`<%l%TP&TOTP~&WPvw&Z~&`OV~~&eO}~~&jO!O~T&qP![STP!_!`&tP&yOnP~'OPS~!_!`&t~'WO!^~V']P!ZQ!Q!['`T'eQXTuv'k!Q!['`T'pO[T~'uQTP!P!Q'{!_!`&t~(QSP~OY'{Z;'S'{;'S;=`(^<%lO'{~(aP;=`<%l'{T(iRXTuv'k!O!P(r!Q![(dT(wQXTuv'k!Q![(}T)SRXTuv'k!O!P)]!Q![(}T)`P!Q![(}~)hO!S~~)mOy~~)rPU~!_!`%O~)zP!]~!_!`%O~*SO!R~T*XSbT!Q![*S!c!}*S#R#S*S#T#o*S~*jO!X~~*oO!Y~V*tUbT!Q![*S!c!}*S#R#S*S#T#b*S#b#c+W#c#o*SV+_S!WQbT!Q![*S!c!}*S#R#S*S#T#o*S~+pUbT!Q![*S!c!}*S#R#S*S#T#Z*S#Z#[,S#[#o*S~,ZSZ~bT!Q![*S!c!}*S#R#S*S#T#o*S~,lUbT!Q![*S!c!}*S#R#S*S#T#U*S#U#V,S#V#o*S~-TUbT!Q![*S!c!}*S#R#S*S#T#h*S#h#i-g#i#o*S~-lTbT!Q![*S!c!}*S#R#S*S#T#U-{#U#o*S~.QUbT!Q![*S!c!}*S#R#S*S#T#h*S#h#i.d#i#o*S~.iUbT!Q![*S!c!}*S#R#S*S#T#X*S#X#Y.{#Y#o*S~/SSh~bT!Q![*S!c!}*S#R#S*S#T#o*S~/eTbT!Q![*S!c!}*S#R#S*S#T#U/t#U#o*S~/yUbT!Q![*S!c!}*S#R#S*S#T#f*S#f#g0]#g#o*S~0bTbT!O!P0q!Q![*S!c!}*S#R#S*S#T#o*S~0tQ!c!}0z#T#o0z~1PSd~!Q![0z!c!}0z#R#S0z#T#o0z~1bP!P~#r#s1e~1jOz~~1mP#p#q&Z~1uO!Q~~1xP#q#r1{~2QO{~",
  tokenizers: [0, 1, 2],
  topRules: { Program: [0, 2] },
  specialized: [{ term: 18, get: (value) => spec_Keyword[value] || -1 }],
  tokenPrec: 925
});

// third-party/liftosaur/upstream/src/liftoscriptPrint.ts
function LiftoscriptPrint_formatValue(value) {
  if (typeof value === "string") {
    return value;
  } else if (typeof value === "boolean") {
    return value ? "true" : "false";
  } else {
    return Weight_print(value);
  }
}
function LiftoscriptPrint_formatLine(values) {
  return values.map((value) => LiftoscriptPrint_formatValue(value ?? 0)).join(", ");
}

// third-party/liftosaur/upstream/src/liftoscriptEvaluator.ts
var LiftoscriptSyntaxError = class extends SyntaxError {
  constructor(message, line, offset, from, to, details) {
    super(message);
    this.line = line;
    this.offset = offset;
    this.from = from;
    this.to = to;
    this.details = details;
  }
};
function getChildren2(node) {
  const cur = node.cursor();
  const result = [];
  if (!cur.firstChild()) {
    return result;
  }
  do {
    result.push(cur.node);
  } while (cur.nextSibling());
  return result;
}
function comparing(left, right, operator) {
  function comparator(l, r) {
    switch (operator) {
      case ">":
        return Weight_gt(l, r);
      case "<":
        return Weight_lt(l, r);
      case ">=":
        return Weight_gte(l, r);
      case "<=":
        return Weight_lte(l, r);
      case "==":
        return Weight_eq(l, r);
      case "!=":
        return !Weight_eq(l, r);
    }
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.every((l, i) => comparator(l ?? 0, right[i] ?? 0));
  } else if (Array.isArray(left) && !Array.isArray(right)) {
    return left.every((l, i) => comparator(l ?? 0, right ?? 0));
  } else if (!Array.isArray(left) && Array.isArray(right)) {
    return right.every((r, i) => comparator(left ?? 0, r ?? 0));
  } else if (!Array.isArray(left) && !Array.isArray(right)) {
    return comparator(left ?? 0, right ?? 0);
  } else {
    throw new Error("Impossible case");
  }
}
function assert(name) {
  throw new LiftoscriptSyntaxError(`Missing required nodes for ${name}, this should never happen`, 0, 0, 0, 1, {
    type: "internal",
    data: { node: name }
  });
}
var LiftoscriptEvaluator = class _LiftoscriptEvaluator {
  constructor(script, state, otherStates, bindings, fns, fnContext, unit, mode) {
    this.vars = {};
    this.updates = [];
    this.script = script;
    this.state = state;
    this.otherStates = otherStates;
    this.bindings = bindings;
    this.fns = fns;
    this.fnContext = fnContext;
    this.unit = unit;
    this.mode = mode;
  }
  static getValueRaw(script, node) {
    return script.slice(node.from, node.to);
  }
  static getValue(script, node) {
    return this.getValueRaw(script, node).replace(/\n/g, "\\n").replace(/\t/g, "\\t");
  }
  getValue(node) {
    return _LiftoscriptEvaluator.getValue(this.script, node);
  }
  error(message, node, details) {
    const [line, offset] = this.getLineAndOffset(node);
    throw new LiftoscriptSyntaxError(`${message} (${line}:${offset})`, line, offset, node.from, node.to, details);
  }
  staticTypeOfNode(node) {
    if (node.type.name === "NumberExpression" /* NumberExpression */) {
      return "number";
    } else if (node.type.name === "WeightExpression" /* WeightExpression */) {
      return "weight";
    } else if (node.type.name === "Percentage" /* Percentage */) {
      return "percentage";
    } else if (node.type.name === "String" /* String */) {
      return "string";
    } else if (node.type.name === "ParenthesisExpression" /* ParenthesisExpression */) {
      const [inner] = getChildren2(node);
      return inner != null ? this.staticTypeOfNode(inner) : void 0;
    } else if (node.type.name === "Ternary" /* Ternary */) {
      const [, then, or] = getChildren2(node);
      const thenType = then != null ? this.staticTypeOfNode(then) : void 0;
      return thenType != null && or != null && this.staticTypeOfNode(or) === thenType ? thenType : void 0;
    } else if (node.type.name === "BinaryExpression" /* BinaryExpression */) {
      const [left, operator, right] = getChildren2(node);
      if (operator != null && this.getValue(operator) === "+") {
        const isString = [left, right].some((side) => side != null && this.staticTypeOfNode(side) === "string");
        return isString ? "string" : void 0;
      }
    } else if (node.type.name === "VariableExpression" /* VariableExpression */) {
      if (node.getChildren("VariableIndex" /* VariableIndex */).length > 0) {
        return void 0;
      }
      const nameNode = node.getChild("Keyword" /* Keyword */);
      const name = nameNode != null ? this.getValue(nameNode) : void 0;
      return name != null ? LiftoscriptFns_bindingStaticType(name) : void 0;
    }
    return void 0;
  }
  isStaticString(node) {
    return node != null && this.staticTypeOfNode(node) === "string";
  }
  stringNotAllowed(node, target) {
    this.error(`Text can't be used as ${target}`, node, { type: "stringNotAllowed", data: { target } });
  }
  rejectString(value, node, target) {
    if (typeof value === "string") {
      this.stringNotAllowed(node, target);
    }
    return value;
  }
  validateFnArg(name, index, node, value) {
    if (LiftoscriptFns_isValidArg(name, index, value)) {
      return;
    }
    if (Array.isArray(value) && !LiftoscriptFns_acceptsTypeAt(name, index, "array")) {
      const argText = this.getValue(node);
      this.error(
        `Function '${name}' doesn't accept arrays. Use an index to pick one value, like '${argText}[1]'`,
        node,
        { type: "fnArrayArgument", data: { fn: name, argText } }
      );
    }
    const argSignature = LiftoscriptFns_argSignature(name, index);
    const printedValue = Weight_is(value) || Weight_isPct(value) ? `${Weight_print(value)}` : Array.isArray(value) ? "an array" : String(value);
    this.error(
      `Argument ${index + 1} (${argSignature?.name}) of '${name}' should be ${argSignature?.hint}, but got ${printedValue}`,
      node,
      {
        type: "fnArgumentType",
        data: { fn: name, index, argName: argSignature?.name, hint: argSignature?.hint, got: printedValue }
      }
    );
  }
  getLineAndOffset(node) {
    const linesLengths = this.script.split("\n").map((l) => l.length + 1);
    let offset = 0;
    for (let i = 0; i < linesLengths.length; i++) {
      const lineLength = linesLengths[i];
      if (node.from > offset && node.from < offset + lineLength) {
        return [i + 1, node.from - offset];
      }
      offset += lineLength;
    }
    return [linesLengths.length, linesLengths[linesLengths.length - 1]];
  }
  hasKeyword(expr, name) {
    const cursor = expr.cursor();
    do {
      if (cursor.node.type.name === "Keyword" /* Keyword */) {
        if (this.getValue(cursor.node) === name) {
          return true;
        }
      }
    } while (cursor.next());
    return false;
  }
  getWeight(expr) {
    if (expr?.type.name === "WeightExpression" /* WeightExpression */) {
      const numberNode = expr.getChild("NumberExpression" /* NumberExpression */);
      const unitNode = expr.getChild("Unit" /* Unit */);
      if (numberNode == null || unitNode == null) {
        assert("WeightExpression" /* WeightExpression */);
      }
      const num = this.evaluate(numberNode);
      if (typeof num !== "number") {
        this.error("WeightExpression must contain a number", numberNode, { type: "malformedWeight" });
      }
      return Weight_build(num, this.getValue(unitNode));
    } else {
      return void 0;
    }
  }
  switchWeightsToUnit(programNode, toUnit) {
    const cursor = programNode.cursor();
    let script = this.script;
    let shift = 0;
    do {
      if (cursor.node.type.name === "WeightExpression" /* WeightExpression */) {
        const weight = this.getWeight(cursor.node);
        if (weight != null) {
          if (weight.unit !== toUnit) {
            const from = cursor.node.from;
            const to = cursor.node.to;
            const oldWeightStr = Weight_print(weight);
            const newWeightStr = Weight_print(Weight_smartConvert(weight, toUnit));
            script = script.substring(0, from + shift) + newWeightStr + script.substring(to + shift);
            shift = shift + newWeightStr.length - oldWeightStr.length;
          }
        }
      }
    } while (cursor.next());
    return script;
  }
  getStateVariableKeys(expr) {
    const cursor = expr.cursor();
    const stateKeys = /* @__PURE__ */ new Set();
    do {
      if (cursor.node.type.name === "StateVariable" /* StateVariable */) {
        const stateKey = this.getStateKey(cursor.node);
        if (stateKey != null) {
          stateKeys.add(stateKey);
        }
      }
    } while (cursor.next());
    return stateKeys;
  }
  getStateKey(expr) {
    const index = expr.getChild("StateVariableIndex" /* StateVariableIndex */);
    if (index == null) {
      const stateKeyNode = expr.getChild("Keyword" /* Keyword */);
      if (stateKeyNode != null) {
        const stateKey = this.getValue(stateKeyNode);
        return stateKey;
      }
    }
    return void 0;
  }
  checkStaticStrings(node) {
    if (node.type.name === "BinaryExpression" /* BinaryExpression */) {
      const [left, operator, right] = getChildren2(node);
      if (operator == null || operator.type.name === "AndOr" /* AndOr */) {
        return;
      }
      const isLeftString = this.isStaticString(left);
      if (!isLeftString && !this.isStaticString(right)) {
        return;
      }
      const op = this.getValue(operator);
      if (operator.type.name === "Cmp" /* Cmp */) {
        const other = isLeftString ? right : left;
        const otherType = other != null ? this.staticTypeOfNode(other) : void 0;
        if (op !== "==" && op !== "!=" && otherType != null && otherType !== "string") {
          this.error(`Can't compare text with '${op}' to a ${otherType}`, operator, {
            type: "stringComparedToNonString",
            data: { op }
          });
        }
      } else if (op !== "+") {
        this.error(`Can't apply '${op}' to text`, operator, { type: "stringOperator", data: { op } });
      }
    } else if (node.type.name === "AssignmentExpression" /* AssignmentExpression */ || node.type.name === "IncAssignmentExpression" /* IncAssignmentExpression */) {
      const children = getChildren2(node);
      const target = children[0];
      const value = children[children.length - 1];
      if (target == null || !this.isStaticString(value)) {
        return;
      }
      if (target.type.name !== "Variable" /* Variable */) {
        this.stringNotAllowed(value, `'${this.getValue(target)}'`);
      }
      const opNode = node.getChild("IncAssignment" /* IncAssignment */);
      const op = opNode != null ? this.getValue(opNode) : "=";
      if (op !== "=" && op !== "+=") {
        this.error(`Can't apply '${op}' to text`, opNode ?? node, { type: "stringOperator", data: { op } });
      }
    } else if (node.type.name === "VariableIndex" /* VariableIndex */ || node.type.name === "StateVariableIndex" /* StateVariableIndex */) {
      const [inner] = getChildren2(node);
      if (this.isStaticString(inner)) {
        this.stringNotAllowed(inner, "an index");
      }
    }
  }
  parse(expr) {
    const cursor = expr.cursor();
    const vars = {};
    do {
      this.checkStaticStrings(cursor.node);
      if (cursor.node.type.isError) {
        this.error("Syntax error", cursor.node, { type: "parse" });
      } else if (cursor.node.type.name === "BuiltinFunctionExpression" /* BuiltinFunctionExpression */) {
        const [keyword, ...fnArgs] = getChildren2(cursor.node);
        if (keyword == null || keyword.type.name !== "Keyword" /* Keyword */) {
          assert("BuiltinFunctionExpression" /* BuiltinFunctionExpression */);
        }
        const name = this.getValue(keyword);
        if (!LiftoscriptFns_isFnName(name)) {
          this.error(`Unknown function '${name}'`, keyword, { type: "unknownFunction", data: { name } });
        }
        const arity = LiftoscriptFns_arity(name);
        if (fnArgs.length < arity.min || arity.max != null && fnArgs.length > arity.max) {
          const expected = arity.max == null || arity.max === arity.min ? `${arity.min}` : `${arity.min}-${arity.max}`;
          this.error(
            `Function '${name}' expects ${expected} argument${arity.max === 1 ? "" : "s"}, but got ${fnArgs.length}`,
            keyword,
            { type: "fnArity", data: { fn: name, expected, got: fnArgs.length } }
          );
        }
        fnArgs.forEach((fnArg, index) => {
          const staticType = this.staticTypeOfNode(fnArg);
          if (staticType != null && !LiftoscriptFns_acceptsTypeAt(name, index, staticType)) {
            if (staticType === "array") {
              const argText = this.getValue(fnArg);
              this.error(
                `Function '${name}' doesn't accept arrays, and '${argText}' is an array. Use an index to pick one value, like '${argText}[1]'`,
                fnArg,
                { type: "fnArrayArgument", data: { fn: name, argText } }
              );
            } else {
              const argSignature = LiftoscriptFns_argSignature(name, index);
              this.error(
                `Argument ${index + 1} (${argSignature?.name}) of '${name}' should be ${argSignature?.hint}, but '${this.getValue(fnArg)}' is a ${staticType}`,
                fnArg,
                {
                  type: "fnArgumentType",
                  data: {
                    fn: name,
                    index,
                    argName: argSignature?.name,
                    hint: argSignature?.hint,
                    got: staticType
                  }
                }
              );
            }
          }
        });
      } else if (cursor.node.type.name === "ForExpression" /* ForExpression */) {
        const variableNode = cursor.node.getChild("Variable" /* Variable */);
        if (variableNode != null) {
          vars[this.getValue(variableNode)] = 1;
        }
      } else if (cursor.node.type.name === "AssignmentExpression" /* AssignmentExpression */) {
        const [variableNode] = getChildren2(cursor.node);
        if (variableNode.type.name === "Variable" /* Variable */) {
          vars[this.getValue(variableNode)] = 1;
        } else if (variableNode.type.name === "VariableExpression" /* VariableExpression */) {
          const nameNode = variableNode.getChild("Keyword" /* Keyword */);
          if (nameNode != null) {
            const name = this.getValue(nameNode);
            if (this.mode === "update") {
              if ([
                "reps",
                "weights",
                "RPE",
                "minReps",
                "numberOfSets",
                "timers",
                "setTime",
                "askweights",
                "amraps",
                "logrpes"
              ].indexOf(name) === -1) {
                this.error(`Cannot assign to '${name}'`, variableNode, { type: "readonlyVariable", data: { name } });
              }
              const indexExprs = variableNode.getChildren("VariableIndex" /* VariableIndex */);
              if (name === "numberOfSets" && indexExprs.length > 0) {
                this.error(`${name} is not an array`, variableNode, { type: "notAnArray", data: { name } });
              } else if (indexExprs.length > 1) {
                this.error(`Can't assign to set variations, weeks or days here`, variableNode, {
                  type: "indexNotAssignableHere",
                  data: { name }
                });
              }
            }
          }
        }
      } else if (cursor.node.type.name === "StateVariable" /* StateVariable */) {
        const stateKey = this.getStateKey(cursor.node);
        if (stateKey != null && !(stateKey in this.state)) {
          this.error(`There's no state variable '${stateKey}'`, cursor.node, {
            type: "unknownStateVariable",
            data: { stateKey }
          });
        }
      } else if (cursor.node.type.name === "Variable" /* Variable */) {
        const variableKey = this.getValue(cursor.node);
        if (!(variableKey in vars)) {
          this.error(`There's no variable '${variableKey}'`, cursor.node, {
            type: "unknownVariable",
            data: { name: variableKey }
          });
        }
      } else if (cursor.node.type.name === "VariableExpression" /* VariableExpression */) {
        const [nameNode, indexExpr] = getChildren2(cursor.node);
        if (nameNode == null) {
          assert("VariableExpression" /* VariableExpression */);
        }
        const name = this.getValue(nameNode);
        if (indexExpr != null) {
          const validNames = [
            "originalWeights",
            "weights",
            "reps",
            "minReps",
            "completedReps",
            "completedRepsLeft",
            "completedWeights",
            "timers",
            "setTime",
            "completedSetTime",
            "completedSetTimeLeft",
            "w",
            "r",
            "cr",
            "cw",
            "mr",
            "completedRPE",
            "bodyweight",
            "RPE",
            "setVariationIndex",
            "exerciseVariationIndex",
            "descriptionIndex",
            "numberOfSets",
            "programNumberOfSets",
            "completedNumberOfSets",
            "amraps",
            "logrpes",
            "askweights"
          ];
          if (validNames.indexOf(name) === -1) {
            this.error(`${name} is not an array variable`, nameNode, { type: "notAnArray", data: { name } });
          }
        } else if (!Object.prototype.hasOwnProperty.call(this.bindings, name)) {
          this.error(`${name} is not a valid variable`, nameNode, { type: "unknownVariable", data: { name } });
        }
      }
    } while (cursor.next());
  }
  static changeWeightsToCompleteWeights(oldScript) {
    const node = parser.parse(oldScript);
    const cursor = node.cursor();
    let script = oldScript;
    let shift = 0;
    do {
      if (cursor.node.type.name === "VariableExpression" /* VariableExpression */) {
        const keywordNode = cursor.node.getChild("Keyword" /* Keyword */);
        if (keywordNode) {
          const keyword = _LiftoscriptEvaluator.getValue(oldScript, keywordNode);
          if (keyword === "weights") {
            const parent = cursor.node.parent;
            if (parent != null && !((parent.type.name === "AssignmentExpression" /* AssignmentExpression */ || parent.type.name === "IncAssignmentExpression" /* IncAssignmentExpression */) && parent.firstChild?.from === cursor.node.from && parent.firstChild?.to === cursor.node.to)) {
              const from = keywordNode.from;
              const to = keywordNode.to;
              const oldWeightStr = keyword;
              const newWeightStr = "completedWeights";
              script = script.substring(0, from + shift) + newWeightStr + script.substring(to + shift);
              shift = shift + newWeightStr.length - oldWeightStr.length;
            }
          }
        }
      }
    } while (cursor.next());
    return script;
  }
  evaluateToNumber(expr) {
    const v = this.rejectString(this.evaluate(expr), expr, "a number");
    const v1 = Array.isArray(v) ? v[0] : v;
    return Weight_is(v1) ? v1.value : typeof v1 === "number" ? v1 : v1 ? 1 : 0;
  }
  evaluateToNumberOrWeightOrPercentage(expr) {
    const v = this.rejectString(this.evaluate(expr), expr, "a number or weight");
    const v1 = Array.isArray(v) ? v[0] : v;
    return Weight_is(v1) || Weight_isPct(v1) ? v1 : typeof v1 === "number" ? v1 : v1 ? 1 : 0;
  }
  changeNumberOfSets(expression, op) {
    const oldNumberOfSets = this.bindings.weights.length;
    const evaluatedValue = MathUtils_applyOp(this.bindings.numberOfSets, this.evaluateToNumber(expression), op);
    this.bindings.weights = this.bindings.weights.slice(0, evaluatedValue);
    this.bindings.originalWeights = this.bindings.originalWeights.slice(0, evaluatedValue);
    this.bindings.reps = this.bindings.reps.slice(0, evaluatedValue);
    this.bindings.minReps = this.bindings.minReps.slice(0, evaluatedValue);
    this.bindings.RPE = this.bindings.RPE.slice(0, evaluatedValue);
    this.bindings.w = this.bindings.weights.slice(0, evaluatedValue);
    this.bindings.r = this.bindings.reps.slice(0, evaluatedValue);
    this.bindings.mr = this.bindings.minReps.slice(0, evaluatedValue);
    this.bindings.timers = this.bindings.timers.slice(0, evaluatedValue);
    this.bindings.setTime = this.bindings.setTime.slice(0, evaluatedValue);
    this.bindings.amraps = this.bindings.amraps.slice(0, evaluatedValue);
    this.bindings.logrpes = this.bindings.logrpes.slice(0, evaluatedValue);
    this.bindings.askweights = this.bindings.askweights.slice(0, evaluatedValue);
    this.bindings.completedReps = this.bindings.completedReps.slice(0, evaluatedValue);
    this.bindings.completedRepsLeft = this.bindings.completedRepsLeft.slice(0, evaluatedValue);
    this.bindings.cr = this.bindings.cr.slice(0, evaluatedValue);
    this.bindings.cw = this.bindings.cw.slice(0, evaluatedValue);
    this.bindings.completedWeights = this.bindings.completedWeights.slice(0, evaluatedValue);
    this.bindings.completedRPE = this.bindings.completedRPE.slice(0, evaluatedValue);
    this.bindings.isCompleted = this.bindings.isCompleted.slice(0, evaluatedValue);
    const ns = oldNumberOfSets - 1;
    for (let i = 0; i < evaluatedValue; i += 1) {
      if (i > ns) {
        this.bindings.weights[i] = Weight_build(
          this.bindings.weights[ns]?.value ?? 0,
          this.bindings.weights[ns]?.unit || "lb"
        );
        this.bindings.originalWeights[i] = Weight_buildAny(
          this.bindings.originalWeights[ns]?.value ?? 0,
          this.bindings.originalWeights[ns]?.unit || "lb"
        );
        this.bindings.reps[i] = this.bindings.reps[ns] ?? 0;
        this.bindings.timers[i] = this.bindings.timers[ns];
        this.bindings.setTime[i] = this.bindings.setTime[ns];
        this.bindings.amraps[i] = this.bindings.amraps[ns];
        this.bindings.logrpes[i] = this.bindings.logrpes[ns];
        this.bindings.askweights[i] = this.bindings.askweights[ns];
        this.bindings.minReps[i] = this.bindings.minReps[ns];
        this.bindings.RPE[i] = this.bindings.RPE[ns];
        this.bindings.w[i] = this.bindings.weights[i];
        this.bindings.r[i] = this.bindings.reps[i];
        this.bindings.mr[i] = this.bindings.minReps[i];
        this.bindings.completedReps[i] = void 0;
        this.bindings.completedRepsLeft[i] = void 0;
        this.bindings.completedWeights[i] = void 0;
        this.bindings.completedRPE[i] = void 0;
        this.bindings.cr[i] = void 0;
        this.bindings.cw[i] = void 0;
        this.bindings.isCompleted[i] = 0;
      }
    }
    this.bindings.numberOfSets = evaluatedValue;
    this.bindings.ns = evaluatedValue;
    return evaluatedValue;
  }
  changeBinding(key, expression, indexExprs, op) {
    const indexes = indexExprs.map((ie) => getChildren2(ie)[0]);
    const maxTargetLength = 1;
    if (indexes.length > maxTargetLength) {
      this.error(`${key} can only have 1 value inside []`, expression, {
        type: "tooManyIndexes",
        data: { key, max: 1 }
      });
    }
    const indexValues = this.calculateIndexValues(indexes);
    const normalizedIndexValues = this.normalizeTarget(indexValues, maxTargetLength);
    const [setIndex] = normalizedIndexValues;
    let value = 0;
    if (key === "weights") {
      for (let i = 0; i < this.bindings.weights.length; i += 1) {
        if (!this.bindings.isCompleted[i] && (setIndex === "*" || setIndex === i + 1)) {
          const evalutedValue = this.evaluateToNumberOrWeightOrPercentage(expression);
          const newValue = Weight_applyOp(
            this.bindings.rm1,
            this.bindings.weights[i] ?? Weight_build(0, this.unit),
            evalutedValue,
            op
          );
          value = Weight_convertToWeight(this.bindings.rm1, newValue, this.unit);
          this.bindings.originalWeights[i] = value;
          this.bindings.weights[i] = this.fns.roundWeight([value], this.fnContext, this.bindings);
        }
      }
    } else {
      for (let i = 0; i < this.bindings[key].length; i += 1) {
        if (!this.bindings.isCompleted[i] && (setIndex === "*" || setIndex === i + 1)) {
          const evaluatedValue = this.evaluateToNumber(expression);
          value = MathUtils_applyOp(this.bindings[key][i] ?? 0, evaluatedValue, op);
          if (key === "RPE") {
            value = MathUtils_round(MathUtils_clamp(value, 0, 10), 0.5);
          }
          if (key === "amraps" || key === "logrpes" || key === "askweights") {
            value = Math.round(MathUtils_clamp(value, 0, 1));
          }
          this.bindings[key][i] = value;
        }
      }
    }
    return value;
  }
  recordVariableUpdate(key, expression, indexExprs, op) {
    const indexes = indexExprs.map((ie) => getChildren2(ie)[0]);
    const maxTargetLength = key === "setVariationIndex" || key === "exerciseVariationIndex" || key === "descriptionIndex" ? 2 : key === "numberOfSets" ? 3 : 4;
    if (key === "setVariationIndex") {
      if (indexes.length > maxTargetLength) {
        this.error(`setVariationIndex can only have 2 values inside [*:*]`, expression, {
          type: "tooManyIndexes",
          data: { key, max: 2 }
        });
      }
    } else if (key === "exerciseVariationIndex") {
      if (indexes.length > maxTargetLength) {
        this.error(`exerciseVariationIndex can only have 2 values inside [*:*]`, expression, {
          type: "tooManyIndexes",
          data: { key, max: 2 }
        });
      }
    } else if (key === "descriptionIndex") {
      if (indexes.length > maxTargetLength) {
        this.error(`descriptionIndex can only have 2 values inside [*:*]`, expression, {
          type: "tooManyIndexes",
          data: { key, max: 2 }
        });
      }
    } else if (key === "numberOfSets") {
      if (indexes.length > maxTargetLength) {
        this.error(`numberOfSets can only have 3 values inside [*:*:*]`, expression, {
          type: "tooManyIndexes",
          data: { key, max: 3 }
        });
      }
    } else if (indexes.length > maxTargetLength) {
      this.error(`${key} can only have 4 values inside [*:*:*:*]`, expression, {
        type: "tooManyIndexes",
        data: { key, max: 4 }
      });
    }
    const indexValues = this.calculateIndexValues(indexes);
    const normalizedIndexValues = this.normalizeTarget(indexValues, maxTargetLength);
    let result;
    if (key === "weights") {
      result = this.evaluateToNumberOrWeightOrPercentage(expression);
      this.updates.push({ type: key, value: { value: result, op, target: normalizedIndexValues } });
    } else {
      result = this.evaluateToNumber(expression);
      this.updates.push({ type: key, value: { value: result, op, target: normalizedIndexValues } });
      if (key === "setVariationIndex") {
        const [week, day] = normalizedIndexValues;
        if ((week === "*" || week === this.bindings.week) && (day === "*" || day === this.bindings.day)) {
          this.bindings.setVariationIndex = result;
        }
      } else if (key === "exerciseVariationIndex") {
        const [week, day] = normalizedIndexValues;
        if ((week === "*" || week === this.bindings.week) && (day === "*" || day === this.bindings.day)) {
          this.bindings.exerciseVariationIndex = result;
        }
      } else if (key === "descriptionIndex") {
        const [week, day] = normalizedIndexValues;
        if ((week === "*" || week === this.bindings.week) && (day === "*" || day === this.bindings.day)) {
          this.bindings.descriptionIndex = result;
        }
      } else if (key === "numberOfSets") {
        const [week, day, setVariationIndex] = normalizedIndexValues;
        if ((week === "*" || week === this.bindings.week) && (day === "*" || day === this.bindings.day) && (setVariationIndex === "*" || setVariationIndex === this.bindings.setVariationIndex)) {
          this.bindings.numberOfSets = result;
          this.bindings.ns = result;
        }
      }
    }
    return result;
  }
  calculateIndexValues(indexes) {
    return CollectionUtils_compact(indexes).map((ie) => {
      if (ie.type.name === "Wildcard" /* Wildcard */) {
        return "*";
      } else {
        const v = this.rejectString(this.evaluate(ie), ie, "an index");
        const v1 = Array.isArray(v) ? v[0] : v;
        return Weight_is(v1) ? v1.value : typeof v1 === "number" ? v1 : v1 ? 1 : 0;
      }
    });
  }
  normalizeTarget(target, length) {
    const newTarget = [...target];
    for (let i = 0; i < length - target.length; i += 1) {
      newTarget.unshift("*");
    }
    return newTarget;
  }
  toNumber(value) {
    if (typeof value === "number") {
      return value;
    } else if (typeof value === "boolean") {
      return 0;
    } else if (Weight_is(value)) {
      return value.value;
    } else if (Weight_isPct(value)) {
      return value.value;
    } else if (Array.isArray(value)) {
      return this.toNumber(value[0] ?? 0);
    } else {
      return 0;
    }
  }
  compareText(op, left, right, node) {
    if (op === "&&") {
      return !!left && !!right;
    } else if (op === "||") {
      return !!left || !!right;
    } else if (op === "==" || op === "!=") {
      const isEqual = typeof left === "string" && typeof right === "string" && left === right;
      return op === "==" ? isEqual : !isEqual;
    } else if (op === ">" || op === "<" || op === ">=" || op === "<=") {
      if (typeof left !== "string" || typeof right !== "string") {
        this.error(`Can't compare text with '${op}' to something that isn't text`, node, {
          type: "stringComparedToNonString",
          data: { op }
        });
      }
      return op === ">" ? left > right : op === "<" ? left < right : op === ">=" ? left >= right : left <= right;
    } else {
      this.error(`Unknown operator ${op}`, node, { type: "unknownOperator", data: { op } });
    }
  }
  operate(op, left, right, node) {
    if (Array.isArray(left) || Array.isArray(right)) {
      this.error(`You cannot apply ${op} to arrays`, node, { type: "operatorOnArray", data: { op } });
    }
    if (typeof left === "string" || typeof right === "string") {
      if (op !== "+") {
        this.error(`Can't apply '${op}' to text`, node, { type: "stringOperator", data: { op } });
      }
      return LiftoscriptPrint_formatValue(left) + LiftoscriptPrint_formatValue(right);
    }
    if (typeof left === "boolean" || typeof right === "boolean") {
      this.error(`Unknown operator ${op}`, node, { type: "unknownOperator", data: { op } });
    }
    if (op === "+") {
      return this.add(left, right);
    } else if (op === "-") {
      return this.subtract(left, right);
    } else if (op === "*") {
      return this.multiply(left, right);
    } else if (op === "/") {
      return this.divide(left, right);
    } else if (op === "%") {
      return this.modulo(left, right);
    } else {
      this.error(`Unknown operator ${op} between ${left} and ${right}`, node, {
        type: "unknownOperator",
        data: { op }
      });
    }
  }
  evaluate(expr) {
    if (expr.type.name === "Program" /* Program */ || expr.type.name === "BlockExpression" /* BlockExpression */) {
      let result = 0;
      for (const child of getChildren2(expr)) {
        if (!child.type.isSkipped) {
          result = this.evaluate(child);
        }
      }
      return result;
    } else if (expr.type.name === "BinaryExpression" /* BinaryExpression */) {
      const [left, operator, right] = getChildren2(expr);
      const evalLeft = this.evaluate(left);
      const evalRight = this.evaluate(right);
      const op = this.getValue(operator);
      if (typeof evalLeft === "string" || typeof evalRight === "string") {
        return operator.type.name === "Plus" /* Plus */ || operator.type.name === "Times" /* Times */ ? this.operate(op, evalLeft, evalRight, operator) : this.compareText(op, evalLeft, evalRight, operator);
      } else if (typeof evalLeft === "boolean" || typeof evalRight === "boolean") {
        if (op === "&&") {
          return evalLeft && evalRight;
        } else if (op === "||") {
          return evalLeft || evalRight;
        } else {
          this.error(`Unknown operator ${op}`, operator, { type: "unknownOperator", data: { op } });
        }
      } else {
        if (op === ">") {
          return comparing(evalLeft, evalRight, op);
        } else if (op === "<") {
          return comparing(evalLeft, evalRight, op);
        } else if (op === ">=") {
          return comparing(evalLeft, evalRight, op);
        } else if (op === "<=") {
          return comparing(evalLeft, evalRight, op);
        } else if (op === "==") {
          return comparing(evalLeft, evalRight, op);
        } else if (op === "!=") {
          return comparing(evalLeft, evalRight, op);
        } else {
          return this.operate(op, evalLeft, evalRight, operator);
        }
      }
    } else if (expr.type.name === "NumberExpression" /* NumberExpression */) {
      const numberNode = expr.getChild("Number" /* Number */);
      if (numberNode == null) {
        assert("NumberExpression" /* NumberExpression */);
      }
      const value = parseFloat(this.getValue(numberNode));
      const plusNode = expr.getChild("Plus" /* Plus */);
      const sign = plusNode ? this.getValue(plusNode) : void 0;
      return sign === "-" ? -value : value;
    } else if (expr.type.name === "Percentage" /* Percentage */) {
      const value = MathUtils_roundFloat(parseFloat(this.getValue(expr)), 2);
      return Weight_buildPct(value);
    } else if (expr.type.name === "String" /* String */) {
      return _LiftoscriptEvaluator.getValueRaw(this.script, expr).slice(1, -1);
    } else if (expr.type.name === "Ternary" /* Ternary */) {
      const [condition, then, or] = getChildren2(expr);
      return this.evaluate(condition) ? this.evaluate(then) : this.evaluate(or);
    } else if (expr.type.name === "ForExpression" /* ForExpression */) {
      const variableNode = expr.getChild("Variable" /* Variable */);
      const forInExpression = expr.getChild("ForInExpression" /* ForInExpression */);
      const blockNode = expr.getChild("BlockExpression" /* BlockExpression */);
      if (variableNode == null) {
        assert("ForExpression" /* ForExpression */);
      }
      if (forInExpression == null) {
        assert("ForInExpression" /* ForInExpression */);
      }
      if (blockNode == null) {
        assert("BlockExpression" /* BlockExpression */);
      }
      const forIn = this.evaluate(forInExpression);
      if (!Array.isArray(forIn)) {
        this.error(`for in expression should return an array`, forInExpression, { type: "forInNotArray" });
      }
      const varKey = this.getValue(variableNode).replace("var.", "");
      for (let i = 1; i <= forIn.length; i += 1) {
        this.vars[varKey] = i;
        this.evaluate(blockNode);
      }
      return forIn.length;
    } else if (expr.type.name === "IfExpression" /* IfExpression */) {
      const parenthesisNodes = expr.getChildren("ParenthesisExpression" /* ParenthesisExpression */);
      const blockNodes = expr.getChildren("BlockExpression" /* BlockExpression */);
      while (parenthesisNodes.length > 0) {
        const parenthesisNode = parenthesisNodes.shift();
        const blockNode = blockNodes.shift();
        const condition = this.evaluate(parenthesisNode);
        if (condition) {
          return this.evaluate(blockNode);
        }
      }
      const lastBlock = blockNodes.shift();
      if (lastBlock != null) {
        return this.evaluate(lastBlock);
      } else {
        return 0;
      }
    } else if (expr.type.name === "ParenthesisExpression" /* ParenthesisExpression */) {
      const [node] = getChildren2(expr);
      if (node == null) {
        assert("ParenthesisExpression" /* ParenthesisExpression */);
      }
      return this.evaluate(node);
    } else if (expr.type.name === "StateVariableIndex" /* StateVariableIndex */) {
      const [expression] = getChildren2(expr);
      return this.evaluate(expression);
    } else if (expr.type.name === "AssignmentExpression" /* AssignmentExpression */) {
      const [variableNode, expression] = getChildren2(expr);
      if (variableNode == null || variableNode.type.name !== "StateVariable" /* StateVariable */ && variableNode.type.name !== "VariableExpression" /* VariableExpression */ && variableNode.type.name !== "Variable" /* Variable */ || expression == null) {
        assert("AssignmentExpression" /* AssignmentExpression */);
      }
      if (variableNode.type.name === "VariableExpression" /* VariableExpression */) {
        const nameNode = variableNode.getChild("Keyword" /* Keyword */);
        if (nameNode == null) {
          this.error(`Missing variable name`, variableNode, { type: "missingVariableName" });
        }
        const indexExprs = variableNode.getChildren("VariableIndex" /* VariableIndex */);
        const variable = this.getValue(nameNode);
        if (variable === "rm1") {
          if (indexExprs.length > 0) {
            this.error(`rm1 is not an array`, expr, { type: "notAnArray", data: { name: "rm1" } });
          }
          const evaluatedValue = this.rejectString(this.evaluate(expression), expression, "rm1");
          let value = Array.isArray(evaluatedValue) ? evaluatedValue[0] : evaluatedValue;
          value = value ?? 0;
          value = value === true ? 1 : value === false ? 0 : value;
          value = Weight_convertToWeight(this.bindings.rm1, value, this.unit);
          this.bindings.rm1 = value;
          return value;
        } else if (this.mode === "planner" && (variable === "reps" || variable === "weights" || variable === "RPE" || variable === "minReps" || variable === "timers" || variable === "setTime" || variable === "logrpes" || variable === "amraps" || variable === "askweights" || variable === "setVariationIndex" || variable === "exerciseVariationIndex" || variable === "descriptionIndex" || variable === "numberOfSets")) {
          return this.recordVariableUpdate(variable, expression, indexExprs, "=");
        } else if (this.mode === "update" && variable === "numberOfSets") {
          return this.changeNumberOfSets(expression, "=");
        } else if (this.mode === "update" && (variable === "reps" || variable === "weights" || variable === "RPE" || variable === "amraps" || variable === "logrpes" || variable === "askweights" || variable === "minReps" || variable === "timers" || variable === "setTime")) {
          return this.changeBinding(variable, expression, indexExprs, "=");
        } else {
          this.error(`Unknown variable '${variable}'`, variableNode, {
            type: "unknownVariable",
            data: { name: variable }
          });
        }
      } else if (variableNode.type.name === "Variable" /* Variable */) {
        const varKey = this.getValue(variableNode).replace("var.", "");
        const value = this.evaluate(expression);
        if (Weight_is(value) || Weight_isPct(value) || typeof value === "number" || typeof value === "string") {
          this.vars[varKey] = value;
        } else {
          this.vars[varKey] = value ? 1 : 0;
        }
        return this.vars[varKey];
      } else {
        const indexNode = variableNode.getChild("StateVariableIndex" /* StateVariableIndex */);
        const stateKeyNode = variableNode.getChild("Keyword" /* Keyword */);
        if (stateKeyNode != null) {
          const stateKey = this.getValue(stateKeyNode);
          let state;
          if (indexNode == null) {
            if (stateKey in this.state) {
              state = this.state;
            } else {
              this.error(`There's no state variable '${stateKey}'`, variableNode, {
                type: "unknownStateVariable",
                data: { stateKey }
              });
            }
          } else {
            const indexEval = this.rejectString(this.evaluate(indexNode), indexNode, "an index");
            const index = this.toNumber(indexEval);
            state = this.otherStates[index];
          }
          const value = this.rejectString(this.evaluate(expression), expression, `state.${stateKey}`);
          if (state != null) {
            if (Weight_is(value) || Weight_isPct(value) || typeof value === "number") {
              state[stateKey] = value;
            } else {
              state[stateKey] = value ? 1 : 0;
            }
          }
          return value;
        } else {
          return 0;
        }
      }
    } else if (expr.type.name === "IncAssignmentExpression" /* IncAssignmentExpression */) {
      const [stateVar, incAssignmentExpr, expression] = getChildren2(expr);
      if (stateVar == null || stateVar.type.name !== "StateVariable" /* StateVariable */ && stateVar.type.name !== "VariableExpression" /* VariableExpression */ && stateVar.type.name !== "Variable" /* Variable */ || expression == null || incAssignmentExpr == null) {
        assert("IncAssignmentExpression" /* IncAssignmentExpression */);
      }
      if (stateVar.type.name === "VariableExpression" /* VariableExpression */) {
        const nameNode = stateVar.getChild("Keyword" /* Keyword */);
        if (nameNode == null) {
          this.error(`Missing variable name`, stateVar, { type: "missingVariableName" });
        }
        const indexExprs = stateVar.getChildren("VariableIndex" /* VariableIndex */);
        const variable = this.getValue(nameNode);
        if (variable === "rm1") {
          if (indexExprs.length > 0) {
            this.error(`rm1 is not an array`, expr, { type: "notAnArray", data: { name: "rm1" } });
          }
          const evaluatedValue = this.rejectString(this.evaluate(expression), expression, "rm1");
          let value = Array.isArray(evaluatedValue) ? evaluatedValue[0] : evaluatedValue;
          value = value ?? 0;
          value = value === true ? 1 : value === false ? 0 : value;
          const op = this.getValue(incAssignmentExpr);
          if (op === "+=") {
            this.bindings.rm1 = Weight_convertToWeight(
              this.bindings.rm1,
              this.add(this.bindings.rm1, value),
              this.unit
            );
          } else if (op === "-=") {
            this.bindings.rm1 = Weight_convertToWeight(
              this.bindings.rm1,
              this.subtract(this.bindings.rm1, value),
              this.unit
            );
          } else if (op === "*=") {
            this.bindings.rm1 = Weight_convertToWeight(
              this.bindings.rm1,
              this.multiply(this.bindings.rm1, value),
              this.unit
            );
          } else if (op === "/=") {
            this.bindings.rm1 = Weight_convertToWeight(
              this.bindings.rm1,
              this.divide(this.bindings.rm1, value),
              this.unit
            );
          } else {
            this.error(`Unknown operator ${op} after ${variable}`, incAssignmentExpr, {
              type: "unknownAssignmentOperator",
              data: { op, variable }
            });
          }
          return this.bindings.rm1;
        } else if (this.mode === "planner" && (variable === "reps" || variable === "weights" || variable === "RPE" || variable === "minReps" || variable === "timers" || variable === "setTime" || variable === "setVariationIndex" || variable === "exerciseVariationIndex" || variable === "descriptionIndex" || variable === "numberOfSets")) {
          const op = this.getValue(incAssignmentExpr);
          if (op !== "=" && op !== "+=" && op !== "-=" && op !== "*=" && op !== "/=") {
            this.error(`Unknown operator ${op} after ${variable}`, incAssignmentExpr, {
              type: "unknownAssignmentOperator",
              data: { op, variable }
            });
          }
          return this.recordVariableUpdate(variable, expression, indexExprs, op);
        } else if (this.mode === "update" && variable === "numberOfSets") {
          const op = this.getValue(incAssignmentExpr);
          if (op !== "=" && op !== "+=" && op !== "-=" && op !== "*=" && op !== "/=") {
            this.error(`Unknown operator ${op} after ${variable}`, incAssignmentExpr, {
              type: "unknownAssignmentOperator",
              data: { op, variable }
            });
          }
          return this.changeNumberOfSets(expression, op);
        } else if (this.mode === "update" && (variable === "reps" || variable === "weights" || variable === "RPE" || variable === "minReps" || variable === "timers" || variable === "setTime")) {
          const op = this.getValue(incAssignmentExpr);
          if (op !== "=" && op !== "+=" && op !== "-=" && op !== "*=" && op !== "/=") {
            this.error(`Unknown operator ${op} after ${variable}`, incAssignmentExpr, {
              type: "unknownAssignmentOperator",
              data: { op, variable }
            });
          }
          return this.changeBinding(variable, expression, indexExprs, op);
        } else {
          this.error(`Unknown variable '${variable}'`, stateVar, {
            type: "unknownVariable",
            data: { name: variable }
          });
        }
      } else if (stateVar.type.name === "Variable" /* Variable */) {
        const varKey = this.getValue(stateVar).replace("var.", "");
        let value = this.evaluate(expression);
        if (!(Weight_is(value) || Weight_isPct(value) || typeof value === "number" || typeof value === "string")) {
          value = value ? 1 : 0;
        }
        const op = this.getValue(incAssignmentExpr);
        if (op !== "+=" && op !== "-=" && op !== "*=" && op !== "/=") {
          this.error(`Unknown operator ${op} after ${varKey}`, incAssignmentExpr, {
            type: "unknownAssignmentOperator",
            data: { op, variable: varKey }
          });
        }
        this.vars[varKey] = this.operate(op.slice(0, 1), this.vars[varKey], value, incAssignmentExpr);
        return this.vars[varKey];
      } else {
        const indexNode = stateVar.getChild("StateVariableIndex" /* StateVariableIndex */);
        const stateKeyNode = stateVar.getChild("Keyword" /* Keyword */);
        if (stateKeyNode != null) {
          const stateKey = this.getValue(stateKeyNode);
          let state;
          if (indexNode == null) {
            if (stateKey in this.state) {
              state = this.state;
            } else {
              this.error(`There's no state variable '${stateKey}'`, stateVar, {
                type: "unknownStateVariable",
                data: { stateKey }
              });
            }
          } else {
            const indexEval = this.rejectString(this.evaluate(indexNode), indexNode, "an index");
            const index = this.toNumber(indexEval);
            state = this.otherStates[index];
          }
          let value = this.rejectString(this.evaluate(expression), expression, `state.${stateKey}`);
          if (state != null) {
            if (!(Weight_is(value) || Weight_isPct(value) || typeof value === "number")) {
              value = value ? 1 : 0;
            }
            const op = this.getValue(incAssignmentExpr);
            const currentValue = state[stateKey] ?? 0;
            if (op === "+=") {
              state[stateKey] = this.add(currentValue, value);
            } else if (op === "-=") {
              state[stateKey] = this.subtract(currentValue, value);
            } else if (op === "*=") {
              state[stateKey] = this.multiply(currentValue, value);
            } else if (op === "/=") {
              state[stateKey] = this.divide(currentValue, value);
            } else {
              this.error(`Unknown operator ${op} after state.${stateKey}`, incAssignmentExpr, {
                type: "unknownAssignmentOperator",
                data: { op, variable: `state.${stateKey}` }
              });
            }
            return state[stateKey];
          } else {
            return value;
          }
        } else {
          return 0;
        }
      }
    } else if (expr.type.name === "BuiltinFunctionExpression" /* BuiltinFunctionExpression */) {
      const fns = this.fns;
      const [keyword, ...args] = getChildren2(expr);
      if (keyword == null || keyword.type.name !== "Keyword" /* Keyword */) {
        assert("BuiltinFunctionExpression" /* BuiltinFunctionExpression */);
      }
      const name = this.getValue(keyword);
      if (LiftoscriptFns_isFnName(name) && fns[name] != null) {
        const argValues = args.map((a, index) => {
          const value = this.evaluate(a);
          this.validateFnArg(name, index, a, value);
          return value;
        });
        const fn = fns[name];
        return fn(argValues, this.fnContext, this.bindings);
      } else {
        this.error(`Unknown function '${name}'`, keyword, { type: "unknownFunction", data: { name } });
      }
    } else if (expr.type.name === "UnaryExpression" /* UnaryExpression */) {
      const [, expression] = getChildren2(expr);
      if (expression == null) {
        assert("UnaryExpression" /* UnaryExpression */);
      }
      const evaluated = this.evaluate(expression);
      return !evaluated;
    } else if (expr.type.name === "WeightExpression" /* WeightExpression */) {
      return this.getWeight(expr) ?? Weight_build(0, this.unit);
    } else if (expr.type.name === "VariableExpression" /* VariableExpression */) {
      const [nameNode, ...indexExprs] = getChildren2(expr);
      if (nameNode == null) {
        assert("VariableExpression" /* VariableExpression */);
      }
      const name = this.getValue(nameNode);
      if (indexExprs.some((e) => e.type.name !== "VariableIndex" /* VariableIndex */)) {
        assert("VariableIndex" /* VariableIndex */);
      }
      if (indexExprs.length === 0) {
        let value = this.bindings[name];
        if (Array.isArray(value) && name === "minReps") {
          value = value.map((v, i) => v ?? this.bindings.reps[i]);
        }
        return value;
      } else if (indexExprs.length === 1) {
        const indexExpr = indexExprs[0];
        const indexNode = getChildren2(indexExpr)[0];
        if (indexNode.type.name === "Wildcard" /* Wildcard */ || indexNode.type.name === "Current" /* Current */) {
          this.error(`Can't use '*' or '_' as an index when reading from variables`, indexNode, {
            type: "wildcardIndexOnRead"
          });
        }
        const indexEval = this.rejectString(this.evaluate(indexNode), indexNode, "an index");
        let index;
        if (Weight_is(indexEval) || Weight_isPct(indexEval)) {
          index = indexEval.value;
        } else if (typeof indexEval === "number") {
          index = indexEval;
        } else {
          index = indexEval ? 1 : 0;
        }
        index -= 1;
        const binding = this.bindings[name];
        if (!Array.isArray(binding)) {
          this.error(`Variable ${name} should be an array`, nameNode, { type: "notAnArray", data: { name } });
        }
        if (index >= binding.length) {
          this.error(`Out of bounds index ${index + 1} for array ${name}`, nameNode, {
            type: "indexOutOfBounds",
            data: { name, index: index + 1 }
          });
        }
        let value = binding[index];
        if (value == null) {
          value = name === "minReps" ? this.bindings.reps[index] ?? 0 : 0;
        }
        return value;
      } else {
        this.error(`Can't use [1:1] syntax when reading from the ${name} variable`, expr, {
          type: "rangeIndexOnRead",
          data: { name }
        });
      }
    } else if (expr.type.name === "StateVariable" /* StateVariable */) {
      const stateKey = this.getStateKey(expr);
      if (stateKey == null) {
        this.error(`You cannot read from other exercises states, you can only write to them`, expr, {
          type: "otherStateIsWriteOnly"
        });
      }
      if (stateKey in this.state) {
        return this.state[stateKey];
      } else {
        this.error(`There's no state variable '${stateKey}'`, expr, {
          type: "unknownStateVariable",
          data: { stateKey }
        });
      }
    } else if (expr.type.name === "Variable" /* Variable */) {
      const varKey = this.getValue(expr).replace("var.", "");
      if (varKey in this.vars) {
        return this.vars[varKey];
      } else {
        this.error(`There's no variable '${varKey}'`, expr, { type: "unknownVariable", data: { name: varKey } });
      }
    } else if (expr.type.name === "ForInExpression" /* ForInExpression */) {
      const child = getChildren2(expr)[0];
      return this.evaluate(child);
    } else {
      this.error(`Unknown node type ${expr.node.type.name}`, expr, {
        type: "unexpectedNode",
        data: { node: expr.node.type.name }
      });
    }
  }
  add(one, two) {
    return this.operation(this.bindings.rm1, one, two, (a, b) => a + b);
  }
  subtract(one, two) {
    return this.operation(this.bindings.rm1, one, two, (a, b) => a - b);
  }
  multiply(one, two) {
    return this.operation(this.bindings.rm1, one, two, (a, b) => a * b);
  }
  // Division/modulo by zero returns 0 instead of NaN - NaN serializes to null in JSON
  // and corrupts storage (fails schema validation on the server)
  divide(one, two) {
    return this.operation(this.bindings.rm1, one, two, (a, b) => b === 0 ? 0 : a / b);
  }
  modulo(one, two) {
    return this.operation(void 0, one, two, (a, b) => b === 0 ? 0 : a % b);
  }
  operation(onerm, a, b, op) {
    try {
      return Weight_op(onerm, a, b, op);
    } catch (error) {
      const e = error;
      throw new LiftoscriptSyntaxError(e.message, 0, 0, 0, 0, { type: "invalidWeightOperation" });
    }
  }
};

// third-party/liftosaur/upstream/src/models/equipmentSetupEdit.ts
function defaultPlates(unit) {
  return unit === "lb" ? [
    { weight: 45, num: 8 },
    { weight: 25, num: 4 },
    { weight: 10, num: 4 },
    { weight: 5, num: 4 },
    { weight: 2.5, num: 4 }
  ] : [
    { weight: 20, num: 8 },
    { weight: 10, num: 4 },
    { weight: 5, num: 4 },
    { weight: 2.5, num: 4 },
    { weight: 1.25, num: 4 }
  ];
}
function defaultBands(unit) {
  const weights = unit === "lb" ? [10, 25, 40, 60, 80] : [5, 10, 20, 30, 40];
  const colors = ["yellow", "red", "blue", "green", "black"];
  return colors.map((color, i) => ({
    name: EquipmentSetupEdit_bandColorName(color),
    color,
    weight: weights[i],
    num: 1
  }));
}
function EquipmentSetupEdit_bandColorName(color) {
  return color[0].toUpperCase() + color.slice(1);
}
function EquipmentSetupEdit_default(type, unit) {
  const isLb = unit === "lb";
  switch (type) {
    case "stack":
      return { type, unit, ranges: [isLb ? { from: 10, to: 200, step: 10 } : { from: 5, to: 100, step: 5 }] };
    case "plates":
      return { type, unit, base: isLb ? 45 : 20, plates: defaultPlates(unit), sides: 2 };
    case "fixed":
      return {
        type,
        unit,
        ranges: [isLb ? { from: 5, to: 50, step: 5 } : { from: 2.5, to: 25, step: 2.5 }],
        values: []
      };
    case "electric":
      return isLb ? { type, unit, min: 5, max: 200, step: 1 } : { type, unit, min: 2, max: 90, step: 0.5 };
    case "bands":
      return { type, unit, bands: defaultBands(unit), combine: false };
  }
}

// third-party/liftosaur/upstream/src/models/progress.ts
var import_lens_shmens2 = __toESM(require_dist());

// third-party/liftosaur/upstream/src/models/programSet.ts
function ProgramSet_isEligibleForInferredWeight(set) {
  return set.weight == null && set.maxrep != null && set.rpe != null;
}
function ProgramSet_getEvaluatedWeight(programSet, exerciseType, settings) {
  const originalWeight = programSet.weight;
  const unit = Equipment_getUnitOrDefaultForExerciseType(settings, exerciseType);
  const evaluatedWeight = originalWeight ? Weight_evaluateWeight(originalWeight, exerciseType, settings) : ProgramSet_isEligibleForInferredWeight(programSet) && programSet.maxrep != null && programSet.rpe != null ? Weight_evaluateWeight(Weight_rpePct(programSet.maxrep, programSet.rpe), exerciseType, settings) : void 0;
  return evaluatedWeight ? Weight_roundConvertTo(evaluatedWeight, settings, unit, exerciseType) : void 0;
}

// third-party/liftosaur/upstream/src/pages/planner/plannerExerciseParser.ts
var spec_Keyword2 = { __proto__: null, none: 168, auto: 172 };
var parser2 = LRParser.deserialize({
  version: 14,
  states: "3nQVQPOOOOQO'#Ce'#CeOOQO'#Dg'#DgOnQQO'#CfOOQO'#Cd'#CdO!SQPO'#CdO!XQQO'#CcO!gQQO'#CbOOQO'#De'#DeOOQO'#Ds'#DsOOQO'#Df'#DfQVQPOOOOQO-E7e-E7eOOQO,59O,59OO!rQPO'#DhO!zQQO,58}O#YQSO'#ChO#yQSO'#DjO$aQQO,58|OOQO,58|,58|O$aQQO,58|OOQO-E7d-E7dOOQO,5:S,5:SOOQO-E7f-E7fOOQO'#Ci'#CiO$iQSO,59SO$lQSO,59SO$tQWO'#CiOOQO'#Co'#CoO%PQSO'#CzO!SQPO'#DOO%[QSO'#CnOOQO'#DX'#DXO%aQWO'#DYO%iQSO'#DZO&dQSO'#D[O!SQPO'#D]OOQO'#Dn'#DnO'_QSO'#DUO'oQSO'#DTO#_QSO'#DTO'}QQO'#D_O(]QSO'#DcO(bQQO'#CmOOQO,5:U,5:UOOQO-E7h-E7hOOQO1G.h1G.hO(mQQO1G.hO#YQSO,59VO#YQSO'#DiO(uQSO1G.nOOQO1G.n1G.nOOQO,59r,59rOOQO'#Cv'#CvO(}QSO,59fOOQO,59f,59fOOQO,59j,59jO){QSO,59YO#YQSO,59tO*^QWO,59tOOQO,59u,59uOOQO,59v,59vO*cQPO,59wOOQO-E7l-E7lO#_QSO'#DoO*kQSO,59oO*kQSO,59oO*yQWO'#D`OOQO,59y,59yO!SQPO,59}O+RQPO,59XOOQO7+$S7+$SOOQO1G.q1G.qO+WQSO,5:TOOQO,5:T,5:TOOQO-E7g-E7gOOQO7+$Y7+$YOOQO1G/Q1G/QOOQO'#Cr'#CrO+cQQO'#CqO+wQWO'#DROOQO'#Dl'#DlO,cQSO'#DQO,zQSO'#DPOOQO'#DS'#DSOOQO1G.t1G.tO.TQSO1G/`O-YQSO1G/`O#YQSO1G/`OOQO1G/c1G/cOOQO,5:Z,5:ZOOQO-E7m-E7mO.[QSO1G/ZOOQO'#Da'#DaO.jQSO,59zOOQO1G/i1G/iOOQO1G.s1G.sO.rQSO'#C}OOQO,59],59]O/cQSO,59]O#YQSO,59mOOQO-E7j-E7jO/mQSO'#DmO/xQSO,59kOOQO7+$z7+$zO1RQSO7+$zO0WQSO7+$zOOQO1G/f1G/fO*yQWO1G/fO1YQPO,59iO1_QSO'#CiO1jQSO'#CkOOQO'#Ct'#CtO1oQSO'#CtO1wQSO'#C{OOQO'#Cs'#CsO.wQSO'#DkO2PQSO1G.wO2XQQO1G.wO2PQSO1G.wOOQO1G/X1G/XOOQO,5:X,5:XOOQO-E7k-E7kOOQO<<Hf<<HfO2jQPO7+%QO2oQPO'#CfOOQO1G/T1G/TOOQO,59`,59`O2wQSO,59gO3]QSO,59gOOQO,5:V,5:VOOQO-E7i-E7iO3bQQO7+$cOOQO7+$c7+$cO3sQSO7+$cOOQO<<Hl<<HlOOQO1G/R1G/RO3{QSO1G/ROOQO<<G}<<G}O4aQQO<<G}OOQO7+$m7+$mOOQOAN=iAN=iO!SQPO'#DO",
  stateData: "5U~O!fOS~OQXORXOSXOTXOZQO!hPO!zWO~OZQO`YX!iYX!jYX!{YX!yYX~OZQO~O!i^O`VX!jVX!{VX~O`aO!j`O!{cO~OZQO!hPO~O!i^O`Va!jVa!{Va~O^hO~O^kOlrOmsOyuO!QuO!otO!pmO!xpO~OdlO!WzO!hPO!snO`!^X!{!^X~P#_O`aO!{!OO~O!k!QO!l!RO!m!TO~O!w!UOi]X!u]X~O^!VOi!XOk!VO~O!n!ZO~Oi!]O!u![O~Oi!^O^}X`}Xl}Xm}Xy}X!Q}X!l}X!o}X!p}X!x}X!y}X!{}X~Oi!_O^!OX`!OXl!OXm!OXy!OX!Q!OX!l!OX!o!OX!p!OX!x!OX!y!OX!{!OX~O`xX!lxX!yxX!{xX~P#_O!l!bO`wX!ywX!{wX~O!j!eO`!RX!y!RX!{!RX~O!n!gO~O!y!hO`aX!{aX~O`aO!{!iO~O!l!RO!m!nO~Oi!oO^na`nalnamnayna!Qna!lna!ona!pna!xna!yna!{na!qna~O^hOd!pOl!sOm!sO!v!vO~O!u!zO~OZQO!q!{O~O!l!bO`wa!ywa!{wa~O^#PO!U#PO~O!z#SO~O!k!QO!l!]a!m!]a~Op#UO!o#VO!r#TO`eX!yeX!{eX~O!u#WO^uX`uXluXmuX!luX!yuX!{uX~O^hOl!sOm!sO`tX!ltX!ytX!{tX~O!l#YO`sX!ysX!{sX~Oi#[O^|i`|il|im|iy|i!Q|i!l|i!o|i!p|i!x|i!y|i!{|i~O!k!QO~P-YO!l!bO`wi!ywi!{wi~O!m#_O!n#`O~O!s$SO~O^#bOd#fOi#eOk!VOl#gOm#gO!k#eO!pmO~O!l#hO!q#jO~P.wO^hOl!sOm!sO~O!l#YO`sa!ysa!{sa~Oi#oO^|q`|ql|qm|qy|q!Q|q!l|q!o|q!p|q!x|q!y|q!{|q~O!k!QO~P0WO!t#rO~O!k]X!ljX!qjX~O!k!QO~O^!VOk!VO~Oi#uO!n#tO~O!l#hO!q#xO~Op#yO!r#TO`ei!yei!{ei~O!m#{O~OZQO!tYX~O^!VOi#eOk!VOl#|Om#|O!k#eO~O!n#}O~Op$OO!r#TO`eq!yeq!{eq~O!l#hO!q$PO~O^!VOi#eOk!VOl$QOm$QO!k#eO~Op$RO!r#TO`ey!yey!{ey~Ol!Wd!y!j!m!QRQTSZmyk^m~",
  goto: "(v!hPPPPPP!i!m!q!x#QP#a#dP$VP$g$j$mP$p$s$v$|P%WPPP%d$cP%n%z$p&Q&W$p$j&]P&f&f&f&f&f&fP$j&l&oP$jP!i&u&{'`'f'm'w(R(Y(`(hPPP(rTXOZTVOZSUOZRf^UTOZ^RxaUSOZ^Q]TS!Yn$SR#R!gRdVQi`Wqavx!bQ!j!QQ!k!RU!r!Z!t#YQ!x![Q#]!zS#c#V#hR#l#WQj`Q!l!RQ!y![Q#^!zT#g#V#hR|aR{aRoaR!w!ZR!q!ZQ#k#VR#v#hS#g#V#hQ#|#tR$Q#}Q!WmW#d#V#h#t#}R#s#eWuavx!bT#g#V#hQ#U!qQ#y#jQ$O#xR$R$PQyaR#a#TQ!u!ZR#m#YV!s!Z!t#YQwaQ!dxR!|!bXuavx!bR!fyQ#Q!eR#p#`QZOReZ[ROTZ^n!gU[R!`#qQ!`tR#q$SQ_URg_S!SijR!m!SQbVS}b!PR!PdQ#i#VS#w#i#zR#z#kS!t!Z#YR#X!tQ#Z!uR#n#ZUvax!bR!avQ!cwS!}!c#OR#O!dTYOZ",
  nodeNames: "\u26A0 Program LineComment TripleLineComment Week Day ExerciseExpression ExerciseVariations ExerciseVariation CurrentVariation ExerciseName NonSeparator Repeat Rep Int RepRange SectionSeparator ExerciseSection ExerciseProperty ExercisePropertyName Keyword FunctionExpression FunctionName FunctionArgument Number Plus PosNumber Float Weight Percentage Rpe KeyValue Liftoscript ReuseLiftoscript ReuseSection WarmupExerciseSets WarmupExerciseSet WarmupSetPart None ExerciseSets ExerciseSet SetTimer Timer Auto SetPart WeightWithPlus PercentageWithPlus SetLabel AskWeight ReuseSectionWithWeekDay WeekDay WeekOrDay Current Superset SupersetKeyword EmptyExpression",
  maxTerm: 89,
  skippedNodes: [0],
  repeatNodeCount: 10,
  tokenData: "!)W~R|OX#{XY$|YZ%XZ]#{]^%`^p#{pq$|qr%jrs#{st%otx#{xy)qyz)vz{#{{|){|}2g}!O3d!O!P4g!P!Q8r!Q![<|![!]A}!]!a#{!a!bBz!b!cDx!c!}Eu!}#OGR#O#PGW#P#QHT#Q#R#{#R#SHY#S#T#{#T#gEu#g#hIh#h#lEu#l#m!&l#m#oEu#o#p!'z#p#q!(w#q#r!(|#r;'S#{;'S;=`$v<%l~#{~O#{~~!)RR$Q[ZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{R$yP;=`<%l#{~%RQ!f~XY$|pq$|_%`O!zP!{^_%gP!zP!{^YZ%X~%oO!h~~%rZOY&eYZ'TZ]&e]^'Y^s&est(Qt;'S&e;'S;=`'z<%l~&e~O&e~~'T~&hXOY&eYZ'TZ]&e]^'Y^;'S&e;'S;=`'z<%l~&e~O&e~~'T~'YOS~~'_XS~OY&eYZ'TZ]&e]^'Y^;'S&e;'S;=`'z<%l~&e~O&e~~'T~'}P;=`<%l&e~(TXOY(QYZ(pZ](Q]^(w^;'S(Q;'S;=`)k<%l~(Q~O(Q~~(p~(wOT~S~~)OXT~S~OY(QYZ(pZ](Q]^(w^;'S(Q;'S;=`)k<%l~(Q~O(Q~~(p~)nP;=`<%l(Q~)vO!o~~){O!q~_*S^i[ZROX#{Z]#{^p#{rs#{tx#{z!O#{!O!P+O!Q![1V![!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{_+T]ZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q![+|![!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{_,RbZROX#{Z]#{^p#{rs#{tu#{uv-Zvx#{z!P#{!Q![+|![!}#{#O#P#{#Q#_#{#_#`.W#`#a0U#a#o#{#r;'S#{;'S;=`$v<%lO#{_-b[ZRm[OX#{Z]#{^p#{rs#{tx#{z!P#{!Q!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{_.]^ZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q!}#{#O#P#{#Q#Z#{#Z#[/X#[#o#{#r;'S#{;'S;=`$v<%lO#{_/`[l[ZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{_0Z^ZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q!}#{#O#P#{#Q#U#{#U#V/X#V#o#{#r;'S#{;'S;=`$v<%lO#{_1[cZROX#{Z]#{^p#{rs#{tu#{uv-Zvx#{z!O#{!O!P+O!Q![1V![!}#{#O#P#{#Q#_#{#_#`.W#`#a0U#a#o#{#r;'S#{;'S;=`$v<%lO#{_2n[!l[ZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{_3k^!kSZROX#{Z]#{^p#{rs#{tx#{z!O#{!O!P+O!Q![1V![!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{_4l^ZROX#{Z]#{^p#{rs#{tx#{z!O#{!O!P5h!Q![7c![!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{V5m]ZROX#{Z]#{^p#{rs#{tx#{z!O#{!O!P6f!Q!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{V6m[!sSZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{_7jbZRkSOX#{Z]#{^p#{rs#{tu#{uv-Zvx#{z!P#{!Q![7c![!}#{#O#P#{#Q#_#{#_#`.W#`#a0U#a#o#{#r;'S#{;'S;=`$v<%lO#{_8wP`^!P!Q8zP8}ZOY9pYZ:`Z]9p]^:e^!P9p!P!Q;]!Q;'S9p;'S;=`;V<%l~9p~O9p~~:`P9sXOY9pYZ:`Z]9p]^:e^;'S9p;'S;=`;V<%l~9p~O9p~~:`P:eOQPP:jXQPOY9pYZ:`Z]9p]^:e^;'S9p;'S;=`;V<%l~9p~O9p~~:`P;YP;=`<%l9pP;`XOY;]YZ;{Z];]]^<S^;'S;];'S;=`<v<%l~;]~O;]~~;{P<SORPQPP<ZXRPQPOY;]YZ;{Z];]]^<S^;'S;];'S;=`<v<%l~;]~O;]~~;{P<yP;=`<%l;]_=TeZR^[OX#{Z]#{^p#{rs#{tu#{uv-Zvx#{z!O#{!O!P>f!Q![<|![!}#{#O#P#{#Q#_#{#_#`.W#`#a0U#a#g#{#g#h?d#h#o#{#r;'S#{;'S;=`$v<%lO#{_>k]ZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q![7c![!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{V?i_ZROX#{Z]#{^p#{rs#{tx#{z{#{{|@h|!P#{!Q!}#{#O#P#{#Q#o#{#p#qAf#r;'S#{;'S;=`$v<%lO#{V@m]ZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q!}#{#O#P#{#Q#o#{#p#qAf#r;'S#{;'S;=`$v<%lO#{SAiQ!Q![Ao!a!bAxSArQ!Q![Ao#g#hAxSA}OySVBU[!nSZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{~CP^ZROX#{Z]#{^p#{rs#{tx#{z{#{{|C{|!P#{!Q!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{~DS[!Q~ZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{VEP[!pSZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{VE|adSZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q![Eu![!c#{!c!}Eu#O#P#{#Q#R#{#R#SEu#S#T#{#T#oEu#r;'S#{;'S;=`$v<%lO#{~GWO!j~~G_[!y~ZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q!}#{#O#P#{#Q#o#{#r;'S#{;'S;=`$v<%lO#{~HYO!m~_Hca!UWdSZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q![Eu![!c#{!c!}Eu#O#P#{#Q#R#{#R#SEu#S#T#{#T#oEu#r;'S#{;'S;=`$v<%lO#{_Iqc!wWdSZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q![Eu![!c#{!c!}Eu#O#P#{#Q#R#{#R#SEu#S#T#{#T#iEu#i#jJ|#j#oEu#r;'S#{;'S;=`$v<%lO#{VKTcdSZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q![Eu![!c#{!c!}Eu#O#P#{#Q#R#{#R#SEu#S#T#{#T#dEu#d#eL`#e#oEu#r;'S#{;'S;=`$v<%lO#{VLgcdSZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q![Eu![!c#{!c!}Eu#O#P#{#Q#R#{#R#SEu#S#T#{#T#XEu#X#YMr#Y#oEu#r;'S#{;'S;=`$v<%lO#{VMycdSZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q![Eu![!c#{!c!}Eu#O#P#{#Q#R#{#R#SEu#S#T#{#T#fEu#f#g! U#g#oEu#r;'S#{;'S;=`$v<%lO#{V! ]cdSZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q![Eu![!c#{!c!}Eu#O#P#{#Q#R#{#R#SEu#S#T#{#T#gEu#g#h!!h#h#oEu#r;'S#{;'S;=`$v<%lO#{V!!ocdSZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q![Eu![!c#{!c!}Eu#O#P#{#Q#R#{#R#SEu#S#T#{#T#XEu#X#Y!#z#Y#oEu#r;'S#{;'S;=`$v<%lO#{V!$RcdSZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q![Eu![!c#{!c!}Eu#O#P#{#Q#R#{#R#SEu#S#T#{#T#hEu#h#i!%^#i#oEu#r;'S#{;'S;=`$v<%lO#{V!%ga!WSdSZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q![Eu![!c#{!c!}Eu#O#P#{#Q#R#{#R#SEu#S#T#{#T#oEu#r;'S#{;'S;=`$v<%lO#{_!&ua!uWdSZROX#{Z]#{^p#{rs#{tx#{z!P#{!Q![Eu![!c#{!c!}Eu#O#P#{#Q#R#{#R#SEu#S#T#{#T#oEu#r;'S#{;'S;=`$v<%lO#{~!(PP!r~#r#s!(S~!(VTO#r!(S#r#s!(f#s;'S!(S;'S;=`!(q<%lO!(S~!(iP#q#r!(l~!(qOp~~!(tP;=`<%l!(S~!(|O!i~~!)RO!t~^!)WO!{^",
  tokenizers: [0, 1, 2, 3],
  topRules: { Program: [0, 1] },
  specialized: [{ term: 20, get: (value) => spec_Keyword2[value] || -1 }],
  tokenPrec: 908
});

// third-party/liftosaur/upstream/src/pages/planner/models/plannerStateVars.ts
function PlannerStateVars_fromArgs(fnArgs, onError) {
  const state = {};
  const stateMetadata = {};
  for (const value of fnArgs) {
    let [fnArgKey, fnArgValStr] = value.split(":").map((v) => v.trim());
    if (onError && (!fnArgKey || !fnArgValStr)) {
      onError(`Invalid argument ${value}`, value);
    }
    if (fnArgKey.endsWith("+")) {
      fnArgKey = fnArgKey.replace("+", "");
      stateMetadata[fnArgKey] = { userPrompted: true };
    } else {
      stateMetadata[fnArgKey] = { userPrompted: false };
    }
    try {
      const fnArgVal = fnArgValStr.match(/(lb|kg)/) ? Weight_parse(fnArgValStr) : fnArgValStr.match(/%/) ? Weight_buildPct(parseFloat(fnArgValStr)) : MathUtils_roundFloat(parseFloat(fnArgValStr), 2);
      state[fnArgKey] = fnArgVal ?? 0;
    } catch (e) {
      if (onError) {
        onError(`Invalid argument ${value}`, value);
      } else {
        throw e;
      }
    }
  }
  return { state, stateMetadata };
}

// third-party/liftosaur/upstream/src/pages/planner/plannerKey.tsx
var import_micro_memoize = __toESM(require_micro_memoize());
function PlannerKey_fromPlannerExercise(plannerExercise, settings) {
  if (plannerExercise.exerciseVariations != null && plannerExercise.exerciseVariations.length > 1) {
    return PlannerKey_fromExerciseVariations(plannerExercise.exerciseVariations, plannerExercise.label);
  } else if (plannerExercise.exerciseType) {
    return PlannerKey_fromExerciseType(plannerExercise.exerciseType, plannerExercise.label);
  } else {
    return PlannerKey_fromFullName(plannerExercise.fullName, settings.exercises);
  }
}
function PlannerKey_fromExerciseVariations(variations, label) {
  const keyPart = variations.map((v) => v.exerciseType ? Exercise_toKey(v.exerciseType) : v.name).join("_");
  return `${label ? `${label}-` : ""}${keyPart}`.toLowerCase();
}
function PlannerKey_fromExerciseType(exerciseType, label) {
  const key = Exercise_toKey(exerciseType);
  const plannerKey = `${label ? `${label}-` : ""}${key}`.toLowerCase();
  return plannerKey;
}
var PlannerKey_fromFullName = (0, import_micro_memoize.default)(
  (fullName, exercises) => {
    const segments = fullName.split("|");
    if (segments.length === 1) {
      const { label: label2, name, equipment } = PlannerExerciseEvaluator.extractNameParts(fullName, exercises);
      return PlannerKey_fromLabelNameAndEquipment(label2, name, equipment, exercises);
    }
    let label;
    const keyParts = segments.map((segment, i) => {
      const cleaned = segment.trim().replace(/^!\s*/, "");
      const { label: segmentLabel, name, equipment } = PlannerExerciseEvaluator.extractNameParts(cleaned, exercises);
      if (i === 0) {
        label = segmentLabel;
      }
      const exercise = Exercise_findByNameEquipment(exercises, name, equipment);
      return exercise ? Exercise_toKey(exercise) : name;
    });
    return `${label ? `${label}-` : ""}${keyParts.join("_")}`.toLowerCase();
  },
  { maxSize: 1e3 }
);
var PlannerKey_fromLabelNameAndEquipment = (0, import_micro_memoize.default)(
  (label, name, equipment, exercises) => {
    const exercise = Exercise_findByNameEquipment(exercises, name, equipment);
    const key = exercise ? Exercise_toKey(exercise) : name;
    const plannerKey = `${label ? `${label}-` : ""}${key}`.toLowerCase();
    return plannerKey;
  },
  {
    maxSize: 1e3
  }
);

// third-party/liftosaur/upstream/src/pages/planner/plannerExerciseEvaluator.ts
var import_micro_memoize2 = __toESM(require_micro_memoize());
var PlannerSyntaxError = class _PlannerSyntaxError extends SyntaxError {
  static fromPoint(fullName, message, point, details) {
    return new _PlannerSyntaxError(
      `${fullName ? `${fullName}: ` : ""}${message} (${point.line}:${point.offset})`,
      point.line,
      point.offset,
      point.from,
      point.to,
      fullName != null ? { ...details, subject: fullName } : details
    );
  }
  constructor(message, line, offset, from, to, details) {
    super(message);
    this.line = line;
    this.offset = offset;
    this.from = from;
    this.to = to;
    this.details = details;
  }
  toString() {
    return this.message;
  }
};
function getChildren3(node) {
  const cur = node.cursor();
  const result = [];
  if (!cur.firstChild()) {
    return result;
  }
  do {
    result.push(cur.node);
  } while (cur.nextSibling());
  return result;
}
function assert2(name) {
  throw new PlannerSyntaxError(`Missing required nodes for ${name}, this should never happen`, 0, 0, 0, 1, {
    type: "internal",
    data: { node: name }
  });
}
var PlannerExerciseEvaluator = class _PlannerExerciseEvaluator {
  constructor(script, settings, mode, dayData) {
    this.weeks = [];
    this.exerciseIndex = 0;
    this.latestDescriptions = [];
    this.script = script;
    this.settings = settings;
    this.dayData = dayData || { day: 1, week: 1, dayInWeek: 1 };
    this.mode = mode;
  }
  getValue(node) {
    return this.getValueTrim(node).replace(/\n/g, "\\n").replace(/\t/g, "\\t");
  }
  getValueTrim(node) {
    return this.script.slice(node.from, node.to);
  }
  static applyChangesToScript(script, ranges) {
    let offset = 0;
    while (ranges.length > 0) {
      const [from, to, replacement] = ranges.shift();
      script = script.slice(0, from + offset) + replacement + script.slice(to + offset);
      offset += replacement.length - (to - from);
    }
    return script;
  }
  static isEqualProperty(a, b) {
    return a.fnName === b.fnName && a.fnArgs.join() === b.fnArgs.join() && a.script === b.script && a.body === b.body;
  }
  static isEqualProgress(a, b) {
    const pickA = {
      ...ObjectUtils_pick(a, ["type", "state", "stateMetadata", "script"]),
      reuse: a.reuse?.fullName
    };
    const pickB = {
      ...ObjectUtils_pick(b, ["type", "state", "stateMetadata", "script"]),
      reuse: b.reuse?.fullName
    };
    return ObjectUtils_isEqual(pickA, pickB);
  }
  static isEqualUpdate(a, b) {
    const pickA = { ...ObjectUtils_pick(a, ["type", "script"]), reuse: a.reuse?.fullName };
    const pickB = { ...ObjectUtils_pick(b, ["type", "script"]), reuse: b.reuse?.fullName };
    return ObjectUtils_isEqual(pickA, pickB);
  }
  getPoint(node) {
    const [line, offset] = this.getLineAndOffset(node);
    return { line, offset, from: node.from, to: node.to };
  }
  error(message, node, details) {
    const point = this.getPoint(node);
    throw PlannerSyntaxError.fromPoint(void 0, message, point, details);
  }
  static getLineAndOffset(script, node) {
    const linesLengths = script.split("\n").map((l) => l.length + 1);
    let offset = 0;
    for (let i = 0; i < linesLengths.length; i++) {
      const lineLength = linesLengths[i];
      if (node.from >= offset && node.from < offset + lineLength) {
        return [i + 1, node.from - offset];
      }
      offset += lineLength;
    }
    return [linesLengths.length, linesLengths[linesLengths.length - 1]];
  }
  getLineAndOffset(node) {
    return _PlannerExerciseEvaluator.getLineAndOffset(this.script, node);
  }
  parse(expr) {
    const cursor = expr.cursor();
    do {
      if (cursor.node.type.isError) {
        this.error("Syntax error", cursor.node, { type: "parse" });
      }
    } while (cursor.next());
  }
  getWarmupReps(setParts) {
    let [numberOfSetsStr, repsStr] = setParts.split("x", 2);
    if (!numberOfSetsStr) {
      return { numberOfSets: 1, reps: 1 };
    }
    if (!repsStr) {
      repsStr = numberOfSetsStr;
      numberOfSetsStr = "1";
    }
    return {
      reps: parseInt(repsStr, 10),
      numberOfSets: parseInt(numberOfSetsStr, 10)
    };
  }
  getRepRange(setParts) {
    if (!setParts) {
      return void 0;
    }
    const [numberOfSetsStr, repRangeStr] = setParts.split("x", 2);
    const reprange = repRangeStr.split("-", 2);
    let minrepStr = reprange[0];
    let maxrepStr = reprange[1];
    if (!maxrepStr) {
      maxrepStr = minrepStr;
      minrepStr = void 0;
    }
    let isAmrap = false;
    if (maxrepStr.endsWith("+")) {
      isAmrap = true;
      maxrepStr.replace(/\+/g, "");
    }
    return {
      numberOfSets: parseInt(numberOfSetsStr, 10),
      minrep: minrepStr != null ? parseInt(minrepStr, 10) : void 0,
      maxrep: parseInt(maxrepStr, 10),
      isAmrap,
      isQuickAddSet: numberOfSetsStr.endsWith("+")
    };
  }
  getWeight(expr) {
    if (expr?.type.name === "WeightWithPlus" /* WeightWithPlus */ || expr?.type.name === "Weight" /* Weight */) {
      const value = this.getValue(expr).replace("+", "");
      const unit = value.indexOf("kg") !== -1 ? "kg" : "lb";
      return Weight_build(parseFloat(value), unit);
    } else {
      return void 0;
    }
  }
  evaluateWarmupSet(expr) {
    if (expr.type.name === "WarmupExerciseSet" /* WarmupExerciseSet */) {
      const setPartNodes = expr.getChildren("WarmupSetPart" /* WarmupSetPart */);
      const setParts = setPartNodes.map((setPartNode) => this.getValue(setPartNode)).join("");
      const { numberOfSets, reps } = this.getWarmupReps(setParts);
      const percentageNode = expr.getChild("Percentage" /* Percentage */);
      const weightNode = expr.getChild("Weight" /* Weight */);
      const percentage = percentageNode == null ? void 0 : parseFloat(this.getValue(percentageNode).replace("%", ""));
      const weight = this.getWeight(weightNode);
      if (percentage) {
        return {
          type: "warmup",
          reps,
          numberOfSets,
          percentage
        };
      } else {
        return {
          type: "warmup",
          reps,
          numberOfSets,
          weight
        };
      }
    } else {
      assert2("ExerciseSection" /* ExerciseSection */);
    }
  }
  static fnArgsToStateVars(fnArgs, onError) {
    return PlannerStateVars_fromArgs(fnArgs, onError);
  }
  evaluateSet(expr) {
    if (expr.type.name === "ExerciseSet" /* ExerciseSet */) {
      const setPartNodes = expr.getChildren("SetPart" /* SetPart */);
      const setParts = setPartNodes.map((setPartNode) => this.getValue(setPartNode)).join("");
      const repRange = this.getRepRange(setParts);
      const rpeNode = expr.getChild("Rpe" /* Rpe */);
      const timerNode = expr.getChild("Timer" /* Timer */);
      const setTimerNode = expr.getChild("SetTimer" /* SetTimer */);
      const autoNode = expr.getChild("Auto" /* Auto */);
      const percentageNode = expr.getChild("PercentageWithPlus" /* PercentageWithPlus */);
      const weightNode = expr.getChild("WeightWithPlus" /* WeightWithPlus */);
      const labelNode = expr.getChild("SetLabel" /* SetLabel */);
      const askWeightNode = expr.getChild("AskWeight" /* AskWeight */);
      const askWeight = askWeightNode != null || weightNode != null && this.getValue(weightNode).indexOf("+") !== -1 || percentageNode != null && this.getValue(percentageNode).indexOf("+") !== -1;
      const logRpe = rpeNode == null ? void 0 : this.getValue(rpeNode).indexOf("+") !== -1;
      let rpe = rpeNode == null ? void 0 : parseFloat(this.getValue(rpeNode).replace("@", "").replace("+", ""));
      if (rpe != null && isNaN(rpe)) {
        rpe = void 0;
      }
      let timer = timerNode == null ? void 0 : parseInt(this.getValue(timerNode).replace("s", ""), 10);
      let setTimer;
      let isOverflowSetTimer;
      if (setTimerNode != null) {
        const [leftRaw, rightRaw] = this.getValue(setTimerNode).split("|");
        isOverflowSetTimer = leftRaw.indexOf("+") !== -1 ? true : void 0;
        setTimer = parseInt(leftRaw.replace("s", "").replace("+", ""), 10);
        timer = rightRaw === "?" ? void 0 : parseInt(rightRaw.replace("s", ""), 10);
      }
      const auto = autoNode != null ? true : void 0;
      const percentage = percentageNode == null ? void 0 : parseFloat(this.getValue(percentageNode).replace(/[%\+]/, ""));
      const weight = this.getWeight(weightNode);
      const label = labelNode ? getChildren3(labelNode).map((n2) => this.getValue(n2)).join(" ") : void 0;
      if (labelNode && label && label.length > 8) {
        this.error("Label length should be 8 chars max", labelNode, { type: "labelTooLong", data: { max: 8 } });
      }
      return {
        repRange,
        timer,
        setTimer,
        isOverflowSetTimer,
        auto,
        logRpe,
        rpe,
        weight,
        percentage,
        label,
        askWeight
      };
    } else {
      assert2("ExerciseSection" /* ExerciseSection */);
    }
  }
  evaluateId(expr) {
    if (expr.type.name === "ExerciseProperty" /* ExerciseProperty */) {
      const valueNode = expr.getChild("FunctionExpression" /* FunctionExpression */);
      if (valueNode == null) {
        throw this.error(`Missing value for the property 'id'`, expr, {
          type: "missingPropertyValue",
          data: { property: "id" }
        });
      }
      const fnNameNode = valueNode.getChild("FunctionName" /* FunctionName */);
      if (fnNameNode == null) {
        assert2("FunctionName" /* FunctionName */);
      }
      const fnName = this.getValue(fnNameNode);
      if (["tags"].indexOf(fnName) === -1) {
        this.error(`There's no such id type - '${fnName}'`, fnNameNode, {
          type: "unknownIdType",
          data: { name: fnName }
        });
      }
      const fnArgs = valueNode.getChildren("FunctionArgument" /* FunctionArgument */).map((argNode) => this.getValue(argNode));
      if (fnName === "tags") {
        if (fnArgs.length === 0) {
          this.error(`You should provide the list of numbers in "tags"`, fnNameNode, { type: "invalidTags" });
        }
      }
      return fnArgs.map((t) => parseInt(t, 10)).filter((t) => !isNaN(t));
    } else {
      assert2("ExerciseProperty" /* ExerciseProperty */);
    }
  }
  evaluateUpdate(expr, exerciseType) {
    if (expr.type.name === "ExerciseProperty" /* ExerciseProperty */) {
      const valueNode = expr.getChild("FunctionExpression" /* FunctionExpression */);
      if (valueNode == null) {
        throw this.error(`Missing value for the property 'update'`, expr, {
          type: "missingPropertyValue",
          data: { property: "update" }
        });
      }
      const fnNameNode = valueNode.getChild("FunctionName" /* FunctionName */);
      if (fnNameNode == null) {
        assert2("FunctionName" /* FunctionName */);
      }
      const fnName = this.getValue(fnNameNode);
      const fnArgs = valueNode.getChildren("FunctionArgument" /* FunctionArgument */).map((argNode) => this.getValue(argNode));
      let script;
      let body;
      let meta;
      let liftoscriptNode;
      if (fnName === "custom") {
        liftoscriptNode = valueNode.getChild("Liftoscript" /* Liftoscript */) || void 0;
        script = liftoscriptNode ? this.getValueTrim(liftoscriptNode) : void 0;
        if (fnArgs.length > 0) {
          this.error(`State variables for the update script are taken from "progress" block`, fnNameNode, {
            type: "updateStateFromProgress"
          });
        }
        const reuseLiftoscriptNode = valueNode.getChild("ReuseLiftoscript" /* ReuseLiftoscript */)?.getChild("ReuseSection" /* ReuseSection */)?.getChild("ExerciseName" /* ExerciseName */);
        body = reuseLiftoscriptNode ? this.getValue(reuseLiftoscriptNode) : void 0;
        if (script) {
          const liftoscriptEvaluator = new ScriptRunner(
            script,
            {},
            {},
            Progress_createEmptyScriptBindings(this.dayData, this.settings),
            Progress_createScriptFunctions(this.settings),
            this.settings.units,
            { exerciseType, unit: this.settings.units, prints: [] },
            "update"
          );
          const stateKeys = liftoscriptEvaluator.getStateVariableKeys();
          meta = { stateKeys };
        }
        if (!script && !body) {
          this.error(
            `'custom' update requires either to specify Liftoscript block or specify which one to reuse`,
            valueNode,
            { type: "customWithoutScript", data: { section: "update" } }
          );
        }
        return {
          type: "custom",
          script,
          liftoscriptNode,
          meta,
          reuse: body ? { fullName: body, source: "specific" } : void 0
        };
      } else {
        this.error(`There's no such update progression exists - '${fnName}'`, fnNameNode, {
          type: "unknownUpdate",
          data: { name: fnName }
        });
      }
    } else {
      assert2("ExerciseProperty" /* ExerciseProperty */);
    }
  }
  validateProgress(fnName, fnArgs, fnNameNode, valueNode) {
    if (["lp", "sum", "dp", "custom", "none"].indexOf(fnName) === -1) {
      this.error(`There's no such progression exists - '${fnName}'`, fnNameNode, {
        type: "unknownProgression",
        data: { name: fnName }
      });
    }
    if (fnName === "lp") {
      if (fnArgs.length > 6) {
        this.error(`Linear Progression 'lp' only has 6 arguments max`, valueNode, {
          type: "progressionArity",
          data: { fn: "lp", max: 6 }
        });
      } else if (fnArgs[0] && !fnArgs[0].endsWith("lb") && !fnArgs[0].endsWith("kg") && !fnArgs[0].endsWith("%")) {
        this.error(
          `1st argument of 'lp' should be weight (ending with 'lb' or 'kg') or percentage (ending with '%'). For example '10lb' or '30%'.`,
          valueNode,
          { type: "progressionArgument", data: { fn: "lp", index: 0, expected: "weightOrPercentage" } }
        );
      } else if (fnArgs[1] != null && isNaN(parseInt(fnArgs[1], 10))) {
        this.error(`2nd argument of 'lp' should be a number of attempts - i.e. a number`, valueNode, {
          type: "progressionArgument",
          data: { fn: "lp", index: 1, expected: "number" }
        });
      } else if (fnArgs[2] != null && isNaN(parseInt(fnArgs[2], 10))) {
        this.error(
          `3rd argument of 'lp' should be a current number of successful attempts up to date - i.e. a number`,
          valueNode,
          { type: "progressionArgument", data: { fn: "lp", index: 2, expected: "number" } }
        );
      } else if (fnArgs[3] != null && !fnArgs[3].endsWith("lb") && !fnArgs[3].endsWith("kg") && !fnArgs[3].endsWith("%")) {
        this.error(
          `4th argument of 'lp' should be weight (ending with 'lb' or 'kg') or percentage (ending with '%'). For example '10lb' or '30%'.`,
          valueNode,
          { type: "progressionArgument", data: { fn: "lp", index: 3, expected: "weightOrPercentage" } }
        );
      } else if (fnArgs[4] != null && isNaN(parseInt(fnArgs[4], 10))) {
        this.error(`5th argument of 'lp' should be a number of failed attempts - i.e. a number`, valueNode, {
          type: "progressionArgument",
          data: { fn: "lp", index: 4, expected: "number" }
        });
      } else if (fnArgs[5] != null && isNaN(parseInt(fnArgs[5], 10))) {
        this.error(
          `6th argument of 'lp' should be a current number of failed attempts up to date - i.e. a number`,
          valueNode,
          { type: "progressionArgument", data: { fn: "lp", index: 5, expected: "number" } }
        );
      }
    } else if (fnName === "sum") {
      if (fnArgs.length > 2) {
        this.error(`Reps Sum Progression 'sum' only has 2 arguments max`, valueNode, {
          type: "progressionArity",
          data: { fn: "sum", max: 2 }
        });
      } else if (fnArgs[0] == null || isNaN(parseInt(fnArgs[0], 10))) {
        this.error(`1st argument of 'sum' should be a number of reps - i.e. a number`, valueNode, {
          type: "progressionArgument",
          data: { fn: "sum", index: 0, expected: "number" }
        });
      } else if (fnArgs[1] == null || !fnArgs[1].endsWith("lb") && !fnArgs[1].endsWith("kg") && !fnArgs[1].endsWith("%")) {
        this.error(
          `2nd argument of 'sum' should be weight (ending with 'lb' or 'kg') or percentage (ending with '%'). For example '10lb' or '30%'.`,
          valueNode,
          { type: "progressionArgument", data: { fn: "sum", index: 1, expected: "weightOrPercentage" } }
        );
      }
    } else if (fnName === "dp") {
      if (fnArgs.length !== 3) {
        this.error(`Double Progression 'dp' should have 3 arguments`, valueNode, {
          type: "progressionArity",
          data: { fn: "dp", max: 3 }
        });
      } else if (fnArgs[0] == null || !fnArgs[0].endsWith("lb") && !fnArgs[0].endsWith("kg") && !fnArgs[0].endsWith("%")) {
        this.error(
          `1st argument of 'dp' should be weight (ending with 'lb' or 'kg') or percentage (ending with '%'). For example '10lb' or '30%'.`,
          valueNode,
          { type: "progressionArgument", data: { fn: "dp", index: 0, expected: "weightOrPercentage" } }
        );
      } else if (fnArgs[1] == null || isNaN(parseInt(fnArgs[1], 10))) {
        this.error(`2nd argument of 'dp' should be min reps in the range - i.e. a number, like 8`, valueNode, {
          type: "progressionArgument",
          data: { fn: "dp", index: 1, expected: "number" }
        });
      } else if (fnArgs[2] == null || isNaN(parseInt(fnArgs[2], 10))) {
        this.error(`3rd argument of 'dp' should be max reps in the range - i.e. a number, like 12`, valueNode, {
          type: "progressionArgument",
          data: { fn: "dp", index: 2, expected: "number" }
        });
      }
    } else if (fnName === "custom") {
      const liftoscriptNode = valueNode.getChild("Liftoscript" /* Liftoscript */);
      const script = liftoscriptNode ? this.getValueTrim(liftoscriptNode) : void 0;
      const reuseLiftoscriptNode = valueNode.getChild("ReuseLiftoscript" /* ReuseLiftoscript */)?.getChild("ReuseSection" /* ReuseSection */)?.getChild("ExerciseName" /* ExerciseName */);
      const body = reuseLiftoscriptNode ? this.getValue(reuseLiftoscriptNode) : void 0;
      if (!script && !body) {
        this.error(
          `'custom' progression requires either to specify Liftoscript block or specify which one to reuse`,
          valueNode,
          { type: "customWithoutScript", data: { section: "progress" } }
        );
      }
    }
  }
  evaluateProgress(expr, exerciseType) {
    const result = this.evaluateProgressImpl(expr, exerciseType);
    if (result.success) {
      return result.data;
    } else {
      throw this.error(result.error.message, expr, result.error.details);
    }
  }
  evaluateProgressImpl(expr, exerciseType) {
    if (expr.type.name === "ExerciseProperty" /* ExerciseProperty */) {
      const valueNode = expr.getChild("FunctionExpression" /* FunctionExpression */);
      if (valueNode == null) {
        const none = expr.getChild("None" /* None */);
        if (none != null) {
          return PlannerProgramExercise_buildProgress("none", []);
        } else {
          throw this.error(`Missing value for the property 'progress'`, expr, {
            type: "missingPropertyValue",
            data: { property: "progress" }
          });
        }
      }
      const fnNameNode = valueNode.getChild("FunctionName" /* FunctionName */);
      if (fnNameNode == null) {
        assert2("FunctionName" /* FunctionName */);
      }
      const fnName = this.getValue(fnNameNode);
      const fnArgs = valueNode.getChildren("FunctionArgument" /* FunctionArgument */).map((argNode) => this.getValue(argNode));
      this.validateProgress(fnName, fnArgs, fnNameNode, valueNode);
      const type = fnName;
      if (type === "custom") {
        const liftoscriptNode = valueNode.getChild("Liftoscript" /* Liftoscript */);
        const script = liftoscriptNode ? this.getValueTrim(liftoscriptNode) : void 0;
        const { state } = _PlannerExerciseEvaluator.fnArgsToStateVars(
          fnArgs,
          (message, value) => this.error(message, fnNameNode, { type: "invalidStateVariable", data: { value } })
        );
        if (script) {
          const liftoscriptEvaluator = new ScriptRunner(
            script,
            state,
            {},
            Progress_createEmptyScriptBindings(this.dayData, this.settings),
            Progress_createScriptFunctions(this.settings),
            this.settings.units,
            { exerciseType, unit: this.settings.units, prints: [] },
            "planner"
          );
          try {
            liftoscriptEvaluator.parse();
          } catch (e) {
            if (e instanceof LiftoscriptSyntaxError && liftoscriptNode) {
              const [line] = this.getLineAndOffset(liftoscriptNode);
              throw new PlannerSyntaxError(
                e.message,
                line + e.line,
                e.offset,
                liftoscriptNode.from + e.from,
                liftoscriptNode.from + e.to,
                e.details
              );
            } else {
              throw e;
            }
          }
        }
        const reuseLiftoscriptNode = valueNode.getChild("ReuseLiftoscript" /* ReuseLiftoscript */)?.getChild("ReuseSection" /* ReuseSection */)?.getChild("ExerciseName" /* ExerciseName */);
        const body = reuseLiftoscriptNode ? this.getValue(reuseLiftoscriptNode) : void 0;
        return PlannerProgramExercise_buildProgress(type, fnArgs, {
          script,
          reuseFullname: body
        });
      } else {
        return PlannerProgramExercise_buildProgress(type, fnArgs);
      }
    } else {
      assert2("ExerciseProperty" /* ExerciseProperty */);
    }
  }
  evaluateWarmup(expr) {
    if (expr.type.name === "ExerciseProperty" /* ExerciseProperty */) {
      const none = expr.getChild("None" /* None */);
      if (none != null) {
        return [];
      }
      const setsNode = expr.getChild("WarmupExerciseSets" /* WarmupExerciseSets */);
      if (setsNode != null) {
        const sets = setsNode.getChildren("WarmupExerciseSet" /* WarmupExerciseSet */);
        if (sets.length > 0) {
          return sets.map((set) => this.evaluateWarmupSet(set));
        }
      }
      return [];
    } else {
      assert2("ExerciseProperty" /* ExerciseProperty */);
    }
  }
  evaluateSuperset(expr) {
    if (expr.type.name === "Superset" /* Superset */) {
      const exerciseNameNode = expr.getChild("ExerciseName" /* ExerciseName */);
      if (exerciseNameNode != null) {
        const name = this.getValue(exerciseNameNode);
        return {
          type: "superset",
          data: { name }
        };
      } else {
        assert2("ExerciseName" /* ExerciseName */);
      }
    } else {
      assert2("Superset" /* Superset */);
    }
  }
  evaluateProperty(expr, exerciseType) {
    if (expr.type.name === "ExerciseProperty" /* ExerciseProperty */) {
      const nameNode = expr.getChild("ExercisePropertyName" /* ExercisePropertyName */);
      if (nameNode == null) {
        assert2("ExercisePropertyName" /* ExercisePropertyName */);
      }
      const name = this.getValue(nameNode);
      if (name === "progress") {
        return { type: "progress", data: this.evaluateProgress(expr, exerciseType) };
      } else if (name === "update") {
        return { type: "update", data: this.evaluateUpdate(expr, exerciseType) };
      } else if (name === "warmup") {
        return { type: "warmup", data: this.evaluateWarmup(expr) };
      } else if (name === "id") {
        return { type: "id", data: this.evaluateId(expr) };
      } else if (name === "used") {
        return { type: "used", data: "" };
      } else {
        this.error(`There's no such property exists - '${name}'`, nameNode, {
          type: "unknownProperty",
          data: { name }
        });
      }
    } else {
      assert2("ExerciseProperty" /* ExerciseProperty */);
    }
  }
  getReuseWeekDay(weekDayNode) {
    let week;
    let day;
    if (weekDayNode != null) {
      const result = weekDayNode.getChildren("WeekOrDay" /* WeekOrDay */).map((n2) => {
        const child = getChildren3(n2)[0];
        if (child.type.name === "Int" /* Int */) {
          return parseInt(this.getValue(child), 10);
        } else {
          return void 0;
        }
      });
      if (result.length === 1) {
        day = result[0];
      } else {
        week = result[0];
        day = result[1];
      }
    }
    return { week, day };
  }
  evaluateReuseNode(expr) {
    if (expr.type.name === "ReuseSectionWithWeekDay" /* ReuseSectionWithWeekDay */) {
      const nameNode = expr.getChild("ReuseSection" /* ReuseSection */)?.getChild("ExerciseName" /* ExerciseName */);
      if (nameNode == null) {
        assert2("ExerciseName" /* ExerciseName */);
      }
      const name = this.getValue(nameNode);
      const { week, day } = this.getReuseWeekDay(expr.getChild("WeekDay" /* WeekDay */));
      return { type: "reuse", data: { fullName: name, week, day, source: "overall" } };
    } else {
      assert2("ReuseSectionWithWeekDay" /* ReuseSectionWithWeekDay */);
    }
  }
  evaluateSection(expr, exerciseType) {
    if (expr.type.name === "ExerciseSection" /* ExerciseSection */) {
      const reuseNode = expr.getChild("ReuseSectionWithWeekDay" /* ReuseSectionWithWeekDay */);
      if (reuseNode != null) {
        return this.evaluateReuseNode(reuseNode);
      }
      const setsNode = expr.getChild("ExerciseSets" /* ExerciseSets */);
      if (setsNode != null) {
        const sets = setsNode.getChildren("ExerciseSet" /* ExerciseSet */);
        const isCurrent = setsNode.getChild("CurrentVariation" /* CurrentVariation */) != null;
        if (sets.length > 0) {
          return { type: "sets", data: sets.map((set) => this.evaluateSet(set)), isCurrent };
        }
      }
      const superset = expr.getChild("Superset" /* Superset */);
      if (superset != null) {
        return this.evaluateSuperset(superset);
      }
      const property = expr.getChild("ExerciseProperty" /* ExerciseProperty */);
      if (property != null) {
        return this.evaluateProperty(property, exerciseType);
      } else {
        assert2("ExerciseProperty" /* ExerciseProperty */);
      }
    } else {
      assert2("ExerciseSection" /* ExerciseSection */);
    }
  }
  static {
    this.extractNameParts = (0, import_micro_memoize2.default)(
      (str, exercises) => {
        let [label, ...nameEquipmentItems] = str.split(":");
        if (nameEquipmentItems.length === 0) {
          nameEquipmentItems = [label];
          label = "";
        } else {
          label = label.trim();
        }
        const nameEquipment = nameEquipmentItems.join(":").trim();
        const matchingExercise = Exercise_findByNameAndEquipment(nameEquipment, exercises);
        if (matchingExercise) {
          return { name: matchingExercise.name, label: label ? label : void 0, equipment: matchingExercise.equipment };
        }
        return { name: nameEquipment, label: label ? label : void 0 };
      },
      { maxSize: 1e3 }
    );
  }
  addDescription(value) {
    value = value.replace(/^\/\//, "");
    if (this.latestDescriptions.length === 0) {
      this.latestDescriptions.push([]);
    }
    this.latestDescriptions[this.latestDescriptions.length - 1].push(value);
  }
  getOrder(expr) {
    if (expr.type.name === "ExerciseExpression" /* ExerciseExpression */) {
      const repeatNode = expr.getChild("Repeat" /* Repeat */);
      if (repeatNode == null) {
        return 0;
      }
      const children = getChildren3(repeatNode);
      for (const childNode of children) {
        if (childNode.type.name === "Rep" /* Rep */) {
          return parseInt(this.getValue(childNode), 10);
        }
      }
      return 0;
    } else {
      assert2("ExerciseExpression" /* ExerciseExpression */);
    }
  }
  getRepeat(expr) {
    if (expr.type.name === "ExerciseExpression" /* ExerciseExpression */) {
      const repeatNode = expr.getChild("Repeat" /* Repeat */);
      if (repeatNode == null) {
        return [];
      }
      const result = /* @__PURE__ */ new Set();
      const children = getChildren3(repeatNode);
      for (const childNode of children) {
        if (childNode.type.name === "RepRange" /* RepRange */) {
          const [from, to] = getChildren3(childNode).map((n2) => parseInt(this.getValue(n2), 10));
          for (let i = from; i <= to; i += 1) {
            result.add(i);
          }
          break;
        }
      }
      return Array.from(result).sort((a, b) => a - b);
    } else {
      assert2("ExerciseExpression" /* ExerciseExpression */);
    }
  }
  getRepeatRanges(numbers) {
    if (numbers.length === 0) {
      return [];
    }
    const ranges = [];
    let rangeStart = numbers[0];
    let rangeEnd = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] === rangeEnd + 1) {
        rangeEnd = numbers[i];
      } else {
        ranges.push(`${rangeStart}-${rangeEnd}`);
        rangeStart = numbers[i];
        rangeEnd = numbers[i];
      }
    }
    ranges.push(`${rangeStart}-${rangeEnd}`);
    return ranges;
  }
  getIsNotUsed(expr) {
    if (expr.type.name === "ExerciseExpression" /* ExerciseExpression */) {
      const sections = expr.getChildren("ExerciseSection" /* ExerciseSection */);
      for (const section of sections) {
        const properties = section.getChildren("ExerciseProperty" /* ExerciseProperty */);
        for (const property of properties) {
          const nameNode = property.getChild("ExercisePropertyName" /* ExercisePropertyName */);
          const name = nameNode ? this.getValueTrim(nameNode) : void 0;
          const valueNode = property.getChild("None" /* None */);
          if (name === "used" && valueNode != null) {
            return true;
          }
        }
      }
      return false;
    } else {
      assert2("ExerciseSection" /* ExerciseSection */);
    }
  }
  evaluateExercise(expr) {
    if (expr.type.name === "EmptyExpression" /* EmptyExpression */ || expr.type.name === "TripleLineComment" /* TripleLineComment */) {
      if (this.latestDescriptions.length > 0) {
        this.latestDescriptions.push([]);
      }
      return;
    } else if (expr.type.name === "Week" /* Week */) {
      if (this.mode === "perday") {
        this.error(
          `You cannot specify weeks in the per-day exercise lists. Switch to the full program mode for that.`,
          expr,
          { type: "weeksNotAllowedInDayMode" }
        );
      }
      const weekName = this.getValueTrim(expr).replace(/^#+/, "").trim();
      const [line] = this.getLineAndOffset(expr);
      this.weeks.push({ name: weekName, line, days: [] });
      this.dayData = { day: this.dayData.day, week: this.weeks.length + 1, dayInWeek: 0 };
    } else if (expr.type.name === "Day" /* Day */) {
      if (this.mode === "perday") {
        this.error(
          `You cannot specify days in the per-day exercise lists. Switch to the full program mode for that.`,
          expr,
          { type: "daysNotAllowedInDayMode" }
        );
      }
      if (this.weeks.length === 0) {
        this.error(`You need to specify a week before a day`, expr, { type: "dayWithoutWeek" });
      }
      const dayName = this.getValueTrim(expr).replace(/^#+/, "").trim();
      const [line] = this.getLineAndOffset(expr);
      this.weeks[this.weeks.length - 1].days.push({ name: dayName, line, exercises: [] });
      this.dayData = {
        day: this.dayData.day + 1,
        week: this.dayData.week,
        dayInWeek: (this.dayData.dayInWeek || 0) + 1
      };
      this.exerciseIndex = 0;
    } else if (expr.type.name === "LineComment" /* LineComment */) {
      const value = this.getValueTrim(expr).trim();
      this.addDescription(value);
      return void 0;
    } else if (expr.type.name === "ExerciseExpression" /* ExerciseExpression */) {
      if (this.mode === "full" && (this.weeks.length === 0 || this.weeks[this.weeks.length - 1].days.length === 0)) {
        this.error(`You should first define a week and a day before listing exercises.`, expr, {
          type: "exerciseWithoutDay"
        });
      } else if (this.weeks.length === 0) {
        this.weeks.push({ name: "Week 1", line: 1, days: [{ name: "Day 1", line: 1, exercises: [] }] });
      }
      const variationsNode = expr.getChild("ExerciseVariations" /* ExerciseVariations */);
      if (variationsNode == null) {
        assert2("ExerciseVariations" /* ExerciseVariations */);
      }
      const nameNode = variationsNode;
      const fullName = this.getValue(variationsNode);
      const variationNodes = variationsNode.getChildren("ExerciseVariation" /* ExerciseVariation */);
      const exerciseVariations = [];
      let label;
      for (let i = 0; i < variationNodes.length; i += 1) {
        const variationNode = variationNodes[i];
        const isCurrent = variationNode.getChild("CurrentVariation" /* CurrentVariation */) != null;
        const variationNameNode = variationNode.getChild("ExerciseName" /* ExerciseName */);
        if (variationNameNode == null) {
          assert2("ExerciseName" /* ExerciseName */);
        }
        const variationFullName = this.getValue(variationNameNode);
        const parts = _PlannerExerciseEvaluator.extractNameParts(variationFullName, this.settings.exercises);
        if (i === 0) {
          label = parts.label;
        }
        const variationShortName = PlannerProgramExercise_shortNameFromFullName(variationFullName, this.settings);
        const variationExerciseType = Exercise_findByNameAndEquipment(variationShortName, this.settings.exercises);
        exerciseVariations.push({
          exerciseType: variationExerciseType,
          name: parts.name,
          isCurrent
        });
      }
      const currentVariationIndex = exerciseVariations.findIndex((v) => v.isCurrent);
      const activeVariationIndex = currentVariationIndex === -1 ? 0 : currentVariationIndex;
      const activeVariation = exerciseVariations[activeVariationIndex];
      const name = activeVariation?.name ?? "";
      const exercise = activeVariation?.exerciseType;
      const equipment = exercise?.equipment;
      const key = PlannerKey_fromExerciseVariations(exerciseVariations, label);
      const shortName = Exercise_buildName(name, this.settings, void 0, equipment);
      let notused = this.getIsNotUsed(expr);
      const sectionNodes = expr.getChildren("ExerciseSection" /* ExerciseSection */);
      const setVariations = [];
      const allSets = [];
      let allWarmupSets;
      let reuse;
      const repeat = this.getRepeat(expr);
      const order = this.getOrder(expr);
      const text = this.getValueTrim(expr).trim();
      let tags = [];
      let progress;
      let update;
      let superset;
      for (const sectionNode of sectionNodes) {
        const section = this.evaluateSection(sectionNode, exercise ? { id: exercise.id, equipment } : void 0);
        if (section.type === "sets") {
          allSets.push(...section.data);
          if (section.data.some((set) => set.repRange != null)) {
            setVariations.push({ sets: section.data, isCurrent: section.isCurrent });
          }
        } else if (section.type === "warmup") {
          allWarmupSets = allWarmupSets || [];
          allWarmupSets.push(...section.data);
        } else if (section.type === "progress") {
          progress = section.data;
        } else if (section.type === "update") {
          update = section.data;
        } else if (section.type === "reuse") {
          reuse = section.data;
        } else if (section.type === "id") {
          tags = tags.concat(section.data);
        } else if (section.type === "superset") {
          superset = section.data;
        } else if (section.type === "used") {
          notused = true;
        } else {
          throw new Error(`Unexpected section type`);
        }
      }
      const rpe = allSets.find((set) => set.repRange == null && set.rpe != null)?.rpe;
      const timer = allSets.find((set) => set.repRange == null && set.timer != null)?.timer;
      const setTimer = allSets.find((set) => set.repRange == null && set.setTimer != null)?.setTimer;
      const isOverflowSetTimer = allSets.find(
        (set) => set.repRange == null && set.isOverflowSetTimer != null
      )?.isOverflowSetTimer;
      const auto = allSets.find((set) => set.repRange == null && set.auto != null)?.auto;
      const percentage = allSets.find((set) => set.repRange == null && set.percentage != null)?.percentage;
      const weight = allSets.find((set) => set.repRange == null && set.weight != null)?.weight;
      const logRpe = allSets.find((set) => set.repRange == null && set.logRpe != null)?.logRpe;
      const askWeight = allSets.find((set) => set.repRange == null && set.askWeight != null)?.askWeight;
      const [line] = this.getLineAndOffset(expr);
      const rawDescriptions = this.latestDescriptions.map((d) => d.join("\n"));
      const currentDescriptionIndex = rawDescriptions.findIndex((d) => /^\s*!/.test(d));
      let descriptions = rawDescriptions.map((d, i) => ({
        value: d.replace(/^\s*!/, ""),
        isCurrent: i === currentDescriptionIndex
      }));
      if (descriptions.length > 1) {
        descriptions = descriptions.filter((d) => d.value);
      }
      descriptions = descriptions.map((d) => ({ ...d, value: StringUtils_unindent(d.value) }));
      this.latestDescriptions = [];
      const fullNamePoint = this.getPoint(nameNode);
      const reuseSetsNode = expr.getChildren("ExerciseSection" /* ExerciseSection */).map((n2) => n2.getChild("ReuseSectionWithWeekDay" /* ReuseSectionWithWeekDay */)).filter((n2) => n2)[0];
      const reuseSetPoint = reuseSetsNode ? this.getPoint(reuseSetsNode) : void 0;
      const progressNode = expr.getChildren("ExerciseSection" /* ExerciseSection */).map((n2) => {
        const node = n2.getChild("ExerciseProperty" /* ExerciseProperty */)?.getChild("ExercisePropertyName" /* ExercisePropertyName */);
        return node != null && this.getValueTrim(node) === "progress" ? node : void 0;
      }).flat(2).filter((n2) => n2)[0];
      const progressPoint = progressNode ? this.getPoint(progressNode) : void 0;
      const updateNode = expr.getChildren("ExerciseSection" /* ExerciseSection */).map((n2) => {
        const node = n2.getChild("ExerciseProperty" /* ExerciseProperty */)?.getChild("ExercisePropertyName" /* ExercisePropertyName */);
        return node != null && this.getValueTrim(node) === "update" ? node : void 0;
      }).flat(2).filter((n2) => n2)[0];
      const updatePoint = updateNode ? this.getPoint(updateNode) : void 0;
      const idNode = expr.getChildren("ExerciseSection" /* ExerciseSection */).map((n2) => {
        const node = n2.getChild("ExerciseProperty" /* ExerciseProperty */)?.getChild("ExercisePropertyName" /* ExercisePropertyName */);
        return node != null && this.getValueTrim(node) === "id" ? node : void 0;
      }).flat(2).filter((n2) => n2)[0];
      const idPoint = idNode ? this.getPoint(idNode) : void 0;
      const warmupNode = expr.getChildren("ExerciseSection" /* ExerciseSection */).map((n2) => {
        const node = n2.getChild("ExerciseProperty" /* ExerciseProperty */)?.getChild("ExercisePropertyName" /* ExercisePropertyName */);
        return node != null && this.getValueTrim(node) === "warmup" ? node : void 0;
      }).flat(2).filter((n2) => n2)[0];
      const warmupPoint = warmupNode ? this.getPoint(warmupNode) : void 0;
      const supersetNode = expr.getChildren("ExerciseSection" /* ExerciseSection */).map((n2) => n2.getChild("Superset" /* Superset */)).filter((n2) => n2)[0];
      const supersetPoint = supersetNode ? this.getPoint(supersetNode) : void 0;
      const plannerExercise = {
        id: UidFactory_generateUid(8),
        key,
        fullName,
        shortName,
        exerciseType: exercise,
        label,
        dayData: this.dayData,
        text,
        repeat,
        repeating: [...repeat],
        order,
        superset,
        name,
        equipment,
        exerciseIndex: this.exerciseIndex,
        line,
        tags,
        notused,
        evaluatedSetVariations: [],
        setVariations,
        exerciseVariations,
        descriptions: {
          values: descriptions
        },
        warmupSets: allWarmupSets,
        reuse,
        progress,
        update,
        globals: {
          rpe,
          logRpe,
          askWeight,
          timer,
          setTimer,
          isOverflowSetTimer,
          auto,
          percentage,
          weight
        },
        points: {
          fullName: fullNamePoint,
          supersetPoint,
          reuseSetPoint,
          progressPoint,
          idPoint,
          updatePoint,
          warmupPoint
        }
      };
      this.weeks[this.weeks.length - 1].days[this.weeks[this.weeks.length - 1].days.length - 1].exercises.push(
        plannerExercise
      );
      if (!notused) {
        this.exerciseIndex += 1;
      }
    } else {
      this.error(`Unexpected node type ${expr.node.type.name}`, expr, {
        type: "unexpectedNode",
        data: { node: expr.node.type.name }
      });
    }
  }
  evaluateProgram(expr) {
    if (expr.type.name === "Program" /* Program */) {
      this.weeks = [];
      this.exerciseIndex = 0;
      for (const child of CollectionUtils_compact(getChildren3(expr))) {
        this.evaluateExercise(child);
      }
      return this.weeks;
    } else {
      this.error(`Unexpected node type ${expr.node.type.name}`, expr, {
        type: "unexpectedNode",
        data: { node: expr.node.type.name }
      });
    }
  }
  evaluate(programNode) {
    try {
      this.parse(programNode);
      const program = this.evaluateProgram(programNode);
      return { data: program, success: true };
    } catch (e) {
      if (e instanceof PlannerSyntaxError) {
        return { error: e, success: false };
      } else {
        throw e;
      }
    }
  }
  hasWeightInUnit(programNode, unit) {
    const cursor = programNode.cursor();
    do {
      const weight = this.getWeight(cursor.node);
      if (weight != null) {
        if (weight.unit === unit) {
          return true;
        }
      }
    } while (cursor.next());
    return false;
  }
  switchWeightsToUnit(programNode, settings) {
    const cursor = programNode.cursor();
    let script = this.script;
    let shift = 0;
    do {
      if (cursor.node.type.name === "Weight" /* Weight */) {
        const weight = this.getWeight(cursor.node);
        if (weight != null) {
          if (weight.unit !== settings.units) {
            const from = cursor.node.from;
            const to = cursor.node.to;
            const oldWeightStr = Weight_print(weight);
            const newWeightStr = Weight_print(Weight_smartConvert(weight, settings.units));
            script = script.substring(0, from + shift) + newWeightStr + script.substring(to + shift);
            shift = shift + newWeightStr.length - oldWeightStr.length;
          }
        }
      } else if (cursor.node.type.name === "Liftoscript" /* Liftoscript */) {
        const oldLiftoscript = this.getValueTrim(cursor.node);
        const liftoscriptEvaluator = new ScriptRunner(
          oldLiftoscript,
          {},
          {},
          Progress_createEmptyScriptBindings({ day: 1, week: 1, dayInWeek: 1 }, settings),
          Progress_createScriptFunctions(settings),
          settings.units,
          { unit: settings.units, prints: [] },
          "planner"
        );
        const newLiftoscript = liftoscriptEvaluator.switchWeightsToUnit(settings.units);
        script = script.substring(0, cursor.node.from + shift) + newLiftoscript + script.substring(cursor.node.to + shift);
        shift = shift + newLiftoscript.length - oldLiftoscript.length;
      }
    } while (cursor.next());
    return script;
  }
  changeExerciseName(node, from, to) {
    const cursor = node.cursor();
    let script = this.script;
    let shift = 0;
    do {
      if (cursor.node.type.name === "ExerciseName" /* ExerciseName */) {
        const name = this.getValue(cursor.node);
        if (name === from) {
          const fromNode = cursor.node.from;
          const toNode = cursor.node.to;
          script = script.substring(0, fromNode + shift) + to + script.substring(toNode + shift);
          shift = shift + to.length - name.length;
        }
      }
    } while (cursor.next());
    return script;
  }
  static changeWeightsToCompletedWeights(oldScript) {
    const node = parser2.parse(oldScript);
    const cursor = node.cursor();
    let script = oldScript;
    let shift = 0;
    do {
      if (cursor.node.type.name === "Liftoscript" /* Liftoscript */) {
        const value = LiftoscriptEvaluator.getValueRaw(oldScript, cursor.node);
        const from = cursor.node.from;
        const to = cursor.node.to;
        const newValue = LiftoscriptEvaluator.changeWeightsToCompleteWeights(value);
        script = script.substring(0, from + shift) + newValue + script.substring(to + shift);
        shift = shift + newValue.length - value.length;
      }
    } while (cursor.next());
    return script;
  }
  topLineMap(programNode) {
    if (programNode.type.name !== "Program" /* Program */) {
      this.error(`Unexpected node type ${programNode.type.name} - should be Program`, programNode, {
        type: "unexpectedNode",
        data: { node: programNode.type.name }
      });
    }
    const children = getChildren3(programNode);
    const result = [];
    let lastDescriptions = [];
    let ongoingDescriptions = false;
    let exerciseIndex = 0;
    for (const child of children) {
      if (child.type.name === "ExerciseExpression" /* ExerciseExpression */) {
        ongoingDescriptions = false;
        const nameNode = child.getChild("ExerciseVariations" /* ExerciseVariations */);
        const fullName = this.getValue(nameNode);
        const key = PlannerKey_fromFullName(fullName, this.settings.exercises);
        const repeat = this.getRepeat(child);
        const repeatRanges = this.getRepeatRanges(repeat);
        const order = this.getOrder(child);
        const isUsed = !this.getIsNotUsed(child);
        const sectionsNode = child.getChildren("ExerciseSection" /* ExerciseSection */);
        const sections = sectionsNode.map((section) => this.getValueTrim(section).trim()).join(" / ");
        const sectionsToReuse = sectionsNode.filter((section) => {
          const properties = section.getChild("ExerciseProperty" /* ExerciseProperty */);
          if (properties == null) {
            return true;
          }
          const propertyNameNode = properties.getChild("ExercisePropertyName" /* ExercisePropertyName */);
          const propertyName = propertyNameNode ? this.getValue(propertyNameNode) : void 0;
          if (propertyName === "progress") {
            const none = properties.getChild("None" /* None */);
            return none != null;
          }
          return false;
        }).map((section) => this.getValueTrim(section).trim()).join(" / ");
        result.push({
          type: "exercise",
          fullName,
          order,
          notused: !isUsed,
          value: key,
          exerciseIndex,
          repeat,
          repeatRanges,
          descriptions: lastDescriptions.map((d) => d.join("\n")),
          sections,
          sectionsToReuse
        });
        if (isUsed) {
          exerciseIndex += 1;
        }
        lastDescriptions = [];
      } else if (child.type.name === "LineComment" /* LineComment */) {
        ongoingDescriptions = true;
        const description = this.getValueTrim(child).trim();
        if (lastDescriptions.length === 0) {
          lastDescriptions.push([]);
        }
        lastDescriptions[lastDescriptions.length - 1].push(description);
        result.push({ type: "description", value: description });
      } else if (child.type.name === "TripleLineComment" /* TripleLineComment */) {
        result.push({ type: "comment", value: this.getValueTrim(child).trim() });
      } else if (child.type.name === "EmptyExpression" /* EmptyExpression */) {
        result.push({ type: "empty", value: "" });
        if (ongoingDescriptions) {
          lastDescriptions.push([]);
        }
      } else {
        this.error(
          `Unexpected node type ${child.type.name}, should be only exercise, comment, description or empty line`,
          child,
          { type: "unexpectedNode", data: { node: child.type.name } }
        );
      }
    }
    return result;
  }
};

// third-party/liftosaur/upstream/src/pages/planner/models/plannerProgramExercise.ts
function PlannerProgramExercise_getExercise(plannerExercise, settings) {
  const exercise = Exercise_findByName(plannerExercise.name, settings.exercises);
  if (exercise == null) {
    return void 0;
  }
  exercise.equipment = plannerExercise.equipment || exercise?.equipment || exercise?.defaultEquipment;
  return exercise;
}
function PlannerProgramExercise_setVariations(exercise) {
  const originalSetVariations = exercise.setVariations;
  const reuseSetVariations = exercise.reuse?.exercise?.setVariations;
  const setVariations = (originalSetVariations?.length > 0 ? originalSetVariations : reuseSetVariations) || [];
  return setVariations.length === 0 ? [{ sets: PlannerProgramExercise_sets(exercise), isCurrent: true }] : setVariations;
}
function PlannerProgramExercise_warmups(exercise) {
  return exercise.warmupSets || exercise.reuse?.exercise?.warmupSets;
}
function PlannerProgramExercise_programWarmups(exercise, settings) {
  const exerciseWarmups = PlannerProgramExercise_warmups(exercise);
  if (exerciseWarmups == null) {
    return void 0;
  }
  const sets = [];
  for (const ws of exerciseWarmups) {
    for (let i = 0; i < ws.numberOfSets; i += 1) {
      let value = ws.percentage ? ws.percentage / 100 : void 0;
      if (value == null) {
        value = ws.weight;
      }
      if (value == null) {
        value = MathUtils_roundTo0005(Weight_rpeMultiplier(ws.reps, 4));
      }
      sets.push({
        reps: ws.reps,
        value,
        threshold: Weight_build(0, settings.units)
      });
    }
  }
  return sets;
}
function PlannerProgramExercise_evaluateSetVariations(exercise, setVariations) {
  const evaluatedSetVariations = [];
  for (let i = 0; i < setVariations.length; i++) {
    const sets = PlannerProgramExercise_sets(exercise, i);
    const evaluatedSets = [];
    for (const aSet of sets) {
      if (aSet.repRange == null) {
        continue;
      }
      for (let j = 0; j < aSet.repRange.numberOfSets; j++) {
        evaluatedSets.push({
          maxrep: aSet.repRange.maxrep,
          minrep: aSet.repRange.minrep,
          weight: aSet.weight ? aSet.weight : aSet.percentage ? Weight_buildPct(aSet.percentage) : void 0,
          timer: aSet.timer,
          setTimer: aSet.setTimer,
          isOverflowSetTimer: aSet.isOverflowSetTimer,
          auto: aSet.auto,
          rpe: aSet.rpe,
          logRpe: !!aSet.logRpe,
          label: aSet.label,
          isAmrap: !!aSet.repRange.isAmrap,
          isQuickAddSet: !!aSet.repRange.isQuickAddSet,
          askWeight: !!aSet.askWeight
        });
      }
    }
    evaluatedSetVariations.push({ sets: evaluatedSets, isCurrent: setVariations[i].isCurrent });
  }
  return evaluatedSetVariations;
}
function PlannerProgramExercise_sets(exercise, variationIndex) {
  const reusedSets = exercise.reuse?.exercise ? exercise.reuse?.exercise?.setVariations[variationIndex ?? PlannerProgramExercise_currentSetVariationIndex(exercise.reuse?.exercise)]?.sets : void 0;
  const reusedGlobals = exercise.reuse?.exercise?.globals || {};
  variationIndex = variationIndex ?? PlannerProgramExercise_currentSetVariationIndex(exercise);
  const currentSets = exercise.setVariations[variationIndex]?.sets;
  const currentGlobals = exercise.globals;
  const sets = currentSets || reusedSets || [];
  return sets.map((aSet) => {
    const set = ObjectUtils_clone(aSet);
    set.rpe = currentGlobals.rpe != null ? currentGlobals.rpe : set.rpe ?? reusedGlobals.rpe;
    set.timer = currentGlobals.timer != null ? currentGlobals.timer : set.timer ?? reusedGlobals.timer;
    set.setTimer = currentGlobals.setTimer != null ? currentGlobals.setTimer : set.setTimer ?? reusedGlobals.setTimer;
    set.isOverflowSetTimer = currentGlobals.setTimer != null ? !!currentGlobals.isOverflowSetTimer : set.isOverflowSetTimer ?? reusedGlobals.isOverflowSetTimer;
    set.auto = currentGlobals.auto != null ? currentGlobals.auto : set.auto ?? reusedGlobals.auto;
    if (currentGlobals.weight != null || currentGlobals.percentage != null) {
      if (currentGlobals.weight != null) {
        set.weight = currentGlobals.weight;
        set.percentage = void 0;
      } else {
        set.percentage = currentGlobals.percentage;
        set.weight = void 0;
      }
    } else {
      set.weight = set.weight ?? reusedGlobals.weight;
      set.percentage = set.percentage ?? reusedGlobals.percentage;
    }
    set.logRpe = !!(currentGlobals.rpe != null && currentGlobals.logRpe != null ? currentGlobals.logRpe : set.logRpe ?? reusedGlobals.logRpe);
    set.askWeight = !!((currentGlobals.weight != null || currentGlobals.percentage != null) && currentGlobals.askWeight != null ? currentGlobals.askWeight : set.askWeight ?? reusedGlobals.askWeight);
    return set;
  });
}
function PlannerProgramExercise_currentSetVariationIndex(exercise) {
  const index = exercise.setVariations.findIndex((sv) => sv.isCurrent);
  return index === -1 ? 0 : index;
}
function PlannerProgramExercise_currentEvaluatedSetVariationIndex(exercise) {
  const index = exercise.evaluatedSetVariations.findIndex((sv) => sv.isCurrent);
  return index === -1 ? 0 : index;
}
function PlannerProgramExercise_currentEvaluatedSetVariation(exercise) {
  const index = PlannerProgramExercise_currentEvaluatedSetVariationIndex(exercise);
  return exercise.evaluatedSetVariations[index];
}
function PlannerProgramExercise_currentExerciseVariationIndex(exercise) {
  const index = (exercise.exerciseVariations ?? []).findIndex((v) => v.isCurrent);
  return index === -1 ? 0 : index;
}
function PlannerProgramExercise_currentDescriptionIndex(exercise) {
  const index = exercise.descriptions.values.findIndex((d) => d.isCurrent);
  return index === -1 ? 0 : index;
}
function PlannerProgramExercise_getProgressScript(exercise) {
  return exercise.progress?.script ?? exercise.progress?.reuse?.exercise?.progress?.script ?? exercise.progress?.reuse?.exercise?.progress?.reuse?.exercise?.progress?.script ?? exercise.reuse?.exercise?.progress?.script ?? exercise.reuse?.exercise?.progress?.reuse?.exercise?.progress?.script;
}
function PlannerProgramExercise_getState(exercise, visited) {
  if (exercise.progress?.state && !exercise.progress.reuse) {
    return exercise.progress.state;
  } else {
    const seen = visited ?? /* @__PURE__ */ new Set();
    if (seen.has(exercise)) {
      return {};
    }
    seen.add(exercise);
    const originalState = exercise.progress?.reuse?.exercise ? PlannerProgramExercise_getState(exercise.progress.reuse.exercise, seen) : exercise.reuse?.exercise ? PlannerProgramExercise_getState(exercise.reuse.exercise, seen) : {};
    return { ...originalState, ...exercise.progress?.state };
  }
}
function PlannerProgramExercise_getOnlyChangedState(exercise) {
  const originalState = exercise.progress?.reuse?.exercise ? exercise.progress.reuse.exercise.progress?.state || {} : exercise.reuse?.exercise ? exercise.reuse.exercise.progress?.state || {} : {};
  const originalStateMetadata = exercise.progress?.reuse?.exercise ? exercise.progress.reuse.exercise.progress?.stateMetadata || {} : exercise.reuse?.exercise ? exercise.reuse.exercise.progress?.stateMetadata || {} : {};
  const state = exercise.progress?.state || {};
  const stateMetadata = exercise.progress?.stateMetadata || {};
  return ObjectUtils_filter(
    state,
    (key, value) => originalState[key] == null || !Weight_eq(originalState[key], value) || originalStateMetadata[key]?.userPrompted !== stateMetadata[key]?.userPrompted
  );
}
function PlannerProgramExercise_getStateMetadata(exercise, visited) {
  if (exercise.progress?.stateMetadata && !exercise.progress.reuse) {
    return exercise.progress.stateMetadata;
  } else {
    const seen = visited ?? /* @__PURE__ */ new Set();
    if (seen.has(exercise)) {
      return {};
    }
    seen.add(exercise);
    const originalState = exercise.progress?.reuse?.exercise ? PlannerProgramExercise_getStateMetadata(exercise.progress.reuse.exercise, seen) : exercise.reuse?.exercise ? PlannerProgramExercise_getStateMetadata(exercise.reuse.exercise, seen) : {};
    return { ...originalState, ...exercise.progress?.stateMetadata };
  }
}
function PlannerProgramExercise_getUpdateScript(exercise) {
  return exercise.update?.script ?? exercise.update?.reuse?.exercise?.update?.script ?? exercise.update?.reuse?.exercise?.update?.reuse?.exercise?.update?.script ?? exercise.reuse?.exercise?.update?.script ?? exercise.reuse?.exercise?.update?.reuse?.exercise?.update?.script;
}
function buildDpScript() {
  return `for (var.i in completedReps) {
  if (weights[var.i] == 0 && completedWeights[var.i] != 0) {
    weights[var.i] = completedWeights[var.i]
  }
}
if (completedReps >= reps && completedRPE <= RPE) {
  if (completedReps >= state.maxReps) {
    reps = state.minReps
    for (var.i in completedReps) {
      var.isInitial = weights[var.i] == 0 && completedWeights[var.i] != 0
      if (var.isInitial) {
        weights[var.i] = completedWeights[var.i] + state.increment
      } else {
        weights[var.i] += (completedWeights[var.i] - weights[var.i]) + state.increment
      }
    }
  } else {
    for (var.i in completedReps) {
      reps[var.i] = completedReps[var.i] + 1 > state.maxReps ?
        state.maxReps :
        completedReps[var.i] + 1
    }
  }
}`;
}
function PlannerProgramExercise_buildDpRangeScript() {
  return `for (var.i in completedReps) {
  if (weights[var.i] == 0 && completedWeights[var.i] != 0) {
    weights[var.i] = completedWeights[var.i]
  }
}
if (completedReps >= reps && completedRPE <= RPE) {
  minReps = state.minReps
  for (var.i in completedReps) {
    var.isInitial = weights[var.i] == 0 && completedWeights[var.i] != 0
    if (var.isInitial) {
      weights[var.i] = completedWeights[var.i] + state.increment
    } else {
      weights[var.i] += (completedWeights[var.i] - weights[var.i]) + state.increment
    }
  }
} else {
  for (var.i in completedReps) {
    minReps[var.i] = completedReps[var.i] + 1 > reps[var.i] ?
      reps[var.i] :
      completedReps[var.i] + 1
  }
}`;
}
function PlannerProgramExercise_buildProgress(type, args, opts = {}) {
  switch (type) {
    case "none": {
      return {
        success: true,
        data: {
          type: "none",
          state: {},
          stateMetadata: {}
        }
      };
    }
    case "lp": {
      const increment = args[0] ? Weight_parsePct(args[0]) : Weight_build(0, "lb");
      const decrement = args[3] ? Weight_parsePct(args[3]) : Weight_build(0, "lb");
      const state = {
        increment: increment ?? Weight_build(0, "lb"),
        successes: args[1] ? parseInt(args[1], 10) : 1,
        successCounter: args[2] ? parseInt(args[2], 10) : 0,
        decrement: decrement ?? Weight_build(0, "lb"),
        failures: args[4] ? parseInt(args[4], 10) : (decrement?.value ?? 0) > 0 ? 1 : 0,
        failureCounter: args[5] ? parseInt(args[5], 10) : 0
      };
      const script = `for (var.i in completedReps) {
  if (weights[var.i] == 0 && completedWeights[var.i] != 0) {
    weights[var.i] = completedWeights[var.i]
  }
}
if (completedReps >= reps && completedRPE <= RPE) {
  state.successCounter += 1
  if (state.successCounter >= state.successes) {
    for (var.i in completedReps) {
      var.isInitial = weights[var.i] == 0 && completedWeights[var.i] != 0
      if (var.isInitial) {
        weights[var.i] = completedWeights[var.i] + state.increment
      } else {
        weights[var.i] += (completedWeights[var.i] - weights[var.i]) + state.increment
      }
    }
    state.successCounter = 0
    state.failureCounter = 0
  }
}
if (state.decrement > 0 && state.failures > 0) {
  if (!(completedReps >= minReps && completedRPE <= RPE)) {
    state.failureCounter += 1
    if (state.failureCounter >= state.failures) {
      weights -= state.decrement
      state.failureCounter = 0
      state.successCounter = 0
    }
  }
}`;
      return {
        success: true,
        data: {
          type: "lp",
          state,
          stateMetadata: {},
          script
        }
      };
    }
    case "dp": {
      const increment = args[0] ? Weight_parsePct(args[0]) : Weight_build(0, "lb");
      const state = {
        increment: increment ?? Weight_build(0, "lb"),
        minReps: args[1] ? parseInt(args[1], 10) : 0,
        maxReps: args[2] ? parseInt(args[2], 10) : 0
      };
      const script = buildDpScript();
      return {
        success: true,
        data: {
          type: "dp",
          state,
          stateMetadata: {},
          script
        }
      };
    }
    case "sum": {
      const increment = args[1] ? Weight_parsePct(args[1]) : Weight_build(0, "lb");
      const state = {
        reps: args[0] ? parseInt(args[0], 10) : 0,
        increment: increment ?? Weight_build(0, "lb")
      };
      const script = `for (var.i in completedReps) {
if (weights[var.i] == 0 && completedWeights[var.i] != 0) {
  weights[var.i] = completedWeights[var.i]
}
}
if (sum(completedReps) >= state.reps) {
for (var.i in completedReps) {
  weights[var.i] = completedWeights[var.i] + state.increment
}
}`;
      return {
        success: true,
        data: {
          type: "sum",
          state,
          stateMetadata: {},
          script
        }
      };
    }
    case "custom": {
      const script = opts.script;
      let error;
      const { state, stateMetadata } = PlannerExerciseEvaluator.fnArgsToStateVars(args, (message, value) => {
        error = { message, details: { type: "invalidStateVariable", data: { value } } };
      });
      if (error) {
        return {
          success: false,
          error
        };
      }
      return {
        success: true,
        data: {
          type: "custom",
          state,
          stateMetadata,
          script,
          reuse: opts.reuseFullname ? { fullName: opts.reuseFullname, source: "specific" } : void 0
        }
      };
    }
  }
}
function PlannerProgramExercise_shortNameFromFullName(fullName, settings) {
  const { name, equipment } = PlannerExerciseEvaluator.extractNameParts(fullName, settings.exercises);
  const shortName = `${name}${equipment ? `, ${equipmentName(equipment)}` : ""}`;
  return shortName;
}

// third-party/liftosaur/upstream/src/models/pp.ts
function PP_iterate2(evaluatedWeeks, cb) {
  let dayIndex = 0;
  for (let weekIndex = 0; weekIndex < evaluatedWeeks.length; weekIndex++) {
    const week = evaluatedWeeks[weekIndex];
    for (let dayInWeekIndex = 0; dayInWeekIndex < week.days.length; dayInWeekIndex++) {
      const day = week.days[dayInWeekIndex];
      for (let exerciseIndex = 0; exerciseIndex < day.exercises.length; exerciseIndex++) {
        const exercise = day.exercises[exerciseIndex];
        const shouldReturn = cb(exercise, weekIndex, dayInWeekIndex, dayIndex, exerciseIndex);
        if (!!shouldReturn) {
          return;
        }
      }
      dayIndex += 1;
    }
  }
}
function PP_iterateTopLineExercises(groupedTopLines, cb) {
  let dayIndex = 0;
  for (let weekIndex = 0; weekIndex < groupedTopLines.length; weekIndex++) {
    const week = groupedTopLines[weekIndex];
    for (let dayInWeekIndex = 0; dayInWeekIndex < week.length; dayInWeekIndex++) {
      for (const group of week[dayInWeekIndex]) {
        for (const line of group) {
          if (line.type !== "exercise") {
            continue;
          }
          const shouldReturn = cb(line, weekIndex, dayInWeekIndex, dayIndex);
          if (!!shouldReturn) {
            return;
          }
        }
      }
      dayIndex += 1;
    }
  }
}
function PP_iterate(evaluatedWeeks, cb) {
  let dayIndex = 0;
  for (let weekIndex = 0; weekIndex < evaluatedWeeks.length; weekIndex++) {
    const week = evaluatedWeeks[weekIndex];
    for (let dayInWeekIndex = 0; dayInWeekIndex < week.length; dayInWeekIndex++) {
      const day = week[dayInWeekIndex];
      if (day.success) {
        for (let exerciseIndex = 0; exerciseIndex < day.data.length; exerciseIndex++) {
          const exercise = day.data[exerciseIndex];
          const shouldReturn = cb(exercise, weekIndex, dayInWeekIndex, dayIndex, exerciseIndex);
          if (!!shouldReturn) {
            return;
          }
        }
      }
      dayIndex += 1;
    }
  }
}

// third-party/liftosaur/upstream/src/models/programExercise.ts
function ProgramExercise_doesUse1RM(programExercise) {
  const usesPercentageWeights = programExercise.evaluatedSetVariations.some((v) => {
    return v.sets.some((set) => {
      return Weight_isPct(set.weight) || ProgramSet_isEligibleForInferredWeight(set);
    });
  });
  const usesRM1Var = ProgramExercise_isUsingVariable(programExercise, "rm1");
  return usesPercentageWeights || usesRM1Var;
}
function ProgramExercise_doesUseRPE(programExercise) {
  if (programExercise.globals.logRpe || programExercise.globals.rpe != null) {
    return true;
  }
  return programExercise.evaluatedSetVariations.some((v) => {
    return v.sets.some((set) => set.logRpe || set.rpe != null);
  });
}
function ProgramExercise_isUsingVariable(programExercise, name) {
  const expressions = CollectionUtils_compact([
    PlannerProgramExercise_getProgressScript(programExercise),
    PlannerProgramExercise_getUpdateScript(programExercise)
  ]);
  return expressions.some((e) => ScriptRunner.hasKeyword(e, name));
}
function ProgramExercise_weightChanges(program, programExerciseKey) {
  const results = {};
  PP_iterate2(program.weeks, (exercise) => {
    if (exercise.key === programExerciseKey) {
      const currentVariationIndex = PlannerProgramExercise_currentEvaluatedSetVariationIndex(exercise);
      for (let variationIndex = 0; variationIndex < exercise.evaluatedSetVariations.length; variationIndex += 1) {
        const variation = exercise.evaluatedSetVariations[variationIndex];
        for (let setIndex = 0; setIndex < variation.sets.length; setIndex += 1) {
          const set = variation.sets[setIndex];
          if (set.weight) {
            const key = Weight_print(set.weight);
            results[key] = {
              originalWeight: set.weight,
              weight: set.weight,
              current: results[key]?.current || variationIndex + 1 === currentVariationIndex
            };
          }
        }
      }
    }
  });
  return CollectionUtils_sortBy(ObjectUtils_values(results), "current", true);
}
function ProgramExercise_applyVariables(programExerciseKey, program, updates, settings) {
  for (const update of updates) {
    const key = update.type;
    const value = update.value;
    const target = value.target;
    const [week, day, variation, set] = target;
    let dayIndex = 0;
    for (let weekIndex = 0; weekIndex < program.weeks.length; weekIndex += 1) {
      const programWeek = program.weeks[weekIndex];
      for (let dayInWeekIndex = 0; dayInWeekIndex < programWeek.days.length; dayInWeekIndex += 1) {
        const programDay = programWeek.days[dayInWeekIndex];
        const dayExercises = Program_getProgramDayExercises(programDay);
        for (const exercise of dayExercises) {
          if (exercise.key !== programExerciseKey) {
            continue;
          }
          for (let variationIndex = 0; variationIndex < exercise.evaluatedSetVariations.length; variationIndex += 1) {
            const setVariation = exercise.evaluatedSetVariations[variationIndex];
            const sets = setVariation.sets;
            if ((week === "*" || week === weekIndex + 1) && (day === "*" || day === dayInWeekIndex + 1) && (variation === "*" || variation === variationIndex + 1)) {
              if (key === "numberOfSets" && typeof value.value === "number") {
                const newValue = MathUtils_applyOp(sets.length, value.value, value.op);
                const defaultSet = {
                  maxrep: 1,
                  weight: Weight_build(100, "lb"),
                  logRpe: false,
                  isAmrap: false,
                  isQuickAddSet: false,
                  askWeight: false
                };
                const lastSet = sets[sets.length - 1] || defaultSet;
                sets.splice(newValue);
                for (let i = sets.length; i < newValue; i += 1) {
                  sets.push(ObjectUtils_clone(lastSet));
                }
              }
            }
            for (let setIndex = 0; setIndex < sets.length; setIndex += 1) {
              if ((week === "*" || week === weekIndex + 1) && (day === "*" || day === dayInWeekIndex + 1) && (variation === "*" || variation === variationIndex + 1) && (set === "*" || set === setIndex + 1)) {
                if (key === "RPE") {
                  operation(exercise, sets[setIndex], settings, "rpe", value.value, value.op);
                } else if (key === "reps") {
                  operation(exercise, sets[setIndex], settings, "maxrep", value.value, value.op);
                } else if (key === "minReps") {
                  operation(exercise, sets[setIndex], settings, "minrep", value.value, value.op);
                } else if (key === "timers") {
                  operation(exercise, sets[setIndex], settings, "timer", value.value, value.op);
                } else if (key === "setTime") {
                  operation(exercise, sets[setIndex], settings, "setTimer", value.value, value.op);
                } else if (key === "weights") {
                  operation(exercise, sets[setIndex], settings, "weight", value.value, value.op);
                } else if (key === "amraps") {
                  operation(exercise, sets[setIndex], settings, "isAmrap", value.value, value.op);
                } else if (key === "logrpes") {
                  operation(exercise, sets[setIndex], settings, "logRpe", value.value, value.op);
                } else if (key === "askweights") {
                  operation(exercise, sets[setIndex], settings, "askWeight", value.value, value.op);
                }
              }
            }
          }
          if ((week === "*" || week === weekIndex + 1) && (day === "*" || day === dayInWeekIndex + 1)) {
            if (key === "setVariationIndex" && typeof update.value.value === "number") {
              let indexValue;
              if (update.value.op === "=") {
                indexValue = update.value.value - 1;
              } else {
                const currentSetVariationIndex = PlannerProgramExercise_currentEvaluatedSetVariationIndex(exercise);
                indexValue = Weight_applyOp(
                  void 0,
                  currentSetVariationIndex,
                  update.value.value,
                  update.value.op
                );
              }
              indexValue = indexValue % exercise.evaluatedSetVariations.length;
              exercise.evaluatedSetVariations.forEach((s) => s.isCurrent = false);
              const sv = exercise.evaluatedSetVariations[indexValue];
              if (sv != null) {
                sv.isCurrent = true;
              }
            } else if (key === "exerciseVariationIndex" && typeof update.value.value === "number") {
              const variations = exercise.exerciseVariations ?? [];
              if (variations.length > 0) {
                let indexValue;
                if (update.value.op === "=") {
                  indexValue = update.value.value - 1;
                } else {
                  const currentExerciseVariationIndex = PlannerProgramExercise_currentExerciseVariationIndex(exercise);
                  indexValue = Weight_applyOp(
                    void 0,
                    currentExerciseVariationIndex,
                    update.value.value,
                    update.value.op
                  );
                }
                indexValue = (indexValue % variations.length + variations.length) % variations.length;
                variations.forEach((v) => v.isCurrent = false);
                const nextVariation = variations[indexValue];
                if (nextVariation != null) {
                  nextVariation.isCurrent = true;
                  if (nextVariation.exerciseType != null) {
                    exercise.exerciseType = nextVariation.exerciseType;
                  }
                }
              }
            } else if (key === "descriptionIndex" && typeof update.value.value === "number") {
              let indexValue;
              if (update.value.op === "=") {
                indexValue = update.value.value - 1;
              } else {
                const currentDescriptionIndex = PlannerProgramExercise_currentDescriptionIndex(exercise);
                indexValue = Weight_applyOp(
                  void 0,
                  currentDescriptionIndex,
                  update.value.value,
                  update.value.op
                );
              }
              indexValue = indexValue % exercise.descriptions.values.length;
              exercise.descriptions.values.forEach((s) => s.isCurrent = false);
              const d = exercise.descriptions.values[indexValue];
              if (d != null) {
                d.isCurrent = true;
              }
            }
          }
        }
        dayIndex += 1;
      }
    }
  }
}
function operation(programExercise, set, settings, key, value, op) {
  if (op === "=") {
    if (key === "weight" && (Weight_is(value) || Weight_isPct(value))) {
      set[key] = value;
    } else if (typeof value === "number" && (key === "maxrep" || key === "minrep" || key === "timer" || key === "setTimer" || key === "rpe")) {
      set[key] = value;
    } else if (typeof value === "number" && (key === "askWeight" || key === "isAmrap" || key === "logRpe")) {
      set[key] = value !== 0;
    }
  } else {
    const onerm = Exercise_onerm(programExercise.exerciseType, settings);
    let oldValue = typeof set[key] === "boolean" ? set[key] ? 1 : 0 : set[key];
    if (oldValue == null && ProgramSet_isEligibleForInferredWeight(set)) {
      const inferredWeight = ProgramSet_getEvaluatedWeight(set, programExercise.exerciseType, settings);
      oldValue = inferredWeight;
    }
    const newValue = Weight_applyOp(onerm, oldValue ?? 0, value, op);
    if (key === "weight" && (Weight_is(newValue) || Weight_isPct(newValue))) {
      set[key] = newValue;
    } else if (typeof newValue === "number" && (key === "maxrep" || key === "minrep" || key === "timer" || key === "setTimer" || key === "rpe")) {
      set[key] = newValue;
    } else if (typeof newValue === "number" && (key === "askWeight" || key === "isAmrap" || key === "logRpe")) {
      set[key] = newValue !== 0;
    }
  }
}

// third-party/liftosaur/upstream/src/models/stats.ts
function Stats_getCurrentBodyweight(stats) {
  const weights = CollectionUtils_sortBy(stats.weight.weight || [], "timestamp", true);
  return weights[0]?.value;
}
function Stats_getCurrentMovingAverageBodyweight(stats, settings) {
  const movingAverageWindowSize = settings.graphOptions.weight?.movingAverageWindowSize;
  if (!movingAverageWindowSize) {
    return Stats_getCurrentBodyweight(stats);
  }
  const weights = CollectionUtils_sortBy(stats.weight.weight || [], "timestamp", true);
  if (weights.length < movingAverageWindowSize) {
    return Stats_getCurrentBodyweight(stats);
  }
  const recentWeights = weights.slice(0, movingAverageWindowSize);
  const totalWeight = recentWeights.reduce((sum2, item) => Weight_add(sum2, item.value), Weight_build(0, settings.units));
  return Weight_divide(totalWeight, recentWeights.length);
}
function Stats_getEmpty() {
  return {
    weight: {},
    percentage: {},
    length: {}
  };
}

// third-party/liftosaur/upstream/src/liftoscriptExerciseName.ts
function LiftoscriptExerciseName_isProgramExercise(pattern, programExerciseKey, customExercises) {
  return PlannerKey_fromFullName(pattern, customExercises) === programExerciseKey;
}
function LiftoscriptExerciseName_isExercise(pattern, exerciseType, customExercises) {
  const colonIndex = pattern.indexOf(":");
  const nameAndEquipment = (colonIndex === -1 ? pattern : pattern.slice(colonIndex + 1)).trim();
  const resolved = Exercise_resolveNameAndEquipment(nameAndEquipment, customExercises);
  if (resolved == null || resolved.exercise.id !== exerciseType.id) {
    return false;
  }
  const defaultEquipment = resolved.exercise.defaultEquipment;
  return (resolved.exercise.equipment ?? defaultEquipment) === (exerciseType.equipment ?? defaultEquipment);
}

// third-party/liftosaur/upstream/src/models/progress.ts
var import_deepmerge = __toESM(require_cjs());

// headless:/home/aurrix/Projects/fitness-trainer/third-party/liftosaur/upstream/src/utils/dialog
var Dialog_alert = (...args) => {
  throw new Error("Unavailable headless boundary: Dialog_alert");
};

// third-party/liftosaur/upstream/src/models/progress.ts
function Progress_scriptExerciseContext(entry, programExercise) {
  return { entryExercise: entry.exercise, programExerciseKey: programExercise.key };
}
function applyRounding(num, rounder) {
  if (num == null) {
    return 0;
  }
  return typeof num === "number" ? rounder(num) : Weight_buildAny(rounder(num.value), num.unit);
}
function isScriptValue(v) {
  return typeof v === "number" || Weight_is(v) || Weight_isPct(v);
}
function flattenScriptArgs(args) {
  const result = [];
  for (const arg of args) {
    if (Array.isArray(arg)) {
      for (const item of arg) {
        if (isScriptValue(item)) {
          result.push(item);
        }
      }
    } else if (isScriptValue(arg)) {
      result.push(arg);
    }
  }
  return result;
}
function sum(args) {
  const flat = flattenScriptArgs(args);
  if (flat.length === 0) {
    return 0;
  }
  return flat.reduce((acc, a) => Weight_op(void 0, acc, a, (x, y) => x + y), 0);
}
function min(args) {
  const flat = flattenScriptArgs(args);
  if (flat.length === 0) {
    return 0;
  }
  return flat.reduce((acc, a) => Weight_lt(a, acc) ? a : acc, flat[0]);
}
function max(args) {
  const flat = flattenScriptArgs(args);
  if (flat.length === 0) {
    return 0;
  }
  return flat.reduce((acc, a) => Weight_lt(acc, a) ? a : acc, flat[0]);
}
function zeroOrGte(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const aVal = a[i];
    const bVal = b[i];
    if (aVal != null && bVal != null && !Weight_eq(aVal, 0) && Weight_lt(aVal, bVal)) {
      return false;
    }
  }
  return true;
}
function Progress_createEmptyScriptBindings(dayData, settings, exercise, label) {
  const rm1 = exercise ? Exercise_onerm(exercise, settings) : Weight_build(0, "lb");
  return {
    exercise: exercise ? Exercise_fullName(Exercise_get(exercise, settings.exercises), settings, label) : "",
    day: dayData.day,
    week: dayData.week ?? 1,
    dayInWeek: dayData.dayInWeek ?? dayData.day,
    completedWeights: [],
    originalWeights: [],
    weights: [],
    reps: [],
    minReps: [],
    RPE: [],
    amraps: [],
    logrpes: [],
    askweights: [],
    completedReps: [],
    completedRepsLeft: [],
    completedRPE: [],
    isCompleted: [],
    timers: [],
    setTime: [],
    completedSetTime: [],
    completedSetTimeLeft: [],
    w: [],
    r: [],
    cr: [],
    cw: [],
    mr: [],
    programNumberOfSets: 0,
    numberOfSets: 0,
    completedNumberOfSets: 0,
    ns: 0,
    setVariationIndex: 1,
    exerciseVariationIndex: 1,
    descriptionIndex: 1,
    bodyweight: Weight_build(0, settings.units),
    setIndex: 1,
    rm1
  };
}
function Progress_createScriptBindings(dayData, entry, settings, programNumberOfSets, bodyweight, setIndex, setVariationIndex, descriptionIndex, exerciseVariationIndex, label) {
  const bindings = Progress_createEmptyScriptBindings(dayData, settings, entry.exercise, label);
  for (const set of entry.sets) {
    bindings.weights.push(set.weight);
    bindings.originalWeights.push(set.originalWeight ?? Weight_build(0, settings.units));
    bindings.reps.push(set.reps);
    bindings.minReps.push(set.minReps);
    bindings.completedReps.push(set.completedReps);
    bindings.completedRepsLeft.push(set.completedRepsLeft);
    bindings.completedRPE.push(set.completedRpe);
    bindings.completedWeights.push(set.completedWeight);
    bindings.RPE.push(set.rpe);
    bindings.amraps.push(set.isAmrap ? 1 : void 0);
    bindings.logrpes.push(set.logRpe ? 1 : void 0);
    bindings.askweights.push(set.askWeight ? 1 : void 0);
    bindings.timers.push(set.timer);
    bindings.setTime.push(set.setTimer);
    bindings.completedSetTime.push(set.completedSetTimer);
    bindings.completedSetTimeLeft.push(set.completedSetTimerLeft);
    bindings.isCompleted.push(set.isCompleted ? 1 : 0);
  }
  bindings.w = bindings.weights;
  bindings.r = bindings.reps;
  bindings.cr = bindings.completedReps;
  bindings.cw = bindings.completedWeights;
  bindings.mr = bindings.minReps;
  bindings.ns = entry.sets.length;
  bindings.programNumberOfSets = programNumberOfSets;
  bindings.numberOfSets = entry.sets.length;
  bindings.completedNumberOfSets = entry.sets.filter((s) => s.isCompleted).length;
  bindings.setIndex = setIndex ?? 1;
  bindings.setVariationIndex = setVariationIndex ?? 1;
  bindings.exerciseVariationIndex = exerciseVariationIndex ?? 1;
  bindings.descriptionIndex = descriptionIndex ?? 1;
  bindings.bodyweight = bodyweight ?? Weight_build(0, settings.units);
  return bindings;
}
function Progress_createScriptFunctions(settings) {
  function toWeight(value) {
    return Weight_is(value) ? value : Weight_build(value, settings.units);
  }
  function increment(vals, context) {
    if (typeof vals === "number") {
      const weight = Weight_build(vals, context.unit);
      return Weight_increment(weight, settings, context.exerciseType);
    } else if (Weight_isPct(vals)) {
      return Weight_buildPct(vals.value + 1);
    } else {
      return Weight_increment(vals, settings, context.exerciseType);
    }
  }
  function decrement(vals, context) {
    if (typeof vals === "number") {
      const weight = Weight_build(vals, context.unit);
      return Weight_decrement(weight, settings, context.exerciseType);
    } else if (Weight_isPct(vals)) {
      return Weight_buildPct(vals.value - 1);
    } else {
      return Weight_decrement(vals, settings, context.exerciseType);
    }
  }
  const fns = {
    roundWeight: ([num], context) => {
      const unit = Equipment_getUnitForExerciseType(settings, context?.exerciseType);
      return Weight_round(toWeight(num), settings, unit ?? settings.units, context?.exerciseType);
    },
    roundConvertWeight: ([num], context) => {
      const unit = Equipment_getUnitForExerciseType(settings, context?.exerciseType);
      return Weight_roundConvertTo(toWeight(num), settings, unit ?? settings.units, context?.exerciseType);
    },
    calculateTrainingMax: ([weight, reps]) => {
      return Weight_getTrainingMax(toWeight(weight), reps || 0, settings);
    },
    calculate1RM: ([weight, reps]) => {
      return Weight_getOneRepMax(toWeight(weight), reps);
    },
    rpeMultiplier: ([repsRaw, rpeRaw]) => {
      const reps = Weight_is(repsRaw) ? repsRaw.value : repsRaw;
      const rpe = rpeRaw == null ? 10 : Weight_is(rpeRaw) ? rpeRaw.value : rpeRaw;
      return Weight_rpeMultiplier(reps, rpe);
    },
    floor: ([num]) => applyRounding(num, Math.floor),
    ceil: ([num]) => applyRounding(num, Math.ceil),
    round: ([num]) => applyRounding(num, Math.round),
    sum: (args) => sum(args),
    min: (args) => min(args),
    max: (args) => max(args),
    increment: ([vals], context) => increment(vals, context),
    decrement: ([vals], context) => decrement(vals, context),
    zeroOrGte: ([a, b]) => zeroOrGte(a, b),
    print: (args, context) => {
      const flatArgs = [...args.flat()].map((arg) => arg ?? 0);
      context.prints = context.prints || [];
      context.prints.push(LiftoscriptPrint_formatLine(flatArgs));
      return flatArgs[0] ?? 0;
    },
    isProgramExercise: ([pattern], context) => {
      if (context.programExerciseKey == null) {
        return false;
      }
      return LiftoscriptExerciseName_isProgramExercise(pattern, context.programExerciseKey, settings.exercises);
    },
    isExercise: ([pattern], context) => {
      if (context.entryExercise == null) {
        return false;
      }
      return LiftoscriptExerciseName_isExercise(pattern, context.entryExercise, settings.exercises);
    },
    sets: ([from, to, minReps, reps, isAmrap, weight, timer, rpe, logRpe], context, bindings) => {
      for (let i = 0; i < bindings.numberOfSets; i++) {
        if (i >= from - 1 && i < to) {
          const weightValue = Weight_convertToWeight(bindings.rm1, weight, context.unit);
          bindings.minReps[i] = reps !== minReps ? minReps : void 0;
          bindings.reps[i] = reps;
          bindings.originalWeights[i] = weightValue;
          bindings.weights[i] = Weight_round(weightValue, settings, context.unit, context.exerciseType);
          bindings.RPE[i] = rpe !== 0 ? rpe : void 0;
          bindings.amraps[i] = isAmrap !== 0 ? 1 : 0;
          bindings.logrpes[i] = logRpe !== 0 ? 1 : 0;
          bindings.timers[i] = timer !== 0 ? timer : void 0;
        }
      }
      return to - from;
    }
  };
  return fns;
}
function Progress_runUpdateScriptForEntry(entry, dayData, programExercise, otherStates, setIndex, settings, stats) {
  if (setIndex !== -1 && !entry?.sets[setIndex]?.isCompleted) {
    return entry;
  }
  const script = PlannerProgramExercise_getUpdateScript(programExercise);
  if (!script) {
    return entry;
  }
  const exercise = programExercise.exerciseType;
  const state = ObjectUtils_clone(PlannerProgramExercise_getState(programExercise));
  const setVariationIndex = PlannerProgramExercise_currentEvaluatedSetVariationIndex(programExercise);
  const descriptionIndex = PlannerProgramExercise_currentDescriptionIndex(programExercise);
  const exerciseVariationIndex = PlannerProgramExercise_currentExerciseVariationIndex(programExercise);
  const bindings = Progress_createScriptBindings(
    dayData,
    entry,
    settings,
    programExercise.evaluatedSetVariations[setVariationIndex]?.sets.length ?? 0,
    Stats_getCurrentMovingAverageBodyweight(stats, settings),
    setIndex + 1,
    setVariationIndex,
    descriptionIndex,
    exerciseVariationIndex,
    programExercise.label
  );
  const fnContext = {
    exerciseType: exercise,
    ...Progress_scriptExerciseContext(entry, programExercise),
    unit: settings.units,
    prints: []
  };
  const runner = new ScriptRunner(
    script,
    state,
    ObjectUtils_clone(otherStates),
    bindings,
    Progress_createScriptFunctions(settings),
    settings.units,
    fnContext,
    "update"
  );
  runner.execute();
  const { updatePrints, ...newEntry } = Progress_applyBindings(entry, bindings, settings);
  return { ...newEntry, state: { ...newEntry.state, ...state }, updatePrintLines: fnContext.prints };
}
function Progress_applyBindings(oldEntry, bindings, settings) {
  const keys = [
    "RPE",
    "minReps",
    "reps",
    "weights",
    "amraps",
    "logrpes",
    "timers",
    "setTime",
    "originalWeights",
    "askweights"
  ];
  const lastCompletedIndex = CollectionUtils_findIndexReverse(bindings.completedReps, (r) => r != null) + 1;
  const entry = {
    ...oldEntry,
    sets: ObjectUtils_clone(oldEntry.sets.slice(0, Math.max(lastCompletedIndex, bindings.numberOfSets, 0)))
  };
  for (const key of keys) {
    for (let i = 0; i < bindings[key].length; i += 1) {
      if (entry.sets[i] == null) {
        entry.sets[i] = {
          vtype: "set",
          id: UidFactory_generateUid(6),
          index: i,
          isUnilateral: Exercise_getIsUnilateral(entry.exercise, settings),
          reps: 0,
          weight: Weight_build(0, "lb"),
          originalWeight: Weight_build(0, "lb"),
          askWeight: false,
          isCompleted: false
        };
      }
      if (!entry.sets[i].isCompleted) {
        if (key === "RPE") {
          const value = bindings.RPE[i];
          entry.sets[i].rpe = value !== 0 ? value : void 0;
        } else if (key === "reps") {
          const value = bindings.reps[i];
          entry.sets[i].reps = value;
        } else if (key === "minReps") {
          const value = bindings.minReps[i];
          entry.sets[i].minReps = value !== 0 ? value : void 0;
        } else if (key === "weights") {
          const value = bindings.weights[i];
          entry.sets[i].weight = value;
        } else if (key === "originalWeights") {
          const value = bindings.originalWeights[i];
          entry.sets[i].originalWeight = value;
        } else if (key === "amraps") {
          const value = bindings.amraps[i];
          entry.sets[i].isAmrap = !!value;
        } else if (key === "logrpes") {
          const value = bindings.logrpes[i];
          entry.sets[i].logRpe = !!value;
        } else if (key === "askweights") {
          const value = bindings.askweights[i];
          entry.sets[i].askWeight = !!value;
        } else if (key === "timers") {
          const value = bindings.timers[i];
          entry.sets[i].timer = value != null && value >= 0 ? value : void 0;
        } else if (key === "setTime") {
          const value = bindings.setTime[i];
          entry.sets[i].setTimer = value != null && value >= 0 ? value : void 0;
        }
      }
    }
  }
  return entry;
}
function Progress_getDayData(progress) {
  return {
    day: progress.day,
    week: progress.week,
    dayInWeek: progress.dayInWeek
  };
}
function Progress_getEntryId(exerciseType, label) {
  return CollectionUtils_compact([label, Exercise_toKey(exerciseType)]).join("_");
}

// third-party/liftosaur/upstream/src/parser.ts
var import_micro_memoize3 = __toESM(require_micro_memoize());
var lastAlertDisplayedTs = {};
var parseLiftoscript = (0, import_micro_memoize3.default)((script) => parser.parse(script), { maxSize: 200 });
var validateLiftoscript = (0, import_micro_memoize3.default)(
  (_script, _mode, _stateKeys, _bindingKeys, validate) => {
    validate();
    return true;
  },
  { maxSize: 500, transformKey: (args) => args.slice(0, 4) }
);
function hasOnlyOwnKeys(value) {
  return Object.getPrototypeOf(value) === Object.prototype;
}
var hasKeywordMemoized = (0, import_micro_memoize3.default)(
  (script, name) => {
    const expr = parseLiftoscript(script);
    const cursor = expr.cursor();
    do {
      if (cursor.node.type.name === "Keyword" /* Keyword */) {
        if (LiftoscriptEvaluator.getValue(script, cursor.node) === name) {
          return true;
        }
      }
    } while (cursor.next());
    return false;
  },
  { maxSize: 200 }
);
var ScriptRunner = class _ScriptRunner {
  constructor(script, state, otherStates, bindings, fns, units2, context, mode) {
    this.updates = [];
    this.script = script;
    this.state = state;
    this.otherStates = otherStates;
    this.bindings = bindings;
    this.fns = fns;
    this.units = units2;
    this.context = context;
    this.mode = mode;
  }
  static isValid(script, state, dayData, settings, exerciseType) {
    const liftoscriptEvaluator = new _ScriptRunner(
      script,
      state,
      {},
      Progress_createEmptyScriptBindings(dayData, settings),
      Progress_createScriptFunctions(settings),
      settings.units,
      { exerciseType, unit: settings.units, prints: [] },
      "planner"
    );
    try {
      liftoscriptEvaluator.parse();
    } catch (e) {
      if (e instanceof LiftoscriptSyntaxError) {
        return e;
      } else {
        throw e;
      }
    }
    return void 0;
  }
  parse() {
    const liftoscriptTree = parseLiftoscript(this.script);
    const liftoscriptEvaluator = new LiftoscriptEvaluator(
      this.script,
      this.state,
      this.otherStates,
      this.bindings,
      this.fns,
      this.context,
      this.units,
      this.mode
    );
    const validate = () => liftoscriptEvaluator.parse(liftoscriptTree.topNode);
    if (hasOnlyOwnKeys(this.state) && hasOnlyOwnKeys(this.bindings)) {
      validateLiftoscript(
        this.script,
        this.mode,
        Object.keys(this.state).sort().join("\n"),
        Object.keys(this.bindings).sort().join("\n"),
        validate
      );
    } else {
      validate();
    }
    return [liftoscriptEvaluator, liftoscriptTree];
  }
  switchWeightsToUnit(toUnit) {
    const liftoscriptTree = parseLiftoscript(this.script);
    const liftoscriptEvaluator = new LiftoscriptEvaluator(
      this.script,
      this.state,
      this.otherStates,
      this.bindings,
      this.fns,
      this.context,
      this.units,
      this.mode
    );
    return liftoscriptEvaluator.switchWeightsToUnit(liftoscriptTree.topNode, toUnit);
  }
  getStateVariableKeys() {
    const liftoscriptTree = parseLiftoscript(this.script);
    const liftoscriptEvaluator = new LiftoscriptEvaluator(
      this.script,
      this.state,
      this.otherStates,
      this.bindings,
      this.fns,
      this.context,
      this.units,
      this.mode
    );
    return liftoscriptEvaluator.getStateVariableKeys(liftoscriptTree.topNode);
  }
  static hasStateVariable(script, name) {
    const expr = parseLiftoscript(script);
    const cursor = expr.cursor();
    do {
      if (cursor.node.type.name === "StateVariable" /* StateVariable */) {
        const keywordNode = cursor.node.getChild("Keyword" /* Keyword */);
        if (keywordNode != null) {
          const value = LiftoscriptEvaluator.getValue(script, keywordNode);
          if (value === name) {
            return true;
          }
        }
      }
    } while (cursor.next());
    return false;
  }
  static hasKeyword(script, name) {
    if (script.indexOf(name) === -1) {
      return false;
    }
    return hasKeywordMemoized(script, name);
  }
  static safe(cb, errorMsg, defaultValue, disabled) {
    let value;
    try {
      value = cb();
    } catch (e) {
      if (!disabled && e instanceof LiftoscriptSyntaxError) {
        const lastAlertTs = lastAlertDisplayedTs[e.message];
        console.error(e);
        if (lastAlertTs == null || lastAlertTs < Date.now() - 1e3 * 60 * 1) {
          Dialog_alert(errorMsg(e));
          this.reportError("Error during Liftoscript execution", e);
          lastAlertDisplayedTs[e.message] = Date.now();
        }
        value = defaultValue;
      } else {
        throw e;
      }
    }
    return value;
  }
  execute(type) {
    const [liftoscriptEvaluator, liftoscriptTree] = this.parse();
    const rawResult = liftoscriptEvaluator.evaluate(liftoscriptTree.topNode);
    let result = Array.isArray(rawResult) ? rawResult[0] : rawResult;
    if (result == null) {
      result = 0;
    }
    const output = this.convertResult(type, result);
    this.updates = liftoscriptEvaluator.updates;
    return output;
  }
  getUpdates() {
    return this.updates;
  }
  convertResult(type, result) {
    if (type === "reps" || type === "timer") {
      if (typeof result !== "number") {
        throw new LiftoscriptSyntaxError("Expected to get number as a result", 0, 0, 0, 0, {
          type: "wrongResultType",
          data: { expected: "number" }
        });
      } else if (result < 0) {
        return 0;
      } else {
        return result;
      }
    } else if (type === "rpe") {
      if (typeof result !== "number") {
        throw new LiftoscriptSyntaxError("Expected to get number as a result", 0, 0, 0, 0, {
          type: "wrongResultType",
          data: { expected: "number" }
        });
      } else {
        return Math.round(Math.min(10, Math.max(0, result)) / 0.5) * 0.5;
      }
    } else if (type === "weight") {
      if (typeof result === "boolean" || typeof result === "string") {
        throw new LiftoscriptSyntaxError("Expected to get number, percentage or weight as a result", 0, 0, 0, 0, {
          type: "wrongResultType",
          data: { expected: "numberOrPercentageOrWeight" }
        });
      } else if (typeof result === "number") {
        return Weight_build(result, this.units);
      } else {
        if (result.value < 0) {
          return Weight_build(0, this.units);
        } else {
          return result;
        }
      }
    } else {
      return result;
    }
  }
  static reportError(msg, error) {
    if (typeof Rollbar === "undefined") {
      return;
    }
    const payload = {
      error: error ? { message: error.message, name: error.name, stack: error.stack } : void 0
    };
    Rollbar.error(msg, payload);
  }
};

// third-party/liftosaur/upstream/src/models/program.ts
var import_lens_shmens4 = __toESM(require_dist());

// third-party/liftosaur/upstream/src/pages/planner/plannerExerciseEvaluatorText.ts
function getChildren4(node) {
  const cur = node.cursor();
  const result = [];
  if (!cur.firstChild()) {
    return result;
  }
  do {
    result.push(cur.node);
  } while (cur.nextSibling());
  return result;
}
function fullTextLineToWeekdayDescription(line) {
  switch (line.type) {
    case "comment":
      return line.line.replace(/^\s*\/\/\s*/, "").trim();
    case "triplelinecomment":
      return line.line.replace(/^\s*\/\/\/\s*/, "").trim();
    case "empty":
      return "";
  }
}
var PlannerExerciseEvaluatorText = class {
  constructor(script, options = {}) {
    this.weeks = [];
    this.ongoingLines = [];
    this.script = script;
    this.isStrict = options.isStrict ?? false;
  }
  getValue(node) {
    return this.script.slice(node.from, node.to);
  }
  getWeekDayOngoingLines() {
    const ongoingLines = [...this.ongoingLines];
    let anyCommentStarted = false;
    let commentStarted = false;
    const linesToPreviousExercise = [];
    const nextLines = [];
    for (let i = 0; i < ongoingLines.length; i++) {
      const line = ongoingLines[i];
      if (!anyCommentStarted && line?.type === "empty") {
        continue;
      }
      if (line?.type === "comment" || line?.type === "triplelinecomment") {
        anyCommentStarted = true;
      }
      if (line?.type === "comment") {
        commentStarted = true;
      }
      if (anyCommentStarted && !commentStarted) {
        linesToPreviousExercise.push(line);
      }
      if (commentStarted && line?.type === "comment") {
        nextLines.push(line);
      }
    }
    for (let i = nextLines.length - 1; i >= 0; i--) {
      const line = nextLines[i];
      if (line.type === "empty") {
        nextLines.pop();
      } else {
        break;
      }
    }
    for (let i = linesToPreviousExercise.length - 1; i >= 0; i--) {
      const line = linesToPreviousExercise[i];
      if (line.type === "empty") {
        linesToPreviousExercise.pop();
      } else {
        break;
      }
    }
    return { linesToPreviousExercise, nextLines };
  }
  getWeekDayDescriptionAndFillLastDay() {
    const { linesToPreviousExercise, nextLines } = this.getWeekDayOngoingLines();
    if (linesToPreviousExercise.length > 0) {
      const lastDay = this.getLastDay();
      if (lastDay) {
        lastDay.exercises.push(...linesToPreviousExercise.map((line) => line.line));
      }
    }
    const description = nextLines.length > 0 ? nextLines.map(fullTextLineToWeekdayDescription).join("\n").trim() : void 0;
    return description;
  }
  error(message, node, details) {
    const [line, offset] = PlannerExerciseEvaluator.getLineAndOffset(this.script, node);
    throw PlannerSyntaxError.fromPoint(void 0, message, { line, offset, from: node.from, to: node.to }, details);
  }
  getLastDay() {
    const lastWeek = this.weeks[this.weeks.length - 1];
    return lastWeek?.days[lastWeek.days.length - 1];
  }
  evaluateLine(expr) {
    if (expr.type.name === "Week" /* Week */) {
      const weekName = this.getValue(expr).replace(/^#+/, "").trim();
      const description = this.getWeekDayDescriptionAndFillLastDay();
      this.weeks.push({ name: weekName, description, days: [] });
      this.ongoingLines = [];
    } else if (expr.type.name === "Day" /* Day */) {
      if (this.weeks.length === 0) {
        this.error(`You need to specify a week before a day`, expr, { type: "dayWithoutWeek" });
      }
      const dayName = this.getValue(expr).replace(/^#+/, "").trim();
      const description = this.getWeekDayDescriptionAndFillLastDay();
      this.weeks[this.weeks.length - 1].days.push({ name: dayName, exercises: [], description });
      this.ongoingLines = [];
    } else if (expr.type.name === "EmptyExpression" /* EmptyExpression */) {
      this.ongoingLines.push({ type: "empty", line: this.getValue(expr) });
    } else if (expr.type.name === "LineComment" /* LineComment */) {
      this.ongoingLines.push({ type: "comment", line: this.getValue(expr) });
    } else if (expr.type.name === "TripleLineComment" /* TripleLineComment */) {
      this.ongoingLines.push({ type: "triplelinecomment", line: this.getValue(expr) });
    } else if (expr.type.name === "ExerciseExpression" /* ExerciseExpression */) {
      const lastDay = this.getLastDay();
      if (lastDay == null) {
        if (!this.isStrict) {
          return;
        }
        this.error(`You should first define a week and a day before listing exercises.`, expr, {
          type: "exerciseWithoutDay"
        });
      }
      for (const line of this.ongoingLines) {
        lastDay.exercises.push(line.line);
      }
      lastDay.exercises.push(this.getValue(expr));
      this.ongoingLines = [];
    }
  }
  evaluate(expr) {
    if (expr.type.name === "Program" /* Program */) {
      this.ongoingLines = [];
      this.weeks = [];
      for (const child of CollectionUtils_compact(getChildren4(expr))) {
        this.evaluateLine(child);
      }
      return this.weeks;
    } else {
      throw new Error(`Unexpected node type ${expr.type.name}`);
    }
  }
};

// third-party/liftosaur/upstream/src/pages/planner/plannerEvaluator.ts
var import_micro_memoize4 = __toESM(require_micro_memoize());
function PlannerEvaluator_fillInMetadata(exercise, metadata2, dayData) {
  if (exercise.progress?.type === "dp") {
    const hasRange = exercise.setVariations.some((sv) => sv.sets.some((s) => s.repRange?.minrep != null));
    if (hasRange) {
      exercise.progress = { ...exercise.progress, script: PlannerProgramExercise_buildDpRangeScript() };
    }
  }
  if (metadata2.byWeekDayExercise[dayData.week - 1]?.[dayData.dayInWeek - 1]?.[exercise.key] != null) {
    throw PlannerSyntaxError.fromPoint(
      exercise.fullName,
      `Another exercise with the same name is already used in this day. Combine them together, or add a label to separate out.`,
      exercise.points.fullName,
      { type: "duplicateExerciseInDay", data: { key: exercise.key } }
    );
  }
  const tagsProp = exercise.tags;
  if (tagsProp != null && tagsProp.length > 0) {
    const existingTags = metadata2.properties.id[exercise.key];
    if (existingTags != null && !ObjectUtils_isEqual(existingTags.property, tagsProp)) {
      const point = exercise.points.idPoint || exercise.points.fullName;
      throw PlannerSyntaxError.fromPoint(
        exercise.fullName,
        `Same property 'id' is specified with different arguments in multiple weeks/days for exercise '${exercise.name}': both in week ${existingTags.dayData.week + 1}, day ${existingTags.dayData.dayInWeek + 1} and week ${dayData.week}, day ${dayData.dayInWeek}`,
        point,
        {
          type: "conflictingProperty",
          data: { property: "id", exercise: exercise.name, a: existingTags.dayData, b: dayData }
        }
      );
    }
    metadata2.properties.id[exercise.key] = {
      property: tagsProp,
      dayData
    };
  }
  const progressProp = exercise.progress;
  if (progressProp != null && progressProp.type !== "none") {
    const existingProgress = metadata2.properties.progress[exercise.key];
    if (existingProgress != null && !PlannerExerciseEvaluator.isEqualProgress(progressProp, existingProgress.property)) {
      const point = exercise.points.progressPoint || exercise.points.fullName;
      throw PlannerSyntaxError.fromPoint(
        exercise.fullName,
        `Same property 'progress' is specified with different arguments in multiple weeks/days for exercise '${exercise.name}': both in week ${existingProgress.dayData.week + 1}, day ${existingProgress.dayData.dayInWeek + 1} and week ${dayData.week}, day ${dayData.dayInWeek}`,
        point,
        {
          type: "conflictingProperty",
          data: { property: "progress", exercise: exercise.name, a: existingProgress.dayData, b: dayData }
        }
      );
    }
    metadata2.properties.progress[exercise.key] = {
      property: progressProp,
      dayData
    };
  }
  const updateProp = exercise.update;
  if (updateProp != null) {
    const existingUpdate = metadata2.properties.update[exercise.key];
    if (existingUpdate != null && !PlannerExerciseEvaluator.isEqualUpdate(updateProp, existingUpdate.property)) {
      const point = exercise.points.updatePoint || exercise.points.fullName;
      throw PlannerSyntaxError.fromPoint(
        exercise.fullName,
        `Same property 'update' is specified with different arguments in multiple weeks/days for exercise '${exercise.name}': both in week ${existingUpdate.dayData.week + 1}, day ${existingUpdate.dayData.dayInWeek + 1} and week ${dayData.week}, day ${dayData.dayInWeek}`,
        point,
        {
          type: "conflictingProperty",
          data: { property: "update", exercise: exercise.name, a: existingUpdate.dayData, b: dayData }
        }
      );
    }
    metadata2.properties.update[exercise.key] = {
      property: updateProp,
      dayData
    };
  }
  if (exercise.notused) {
    metadata2.notused.add(exercise.key);
  }
  if (exercise.warmupSets != null) {
    const scheme = JSON.stringify(exercise.warmupSets);
    const ws = metadata2.properties.warmup[exercise.key];
    if (ws != null && JSON.stringify(ws.warmupSets) !== scheme) {
      throw PlannerSyntaxError.fromPoint(
        exercise.fullName,
        `Different warmup sets are specified in multiple weeks/days for exercise '${exercise.name}': both in week ${ws.dayData.week + 1}, day ${ws.dayData.dayInWeek + 1} and week ${dayData.week}, day ${dayData.dayInWeek}`,
        exercise.points.warmupPoint || exercise.points.fullName,
        {
          type: "conflictingProperty",
          data: { property: "warmup", exercise: exercise.name, a: ws.dayData, b: dayData }
        }
      );
    }
    metadata2.properties.warmup[exercise.key] = {
      warmupSets: exercise.warmupSets,
      dayData
    };
  }
  PlannerEvaluator_setByWeekDayExercise(
    metadata2.byWeekDayExercise,
    exercise.key,
    dayData.week - 1,
    dayData.dayInWeek - 1,
    exercise
  );
  PlannerEvaluator_setByExerciseWeekDay(
    metadata2.byExerciseWeekDay,
    exercise.key,
    dayData.week - 1,
    dayData.dayInWeek - 1,
    exercise
  );
  metadata2.fullNames.add(exercise.fullName);
}
function PlannerEvaluator_evaluateDay(day, dayData, settings) {
  const tree = parser2.parse(day.exerciseText);
  const evaluator = new PlannerExerciseEvaluator(day.exerciseText, settings, "perday", dayData);
  const result = evaluator.evaluate(tree.topNode);
  if (result.success) {
    const exercises = result.data[0]?.days[0]?.exercises || [];
    return { success: true, data: exercises };
  } else {
    return result;
  }
}
function PlannerEvaluator_getPerDayEvaluatedWeeks(plannerProgram, settings) {
  let dayIndex = 0;
  const metadata2 = {
    byExerciseWeekDay: {},
    byWeekDayExercise: {},
    fullNames: /* @__PURE__ */ new Set(),
    notused: /* @__PURE__ */ new Set(),
    properties: { progress: {}, update: {}, warmup: {}, id: {} }
  };
  const evaluatedWeeks = plannerProgram.weeks.map((week, weekIndex) => {
    return week.days.map((day, dayInWeekIndex) => {
      const dayData = {
        week: weekIndex + 1,
        dayInWeek: dayInWeekIndex + 1,
        day: dayIndex + 1
      };
      const result = PlannerEvaluator_evaluateDay(
        day,
        { week: weekIndex + 1, dayInWeek: dayInWeekIndex + 1, day: dayIndex + 1 },
        settings
      );
      dayIndex += 1;
      if (result.success) {
        const exercises = result.data;
        for (const exercise of exercises) {
          try {
            PlannerEvaluator_fillInMetadata(exercise, metadata2, dayData);
          } catch (e) {
            if (e instanceof PlannerSyntaxError) {
              return { success: false, error: e };
            } else {
              throw e;
            }
          }
        }
        return { success: true, data: exercises };
      } else {
        return result;
      }
    });
  });
  return { evaluatedWeeks, metadata: metadata2 };
}
function PlannerEvaluator_getDayIndexFromWeekAndDayInWeekIndex(evaluatedWeeks, weekIndex, dayInWeekIndex) {
  let dayIndex = 0;
  for (let i = 0; i < evaluatedWeeks.length; i += 1) {
    const week = evaluatedWeeks[i];
    for (let j = 0; j < week.length; j += 1) {
      if (i === weekIndex && j === dayInWeekIndex) {
        return dayIndex;
      }
      dayIndex += 1;
    }
  }
  return void 0;
}
function PlannerEvaluator_fillRepeats(exercise, evaluatedWeeks, dayInWeekIndex, byExerciseWeekDay) {
  for (const repeatWeek of exercise.repeat ?? []) {
    const repeatWeekIndex = repeatWeek - 1;
    if (byExerciseWeekDay[exercise.key]?.[repeatWeekIndex]?.[dayInWeekIndex] == null) {
      const dayData = {
        week: repeatWeek,
        dayInWeek: dayInWeekIndex + 1,
        day: (PlannerEvaluator_getDayIndexFromWeekAndDayInWeekIndex(evaluatedWeeks, repeatWeekIndex, dayInWeekIndex) ?? 0) + 1
      };
      const repeatedExercise = {
        ...exercise,
        reuse: exercise.reuse ? { ...exercise.reuse } : void 0,
        progress: exercise.progress ? { ...exercise.progress, reuse: exercise.progress.reuse ? { ...exercise.progress.reuse } : void 0 } : void 0,
        update: exercise.update ? { ...exercise.update, reuse: exercise.update.reuse ? { ...exercise.update.reuse } : void 0 } : void 0,
        repeat: [],
        dayData,
        isRepeat: true
      };
      PlannerEvaluator_setByExerciseWeekDay(
        byExerciseWeekDay,
        exercise.key,
        repeatWeekIndex,
        dayInWeekIndex,
        repeatedExercise
      );
      const day = evaluatedWeeks[repeatWeekIndex]?.[dayInWeekIndex];
      if (day?.success) {
        day.data.push(repeatedExercise);
      }
    }
  }
}
function PlannerEvaluator_compareExerciseOrder(ex1, ex2) {
  if ((ex1.exerciseIndex ?? 0) !== (ex2.exerciseIndex ?? 0)) {
    return (ex1.exerciseIndex ?? 0) - (ex2.exerciseIndex ?? 0);
  }
  if (!!ex1.notused !== !!ex2.notused) {
    return ex1.notused ? -1 : 1;
  }
  return (ex1.isRepeat ? 0 : 1) - (ex2.isRepeat ? 0 : 1);
}
function PlannerEvaluator_checkSelfReuse(exercise, originalExercise, message, point, section) {
  if (originalExercise === exercise) {
    throw PlannerSyntaxError.fromPoint(exercise.fullName, message, point, { type: "reuseSelf", data: { section } });
  }
}
function PlannerEvaluator_fillSetReuses(exercise, evaluatedWeeks, weekIndex, settings, metadata2) {
  if (exercise.reuse && exercise.points.reuseSetPoint) {
    const reuse = exercise.reuse;
    const originalExercises = PlannerEvaluator_findOriginalExercisesAtWeekDay(
      settings,
      reuse.fullName,
      evaluatedWeeks,
      reuse.week ?? weekIndex + 1 ?? 1,
      reuse.day
    );
    if (originalExercises.length > 1) {
      throw PlannerSyntaxError.fromPoint(
        exercise.fullName,
        `There're several exercises matching, please be more specific with [week:day] syntax`,
        exercise.points.reuseSetPoint,
        { type: "reuseAmbiguous" }
      );
    }
    const originalExercise = originalExercises[0];
    if (!originalExercise) {
      throw PlannerSyntaxError.fromPoint(
        exercise.fullName,
        `No such exercise ${reuse.fullName} at week: ${reuse.week ?? weekIndex + 1}${reuse.day != null ? `, day: ${reuse.day}` : ""}`,
        exercise.points.reuseSetPoint,
        {
          type: "reuseTargetNotFound",
          data: { fullName: reuse.fullName, week: reuse.week ?? weekIndex + 1, day: reuse.day }
        }
      );
    }
    PlannerEvaluator_checkSelfReuse(
      exercise,
      originalExercise.exercise,
      `Exercise cannot reuse itself`,
      exercise.points.reuseSetPoint,
      "sets"
    );
    if (originalExercise.exercise.reuse?.fullName != null) {
      throw PlannerSyntaxError.fromPoint(
        exercise.fullName,
        `Original exercise cannot reuse another exercise's sets x reps`,
        exercise.points.reuseSetPoint,
        { type: "reuseChained", data: { section: "sets" } }
      );
    }
    if ((originalExercise.exercise.exerciseVariations?.length ?? 0) > 1) {
      throw PlannerSyntaxError.fromPoint(
        exercise.fullName,
        `Cannot reuse '${reuse.fullName}' - it has multiple exercise variations. Move the shared sets/progress into a 'used: none' template and reuse that instead`,
        exercise.points.reuseSetPoint,
        { type: "reuseTargetMultipleVariations", data: { fullName: reuse.fullName } }
      );
    }
    if (originalExercise.exercise.progress?.reuse != null && exercise.progress == null && !originalExercise.exercise.notused) {
      throw PlannerSyntaxError.fromPoint(
        exercise.fullName,
        `This exercise doesn't specify progress - so the original USED exercise's progress cannot reuse another exercise's progress`,
        exercise.points.reuseSetPoint,
        { type: "reuseWithoutOwnSection", data: { section: "progress" } }
      );
    }
    if (originalExercise.exercise.update?.reuse != null && exercise.update == null && !originalExercise.exercise.notused) {
      throw PlannerSyntaxError.fromPoint(
        exercise.fullName,
        `This exercise doesn't specify 'update' - so the original exercise's 'update' cannot reuse another exercise's 'update'`,
        exercise.points.reuseSetPoint,
        { type: "reuseWithoutOwnSection", data: { section: "update" } }
      );
    }
    if (originalExercise.exercise.progress != null && exercise.progress == null) {
      const sharedProgressReuse = {
        fullName: originalExercise.exercise.fullName,
        source: "overall"
      };
      const originalProgress = originalExercise.exercise.progress;
      PlannerEvaluator_forEachSiblingInstance(exercise, metadata2, (other) => {
        if (other.progress == null) {
          other.progress = {
            type: originalProgress.type,
            state: ObjectUtils_clone(originalProgress.state),
            stateMetadata: ObjectUtils_clone(originalProgress.stateMetadata),
            reuse: sharedProgressReuse
          };
        }
      });
    }
    if (originalExercise.exercise.update != null && exercise.update == null) {
      const sharedUpdateReuse = {
        fullName: originalExercise.exercise.fullName,
        source: "overall"
      };
      const originalUpdate = originalExercise.exercise.update;
      PlannerEvaluator_forEachSiblingInstance(exercise, metadata2, (other) => {
        if (other.update == null) {
          other.update = {
            type: originalUpdate.type,
            reuse: sharedUpdateReuse
          };
        }
      });
    }
    exercise.reuse.exercise = originalExercise.exercise;
  }
}
function PlannerEvaluator_forEachSiblingInstance(exercise, metadata2, cb) {
  const byKey = metadata2.byExerciseWeekDay[exercise.key];
  if (byKey == null) {
    return;
  }
  for (const weekKey of ObjectUtils_keys(byKey)) {
    const weekEntry = byKey[weekKey];
    for (const dayKey of ObjectUtils_keys(weekEntry)) {
      cb(weekEntry[dayKey]);
    }
  }
}
function PlannerEvaluator_fillEvaluatedSetVariations(exercise) {
  const setVariations = PlannerProgramExercise_setVariations(exercise);
  const evaluatedSetVariations = PlannerProgramExercise_evaluateSetVariations(exercise, setVariations);
  exercise.evaluatedSetVariations = evaluatedSetVariations;
}
function PlannerEvaluator_fillDescriptions(exercise, evaluatedWeeks, weekIndex, dayIndex) {
  if (exercise.descriptions == null || exercise.descriptions.values.length === 0) {
    const lastWeekExercise = PlannerEvaluator_findLastWeekExercise(
      evaluatedWeeks,
      weekIndex,
      dayIndex,
      exercise,
      (ex) => ex.descriptions != null
    );
    if (lastWeekExercise && lastWeekExercise.descriptions) {
      exercise.descriptions = ObjectUtils_clone(lastWeekExercise.descriptions);
    }
  }
}
function PlannerEvaluator_isDescriptionReuse(descriptions) {
  return descriptions.reuse != null || descriptions.values.length === 1 && !!descriptions.values[0].value?.startsWith("...");
}
function PlannerEvaluator_fillDescriptionReuses(exercise, weekIndex, byExerciseWeekDay, settings) {
  if (exercise.descriptions != null && exercise.descriptions.values.length === 1 && exercise.descriptions.values[0].value?.startsWith("...")) {
    const reusingName = exercise.descriptions.values[0].value.slice(3).trim();
    const result = PlannerEvaluator_findReusedDescriptions(reusingName, weekIndex, byExerciseWeekDay, settings);
    if (result != null) {
      const { descriptions, exercise: originalExercise } = result;
      PlannerEvaluator_checkSelfReuse(
        exercise,
        originalExercise,
        `Exercise cannot reuse its own description`,
        exercise.points.fullName,
        "description"
      );
      if (PlannerEvaluator_isDescriptionReuse(descriptions)) {
        throw PlannerSyntaxError.fromPoint(
          exercise.fullName,
          `Original exercise cannot reuse another description - reuse the one that writes it instead`,
          exercise.points.fullName,
          { type: "reuseChained", data: { section: "description" } }
        );
      }
      exercise.descriptions = {
        values: [...ObjectUtils_clone(descriptions.values)],
        reuse: { fullName: originalExercise.fullName, exercise: originalExercise, source: "specific" }
      };
    }
  }
}
function PlannerEvaluator_fillSingleProperties(exercise, metadata2) {
  if (metadata2.notused.has(exercise.key)) {
    exercise.notused = true;
  }
  if (metadata2.properties.progress[exercise.key] != null) {
    const existingProgress = exercise.progress;
    if (!existingProgress) {
      exercise.progress = metadata2.properties.progress[exercise.key].property;
    }
  }
  if (metadata2.properties.update[exercise.key] != null && !exercise.update) {
    exercise.update = metadata2.properties.update[exercise.key].property;
  }
  if (metadata2.properties.warmup[exercise.key] != null) {
    exercise.warmupSets = metadata2.properties.warmup[exercise.key].warmupSets;
  }
}
function PlannerEvaluator_fillProgressReuses(evaluatedWeeks, exercise, settings, metadata2) {
  const progress = exercise.progress;
  if (progress?.type === "custom") {
    const fullName = progress.reuse?.fullName;
    if (progress.reuse && fullName) {
      const key = PlannerKey_fromFullName(fullName, settings.exercises);
      const point = exercise.points.progressPoint || exercise.points.fullName;
      if (metadata2.byExerciseWeekDay[key] == null) {
        throw PlannerSyntaxError.fromPoint(exercise.fullName, `No such exercise ${fullName}`, point, {
          type: "reuseTargetNotFound",
          data: { fullName }
        });
      }
      const originalProperty = metadata2.properties.progress[key];
      const dayData = originalProperty?.dayData;
      const originalProgress = originalProperty?.property;
      if (!originalProgress || !dayData) {
        throw PlannerSyntaxError.fromPoint(exercise.fullName, "Original exercise should specify progress", point, {
          type: "reuseTargetMissingSection",
          data: { section: "progress" }
        });
      }
      if (originalProgress === progress) {
        throw PlannerSyntaxError.fromPoint(exercise.fullName, `Exercise cannot reuse its own progress`, point, {
          type: "reuseSelf",
          data: { section: "progress" }
        });
      }
      if (originalProgress.reuse?.fullName != null) {
        const originalReuseKey = PlannerKey_fromFullName(originalProgress.reuse.fullName, settings.exercises);
        if (!metadata2.notused.has(originalReuseKey)) {
          throw PlannerSyntaxError.fromPoint(
            exercise.fullName,
            `Original exercise cannot reuse another progress`,
            point,
            { type: "reuseChained", data: { section: "progress" } }
          );
        }
      }
      if (originalProgress.type !== "custom") {
        throw PlannerSyntaxError.fromPoint(
          exercise.fullName,
          "Original exercise should specify custom progress",
          point,
          { type: "reuseTargetNotCustom", data: { section: "progress" } }
        );
      }
      const originalState = originalProgress.state;
      const state = progress.state;
      for (const stateKey of ObjectUtils_keys(originalState)) {
        const value = originalState[stateKey];
        if (state[key] != null && Weight_type(value) !== Weight_type(state[stateKey])) {
          throw PlannerSyntaxError.fromPoint(exercise.fullName, `Wrong type of state variable ${stateKey}`, point, {
            type: "reuseStateTypeMismatch",
            data: { stateKey }
          });
        }
      }
      const originalExercises = PlannerEvaluator_findOriginalExercisesAtWeekDay(
        settings,
        fullName,
        evaluatedWeeks,
        dayData.week,
        dayData.dayInWeek
      );
      const originalExercise = originalExercises[0]?.exercise;
      if (originalExercise?.reuse != null && (originalExercise.progress == null || originalExercise.progress.reuse != null)) {
        throw PlannerSyntaxError.fromPoint(
          exercise.fullName,
          `Original exercise '${originalExercise.fullName}' should not reuse other exercise`,
          point,
          { type: "reuseChained", data: { section: "progress" } }
        );
      }
      progress.reuse.exercise = originalExercise;
    }
  }
}
function PlannerEvaluator_checkUpdateScript(exercise, settings, dayData) {
  const update = exercise.update;
  if (update?.type === "custom") {
    const { script, liftoscriptNode } = update;
    if (script && liftoscriptNode) {
      const exerciseType = PlannerProgramExercise_getExercise(exercise, settings);
      const state = PlannerProgramExercise_getState(exercise);
      const liftoscriptEvaluator = new ScriptRunner(
        script,
        state,
        {},
        Progress_createEmptyScriptBindings(dayData, settings),
        Progress_createScriptFunctions(settings),
        settings.units,
        { exerciseType, unit: settings.units, prints: [] },
        "update"
      );
      try {
        liftoscriptEvaluator.parse();
      } catch (e) {
        if (e instanceof LiftoscriptSyntaxError && liftoscriptNode) {
          const [line] = PlannerExerciseEvaluator.getLineAndOffset(script, liftoscriptNode);
          throw new PlannerSyntaxError(
            e.message,
            line + e.line,
            e.offset,
            liftoscriptNode.from + e.from,
            liftoscriptNode.from + e.to,
            e.details
          );
        } else {
          throw e;
        }
      }
    }
  }
}
function PlannerEvaluator_fillUpdateReuses(evaluatedWeeks, exercise, settings, metadata2) {
  const update = exercise.update;
  if (update?.type === "custom") {
    const fullName = update.reuse?.fullName;
    if (update.reuse && fullName) {
      const key = PlannerKey_fromFullName(fullName, settings.exercises);
      const point = exercise.points.updatePoint || exercise.points.fullName;
      if (metadata2.byExerciseWeekDay[key] == null) {
        throw PlannerSyntaxError.fromPoint(exercise.fullName, `No such exercise ${fullName}`, point, {
          type: "reuseTargetNotFound",
          data: { fullName }
        });
      }
      const originalProperty = metadata2.properties.update[key];
      const originalUpdate = originalProperty?.property;
      const dayData = originalProperty?.dayData;
      if (!originalUpdate || !dayData) {
        throw PlannerSyntaxError.fromPoint(exercise.fullName, "Original exercise should specify update", point, {
          type: "reuseTargetMissingSection",
          data: { section: "update" }
        });
      }
      if (originalUpdate === update) {
        throw PlannerSyntaxError.fromPoint(exercise.fullName, `Exercise cannot reuse its own update`, point, {
          type: "reuseSelf",
          data: { section: "update" }
        });
      }
      if (originalUpdate.reuse?.fullName != null) {
        const originalReuseKey = PlannerKey_fromFullName(originalUpdate.reuse.fullName, settings.exercises);
        if (!metadata2.notused.has(originalReuseKey)) {
          throw PlannerSyntaxError.fromPoint(
            exercise.fullName,
            `Original exercise cannot reuse another update`,
            point,
            {
              type: "reuseChained",
              data: { section: "update" }
            }
          );
        }
      }
      if (originalUpdate.type !== "custom") {
        throw PlannerSyntaxError.fromPoint(exercise.fullName, "Original exercise should specify custom update", point, {
          type: "reuseTargetNotCustom",
          data: { section: "update" }
        });
      }
      const stateKeys = originalUpdate.meta?.stateKeys || /* @__PURE__ */ new Set();
      if (stateKeys.size !== 0) {
        const progress = exercise.progress;
        if (progress == null) {
          throw PlannerSyntaxError.fromPoint(
            exercise.fullName,
            "If 'update' block uses state variables, exercise should define them in 'progress' block",
            point,
            { type: "updateStateWithoutProgress" }
          );
        }
        const state = PlannerProgramExercise_getState(exercise);
        for (const stateKey of stateKeys) {
          if (state[stateKey] == null) {
            throw PlannerSyntaxError.fromPoint(
              exercise.fullName,
              `Missing state variable ${stateKey} that's used in the original update block`,
              point,
              { type: "reuseMissingStateVariable", data: { stateKey } }
            );
          }
        }
      }
      const originalExercises = PlannerEvaluator_findOriginalExercisesAtWeekDay(
        settings,
        fullName,
        evaluatedWeeks,
        dayData.week,
        dayData.dayInWeek
      );
      const originalExercise = originalExercises[0]?.exercise;
      if (originalExercise?.reuse != null && (originalExercise.update == null || originalExercise.update.reuse != null)) {
        throw PlannerSyntaxError.fromPoint(
          exercise.fullName,
          `Original exercise '${originalExercise.fullName}' should not reuse other exercise`,
          point,
          { type: "reuseChained", data: { section: "update" } }
        );
      }
      update.reuse.exercise = originalExercise;
    }
  }
}
function PlannerEvaluator_checkReuseLoops(exercise) {
  const seen = /* @__PURE__ */ new Set();
  let current = exercise;
  while (current != null && !(current.progress != null && current.progress.reuse == null)) {
    if (seen.has(current)) {
      throw PlannerSyntaxError.fromPoint(
        exercise.fullName,
        `This exercise ends up reusing itself through other exercises`,
        exercise.points.progressPoint || exercise.points.reuseSetPoint || exercise.points.fullName,
        { type: "reuseCycle" }
      );
    }
    seen.add(current);
    current = current.progress?.reuse?.exercise ?? current.reuse?.exercise;
  }
}
function PlannerEvaluator_checkReusesResolve(exercise) {
  if (exercise.progress?.type === "custom" && PlannerProgramExercise_getProgressScript(exercise) == null) {
    throw PlannerSyntaxError.fromPoint(
      exercise.fullName,
      `Couldn't find the progress script this reuses - reuse the exercise that defines it instead`,
      exercise.points.progressPoint || exercise.points.fullName,
      { type: "reuseScriptNotFound", data: { section: "progress" } }
    );
  }
  if (exercise.update != null && PlannerProgramExercise_getUpdateScript(exercise) == null) {
    throw PlannerSyntaxError.fromPoint(
      exercise.fullName,
      `Couldn't find the update script this reuses - reuse the exercise that defines it instead`,
      exercise.points.updatePoint || exercise.points.fullName,
      { type: "reuseScriptNotFound", data: { section: "update" } }
    );
  }
}
function PlannerEvaluator_postProcess(evaluatedWeeks, settings, metadata2) {
  PlannerEvaluator_iterateOverExercises(
    evaluatedWeeks,
    (weekIndex, dayInWeekIndex, dayIndex, exerciseIndex, exercise) => {
      PlannerEvaluator_fillDescriptions(exercise, evaluatedWeeks, weekIndex, dayInWeekIndex);
      PlannerEvaluator_fillRepeats(exercise, evaluatedWeeks, dayInWeekIndex, metadata2.byExerciseWeekDay);
      PlannerEvaluator_fillSingleProperties(exercise, metadata2);
      PlannerEvaluator_checkUnknownExercises(exercise, metadata2);
    }
  );
  PlannerEvaluator_iterateOverExercises(
    evaluatedWeeks,
    (weekIndex, dayInWeekIndex, dayIndex, exerciseIndex, exercise) => {
      PlannerEvaluator_fillSetReuses(exercise, evaluatedWeeks, weekIndex, settings, metadata2);
      PlannerEvaluator_fillDescriptionReuses(exercise, weekIndex, metadata2.byExerciseWeekDay, settings);
      PlannerEvaluator_fillProgressReuses(evaluatedWeeks, exercise, settings, metadata2);
      PlannerEvaluator_fillUpdateReuses(evaluatedWeeks, exercise, settings, metadata2);
      PlannerEvaluator_checkUpdateScript(exercise, settings, {
        week: weekIndex + 1,
        dayInWeek: dayInWeekIndex + 1,
        day: dayInWeekIndex + 1
      });
    }
  );
  PlannerEvaluator_iterateOverExercises(evaluatedWeeks, (_weekIndex, _dayInWeekIndex, _dayIndex, _index, exercise) => {
    PlannerEvaluator_checkReuseLoops(exercise);
    PlannerEvaluator_checkReusesResolve(exercise);
  });
  for (const week of evaluatedWeeks) {
    for (const day of week) {
      if (day.success) {
        day.data.sort(PlannerEvaluator_compareExerciseOrder);
      }
    }
  }
  PlannerEvaluator_iterateOverExercises(
    evaluatedWeeks,
    (weekIndex, dayInWeekIndex, dayIndex, exerciseIndex, exercise) => {
      PlannerEvaluator_fillEvaluatedSetVariations(exercise);
    }
  );
}
function PlannerEvaluator_checkUnknownExercises(exercise, metadata2) {
  if (metadata2.notused.has(exercise.key)) {
    return;
  }
  const variations = exercise.exerciseVariations;
  if (variations != null && variations.length > 1) {
    for (const variation of variations) {
      if (variation.exerciseType == null) {
        throw PlannerSyntaxError.fromPoint(
          exercise.fullName,
          `Unknown exercise ${variation.name}`,
          exercise.points.fullName,
          { type: "unknownExercise", data: { name: variation.name } }
        );
      }
    }
  } else if (exercise.exerciseType == null) {
    throw PlannerSyntaxError.fromPoint(
      exercise.fullName,
      `Unknown exercise ${exercise.name}`,
      exercise.points.fullName,
      { type: "unknownExercise", data: { name: exercise.name } }
    );
  }
}
function PlannerEvaluator_findReusedDescriptions(reusingName, currentWeekIndex, byExerciseWeekDay, settings) {
  const weekDayMatch = reusingName.match(/\[([^]+)\]/);
  let weekIndex;
  let dayIndex;
  if (weekDayMatch != null) {
    const [dayOrWeekStr, dayStr] = weekDayMatch[1].split(":");
    if (dayStr != null) {
      weekIndex = parseInt(dayOrWeekStr, 10);
      weekIndex = isNaN(weekIndex) ? void 0 : weekIndex - 1;
      dayIndex = parseInt(dayStr, 10);
      dayIndex = isNaN(dayIndex) ? void 0 : dayIndex - 1;
    } else {
      dayIndex = parseInt(dayOrWeekStr, 10);
      dayIndex = isNaN(dayIndex) ? void 0 : dayIndex - 1;
    }
  }
  reusingName = reusingName.replace(/\[([^]+)\]/, "").trim();
  const key = PlannerKey_fromFullName(reusingName, settings.exercises);
  const weekExercises = ObjectUtils_values(byExerciseWeekDay[key]?.[weekIndex ?? currentWeekIndex] || []);
  const weekDescriptions = weekExercises.map((d) => d.descriptions);
  const index = dayIndex ?? 0;
  if (weekDescriptions[index]) {
    return { descriptions: weekDescriptions[index], exercise: weekExercises[index] };
  } else {
    return void 0;
  }
}
function PlannerEvaluator_findOriginalExercisesAtWeekDay(settings, fullName, program, atWeek, atDay) {
  const originalExercises = [];
  const week = program[atWeek - 1];
  if (week == null) {
    return originalExercises;
  }
  const candidateDays = atDay != null ? [week[atDay - 1]] : week;
  const originalKey = PlannerKey_fromFullName(fullName, settings.exercises);
  for (let dayInWeekIndex = 0; dayInWeekIndex < candidateDays.length; dayInWeekIndex += 1) {
    const day = candidateDays[dayInWeekIndex];
    if (day == null || !day.success) {
      continue;
    }
    for (const exercise of day.data) {
      const reusingKey = PlannerKey_fromPlannerExercise(exercise, settings);
      if (reusingKey === originalKey) {
        originalExercises.push({
          exercise,
          dayData: {
            week: atWeek,
            dayInWeek: dayInWeekIndex + 1,
            day: 1
          }
        });
      }
    }
  }
  return originalExercises;
}
function PlannerEvaluator_findLastWeekExercise(program, weekIndex, dayIndex, exercise, cond) {
  for (let i = weekIndex - 1, lastWeekDay = program[i]?.[dayIndex]; i >= 0 && lastWeekDay != null; i -= 1, lastWeekDay = program[i]?.[dayIndex]) {
    if (lastWeekDay.success) {
      const lastWeekExercise = lastWeekDay.data.find((ex) => ex.key === exercise.key);
      if (lastWeekExercise != null && (cond == null || cond(lastWeekExercise))) {
        return lastWeekExercise;
      }
    }
  }
  return void 0;
}
function PlannerEvaluator_setByExerciseWeekDay(coll, exercise, weekIndex, dayIndex, val) {
  coll[exercise] = coll[exercise] || {};
  coll[exercise][weekIndex] = coll[exercise][weekIndex] || {};
  coll[exercise][weekIndex][dayIndex] = val;
}
function PlannerEvaluator_setByWeekDayExercise(coll, exercise, weekIndex, dayIndex, val) {
  coll[weekIndex] = coll[weekIndex] || {};
  coll[weekIndex][dayIndex] = coll[weekIndex][dayIndex] || {};
  coll[weekIndex][dayIndex][exercise] = val;
}
function PlannerEvaluator_iterateOverExercises(program, cb) {
  let dayIndex = 0;
  for (let weekIndex = 0; weekIndex < program.length; weekIndex += 1) {
    const week = program[weekIndex];
    for (let dayInWeekIndex = 0; dayInWeekIndex < week.length; dayInWeekIndex += 1) {
      const day = week[dayInWeekIndex];
      try {
        if (day?.success) {
          const exercises = day.data;
          for (let exerciseIndex = 0; exerciseIndex < exercises.length; exerciseIndex += 1) {
            cb(weekIndex, dayInWeekIndex, dayIndex, exerciseIndex, exercises[exerciseIndex]);
          }
        }
      } catch (e) {
        if (e instanceof PlannerSyntaxError) {
          week[dayInWeekIndex] = { success: false, error: e };
        } else {
          throw e;
        }
      }
      dayIndex += 1;
    }
  }
}
var PlannerEvaluator_forceEvaluate = (plannerProgram, settings) => {
  const { evaluatedWeeks, metadata: metadata2 } = PlannerEvaluator_getPerDayEvaluatedWeeks(plannerProgram, settings);
  PlannerEvaluator_postProcess(evaluatedWeeks, settings, metadata2);
  return { evaluatedWeeks, exerciseFullNames: Array.from(metadata2.fullNames) };
};
var PlannerEvaluator_evaluate = (0, import_micro_memoize4.default)(PlannerEvaluator_forceEvaluate, {
  maxSize: 10,
  isEqual: (a, b) => {
    if (a == null || b == null) {
      return a === b;
    }
    if ("weeks" in a && "weeks" in b) {
      const aText = PlannerProgram_generateFullText(a.weeks);
      const bText = PlannerProgram_generateFullText(b.weeks);
      return aText === bText;
    } else {
      return a === b;
    }
  }
});

// third-party/liftosaur/upstream/src/models/equipmentLegacyDefaults.ts
function EquipmentLegacyDefaults_all() {
  return {
    barbell: {
      vtype: "equipment_data",
      multiplier: 2,
      bar: {
        lb: Weight_build(45, "lb"),
        kg: Weight_build(20, "kg")
      },
      plates: [
        { weight: Weight_build(45, "lb"), num: 8 },
        { weight: Weight_build(25, "lb"), num: 4 },
        { weight: Weight_build(10, "lb"), num: 4 },
        { weight: Weight_build(5, "lb"), num: 4 },
        { weight: Weight_build(2.5, "lb"), num: 4 },
        { weight: Weight_build(1.25, "lb"), num: 2 },
        { weight: Weight_build(20, "kg"), num: 8 },
        { weight: Weight_build(10, "kg"), num: 4 },
        { weight: Weight_build(5, "kg"), num: 4 },
        { weight: Weight_build(2.5, "kg"), num: 4 },
        { weight: Weight_build(1.25, "kg"), num: 4 },
        { weight: Weight_build(0.5, "kg"), num: 2 }
      ],
      fixed: [],
      isFixed: false
    },
    trapbar: {
      vtype: "equipment_data",
      multiplier: 2,
      bar: {
        lb: Weight_build(45, "lb"),
        kg: Weight_build(20, "kg")
      },
      plates: [
        { weight: Weight_build(45, "lb"), num: 8 },
        { weight: Weight_build(25, "lb"), num: 4 },
        { weight: Weight_build(10, "lb"), num: 4 },
        { weight: Weight_build(5, "lb"), num: 4 },
        { weight: Weight_build(2.5, "lb"), num: 4 },
        { weight: Weight_build(1.25, "lb"), num: 2 },
        { weight: Weight_build(20, "kg"), num: 8 },
        { weight: Weight_build(10, "kg"), num: 4 },
        { weight: Weight_build(5, "kg"), num: 4 },
        { weight: Weight_build(2.5, "kg"), num: 4 },
        { weight: Weight_build(1.25, "kg"), num: 4 },
        { weight: Weight_build(0.5, "kg"), num: 2 }
      ],
      fixed: [],
      isFixed: false
    },
    leverageMachine: {
      vtype: "equipment_data",
      multiplier: 1,
      bar: {
        lb: Weight_build(0, "lb"),
        kg: Weight_build(0, "kg")
      },
      plates: [
        { weight: Weight_build(45, "lb"), num: 8 },
        { weight: Weight_build(25, "lb"), num: 4 },
        { weight: Weight_build(10, "lb"), num: 4 },
        { weight: Weight_build(5, "lb"), num: 4 },
        { weight: Weight_build(2.5, "lb"), num: 4 },
        { weight: Weight_build(1.25, "lb"), num: 2 },
        { weight: Weight_build(20, "kg"), num: 8 },
        { weight: Weight_build(10, "kg"), num: 4 },
        { weight: Weight_build(5, "kg"), num: 4 },
        { weight: Weight_build(2.5, "kg"), num: 4 },
        { weight: Weight_build(1.25, "kg"), num: 4 },
        { weight: Weight_build(0.5, "kg"), num: 2 }
      ],
      fixed: [],
      isFixed: false
    },
    smith: {
      vtype: "equipment_data",
      multiplier: 2,
      bar: {
        lb: Weight_build(45, "lb"),
        kg: Weight_build(20, "kg")
      },
      plates: [
        { weight: Weight_build(45, "lb"), num: 8 },
        { weight: Weight_build(25, "lb"), num: 4 },
        { weight: Weight_build(10, "lb"), num: 4 },
        { weight: Weight_build(5, "lb"), num: 4 },
        { weight: Weight_build(2.5, "lb"), num: 4 },
        { weight: Weight_build(1.25, "lb"), num: 2 },
        { weight: Weight_build(20, "kg"), num: 8 },
        { weight: Weight_build(10, "kg"), num: 4 },
        { weight: Weight_build(5, "kg"), num: 4 },
        { weight: Weight_build(2.5, "kg"), num: 4 },
        { weight: Weight_build(1.25, "kg"), num: 4 },
        { weight: Weight_build(0.5, "kg"), num: 2 }
      ],
      fixed: [],
      isFixed: false
    },
    dumbbell: {
      vtype: "equipment_data",
      multiplier: 2,
      bar: {
        lb: Weight_build(10, "lb"),
        kg: Weight_build(5, "kg")
      },
      plates: [
        { weight: Weight_build(10, "lb"), num: 8 },
        { weight: Weight_build(5, "lb"), num: 4 },
        { weight: Weight_build(2.5, "lb"), num: 4 },
        { weight: Weight_build(1.25, "lb"), num: 2 },
        { weight: Weight_build(5, "kg"), num: 8 },
        { weight: Weight_build(2.5, "kg"), num: 4 },
        { weight: Weight_build(1.25, "kg"), num: 4 },
        { weight: Weight_build(0.5, "kg"), num: 2 }
      ],
      fixed: [
        Weight_build(10, "lb"),
        Weight_build(15, "lb"),
        Weight_build(20, "lb"),
        Weight_build(25, "lb"),
        Weight_build(30, "lb"),
        Weight_build(35, "lb"),
        Weight_build(40, "lb"),
        Weight_build(4, "kg"),
        Weight_build(6, "kg"),
        Weight_build(8, "kg"),
        Weight_build(10, "kg"),
        Weight_build(12, "kg"),
        Weight_build(14, "kg"),
        Weight_build(20, "kg")
      ],
      isFixed: false
    },
    ezbar: {
      vtype: "equipment_data",
      multiplier: 2,
      bar: {
        lb: Weight_build(20, "lb"),
        kg: Weight_build(10, "kg")
      },
      plates: [
        { weight: Weight_build(45, "lb"), num: 8 },
        { weight: Weight_build(25, "lb"), num: 4 },
        { weight: Weight_build(10, "lb"), num: 4 },
        { weight: Weight_build(5, "lb"), num: 4 },
        { weight: Weight_build(2.5, "lb"), num: 4 },
        { weight: Weight_build(1.25, "lb"), num: 2 },
        { weight: Weight_build(20, "kg"), num: 8 },
        { weight: Weight_build(10, "kg"), num: 4 },
        { weight: Weight_build(5, "kg"), num: 4 },
        { weight: Weight_build(2.5, "kg"), num: 4 },
        { weight: Weight_build(1.25, "kg"), num: 4 },
        { weight: Weight_build(0.5, "kg"), num: 2 }
      ],
      fixed: [],
      isFixed: false
    },
    cable: {
      vtype: "equipment_data",
      multiplier: 1,
      bar: {
        lb: Weight_build(0, "lb"),
        kg: Weight_build(0, "kg")
      },
      plates: [
        {
          weight: Weight_build(10, "lb"),
          num: 20
        },
        {
          weight: Weight_build(5, "lb"),
          num: 10
        },
        {
          weight: Weight_build(5, "kg"),
          num: 20
        },
        {
          weight: Weight_build(2.5, "kg"),
          num: 10
        }
      ],
      fixed: [],
      isFixed: false
    },
    kettlebell: {
      vtype: "equipment_data",
      multiplier: 1,
      bar: {
        lb: Weight_build(0, "lb"),
        kg: Weight_build(0, "kg")
      },
      plates: [],
      fixed: [
        Weight_build(10, "lb"),
        Weight_build(15, "lb"),
        Weight_build(20, "lb"),
        Weight_build(25, "lb"),
        Weight_build(30, "lb"),
        Weight_build(35, "lb"),
        Weight_build(40, "lb"),
        Weight_build(4, "kg"),
        Weight_build(8, "kg"),
        Weight_build(12, "kg"),
        Weight_build(16, "kg"),
        Weight_build(24, "kg")
      ],
      isFixed: true
    }
  };
}

// third-party/liftosaur/upstream/src/models/equipmentDefaults.ts
function typedSetup(key, legacy, unit) {
  switch (key) {
    case "dumbbell":
      return {
        type: "fixed",
        unit,
        ranges: unit === "lb" ? [{ from: 5, to: 100, step: 5 }] : [
          { from: 2, to: 10, step: 2 },
          { from: 12.5, to: 50, step: 2.5 }
        ],
        values: []
      };
    case "cable":
      return EquipmentSetupEdit_default("stack", unit);
    case "band": {
      const bands = EquipmentSetupEdit_default("bands", unit);
      return bands.type === "bands" ? { ...bands, combine: true } : bands;
    }
    default:
      return EquipmentSetup_fromLegacy(legacy, unit);
  }
}
function legacyWithBand() {
  return { ...EquipmentLegacyDefaults_all(), band: Equipment_build("") };
}
function EquipmentDefaults_build(unit) {
  const result = {};
  for (const [key, legacy] of Object.entries(legacyWithBand())) {
    if (legacy != null) {
      result[key] = EquipmentSetup_save({ ...legacy, name: void 0 }, typedSetup(key, legacy, unit));
    }
  }
  return result;
}

// third-party/liftosaur/upstream/src/models/settings.ts
var import_lens_shmens3 = __toESM(require_dist());

// third-party/liftosaur/upstream/src/models/muscleRangePresets.ts
var presetRanges = {
  low: [4, 10],
  moderate: [10, 18],
  high: [18, 30]
};
var maxSetsPerSession = 11;
var minFrequency = 2;
function MuscleRangePresets_range(preset) {
  const [min2, max2] = presetRanges[preset];
  return [min2, max2];
}
function MuscleRangePresets_frequency(maxWeeklySets) {
  return Math.max(minFrequency, Math.ceil(maxWeeklySets / maxSetsPerSession));
}
function MuscleRangePresets_apply(planner, preset) {
  const range = MuscleRangePresets_range(preset);
  const frequency = MuscleRangePresets_frequency(range[1]);
  const weeklyRangeSets = { ...planner.weeklyRangeSets };
  const weeklyFrequency = { ...planner.weeklyFrequency };
  for (const muscleGroup of Muscle_groupsWithDefaultRange) {
    weeklyRangeSets[muscleGroup] = [range[0], range[1]];
    weeklyFrequency[muscleGroup] = frequency;
  }
  return { ...planner, weeklyRangeSets, weeklyFrequency };
}

// third-party/liftosaur/upstream/src/models/settings.ts
function Settings_programContentBuild() {
  return {
    timers: {
      warmup: 90,
      workout: 180,
      reminder: 900,
      getReady: 5
    },
    units: "lb",
    planner: Settings_buildPlannerSettings()
  };
}
function Settings_build(units2 = "lb") {
  return {
    ...Settings_programContentBuild(),
    units: units2,
    graphsSettings: {
      isSameXAxis: false,
      isWithBodyweight: false,
      isWithOneRm: true
    },
    exerciseData: {},
    graphOptions: {},
    exerciseStatsSettings: {
      ascendingSort: false
    },
    gyms: [
      {
        vtype: "gym",
        id: "default",
        name: "Main",
        equipment: EquipmentDefaults_build(units2)
      }
    ],
    // Builds before 2026-09-26 require deletedGyms in VSettings. Drop with its removal migration.
    deletedGyms: [],
    volume: 1,
    vibration: false,
    startWeekFromMonday: false,
    lengthUnits: "in",
    workoutSettings: {
      targetType: "target"
    },
    statsEnabled: { weight: { weight: true }, length: {}, percentage: {} },
    exercises: {},
    graphs: { graphs: [], vtype: "graphs" },
    planner: Settings_buildPlannerSettings(),
    muscleGroups: {
      vtype: "muscle_groups_settings",
      data: {}
    }
  };
}
function Settings_buildPlannerSettings() {
  const planner = MuscleRangePresets_apply(
    {
      strengthSetsPct: 30,
      hypertrophySetsPct: 70,
      weeklyRangeSets: {},
      weeklyFrequency: {},
      synergistMultiplier: 0.5
    },
    "moderate"
  );
  return {
    ...planner,
    weeklyRangeSets: { ...planner.weeklyRangeSets, shoulders: [10, 12], back: [10, 12], forearms: [10, 12] },
    weeklyFrequency: { ...planner.weeklyFrequency, shoulders: 2, back: 2, forearms: 2 }
  };
}

// third-party/liftosaur/upstream/src/pages/planner/models/plannerProgram.ts
function PlannerProgram_replaceWeight(program, programExerciseId, weightChanges) {
  if (weightChanges.every((wc) => ObjectUtils_isEqual(wc.originalWeight, wc.weight))) {
    return program;
  }
  const newEvalutedProgram = ObjectUtils_clone(program);
  PP_iterate2(newEvalutedProgram.weeks, (ex) => {
    if (ex.key === programExerciseId) {
      for (const setVariation of ex.evaluatedSetVariations) {
        for (const set of setVariation.sets) {
          const weightChange = weightChanges.find((wc) => Weight_eqNull(wc.originalWeight, set.weight));
          if (weightChange != null) {
            set.weight = weightChange.weight;
          }
        }
      }
    }
  });
  return newEvalutedProgram;
}
function PlannerProgram_compact(oldPlannerProgram, plannerProgram, settings, additionalRepeatingExercises, renameMapping) {
  let dayIndex = 0;
  const repeatingExercises = /* @__PURE__ */ new Set();
  const { evaluatedWeeks } = PlannerProgram_evaluate(ObjectUtils_clone(oldPlannerProgram), settings);
  const { evaluatedWeeks: newEvaluatedWeeks } = PlannerProgram_evaluate(ObjectUtils_clone(plannerProgram), settings);
  for (const ev of [evaluatedWeeks, newEvaluatedWeeks]) {
    PP_iterate(ev, (exercise) => {
      if (exercise.repeat != null && exercise.repeat.length > 0) {
        repeatingExercises.add(exercise.key);
      }
    });
  }
  for (const ex of additionalRepeatingExercises || []) {
    repeatingExercises.add(ex);
  }
  const declaringWeekIndexes = {};
  PP_iterate(evaluatedWeeks, (exercise, weekIndex, dayInWeekIndex) => {
    if (!exercise.isRepeat && exercise.repeat != null && exercise.repeat.length > 0) {
      const declaringKey = `${exercise.key}_${dayInWeekIndex}`;
      declaringWeekIndexes[declaringKey] = declaringWeekIndexes[declaringKey] || /* @__PURE__ */ new Set();
      declaringWeekIndexes[declaringKey].add(weekIndex);
    }
  });
  function oldKeyFor(value, weekIndex, dayInWeekIndex) {
    if (!renameMapping) {
      return value;
    }
    const beforeRenaming = ObjectUtils_findKeyByExpression(
      renameMapping,
      (_, v) => v.to === value && (v.dayData == null || v.dayData.week === weekIndex + 1 && v.dayData.dayInWeek === dayInWeekIndex + 1)
    );
    return beforeRenaming ?? value;
  }
  const lastDescriptions = {};
  plannerProgram.weeks.forEach((week) => {
    week.days.forEach((day, dayInWeekIndex) => {
      if (lastDescriptions[dayInWeekIndex] == null) {
        lastDescriptions[dayInWeekIndex] = day.description;
      } else if (lastDescriptions[dayInWeekIndex] === day.description) {
        day.description = void 0;
      } else {
        lastDescriptions[dayInWeekIndex] = day.description;
      }
    });
  });
  const mapping = plannerProgram.weeks.map((week, weekIndex) => {
    return week.days.map((day, dayInWeekIndex) => {
      const tree = parser2.parse(day.exerciseText);
      const evaluator = new PlannerExerciseEvaluator(day.exerciseText, settings, "perday", {
        day: dayIndex + 1,
        dayInWeek: dayInWeekIndex + 1,
        week: weekIndex + 1
      });
      dayIndex += 1;
      const map = evaluator.topLineMap(tree.topNode);
      return map;
    });
  });
  for (const declaringPass of [true, false]) {
    for (let weekIndex = 0; weekIndex < mapping.length; weekIndex += 1) {
      const week = mapping[weekIndex];
      for (dayIndex = 0; dayIndex < week.length; dayIndex += 1) {
        const day = week[dayIndex];
        for (const line of day) {
          if (line.type !== "exercise" || line.used || !repeatingExercises.has(line.value)) {
            continue;
          }
          const declaringWeeks = declaringWeekIndexes[`${oldKeyFor(line.value, weekIndex, dayIndex)}_${dayIndex}`];
          if (!!declaringWeeks?.has(weekIndex) !== declaringPass) {
            continue;
          }
          const claimWeek = (repeatWeekIndex) => {
            const repeatDay = mapping[repeatWeekIndex]?.[dayIndex];
            const repeatedExercises = (repeatDay || []).filter((e) => {
              if (e.type !== "exercise" || e.used || e.value !== line.value || e.sectionsToReuse !== line.sectionsToReuse || e.exerciseIndex !== line.exerciseIndex || !ObjectUtils_isEqual(e.descriptions || [], line.descriptions || [])) {
                return false;
              }
              const oldKey = oldKeyFor(line.value, repeatWeekIndex, dayIndex);
              if (declaringWeekIndexes[`${oldKey}_${dayIndex}`]?.has(repeatWeekIndex)) {
                return false;
              }
              const oldDay = evaluatedWeeks[repeatWeekIndex][dayIndex];
              const oldExercise = oldDay.success ? oldDay.data.find((ex) => ex.key === oldKey) : void 0;
              return oldExercise?.repeating?.includes(weekIndex + 1);
            });
            for (const e of repeatedExercises) {
              e.used = true;
            }
            return repeatedExercises.length > 0;
          };
          let firstWeek = weekIndex + 1;
          let lastWeek = weekIndex + 1;
          for (let repeatWeekIndex = weekIndex + 1; repeatWeekIndex < mapping.length; repeatWeekIndex += 1) {
            if (!claimWeek(repeatWeekIndex)) {
              break;
            }
            lastWeek = repeatWeekIndex + 1;
          }
          if (declaringPass) {
            for (let repeatWeekIndex = weekIndex - 1; repeatWeekIndex >= 0; repeatWeekIndex -= 1) {
              if (!claimWeek(repeatWeekIndex)) {
                break;
              }
              firstWeek = repeatWeekIndex + 1;
            }
          }
          line.repeatRanges = firstWeek === lastWeek ? [] : [`${firstWeek}-${lastWeek}`];
        }
      }
    }
  }
  for (let weekIndex = 0; weekIndex < mapping.length; weekIndex += 1) {
    const programWeek = plannerProgram.weeks[weekIndex];
    const week = mapping[weekIndex];
    for (dayIndex = 0; dayIndex < week.length; dayIndex += 1) {
      const day = week[dayIndex];
      const programDay = programWeek.days[dayIndex];
      let str = "";
      let ongoingDescriptions = false;
      for (const line of day) {
        if (line.type === "description") {
          ongoingDescriptions = true;
        } else if (line.type === "exercise") {
          ongoingDescriptions = false;
          if (!line.used) {
            if (line.descriptions && line.descriptions.length > 0) {
              str += `${line.descriptions.filter((d) => d.trim()).join("\n\n")}
`;
            }
            let repeatStr = "";
            if (line.order != null && line.order !== 0 || line.repeatRanges && line.repeatRanges.length > 0) {
              const repeatParts = [];
              if (line.order != null && line.order !== 0) {
                repeatParts.push(line.order);
              }
              if (line.repeatRanges && line.repeatRanges.length > 0) {
                repeatParts.push(line.repeatRanges.join(","));
              }
              repeatStr = `[${repeatParts.join(",")}]`;
            }
            str += [`${line.fullName}${repeatStr}`, line.sections].filter((r) => r).join(" / ") + `
`;
          }
        } else if (line.type === "empty") {
          if (!ongoingDescriptions) {
            str += line.value + "\n";
          }
        } else {
          str += line.value + "\n";
        }
      }
      programDay.exerciseText = str.trim();
    }
  }
  return plannerProgram;
}
function PlannerProgram_groupedTopLines(topLine) {
  const groupedTopLine = [];
  for (let weekIndex = 0; weekIndex < topLine.length; weekIndex += 1) {
    const topLineWeek = topLine[weekIndex];
    groupedTopLine.push([]);
    for (let dayInWeekIndex = 0; dayInWeekIndex < topLineWeek.length; dayInWeekIndex += 1) {
      const topLineDay = topLineWeek[dayInWeekIndex];
      const group = [];
      groupedTopLine[weekIndex].push(group);
      let reset = true;
      for (let lineIndex = 0; lineIndex < topLineDay.length; lineIndex += 1) {
        if (reset) {
          group.push([]);
          reset = false;
        }
        const line = topLineDay[lineIndex];
        group[group.length - 1] = group[group.length - 1] || [];
        group[group.length - 1].push(line);
        if (line.type === "exercise") {
          reset = true;
        }
      }
    }
  }
  for (const week of groupedTopLine) {
    for (const day of week) {
      day.sort((group1, group2) => {
        const ex1 = group1.find((l) => l.type === "exercise");
        const ex2 = group2.find((l) => l.type === "exercise");
        if (ex1 == null || ex2 == null) {
          return 0;
        }
        return PlannerEvaluator_compareExerciseOrder(ex1, ex2);
      });
    }
  }
  return groupedTopLine;
}
function PlannerProgram_topLineItems(plannerProgram, settings) {
  let dayIndex = 0;
  const mapping = plannerProgram.weeks.map((week, weekIndex) => {
    return week.days.map((day, dayInWeekIndex) => {
      const tree = parser2.parse(day.exerciseText);
      const evaluator = new PlannerExerciseEvaluator(day.exerciseText, settings, "perday", {
        day: dayIndex + 1,
        dayInWeek: dayInWeekIndex + 1,
        week: weekIndex + 1
      });
      dayIndex += 1;
      const map = evaluator.topLineMap(tree.topNode);
      return map;
    });
  });
  for (let weekIndex = 0; weekIndex < mapping.length; weekIndex += 1) {
    const week = mapping[weekIndex];
    for (dayIndex = 0; dayIndex < week.length; dayIndex += 1) {
      const day = week[dayIndex];
      for (const exercise of day) {
        for (const r of exercise.repeat || []) {
          const reuseDay = mapping[r - 1]?.[dayIndex];
          if (reuseDay && !reuseDay.some((e) => e.type === "exercise" && e.value === exercise.value)) {
            if (exercise.descriptions) {
              for (let di = 0; di < exercise.descriptions.length; di += 1) {
                if (di !== 0) {
                  reuseDay.push({ type: "empty", value: "" });
                }
                reuseDay.push({ type: "description", value: exercise.descriptions[di] });
              }
            }
            reuseDay.push({ ...exercise, repeat: void 0, isRepeat: true });
          }
        }
      }
    }
  }
  return mapping;
}
function PlannerProgram_evaluate(plannerProgram, settings) {
  return PlannerEvaluator_evaluate(plannerProgram, settings);
}
function PlannerProgram_evaluateText(fullProgramText) {
  const tree = parser2.parse(fullProgramText);
  return textWeeksToPlanner(new PlannerExerciseEvaluatorText(fullProgramText).evaluate(tree.topNode));
}
function textWeeksToPlanner(data) {
  const weeks = data.map((week) => {
    return {
      name: week.name,
      description: week.description,
      days: week.days.map((day) => {
        return {
          name: day.name,
          description: day.description,
          exerciseText: day.exercises.join("").trim()
        };
      })
    };
  });
  if (weeks.length === 0) {
    weeks.push({ name: "Week 1", days: [{ name: "Day 1", exerciseText: "" }] });
  }
  return weeks;
}
function PlannerProgram_generateFullText(weeks) {
  let fullText = "";
  for (const week of weeks) {
    if (week.description != null) {
      fullText += week.description.split("\n").map((l) => l ? `// ${l}` : "//").join("\n") + "\n";
    }
    fullText += `# ${week.name}
`;
    for (const day of week.days) {
      if (day.description != null) {
        fullText += day.description.split("\n").map((l) => `// ${l}`).join("\n") + "\n";
      }
      fullText += `## ${day.name}
`;
      fullText += `${day.exerciseText}

`;
    }
    fullText += "\n";
  }
  return fullText;
}

// third-party/liftosaur/upstream/src/models/programToPlanner.ts
var ProgramToPlanner = class _ProgramToPlanner {
  constructor(program, settings) {
    this.program = program;
    this.settings = settings;
  }
  getCurrentDescriptionExercise(key, weekIndex, dayInWeekIndex) {
    return this.program.weeks[weekIndex]?.days[dayInWeekIndex]?.exercises?.find((e) => e.key === key);
  }
  isInheritedDescription(exercise, weekIndex, dayInWeekIndex) {
    for (let i = weekIndex - 1; i >= 0; i -= 1) {
      const day = this.program.weeks[i]?.days[dayInWeekIndex];
      if (day == null) {
        return false;
      }
      const lastWeekExercise = day.exercises.find((e) => e.key === exercise.key);
      if (lastWeekExercise != null) {
        return exercise.descriptions.reuse?.fullName === lastWeekExercise.descriptions.reuse?.fullName && ObjectUtils_isEqual(exercise.descriptions.values, lastWeekExercise.descriptions.values);
      }
    }
    return false;
  }
  getCurrentDescriptionIndex(key, weekIndex, dayInWeekIndex) {
    const exercise = this.getCurrentDescriptionExercise(key, weekIndex, dayInWeekIndex);
    const descriptions = exercise?.descriptions.values || [];
    const index = descriptions.findIndex((s) => s.isCurrent);
    return index === -1 ? 0 : index;
  }
  shouldReuseSets(programExercise) {
    return !!programExercise.reuse;
  }
  getDereuseDecisions(programExercise) {
    const dereuseDecisions = /* @__PURE__ */ new Set();
    const reuseExercise = programExercise.reuse?.exercise;
    if (!reuseExercise) {
      return Array.from(dereuseDecisions);
    }
    const globals = this.getGlobals(programExercise);
    const reusedGlobals = this.getGlobals(reuseExercise);
    if (programExercise.evaluatedSetVariations.length !== reuseExercise.evaluatedSetVariations.length) {
      dereuseDecisions.add("sets");
    }
    if (PlannerProgramExercise_currentEvaluatedSetVariationIndex(programExercise) !== PlannerProgramExercise_currentEvaluatedSetVariationIndex(reuseExercise)) {
      dereuseDecisions.add("sets");
    }
    if (reuseExercise.progress != null || programExercise.progress != null) {
      if (programExercise.progress == null || programExercise.progress.type !== reuseExercise.progress?.type || (programExercise.progress.reuse ? programExercise.progress.reuse?.fullName !== reuseExercise.fullName : programExercise.progress.script !== reuseExercise.progress.script) || Object.keys(PlannerProgramExercise_getOnlyChangedState(programExercise)).length > 0) {
        dereuseDecisions.add("progress");
      }
    }
    if (reuseExercise.update != null || programExercise.update != null) {
      if (programExercise.update == null || (programExercise.update.reuse ? programExercise.update.reuse?.fullName !== reuseExercise.fullName : programExercise.update.script !== reuseExercise.update?.script)) {
        dereuseDecisions.add("update");
      }
    }
    if (programExercise.evaluatedSetVariations.length === reuseExercise.evaluatedSetVariations.length) {
      for (let i = 0; i < programExercise.evaluatedSetVariations.length; i += 1) {
        const programVariation = programExercise.evaluatedSetVariations[i];
        const reuseVariation = reuseExercise.evaluatedSetVariations[i];
        if (programVariation.sets.length !== reuseVariation.sets.length) {
          dereuseDecisions.add("sets");
        }
        for (let j = 0; j < programVariation.sets.length; j += 1) {
          const programSet = programVariation.sets[j];
          const reuseSet = reuseVariation.sets[j];
          if (programSet.maxrep !== reuseSet?.maxrep || programSet.minrep !== reuseSet?.minrep) {
            dereuseDecisions.add("sets");
          }
          if (reuseSet ? !Weight_eqNull(programSet.weight, reuseSet.weight) || programSet.askWeight !== reuseSet.askWeight : !Weight_eq(globals.weight || Weight_zero, reusedGlobals.weight || Weight_zero) || globals.askWeight !== reusedGlobals.askWeight) {
            if (globals.weight != null) {
              dereuseDecisions.add("weight");
            } else {
              dereuseDecisions.add("sets");
            }
          }
          if (reuseSet ? programSet.rpe !== reuseSet.rpe || programSet.logRpe !== reuseSet.logRpe : globals.rpe !== reusedGlobals.rpe || globals.logRpe !== reusedGlobals.logRpe) {
            if (globals.rpe != null) {
              dereuseDecisions.add("rpe");
            } else {
              dereuseDecisions.add("sets");
            }
          }
          if (reuseSet ? programSet.timer !== reuseSet.timer : globals.timer !== reusedGlobals.timer) {
            if (globals.timer != null) {
              dereuseDecisions.add("timer");
            } else {
              dereuseDecisions.add("sets");
            }
          }
          if (programSet.setTimer !== reuseSet?.setTimer || !!programSet.isOverflowSetTimer !== !!reuseSet?.isOverflowSetTimer) {
            if (globals.setTimer != null) {
              dereuseDecisions.add("setTimer");
            } else {
              dereuseDecisions.add("sets");
            }
          }
        }
      }
    }
    return Array.from(dereuseDecisions);
  }
  reorderGroupedTopLine(groupedTopLine, reorders) {
    if (!reorders) {
      return groupedTopLine;
    }
    for (const reorder of reorders) {
      const groupedDay = groupedTopLine[reorder.dayData.week - 1]?.[reorder.dayData.dayInWeek - 1];
      if (groupedDay) {
        const indexMap = groupedDay.reduce(
          ({ result, i }, group, index) => {
            const exercise = group.find((item) => item.type === "exercise");
            if (exercise && !exercise.notused) {
              result[i] = index;
              i += 1;
            }
            return { result, i };
          },
          { result: {}, i: 0 }
        ).result;
        const from = groupedDay[indexMap[reorder.fromIndex]];
        if (from) {
          groupedDay.splice(indexMap[reorder.fromIndex], 1);
          groupedDay.splice(indexMap[reorder.toIndex], 0, from);
        }
      }
    }
    return groupedTopLine;
  }
  addGroupedTopLine(groupedTopLine, adds) {
    if (!adds) {
      return groupedTopLine;
    }
    for (const add of adds) {
      const groupedDay = groupedTopLine[add.dayData.week - 1]?.[add.dayData.dayInWeek - 1];
      if (groupedDay) {
        groupedDay.splice(add.index, 0, [
          { type: "exercise", value: PlannerKey_fromFullName(add.fullName, this.settings.exercises) }
        ]);
      }
    }
    return groupedTopLine;
  }
  getRenamedValue(opts, line, weekIndex, dayInWeekIndex) {
    const renamedValue = opts.renameMapping?.[line.value];
    if (renamedValue && (!renamedValue.dayData || renamedValue.dayData.week === weekIndex + 1 && renamedValue.dayData.dayInWeek === dayInWeekIndex + 1)) {
      return renamedValue.to;
    } else {
      return line.value;
    }
  }
  addExerciseDescriptions(exercise, weekIndex, dayInWeekIndex, addedCurrentDescription) {
    if (!exercise) {
      return void 0;
    }
    if (exercise?.descriptions.reuse == null || !ObjectUtils_isEqual(
      exercise.descriptions.values || [],
      exercise.descriptions.reuse.exercise?.descriptions.values || []
    )) {
      const lines = [];
      const currentIndex = this.getCurrentDescriptionIndex(exercise.key, weekIndex, dayInWeekIndex);
      for (let i = 0; i < exercise.descriptions.values.length; i += 1) {
        if (i > 0) {
          lines.push("");
        }
        const description = exercise.descriptions.values[i];
        const parts = description.value.split("\n");
        for (const part of parts) {
          if (currentIndex !== 0 && currentIndex === i && !addedCurrentDescription) {
            lines.push(`// ! ${part}`);
            addedCurrentDescription = true;
          } else {
            lines.push(`// ${part}`);
          }
        }
      }
      return { lines, addedCurrentDescription };
    } else if (exercise?.descriptions.reuse?.exercise) {
      const reusedExercise = exercise.descriptions.reuse.exercise;
      const reusedDayData = reusedExercise.dayData;
      const currentWeekReusedExercisesCount = this.program.weeks[weekIndex]?.days.filter((day) => {
        return day.exercises.some((e) => e.key === reusedExercise.key);
      }).length;
      if (currentWeekReusedExercisesCount === 1 && reusedDayData.week === weekIndex + 1) {
        return { lines: [`// ...${reusedExercise.fullName}`], addedCurrentDescription };
      } else {
        return {
          lines: [`// ...${reusedExercise.fullName}[${reusedDayData.week}:${reusedDayData.dayInWeek}]`],
          addedCurrentDescription
        };
      }
    } else {
      return void 0;
    }
  }
  addPropertyCandidate(candidates, key, candidate) {
    candidates[key] = candidates[key] || [];
    candidates[key].push(candidate);
  }
  // 'progress'/'update'/'warmup' are shared across every instance of an exercise, so they're printed
  // only once. Authors deliberately place bulky blocks away from the top of the program (e.g. on the
  // last week), so print them back where they were written instead of on the first instance.
  // A repeat-materialized copy carries the original's syntax points, so it's excluded from being the
  // origin - otherwise every week a `[1-3]` line spans would claim to be where it was written.
  getPropertyTargets(groupedTopLineMap, opts) {
    const candidates = { progress: {}, update: {}, warmup: {}, id: {} };
    PP_iterateTopLineExercises(groupedTopLineMap, (line, weekIndex, dayInWeekIndex, dayIndex) => {
      const value = this.getRenamedValue(opts, line, weekIndex, dayInWeekIndex);
      const exercise = Program_getProgramExercise(dayIndex + 1, this.program, value);
      if (exercise == null) {
        return;
      }
      const location = `${weekIndex}_${dayInWeekIndex}`;
      const dereuseDecisions = this.shouldReuseSets(exercise) ? this.getDereuseDecisions(exercise) : [];
      const progress = exercise.progress;
      if (progress != null && progress.type !== "none" && (progress.reuse || progress.script) && (!exercise.reuse || dereuseDecisions.includes("progress"))) {
        this.addPropertyCandidate(candidates.progress, exercise.key, {
          location,
          exercise,
          isOrigin: exercise.points.progressPoint != null && !exercise.isRepeat
        });
      }
      const update = exercise.update;
      if (update != null && (update.reuse || update.script) && (!exercise.reuse || dereuseDecisions.includes("update"))) {
        this.addPropertyCandidate(candidates.update, exercise.key, {
          location,
          exercise,
          isOrigin: exercise.points.updatePoint != null && !exercise.isRepeat
        });
      }
      if (exercise.warmupSets != null) {
        this.addPropertyCandidate(candidates.warmup, exercise.key, {
          location,
          exercise,
          isOrigin: exercise.points.warmupPoint != null && !exercise.isRepeat
        });
      }
      if ((exercise.tags || []).length > 0) {
        this.addPropertyCandidate(candidates.id, exercise.key, {
          location,
          exercise,
          isOrigin: exercise.points.idPoint != null && !exercise.isRepeat
        });
      }
    });
    const targets = { progress: {}, update: {}, warmup: {}, id: {} };
    for (const property of ObjectUtils_keys(candidates)) {
      for (const key of ObjectUtils_keys(candidates[property])) {
        const list = candidates[property][key];
        const origin = list.find((c) => c.isOrigin) || list[0];
        if (origin != null) {
          targets[property][key] = { location: origin.location, exercise: list[0].exercise };
        }
      }
    }
    return targets;
  }
  getPropertySource(targets, property, key, weekIndex, dayInWeekIndex, fallback) {
    const target = targets[property][key];
    if (target == null) {
      return fallback;
    }
    return target.location === `${weekIndex}_${dayInWeekIndex}` ? target.exercise : void 0;
  }
  convertToPlanner(opts = {}) {
    const plannerWeeks = [];
    const plannerProgram = this.program.planner;
    if (this.program.errors.length > 0) {
      const error = this.program.errors[0];
      const msg = `There's an error during evaluating a program, week ${error.dayData.week}, day: ${error.dayData.dayInWeek}. Please fix it to proceed.

${error.error.toString()}`;
      console.log(PlannerProgram_generateFullText(plannerProgram.weeks));
      Dialog_alert(msg);
      throw error.error;
    }
    const topLineMap = PlannerProgram_topLineItems(plannerProgram, this.settings);
    let groupedTopLineMap = PlannerProgram_groupedTopLines(topLineMap);
    groupedTopLineMap = opts.reorder ? this.reorderGroupedTopLine(groupedTopLineMap, opts.reorder) : groupedTopLineMap;
    groupedTopLineMap = opts.add ? this.addGroupedTopLine(groupedTopLineMap, opts.add) : groupedTopLineMap;
    const propertyTargets = this.getPropertyTargets(groupedTopLineMap, opts);
    let dayIndex = 0;
    const addedProgressMap = {};
    const addedUpdateMap = {};
    const addedWarmupsMap = {};
    const addedIdMap = {};
    for (let weekIndex = 0; weekIndex < this.program.weeks.length; weekIndex += 1) {
      const week = this.program.weeks[weekIndex];
      const plannerWeek = { name: week.name, days: [], description: week.description };
      for (let dayInWeekIndex = 0; dayInWeekIndex < week.days.length; dayInWeekIndex += 1) {
        const programDay = week.days[dayInWeekIndex];
        const plannerDay = { name: programDay.name, exerciseText: "" };
        let descriptionIndex = void 0;
        let addedCurrentDescription = false;
        let finishedToAddDescription = false;
        const groupedTopLines = groupedTopLineMap[weekIndex][dayInWeekIndex];
        let groupTextArr = [];
        groupLoop: for (let groupIndex = 0; groupIndex < groupedTopLines.length; groupIndex += 1) {
          const exerciseTextArr = [];
          const group = groupedTopLines[groupIndex];
          for (let lineIndex = 0; lineIndex < group.length; lineIndex += 1) {
            const line = group[lineIndex];
            switch (line.type) {
              case "comment": {
                exerciseTextArr.push(line.value);
                break;
              }
              case "description": {
                let key;
                for (let i = lineIndex; i < group.length; i += 1) {
                  if (group[i].type === "exercise") {
                    key = this.getRenamedValue(opts, group[i], weekIndex, dayInWeekIndex);
                    break;
                  }
                }
                if (descriptionIndex == null) {
                  descriptionIndex = 0;
                }
                if (finishedToAddDescription) {
                  break;
                }
                if (key != null) {
                  const exercise = this.getCurrentDescriptionExercise(key, weekIndex, dayInWeekIndex);
                  const result2 = this.addExerciseDescriptions(
                    exercise,
                    weekIndex,
                    dayInWeekIndex,
                    addedCurrentDescription
                  );
                  if (result2) {
                    exerciseTextArr.push(...result2.lines);
                    addedCurrentDescription = result2.addedCurrentDescription;
                    finishedToAddDescription = true;
                  } else {
                    const currentIndex = this.getCurrentDescriptionIndex(key, weekIndex, dayInWeekIndex);
                    if (currentIndex !== 0 && currentIndex === descriptionIndex && !addedCurrentDescription) {
                      exerciseTextArr.push(line.value.replace(/^\/\/\s*!?\s*/, "// ! "));
                      addedCurrentDescription = true;
                    } else {
                      exerciseTextArr.push(line.value.replace(/^(\/\/\s*)!\s*/, "$1"));
                    }
                  }
                } else {
                  exerciseTextArr.push(line.value.replace(/^(\/\/\s*)!\s*/, "$1"));
                }
                break;
              }
              case "empty": {
                if (!finishedToAddDescription) {
                  exerciseTextArr.push("");
                  if (descriptionIndex != null) {
                    descriptionIndex += 1;
                  }
                }
                break;
              }
              case "exercise": {
                descriptionIndex = void 0;
                const value = this.getRenamedValue(opts, line, weekIndex, dayInWeekIndex);
                const evalExercise = Program_getProgramExercise(dayIndex + 1, this.program, value);
                if (evalExercise == null) {
                  continue groupLoop;
                }
                const key = evalExercise.key;
                if (!finishedToAddDescription && (evalExercise.descriptions.reuse || evalExercise.descriptions.values.length > 0) && !this.isInheritedDescription(evalExercise, weekIndex, dayInWeekIndex)) {
                  const result2 = this.addExerciseDescriptions(
                    evalExercise,
                    weekIndex,
                    dayInWeekIndex,
                    addedCurrentDescription
                  );
                  if (result2) {
                    exerciseTextArr.push(...result2.lines);
                  }
                }
                finishedToAddDescription = false;
                addedCurrentDescription = false;
                let plannerExercise = "";
                plannerExercise += this.getExerciseName(evalExercise);
                plannerExercise += " / ";
                if (evalExercise.notused) {
                  plannerExercise += "used: none / ";
                }
                const variations = evalExercise.evaluatedSetVariations;
                const globals = this.getGlobals(evalExercise);
                const shouldReuseSets = this.shouldReuseSets(evalExercise);
                const dereuseDecisions = shouldReuseSets ? this.getDereuseDecisions(evalExercise) : [];
                if (shouldReuseSets) {
                  plannerExercise += this.reuseToStr(evalExercise);
                  if (dereuseDecisions.includes("sets")) {
                    plannerExercise += ` / ` + variations.map((v, i) => {
                      return this.variationToString(v, globals, i, evalExercise);
                    }).join(" / ");
                  }
                  const overriddenGlobals = [];
                  if (dereuseDecisions.includes("weight") && globals.weight != null) {
                    overriddenGlobals.push(`${this.weightExprToStr(globals.weight)}${globals.askWeight ? "+" : ""}`);
                  } else if (dereuseDecisions.includes("weight") && globals.askWeight) {
                    overriddenGlobals.push("?+");
                  }
                  if (dereuseDecisions.includes("rpe") && globals.rpe != null) {
                    overriddenGlobals.push(`@${n(globals.rpe)}${globals.logRpe ? "+" : ""}`);
                  }
                  if (globals.setTimer != null && (dereuseDecisions.includes("setTimer") || dereuseDecisions.includes("timer") || dereuseDecisions.includes("sets"))) {
                    overriddenGlobals.push(this.setTimerGlobalToStr(globals));
                  } else if (dereuseDecisions.includes("timer") && globals.timer != null) {
                    overriddenGlobals.push(`${n(globals.timer)}s`);
                  }
                  if (overriddenGlobals.length > 0) {
                    plannerExercise += ` / ${overriddenGlobals.join(" ")}`;
                  }
                } else {
                  if (evalExercise.setVariations.length > 0) {
                    plannerExercise += variations.map((v, i) => this.variationToString(v, globals, i, evalExercise)).join(" / ");
                  }
                  const globalsStr = [];
                  if (globals.weight != null) {
                    globalsStr.push(`${this.weightExprToStr(globals.weight)}${globals.askWeight ? "+" : ""}`);
                  } else if (globals.askWeight) {
                    globalsStr.push("?+");
                  }
                  if (globals.rpe != null) {
                    globalsStr.push(`@${globals.rpe}${globals.logRpe ? "+" : ""}`);
                  }
                  if (globals.setTimer != null) {
                    globalsStr.push(this.setTimerGlobalToStr(globals));
                  } else if (globals.timer != null) {
                    globalsStr.push(`${globals.timer}s`);
                  }
                  if (globalsStr.length > 0) {
                    plannerExercise += ` / ${globalsStr.join(" ")}`;
                  }
                }
                const warmupSource = !addedWarmupsMap[key] && evalExercise?.warmupSets ? this.getPropertySource(propertyTargets, "warmup", key, weekIndex, dayInWeekIndex, evalExercise) : void 0;
                if (warmupSource != null) {
                  const warmupSets = this.getWarmupSets(warmupSource);
                  if (warmupSets != null) {
                    plannerExercise += ` / warmup: ${warmupSets}`;
                    addedWarmupsMap[key] = true;
                  }
                }
                const idSource = !addedIdMap[key] && (evalExercise.tags || []).length > 0 ? this.getPropertySource(propertyTargets, "id", key, weekIndex, dayInWeekIndex, evalExercise) : void 0;
                if (idSource != null) {
                  plannerExercise += ` / ${this.idToStr(idSource)}`;
                  addedIdMap[key] = true;
                }
                const superset = evalExercise.superset?.name;
                if (superset) {
                  plannerExercise += ` / superset: ${superset}`;
                }
                const update = evalExercise.update;
                if (!addedUpdateMap[key] && update && (update.reuse || update.script)) {
                  if (!evalExercise.reuse || dereuseDecisions.includes("update")) {
                    const source = this.getPropertySource(
                      propertyTargets,
                      "update",
                      key,
                      weekIndex,
                      dayInWeekIndex,
                      evalExercise
                    );
                    if (source != null) {
                      const updateStr = _ProgramToPlanner.getUpdate(source, this.settings);
                      if (updateStr) {
                        plannerExercise += ` / ${updateStr}`;
                      }
                      addedUpdateMap[key] = true;
                    }
                  } else if (update.reuse?.fullName === evalExercise.reuse.fullName) {
                    addedUpdateMap[key] = true;
                  }
                }
                const progress = evalExercise.progress;
                if (progress && progress.type === "none") {
                  plannerExercise += ` / progress: none`;
                } else if (!addedProgressMap[key] && progress && (progress.reuse || progress.script)) {
                  if (!evalExercise.reuse || dereuseDecisions.includes("progress")) {
                    const source = this.getPropertySource(
                      propertyTargets,
                      "progress",
                      key,
                      weekIndex,
                      dayInWeekIndex,
                      evalExercise
                    );
                    if (source != null) {
                      const progressStr = _ProgramToPlanner.getProgress(source, this.settings, false);
                      if (progressStr) {
                        plannerExercise += ` / ${progressStr}`;
                      }
                      addedProgressMap[key] = true;
                    }
                  } else if (progress.reuse?.fullName === evalExercise.reuse.fullName) {
                    addedProgressMap[key] = true;
                  }
                }
                exerciseTextArr.push(plannerExercise);
                break;
              }
            }
          }
          if (exerciseTextArr.length > 0) {
            groupTextArr = groupTextArr.concat(exerciseTextArr);
          }
        }
        plannerDay.exerciseText = groupTextArr.join("\n");
        plannerDay.description = programDay.description;
        plannerWeek.days.push(plannerDay);
        dayIndex += 1;
      }
      plannerWeeks.push(plannerWeek);
    }
    const result = { vtype: "planner", name: this.program.name, weeks: plannerWeeks };
    const repeatingExercises = /* @__PURE__ */ new Set();
    PP_iterate2(this.program.weeks, (exercise) => {
      if (exercise.repeat != null && exercise.repeat.length > 0) {
        const key = PlannerKey_fromPlannerExercise(exercise, this.settings);
        repeatingExercises.add(key);
      }
    });
    const newPlanner = PlannerProgram_compact(
      this.program.planner,
      result,
      this.settings,
      repeatingExercises,
      opts.renameMapping
    );
    return newPlanner;
  }
  // The exercise as the evaluator sees it, printed back as Liftoscript: every `...reuse`
  // resolved into the values it stands for, and every property that governs the exercise on the
  // line even when it's declared on another week. Read-only — it is what the sheet shows when
  // asked what a line means, never what gets saved, which is why it can ignore both the reuse
  // the author wrote and the once-per-exercise placement rules convertToPlanner keeps to.
  materializeExercise(exercise) {
    const parts = [this.getExerciseName(exercise)];
    if (exercise.notused) {
      parts.push("used: none");
    }
    const variations = exercise.evaluatedSetVariations;
    const globals = this.getGlobals(exercise);
    for (let i = 0; i < variations.length; i += 1) {
      if (variations[i].sets.length > 0) {
        parts.push(this.variationToString(variations[i], globals, i, exercise));
      }
    }
    const globalsStr = [];
    if (globals.weight != null) {
      globalsStr.push(`${this.weightExprToStr(globals.weight)}${globals.askWeight ? "+" : ""}`);
    } else if (globals.askWeight) {
      globalsStr.push("?+");
    }
    if (globals.rpe != null) {
      globalsStr.push(`@${n(globals.rpe)}${globals.logRpe ? "+" : ""}`);
    }
    if (globals.setTimer != null) {
      globalsStr.push(this.setTimerGlobalToStr(globals));
    } else if (globals.timer != null) {
      globalsStr.push(`${n(globals.timer)}s`);
    }
    if (globalsStr.length > 0) {
      parts.push(globalsStr.join(" "));
    }
    const warmupSets = this.warmupSetsToStr(PlannerProgramExercise_warmups(exercise));
    if (warmupSets != null) {
      parts.push(`warmup: ${warmupSets}`);
    }
    if ((exercise.tags || []).length > 0) {
      parts.push(this.idToStr(exercise));
    }
    if (exercise.superset?.name) {
      parts.push(`superset: ${exercise.superset.name}`);
    }
    const update = _ProgramToPlanner.getUpdate(exercise, this.settings, false, true);
    if (update) {
      parts.push(update);
    }
    const progress = _ProgramToPlanner.getProgress(exercise, this.settings, false, true);
    if (progress) {
      parts.push(progress);
    }
    return parts.join(" / ");
  }
  getExerciseName(programExercise) {
    const variations = programExercise.exerciseVariations;
    if (variations != null && variations.length > 1) {
      const currentIndex = variations.findIndex((v) => v.isCurrent);
      const activeIndex = currentIndex === -1 ? 0 : currentIndex;
      const parts = variations.map((variation, i) => {
        const label = i === 0 ? programExercise.label : void 0;
        const segment = variation.exerciseType ? Exercise_fullName(Exercise_get(variation.exerciseType, this.settings.exercises), this.settings, label) : Exercise_buildName(variation.name, this.settings, label);
        return `${i === activeIndex && i > 0 ? "! " : ""}${segment}`;
      });
      let name = parts.join(" | ");
      if (programExercise.order > 0) {
        name = `${name}[${programExercise.order}]`;
      }
      return name;
    } else if (programExercise.exerciseType) {
      const exercise = Exercise_get(programExercise.exerciseType, this.settings.exercises);
      let name = Exercise_fullName(exercise, this.settings, programExercise.label);
      if (programExercise.order > 0) {
        name = `${name}[${programExercise.order}]`;
      }
      return name;
    } else {
      return programExercise.fullName;
    }
  }
  reuseToStr(programExercise) {
    const reuseExercise = programExercise.reuse?.exercise;
    if (!reuseExercise) {
      throw new Error("reuse.exercise is required");
    }
    const reuse = programExercise.reuse;
    if (!reuse) {
      throw new Error("reuse is required");
    }
    let str = "...";
    if (reuseExercise.exerciseType) {
      const exercise = Exercise_get(reuseExercise.exerciseType, this.settings.exercises);
      const reuseStr = Exercise_fullName(exercise, this.settings, reuseExercise.label);
      str += reuseStr;
    } else {
      str += reuseExercise.fullName;
    }
    if (reuse.week || reuse.day) {
      const weekAndDay = CollectionUtils_compact([reuse.week, reuse.day]).join(":");
      str += `[${weekAndDay}]`;
    }
    return str;
  }
  static getUpdate(programExercise, settings, hideScript, resolveReuse) {
    const update = programExercise.update ?? (resolveReuse ? programExercise.reuse?.exercise?.update : void 0);
    if (!update) {
      return "";
    }
    if (resolveReuse) {
      const script = PlannerProgramExercise_getUpdateScript(programExercise);
      if (script != null) {
        return `update: custom() ${hideScript ? "{~ ... ~}" : script}`;
      }
    }
    if (update.reuse) {
      if (update.reuse.exercise?.exerciseType) {
        const exercise = Exercise_get(update.reuse.exercise.exerciseType, settings.exercises);
        const fullName = Exercise_fullName(exercise, settings, update.reuse.exercise.label);
        return `update: custom() { ...${fullName} }`;
      } else {
        return `update: custom() { ...${update.reuse.exercise?.fullName || update.reuse.fullName} }`;
      }
    } else {
      return `update: custom() ${hideScript ? "{~ ... ~}" : update.script}`;
    }
  }
  idToStr(programExercise) {
    return `id: tags(${(programExercise.tags || []).join(", ")})`;
  }
  static getProgress(programExercise, settings, hideScript, resolveReuse) {
    const progress = programExercise.progress ?? (resolveReuse ? programExercise.reuse?.exercise?.progress : void 0);
    if (!progress) {
      return "";
    }
    let progressStr = `progress: ${progress.type}`;
    const state = PlannerProgramExercise_getState(programExercise);
    const stateMetadata = PlannerProgramExercise_getStateMetadata(programExercise);
    if (progress.type === "custom") {
      const argsState = resolveReuse || progress.reuse == null ? state : PlannerProgramExercise_getOnlyChangedState(programExercise);
      progressStr += `(${ObjectUtils_entries(argsState).map(([k, v]) => {
        return `${k}${stateMetadata[k]?.userPrompted ? "+" : ""}: ${Weight_print(v)}`;
      }).join(", ")})`;
    } else if (progress.type === "lp") {
      const increment = state.increment;
      const successes = state.successes;
      const successCounter = state.successCounter;
      const decrement = state.decrement;
      const failures = state.failures;
      const failureCounter = state.failureCounter;
      const args = [];
      args.push(Weight_print(increment));
      if (successes > 1 || decrement.value > 0) {
        args.push(`${successes}`);
      }
      if (successes > 1 || decrement.value > 0) {
        args.push(`${successCounter}`);
      }
      if (decrement.value > 0) {
        args.push(Weight_print(decrement));
      }
      if (failures > 1) {
        args.push(`${failures}`);
      }
      if (failures > 1) {
        args.push(`${failureCounter}`);
      }
      progressStr += `(${args.join(", ")})`;
    } else if (progress.type === "dp") {
      const increment = state.increment;
      const minReps = state.minReps;
      const maxReps = state.maxReps;
      const args = [Weight_print(increment), `${minReps}`, `${maxReps}`];
      progressStr += `(${args.join(", ")})`;
    } else if (progress.type === "sum") {
      const reps = state.reps;
      const increment = state.increment;
      const args = [`${reps}`, Weight_print(increment)];
      progressStr += `(${args.join(", ")})`;
    }
    if (progress.type === "custom") {
      const resolvedScript = resolveReuse ? PlannerProgramExercise_getProgressScript(programExercise) : void 0;
      if (resolvedScript != null) {
        progressStr += hideScript ? ` {~ ... ~}` : ` ${resolvedScript}`;
      } else if (progress.reuse) {
        if (progress.reuse.exercise?.exerciseType) {
          const exercise = Exercise_get(progress.reuse.exercise.exerciseType, settings.exercises);
          const fullName = Exercise_fullName(exercise, settings, progress.reuse.exercise.label);
          progressStr += ` { ...${fullName} }`;
        } else {
          progressStr += ` { ...${progress.reuse.exercise?.fullName || progress.reuse.fullName} }`;
        }
      } else {
        progressStr += hideScript ? ` {~ ... ~}` : ` ${progress.script}`;
      }
    }
    return progressStr;
  }
  getGlobals(exercise) {
    const variations = exercise.evaluatedSetVariations;
    if (variations.length === 0 || variations[0].sets.length === 0) {
      const globals = exercise.globals;
      const reusedGlobals = exercise.reuse?.exercise?.globals || {};
      return {
        weight: globals?.weight ?? reusedGlobals.weight,
        rpe: globals?.rpe ?? reusedGlobals.rpe,
        timer: globals?.timer ?? reusedGlobals.timer,
        setTimer: globals?.setTimer ?? reusedGlobals.setTimer,
        isOverflowSetTimer: globals?.isOverflowSetTimer ?? reusedGlobals.isOverflowSetTimer,
        logRpe: globals?.logRpe ?? reusedGlobals.logRpe,
        askWeight: globals?.askWeight ?? reusedGlobals.askWeight
      };
    }
    const firstWeight = variations[0]?.sets[0]?.weight;
    const firstRpe = variations[0]?.sets[0]?.rpe;
    const firstLogRpe = !!variations[0]?.sets[0]?.logRpe;
    const firstAskWeight = !!variations[0]?.sets[0]?.askWeight;
    const firstTimer = variations[0]?.sets[0]?.timer;
    const hasAnySetTimer = variations.some((v) => v.sets.some((s) => s.setTimer != null));
    const firstSetTimer = variations[0]?.sets[0]?.setTimer;
    const firstIsOverflowSetTimer = !!variations[0]?.sets[0]?.isOverflowSetTimer;
    const setTimerIsGlobal = firstSetTimer != null && (exercise.globals.setTimer != null || exercise.reuse != null) && variations.every(
      (v) => v.sets.every(
        (s) => s.setTimer === firstSetTimer && !!s.isOverflowSetTimer === firstIsOverflowSetTimer && s.timer === firstTimer
      )
    );
    return {
      setTimer: setTimerIsGlobal ? firstSetTimer : void 0,
      isOverflowSetTimer: setTimerIsGlobal ? firstIsOverflowSetTimer : void 0,
      weight: firstWeight != null && variations.every(
        (v) => v.sets.every((s) => Weight_eqNull(s.weight, firstWeight) && !!s.askWeight === firstAskWeight)
      ) ? firstWeight : void 0,
      askWeight: variations.every((v) => v.sets.every((s) => Weight_eqNull(s.weight, firstWeight) && !!s.askWeight)),
      rpe: firstRpe != null && variations.every((v) => v.sets.every((s) => s.rpe === firstRpe && !!s.logRpe === firstLogRpe)) ? firstRpe : void 0,
      logRpe: variations.every((v) => v.sets.every((s) => s.rpe === firstRpe && !!s.logRpe)),
      timer: (setTimerIsGlobal || !hasAnySetTimer) && firstTimer != null && variations.every((v) => v.sets.every((s) => s.timer === firstTimer)) ? firstTimer : void 0
    };
  }
  groupVariationSets(sets, exercise, index) {
    if (sets.length === 0) {
      const originalSets = PlannerProgramExercise_sets(exercise, index)[0];
      return [
        [
          {
            maxrep: originalSets?.repRange?.maxrep || 1,
            minrep: originalSets?.repRange?.minrep,
            weight: originalSets?.weight || Weight_zero,
            logRpe: originalSets?.logRpe || false,
            isAmrap: originalSets?.repRange?.isAmrap || false,
            isQuickAddSet: originalSets?.repRange?.isQuickAddSet || false,
            askWeight: originalSets?.askWeight || false,
            rpe: originalSets?.rpe,
            timer: originalSets?.timer,
            label: originalSets?.label
          },
          0
        ]
      ];
    }
    let lastKey;
    const groups = [];
    for (const set of sets) {
      const key = this.setToKey(set);
      if (lastKey == null || lastKey !== key) {
        groups.push([set, 0]);
      }
      groups[groups.length - 1][1] += 1;
      lastKey = key;
    }
    return groups;
  }
  groupWarmupsSets(sets) {
    let lastKey;
    const groups = [];
    for (const set of sets) {
      const key = this.warmupSetToKey(set);
      if (lastKey == null || lastKey !== key) {
        groups.push([set, 0]);
      }
      groups[groups.length - 1][1] += set.numberOfSets;
      lastKey = key;
    }
    return groups;
  }
  getWarmupSets(programExercise) {
    return this.warmupSetsToStr(programExercise.warmupSets);
  }
  warmupSetsToStr(warmupSets) {
    if (warmupSets) {
      const groups = this.groupWarmupsSets(warmupSets);
      const strs = [];
      for (const group of groups) {
        const first = group[0];
        const length = group[1];
        const weight = first.weight ?? (first.percentage != null ? Weight_buildPct(first.percentage) : Weight_build(0, "lb"));
        strs.push(`${length}x${first.reps} ${Weight_print(weight)}`);
      }
      return strs.length === 0 ? "none" : strs.join(", ");
    }
    return void 0;
  }
  weightExprToStr(weightExpr) {
    if (weightExpr != null) {
      return Weight_print(weightExpr);
    }
    return "";
  }
  setTimerGlobalToStr(globals) {
    const overflow = globals.isOverflowSetTimer ? "+" : "";
    const restPart = globals.timer != null ? `${n(Math.max(0, globals.timer))}s` : "?";
    return `${n(Math.max(0, globals.setTimer ?? 0))}s${overflow}|${restPart}`;
  }
  variationToString(variation, globals, index, exercise) {
    const groupedVariationSets = this.groupVariationSets(variation.sets, exercise, index);
    const result = [];
    for (const group of groupedVariationSets) {
      const set = group[0];
      let setStr = "";
      setStr += `${group[1]}${set.isQuickAddSet ? "+" : ""}x`;
      setStr += set.minrep != null ? `${n(Math.max(0, set.minrep))}-` : "";
      setStr += `${n(Math.max(0, set.maxrep ?? 0))}`;
      setStr += set.isAmrap ? "+" : "";
      if (globals.weight == null && !globals.askWeight) {
        const weightValue = this.weightExprToStr(set.weight);
        if (weightValue) {
          setStr += ` ${weightValue}${set.askWeight ? "+" : ""}`;
        } else if (set.askWeight) {
          setStr += " ?+";
        }
      }
      if (globals.rpe == null) {
        setStr += set.rpe != null ? ` @${n(Math.max(0, set.rpe))}` : "";
        setStr += set.rpe != null && set.logRpe ? "+" : "";
      }
      if (set.setTimer != null && globals.setTimer == null) {
        const overflow = set.isOverflowSetTimer ? "+" : "";
        const restPart = set.timer != null ? `${n(Math.max(0, set.timer))}s` : "?";
        setStr += ` ${n(Math.max(0, set.setTimer))}s${overflow}|${restPart}`;
      } else if (set.setTimer == null && globals.timer == null) {
        setStr += set.timer ? ` ${n(Math.max(0, set.timer))}s` : "";
      }
      if (set.auto) {
        setStr += " auto";
      }
      if (set.label) {
        setStr += ` (${set.label})`;
      }
      result.push(setStr);
    }
    let resultStr = "";
    if (index > 0 && variation.isCurrent) {
      resultStr += "! ";
    }
    return resultStr + result.map((r) => r.trim()).join(", ");
  }
  warmupSetToKey(set) {
    return `${set.reps}-${Weight_print(set.weight || set.percentage || 0)}`;
  }
  setToKey(set) {
    return `${set.maxrep}-${set.minrep}-${Weight_printNull(set.weight)}-${set.isAmrap}-${set.rpe}-${set.logRpe}-${set.timer}-${set.label}-${set.askWeight}-${set.setTimer}-${set.isOverflowSetTimer}-${set.auto}`;
  }
};

// third-party/liftosaur/upstream/src/models/program.ts
var import_micro_memoize5 = __toESM(require_micro_memoize());
var Program_uses1RM = (0, import_micro_memoize5.default)(
  (program) => {
    const allExercises = Program_getAllProgramExercises(program);
    return allExercises.some((e) => ProgramExercise_doesUse1RM(e));
  },
  { maxSize: 10 }
);
var Program_usesRPE = (0, import_micro_memoize5.default)(
  (program) => {
    const allExercises = Program_getAllProgramExercises(program);
    return allExercises.some((e) => ProgramExercise_doesUseRPE(e));
  },
  { maxSize: 10 }
);
function Program_nextHistoryEntry(program, dayData, index, programExercise, stats, settings) {
  const exercise = programExercise.exerciseType;
  const programSets = PlannerProgramExercise_currentEvaluatedSetVariation(programExercise)?.sets;
  const warmupSets = PlannerProgramExercise_programWarmups(programExercise, settings);
  const sets = [];
  for (let i = 0; i < programSets.length; i++) {
    const programSet = programSets[i];
    const minReps = programSet.minrep != null && programSet.minrep !== programSet.maxrep ? programSet.minrep : void 0;
    const weight = ProgramSet_getEvaluatedWeight(programSet, programExercise.exerciseType, settings);
    sets.push({
      vtype: "set",
      id: UidFactory_generateUid(6),
      reps: programSet.maxrep,
      index: i,
      minReps,
      weight,
      isUnilateral: Exercise_getIsUnilateral(exercise, settings),
      rpe: programSet.rpe,
      timer: programSet.timer,
      setTimer: programSet.setTimer,
      isOverflowSetTimer: programSet.isOverflowSetTimer,
      auto: programSet.auto,
      logRpe: programSet.logRpe,
      askWeight: programSet.askWeight,
      originalWeight: programSet.weight,
      isAmrap: programSet.isAmrap,
      label: programSet.label,
      isCompleted: false,
      programSetIndex: i
    });
  }
  const entry = {
    vtype: "history_entry",
    id: Progress_getEntryId(exercise, programExercise.label),
    index,
    exercise,
    programExerciseId: programExercise.key,
    sets,
    superset: programExercise.superset?.name,
    warmupSets: Exercise_getWarmupSets(exercise, sets[0]?.weight, settings, warmupSets)
  };
  try {
    return Progress_runUpdateScriptForEntry(entry, dayData, programExercise, program.states, -1, settings, stats);
  } catch (error) {
    console.error(error);
    return entry;
  }
}
function Program_nextHistoryRecord(aProgram, settings, stats, dayIndex) {
  const program = Program_evaluate(aProgram, settings);
  return Program_nextHistoryRecordFromEvaluated(program, settings, stats, dayIndex);
}
function Program_getDayExercisesInOrder(program, day) {
  const programDay = Program_getProgramDay(program, day);
  return CollectionUtils_sortBy(programDay ? Program_getProgramDayUsedExercises(programDay) : [], "order");
}
function Program_nextHistoryRecordFromEvaluated(program, settings, stats, dayIndex) {
  const day = Math.max(1, Math.min(Program_numberOfDays(program), Math.max(1, (dayIndex || program.nextDay) ?? 0)));
  const dayData = Program_getDayData(program, day);
  const { week, dayInWeek } = dayData;
  const fullDayName = Program_getDayName(program, day);
  const now = Date.now();
  const sortedDayExercises = Program_getDayExercisesInOrder(program, day);
  const entries = sortedDayExercises.map((exercise, i) => {
    return Program_nextHistoryEntry(program, dayData, i, exercise, stats, settings);
  });
  return {
    vtype: "progress",
    id: 0,
    date: (/* @__PURE__ */ new Date()).toISOString(),
    programId: program.id,
    programName: program.name,
    intervals: [],
    day,
    week,
    dayInWeek,
    dayName: fullDayName,
    startTime: now,
    updatedAt: now,
    entries,
    ui: {}
  };
}
function Program_runFinishDayScript(programExercise, program, dayData, entry, settings, stats, userPromptedStateVars) {
  const state = PlannerProgramExercise_getState(programExercise);
  const setVariationIndex = PlannerProgramExercise_currentEvaluatedSetVariationIndex(programExercise);
  const descriptionIndex = PlannerProgramExercise_currentDescriptionIndex(programExercise);
  const exerciseVariationIndex = PlannerProgramExercise_currentExerciseVariationIndex(programExercise);
  const bindings = Progress_createScriptBindings(
    dayData,
    entry,
    settings,
    programExercise.evaluatedSetVariations[setVariationIndex]?.sets.length ?? 0,
    Stats_getCurrentMovingAverageBodyweight(stats, settings),
    void 0,
    setVariationIndex + 1,
    descriptionIndex + 1,
    exerciseVariationIndex + 1,
    programExercise.label
  );
  const fns = Progress_createScriptFunctions(settings);
  const newState = {
    ...state,
    ...userPromptedStateVars
  };
  const otherStates = ObjectUtils_clone(program.states);
  const script = PlannerProgramExercise_getProgressScript(programExercise) || "";
  let updates = [];
  try {
    const runner = new ScriptRunner(
      script,
      newState,
      otherStates,
      bindings,
      fns,
      settings.units,
      {
        exerciseType: programExercise.exerciseType,
        ...Progress_scriptExerciseContext(entry, programExercise),
        unit: settings.units,
        prints: []
      },
      "planner"
    );
    runner.execute();
    updates = runner.getUpdates();
  } catch (e) {
    if (e instanceof SyntaxError) {
      return { success: false, error: e.message };
    } else {
      throw e;
    }
  }
  const diffOtherStates = ObjectUtils_keys(otherStates).reduce((memo, key) => {
    if (!ObjectUtils_isEqual(otherStates[key], program.states[key])) {
      const diffState = ObjectUtils_keys(otherStates[key]).reduce((memo2, key2) => {
        const oldValue = program.states[key]?.[key2];
        if (oldValue == null || !Weight_eq(otherStates[key][key2], oldValue)) {
          memo2[key2] = otherStates[key][key2];
        }
        return memo2;
      }, {});
      memo[key] = diffState;
    }
    return memo;
  }, {});
  const stateDiff = ObjectUtils_diff(state, newState);
  return { success: true, data: { state: stateDiff, otherStates: diffOtherStates, updates, bindings } };
}
function Program_getProgramExerciseForKeyAndDay(program, day, key) {
  const programDay = program ? Program_getProgramDay(program, day) : void 0;
  const dayExercises = programDay ? Program_getProgramDayUsedExercises(programDay) : [];
  let programExercise = dayExercises.find((pe) => pe.key === key);
  if (programExercise == null) {
    const allExercises = program ? Program_getAllProgramExercisesWithType(program) : [];
    programExercise = allExercises.find((pe) => pe.key === key);
    if (programExercise != null) {
      programExercise = { ...programExercise, dayData: Program_getDayData(program, day) };
    }
  }
  return programExercise;
}
function Program_runAllFinishDayScripts(program, progress, stats, settings, onError) {
  const exerciseData = {};
  const newEvaluatedProgram = Program_forceEvaluate(program, settings);
  const dayData = Progress_getDayData(progress);
  const programDay = Program_getProgramDay(newEvaluatedProgram, progress.day);
  if (!programDay) {
    return { program, exerciseData };
  }
  for (const entry of progress.entries) {
    if (entry != null && !entry.isSuppressed && entry.sets.some((s) => s.isCompleted)) {
      const programExercise = program && entry.programExerciseId ? Program_getProgramExerciseForKeyAndDay(newEvaluatedProgram, dayData.day, entry.programExerciseId) : void 0;
      if (programExercise) {
        const newStateResult = Program_runFinishDayScript(
          programExercise,
          newEvaluatedProgram,
          dayData,
          entry,
          settings,
          stats,
          progress.userPromptedStateVars?.[programExercise.key]
        );
        if (newStateResult.success) {
          const { state, updates, bindings, otherStates } = newStateResult.data;
          const exerciseKey = Exercise_toKey(entry.exercise);
          const onerm = Exercise_onerm(entry.exercise, settings);
          if (!Weight_eq(bindings.rm1, onerm)) {
            exerciseData[exerciseKey] = { rm1: Weight_roundTo005(bindings.rm1) };
          }
          PP_iterate2(newEvaluatedProgram.weeks, (exercise) => {
            if (exercise.key === programExercise.key && exercise.progress) {
              exercise.progress.state = { ...exercise.progress.state, ...entry.state, ...state };
            }
          });
          ProgramExercise_applyVariables(programExercise.key, newEvaluatedProgram, updates, settings);
          for (const key of ObjectUtils_keys(otherStates || {})) {
            PP_iterate2(newEvaluatedProgram.weeks, (exercise) => {
              if (exercise.tags?.includes(Number(key)) && exercise.progress) {
                exercise.progress.state = { ...exercise.progress.state, ...otherStates[key] };
              }
            });
          }
        } else {
          const message = `There was an error executing progress script: ${newStateResult.error}`;
          if (onError) {
            onError(message);
          } else {
            Dialog_alert(message);
          }
        }
      }
    }
  }
  const theNextDay = Program_nextDay(newEvaluatedProgram, progress.day);
  const newPlanner = new ProgramToPlanner(newEvaluatedProgram, settings).convertToPlanner();
  const newProgram = ObjectUtils_clone(program);
  newProgram.nextDay = theNextDay;
  newProgram.planner = newPlanner;
  return {
    program: newProgram,
    exerciseData
  };
}
function Program_getAllProgramExercises(evaluatedProgram) {
  return evaluatedProgram.weeks.flatMap((w) => w.days.flatMap((d) => d.exercises));
}
function Program_getAllProgramExercisesWithType(evaluatedProgram) {
  const used = Program_getAllProgramExercises(evaluatedProgram).filter((e) => e.exerciseType != null);
  return used;
}
function Program_emptyEvaluatedProgram(program) {
  return {
    type: "evaluatedProgram",
    id: program.id,
    planner: {
      vtype: "planner",
      name: program.name,
      weeks: [{ name: "Week 1", days: [{ name: "Day 1", exerciseText: "" }] }]
    },
    name: program.name,
    errors: [],
    nextDay: program.nextDay,
    weeks: [
      {
        name: "Week 1",
        days: [
          {
            name: "Day 1",
            dayData: { day: 1, week: 1, dayInWeek: 1 },
            exercises: []
          }
        ]
      }
    ],
    states: {}
  };
}
function Program_buildWeeks(planner, evaluatedWeeks) {
  let dayNum = 0;
  const errors = [];
  const weeks = planner.weeks.map((week, weekIndex) => {
    const evaluatedWeek = evaluatedWeeks[weekIndex];
    const days = week.days.map((day, dayInWeekIndex) => {
      dayNum += 1;
      const evaluatedDay = evaluatedWeek[dayInWeekIndex];
      const dayData = {
        day: dayNum,
        week: weekIndex + 1,
        dayInWeek: dayInWeekIndex + 1
      };
      const evaluatedExercises = CollectionUtils_sortBy(evaluatedDay.success ? evaluatedDay.data : [], "order");
      if (!evaluatedDay.success) {
        errors.push({ error: evaluatedDay.error, dayData });
      }
      return {
        name: day.name,
        description: day.description,
        dayData,
        exercises: evaluatedExercises
      };
    });
    return { name: week.name, description: week.description, days };
  });
  return { weeks, errors };
}
function Program_buildEvaluatedProgram(program, planner, evaluatedWeeks) {
  const { weeks, errors } = Program_buildWeeks(planner, evaluatedWeeks);
  const states = {};
  PP_iterate(evaluatedWeeks, (exercise) => {
    for (const tag of exercise.tags) {
      states[tag] = { ...states[tag], ...PlannerProgramExercise_getState(exercise) };
    }
  });
  return {
    type: "evaluatedProgram",
    id: program.id,
    errors,
    planner,
    name: program.name,
    nextDay: program.nextDay,
    weeks,
    states
  };
}
function Program_forceEvaluate(program, settings) {
  const planner = program.planner;
  if (!planner) {
    return Program_emptyEvaluatedProgram(program);
  }
  const { evaluatedWeeks } = PlannerEvaluator_forceEvaluate(planner, settings);
  return Program_buildEvaluatedProgram(program, planner, evaluatedWeeks);
}
function Program_evaluateCachedPlannerImpl(program, settings) {
  const planner = program.planner;
  if (!planner) {
    return Program_emptyEvaluatedProgram(program);
  }
  const { evaluatedWeeks } = PlannerEvaluator_evaluate(planner, settings);
  return Program_buildEvaluatedProgram(program, planner, evaluatedWeeks);
}
var Program_evaluateCachedPlanner = (0, import_micro_memoize5.default)(Program_evaluateCachedPlannerImpl, { maxSize: 10 });
function Program_numberOfDays(program) {
  return program.weeks.reduce((memo, week) => memo + week.days.length, 0);
}
function Program_getWeekFromDay(program, day) {
  let daysTotal = 0;
  for (let i = 0; i < program.weeks.length; i += 1) {
    const weekDays = program.weeks[i].days.length;
    daysTotal += weekDays;
    if (daysTotal >= day) {
      return i + 1;
    }
  }
  return 1;
}
function Program_getDayData(program, day) {
  return {
    day,
    week: Program_getWeekFromDay(program, day),
    dayInWeek: Program_getDayInWeek(program, day)
  };
}
function Program_getDayInWeek(program, day) {
  let daysTotal = 0;
  for (const week of program.weeks) {
    daysTotal += week.days.length;
    if (daysTotal >= day) {
      return day - (daysTotal - week.days.length);
    }
  }
  return 1;
}
function Program_getDayName(program, day) {
  const dayData = Program_getDayData(program, day);
  const programDay = Program_getProgramDay(program, day);
  const week = program.weeks[(dayData.week || 1) - 1];
  const isMultiweek = program.weeks.length > 1 && week != null;
  return `${isMultiweek ? `${week.name} - ` : ""}${programDay?.name}`;
}
function Program_getProgramDay(program, day) {
  let aDay = 0;
  for (const week of program.weeks || []) {
    for (const d of week.days) {
      aDay += 1;
      if (day === aDay) {
        return d;
      }
    }
  }
  return void 0;
}
function Program_getProgramDayExercises(programDay) {
  const list = programDay.exercises.filter((e) => e.exerciseType != null);
  return list;
}
function Program_getProgramDayUsedExercises(programDay) {
  const list = programDay.exercises.filter((e) => !e.notused && e.exerciseType != null);
  return list;
}
function Program_applyEvaluatedProgram(program, evaluatedProgram, settings) {
  const newProgram = ObjectUtils_clone(program);
  newProgram.planner = new ProgramToPlanner(evaluatedProgram, settings).convertToPlanner();
  newProgram.nextDay = evaluatedProgram.nextDay;
  return newProgram;
}
function Program_getProgramExercise(day, program, key) {
  if (key == null || program == null) {
    return void 0;
  }
  const programDay = Program_getProgramDay(program, day);
  return programDay?.exercises.find((e) => e.key === key);
}
function Program_nextDay(program, day) {
  const nd = (day != null ? day % Program_numberOfDays(program) : 0) + 1;
  return isNaN(nd) ? 1 : nd;
}
function Program_create(name, id) {
  return {
    vtype: "program",
    id: id || UidFactory_generateUid(8),
    name,
    url: "",
    author: "",
    shortDescription: "",
    description: "",
    nextDay: 1,
    weeks: [],
    isMultiweek: false,
    days: [{ id: UidFactory_generateUid(8), name: "Day 1", exercises: [] }],
    exercises: [],
    tags: [],
    clonedAt: Date.now()
  };
}
var Program_fullProgram = (0, import_micro_memoize5.default)(
  (program, settings) => {
    return program;
  },
  { maxSize: 10 }
);
var Program_evaluate = (0, import_micro_memoize5.default)(Program_forceEvaluate, { maxSize: 10 });
export {
  Exercise_fullName,
  Exercise_get,
  Exercise_synergistMusclesGroups,
  Exercise_targetMusclesGroups,
  Exercise_toKey,
  PlannerProgram_evaluateText,
  PlannerProgram_generateFullText,
  PlannerProgram_replaceWeight,
  ProgramExercise_doesUse1RM,
  ProgramExercise_weightChanges,
  Program_applyEvaluatedProgram,
  Program_create,
  Program_evaluate,
  Program_forceEvaluate,
  Program_getAllProgramExercises,
  Program_getProgramDayUsedExercises,
  Program_nextHistoryRecord,
  Program_runAllFinishDayScripts,
  Progress_getDayData,
  Progress_runUpdateScriptForEntry,
  Settings_build,
  Stats_getEmpty,
  Weight_convertTo,
  allExercisesList
};
