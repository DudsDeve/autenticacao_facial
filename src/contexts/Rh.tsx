// src/contexts/Leads.tsx
import {
  createContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode
} from 'react';
import { supabase } from '@database/SupabaseClient';

export interface LeadsContextProps {
  leads: any[];
  allLeads: number;
  leadsToday: number;
  loading: boolean;
  fetchAllLeads: () => Promise<void>;
  sdrs: any[];
  closers: any[];
  gestoresDeTrafego: any[];
}

export const RhContext = createContext<LeadsContextProps>({} as LeadsContextProps);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [allLeads, setAllLeads] = useState<number>(0);
  const [leadsToday, setLeadsToday] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sdrs, setSdrs] = useState<any[]>([]);
  const [closers, setClosers] = useState<any[]>([]);
  const [gestoresDeTrafego, setGestoresDeTrafego] = useState<any[]>([]);

  const fetchAllLeads = useCallback(async () => {
    setLoading(true);

    // >>> Agora busca em candidatos_aure <<<
    const { data: lead, error: errLead } = await supabase
      .from('candidatos_aure')
      .select('*');

    if (errLead) {
      setLeads([]);
      setAllLeads(0);
      setLeadsToday(0);
      setLoading(false);
      return;
    }
    console.log('lead:', lead);

    const all = [ ...(lead || []) ];

    setLeads(all);
    setAllLeads(all.length);

    // Separa por tipo de candidato
    const sdrsData = all.filter(item => item.vaga_interesse === 'sdr');
    const closersData = all.filter(item => item.vaga_interesse === 'closer');
    const gestoresData = all.filter(item => item.vaga_interesse === 'gestor_de_trafego');

    setSdrs(sdrsData);
    setClosers(closersData);
    setGestoresDeTrafego(gestoresData);

    // Leads de hoje (usa created_at se existir)
    const todayStr = new Date().toISOString().slice(0, 10);
    const leadsTodayCount = all.filter(l =>
      l.created_at && String(l.created_at).slice(0, 10) === todayStr
    ).length;

    setLeadsToday(leadsTodayCount);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllLeads();
  }, [fetchAllLeads]);

  return (
    <RhContext.Provider value={{ leads, allLeads, leadsToday, loading, fetchAllLeads, sdrs, closers, gestoresDeTrafego }}>
      {children}
    </RhContext.Provider>
  );
}
