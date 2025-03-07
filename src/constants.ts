import type { CursorState } from './type';

export const PRESS_EVENT_TIMER_NAME = 'pressEvent';
export const TAP_GESTURE_TIMER_NAME = 'tap';
export const MOUSE_EMULATION_GUARD_TIMER_NAME = 'mouseEmulation';
export const SET_ACTIVATION_TIMER_NAME = 'setHovering';
export const UNSET_ACTIVATION_TIMER_NAME = 'unsetHovering';
export const INTERACTIONS = {
  TOUCH: 'touch',
  TAP: 'tap',
  DOUBLE_TAP: 'double_tap',
  PRESS: 'press',
  CLICK: 'click',
  HOVER: 'hover',
};

export const DEFAULT_CURSOR_STATE: CursorState = {
  cursorKey: '',
  detectedEnvironment: {
    isMouseDetected: false,
    isTouchDetected: false,
  },
  elementDimensions: {
    width: 0,
    height: 0,
  },
  isActive: false,
  isPositionOutside: true,
  position: {
    x: 0,
    y: 0,
  },
};
