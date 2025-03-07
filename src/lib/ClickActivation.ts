import type { ActiveChangedCallback } from '../type';
import MouseEnvironmentActivation from './MouseEnvironmentActivation';

export default class ClickActivation extends MouseEnvironmentActivation {
  constructor({
    onIsActiveChanged,
  }: {
    onIsActiveChanged: ActiveChangedCallback;
  }) {
    super({ onIsActiveChanged });
  }

  override mouseClicked(): void {
    this.toggleActivation();
  }
}
