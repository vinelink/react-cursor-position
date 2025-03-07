import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type ReactElement,
  useMemo,
} from "react";
import Core from "./lib/ElementRelativeCursorPosition";
import {
  DEFAULT_CURSOR_STATE,
  INTERACTIONS,
  MOUSE_EMULATION_GUARD_TIMER_NAME,
} from "./constants";
import PressActivation from "./lib/PressActivation";
import TouchActivation from "./lib/TouchActivation";
import TapActivation from "./lib/TapActivation";
import HoverActivation from "./lib/HoverActivation";
import ClickActivation from "./lib/ClickActivation";
import type TouchEnvironmentActivation from "./lib/TouchEnvironmentActivation";
import type MouseEnvironmentActivation from "./lib/MouseEnvironmentActivation";
import useEventListener from "./utils/useEventListener";
import type {
  CursorState,
  ElementDimensions,
  Position,
  ReactCursorPositionProps,
} from "./type";
import ReactCursorPositionContext from "./context";

export { INTERACTIONS };

const defaultProps: ReactCursorPositionProps = {
  activationInteractionMouse: INTERACTIONS.HOVER,
  activationInteractionTouch: INTERACTIONS.PRESS,
  hoverDelayInMs: 0,
  hoverOffDelayInMs: 0,
  isEnabled: true,
  mapChildProps: (props: CursorState) => props,
  onActivationChanged: () => {},
  onDetectedEnvironmentChanged: () => {},
  onPositionChanged: () => {},
  pressDurationInMs: 500,
  pressMoveThreshold: 5,
  shouldDecorateChildren: true,
  shouldStopTouchMovePropagation: false,
  tapDurationInMs: 180,
  tapMoveThreshold: 5,
  cursorKey: "cursor_key",
};

const ReactCursorPosition: React.FC<ReactCursorPositionProps> = (props) => {
  const {
    activationInteractionMouse = defaultProps.activationInteractionMouse!,
    activationInteractionTouch = defaultProps.activationInteractionTouch!,
    children,
    className,
    hoverDelayInMs = defaultProps.hoverDelayInMs!,
    hoverOffDelayInMs = defaultProps.hoverOffDelayInMs!,
    isEnabled = defaultProps.isEnabled!,
    mapChildProps = defaultProps.mapChildProps!,
    onActivationChanged = defaultProps.onActivationChanged!,
    onDetectedEnvironmentChanged = defaultProps.onDetectedEnvironmentChanged!,
    onPositionChanged = defaultProps.onPositionChanged!,
    pressDurationInMs = defaultProps.pressDurationInMs!,
    pressMoveThreshold = defaultProps.pressMoveThreshold!,
    shouldDecorateChildren = defaultProps.shouldDecorateChildren!,
    shouldStopTouchMovePropagation = defaultProps.shouldStopTouchMovePropagation!,
    style,
    tapDurationInMs = defaultProps.tapDurationInMs!,
    tapMoveThreshold = defaultProps.tapMoveThreshold!,
    cursorKey = defaultProps.cursorKey!,
  } = props;

  const [state, setState] = useState<CursorState>({
    ...DEFAULT_CURSOR_STATE,
    cursorKey,
  });

  const [elNode, setElNode] = useState<HTMLDivElement | null>(null);
  const coreRef = useRef<Core | null>(null);
  const timersRef = useRef<Array<{ name: string; id: number }>>([]);
  const shouldGuardAgainstMouseEmulationRef = useRef(false);
  const touchActivationRef = useRef<TouchEnvironmentActivation>(null);
  const mouseActivationRef = useRef<MouseEnvironmentActivation>(null);

  const elRef = useCallback((el: HTMLDivElement) => {
    setElNode(el);
  }, []);

  const getElementDimensions = useCallback(
    (el: HTMLElement): ElementDimensions => {
      const { width, height } = el.getBoundingClientRect();
      return { width, height };
    },
    []
  );

  const init = useCallback(() => {
    if (!elNode) return;
    coreRef.current = new Core(elNode);
    const dimensions = getElementDimensions(elNode);
    setState((prev) => ({
      ...prev,
      elementDimensions: dimensions,
    }));
  }, [elNode, getElementDimensions]);

  const setPositionState = useCallback(
    (position: Position) => {
      const isPositionOutside =
        position.x < 0 ||
        position.y < 0 ||
        position.x > state.elementDimensions.width ||
        position.y > state.elementDimensions.height;

      setState((prev) => ({
        ...prev,
        isPositionOutside,
        position,
      }));
    },
    [state.elementDimensions]
  );

  const onIsActiveChanged = useCallback(
    ({ isActive }: { isActive: boolean }) => {
      setState((prev) => ({ ...prev, isActive }));
      onActivationChanged({ isActive });
    },
    [onActivationChanged]
  );

  useEffect(() => {
    const setTouchActivation = () => {
      switch (activationInteractionTouch) {
        case INTERACTIONS.PRESS:
          touchActivationRef.current = new PressActivation({
            onIsActiveChanged,
            pressDurationInMs,
            pressMoveThreshold,
          });
          break;
        case INTERACTIONS.TAP:
          touchActivationRef.current = new TapActivation({
            onIsActiveChanged,
            tapDurationInMs,
            tapMoveThreshold,
          });
          break;
        case INTERACTIONS.TOUCH:
          touchActivationRef.current = new TouchActivation({
            onIsActiveChanged,
          });
          break;
        default:
          throw new Error("Must implement a touch activation strategy");
      }
    };

    const setMouseActivation = () => {
      switch (activationInteractionMouse) {
        case INTERACTIONS.HOVER:
          mouseActivationRef.current = new HoverActivation({
            onIsActiveChanged,
            hoverDelayInMs,
            hoverOffDelayInMs,
          });
          break;
        case INTERACTIONS.CLICK:
          mouseActivationRef.current = new ClickActivation({
            onIsActiveChanged,
          });
          break;
        default:
          throw new Error("Must implement a mouse activation strategy");
      }
    };

    setTouchActivation();
    setMouseActivation();
  }, [
    activationInteractionTouch,
    activationInteractionMouse,
    onIsActiveChanged,
    pressDurationInMs,
    pressMoveThreshold,
    tapDurationInMs,
    tapMoveThreshold,
    hoverDelayInMs,
    hoverOffDelayInMs,
  ]);

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      init();
      setState((prev) => ({
        ...prev,
        detectedEnvironment: {
          isTouchDetected: true,
          isMouseDetected: false,
        },
      }));
      shouldGuardAgainstMouseEmulationRef.current = true;

      if (!coreRef.current) return;
      const position = coreRef.current.getCursorPosition(e.touches[0]);
      setPositionState(position);

      touchActivationRef.current?.touchStarted({ e, position });
    },
    [init, setPositionState]
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!coreRef.current) return;

      const position = coreRef.current.getCursorPosition(e.touches[0]);
      touchActivationRef.current?.touchMoved({ e, position });

      if (!state.isActive) return;

      setPositionState(position);
      e.preventDefault();

      if (shouldStopTouchMovePropagation) {
        e.stopPropagation();
      }
    },
    [state.isActive, setPositionState, shouldStopTouchMovePropagation]
  );

  const onTouchEnd = useCallback(() => {
    touchActivationRef.current?.touchEnded();
    timersRef.current.push({
      name: MOUSE_EMULATION_GUARD_TIMER_NAME,
      id: window.setTimeout(() => {
        shouldGuardAgainstMouseEmulationRef.current = false;
      }, 0),
    });
  }, []);

  const onTouchCancel = useCallback(() => {
    touchActivationRef.current?.touchCanceled();
    timersRef.current.push({
      name: MOUSE_EMULATION_GUARD_TIMER_NAME,
      id: window.setTimeout(() => {
        shouldGuardAgainstMouseEmulationRef.current = false;
      }, 0),
    });
  }, []);

  const onMouseEnter = useCallback(
    (e: MouseEvent) => {
      if (shouldGuardAgainstMouseEmulationRef.current) return;

      init();
      setState((prev) => ({
        ...prev,
        detectedEnvironment: {
          isTouchDetected: false,
          isMouseDetected: true,
        },
      }));

      if (!coreRef.current) return;
      setPositionState(coreRef.current.getCursorPosition(e));
      mouseActivationRef.current?.mouseEntered();
    },
    [init, setPositionState]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!coreRef.current) return;

      const position = coreRef.current.getCursorPosition(e);
      setPositionState(position);
      mouseActivationRef.current?.mouseMoved(position);
    },
    [setPositionState]
  );

  const onMouseLeave = useCallback(() => {
    mouseActivationRef.current?.mouseLeft();
    setState((prev) => ({ ...prev, isPositionOutside: true }));
  }, []);

  const onClick = useCallback(
    (e: MouseEvent) => {
      if (!coreRef.current) return;
      setPositionState(coreRef.current.getCursorPosition(e));
      mouseActivationRef.current?.mouseClicked();
      setState((prev) => ({
        ...prev,
        detectedEnvironment: {
          isTouchDetected: false,
          isMouseDetected: true,
        },
      }));
    },
    [setPositionState]
  );

  const listenerOptionsWithPassive = useMemo(
    () => ({
      passive: false,
      enabled: isEnabled,
    }),
    [isEnabled]
  );

  const listenerOptions = useMemo(
    () => ({
      enabled: isEnabled,
    }),
    [isEnabled]
  );

  useEventListener(
    elNode,
    "touchstart",
    onTouchStart,
    listenerOptionsWithPassive
  );
  useEventListener(
    elNode,
    "touchmove",
    onTouchMove,
    listenerOptionsWithPassive
  );

  useEventListener(elNode, "touchend", onTouchEnd, listenerOptions);
  useEventListener(elNode, "touchcancel", onTouchCancel, listenerOptions);
  useEventListener(elNode, "mouseenter", onMouseEnter, listenerOptions);
  useEventListener(elNode, "mousemove", onMouseMove, listenerOptions);
  useEventListener(elNode, "mouseleave", onMouseLeave, listenerOptions);
  useEventListener(elNode, "click", onClick, listenerOptions);

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current) {
        clearTimeout(timer.id);
      }
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    onPositionChanged(state);
  }, [state, onPositionChanged]);

  useEffect(() => {
    onDetectedEnvironmentChanged(state.detectedEnvironment);
  }, [state.detectedEnvironment, onDetectedEnvironmentChanged]);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const decorateChild = useCallback((child: ReactElement, props: any) => {
    return React.cloneElement(child, props);
  }, []);

  const shouldDecorateChild = useCallback(
    (child: ReactElement) => {
      return (
        !!child && typeof child.type === "function" && shouldDecorateChildren
      );
    },
    [shouldDecorateChildren]
  );

  const decorateChildren = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (children: ReactNode, props: any) => {
      return React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return shouldDecorateChild(child) ? decorateChild(child, props) : child;
      });
    },
    [shouldDecorateChild, decorateChild]
  );

  const childProps = mapChildProps(state);

  return (
    <ReactCursorPositionContext.Provider value={{ state, setState }}>
      <div
        className={className}
        ref={elRef}
        style={{
          ...style,
          WebkitUserSelect: "none",
        }}
      >
        {decorateChildren(children, childProps)}
      </div>
    </ReactCursorPositionContext.Provider>
  );
};

export default ReactCursorPosition;
