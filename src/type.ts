import type { ReactNode } from 'react';
import type { INTERACTIONS } from './constants';

export type ActiveChangedCallback = (params: { isActive: boolean }) => void;

export interface Position {
  x: number;
  y: number;
}

export interface TouchEventOptions {
  e: TouchEvent;
  position: Position;
}

export interface ElementDimensions {
  width: number;
  height: number;
}

export interface DetectedEnvironment {
  isMouseDetected: boolean;
  isTouchDetected: boolean;
}

export interface CursorState {
  cursorKey: string;
  detectedEnvironment: DetectedEnvironment;
  elementDimensions: ElementDimensions;
  isActive: boolean;
  isPositionOutside: boolean;
  position: Position;
}

export interface ReactCursorPositionProps {
  cursorKey?: string;
  activationInteractionMouse?:
    | typeof INTERACTIONS.CLICK
    | typeof INTERACTIONS.HOVER;
  activationInteractionTouch?:
    | typeof INTERACTIONS.PRESS
    | typeof INTERACTIONS.TAP
    | typeof INTERACTIONS.TOUCH;
  children?: ReactNode;
  className?: string;
  hoverDelayInMs?: number;
  hoverOffDelayInMs?: number;
  isEnabled?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  mapChildProps?: (state: CursorState) => any;
  onActivationChanged?: (params: { isActive: boolean }) => void;
  onDetectedEnvironmentChanged?: (environment: DetectedEnvironment) => void;
  onPositionChanged?: (state: CursorState) => void;
  pressDurationInMs?: number;
  pressMoveThreshold?: number;
  shouldDecorateChildren?: boolean;
  shouldStopTouchMovePropagation?: boolean;
  style?: React.CSSProperties;
  tapDurationInMs?: number;
  tapMoveThreshold?: number;
}
