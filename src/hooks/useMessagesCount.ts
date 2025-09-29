import { useMessagesContext } from "./useMessages";

export function useMessagesCount() {
    const { mqlMessages, naoMqlMessages, iaWppMessages, sentToday,
        receivedToday, totalToday
    } = useMessagesContext();

    // Junta todas as mensagens de todas as tabelas
    const allMessages = [
        ...mqlMessages,
        ...naoMqlMessages,
        ...iaWppMessages
    ];

    // Conta de acordo com o type do objeto "message"
    let sent = 0;
    let received = 0;

    allMessages.forEach(msg => {
        // O campo message pode ser JSON ou string, então faz o parse se necessário
        let parsedMessage: any;
        if (typeof msg.message === 'string') {
            try {
                parsedMessage = JSON.parse(msg.message);
            } catch {
                return;
            }
        } else {
            parsedMessage = msg.message;
        }

        if (parsedMessage?.type === 'ai') sent += 1;
        if (parsedMessage?.type === 'human') received += 1;
    });

    const total = sent + received;

    return { sent, received, total, sentToday, receivedToday, totalToday };
}
