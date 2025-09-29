import {
  createContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode
} from 'react';
import { supabase } from '@database/SupabaseClient';

export interface LeadsContextProps {
  leads: any[];           // <--- novo!
  allLeads: number;
  leadsToday: number;
  loading: boolean;
  fetchAllLeads: () => Promise<void>;
}

export const LeadsContext = createContext<LeadsContextProps>({} as LeadsContextProps);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<any[]>([]);   // <--- novo!
  const [allLeads, setAllLeads] = useState<number>(0);
  const [leadsToday, setLeadsToday] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchAllLeads = useCallback(async () => {
    setLoading(true);

    const { data:lead, error: errLead } = await supabase.from('cadastro_leads_aure').select('*');

    if (errLead) {
      setLeads([]);
      setAllLeads(0);
      setLeadsToday(0);
      setLoading(false);
      return;
    }
    console.log('lead:', lead);

    const all = [
      ...(lead || []),
    ];

    setLeads(all);               // <--- novo!
    setAllLeads(all.length);

    // Leads de hoje
    const todayStr = new Date().toISOString().slice(0, 10);
    const leadsTodayCount = all.filter(lead =>
      lead.created_at && lead.created_at.slice(0, 10) === todayStr
    ).length;

    setLeadsToday(leadsTodayCount);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllLeads();
  }, [fetchAllLeads]);

  return (
    <LeadsContext.Provider value={{ leads, allLeads, leadsToday, loading, fetchAllLeads }}>
      {children}
    </LeadsContext.Provider>
  );
}