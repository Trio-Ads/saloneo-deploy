import { useContext } from 'react';
import { DirectionContext } from '../contexts/DirectionContext';

export const useDirection = () => useContext(DirectionContext);
