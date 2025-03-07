import { PRESS_EVENT_TIMER_NAME } from '../constants';
import TouchEnvironmentActivation from './TouchEnvironmentActivation';
import type { ActiveChangedCallback, TouchEventOptions } from '../type';

interface Position {
  x: number;
  y: number;
}

interface PressActivationOptions {
  onIsActiveChanged: ActiveChangedCallback;
  pressDurationInMs: number;
  pressMoveThreshold: number;
}

export default class PressActivation extends TouchEnvironmentActivation {
  private readonly pressDurationInMs: number;
  private readonly pressMoveThreshold: number;
  protected currentElTop: number;
  protected initialElTop: number;

  constructor({
    onIsActiveChanged,
    pressDurationInMs,
    pressMoveThreshold,
  }: PressActivationOptions) {
    super({ onIsActiveChanged });

    this.pressDurationInMs = pressDurationInMs;
    this.pressMoveThreshold = pressMoveThreshold;
    this.currentElTop = 0;
    this.initialElTop = 0;
  }

  touchStarted({ position }: TouchEventOptions): void {
    this.initPressEventCriteria(position);
    this.setPressEventTimer();
  }

  touchMoved({ position }: TouchEventOptions): void {
    if (this.isActive) {
      return;
    }

    this.setPressEventCriteria(position);
  }

  private setPressEventTimer(): void {
    this.timers.push({
      name: PRESS_EVENT_TIMER_NAME,
      id: setTimeout(() => {
        if (
          Math.abs(this.currentElTop - this.initialElTop) <
          this.pressMoveThreshold
        ) {
          this.activate();
        }
      }, this.pressDurationInMs),
    });
  }

  private setPressEventCriteria(position: Position): void {
    this.currentElTop = position.y;
  }

  private initPressEventCriteria(position: Position): void {
    const top = position.y;
    this.initialElTop = top;
    this.currentElTop = top;
  }
}
