export interface Funnel {
    id: number;
    created_at: string; // timestamp ISO
    nome: string;
    telefone: string;
    email: string;

    // Meta campanha
    meta_campanha_id: string;
    meta_campanha_nome: string;
    meta_campanha_alcance: string;
    meta_campanha_impressao: string;
    meta_campanha_gasto: string;
    meta_campanha_cpm: string;
    meta_campanha_ctr: string;
    meta_campanha_cpc: string;
    meta_campanha_cliques_no_link: string;
    meta_campanha_custo: string;
    meta_campanha_conversao: string;
    meta_campanha_custo_conversao: string;

    // Meta conjunto
    meta_conjunto_id: string;
    meta_conjunto_nome: string;
    meta_conjunto_alcance: string;
    meta_conjunto_impressao: string;
    meta_conjunto_gasto: string;
    meta_conjunto_cpm: string;
    meta_conjunto_ctr: string;
    meta_conjunto_cpc: string;
    meta_conjunto_cliques: string;
    meta_conjunto_custo: string;
    meta_conjunto_conversao: string;
    meta_conjunto_custo_conversao: string;

    // Meta anúncio
    meta_anuncio_id: string;
    meta_anuncio_nome: string;
    meta_anuncio_alcance: string;
    meta_anuncio_impressao: string;
    meta_anuncio_gasto: string;
    meta_anuncio_cpm: string;
    meta_anuncio_ctr: string;
    meta_anuncio_cpc: string;
    meta_anuncio_cliques: string;
    meta_anuncio_custo: string;
    meta_anuncio_conversao: string;
    meta_anuncio_custo_conversao: string;

    // Meta criativo
    meta_criativo_nome: string;
    meta_criativo_titulo: string;
    meta_criativo_body: string;
    meta_criativo_page_id: string;
    meta_criativo_video_id: string;
    meta_criativo_imagem: string;

    meta_nome_da_ia: string;

    // Hubspot
    hubspot_nome_da_ia: string;
    hubspot_negocio_id: string;
    hubspot_negocio_nome: string;
    hubspot_negocio_descricao: string;
    hubspot_negocio_email: string;
    hubspot_negocio_telefone: string;

    // Clickup
    clickup_nome_da_ia: string;
    clickup_negocio_id: string;
    clickup_negocio_nome: string;
    clickup_negocio_descricao: string;
    clickup_negocio_email: string;
    clickup_negocio_telefone: string;

    data_da_ultima_atualizacao: string; // timestamp ISO
    ja_criado: boolean;
    ativo: boolean;
    [key: string]: any; // Adicione isso para acessar dinamicamente

}
