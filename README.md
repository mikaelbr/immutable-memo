# `immutable-memo`

Uses a pre-defined function for equal comparison with `React.memo` for
creating functions for memoization with immutable data structures (Immutable.js).

This project is based on the `shouldComponentUpdate` function of [Omniscient.js](https://github.com/omniscientjs/omniscient)

Will not rerender if equal immutable data structures between renders. But will
render if it has children.

## Install

```
npm i immutable-memo
```

## Example

```js
import React from 'react';
import memo from 'immutable-memo';
import immutable from 'immutable';

const Hello = memo(function Hello({ name }) {
  return <h1>{name.deref()}</h1>;
});

const data = Immutable.fromJS({ name: 'Carol' });
React.render(<Hello name={data.get('name')} />);
React.render(<Hello name={data.get('name')} />); // Will not rerender
```
