import { createContext, useContext, useState } from "react";
import type { CursorState } from "./type";
import { DEFAULT_CURSOR_STATE } from "./constants";

const ReactCursorPositionContext = createContext<{
  state: CursorState;
  setState: (state: CursorState) => void;
}>({
  state: DEFAULT_CURSOR_STATE,
  setState: () => {},
});

export const useReactCursorPosition = () => {
  const context = useContext(ReactCursorPositionContext);
  const state = context.state;
  if (!context) {
    throw new Error(
      "useReactCursorPosition must be used within a ReactCursorPosition"
    );
  }
  return [state];
};

export default ReactCursorPositionContext;
