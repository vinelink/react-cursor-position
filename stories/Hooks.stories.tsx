import React from "react";
import { ReactCursorPosition, type CursorState } from "../src";
import { useReactCursorPosition } from "../src/context";

const PositionLabel = () => {
  const [state] = useReactCursorPosition();

  const {
    detectedEnvironment: {
      isMouseDetected = false,
      isTouchDetected = false,
    } = {},
    elementDimensions: { width = 0, height = 0 } = {},
    position: { x = 0, y = 0 } = {},
    isActive = false,
    isPositionOutside = false,
  } = state;

  return (
    <div>
      {`x: ${x}`}
      <br />
      {`y: ${y}`}
      <br />
      {`isActive: ${isActive}`}
      <br />
      {`width: ${width}`}
      <br />
      {`height: ${height}`}
      <br />
      {`isPositionOutside: ${isPositionOutside ? "true" : "false"}`}
      <br />
      {`isMouseDetected: ${isMouseDetected ? "true" : "false"}`}
      <br />
      {`isTouchDetected: ${isTouchDetected ? "true" : "false"}`}
    </div>
  );
};

PositionLabel.defaultProps = {
  shouldShowIsActive: true,
};

const Example = () => {
  return (
    <>
      <ReactCursorPosition
        {...{
          className: "example__target example__target--basic",
        }}
      >
        <PositionLabel />
      </ReactCursorPosition>
    </>
  );
};

const meta = {
  title: "Example/Hooks",
  component: Example,
};

export default meta;

export const Hooks = {
  args: {},
};
