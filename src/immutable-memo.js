import React from 'react';
import areEqual from './are-equal';

export default function memo(Component) {
  return React.memo(Component, areEqual);
}
