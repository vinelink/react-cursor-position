import TouchEnvironmentActivation from './TouchEnvironmentActivation';
import type { ActiveChangedCallback, TouchEventOptions } from '../type';

interface TouchActivationOptions {
  onIsActiveChanged: ActiveChangedCallback;
}

export default class TouchActivation extends TouchEnvironmentActivation {
  constructor({ onIsActiveChanged }: TouchActivationOptions) {
    super({ onIsActiveChanged });
  }

  touchStarted({ position }: TouchEventOptions): void {
    this.activate();
  }
}
