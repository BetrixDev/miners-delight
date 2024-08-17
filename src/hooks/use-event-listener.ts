import { useEffect } from "react";

export function useEventListener<TEvent extends keyof WindowEventMap>(
  cb: (event: WindowEventMap[TEvent]) => void,
  eventName: TEvent
) {
  useEffect(() => {
    function handler(e: WindowEventMap[TEvent]) {
      cb(e);
    }

    window.addEventListener(eventName, handler);

    return () => {
      window.removeEventListener(eventName, handler);
    };
  }, []);
}
