import { useMemo, useState } from "react";
import { useHrMessages } from "@hooks/useHrMessages";
import {
  Container, Header, SearchBar, ChatList, ChatItem,
  ChatName, ChatLastMessage, ChatHour, ChatProfile
} from "./styles";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";

type Props = {
  onSelectUser: (sessionId: string) => void;
  selectedSession: string | null;
};

function initials(name?: string, sid?: string) {
  if (name) {
    const p = name.trim().split(" ");
    return p.length === 1
      ? (p[0][0]?.toUpperCase() ?? "")
      : (p[0][0] + p[p.length - 1][0]).toUpperCase();
  }
  return sid?.[0]?.toUpperCase() ?? "?";
}
function formatTimestampRaw(timestampz?: string | null) {
  if (!timestampz) return "";
  const m = String(timestampz).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return String(timestampz);
  const [, y, mo, d, h, mi, s] = m;
  return `${h}:${mi}:${s} - ${d}/${mo}/${y}`;
}
function getLastMessageText(lastMessage: any) {
  if (!lastMessage) return "—";
  try {
    const raw = typeof lastMessage.message === "string"
      ? JSON.parse(lastMessage.message)
      : lastMessage.message;
    const content =
      raw?.content ?? raw?.text ?? raw?.mensagem ?? raw?.message ??
      (typeof raw === "string" ? raw : "");
    return typeof content === "string" ? content : JSON.stringify(content);
  } catch {
    return "—";
  }
}

export function HrUsersLayout({ onSelectUser, selectedSession }: Props) {
  const { sessions = [], loading } = useHrMessages();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const filteredAndSorted = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
  
    // helper: converte ISO/Date/string em epoch; nulos viram -Infinity
    const toEpoch = (v: any): number => {
      if (!v) return Number.NEGATIVE_INFINITY;
      const t = new Date(v).getTime();
      return Number.isFinite(t) ? t : Number.NEGATIVE_INFINITY;
    };
  
    // pega o melhor timestamp do "último evento" da sessão
    const lastEpoch = (s: typeof sessions[number]) =>
      toEpoch(
        s?.lastMessage?.timestampz 
     
      );
  
    const filtered = sessions.filter(({ session_id, candidate, lastMessage }) => {
      const nome = String(candidate?.nome_completo ?? candidate?.nome ?? "").toLowerCase();
      const tel  = String(candidate?.telefone ?? candidate?.celular ?? "").toLowerCase();
      const sid  = String(session_id ?? "").toLowerCase();
  
      const matchesText = !q || sid.includes(q) || nome.includes(q) || tel.includes(q);
  
      // filtro por data (se ambos informados)
      let matchesDate = true;
      if (startDate && endDate) {
        const epoch = lastEpoch({ session_id, candidate, lastMessage } as any);
        if (Number.isFinite(epoch)) {
          const start = new Date(startDate); start.setHours(0, 0, 0, 0);
          const end   = new Date(endDate);   end.setHours(23, 59, 59, 999);
          matchesDate = epoch >= start.getTime() && epoch <= end.getTime();
        } else {
          matchesDate = false; // sem último horário => fora do intervalo
        }
      }
  
      return matchesText && matchesDate;
    });
  
    // ORDEM: mais novo primeiro (desc)
    // -Infinity (sem timestamp) vai para o final
    return filtered.sort((a, b) => lastEpoch(b) - lastEpoch(a));
  }, [sessions, searchTerm, startDate, endDate]);

  return (
    <Container>
      <Header>
        <h2>Conversas</h2>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
            <DatePicker
              label="Data inicial"
              value={startDate}
              onChange={setStartDate}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: {
                    "& .MuiInputBase-input": { fontSize: 12 },
                    "& .MuiInputLabel-root": { fontSize: 12 },
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
                  size: "small",
                  variant: "outlined",
                  sx: {
                    "& .MuiInputBase-input": { fontSize: 12 },
                    "& .MuiInputLabel-root": { fontSize: 12 },
                  },
                },
              }}
              minDate={startDate ?? undefined}
            />
          </div>
        </LocalizationProvider>

        <SearchBar>
          <input
            placeholder="Pesquise por nome, telefone ou session_id"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </Header>

      <ChatList>
        {loading ? (
          <div style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
            Carregando...
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
            Nenhuma conversa encontrada.
          </div>
        ) : (
          filteredAndSorted.map(({ session_id, candidate, lastMessage }) => {
            const name = candidate?.nome_completo ?? candidate?.nome ?? session_id;
            const lastText = getLastMessageText(lastMessage);
            const iso = lastMessage?.timestampz ?? null;
            const selected = selectedSession === session_id;

            return (
              <ChatItem
                key={session_id}
                onClick={() => onSelectUser(session_id)}
                style={{
                  cursor: "pointer",
                  background: selected ? "#D93CFF" : undefined,
                  color: selected ? "#ffffff" : undefined,
                }}
              >
                <ChatProfile>{initials(name, session_id)}</ChatProfile>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <ChatName>{name}</ChatName>
                  <ChatLastMessage>{lastText}</ChatLastMessage>
                </div>

                <div>
                  {iso && (
                    <ChatHour style={{ color: selected ? "#ffffff" : undefined }}>
                      {formatTimestampRaw(iso)}
                    </ChatHour>
                  )}
                </div>
              </ChatItem>
            );
          })
        )}
      </ChatList>
    </Container>
  );
}
