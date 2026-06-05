import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { CursorState } from './type';

interface ReactCursorPositionContextValue {
  state: CursorState;
  setState: Dispatch<SetStateAction<CursorState>>;
}

const ReactCursorPositionContext =
  createContext<ReactCursorPositionContextValue | null>(null);

export const useReactCursorPosition = () => {
  const context = useContext(ReactCursorPositionContext);
  if (!context) {
    throw new Error(
      'useReactCursorPosition must be used within a ReactCursorPosition',
    );
  }
  return [context.state] as const;
};

export default ReactCursorPositionContext;
