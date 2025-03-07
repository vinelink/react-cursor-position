import type { ActiveChangedCallback } from '../type';
import {
  SET_ACTIVATION_TIMER_NAME,
  UNSET_ACTIVATION_TIMER_NAME,
} from '../constants';
import MouseEnvironmentActivation from './MouseEnvironmentActivation';

interface HoverActivationOptions {
  onIsActiveChanged: ActiveChangedCallback;
  hoverDelayInMs: number;
  hoverOffDelayInMs: number;
}

export default class HoverActivation extends MouseEnvironmentActivation {
  private readonly hoverDelayInMs: number;
  private readonly hoverOffDelayInMs: number;

  constructor({
    onIsActiveChanged,
    hoverDelayInMs,
    hoverOffDelayInMs,
  }: HoverActivationOptions) {
    super({ onIsActiveChanged });

    this.hoverDelayInMs = hoverDelayInMs;
    this.hoverOffDelayInMs = hoverOffDelayInMs;
  }

  override mouseEntered(): void {
    this.clearTimers();
    this.schedulActivation(this.hoverDelayInMs);
  }

  override mouseLeft(): void {
    this.clearTimers();
    this.scheduleDeactivation(this.hoverOffDelayInMs);
  }

  private schedulActivation(schedule: number): void {
    const scheduleId = setTimeout(() => {
      this.activate();
    }, schedule);

    this.timers.push({
      id: scheduleId,
      name: SET_ACTIVATION_TIMER_NAME,
    });
  }

  private scheduleDeactivation(schedule: number): void {
    const scheduleId = setTimeout(() => {
      this.deactivate();
    }, schedule);

    this.timers.push({
      id: scheduleId,
      name: UNSET_ACTIVATION_TIMER_NAME,
    });
  }
}
