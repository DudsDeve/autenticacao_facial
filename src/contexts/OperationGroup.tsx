import {
  createContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { supabase } from '@database/SupabaseClient';
import type { OperationGroup } from 'src/models/OperationGroup';

// 1. Tipagem do contexto
interface OperationGroupContextProps {
  operationGroups: OperationGroup[];
  loading: boolean;
  fetchOperationGroups: () => Promise<void>;
}

// 2. Contexto
export const OperationGroupContext = createContext<OperationGroupContextProps>({
  operationGroups: [],
  loading: false,
  fetchOperationGroups: async () => {},
});

// 3. Provider
export function OperationGroupProvider({ children }: { children: ReactNode }) {
  const [operationGroups, setOperationGroups] = useState<OperationGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOperationGroups = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('grupo_de_operacoes').select('*');
    // LOG opcional para debug:
    if (error) {
      console.error('Erro ao buscar grupos de operação:', error);
      setOperationGroups([]);
    } else {
      setOperationGroups(data as OperationGroup[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOperationGroups();
  }, [fetchOperationGroups]);

  return (
    <OperationGroupContext.Provider value={{ operationGroups, loading, fetchOperationGroups }}>
      {children}
    </OperationGroupContext.Provider>
  );
}
