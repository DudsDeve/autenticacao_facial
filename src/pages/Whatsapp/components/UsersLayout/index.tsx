import * as React from 'react';
import {
  Box, Typography, Tabs, Tab, List, ListItemButton, ListItemAvatar, Avatar, ListItemText, Stack
} from '@mui/material';
import { useLeadChats } from '@contexts/LeadChatsContext';
import { Container, Header, SearchBar } from './styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

export type TabKey = 'mql' | 'naoMql' ;

type Chat = {
  id: string;
  message: unknown;
  timestampz?: string | null;
  created_at?: string | null;
  session_id?: string | null;
  type?: 'ai' | 'user' | string | null;
};

type Lead = {
  id: string;
  nome?: string | null;
  telefone?: string | null;
  email?: string | null;
  mqlChats: Chat[];
  naoMqlChats: Chat[];
  iaWppChats: Chat[];
};

// --------- helpers
function getInitials(name?: string | null) {
  if (!name) return '?';
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0][0]?.toUpperCase() || '?';
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}
function getMsgISO(msg: any): string | null {
  return msg?.timestampz ?? msg?.created_at ?? msg?.createdAt ?? null;
}
function formatTimestampRaw(ts?: string | null) {
  if (!ts) return '';
  const m = String(ts).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return String(ts);
  const [, , , , hh, mm] = m;
  return `${hh}:${mm}`;
}
function extractPreview(msg: any): string {
  const raw = msg?.message as unknown;
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw);
      if (p && typeof p === 'object') {
        if (typeof (p as any).resposta === 'string' && (p as any).resposta.trim()) return (p as any).resposta;
        if (typeof (p as any).content === 'string') return (p as any).content;
        if ((p as any).data?.content) return (p as any).data.content as string;
        return JSON.stringify(p);
      }
    } catch {}
    return raw;
  }
  if (raw && typeof raw === 'object') {
    const o = raw as any;
    if (typeof o.resposta === 'string' && o.resposta.trim()) return o.resposta;
    if (typeof o.content === 'string') return o.content;
    if (o.data?.content) return o.data.content as string;
    return JSON.stringify(o);
  }
  return String(raw ?? '');
}
function getChatsByTab(lead: Lead, tab: TabKey): Chat[] {
  return tab === 'mql' ? lead.mqlChats : lead.naoMqlChats ;
}
function getLastChatOf(lead: Lead, tab: TabKey) {
  const arr = getChatsByTab(lead, tab);
  if (!arr?.length) return undefined;
  const withTime = arr.filter((c) => getMsgISO(c));
  if (withTime.length) {
    return withTime.sort((a, b) => (getMsgISO(a)! < getMsgISO(b)! ? 1 : -1))[0];
  }
  return arr[arr.length - 1];
}

// --------- props
interface UsersLayoutProps {
  tab: TabKey;
  onChangeTab: (t: TabKey) => void;
  selectedLeadId: string | null;
  onSelectLead: (id: string) => void;
}

export default function UsersLayout({
  tab, onChangeTab, selectedLeadId, onSelectLead,
}: UsersLayoutProps) {
  const { leadsWithChats = [], loading } = useLeadChats();
  const leads: Lead[] = leadsWithChats as any;

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const filteredLeads = React.useMemo(() => {
    // PRIMEIRO: Pega TODOS os leads que têm pelo menos uma conversa na aba selecionada
    const leadsWithChatsForTab = leads.filter((lead) => {
      const chatsForTab = getChatsByTab(lead, tab) || [];
      return chatsForTab.length > 0;
    });

    // SEGUNDO: Aplica filtros OPCIONAIS (só se o usuário definiu algo)
    const q = searchTerm.trim().toLowerCase();
    const hasSearchTerm = q.length > 0;
    const hasDateRange = !!startDate && !!endDate;

    let result = leadsWithChatsForTab;

    // Filtro de busca por texto (OPCIONAL)
    if (hasSearchTerm) {
      result = result.filter((lead) => {
        const matchesName = (lead.nome ?? '').toLowerCase().includes(q);
        const matchesPhone = (lead.telefone ?? '').toLowerCase().includes(q);
        const matchesEmail = (lead.email ?? '').toLowerCase().includes(q);
        const matchesSessionId = getChatsByTab(lead, tab).some(
          (chat) => (chat.session_id ?? '').toLowerCase().includes(q)
        );
        return matchesName || matchesPhone || matchesEmail || matchesSessionId;
      });
    }

    // Filtro de data (OPCIONAL)
    if (hasDateRange) {
      const start = new Date(startDate!);
      const end = new Date(endDate!);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      result = result.filter((lead) => {
        const chatsForTab = getChatsByTab(lead, tab);
        return chatsForTab.some((chat) => {
          const iso = getMsgISO(chat);
          if (!iso) return false;
          const chatDate = new Date(iso);
          return chatDate >= start && chatDate <= end;
        });
      });
    }

    // Ordena por última mensagem (mais recente primeiro)
    return result.sort((a, b) => {
      const lastA = getMsgISO(getLastChatOf(a, tab) || {}) || '';
      const lastB = getMsgISO(getLastChatOf(b, tab) || {}) || '';
      return lastA < lastB ? 1 : -1;
    });
  }, [leads, tab, searchTerm, startDate, endDate]);

  // Debug: log para verificar o que está acontecendo
  React.useEffect(() => {
    console.log('=== DEBUG USERS LAYOUT ===');
    console.log('Total leads carregados:', leads.length);
    
    const mqlLeads = leads.filter(lead => (lead.mqlChats?.length || 0) > 0);
    const naoMqlLeads = leads.filter(lead => (lead.naoMqlChats?.length || 0) > 0);
    
    console.log('Leads com MQL chats:', mqlLeads.length);
    console.log('Leads com Não-MQL chats:', naoMqlLeads.length);
    console.log('Aba atual:', tab);
    console.log('Leads filtrados exibidos:', filteredLeads.length);
    
    // Mostra alguns exemplos para debug
    if (leads.length > 0) {
      const leadComChats = leads.find(lead => 
        (lead.mqlChats?.length || 0) > 0 || (lead.naoMqlChats?.length || 0) > 0
      );
      
      if (leadComChats) {
        console.log('Exemplo de lead com chats:', {
          id: leadComChats.id,
          nome: leadComChats.nome,
          email: leadComChats.email,
          telefone: leadComChats.telefone,
          mqlChats: leadComChats.mqlChats?.length || 0,
          naoMqlChats: leadComChats.naoMqlChats?.length || 0
        });
        
        // Mostra alguns session_ids dos chats
        const chatsAtivos = getChatsByTab(leadComChats, tab);
        if (chatsAtivos.length > 0) {
          console.log(`Exemplos de session_id na aba ${tab}:`, 
            chatsAtivos.slice(0, 3).map(chat => chat.session_id)
          );
        }
      }
    }
    
    console.log('===========================');
  }, [leads, tab, filteredLeads]);

  return (
    <Container>
      <Header>
        <h2>Conversas</h2>

        {/* ---- Filtro por tipo (MQL / Não MQL) ---- */}
        <Tabs
          value={tab}
          onChange={(_, v) => onChangeTab(v)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider', mt: 1 }}
        >
          <Tab value="mql" label="MQL" />
          <Tab value="naoMql" label="Não MQL" />
        </Tabs>

        {/* ---- Filtros de Data ---- */}
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
            <DatePicker
              label="Data inicial"
              value={startDate}
              onChange={setStartDate}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  size: 'small',
                  variant: 'outlined',
                  sx: {
                    '& .MuiInputBase-input': { fontSize: 12 },
                    '& .MuiInputLabel-root': { fontSize: 12 },
                  },
                },
              }}
              maxDate={endDate ?? undefined}
            />
            <DatePicker
              label="Data final"
              value={endDate}
              onChange={setEndDate}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  size: 'small',
                  variant: 'outlined',
                  sx: {
                    '& .MuiInputBase-input': { fontSize: 12 },
                    '& .MuiInputLabel-root': { fontSize: 12 },
                  },
                },
              }}
              minDate={startDate ?? undefined}
            />
          </div>
        </LocalizationProvider>

        {/* ---- Busca ---- */}
        <SearchBar>
          <input
            placeholder="Pesquise por nome, telefone, email ou session_id"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </Header>

      {/* ---- Lista ---- */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
            Carregando…
          </Typography>
        ) : filteredLeads.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
            Nenhuma conversa encontrada para a aba "{tab === 'mql' ? 'MQL' : 'Não MQL'}".
          </Typography>
        ) : (
          <List disablePadding>
            {filteredLeads.map((lead) => {
              const last = getLastChatOf(lead, tab);
              const preview = last ? extractPreview(last) : '';
              const time = last ? formatTimestampRaw(getMsgISO(last)) : '';
              const active = String(lead.id) === String(selectedLeadId);

              return (
                <ListItemButton
                  key={lead.id}
                  onClick={() => onSelectLead(String(lead.id))}
                  selected={active}
                  sx={{ alignItems: 'flex-start', py: 1.5 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: active ? 'primary.main' : 'secondary.main' }}>
                      {getInitials(lead.nome)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1" noWrap sx={{ flex: 1 }}>
                          {lead.nome ?? 'Sem nome'}
                        </Typography>
                        {time && (
                          <Typography variant="caption" color="text.secondary">
                            {time}
                          </Typography>
                        )}
                      </Stack>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {preview}
                      </Typography>
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>
    </Container>
  );
}