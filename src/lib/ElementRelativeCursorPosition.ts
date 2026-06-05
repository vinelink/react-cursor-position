import type { Position } from '../type';

export default class ElementRelativeCursorPosition {
  private el: HTMLElement;

  constructor(el: HTMLElement) {
    this.el = el;
  }

  getCursorPosition(event: MouseEvent | Touch): Position {
    const { left, top } = this.el.getBoundingClientRect();

    return {
      x: Math.round(event.clientX - left),
      y: Math.round(event.clientY - top),
    };
  }
}
