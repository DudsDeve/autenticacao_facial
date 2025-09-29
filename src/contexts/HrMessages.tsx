// src/contexts/HrMessages.tsx
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@database/SupabaseClient";
import type { Hr } from "src/models/Hr";
import type { HrMessage } from "src/models/HrMessage";

/* =======================
   Utils de telefone/keys
   ======================= */

function onlyDigits(s?: string | null) {
  return (s || "").replace(/\D/g, "");
}
function buildPhoneKeys(raw?: string | null): string[] {
  const d = onlyDigits(raw);
  if (!d) return [];
  const keys = new Set<string>();
  const local = d.startsWith("55") ? d.slice(2) : d;

  const last13 = d.length > 13 ? d.slice(-13) : d;
  const last11 = d.length > 11 ? d.slice(-11) : d;
  const last10 = d.length > 10 ? d.slice(-10) : d;

  if (last11.length >= 11) keys.add(last11.slice(-11));
  if (last10.length >= 10) keys.add(last10.slice(-10));

  if (local.length >= 11) keys.add(local.slice(-11));
  if (local.length >= 10) keys.add(local.slice(-10));

  const local10 = local.slice(-10);
  const local11 = local.slice(-11);
  if (local10.length === 10) {
    keys.add(local10);
    keys.add(local10.slice(0, 2) + "9" + local10.slice(2));
  }
  if (local11.length === 11 && local11[2] === "9") {
    keys.add(local11);
    keys.add(local11.slice(0, 2) + local11.slice(3));
  }

  if (last13.length === 13 && last13.startsWith("55")) {
    const l = last13.slice(2);
    keys.add(l);
    if (l[2] === "9") keys.add(l.slice(0, 2) + l.slice(3));
  }

  return Array.from(keys);
}

/* =======================
   Utils de data/texto
   ======================= */

function getISO(m: Partial<HrMessage> | any): string | null {
  const raw =
    m?.timestampz ??
    m?.created_at ??
    m?.createdAt ??
    m?.timestamp ??
    m?.last_message_at ??
    null;
  if (!raw) return null;
  if (raw instanceof Date) return raw.toISOString();
  if (typeof raw === "number") return new Date(raw).toISOString();
  if (typeof raw === "string") return raw.includes(" ") ? raw.replace(" ", "T") : raw;
  try { return new Date(raw as any).toISOString(); } catch { return null; }
}

/* =======================
   Contagem: parse do payload
   ======================= */
   function parseMaybeJSON(v: any) {
    if (v == null) return null;
    if (typeof v === "object") return v;
    if (typeof v !== "string") return null;
    try { return JSON.parse(v); } catch { return null; }
  }
  
  // Mapeia vários campos possíveis para "ai" | "human"
  function normalizeRole(v: any): "ai" | "human" | "" {
    const s = String(v ?? "").toLowerCase();
    if (!s) return "";
    // sinônimos comuns
    if (["ai","assistant","bot","system","model"].includes(s)) return "ai";
    if (["human","user","cliente","candidato","candidate","client","operator","attendant","agent"].includes(s)) return "human";
    return "";
  }
  
  function extractTypeFromMessagePayload(msg: any): "ai" | "human" | "" {
    // 1) tenta no JSON do campo message
    const raw = typeof msg?.message === "string" ? parseMaybeJSON(msg.message) ?? msg.message : msg?.message;
  
    if (raw && typeof raw === "object") {
      // caminhos diretos
      let t =
        normalizeRole((raw as any).type) ||
        normalizeRole((raw as any).from) ||
        normalizeRole((raw as any).role) ||
        normalizeRole((raw as any).sender) ||
        normalizeRole((raw as any).author) ||
        normalizeRole((raw as any).who) ||
        normalizeRole((raw as any).source);
  
      // caminhos aninhados comuns
      t = t ||
        normalizeRole((raw as any).data?.role) ||
        normalizeRole((raw as any).metadata?.role) ||
        normalizeRole((raw as any).metadata?.from) ||
        normalizeRole((raw as any).message?.role);
  
      // sinalizadores booleanos
      if (!t) {
        const isBot = (raw as any).is_bot ?? (raw as any).bot ?? (raw as any).assistant ?? (raw as any).ai;
        const isUser = (raw as any).is_user ?? (raw as any).human ?? (raw as any).user;
        if (isBot === true) t = "ai";
        else if (isUser === true) t = "human";
      }
      if (t) return t;
    }
  
    // 2) fallback no próprio registro (coluna type/who/etc)
    const t2 =
      normalizeRole((msg as any)?.type) ||
      normalizeRole((msg as any)?.from) ||
      normalizeRole((msg as any)?.role) ||
      normalizeRole((msg as any)?.who);
  
    if (t2) return t2;
  
    return "";
  }
/* =======================
   Tipos exportados
   ======================= */

export type EnrichedMessage = HrMessage & { candidate: Hr | null };

export interface HrMessagesCtx {
  loading: boolean;
  error: string | null;
  candidates: Hr[];
  messages: EnrichedMessage[];
  sessions: Array<{
    session_id: string;
    candidate: Hr | null;
    lastMessage: EnrichedMessage | null;
  }>;
  getThread: (sessionId: string) => EnrichedMessage[];
  refresh: () => Promise<void>;

  // NOVOS CAMPOS (iguais ao outro contexto):
  sent: number;          // total enviadas (ai)
  received: number;      // total recebidas (human)
  total: number;         // sent + received
  sentToday: number;
  receivedToday: number;
  totalToday: number;
}

/* =======================
   Context / Provider
   ======================= */

export const HrMessagesContext = createContext<HrMessagesCtx>({} as HrMessagesCtx);

export function HrMessagesProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Hr[]>([]);
  const [messagesRaw, setMessagesRaw] = useState<HrMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const candidateIndex = useMemo(() => {
    const idx = new Map<string, Hr>();
    for (const c of candidates) {
      for (const k of buildPhoneKeys(c.telefone || c.celular)) {
        if (k && !idx.has(k)) idx.set(k, c);
      }
    }
    return idx;
  }, [candidates]);

  const enrich = useCallback(
    (list: HrMessage[]): EnrichedMessage[] =>
      list.map((m) => {
        const keys = buildPhoneKeys(m.session_id);
        let candidate: Hr | undefined;
        for (const k of keys) {
          candidate = candidateIndex.get(k);
          if (candidate) break;
        }
        return { ...m, candidate: candidate ?? null };
      }),
    [candidateIndex]
  );

  // -------- fetchers --------
  const fetchCandidates = useCallback(async () => {
    const { data, error } = await supabase.from("candidatos_aure").select("*");
    if (error) throw error;
    return (data || []) as Hr[];
  }, []);

  const PAGE = 1000;
  const fetchMessages = useCallback(async () => {
    let acc: HrMessage[] = [];
    let from = 0;
    let keep = true;
    while (keep) {
      const { data, error } = await supabase
        .from("rh_chat_histories")
        .select("*")
        .order("id", { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (data && data.length) {
        acc = acc.concat(data as HrMessage[]);
        from += PAGE;
        keep = data.length === PAGE;
      } else {
        keep = false;
      }
    }
    return acc;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cand, msgs] = await Promise.all([fetchCandidates(), fetchMessages()]);
      setCandidates(cand);
      setMessagesRaw(msgs);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Erro ao carregar dados");
      setCandidates([]);
      setMessagesRaw([]);
    } finally {
      setLoading(false);
    }
  }, [fetchCandidates, fetchMessages]);

  useEffect(() => { void refresh(); }, [refresh]);

  // Enriquecidas
  const messages = useMemo(() => enrich(messagesRaw), [messagesRaw, enrich]);

  // Sessions (última mensagem por sessão) — já ordenadas por mais recentes
  const sessions = useMemo(() => {
    const last = new Map<string, EnrichedMessage>();
    for (const m of messages) {
      const sid = m.session_id;
      const cur = last.get(sid);
      const a = cur ? getISO(cur) : null;
      const b = getISO(m);
      if (!cur || (a && b && new Date(b) > new Date(a))) last.set(sid, m);
    }
    return Array.from(last.entries())
      .map(([session_id, lastMessage]) => ({
        session_id,
        lastMessage,
        candidate: lastMessage?.candidate ?? null,
      }))
      .sort((x, y) => {
        const a = x.lastMessage ? getISO(x.lastMessage) : null;
        const b = y.lastMessage ? getISO(y.lastMessage) : null;
        if (!a && !b) return 0;
        if (!a) return 1;
        if (!b) return -1;
        return new Date(b).getTime() - new Date(a).getTime();
      });
  }, [messages]);

  // Thread por sessão (ordem cronológica)
  const getThread = useCallback(
    (sessionId: string) =>
      messages
        .filter((m) => m.session_id === sessionId)
        .sort((a, b) => {
          const ia = getISO(a);
          const ib = getISO(b);
          if (!ia && !ib) return 0;
          if (!ia) return -1;
          if (!ib) return 1;
          return new Date(ia).getTime() - new Date(ib).getTime();
        }),
    [messages]
  );

  /* ========== CONTADORES (iguais ao outro contexto) ========== */

  // Totais (tudo)
  const { sent, received, total } = useMemo(() => {
    let s = 0, r = 0;
    for (const m of messages) {
      const t = extractTypeFromMessagePayload(m);
      if (t === "ai") s += 1;
      if (t === "human") r += 1;
    }
    return { sent: s, received: r, total: s + r };
  }, [messages]);

  // "Hoje"
  const { sentToday, receivedToday, totalToday } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    let s = 0, r = 0, tot = 0;
    for (const m of messages) {
      const iso = getISO(m);
      if (!iso) continue;
      if (iso.slice(0, 10) !== today) continue;
      const t = extractTypeFromMessagePayload(m);
      tot += 1;
      if (t === "ai") s += 1;
      if (t === "human") r += 1;
    }
    return { sentToday: s, receivedToday: r, totalToday: tot };
  }, [messages]);

  const value: HrMessagesCtx = {
    loading,
    error,
    candidates,
    messages,
    sessions,
    getThread,
    refresh,

    // contadores
    sent,
    received,
    total,
    sentToday,
    receivedToday,
    totalToday,
  };

  // realtime (INSERT)
  useEffect(() => {
    const ch = supabase
      .channel("realtime-rh-chat-histories")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rh_chat_histories" },
        (payload) => {
          setMessagesRaw((prev) => {
            const exists = prev.some((p: any) => p.id === (payload as any).new?.id);
            return exists ? prev : [...prev, (payload as any).new as HrMessage];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return <HrMessagesContext.Provider value={value}>{children}</HrMessagesContext.Provider>;
}
