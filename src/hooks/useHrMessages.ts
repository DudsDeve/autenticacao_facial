import { useContext } from "react";
import { HrMessagesContext } from "@contexts/HrMessages";

export function useHrMessages() {
    const ctx = useContext(HrMessagesContext);
    if (!ctx) throw new Error("useHrMessages precisa estar dentro de <HrMessagesProvider/>");
    return ctx;
}
