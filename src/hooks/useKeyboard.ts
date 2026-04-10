import { useEffect, useRef } from 'react';

interface Keys {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  space: boolean;
  q: boolean;
  e: boolean;
  shift: boolean;
  f: boolean;
}

export const useKeyboard = () => {
  const keys = useRef<Keys>({ w: false, a: false, s: false, d: false, space: false, q: false, e: false, shift: false, f: false });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === ' ') keys.current.space = true;
      else if (k === 'shift') keys.current.shift = true;
      else if (k in keys.current) (keys.current as any)[k] = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === ' ') keys.current.space = false;
      else if (k === 'shift') keys.current.shift = false;
      else if (k in keys.current) (keys.current as any)[k] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  return keys;
};
