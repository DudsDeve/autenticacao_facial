import { useState } from 'react';
import {
  Container, Header, SearchBar, ChatList, ChatItem,
  ChatName, ChatLastMessage, ChatHour, DataTypes, Type,
  ChatProfile,
} from './styles';
import { useMessagesContext } from '@hooks/useMessages';
import type { Message } from '../../../../models/Message';

// MUI DatePicker com DateFns e locale ptBR
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

type MessageType = 'mql' | 'naoMql' | 'iaWpp';

function groupBySessionIdLastMessage(messages: Message[] = []) {
  if (!Array.isArray(messages)) return [];
  const sessions = new Map();
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!sessions.has(msg.session_id)) {
      sessions.set(msg.session_id, msg);
    }
  }
  return Array.from(sessions.values());
}

export function UsersLayout({ onSelectUser, selectedSession, selectedType, setSelectedType }: {
  onSelectUser: (sessionId: string, type: MessageType) => void;
  selectedSession: string | null;
  selectedType: MessageType;
  setSelectedType: (type: MessageType) => void;
}) {
  const { mqlMessages = [], naoMqlMessages = [], iaWppMessages = [], loading } = useMessagesContext();
  const [searchTerm, setSearchTerm] = useState('');

  // NOVO: states para datas (JS Date, não mais dayjs)
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const messages =
    selectedType === 'mql'
      ? mqlMessages ?? []
      : selectedType === 'naoMql'
      ? naoMqlMessages ?? []
      : iaWppMessages ?? [];

  const groupedMessages = groupBySessionIdLastMessage(messages);

  // FILTRO: texto + intervalo de datas (com Date JS)
  const filteredMessages = groupedMessages.filter((msg) => {
    const sessionId = String(msg.session_id ?? '').toLowerCase();
    const nome = (msg.lead?.nome ?? '').toLowerCase();

    const matchesText =
      sessionId.includes(searchTerm.toLowerCase()) ||
      nome.includes(searchTerm.toLowerCase());

    let matchesDate = true;
    if (startDate && endDate && msg.timestampz) {
      const msgDate = new Date(msg.timestampz);
      // Zera a hora para considerar apenas a data
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      matchesDate = msgDate >= start && msgDate <= end;
    }

    return matchesText && matchesDate;
  });

  function getInitials(name?: string) {
    if (!name) return '';
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0][0]?.toUpperCase() || '';
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  function getLastMessageText(msg: any) {
    let parsedMessage;
    try {
      parsedMessage =
        typeof msg.message === "string"
          ? JSON.parse(msg.message)
          : msg.message;
    } catch (e) {
      parsedMessage = {
        type: "unknown",
        content: "Erro ao ler mensagem",
      };
    }
    return parsedMessage?.content ?? '';
  }

function formatTimestampRaw(timestampz: string) {
  if (!timestampz) return '';
  // Exemplo de entrada: '2025-07-10 15:55:58.819128+00'
  // Extrai data e hora com regex
  const match = timestampz.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!match) return timestampz; // se não casar, retorna original

  const [, year, month, day, hour, min, sec] = match;
  return `${hour}:${min}:${sec} - ${day}/${month}/${year}`;
}
  return (
    <Container>
      <Header>
        <h2>Conversas</h2>
        <DataTypes>
          <Type
            onClick={() => setSelectedType('mql')}
            style={{ background: selectedType === 'mql' ? '#8830E1' : undefined, color: selectedType === 'mql' ? '#fff' : undefined }}
          >Mql</Type>
          <Type
            onClick={() => setSelectedType('naoMql')}
            style={{ background: selectedType === 'naoMql' ? '#8830E1' : undefined, color: selectedType === 'naoMql' ? '#fff' : undefined }}
          >Não mql</Type>
          <Type
            onClick={() => setSelectedType('iaWpp')}
            style={{ background: selectedType === 'iaWpp' ? '#8830E1' : undefined, color: selectedType === 'iaWpp' ? '#fff' : undefined }}
          >Ia Wpp</Type>
        </DataTypes>
        {/* Date Pickers: */}
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
                  }
                }
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
                  }
                }
              }}
              minDate={startDate ?? undefined}
            />
          </div>
        </LocalizationProvider>

        <SearchBar>
          <input
            placeholder="Pesquise pelo número ou email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </Header>
      <ChatList>
        {loading ? (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
            Carregando...
          </div>
        ) : (
          filteredMessages.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
              Nenhuma conversa encontrada.
            </div>
          ) : (
            filteredMessages.filter(msg => !!msg.timestampz).map((msg) => (
              <ChatItem
                key={msg.session_id}
                onClick={() => onSelectUser(msg.session_id, selectedType)}
                style={{
                  cursor: 'pointer',
                  background: selectedSession === msg.session_id ? '#D93CFF' : undefined,
                  color: selectedSession === msg.session_id ? '#ffffff' : undefined,
                }}
              >
                <ChatProfile>
                  {getInitials(msg.lead?.nome) || (msg.session_id ? msg.session_id[0].toUpperCase() : '')}
                </ChatProfile>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <ChatName>{msg.lead?.nome ?? 'Sem número'}</ChatName>
                                   <ChatLastMessage>{getLastMessageText(msg)}</ChatLastMessage>

                </div>
                <div>
                {msg.timestampz && (
  <ChatHour style={{
    color: selectedSession === msg.session_id ? '#ffffff' : undefined,
  }}>
    {formatTimestampRaw(msg.timestampz)}
  </ChatHour>
)}

                </div>
              </ChatItem>
            ))
          )
        )}
      </ChatList>
    </Container>
  );
}
