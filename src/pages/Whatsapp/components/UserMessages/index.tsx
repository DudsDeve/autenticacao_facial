import { useMemo, useEffect } from 'react';
import { useLeadChats } from '@contexts/LeadChatsContext';
import type { TabKey } from '../UsersLayout';
import {
  Bubble, ChatName, ChatProfile, Container, Header, MessagesList, BackBtn,
} from './styles';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { PATHS } from '@utils/paths';
import { useNavigate } from 'react-router-dom';

/* ===== types ===== */
type Chat = {
  id?: string | number;
  message: unknown;
  timestampz?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  session_id?: string | null;
  type?: 'ai' | 'user' | string | null;
};
type Lead = {
  id: string | number;
  nome?: string | null;
  telefone?: string | null;
  email?: string | null;
  mqlChats: Chat[];
  naoMqlChats: Chat[];
  iaWppChats: Chat[];
};
type Props = { tab: TabKey; selectedLeadId: string | null; isMobile?: boolean; onBack?: () => void; };

/* ===== helpers (iguais aos do HR) ===== */
function parseJSONMaybe(v: any) { if (v == null) return null; if (typeof v === 'object') return v; if (typeof v !== 'string') return null; try { return JSON.parse(v); } catch { return null; } }
function normalizeBreaks(s: string) { return s.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').replace(/\\"/g, '"'); }
function normalizeForCompare(s: string) { return normalizeBreaks(String(s)).trim().replace(/\s+/g, ' ').toLowerCase(); }
function formatTimestampRaw(ts?: string | null) { if (!ts) return ''; const m = String(ts).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/); if (!m) return String(ts); const [, y, mm, d, h, min, s] = m; return `${h}:${min}:${s} - ${d}/${mm}/${y}`; }
function getInitials(name?: string | null) { if (!name) return ''; const p = name.trim().split(' '); return p.length === 1 ? (p[0][0]?.toUpperCase() || '') : (p[0][0] + p[p.length - 1][0]).toUpperCase(); }
function extractMessage(msg: any): { type: string; content: string } {
  try {
    const raw = typeof msg === 'string' ? parseJSONMaybe(msg) ?? msg : msg;
    if (typeof raw === 'string') return { type: 'human', content: normalizeBreaks(raw) };
    if (raw && typeof raw === 'object') {
      const type = String(raw.type ?? raw.from ?? raw.role ?? 'human').toLowerCase();
      const content = raw.content ?? raw.text ?? raw.mensagem ?? raw.message ?? (typeof raw === 'string' ? raw : '');
      const text = typeof content === 'string' ? content : JSON.stringify(content ?? '');
      return { type, content: normalizeBreaks(text) };
    }
    return { type: 'human', content: '' };
  } catch { return { type: 'unknown', content: 'Erro ao ler mensagem' }; }
}
function safeTs(ms: any) { const v = ms ?? 0; const t = new Date(v).getTime(); return Number.isFinite(t) ? t : 0; }
function dedupeThread(items: any[]) {
  const seen = new Set<string>(); const out: any[] = [];
  for (const msg of items) {
    const parsed = extractMessage(msg.message);
    const isIA = parsed.type === 'ai' || String(msg?.type ?? '').toLowerCase() === 'ai';
    const ts = safeTs(msg.timestampz ?? msg.created_at ?? msg.createdAt) || safeTs(msg.__ts);
    const id = msg.id ? String(msg.id) : undefined;
    if (id && seen.has(id)) continue; if (id) seen.add(id);
    const canon = `${normalizeForCompare(parsed.content)}|${isIA ? 'ai' : 'human'}`;
    const prev = out[out.length - 1];
    if (prev) {
      const prevCanon = `${normalizeForCompare(prev.__parsed.content)}|${prev.__isIA ? 'ai' : 'human'}`;
      const close = Math.abs(ts - prev.__ts) <= 5000;
      if (canon === prevCanon && close) continue;
    }
    out.push({ ...msg, __parsed: parsed, __isIA: isIA, __ts: ts });
  }
  return out;
}

/* ===== component ===== */
export default function UserMessages({ tab, selectedLeadId, onBack }: Props) {
  const { leadsWithChats = [] } = useLeadChats();
  const leads: Lead[] = (leadsWithChats as any) ?? [];
  const navigate = useNavigate();

  const lead = useMemo(() => leads.find(l => String(l.id) === String(selectedLeadId)) ?? null, [leads, selectedLeadId]);

  const rawThread: Chat[] = useMemo(() => {
    if (!lead) return [];
    return tab === 'mql' ? (lead.mqlChats ?? [])
         : tab === 'naoMql' ? (lead.naoMqlChats ?? [])
         : (lead.iaWppChats ?? []);
  }, [lead, tab]);

  const userMessages = useMemo(() => dedupeThread(rawThread), [rawThread]);
  useEffect(() => {}, [userMessages, selectedLeadId, tab]);

  const handleBack = (e?: React.MouseEvent) => {
    e?.preventDefault(); e?.stopPropagation();
    onBack?.();
    const target = PATHS?.whatsapp ?? '/whatsapp';
    try { navigate(target, { replace: true }); } catch { if (typeof window !== 'undefined') window.location.assign(target); }
  };

  return (
    <Container>
      <Header>
        {onBack && (
          <BackBtn>
            <IconButton aria-label="voltar" onClick={handleBack}>
              <ArrowBackIosNewIcon />
            </IconButton>
          </BackBtn>
        )}

        <ChatProfile>{getInitials(lead?.nome) || (selectedLeadId ? selectedLeadId[0].toUpperCase() : '')}</ChatProfile>

        <ChatName style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {lead ? `${lead?.nome ?? 'Sem nome'} - ${lead?.telefone ?? 'Sem telefone'}` : 'Selecione uma conversa'}
        </ChatName>
      </Header>

      <MessagesList>
        {userMessages.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
            {selectedLeadId ? 'Nenhuma mensagem encontrada para esta conversa.' : 'Selecione uma conversa à esquerda para ver as mensagens.'}
          </div>
        ) : (
          userMessages.map((msg: any, idx: number) => {
            const parsed = msg.__parsed as { type: string; content: string };
            const isIA = msg.__isIA as boolean;
            const ts = msg.timestampz ?? msg.created_at ?? msg.createdAt ?? null;
            if (!parsed?.content) return null;
            return (
              <Bubble key={msg.id ?? `${msg.session_id}-${msg.__ts}-${idx}`} $fromIA={isIA}>
                <div className="bubble-content">{parsed.content}</div>
                {ts && <span className="bubble-hour">{formatTimestampRaw(ts)}</span>}
              </Bubble>
            );
          })
        )}
        <div />
      </MessagesList>
    </Container>
  );
}
