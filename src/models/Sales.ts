// src/models/Sale.ts

export interface Sale {
    id: number;
    created_at: string;                                    // int8
    negocio_id: string;                                  // text
    nome_do_negocio: string;                            // text
    valor_total_mrr_onboarding: number;                 // text (como number)
    proprietario_do_negocio: string;                    // text
    triado: boolean;                                    // bool
    data_fechamento: string;
    sdr: string;           // text (pode ser Date se convertido)

    // Campos de Metas Gerais
    meta_vendas_geral_data?: string;
    meta_vendas_geral_meta?: string;
    meta_vendas_geral_super_meta?: string;
    meta_vendas_geral_meta_onboarding?: string;

    // Campos de Metas Vendedores
    meta_vendedores_data?: string;
    meta_vendedores_nome?: string;
    meta_vendedores_meta?: string;
    meta_vendedores_super_meta?: string;
    meta_vendedores_super_meta_onboarding?: string;

    // Campos de Metas MQL
    meta_mql_data?: string;
    meta_mql_meta?: string;
    meta_mql_supermeta?: string;

    // Campos de SDR
    meta_sdr_data?: string;
    meta_sdr_nome?: string;
    meta_sdr_meta?: string;
    meta_sdr_supermeta_meta?: string;

    // Campos de Churn Squad
    meta_churn_squad_data?: string;
    meta_churn_squad_faturamento?: string;
    meta_churn_squad_squad?: string;
}
