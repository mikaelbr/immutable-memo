# [WIP] `immutable-memo`

Uses a pre-defined function for equal comparison with `React.memo` for
creating functions for memoization with immutable data structures (Immutable.js).

## Example

```js
import memo from 'immutable-memo';

const Component = memo(function MyComponent(props) {
  /* render using props */
});
```
