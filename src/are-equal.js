import isEqual from 'lodash.isequal';

/**
 * Argument
 *
 * @param {Object} nextProps Next props. Can be objects of cursors, values or immutable structures
 *
 * @property {Function} isCursor Get default isCursor
 * @property {Function} isEqualProps Get default isEqualProps
 * @property {Function} isEqualCursor Get default isEqualCursor
 * @property {Function} isEqualImmutable Get default isEqualImmutable
 * @property {Function} isImmutable Get default isImmutable
 * @property {Function} isIgnorable Get default isIgnorable
 * @property {Function} debug Get default debug
 *
 * @module shouldComponentUpdate
 * @returns {Component}
 * @api public
 */
export default factory();

/**
 * Create a “local” instance of the shouldComponentUpdate with overriden defaults.
 *
 * ### Options
 * ```js
 * {
 *   isCursor: function (cursor), // check if is props
 *   isEqualCursor: function (oneCursor, otherCursor), // check cursor
 *   isEqualImmutable: function (oneImmutableStructure, otherImmutableStructure), // check immutable structures
 *   isImmutable: function (currentProps, nextProps), // check if object is immutable
 *   isEqualProps: function (currentProps, nextProps), // check props
 *   isIgnorable: function (propertyValue, propertyKey), // check if property item is ignorable
 *   unCursor: function (cursor) // convert from cursor to object
 * }
 * ```
 *
 * @param {Object} [Options] Options with defaults to override
 *
 * @module shouldComponentUpdate.withDefaults
 * @returns {Function} shouldComponentUpdate with overriden defaults
 * @api public
 */
export { factory as withDefaults };

function factory(methods) {
  var debug;
  methods = methods || {};

  var _isCursor = methods.isCursor || isCursor,
    _isEqualCursor = methods.isEqualCursor || isEqualCursor,
    _isEqualImmutable = methods.isEqualImmutable || isEqualImmutable,
    _isEqualProps = methods.isEqualProps || isEqualProps,
    _isImmutable = methods.isImmutable || isImmutable,
    _isIgnorable = methods.isIgnorable || isIgnorable,
    _unCursor = methods.unCursor || unCursor;

  var isNotIgnorable = not(or(_isIgnorable, isChildren));

  areEqual.isCursor = _isCursor;
  areEqual.isEqualProps = _isEqualProps;
  areEqual.isEqualCursor = _isEqualCursor;
  areEqual.isEqualImmutable = _isEqualImmutable;
  areEqual.isImmutable = _isImmutable;
  areEqual.debug = debugFn;

  return areEqual;

  function areEqual(prevProps, nextProps) {
    if (nextProps === prevProps) {
      if (debug) debug.call(this, 'areEqual => true (equal input)');
      return true;
    }
    if (prevProps.children !== nextProps.children) {
      return false;
    }

    const filteredNextProps = filter(nextProps, isNotIgnorable);
    const filteredCurrentProps = filter(prevProps, isNotIgnorable);

    if (!_isEqualProps(filteredCurrentProps, filteredNextProps)) {
      if (debug)
        debug.call(this, 'areEqual => false (props have changed)');
      return false;
    }

    console.log('her 777');

    if (debug) debug.call(this, 'areEqual => true');
    return true;
  }

  /**
   * Predicate to check if props are equal. Checks in the tree for cursors and immutable structures
   * and if it is, check by reference.
   *
   * Override through `areEqual.withDefaults`.
   *
   * @param {Object} value
   * @param {Object} other
   *
   * @module areEqual.isEqualProps
   * @returns {Boolean}
   * @api public
   */
  function isEqualProps(value, other) {
    if (value === other) return true;
    var cursorsEqual = compare(
      value,
      other,
      _isCursor,
      _isEqualCursor
    );
    if (cursorsEqual !== void 0) return cursorsEqual;

    var immutableEqual = compare(
      value,
      other,
      _isImmutable,
      _isEqualImmutable
    );
    if (immutableEqual !== void 0) return immutableEqual;

    return isEqual(value, other, function(current, next) {
      if (current === next) return true;

      var cursorsEqual = compare(
        current,
        next,
        _isCursor,
        _isEqualCursor
      );
      if (cursorsEqual !== void 0) return cursorsEqual;

      return compare(current, next, _isImmutable, _isEqualImmutable);
    });
  }

  /**
   * Predicate to check if cursors are equal through reference checks. Uses `unCursor`.
   * Override through `areEqual.withDefaults` to support different cursor
   * implementations.
   *
   * @param {Cursor} a
   * @param {Cursor} b
   *
   * @module areEqual.isEqualCursor
   * @returns {Boolean}
   * @api public
   */
  function isEqualCursor(a, b) {
    return _unCursor(a) === _unCursor(b);
  }

  function debugFn(pattern, logFn) {
    if (typeof pattern === 'function') {
      logFn = pattern;
      pattern = void 0;
    }

    var logger = logFn;
    if (!logger && console.debug) {
      logger = console.debug.bind(console);
    }
    if (!logger && console.info) {
      logger = console.info.bind(console);
    }

    var regex = new RegExp(pattern || '.*');
    debug = function(str) {
      var element = this._reactInternalFiber
        ? this._reactInternalFiber
        : this._reactInternalInstance
          ? this._reactInternalInstance._currentElement
          : this._currentElement;
      var key = element && element.key ? ' key=' + element.key : '';
      var name = this.constructor.displayName;
      if (!key && !name) {
        name = 'Unknown';
      }
      var tag = name + key;
      if (regex.test(tag)) logger('<' + tag + '>: ' + str);
    };
    return debug;
  }
}

// Comparator used internally by isEqual implementation. Returns undefined
// if we should do recursive isEqual.
function compare(current, next, typeCheck, equalCheck) {
  var isCurrent = typeCheck(current);
  var isNext = typeCheck(next);
  if (isCurrent && isNext) {
    return equalCheck(current, next);
  }
  if (isCurrent || isNext) {
    return false;
  }
  return void 0;
}

/**
 * Predicate to check if immutable structures are equal through reference checks.
 * Override through `areEqual.withDefaults` to customize behaviour.
 *
 * @param {Immutable} a
 * @param {Immutable} b
 *
 * @module areEqual.isEqualImmutable
 * @returns {Boolean}
 * @api public
 */
function isEqualImmutable(a, b) {
  return a.equals(b);
}

/**
 * Predicate to check if a potential is an immutable structure or not.
 * Override through `areEqual.withDefaults` to support different cursor
 * implementations.
 *
 * @param {maybeImmutable} value to check if it is immutable.
 *
 * @module areEqual.isImmutable
 * @returns {Boolean}
 * @api public
 */
var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
function isImmutable(maybeImmutable) {
  return !!(maybeImmutable && maybeImmutable[IS_ITERABLE_SENTINEL]);
}

/**
 * Transforming function to take in cursor and return a non-cursor.
 * Override through `areEqual.withDefaults` to support different cursor
 * implementations.
 *
 * @param {cursor} cursor to transform
 *
 * @module areEqual.unCursor
 * @returns {Object|Number|String|Boolean}
 * @api public
 */
function unCursor(cursor) {
  return !isCursor(cursor) ? cursor : cursor.deref();
}

/**
 * Predicate to check if `potential` is Immutable cursor or not (defaults to duck testing
 * Immutable.js cursors). Can override through `.withDefaults()`.
 *
 * @param {potential} potential to check if is cursor
 *
 * @module areEqual.isCursor
 * @returns {Boolean}
 * @api public
 */
function isCursor(potential) {
  return !!(potential && typeof potential.deref === 'function');
}

function not(fn) {
  return function() {
    return !fn.apply(fn, arguments);
  };
}

function filter(obj, predicate) {
  return Object.keys(obj).reduce(function(acc, key) {
    if (predicate(obj[key], key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

/**
 * Predicate to check if a property on props should be ignored or not.
 * For now this defaults to ignore if property key is `statics`, but that
 * is deprecated behaviour, and will be removed by the next major release.
 *
 * Override through `areEqual.withDefaults`.
 *
 * @param {Object} value
 * @param {String} key
 *
 * @module areEqual.isIgnorable
 * @returns {Boolean}
 * @api public
 */
function isIgnorable(_, key) {
  return false;
}

function isChildren(_, key) {
  return key === 'children';
}

function or(fn1, fn2) {
  return function() {
    return fn1.apply(null, arguments) || fn2.apply(null, arguments);
  };
}
