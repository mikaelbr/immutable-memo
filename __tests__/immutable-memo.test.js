import renderer from 'react-test-renderer';
import Immutable from 'immutable';
import React from 'react';

import memo from '../src/immutable-memo';

describe('immutable-memo', function() {
  it('should not render twice if unchanged', function() {
    var d1 = Immutable.fromJS({ foo: 'bar' });
    var d2 = Immutable.fromJS({ foo: 'bar' });

    const fn = jest.fn();
    const MyComponent = memo(function Component({ data }) {
      fn();
      return <h1>Hello {data.get('foo')}</h1>;
    });

    const r = renderer.create(<MyComponent data={d1} />);
    r.update(<MyComponent data={d2} />);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should render twice if unchanged but have children', function() {
    var d1 = Immutable.fromJS({ foo: 'bar' });
    var d2 = Immutable.fromJS({ foo: 'bar' });

    const fn = jest.fn();
    const MyComponent = memo(function Component({ data }) {
      fn();
      return <h1>Hello {data.get('foo')}</h1>;
    });

    const r = renderer.create(
      <MyComponent data={d1}>
        <h1>Hello</h1>
      </MyComponent>
    );

    r.update(
      <MyComponent data={d2}>
        <h1>Hello</h1>
      </MyComponent>
    );
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
