import { useEffect, useRef } from 'react';

export default function usePrevious(value) {
  const ref = useRef();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
