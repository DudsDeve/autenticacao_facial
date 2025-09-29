export interface Message {
    id: number;
    session_id: string;
    message: any;
    timestamp?: string | null;
    timestamp_formated?: string | null;
    timestampz?: string | null;
    lead?: {
        nome?: string;
        email?: string;
        telefone?: string;
        // outros campos se precisar
    } | null;
}


