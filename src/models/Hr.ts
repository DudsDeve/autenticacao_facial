export interface Hr {
    id: number;
    criado_em: string; // ISO sem timezone (timestamp without time zone)
    nome?: string | null;
    entrevista_finalizada?: boolean | null;
    data_da_entrevista_finalizada?: string | null;
    rh_ja_entrou_em_contato?: boolean | null;
    session_id: string;      // ex.: "553199999999"
    message: unknown;        // string | json | qualquer
    created_at?: string | null;
    timestampz?: string | null;
    // acrescente outros campos se 
    nome_completo: string;
    email_principal: string;
    email_secundario: string;
    numero_documento: string;
    carteira_motorista: string;
    categoria_carteira_motorista: string;
    data_emissao_carteira: string;
    data_primeira_carteira: string;
    estado_carteira_motorista: string;
    identidade: string;
    numero_carteira_trabalho: string;
    serie_carteira_trabalho: string;

    genero: string;
    telefone: string;
    celular: string;
    data_nascimento: string;
    estado_civil: string;
    senioridade: string;
    skype: string;

    linkedin: string;
    facebook: string;
    youtube: string;
    instagram: string;
    pretensao_salarial: string;
    url_video_apresentacao: string;
    extensao_foto: string;

    // bytea geralmente vem como base64 via supabase-js
    foto: string;
    origem: string;
    pessoa_com_deficiencia: boolean;

    cep: string;
    nome_rua: string;
    informacoes_adicionais: string;
    numero: string;
    bairro: string;

    sigla_pais: string;
    sigla_estado: string;
    cidade_estrangeira: string;
    nome_cidade: string;
    nome_estado: string;
    iniciais_estado: string;

    experiencias_profissionais: string;
    formacoes_academicas: string;
    ja_triado: boolean;
    data_triagem: string; // timestamptz ISO
    primeira_mensagem_enviada: boolean;
    data_primeira_mensagem_enviada: string; // timestamptz ISO

    vaga: string;
    interesse_na_vaga: boolean;
    disc: string;
    star: string;
    de_onde_veio: string;

    idade: string;
    qualificado: boolean;
    muito_qualificado: boolean;
    porcentagem_de_qualificacao: string;
    motivo_da_porcentagem_de_qualificacao: string;
    qualificado_na_primeira_triagem: boolean;
    data_da_primeira_triagem: string; // timestamptz ISO

    perguntas: string;
    respostas: string;
    perguntas_e_respostas: string;
    vaga_confirmada: boolean;
    ja_triado_ia: boolean;
    jdata_ja_triado_ia: string; // timestamptz ISO
    pode_falar_agora: boolean;
}