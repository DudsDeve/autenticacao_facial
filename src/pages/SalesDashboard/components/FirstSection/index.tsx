import { useSales } from "@hooks/useSales";
import { useMemo } from "react";
import { Box } from "../Box";

// Utilitário para cor dinâmica do verde (de #EFE até #21B573)
function getGreen(percent: number) {
  // percent de 0 a 100
  // Array de tons de verde do mais claro pro mais escuro
  const colors = [
    "#eee",      // 0-9%
    "#dbffe1",   // 10-19%
    "#b8ffce",   // 20-29%
    "#9dffbb",   // 30-39%
    "#77f7a2",   // 40-49%
    "#50e97d",   // 50-59%
    "#38db64",   // 60-69%
    "#21b573",   // 70-79%
    "#199c63",   // 80-89%
    "#14894e",   // 90-99%
    "#0e753b"    // 100%
  ];
  const idx = Math.min(Math.floor(percent / 10), 10);
  return colors[idx];
}

export function FirstSection() {
  const { sales, salesMetas } = useSales();

  // Total MRR do mês atual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filtra vendas do mês atual
  const salesDoMesAtual = useMemo(() => {
    return (sales ?? []).filter(sale => {
      if (!sale.created_at) return false;
      const d = new Date(sale.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [sales, currentMonth, currentYear]);

  // Soma realizado
  const totalMRRAntes = useMemo(() => (
    salesDoMesAtual.reduce((acc, item) => acc + (Number(item.valor_total_mrr_onboarding) || 0), 0)
  ), [salesDoMesAtual]);

  // Pega meta e super meta do mês atual (ajuste o campo se for diferente)
  const metaDoMesAtual = useMemo(() => {
    const metas = (salesMetas ?? []).filter(meta => {
      if (!meta.meta_vendas_geral_data) return false;
      const [ month, year] = String(meta.meta_vendas_geral_data).split('/');
      return Number(month) === currentMonth + 1 && Number(year) === currentYear;
    });
    // Pode ter mais de uma, soma todas!
    
    return metas.reduce(
      (acc, meta) => {
        acc.meta += Number(meta.meta_vendas_geral_meta) || 0;
        acc.superMeta += Number(meta.meta_vendas_geral_super_meta) || 0;
        return acc;
      },
      { meta: 0, superMeta: 0 }
    );
  }, [salesMetas, currentMonth, currentYear]);

  // Porcentagens
  const percentMeta = metaDoMesAtual.meta > 0
    ? Math.min((totalMRRAntes / metaDoMesAtual.meta) * 100, 100)
    : 0;

  const percentSuperMeta = (metaDoMesAtual.superMeta > metaDoMesAtual.meta && totalMRRAntes > metaDoMesAtual.meta)
    ? Math.min(((totalMRRAntes - metaDoMesAtual.meta) / (metaDoMesAtual.superMeta - metaDoMesAtual.meta)) * 100, 100)
    : 0;

  // Cor da barra de progresso (escala de verde)
  const corBarra = getGreen(percentMeta);

  return (
    <Box>
      <div style={{ marginBottom: 18 }}>
        <h2>Resumo Geral</h2>
        <div style={{ fontSize: 18, marginBottom: 6 }}>
          <b>Realizado:</b> R$ {totalMRRAntes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <br />
          <b>Meta:</b> R$ {metaDoMesAtual.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <br />
          <b>Super Meta:</b> R$ {metaDoMesAtual.superMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>

        {/* Barra de progresso */}
        <div style={{
          background: "#eee",
          borderRadius: "12px",
          height: 32,
          width: "100%",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Barra da meta */}
          <div style={{
            width: `${percentMeta}%`,
            height: "100%",
            background: corBarra,
            borderRadius: "12px",
            position: "absolute",
            left: 0,
            top: 0,
            transition: "width 0.7s cubic-bezier(.4,0,.2,1)"
          }} />
          {/* Se passou da meta, mostra barra extra para super meta */}
          {percentMeta === 100 && metaDoMesAtual.superMeta > metaDoMesAtual.meta && (
            <div style={{
              width: `${percentSuperMeta}%`,
              height: "100%",
              background: "#FFD700", // dourado ou outro tom
              borderRadius: "0 12px 12px 0",
              position: "absolute",
              left: "100%",
              top: 0,
              transition: "width 0.7s cubic-bezier(.4,0,.2,1)"
            }} />
          )}
          {/* Texto central na barra */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: percentMeta > 50 ? "#fff" : "#14532d",
            fontSize: 17,
            zIndex: 2,
            textShadow: percentMeta > 50 ? "0 1px 4px #1c1c1c" : "none"
          }}>
            {percentMeta < 100 && `${percentMeta.toFixed(2)}% da Meta`}
            {percentMeta === 100 && metaDoMesAtual.superMeta > metaDoMesAtual.meta
              ? `${(100 + percentSuperMeta).toFixed(2)}% (Meta + Super Meta)`
              : percentMeta === 100 && metaDoMesAtual.superMeta === 0
                ? "100% da Meta"
                : null
            }
          </div>
        </div>
      </div>
    </Box>
  );
}
