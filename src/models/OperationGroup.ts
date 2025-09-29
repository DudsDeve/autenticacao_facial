export interface OperationGroup {
    // Tabela de grupos
    id: number;
    created_at: string; // ISO date string (timestamp with time zone)
    grupo_id: string;
    grupo_nome: string;
    grupo_numero_de_integrantes: string;
    grupo_nome_dos_integrantes: string;
    grupo_dono: string;
    grupo_data_de_criacao: string; // ISO date string (timestamp with time zone)
    grupo_total_de_mensagens: string;

    // Tabela de mensagens/conversa
    mensagem_id: string;
    from_me: boolean;
    telefone_dos_participantes: string;
    nome_dos_participantes: string;
    triado: boolean;
    data_da_triagem: string; // ISO date string (timestamp with time zone)
    avaliacao_ia: string;
    categoria: string;
    resumo_da_conversa: string;
    pontos_importantes: string;
    pontos_positivos: string;
    pontos_negativos: string;
    nome_usuarios_aure: string;
    nome_clientes: string;
    esquadrao: string;
}
