// src/contexts/SalesContext.tsx
import {
  createContext, useCallback, useState, useEffect, type ReactNode
} from 'react';
import { supabase } from '@database/SupabaseClient';
import type { Sale } from 'src/models/Sales';
import { brMoneyToNumber } from '@utils/number';

interface SalesContextProps {
  sales: Sale[];
  salesMetas: any[];    // metas podem ter shape diferente de Sale
  allSales: number;     // (contagem) – se quiser, crie outro para soma total
  loading: boolean;
  fetchSales: () => Promise<void>;
}

export const SalesContext = createContext<SalesContextProps>({} as SalesContextProps);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesMetas, setSalesMetas] = useState<any[]>([]);
  const [allSales, setAllSales] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      // 1) Vendas
      const { data: vendas, error: errorVendas } = await supabase
        .from('dashboard_vendas')
        .select('*');

      if (errorVendas) {
        console.error('Erro vendas:', errorVendas);
        setSales([]);
        setAllSales(0);
      } else {
        const parsed = (vendas ?? []).map((item: any) => {
          const valor = brMoneyToNumber(item.valor_total_mrr_onboarding);
          return { ...item, valor_total_mrr_onboarding: valor } as Sale;
        });
        setSales(parsed);
        setAllSales(parsed.length);
      }

      // 2) Metas
      const { data: metas, error: errorMetas } = await supabase
        .from('dashboard_vendas_metas')
        .select('*');

      if (errorMetas) {
        console.error('Erro metas:', errorMetas);
        setSalesMetas([]);
      } else {
        // normaliza para número
        const norm = (metas ?? []).map((m: any) => ({
          ...m,
          meta_vendas_geral_meta: brMoneyToNumber(m.meta_vendas_geral_meta),
          meta_vendas_geral_super_meta: brMoneyToNumber(m.meta_vendas_geral_super_meta),
        }));
        setSalesMetas(norm);
      }
    } catch (e) {
      console.error('Erro inesperado fetchSales:', e);
      setSales([]); setSalesMetas([]); setAllSales(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  return (
    <SalesContext.Provider value={{ sales, salesMetas, allSales, loading, fetchSales }}>
      {children}
    </SalesContext.Provider>
  );
}
