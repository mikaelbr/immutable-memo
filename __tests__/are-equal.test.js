import Immutable from 'immutable';
import Cursor from 'immutable/contrib/cursor';

import shouldComponentUpdate, {
  withDefaults
} from '../src/are-equal';

const isCursor = shouldComponentUpdate.isCursor;

describe('shouldComponentUpdate', () => {
  describe('should update', () => {
    test('when children has changed', () => {
      shouldNotBeEqual({
        children: { foo: 'hello' },
        nextChildren: { bar: 'bye' }
      });
    });

    test('when cursors are different', () => {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });

      shouldNotBeEqual({
        cursor: Cursor.from(data, ['foo']),
        nextCursor: Cursor.from(data, ['bar'])
      });
    });

    test('when a cursor changes to a non-cursor', () => {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var data2 = Immutable.fromJS({ foo: 'cat', bar: [1, 2, 3] });

      shouldNotBeEqual({
        cursor: { one: Cursor.from(data, ['foo']) },
        nextCursor: { one: data2 }
      });
    });

    test("when there's suddenly a cursor", () => {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });

      shouldNotBeEqual({ nextCursor: Cursor.from(data, ['bar']) });
    });

    test("when there's no longer a cursor", () => {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });

      shouldNotBeEqual({ cursor: Cursor.from(data, ['bar']) });
    });

    test('when one of multiple cursors have changed', () => {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var data2 = Immutable.fromJS({ baz: [1, 2, 3] });

      shouldNotBeEqual({
        cursor: {
          one: Cursor.from(data, ['foo']),
          two: Cursor.from(data2)
        },
        nextCursor: {
          one: Cursor.from(data, ['foo']).update(function() {
            return 1;
          }),
          two: Cursor.from(data2)
        }
      });
    });

    test('when object literal has changed even if the cursor is the same', () => {
      var data = Immutable.fromJS({ foo: 'bar' });

      shouldNotBeEqual({
        cursor: { one: Cursor.from(data), two: { foo: 'hello' } },
        nextCursor: {
          one: Cursor.from(data),
          two: { bar: 'good bye' }
        }
      });
    });

    test('when same cursors change keys', () => {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });

      shouldNotBeEqual({
        cursor: { one: Cursor.from(data, ['foo']) },
        nextCursor: { changed: Cursor.from(data, ['foo']) }
      });
    });

    test('when props have immutable structures', () => {
      shouldNotBeEqual({
        cursor: { foo: Immutable.List.of(1) },
        nextCursor: { foo: Immutable.List.of(2) }
      });
    });

    test('when namespaced cursors changed', () => {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var one = Cursor.from(data, ['foo']);
      var two = Cursor.from(data, ['bar']);
      var three = one.update(function() {
        return 'changed';
      });

      shouldNotBeEqual({
        cursor: {
          ns: {
            one: one,
            two: two
          }
        },
        nextCursor: {
          ns: {
            one: three,
            two: two
          }
        }
      });
    });

    test('when namespaced cursors changed to non cursor', () => {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var one = Cursor.from(data, ['foo']);
      var two = Cursor.from(data, ['bar']);

      shouldNotBeEqual({
        cursor: {
          ns: {
            one: one,
            two: two
          }
        },
        nextCursor: {
          ns: {
            one: 'foo',
            two: two
          }
        }
      });
    });
  });

  describe('should not update', () => {
    test('when no data is passed to component', () => {
      shouldBeEqual({});
    });

    test('when props have same immutable structures', () => {
      var map = Immutable.List.of(1);
      shouldBeEqual({
        props: { foo: map },
        nextProps: { foo: map }
      });
    });

    test('when props is unchanged', () => {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var props = { one: Cursor.from(data, ['foo']) };
      shouldBeEqual({
        cursor: props,
        nextCursor: props
      });
    });

    test('when passing same cursors', () => {
      var data = Immutable.fromJS({ foo: 'bar' });

      shouldBeEqual({
        cursor: Cursor.from(data),
        nextCursor: Cursor.from(data)
      });
    });

    test('when passing same cursors and same data for multiple values', () => {
      var data = Immutable.fromJS({ foo: 'bar' });

      shouldBeEqual({
        cursor: { one: Cursor.from(data), two: { foo: 'hello' } },
        nextCursor: { one: Cursor.from(data), two: { foo: 'hello' } }
      });
    });

    test('when multiple cursors point to the same data', () => {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var data2 = Immutable.fromJS({ baz: [1, 2, 3] });

      shouldBeEqual({
        cursor: {
          one: Cursor.from(data, ['foo']),
          two: Cursor.from(data2)
        },
        nextCursor: {
          one: Cursor.from(data, ['foo']),
          two: Cursor.from(data2)
        }
      });
    });

    test('when namespaced cursors is unchanged', () => {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var one = Cursor.from(data, ['foo']);
      var two = Cursor.from(data, ['bar']);

      shouldBeEqual({
        cursor: {
          ns: {
            one: one,
            two: two
          }
        },
        nextCursor: {
          ns: {
            one: one,
            two: two
          }
        }
      });
    });
  });

  describe('overridables', () => {
    describe('internal', () => {
      test('should create different instances', () => {
        var localOne = withDefaults();
        var localTwo = withDefaults();

        expect(localOne).not.toBe(localTwo);
      });

      test('should have overridable isCursor', done => {
        var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
        var called = 0;
        var local = withDefaults({
          isCursor: function() {
            called++;
            return true;
          }
        });

        shouldNotBeEqual(
          {
            cursor: Cursor.from(data, ['foo']),
            nextCursor: Cursor.from(data, ['bar'])
          },
          local
        );

        expect(called).toBeGreaterThan(1);
        done();
      });

      test('should have overridable isIgnorable', () => {
        var numCalls = 0;
        var local = withDefaults({
          isIgnorable: function foobar(value, key) {
            numCalls++;
            return key === 'ignore';
          }
        });

        shouldBeEqual(
          {
            cursor: { ignore: 'hello' },
            nextCursor: { ignore: 'bye' }
          },
          local
        );

        expect(numCalls).toBeGreaterThan(1);
      });

      test('should have debug on product of withDefaults', () => {
        var localComponent = withDefaults({
          isCursor: function() {}
        });
        expect(typeof localComponent.debug).toBe('function');
      });

      test('should have overridable isImmutable', done => {
        var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
        var map = Immutable.List.of(1);

        var i = 0;
        var local = withDefaults({
          isImmutable: function() {
            if (i++ === 1) {
              done();
            }
          }
        });

        shouldBeEqual(
          {
            cursor: { foo: map },
            nextCursor: { foo: map }
          },
          local
        );
      });

      test('should have overridable isEqualProps', done => {
        var local = withDefaults({
          isEqualProps: function foobar() {
            done();
          }
        });

        shouldNotBeEqual(
          {
            cursor: { foo: 1 },
            nextCursor: { foo: 2 }
          },
          local
        );
      });

      test('should have accessible helpers (isCursor, isEqualProps, isEqualCursor) to use externally', () => {
        var local = withDefaults();

        expect(shouldComponentUpdate).toHaveProperty('isCursor');
        expect(shouldComponentUpdate).toHaveProperty('isEqualProps');
        expect(shouldComponentUpdate).toHaveProperty('isEqualCursor');
        expect(shouldComponentUpdate).toHaveProperty('isImmutable');

        expect(local).toHaveProperty('isCursor');
        expect(local).toHaveProperty('isEqualProps');
        expect(local).toHaveProperty('isEqualCursor');
        expect(local).toHaveProperty('isImmutable');
      });
    });
  });
});

function shouldBeEqual(opts, fn) {
  expect(callShouldUpdate(opts, fn)).toBe(true);
}

function shouldNotBeEqual(opts, fn) {
  expect(callShouldUpdate(opts, fn)).toBe(false);
}

function callShouldUpdate(opts, fn) {
  fn = fn || shouldComponentUpdate;

  var props = isCursor(opts.cursor)
    ? { cursor: opts.cursor }
    : opts.cursor;
  var nextProps = isCursor(opts.nextCursor)
    ? { cursor: opts.nextCursor }
    : opts.nextCursor;

  props = props || {};
  nextProps = nextProps || {};

  if (opts.children || opts.nextChildren) {
    props.children = opts.children;
    nextProps.children = opts.nextChildren;
  }

  return fn(props, nextProps);
}
