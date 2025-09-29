// utils/number.ts
export function brMoneyToNumber(input: unknown): number {
    if (input == null) return 0;
    if (typeof input === 'number' && Number.isFinite(input)) return input;

    const s = String(input).trim();
    if (!s) return 0;

    // remove tudo exceto dígitos, vírgula e ponto
    const only = s.replace(/[^\d.,-]/g, '');

    // caso BR: "1.234.567,89" -> "1234567.89"
    const normalized = only.replace(/\./g, '').replace(',', '.');

    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
}

// utils/date.ts
export function parseMetaMonthYear(raw: unknown): { month: number; year: number } | null {
    if (!raw) return null;
    const v = String(raw).trim();

    // aceita "MM/YYYY"
    let m = v.match(/^(\d{1,2})\/(\d{4})$/);
    if (m) return { month: Number(m[1]), year: Number(m[2]) };

    // aceita "YYYY-MM" ou "YYYY-MM-DD"
    m = v.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
    if (m) return { month: Number(m[2]), year: Number(m[1]) };

    return null;
}
