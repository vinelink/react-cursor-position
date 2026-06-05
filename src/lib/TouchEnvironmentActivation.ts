import Activation from './Activation';
import type {
  ActiveChangedCallback,
  Position,
  TouchEventOptions,
} from '../type';

interface TouchEnvironmentActivationOptions {
  onIsActiveChanged: ActiveChangedCallback;
}

export default class TouchEnvironmentActivation extends Activation {
  protected initialPosition: Position;
  protected currentPosition: Position;

  constructor({ onIsActiveChanged }: TouchEnvironmentActivationOptions) {
    super({ onIsActiveChanged });

    this.initialPosition = { x: 0, y: 0 };
    this.currentPosition = { x: 0, y: 0 };
  }

  touchStarted(_options: TouchEventOptions): void {}

  touchMoved(_options: TouchEventOptions): void {}

  touchEnded(): void {
    this.deactivate();
  }

  touchCanceled(): void {
    this.deactivate();
  }

  protected initMoveThreshold({ x, y }: Position): void {
    this.initialPosition = { x, y };
    this.currentPosition = { x, y };
  }

  protected setMoveThresholdCriteria({ x, y }: Position): void {
    this.currentPosition = { x, y };
  }

  protected getMoveDistance(): number {
    const dx = this.currentPosition.x - this.initialPosition.x;
    const dy = this.currentPosition.y - this.initialPosition.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
