// pages/Whatsapp/components/UserMessages/index.tsx
import { useEffect } from 'react';
import type { Message } from '../../../../models/Message';
import { Bubble, ChatName, ChatProfile, Container, Header, MessagesList, BackBtn } from './styles';
import { useMessagesContext } from '@hooks/useMessages';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

type MessageType = 'mql' | 'naoMql' | 'iaWpp';

interface UserMessagesProps {
  sessionId: string | null;
  type: MessageType | null;
  isMobile?: boolean;
  onBack?: () => void;
}

export function UserMessages({ sessionId, type, isMobile, onBack }: UserMessagesProps) {
  const { mqlMessages = [], naoMqlMessages = [], iaWppMessages = [] } = useMessagesContext();

  let messages: Message[] = [];
  if (type === 'mql') messages = mqlMessages;
  else if (type === 'naoMql') messages = naoMqlMessages;
  else if (type === 'iaWpp') messages = iaWppMessages;

  const userMessages = sessionId
    ? (messages ?? []).filter(msg => msg.session_id === sessionId)
    : [];

  useEffect(() => {}, [userMessages, sessionId]);

  function formatTimestampRaw(timestampz: string) {
    if (!timestampz) return '';
    const match = timestampz.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
    if (!match) return timestampz;
    const [, year, month, day, hour, min, sec] = match;
    return `${hour}:${min}:${sec} - ${day}/${month}/${year}`;
  }

  function getInitials(name?: string) {
    if (!name) return '';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || '';
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  /**
   * Extrai o texto exibível e se é mensagem da IA.
   * Prioriza objeto { resposta: string } quando vier JSON.
   */
  function extractDisplay(msg: Message): { text: string; isIA: boolean } {
    const raw = msg.message as unknown;

    // Caso 1: string que pode (ou não) ser JSON
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // prioriza "resposta"
          if (typeof parsed.resposta === 'string' && parsed.resposta.trim() !== '') {
            return { text: parsed.resposta, isIA: parsed.type === 'ai'  };
          }
          // fallback: content
          if (typeof parsed.content === 'string') {
            return { text: parsed.content, isIA: parsed.type === 'ai'  };
          }
        }
      } catch {
        // não era JSON: usa texto cru
      }
      return { "text": "", "isIA": false };
    }

    // Caso 2: objeto já parseado
    if (raw && typeof raw === 'object') {
      const anyObj = raw as Record<string, unknown>;
      if (typeof anyObj.resposta === 'string' && anyObj.resposta.trim() !== '') {
        return { text: anyObj.resposta, isIA: anyObj.type === 'ai' };
      }
      if (typeof anyObj.content === 'string') {
        return { text: anyObj.content, isIA: anyObj.type === 'ai'  };
      }
    }

    // Fallback geral
    return { text: String(raw ?? ''), isIA: false };
  }

  return (
    <Container>
      <Header>
        {isMobile && (
          <BackBtn>
            <IconButton aria-label="voltar" onClick={onBack}>
              <ArrowBackIosNewIcon />
            </IconButton>
          </BackBtn>
        )}

        <ChatProfile>
          {getInitials(userMessages[0]?.lead?.nome) ||
            (sessionId ? sessionId[0].toUpperCase() : '')}
        </ChatProfile>

        <ChatName style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {userMessages[0]
            ? `${userMessages[0].lead?.nome ?? 'Sem nome'} - ${userMessages[0].lead?.telefone ?? 'Sem telefone'}`
            : 'Selecione uma conversa'}
        </ChatName>
      </Header>

      <MessagesList>
        {userMessages.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
            {sessionId
              ? 'Nenhuma mensagem encontrada para esta conversa.'
              : 'Selecione uma conversa à esquerda para ver as mensagens.'}
          </div>
        ) : (
          userMessages.map((msg) => {
            const { text, isIA } = extractDisplay(msg);
            return (
              <Bubble key={msg.id} $fromIA={isIA}>
                <div className="bubble-content" style={{ whiteSpace: 'pre-wrap' }}>
                  {text}
                </div>
                {msg.timestampz && (
                  <span className="bubble-hour">{formatTimestampRaw(msg.timestampz)}</span>
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
