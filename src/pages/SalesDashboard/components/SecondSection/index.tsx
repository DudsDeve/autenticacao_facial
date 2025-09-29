import { useMemo } from "react";
import { Container } from "./styles";
import { useSales } from "@hooks/useSales";
import { motion } from "framer-motion";

export function SecondSection() {
  const { sales, salesMetas } = useSales();

  const now = new Date();
  const currentMonth = now.getMonth(); // 0-based!
  const currentYear = now.getFullYear();

  const salesDoMesAtual = useMemo(() => {
    return (sales ?? []).filter(sale => {
      if (!sale.created_at) return false;
      const d = new Date(sale.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [sales, currentMonth, currentYear]);

  const metasDoMesAtual = useMemo(() => {
    return (salesMetas ?? []).filter(meta => {
      if (!meta.meta_vendedores_data) return false;
      const [ month, year] = String(meta.meta_vendedores_data).split('/');
      return Number(month) === currentMonth + 1 && Number(year) === currentYear;
    });
  }, [salesMetas, currentMonth, currentYear]);

  const vendedores = useMemo(() => {
    const metasPorNome = {};
    const superMetasPorNome = {};

    metasDoMesAtual.forEach(meta => {
      if (meta.meta_vendedores_nome) {
        const chave = meta.meta_vendedores_nome.trim().toLowerCase();
        (metasPorNome as Record<string, number>)[chave] = Number(meta.meta_vendedores_meta) || 0;
        (superMetasPorNome as Record<string, number>)[chave] = Number(meta.meta_vendedores_super_meta) || 0;
      }
    });

    const vendasPorNome = {};
    salesDoMesAtual.forEach(sale => {
      if (sale.proprietario_do_negocio) {
        const chave = sale.proprietario_do_negocio.trim().toLowerCase();
        (vendasPorNome as Record<string, number>)[chave] = ((vendasPorNome as Record<string, number>)[chave] || 0) + (Number(sale.valor_total_mrr_onboarding) || 0);
      }
    });

    const nomes = Array.from(new Set([
      ...Object.keys(metasPorNome),
      ...Object.keys(vendasPorNome)
    ]));

    return nomes
      .map(nomeChave => {
        const nomeOriginal =
          salesDoMesAtual.find(s => s.proprietario_do_negocio?.trim().toLowerCase() === nomeChave)?.proprietario_do_negocio ||
          metasDoMesAtual.find(m => m.meta_vendedores_nome?.trim().toLowerCase() === nomeChave)?.meta_vendedores_nome ||
          nomeChave;

        const meta = (metasPorNome as Record<string, number>)[nomeChave] || 0;
        const superMeta = (superMetasPorNome as Record<string, number>)[nomeChave] || 0;
        const realizado = (vendasPorNome as Record<string, number>)[nomeChave] || 0;

        const atingiuMeta = realizado >= meta && meta > 0;
        const percentMeta = meta > 0 ? Math.min((realizado / meta) * 100, 100) : 0;
        let percentSuperMeta = 0;
        if (atingiuMeta && superMeta > meta) {
          percentSuperMeta = Math.min(((realizado - meta) / (superMeta - meta)) * 100, 100);
        }

        let barraTexto = "";
        if (!atingiuMeta) {
          barraTexto = `${percentMeta.toFixed(2)}% da Meta`;
        } else if (atingiuMeta && superMeta > 0) {
          barraTexto = percentSuperMeta >= 100
            ? `100% da Super Meta`
            : `${(100 + percentSuperMeta).toFixed(2)}% (Meta + Super Meta)`;
        } else {
          barraTexto = `100% da Meta`;
        }

        const faltaParaMeta = meta - realizado > 0 ? meta - realizado : 0;
        const faltaParaSuperMeta = superMeta - realizado > 0 ? superMeta - realizado : 0;

        return {
          nome: nomeOriginal,
          meta,
          superMeta,
          realizado,
          percentMeta,
          percentSuperMeta,
          barraTexto,
          barraPercent: percentMeta,
          barraSuperPercent: percentSuperMeta,
          atingiuMeta,
          faltaParaMeta,
          faltaParaSuperMeta,
        };
      })
      .filter(v => v.realizado > 0 || v.meta > 0 || v.superMeta > 0);
  }, [salesDoMesAtual, metasDoMesAtual]);

  return (
    <Container>
      <h2>Metas por Vendedor (Mês Atual)</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {vendedores.map(v => (
          <div key={v.nome}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{v.nome}</div>
            <div>
              Realizado: <strong>R$ {v.realizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              {v.meta > 0 && (
                <> / Meta: <strong>R$ {v.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></>
              )}
              {v.superMeta > 0 && (
                <> / <span style={{ color: "#FFD700", fontWeight: 600 }}>
                  Super Meta: R$ {v.superMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span></>
              )}
            </div>
            {v.meta > 0 && (
              <div>Falta para Meta: <strong>R$ {v.faltaParaMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
            )}
            {v.superMeta > 0 && (
              <div>Falta para Super Meta: <strong>R$ {v.faltaParaSuperMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
            )}

            {/* Barra única */}
            <div style={{
              background: "#eee",
              borderRadius: "10px",
              height: "20px",
              width: "100%",
              overflow: "hidden",
              marginTop: 8,
              position: "relative",
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${v.barraPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{
                  height: "100%",
                  background: "#FFD700",
                  borderRadius: "10px",
                  position: "absolute",
                  left: 0,
                  top: 0,
                  zIndex: 2,
                }}
              />
              {v.atingiuMeta && v.superMeta > v.meta && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${v.barraSuperPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: "#FFECB3",
                    borderRadius: "10px",
                    position: "absolute",
                    left: "100%",
                    top: 0,
                    zIndex: 1,
                  }}
                />
              )}
              <div style={{
                position: "relative",
                zIndex: 3,
                color: "#331d4d",
                fontWeight: 600,
                width: "100%",
                textAlign: "center",
                lineHeight: "20px",
                fontSize: 15,
              }}>
                {v.barraTexto}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
