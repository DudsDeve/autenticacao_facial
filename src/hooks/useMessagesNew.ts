import { MessagesContext } from "@contexts/Messages";
import { useContext } from "react";

export function useMessagesContext() {
    const context = useContext(MessagesContext);
    if (!context) throw new Error('useMessagesContext precisa estar dentro do MessagesProvider');
    return context;
}
