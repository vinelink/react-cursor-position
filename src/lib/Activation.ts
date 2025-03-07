import type { ActiveChangedCallback } from '../type';

interface Timer {
  id: number;
  name: string;
}

interface ActivationOptions {
  onIsActiveChanged: ActiveChangedCallback;
}

export default class Activation {
  protected onIsActiveChanged: ActiveChangedCallback;
  protected isActive: boolean;
  protected timers: Timer[];

  constructor(
    { onIsActiveChanged }: ActivationOptions = {} as ActivationOptions,
  ) {
    if (typeof onIsActiveChanged !== 'function') {
      throw new Error('onIsActiveChanged should be a function');
    }

    this.onIsActiveChanged = onIsActiveChanged;
    this.isActive = false;
    this.timers = [];
  }

  activate(): void {
    this.isActive = true;
    this.onIsActiveChanged({ isActive: true });
  }

  deactivate(): void {
    this.isActive = false;
    this.onIsActiveChanged({ isActive: false });
    this.clearTimers();
  }

  toggleActivation(): void {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  clearTimers(): void {
    const timers = this.timers;
    while (timers.length) {
      const timer = timers.pop();
      if (timer) {
        clearTimeout(timer.id);
      }
    }
  }

  clearTimer(timerName: string): void {
    for (const timer of this.timers) {
      if (timer.name === timerName) {
        clearTimeout(timer.id);
      }
    }
  }
}
