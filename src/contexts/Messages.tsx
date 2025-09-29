import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ReactNode
} from 'react';
import { supabase } from '@database/SupabaseClient';
import type { Lead } from 'src/models/Lead';
import type { Message } from 'src/models/Message';

// Ajuste aqui: garanta timestampz



export interface MessagesContextProps {
  mqlMessages: Message[];
  naoMqlMessages: Message[];
  iaWppMessages: Message[];

  loading: boolean;
  loadingSkeleton: boolean;

  fetchMqlMessages: () => Promise<void>;
  fetchNaoMqlMessages: () => Promise<void>;
  fetchIaWppMessages: () => Promise<void>;

  setMqlMessages: Dispatch<SetStateAction<Message[]>>;
  setNaoMqlMessages: Dispatch<SetStateAction<Message[]>>;
  setIaWppMessages: Dispatch<SetStateAction<Message[]>>;

  reloadAll: () => void;

  // Novos states:
  sentToday: number;
  receivedToday: number;
  totalToday: number;
}

interface MessagesProviderProps {
  children: ReactNode;
}

export const MessagesContext = createContext<MessagesContextProps>({} as MessagesContextProps);

function normalizePhone(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/\D/g, ""); // Remove tudo que não for dígito
}
// Função utilitária para enriquecer com lead
function enrichMessagesWithLeads(
  messages: Message[],
  leads: Lead[],
  key: 'email' | 'telefone' = 'email'
) {
  return messages.map(msg => {
    let lead: Lead | undefined;
    if (key === 'email') {
      lead = leads.find(
        l =>
          (l.email || '').trim().toLowerCase() ===
          (msg.session_id || '').trim().toLowerCase()
      );
    } else if (key === 'telefone') {
      // NOVO: compara só números
      const sessionNum = normalizePhone(msg.session_id);
      lead = leads.find(l => normalizePhone(l.telefone) === sessionNum);

      // DEBUG: log para te ajudar a ver!
      if (!lead) {
        console.log(
          `[DEBUG MERGE TELEFONE] Não achou lead para session_id:`,
          msg.session_id,
          '| Procurando entre:',
          leads.map(l => l.telefone)
        );
      }
    }
    return {
      ...msg,
      lead: lead || null,
    };
  });
}



export function MessagesProvider({ children }: MessagesProviderProps) {
  const [mqlMessages, setMqlMessages] = useState<Message[]>([]);
  const [naoMqlMessages, setNaoMqlMessages] = useState<Message[]>([]);
  const [iaWppMessages, setIaWppMessages] = useState<Message[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSkeleton, setLoadingSkeleton] = useState(true);

  // Adicione estes states:
  const [sentToday, setSentToday] = useState(0);
  const [receivedToday, setReceivedToday] = useState(0);
  const [totalToday, setTotalToday] = useState(0);

  const PAGE_SIZE = 1000;

  // Fetch de leads
  const fetchAllLeads = useCallback(async () => {
    const { data, error } = await supabase
      .from('cadastro_leads_aure')
      .select('*');
    if (error) {
      setLeads([]);
      console.error('Erro ao buscar leads:', error);
      return;
    }
    setLeads(data || []);
  }, []);

  // Fetch de mensagens MQL (relaciona por email)
  const fetchMqlMessages = useCallback(async () => {
    setLoading(true);
    try {
      let allData: Message[] = [];
      let from = 0;
      let fetchMore = true;

      while (fetchMore) {
        const { data, error } = await supabase
          .from('mql_chat_histories')
          .select('*')
          .order('id', { ascending: true })
          .range(from, from + PAGE_SIZE - 1);

        if (error) {
          setMqlMessages([]);
          console.error('Erro Supabase:', error);
          break;
        }

        if (data && data.length > 0) {
          allData = allData.concat(data as Message[]);
          from += PAGE_SIZE;
          fetchMore = data.length === PAGE_SIZE;
        } else {
          fetchMore = false;
        }
      }

      setMqlMessages(enrichMessagesWithLeads(allData, leads));
    } catch (err) {
      setMqlMessages([]);
      console.error('Exceção fetchMqlMessages:', err);
    } finally {
      setLoading(false);
      setLoadingSkeleton(false);
    }
  }, [leads]);

  // Fetch de mensagens NÃO MQL (relaciona por email)
  const fetchNaoMqlMessages = useCallback(async () => {
    setLoading(true);
    try {
      let allData: Message[] = [];
      let from = 0;
      let fetchMore = true;

      while (fetchMore) {
        const { data, error } = await supabase
          .from('nao_mql_chat_histories')
          .select('*')
          .order('id', { ascending: true })
          .range(from, from + PAGE_SIZE - 1);

        if (error) {
          setNaoMqlMessages([]);
          console.error('Erro Supabase:', error);
          break;
        }

        if (data && data.length > 0) {
          allData = allData.concat(data as Message[]);
          from += PAGE_SIZE;
          fetchMore = data.length === PAGE_SIZE;
        } else {
          fetchMore = false;
        }
      }

      setNaoMqlMessages(enrichMessagesWithLeads(allData, leads));
    } catch (err) {
      setNaoMqlMessages([]);
      console.error('Exceção fetchNaoMqlMessages:', err);
    } finally {
      setLoading(false);
      setLoadingSkeleton(false);
    }
  }, [leads]);

  // Fetch de mensagens IA WPP (relaciona por telefone)
  const fetchIaWppMessages = useCallback(async () => {
    setLoading(true);
    try {
      let allData: Message[] = [];
      let from = 0;
      let fetchMore = true;

      while (fetchMore) {
        const { data, error } = await supabase
          .from('ia_wpp_histories')
          .select('*')
          .order('id', { ascending: true })
          .range(from, from + PAGE_SIZE - 1);

        if (error) {
          setIaWppMessages([]);
          console.error('Erro Supabase:', error);
          break;
        }

        if (data && data.length > 0) {
          allData = allData.concat(data as Message[]);
          from += PAGE_SIZE;
          fetchMore = data.length === PAGE_SIZE;
        } else {
          fetchMore = false;
        }
      }

      setIaWppMessages(enrichMessagesWithLeads(allData, leads, 'telefone'));
    } catch (err) {
      setIaWppMessages([]);
      console.error('Exceção fetchIaWppMessages:', err);
    } finally {
      setLoading(false);
      setLoadingSkeleton(false);
    }
  }, [leads]);

  // --- CONTAGEM DE MENSAGENS DE HOJE ---
  useEffect(() => {
    const allMessages = [
      ...mqlMessages,
      ...naoMqlMessages,
      ...iaWppMessages
    ];

    const todayStr = new Date().toISOString().slice(0, 10);

    let sent = 0;
    let received = 0;
    let total = 0;

    allMessages.forEach(msg => {
      const date = msg.timestampz;
      if (date && date.slice(0, 10) === todayStr) {
        total++;
        // O type pode estar no message.type ou message.from dependendo do seu backend. Ajuste aqui!
        let parsedMessage: any;
        if (typeof msg.message === 'string') {
          try {
            parsedMessage = JSON.parse(msg.message);
          } catch {
            parsedMessage = null;
          }
        } else {
          parsedMessage = msg.message;
        }

        // O padrão é 'from' mas alguns históricos usam 'type'
        const type = parsedMessage?.from || parsedMessage?.type;

        if (type === 'ai') sent++;
        if (type === 'human') received++;
      }
    });

    setSentToday(sent);
    setReceivedToday(received);
    setTotalToday(total);

  }, [mqlMessages, naoMqlMessages, iaWppMessages]);

  // Função para recarregar tudo
  const reloadAll = () => {
    fetchMqlMessages();
    fetchNaoMqlMessages();
    fetchIaWppMessages();
  };

  // useEffect para buscar dados iniciais e criar subscriptions realtime
  useEffect(() => {
    // Primeiro, busca todos os leads
    fetchAllLeads();
  }, [fetchAllLeads]);

  // Quando os leads estiverem carregados, busca as mensagens
  useEffect(() => {
    if (leads.length === 0) return;
    fetchMqlMessages();
    fetchNaoMqlMessages();
    fetchIaWppMessages();
    // As subscriptions podem continuar do jeito antigo,
    // mas seria bom adicionar o enrich também nos payloads se quiser realtime perfeito!
    // (depois posso adaptar pra ti, se quiser)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads]);

  // Subscriptions (opcional: pode enriquecer payloads na entrada!)
  useEffect(() => {
    // SUBSCRIBE mql_chat_histories
    const mqlChannel = supabase
      .channel('mql-messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mql_chat_histories' },
        (payload: { new: Message }) => {
          setMqlMessages(prev => {
            if (prev.find(msg => msg.id === payload.new.id)) return prev;
            // Enriquecer aqui
            const enriched = enrichMessagesWithLeads([payload.new], leads, 'email')[0];
            return [enriched, ...prev];
          });
        })
      .subscribe();

    // SUBSCRIBE nao_mql_chat_histories
    const naoMqlChannel = supabase
      .channel('nao-mql-messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nao_mql_chat_histories' },
        (payload: { new: Message }) => {
          setNaoMqlMessages(prev => {
            if (prev.find(msg => msg.id === payload.new.id)) return prev;
            const enriched = enrichMessagesWithLeads([payload.new], leads, 'email')[0];
            return [enriched, ...prev];
          });
        })
      .subscribe();

    // SUBSCRIBE ia_wpp_histories
    const iaWppChannel = supabase
      .channel('ia-wpp-messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ia_wpp_histories' },
        (payload: { new: Message }) => {
          setIaWppMessages(prev => {
            if (prev.find(msg => msg.id === payload.new.id)) return prev;
            const enriched = enrichMessagesWithLeads([payload.new], leads, 'telefone')[0];
            return [enriched, ...prev];
          });
        })
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(mqlChannel);
      supabase.removeChannel(naoMqlChannel);
      supabase.removeChannel(iaWppChannel);
    };
  }, [leads]);

  return (
    <MessagesContext.Provider
      value={{
        mqlMessages,
        naoMqlMessages,
        iaWppMessages,
        loading,
        loadingSkeleton,
        fetchMqlMessages,
        fetchNaoMqlMessages,
        fetchIaWppMessages,
        setMqlMessages,
        setNaoMqlMessages,
        setIaWppMessages,
        reloadAll,
        sentToday,
        receivedToday,
        totalToday,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}
