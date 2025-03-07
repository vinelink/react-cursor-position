# @vinelink/react-cursor-position

[![npm version](https://img.shields.io/npm/v/@vinelink/react-cursor-position.svg?style=for-the-badge)](https://www.npmjs.com/package/@vinelink/react-cursor-position)
[![downloads](https://img.shields.io/npm/dm/@vinelink/react-perfect-scrollbar.svg?style=for-the-badge&color=blue)](https://npm-stat.com/charts.html?package=%40vinelink%2Freact-perfect-scrollbar)

A React component that decorates its children with mouse and touch cursor coordinates, plotted relative to itself.

This is a modernized fork of [react-cursor-position](https://github.com/ethanselzer/react-cursor-position), rewritten using React Function Components and TypeScript.

## Features

- Mouse and touch event support
- Configurable activation modes for mouse and touch input
- Support for hover delay and hover off delay
- Press activation with configurable duration and movement threshold
- Tap activation with configurable duration and movement threshold
- Environment detection (mouse/touch)
- Written in TypeScript
- Zero dependencies

## Installation

```bash
npm install @vinelink/react-cursor-position

# Or
yarn add @vinelink/react-cursor-position

# Or
pnpm add @vinelink/react-cursor-position
```

## Usage

```tsx
import ReactCursorPosition from "@vinelink/react-cursor-position";

const YourComponent = () => {
  return (
    <ReactCursorPosition>
      <YourChildComponent />
    </ReactCursorPosition>
  );
};
```

## API

### Props

| Prop                             | Type       | Default          | Description                                                |
| -------------------------------- | ---------- | ---------------- | ---------------------------------------------------------- |
| `activationInteractionMouse`     | `string`   | `'hover'`        | Mouse activation method (`'hover'` or `'click'`)           |
| `activationInteractionTouch`     | `string`   | `'press'`        | Touch activation method (`'press'`, `'tap'`, or `'touch'`) |
| `className`                      | `string`   | `undefined`      | CSS class name                                             |
| `hoverDelayInMs`                 | `number`   | `0`              | Hover activation delay in milliseconds                     |
| `hoverOffDelayInMs`              | `number`   | `0`              | Hover deactivation delay in milliseconds                   |
| `isEnabled`                      | `boolean`  | `true`           | Enable/disable the component                               |
| `mapChildProps`                  | `function` | `props => props` | Transform props before passing to children                 |
| `onActivationChanged`            | `function` | `() => {}`       | Callback when activation state changes                     |
| `onDetectedEnvironmentChanged`   | `function` | `() => {}`       | Callback when input environment changes                    |
| `onPositionChanged`              | `function` | `() => {}`       | Callback when cursor position changes                      |
| `pressDurationInMs`              | `number`   | `500`            | Press activation duration                                  |
| `pressMoveThreshold`             | `number`   | `5`              | Press movement threshold in pixels                         |
| `shouldDecorateChildren`         | `boolean`  | `true`           | Enable/disable child decoration                            |
| `shouldStopTouchMovePropagation` | `boolean`  | `false`          | Stop touch move event propagation                          |
| `style`                          | `object`   | `undefined`      | Inline styles                                              |
| `tapDurationInMs`                | `number`   | `180`            | Tap activation duration                                    |
| `tapMoveThreshold`               | `number`   | `5`              | Tap movement threshold in pixels                           |

### Child Props

The following props are passed to child components:

```ts
interface CursorState {
  detectedEnvironment: {
    isMouseDetected: boolean;
    isTouchDetected: boolean;
  };
  elementDimensions: {
    width: number;
    height: number;
  };
  isActive: boolean;
  isPositionOutside: boolean;
  position: {
    x: number;
    y: number;
  };
}
```

## Examples

### Basic Usage

```tsx
import ReactCursorPosition from "@vinelink/react-cursor-position";

const ChildComponent = ({ isActive, position: { x, y } }) => (
  <div>
    {isActive && (
      <p>
        Cursor position - x: {x}, y: {y}
      </p>
    )}
  </div>
);

const App = () => (
  <ReactCursorPosition>
    <ChildComponent />
  </ReactCursorPosition>
);
```

### Custom Activation

```tsx
import ReactCursorPosition, {
  INTERACTIONS,
} from "@vinelink/react-cursor-position";

const App = () => (
  <ReactCursorPosition
    activationInteractionMouse={INTERACTIONS.CLICK}
    activationInteractionTouch={INTERACTIONS.TAP}
    hoverDelayInMs={200}
  >
    <ChildComponent />
  </ReactCursorPosition>
);
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
