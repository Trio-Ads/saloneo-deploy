import { createContext } from 'react';

interface DirectionContextType {
  isRTL: boolean;
}

export const DirectionContext = createContext<DirectionContextType>({ isRTL: false });
