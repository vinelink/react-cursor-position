import type { Position } from '../type';

export default class ElementRelativeCursorPosition {
  private el: HTMLElement;
  private elementOffset: Position | null;
  private lastEvent: MouseEvent | Touch | null = null;

  constructor(el: HTMLElement) {
    this.el = el;
    this.elementOffset = null;
  }

  private getDocumentRelativeElementOffset(el: HTMLElement): Position {
    const rootEl = this.getRootOfEl(el);
    const { left: docLeft, top: docTop } = rootEl.getBoundingClientRect();

    const { left: elLeft, top: elTop } = el.getBoundingClientRect();

    return {
      x: Math.abs(docLeft) + elLeft,
      y: Math.abs(docTop) + elTop,
    };
  }

  private getRootOfEl(el: HTMLElement): HTMLElement {
    if (el.parentElement) {
      return this.getRootOfEl(el.parentElement);
    }
    return el;
  }

  private getComputedElementRelativeCursorPosition(
    event: MouseEvent | Touch,
    documentRelativeElementOffset: Position,
  ): Position {
    this.lastEvent = event;
    const position = this.getDocumentRelativeCursorPosition(event);
    const { x: cursorX, y: cursorY } = position;
    const { x: offsetX, y: offsetY } = documentRelativeElementOffset;

    return {
      x: Math.round(cursorX - offsetX),
      y: Math.round(cursorY - offsetY),
    };
  }

  private getDocumentRelativeCursorPosition(
    event: MouseEvent | Touch,
  ): Position {
    return {
      x: event.pageX,
      y: event.pageY,
    };
  }

  get documentRelativeElementOffset(): Position {
    if (!this.elementOffset) {
      this.elementOffset = this.getDocumentRelativeElementOffset(this.el);
    }

    return this.elementOffset;
  }

  getCursorPosition(event: MouseEvent | Touch): Position {
    return this.getComputedElementRelativeCursorPosition(
      event,
      this.documentRelativeElementOffset,
    );
  }
}
