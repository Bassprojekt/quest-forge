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
      else if (k === 'w') keys.current.w = true;
      else if (k === 'a') keys.current.a = true;
      else if (k === 's') keys.current.s = true;
      else if (k === 'd') keys.current.d = true;
      else if (k === 'q') keys.current.q = true;
      else if (k === 'e') keys.current.e = true;
      else if (k === 'f') keys.current.f = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === ' ') keys.current.space = false;
      else if (k === 'shift') keys.current.shift = false;
      else if (k === 'w') keys.current.w = false;
      else if (k === 'a') keys.current.a = false;
      else if (k === 's') keys.current.s = false;
      else if (k === 'd') keys.current.d = false;
      else if (k === 'q') keys.current.q = false;
      else if (k === 'e') keys.current.e = false;
      else if (k === 'f') keys.current.f = false;
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
