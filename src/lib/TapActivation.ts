import { TAP_GESTURE_TIMER_NAME } from '../constants';
import TouchEnvironmentActivation from './TouchEnvironmentActivation';
import type {
  ActiveChangedCallback,
  Position,
  TouchEventOptions,
} from '../type';

export default class TapActivation extends TouchEnvironmentActivation {
  private hasTapGestureEnded: boolean;
  private tapDurationInMs: number;
  private tapMoveThreshold: number;
  protected initialElTop: number;
  protected currentElTop: number;

  constructor({
    onIsActiveChanged,
    tapDurationInMs,
    tapMoveThreshold,
  }: {
    onIsActiveChanged: ActiveChangedCallback;
    tapDurationInMs: number;
    tapMoveThreshold: number;
  }) {
    super({ onIsActiveChanged });

    this.hasTapGestureEnded = false;
    this.tapDurationInMs = tapDurationInMs;
    this.tapMoveThreshold = tapMoveThreshold;
    this.initialElTop = 0;
    this.currentElTop = 0;
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

  private get hasPassedMoveThreshold(): boolean {
    return (
      Math.abs(this.currentElTop - this.initialElTop) > this.tapMoveThreshold
    );
  }

  private get isTapGestureActive(): boolean {
    return !this.hasPassedMoveThreshold && this.hasTapGestureEnded;
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

  private setMoveThresholdCriteria(position: Position): void {
    this.currentElTop = position.y;
  }

  private initMoveThreshold(position: Position): void {
    const top = position.y;
    this.initialElTop = top;
    this.currentElTop = top;
  }
}
