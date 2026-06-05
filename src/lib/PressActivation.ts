import { PRESS_EVENT_TIMER_NAME } from '../constants';
import TouchEnvironmentActivation from './TouchEnvironmentActivation';
import type { ActiveChangedCallback, TouchEventOptions } from '../type';

interface PressActivationOptions {
  onIsActiveChanged: ActiveChangedCallback;
  pressDurationInMs: number;
  pressMoveThreshold: number;
}

export default class PressActivation extends TouchEnvironmentActivation {
  private readonly pressDurationInMs: number;
  private readonly pressMoveThreshold: number;

  constructor({
    onIsActiveChanged,
    pressDurationInMs,
    pressMoveThreshold,
  }: PressActivationOptions) {
    super({ onIsActiveChanged });

    this.pressDurationInMs = pressDurationInMs;
    this.pressMoveThreshold = pressMoveThreshold;
  }

  touchStarted({ position }: TouchEventOptions): void {
    this.initMoveThreshold(position);
    this.setPressEventTimer();
  }

  touchMoved({ position }: TouchEventOptions): void {
    if (this.isActive) {
      return;
    }

    this.setMoveThresholdCriteria(position);
  }

  private setPressEventTimer(): void {
    this.timers.push({
      name: PRESS_EVENT_TIMER_NAME,
      id: setTimeout(() => {
        if (this.getMoveDistance() < this.pressMoveThreshold) {
          this.activate();
        }
      }, this.pressDurationInMs),
    });
  }
}
