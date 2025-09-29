// Função para pegar IDs únicos
export function getUniqueIds(data: any[], key: string): string[] {
    return [...new Set(data.map(item => item[key]).filter(Boolean))];
}

/**
 * Retorna apenas UM registro para cada valor único do campo informado.
 * @param data array de objetos
 * @param key nome do campo que deve ser único (ex: 'meta_anuncio_id')
 */
export function filtraUnicosPorCampo(data: any[], key: string): any[] {
    const seen = new Set();
    return data.filter(item => {
        if (!item[key] || seen.has(item[key])) return false;
        seen.add(item[key]);
        return true;
    });
}

// Outras funções de filtro, agrupamento, etc. podem ir aqui também!
export function filtraPorCampanha(data: any[], campanhaId: string) {
    return data.filter(item => item.meta_campanha_id === campanhaId);
}

export function filtraPorConjunto(data: any[], conjuntoId: string) {
    return data.filter(item => item.meta_conjunto_id === conjuntoId);
}

/**
 * Retorna as métricas do nível filtrado (campanha, conjunto, anúncio) já no formato para o funil.
 * @param data array de registros já filtrados
 * @param nivel pode ser 'campanha', 'conjunto' ou 'anuncio'
 */
export function pegaMetricasPorNivel(data: any[], nivel: 'campanha' | 'conjunto' | 'anuncio') {
    // Prefixo dinâmico
    const prefix = `meta_${nivel}_`;
    return {
        alcance: data.reduce((acc, item) => acc + Number(item[`${prefix}alcance`] || 0), 0),
        cliques: data.reduce((acc, item) => acc + Number(item[`${prefix}cliques_no_link`] || 0), 0),
        conversas: data.reduce((acc, item) => acc + Number(item[`${prefix}conversas_iniciadas`] || 0), 0),
    };
}


/**
 * Retorna o ÚLTIMO registro para cada valor único do campo informado.
 * @param data array de objetos
 * @param key nome do campo que deve ser único (ex: 'meta_anuncio_id')
 */
export function filtraUltimosPorCampo(data: any[], key: string, dateField = 'updated_at') {
    const map = new Map();
    data.forEach((item: { [x: string]: any; }) => {
        if (item[key]) {
            // Só troca se o registro for mais novo!
            if (!map.has(item[key]) || (item[dateField] > map.get(item[key])[dateField])) {
                map.set(item[key], item);
            }
        }
    });
    return Array.from(map.values());
}