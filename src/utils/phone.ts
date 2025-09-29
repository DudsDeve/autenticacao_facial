// Mantém só dígitos
export function onlyDigits(s?: string | null) {
    return (s || '').replace(/\D/g, '');
}

/**
 * Gera chaves possíveis para comparar telefones/session_id.
 * Suporta:
 * - com/sem 55
 * - com/sem 9 após DDD
 * - 10 (fixo) ou 11 dígitos (móvel)
 *
 * Ex.: "5531998765432" => ["31998765432","3198765432"]
 *     "31998765432"    => ["31998765432","3198765432"]
 *     "3187654321"     => ["3187654321","31987654321"]
 */
export function buildPhoneKeys(raw?: string | null): string[] {
    const d = onlyDigits(raw);
    if (!d) return [];

    const keys = new Set<string>();

    // Remover 55 se houver, para tratar "local"
    const local = d.startsWith('55') ? d.slice(2) : d;

    // Se veio enorme, mantenha só os 13 últimos (55+DDD+9+8)
    const last13 = d.length > 13 ? d.slice(-13) : d;
    const last11 = d.length > 11 ? d.slice(-11) : d;
    const last10 = d.length > 10 ? d.slice(-10) : d;

    // 1) Chaves óbvias: últimos 11 e 10 dígitos (com DDD)
    if (last11.length >= 11) keys.add(last11.slice(-11));
    if (last10.length >= 10) keys.add(last10.slice(-10));

    // 2) Versões "locais" (sem 55)
    if (local.length >= 11) keys.add(local.slice(-11));
    if (local.length >= 10) keys.add(local.slice(-10));

    // 3) Inserir/Remover '9' após DDD (índice 2) para cobrir móvel/fixo
    const local10 = local.slice(-10); // DDD + 8
    const local11 = local.slice(-11); // DDD + 9 + 8

    if (local10.length === 10) {
        const with9 = local10.slice(0, 2) + '9' + local10.slice(2); // vira 11
        keys.add(with9);
        keys.add(local10);
    }
    if (local11.length === 11 && local11[2] === '9') {
        const without9 = local11.slice(0, 2) + local11.slice(3); // vira 10
        keys.add(local11);
        keys.add(without9);
    }

    // 4) Se veio completo com 55 + 11 (13 total), derive versões locais
    if (last13.length === 13 && last13.startsWith('55')) {
        const l = last13.slice(2); // remove 55 -> 11
        keys.add(l); // 11
        if (l[2] === '9') keys.add(l.slice(0, 2) + l.slice(3)); // 10 sem 9
    }

    return Array.from(keys);
}
