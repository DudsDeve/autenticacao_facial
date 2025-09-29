// src/contexts/LeadChatsContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type FC,
} from 'react';
import { supabase } from '@database/SupabaseClient';
import type { LeadWithChats } from 'src/models/LeadWithChats';

interface LeadChatsContextProps {
  leadsWithChats: LeadWithChats[];
  loading: boolean;
  fetchAllLeadChats: () => Promise<void>;
}

const LeadChatsContext = createContext<LeadChatsContextProps>({} as LeadChatsContextProps);

interface LeadChatsProviderProps {
  children: ReactNode;
}

/** Normaliza e-mail:
 * - trim + lowercase
 * - remove "+alias" antes do @
 * - remove "." na parte local se gmail/googlemail
 */
function normalizeEmail(email?: string | null): string {
  if (!email) return '';
  const e = String(email).trim().toLowerCase();
  const [localRaw, domain] = e.split('@');
  if (!domain) return e;

  const localNoPlus = localRaw.split('+')[0];
  const isGmail = domain === 'gmail.com' || domain === 'googlemail.com';
  const local = isGmail ? localNoPlus.replace(/\./g, '') : localNoPlus;

  return `${local}@${domain}`;
}

/** Mantém só dígitos */
function normalizePhone(phone?: string | null): string {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
}

/** Detecta se uma string é email (contém @) ou telefone */
function isEmail(value: string): boolean {
  return value.includes('@');
}

/** Agrupa chats por email E por telefone */
function createChatMaps<T extends { session_id?: string | null }>(chats: T[]) {
  const byEmail: Record<string, T[]> = {};
  const byPhone: Record<string, T[]> = {};

  for (const chat of chats) {
    const sessionId = chat.session_id;
    if (!sessionId) continue;

    if (isEmail(sessionId)) {
      // É email
      const normalizedEmail = normalizeEmail(sessionId);
      if (normalizedEmail) {
        (byEmail[normalizedEmail] ||= []).push(chat);
      }
    } else {
      // É telefone
      const normalizedPhone = normalizePhone(sessionId);
      if (normalizedPhone) {
        (byPhone[normalizedPhone] ||= []).push(chat);
      }
    }
  }

  return { byEmail, byPhone };
}

export const LeadChatsProvider: FC<LeadChatsProviderProps> = ({ children }: LeadChatsProviderProps) => {
  const [leadsWithChats, setLeadsWithChats] = useState<LeadWithChats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllLeadChats = useCallback(async () => {
    setLoading(true);

    try {
      console.log('Iniciando carregamento completo dos dados...');

      // 1) Buscar TODOS os leads (com paginação)
      const allLeads = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: leadsPage, error: errLeads } = await supabase
          .from('cadastro_leads_aure')
          .select('*')
          .range(from, from + pageSize - 1);

        if (errLeads) {
          console.error('Erro ao carregar leads:', errLeads);
          break;
        }

        if (!leadsPage || leadsPage.length === 0) {
          hasMore = false;
        } else {
          allLeads.push(...leadsPage);
          console.log(`Carregados ${allLeads.length} leads...`);
          
          if (leadsPage.length < pageSize) {
            hasMore = false;
          } else {
            from += pageSize;
          }
        }
      }

      console.log(`Total de leads carregados: ${allLeads.length}`);

      // 2) Buscar TODOS os chats (com paginação)
      const allMqlChats = [];
      const allNaoMqlChats = [];

      // Carregar MQL chats
      from = 0;
      hasMore = true;
      while (hasMore) {
        const { data: mqlPage, error: errMql } = await supabase
          .from('mql_chat_histories')
          .select('*')
          .order('timestampz', { ascending: true })
          .range(from, from + pageSize - 1);

        if (errMql) {
          console.error('Erro ao carregar MQL chats:', errMql);
          break;
        }

        if (!mqlPage || mqlPage.length === 0) {
          hasMore = false;
        } else {
          allMqlChats.push(...mqlPage);
          console.log(`Carregados ${allMqlChats.length} chats MQL...`);
          
          if (mqlPage.length < pageSize) {
            hasMore = false;
          } else {
            from += pageSize;
          }
        }
      }

      // Carregar Não-MQL chats
      from = 0;
      hasMore = true;
      while (hasMore) {
        const { data: naoMqlPage, error: errNaoMql } = await supabase
          .from('nao_mql_chat_histories')
          .select('*')
          .order('timestampz', { ascending: true })
          .range(from, from + pageSize - 1);

        if (errNaoMql) {
          console.error('Erro ao carregar Não-MQL chats:', errNaoMql);
          break;
        }

        if (!naoMqlPage || naoMqlPage.length === 0) {
          hasMore = false;
        } else {
          allNaoMqlChats.push(...naoMqlPage);
          console.log(`Carregados ${allNaoMqlChats.length} chats Não-MQL...`);
          
          if (naoMqlPage.length < pageSize) {
            hasMore = false;
          } else {
            from += pageSize;
          }
        }
      }

      console.log('Dados completos carregados:');
      console.log('- Total Leads:', allLeads.length);
      console.log('- Total MQL Chats:', allMqlChats.length);
      console.log('- Total Não-MQL Chats:', allNaoMqlChats.length);

      // 3) Criar mapas de chats por email e telefone
      const mqlMaps = createChatMaps(allMqlChats);
      const naoMqlMaps = createChatMaps(allNaoMqlChats);

      console.log('Mapas criados:');
      console.log('- MQL por email:', Object.keys(mqlMaps.byEmail).length);
      console.log('- MQL por telefone:', Object.keys(mqlMaps.byPhone).length);
      console.log('- Não-MQL por email:', Object.keys(naoMqlMaps.byEmail).length);
      console.log('- Não-MQL por telefone:', Object.keys(naoMqlMaps.byPhone).length);

      // 4) Relacionar leads com chats
      console.log('Relacionando leads com chats...');
      const allLeadsWithChats: LeadWithChats[] = allLeads.map((lead, index) => {
        if (index % 1000 === 0) {
          console.log(`Processando lead ${index + 1}/${allLeads.length}...`);
        }

        const normalizedEmail = normalizeEmail(lead.email);
        const normalizedPhone = normalizePhone(lead.telefone);

        // Buscar chats por email
        const mqlChatsByEmail = normalizedEmail ? (mqlMaps.byEmail[normalizedEmail] ?? []) : [];
        const naoMqlChatsByEmail = normalizedEmail ? (naoMqlMaps.byEmail[normalizedEmail] ?? []) : [];

        // Buscar chats por telefone
        const mqlChatsByPhone = normalizedPhone ? (mqlMaps.byPhone[normalizedPhone] ?? []) : [];
        const naoMqlChatsByPhone = normalizedPhone ? (naoMqlMaps.byPhone[normalizedPhone] ?? []) : [];

        // Combinar chats (email + telefone), removendo duplicatas
        const allMqlChats = [...mqlChatsByEmail, ...mqlChatsByPhone];
        const allNaoMqlChats = [...naoMqlChatsByEmail, ...naoMqlChatsByPhone];

        // Remover duplicatas baseado no ID
        const uniqueMqlChats = allMqlChats.filter((chat, index, array) => 
          array.findIndex(c => c.id === chat.id) === index
        );
        const uniqueNaoMqlChats = allNaoMqlChats.filter((chat, index, array) => 
          array.findIndex(c => c.id === chat.id) === index
        );

        return {
          ...lead,
          mqlChats: uniqueMqlChats,
          naoMqlChats: uniqueNaoMqlChats,
          iaWppChats: [], // Mantido para compatibilidade
        };
      });

      // Log de debug para alguns leads
      const leadsWithChats = allLeadsWithChats.filter(lead => 
        (lead.mqlChats?.length || 0) > 0 || (lead.naoMqlChats?.length || 0) > 0
      );
      
      console.log(`RESULTADO FINAL:`);
      console.log(`- Total leads processados: ${allLeads.length}`);
      console.log(`- Leads com chats: ${leadsWithChats.length}`);
      console.log(`- Leads com MQL chats: ${allLeadsWithChats.filter(l => (l.mqlChats?.length || 0) > 0).length}`);
      console.log(`- Leads com Não-MQL chats: ${allLeadsWithChats.filter(l => (l.naoMqlChats?.length || 0) > 0).length}`);
      
      if (leadsWithChats.length > 0) {
        const exemplo = leadsWithChats[0];
        console.log('Exemplo de lead com chats:', {
          id: exemplo.id,
          nome: exemplo.nome,
          email: exemplo.email,
          telefone: exemplo.telefone,
          mqlChats: exemplo.mqlChats?.length || 0,
          naoMqlChats: exemplo.naoMqlChats?.length || 0
        });
      }

      setLeadsWithChats(allLeadsWithChats);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setLeadsWithChats([]);
    } finally {
      setLoading(false);
      console.log('Carregamento finalizado!');
    }
  }, []);

  useEffect(() => { fetchAllLeadChats(); }, [fetchAllLeadChats]);

  return (
    <LeadChatsContext.Provider value={{ leadsWithChats, loading, fetchAllLeadChats }}>
      {children}
    </LeadChatsContext.Provider>
  );
};

export const useLeadChats = () => useContext(LeadChatsContext);