// src/hooks/useSales.ts
import { useContext } from 'react';
import { SalesContext } from '@contexts/Sales';

export function useSales() {
    const context = useContext(SalesContext);

    if (!context) {
        throw new Error('useSales deve ser usado dentro de um SalesProvider');
    }

    return context;
}
