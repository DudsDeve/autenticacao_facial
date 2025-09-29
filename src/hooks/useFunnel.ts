// hooks/useFunnel.ts
import { useContext } from 'react';
import { FunnelContext } from '@contexts/Funnel';

export const useFunnel = () => useContext(FunnelContext);
