// src/hooks/useHrMessagesCount.ts
import { useContext } from "react";
import { HrMessagesContext } from "@contexts/HrMessages";

export function useHrMessagesCount() {
    const ctx = useContext(HrMessagesContext);
    if (!ctx) throw new Error("useHrMessagesCount deve ser usado dentro de HrMessagesProvider");

    const {
        sent,
        received,
        total,
        sentToday,
        receivedToday,
        totalToday,
    } = ctx;

    return { sent, received, total, sentToday, receivedToday, totalToday };
}
