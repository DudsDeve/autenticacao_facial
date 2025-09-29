import { createContext, useCallback, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@database/SupabaseClient';
import type { Funnel } from 'src/models/Funnel';

interface FunnelContextProps {
  funis: Funnel[];
  loading: boolean;
  fetchFunis: () => Promise<void>;
}

// Definindo um valor default seguro!
export const FunnelContext = createContext<FunnelContextProps>({
  funis: [],
  loading: false,
  fetchFunis: async () => {},
});

export function FunnelProvider({ children }: { children: ReactNode }) {
  const [funis, setFunis] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFunis = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('anuncio_funil').select('*');
    setFunis(error ? [] : (data as Funnel[]));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFunis();
  }, [fetchFunis]);

  return (
    <FunnelContext.Provider value={{ funis, loading, fetchFunis }}>
      {children}
    </FunnelContext.Provider>
  );
}
