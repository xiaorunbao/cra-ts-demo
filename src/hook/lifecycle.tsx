import { useRef } from 'react';

export const useComponentWillMount = (method: Function) => {
  const isMethodCalled = useRef(false);
  if (!isMethodCalled.current) {
    method();
    isMethodCalled.current = true;
  }
};
