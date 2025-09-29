// src/hooks/useLeads.ts
import { RhContext } from '@contexts/Rh';
import { useContext } from 'react';

export function useRh() {
    return useContext(RhContext);
}
