import { Background, Container, Header, SellerContainer } from "./styles";
import { useSales } from "@hooks/useSales";
import { useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import { FirstSection } from "./components/FirstSection";

// Soma segura
const sum = (arr: any[], key: string) => arr.reduce((acc: number, item: any) => acc + (Number(item[key]) || 0), 0);

export function SalesDashboard() {
  const { sales, salesMetas,  fetchSales} = useSales();

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSales();
    }, 10000); // 30 segundos, ajuste o tempo se quiser

    return () => clearInterval(interval);
  }, [fetchSales]);
  // Processa vendedores: nome, meta, realizado
  const vendedores = useMemo(() => {
    const metasPorNome: Record<string, number> = {};
    salesMetas?.forEach(meta => {
      if (meta.meta_vendedores_nome) {
        const chave = meta.meta_vendedores_nome.trim().toLowerCase();
        metasPorNome[chave] = Number(meta.meta_vendedores_meta) || 0;
      }
    });
    const vendasPorNome = {};
    sales.forEach(sale => {
      if (sale.proprietario_do_negocio) {
        const chave = sale.proprietario_do_negocio.trim().toLowerCase();
        // Tipando vendasPorNome como Record<string, number> para evitar erro de indexação
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
          sales.find(s => s.proprietario_do_negocio?.trim().toLowerCase() === nomeChave)?.proprietario_do_negocio ||
          salesMetas.find(m => m.meta_vendedores_nome?.trim().toLowerCase() === nomeChave)?.meta_vendedores_nome ||
          nomeChave;
        const meta = metasPorNome[nomeChave] || 0;
        const realizado = (vendasPorNome as Record<string, number>)[nomeChave] || 0;
        const percent = meta > 0 ? Math.min((realizado / meta) * 100, 100) : 0;
        return { nome: nomeOriginal, meta, realizado, percent };
      })
      .filter(v => v.realizado > 0 || v.meta > 0);
  }, [sales, salesMetas]);

  // Dados para o gráfico: só nome e valor realizado
  const chartData = useMemo(() => (
    vendedores.map(v => ({
      nome: v.nome,
      realizado: v.realizado
    }))
  ), [vendedores]);

  // Soma total
  const totalMRRAntes = useMemo(() => sum(sales, "valor_total_mrr_onboarding"), [sales]);
  const totalMeta = useMemo(() => {
    if (!salesMetas?.length) return 0;
    return salesMetas.reduce((acc, meta) => {
      const metaValue = Number(meta.meta_vendas_geral_meta) || 0;
      const onboardingValue = Number(meta.meta_vendas_geral_meta_onboarding) || 0;
      return acc + metaValue + onboardingValue;
    }, 0);
  }, [salesMetas]);
  const percentTotal = totalMeta ? Math.min((totalMRRAntes / totalMeta) * 100, 100) : 0;
  console.log(percentTotal)
  return (
    <Background>
      <Container>
        <Header>
          <h2>Dashboard de Vendas</h2>
        </Header>
        <FirstSection />

      

        {/* POR VENDEDOR */}
        <Header>
          <h2>Metas por Vendedor</h2>
        </Header>
        <SellerContainer>
        {vendedores.map(v => (
          <div key={v.nome} style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{v.nome}</div>
            <div>
              Realizado: <strong>R$ {v.realizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              {v.meta > 0 && (
                <>
                  {" / "}
                  Meta: <strong>R$ {v.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </>
              )}
            </div>
            {v.meta > 0 && (
              <>
                <div>
                  Falta: <strong>
                    R$ {(v.meta - v.realizado > 0 ? v.meta - v.realizado : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div style={{
                  background: "#eee",
                  borderRadius: "10px",
                  height: "20px",
                  width: "100%",
                  overflow: "hidden",
                  marginTop: 8
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${v.percent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      background: v.percent < 100 ? "#21B573" : "#FFD700",
                      borderRadius: "10px"
                    }}
                  />
                </div>
                <div style={{ marginTop: 4, fontWeight: 500, textAlign: "right" }}>
                  {v.percent.toFixed(2)}%
                </div>
              </>
            )}
          </div>
        ))}
        </SellerContainer>
        {/* GRÁFICO DE BARRAS POR VENDEDOR */}
        <Header>
          <h2>Vendas por Vendedor (Gráfico)</h2>
        </Header>
        {chartData.length === 0 && (
          <div style={{ color: "#888", padding: 32 }}>
            Nenhum dado para exibir no gráfico.
          </div>
        )}
        {chartData.length > 0 && (
          <div style={{ width: '100%', height: 350, marginBottom: 40 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip formatter={value => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="realizado" fill="#21B573" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Container>
    </Background>
  );
}
function fetchSales() {
  throw new Error("Function not implemented.");
}
console.log(fetchSales)
