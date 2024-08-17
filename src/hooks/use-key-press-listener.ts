import { useEffect } from "react";

export function useKeyPressListener(
  cb: (e: KeyboardEvent, key: string) => void,
  keys: string[] | string
) {
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (!Array.isArray(keys)) {
        if (e.key.toLowerCase() === keys.toLowerCase()) {
          cb(e, e.key);
        }
      } else {
        if (keys.length === 0) {
          cb(e, e.key);
          return;
        }

        const isValidKeyPress =
          keys.find((k) => k.toLowerCase() === e.key.toLowerCase()) !==
          undefined;

        if (isValidKeyPress) {
          cb(e, e.key);
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [cb, keys]);
}
