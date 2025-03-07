import { useEffect, useRef } from 'react';

const useEventListener = <T extends Event>(
  node: HTMLElement | null,
  eventName: string,
  handler: (event: T) => void,
  options: AddEventListenerOptions & { enabled?: boolean } = {},
) => {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const { enabled = true, ...restOptions } = options;
    if (!node || !enabled) return;

    const listener = (event: Event) => savedHandler.current(event as T);
    node.addEventListener(eventName, listener, restOptions);

    return () => {
      node.removeEventListener(eventName, listener, restOptions);
    };
  }, [node, eventName, options]);
};

export default useEventListener;
