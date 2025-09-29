// src/hooks/useLeads.ts
import { LeadsContext } from '@contexts/Leads';
import { useContext } from 'react';

export function useLeads() {
    return useContext(LeadsContext);
}
