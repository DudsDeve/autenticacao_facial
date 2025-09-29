import type { Lead } from "./Lead";
import type { Message } from "./Message";

export interface LeadWithChats extends Lead {
    mqlChats: Message[];
    naoMqlChats: Message[];
    iaWppChats: Message[];
}