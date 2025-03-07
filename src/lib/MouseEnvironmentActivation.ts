import type { ActiveChangedCallback, Position } from '../type';
import Activation from './Activation';

export default class MouseEnvironmentActivation extends Activation {
  constructor({
    onIsActiveChanged,
  }: { onIsActiveChanged: ActiveChangedCallback }) {
    super({ onIsActiveChanged });
  }

  mouseEntered(): void {}

  mouseMoved(position: Position): void {}

  mouseLeft(): void {}

  mouseClicked(): void {}
}
