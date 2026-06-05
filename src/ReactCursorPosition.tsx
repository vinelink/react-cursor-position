import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
  type ReactElement,
} from 'react';
import Core from './lib/ElementRelativeCursorPosition';
import {
  DEFAULT_CURSOR_STATE,
  INTERACTIONS,
  MOUSE_EMULATION_GUARD_TIMER_NAME,
} from './constants';
import PressActivation from './lib/PressActivation';
import TouchActivation from './lib/TouchActivation';
import TapActivation from './lib/TapActivation';
import HoverActivation from './lib/HoverActivation';
import ClickActivation from './lib/ClickActivation';
import type TouchEnvironmentActivation from './lib/TouchEnvironmentActivation';
import type MouseEnvironmentActivation from './lib/MouseEnvironmentActivation';
import useEventListener from './utils/useEventListener';
import useLatest from './utils/useLatest';
import type {
  CursorState,
  ElementDimensions,
  Position,
  ReactCursorPositionProps,
} from './type';
import ReactCursorPositionContext from './context';

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
};

const REACT_MEMO_TYPE = Symbol.for('react.memo');
const REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');

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
  } = props;

  const [state, setState] = useState<CursorState>(DEFAULT_CURSOR_STATE);

  const [elNode, setElNode] = useState<HTMLDivElement | null>(null);
  const coreRef = useRef<Core | null>(null);
  const timersRef = useRef<Array<{ name: string; id: number }>>([]);
  const shouldGuardAgainstMouseEmulationRef = useRef(false);
  const touchActivationRef = useRef<TouchEnvironmentActivation | null>(null);
  const mouseActivationRef = useRef<MouseEnvironmentActivation | null>(null);

  const onActivationChangedRef = useLatest(onActivationChanged);
  const isActiveRef = useRef(state.isActive);
  isActiveRef.current = state.isActive;

  const elRef = useCallback((el: HTMLDivElement | null) => {
    setElNode(el);
  }, []);

  const getElementDimensions = useCallback(
    (el: HTMLElement): ElementDimensions => {
      const { width, height } = el.getBoundingClientRect();
      return { width, height };
    },
    [],
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

  const setPositionState = useCallback((position: Position) => {
    setState((prev) => {
      const isPositionOutside =
        position.x < 0 ||
        position.y < 0 ||
        position.x > prev.elementDimensions.width ||
        position.y > prev.elementDimensions.height;

      return { ...prev, isPositionOutside, position };
    });
  }, []);

  const onIsActiveChanged = useCallback(
    ({ isActive }: { isActive: boolean }) => {
      setState((prev) => ({ ...prev, isActive }));
      onActivationChangedRef.current({ isActive });
    },
    [onActivationChangedRef],
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
          throw new Error('Must implement a touch activation strategy');
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
          throw new Error('Must implement a mouse activation strategy');
      }
    };

    setTouchActivation();
    setMouseActivation();

    return () => {
      touchActivationRef.current?.clearTimers();
      mouseActivationRef.current?.clearTimers();
    };
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
    [init, setPositionState],
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!coreRef.current) return;

      const position = coreRef.current.getCursorPosition(e.touches[0]);
      touchActivationRef.current?.touchMoved({ e, position });

      if (!isActiveRef.current) return;

      setPositionState(position);
      e.preventDefault();

      if (shouldStopTouchMovePropagation) {
        e.stopPropagation();
      }
    },
    [setPositionState, shouldStopTouchMovePropagation],
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
    [init, setPositionState],
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!coreRef.current) return;

      const position = coreRef.current.getCursorPosition(e);
      setPositionState(position);
      mouseActivationRef.current?.mouseMoved(position);
    },
    [setPositionState],
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
    [setPositionState],
  );

  const listenerOptionsWithPassive = useMemo(
    () => ({
      passive: false,
      enabled: isEnabled,
    }),
    [isEnabled],
  );

  const listenerOptions = useMemo(
    () => ({
      enabled: isEnabled,
    }),
    [isEnabled],
  );

  useEventListener(
    elNode,
    'touchstart',
    onTouchStart,
    listenerOptionsWithPassive,
  );
  useEventListener(elNode, 'touchmove', onTouchMove, listenerOptionsWithPassive);
  useEventListener(elNode, 'touchend', onTouchEnd, listenerOptions);
  useEventListener(elNode, 'touchcancel', onTouchCancel, listenerOptions);
  useEventListener(elNode, 'mouseenter', onMouseEnter, listenerOptions);
  useEventListener(elNode, 'mousemove', onMouseMove, listenerOptions);
  useEventListener(elNode, 'mouseleave', onMouseLeave, listenerOptions);
  useEventListener(elNode, 'click', onClick, listenerOptions);

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current) {
        clearTimeout(timer.id);
      }
      timersRef.current = [];
    };
  }, []);

  const skipFirstPositionRef = useRef(true);
  // biome-ignore lint/correctness/useExhaustiveDependencies: fire only on position change
  useEffect(() => {
    if (skipFirstPositionRef.current) {
      skipFirstPositionRef.current = false;
      return;
    }
    onPositionChanged(state);
  }, [state.position]);

  const skipFirstEnvironmentRef = useRef(true);
  // biome-ignore lint/correctness/useExhaustiveDependencies: fire only on environment change
  useEffect(() => {
    if (skipFirstEnvironmentRef.current) {
      skipFirstEnvironmentRef.current = false;
      return;
    }
    onDetectedEnvironmentChanged(state.detectedEnvironment);
  }, [state.detectedEnvironment]);

  const decorateChild = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: cloned props are caller-defined
    (child: ReactElement, childProps: any) => {
      return React.cloneElement(child, childProps);
    },
    [],
  );

  const shouldDecorateChild = useCallback(
    (child: ReactElement): boolean => {
      if (!child || !shouldDecorateChildren) return false;

      const { type } = child;
      if (typeof type === 'function') return true;

      if (typeof type === 'object' && type !== null) {
        const $$typeof = (type as { $$typeof?: symbol }).$$typeof;
        return (
          $$typeof === REACT_MEMO_TYPE || $$typeof === REACT_FORWARD_REF_TYPE
        );
      }

      return false;
    },
    [shouldDecorateChildren],
  );

  const decorateChildren = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: cloned props are caller-defined
    (childrenToDecorate: ReactNode, childProps: any) => {
      return React.Children.map(childrenToDecorate, (child) => {
        if (!React.isValidElement(child)) return child;
        return shouldDecorateChild(child as ReactElement)
          ? decorateChild(child as ReactElement, childProps)
          : child;
      });
    },
    [shouldDecorateChild, decorateChild],
  );

  const childProps = mapChildProps(state);

  return (
    <ReactCursorPositionContext.Provider value={{ state, setState }}>
      <div
        className={className}
        ref={elRef}
        style={{
          ...style,
          WebkitUserSelect: 'none',
        }}
      >
        {decorateChildren(children, childProps)}
      </div>
    </ReactCursorPositionContext.Provider>
  );
};

export default ReactCursorPosition;
