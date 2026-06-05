import { TAP_GESTURE_TIMER_NAME } from '../constants';
import TouchEnvironmentActivation from './TouchEnvironmentActivation';
import type { ActiveChangedCallback, TouchEventOptions } from '../type';

interface TapActivationOptions {
  onIsActiveChanged: ActiveChangedCallback;
  tapDurationInMs: number;
  tapMoveThreshold: number;
}

export default class TapActivation extends TouchEnvironmentActivation {
  private hasTapGestureEnded: boolean;
  private readonly tapDurationInMs: number;
  private readonly tapMoveThreshold: number;

  constructor({
    onIsActiveChanged,
    tapDurationInMs,
    tapMoveThreshold,
  }: TapActivationOptions) {
    super({ onIsActiveChanged });

    this.hasTapGestureEnded = false;
    this.tapDurationInMs = tapDurationInMs;
    this.tapMoveThreshold = tapMoveThreshold;
  }

  touchStarted({ position }: TouchEventOptions): void {
    this.hasTapGestureEnded = false;
    this.initMoveThreshold(position);
    this.setTapEventTimer();
  }

  touchMoved({ position }: TouchEventOptions): void {
    if (this.isActive) {
      return;
    }

    this.setMoveThresholdCriteria(position);
  }

  touchEnded(): void {
    this.hasTapGestureEnded = true;
  }

  private get isTapGestureActive(): boolean {
    return (
      this.getMoveDistance() <= this.tapMoveThreshold && this.hasTapGestureEnded
    );
  }

  private setTapEventTimer(): void {
    this.timers.push({
      name: TAP_GESTURE_TIMER_NAME,
      id: setTimeout(() => {
        if (this.isTapGestureActive) {
          this.toggleActivation();
        }
      }, this.tapDurationInMs),
    });
  }
}
