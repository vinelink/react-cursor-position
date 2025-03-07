import Activation from './Activation';
import type { ActiveChangedCallback, TouchEventOptions } from '../type';

interface TouchEnvironmentActivationOptions {
  onIsActiveChanged: ActiveChangedCallback;
}

export default class TouchEnvironmentActivation extends Activation {
  protected initialElTop: number;
  protected currentElTop: number;

  constructor({ onIsActiveChanged }: TouchEnvironmentActivationOptions) {
    super({ onIsActiveChanged });

    this.initialElTop = 0;
    this.currentElTop = 0;
  }

  touchStarted({ position }: TouchEventOptions): void {}

  touchMoved({ position }: TouchEventOptions): void {}

  touchEnded(): void {
    this.deactivate();
  }

  touchCanceled(): void {
    this.deactivate();
  }
}
