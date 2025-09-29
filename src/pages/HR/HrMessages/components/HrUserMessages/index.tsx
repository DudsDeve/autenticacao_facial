// src/pages/HR/HrMessages/components/HrUserMessages/index.tsx
import { useMemo, useEffect } from "react";
import { useHrMessages } from "@hooks/useHrMessages";
import {
  Bubble,
  ChatName,
  ChatProfile,
  Container,
  Header,
  MessagesList,
  BackBtn,
} from "./styles";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { PATHS } from '@utils/paths'; // ajuste para onde você define os paths
import { useNavigate } from "react-router-dom";

type Props = {
  sessionId: string | null;
  isMobile?: boolean;
  onBack?: () => void;
};

/* ===== helpers ===== */
function parseJSONMaybe(v: any) {
  if (v == null) return null;
  if (typeof v === "object") return v;
  if (typeof v !== "string") return null;
  try { return JSON.parse(v); } catch { return null; }
}
function normalizeBreaks(s: string) {
  return s.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\\"/g, '"');
}
function normalizeForCompare(s: string) {
  // normaliza quebras/espaços para comparar conteúdo
  return normalizeBreaks(String(s))
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}
function formatTimestampRaw(timestampz?: string | null) {
  if (!timestampz) return "";
  const m = String(timestampz).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return String(timestampz);
  const [, y, mm, d, h, min, s] = m;
  return `${h}:${min}:${s} - ${d}/${mm}/${y}`;
}
function getInitials(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
/** Extrai {type, content} */
function extractMessage(msg: any): { type: string; content: string } {
  try {
    const raw = typeof msg === "string" ? parseJSONMaybe(msg) ?? msg : msg;
    if (typeof raw === "string") {
      return { type: "human", content: normalizeBreaks(raw) };
    }
    if (raw && typeof raw === "object") {
      const type = String(raw.type ?? raw.from ?? raw.role ?? "human").toLowerCase();
      const content =
        raw.content ?? raw.text ?? raw.mensagem ?? raw.message ??
        (typeof raw === "string" ? raw : "");
      const text = typeof content === "string" ? content : JSON.stringify(content ?? "");
      return { type, content: normalizeBreaks(text) };
    }
    return { type: "human", content: "" };
  } catch {
    return { type: "unknown", content: "Erro ao ler mensagem" };
  }
}
function safeTs(ms: any): number {
  const v = ms ?? 0;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** Remove duplicadas mantendo ordem:
 * - id repetido -> remove
 * - mesmo conteúdo (normalizado) + mesmo emissor + dentro de 5s -> remove
 */
function dedupeThread(items: any[]) {
  const seenIds = new Set<string>();
  const out: any[] = [];

  for (const msg of items) {
    const parsed = extractMessage(msg.message);
    const isIA = parsed.type === "ai";
    const ts = safeTs(msg.timestampz ?? msg.created_at);
    const id = msg.id ? String(msg.id) : undefined;

    if (id && seenIds.has(id)) continue;
    if (id) seenIds.add(id);

    const canon = `${normalizeForCompare(parsed.content)}|${isIA ? "ai" : "human"}`;

    const prev = out[out.length - 1];
    if (prev) {
      const prevCanon = `${normalizeForCompare(prev.__parsed.content)}|${prev.__isIA ? "ai" : "human"}`;
      const closeInTime = Math.abs(ts - prev.__ts) <= 5000; // 5s
      if (canon === prevCanon && closeInTime) continue; // descarta duplicada
    }

    out.push({
      ...msg,
      __parsed: parsed,
      __isIA: isIA,
      __ts: ts,
    });
  }

  return out;
}

/* ===== componente ===== */
// ...
export function HrUsersMessages({ sessionId,  onBack }: Props) {
  const { getThread } = useHrMessages();
  const navigate = useNavigate();

  const rawThread = useMemo(
    () => (sessionId ? getThread(sessionId) : []),
    [sessionId, getThread]
  );
  const userMessages = useMemo(() => dedupeThread(rawThread), [rawThread]);

  useEffect(() => {}, [userMessages, sessionId]);

  const headerCandidate = userMessages?.[0]?.candidate ?? null;

  const handleBack = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onBack?.(); // volta pro layout no mobile

    const target = PATHS?.hrMessages ?? "/hr-messages";
    try {
      navigate(target, { replace: true });
    } catch {
      if (typeof window !== "undefined") window.location.assign(target);
    }
  };

  return (
    <Container>
      <Header>
        {onBack && ( // só mostra seta se no mobile
          <BackBtn>
            <IconButton aria-label="voltar" onClick={handleBack}>
              <ArrowBackIosNewIcon />
            </IconButton>
          </BackBtn>
        )}

        <ChatProfile>
          {getInitials(headerCandidate?.nome_completo) ||
            (sessionId ? sessionId[0].toUpperCase() : "")}
        </ChatProfile>

        <ChatName
          style={{
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {headerCandidate
            ? `${headerCandidate?.nome_completo ?? "Sem nome"} - ${
                headerCandidate?.telefone ?? "Sem telefone"
              }`
            : "Selecione uma conversa"}
        </ChatName>
      </Header>

      <MessagesList>
        {userMessages.length === 0 ? (
          <div style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
            {sessionId
              ? "Nenhuma mensagem encontrada para esta conversa."
              : "Selecione uma conversa à esquerda para ver as mensagens."}
          </div>
        ) : (
          userMessages.map((msg: any, idx: number) => {
            const parsed = msg.__parsed as { type: string; content: string };
            const isIA = msg.__isIA as boolean;
            const ts = msg.timestampz ?? msg.created_at ?? null;

            if (!parsed?.content) return null;

            return (
              <Bubble
                key={msg.id ?? `${msg.session_id}-${msg.__ts}-${idx}`}
                $fromIA={isIA}
              >
                <div className="bubble-content">{parsed.content}</div>
                {ts && (
                  <span className="bubble-hour">{formatTimestampRaw(ts)}</span>
                )}
              </Bubble>
            );
          })
        )}
        <div />
      </MessagesList>
    </Container>
  );
}

