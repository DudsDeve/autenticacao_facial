import { useContext, useMemo, useState } from "react";
import { FunnelContext } from "@contexts/Funnel";
import { Container, ContentContainer, SelectContainer, SelectContent } from "./styles";
import {
  getUniqueIds,
  pegaMetricasPorNivel,
  filtraPorCampanha,
  filtraPorConjunto,
  filtraUltimosPorCampo
} from "@utils/funnelUtils";
import { FunnelSVGChart } from "./components/FunnelSVGChart";
import { AiData } from "./components/AiData";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Funnel } from "./components/Funnel";

export function SecondSection() {
  const { funis } = useContext(FunnelContext);

  const funisAtivos = useMemo(() =>
    funis.filter(f => {
      if (typeof f.ativo === "boolean") return f.ativo === true;
      if (typeof f.ativo === "string") return String(f.ativo).toLowerCase() === "true";
      if (typeof f.ativo === "number") return f.ativo === 1;
      return false;
    }),
    [funis]
  );
  
  
  // CAMPANHAS
  const campanhas = useMemo(() => getUniqueIds(funisAtivos, "meta_campanha_id"), [funisAtivos]);
  const [campanhaId, setCampanhaId] = useState("");

  function getNomePorId(id: string, keyId: string, keyNome: string) {
    const item = funisAtivos.find((f: any) => f[keyId] === id);
    return item ? item[keyNome] : "";
  }
  

  const conjuntos = useMemo(
    () =>
      getUniqueIds(
        campanhaId ? filtraPorCampanha(funisAtivos, campanhaId) : funisAtivos,
        "meta_conjunto_id"
      ),
    [funisAtivos, campanhaId]
  );
  const [conjuntoId, setConjuntoId] = useState("");

  const anuncios = useMemo(
    () =>
      getUniqueIds(
        conjuntoId
          ? filtraPorConjunto(campanhaId ? filtraPorCampanha(funisAtivos, campanhaId) : funisAtivos, conjuntoId)
          : campanhaId
          ? filtraPorCampanha(funisAtivos, campanhaId)
          : funisAtivos,
        "meta_anuncio_id"
      ),
    [funisAtivos, campanhaId, conjuntoId]
  );
  const [anuncioId, setAnuncioId] = useState("");

  let nivel = "campanha";
  let campoIdUnico = "meta_campanha_id";
  if (anuncioId) {
    nivel = "anuncio";
    campoIdUnico = "meta_anuncio_id";
  } else if (conjuntoId) {
    nivel = "conjunto";
    campoIdUnico = "meta_conjunto_id";
  }

  const dadosFiltrados = useMemo(
    () =>
      funisAtivos.filter(
        (f) =>
          (!campanhaId || f.meta_campanha_id === campanhaId) &&
          (!conjuntoId || f.meta_conjunto_id === conjuntoId) &&
          (!anuncioId || f.meta_anuncio_id === anuncioId)
      ),
    [funisAtivos, campanhaId, conjuntoId, anuncioId]
  );

  const dadosUnicos = useMemo(
    () => filtraUltimosPorCampo(dadosFiltrados, campoIdUnico),
    [dadosFiltrados, campoIdUnico]
  );

  const metricas = pegaMetricasPorNivel(dadosUnicos, nivel as "campanha" | "anuncio" | "conjunto");

  const funnelData = [
    { label: "Alcance", value: metricas.alcance },
    { label: "Cliques no Link", value: metricas.cliques },
    { label: "Conversas Iniciadas", value: metricas.conversas },
  ];

  function resumoNome(nome = "") {
    return nome.slice(0, 16);
  }

  const metricKeys = {
    campanha: [
      { label: "CTR", key: "meta_campanha_ctr", isPercent: true },
      { label: "CPC", key: "meta_campanha_cpc", isCurrency: true },
      { label: "CPM", key: "meta_campanha_cpm", isCurrency: true },
      { label: "Gasto", key: "meta_campanha_gasto", isCurrency: true },
    ],
    conjunto: [
      { label: "CTR", key: "meta_conjunto_ctr", isPercent: true },
      { label: "CPC", key: "meta_conjunto_cpc", isCurrency: true },
      { label: "CPM", key: "meta_conjunto_cpm", isCurrency: true },
      { label: "Gasto", key: "meta_conjunto_gastos", isCurrency: true },
    ],
    anuncio: [
      { label: "CTR", key: "meta_anuncio_ctr", isPercent: true },
      { label: "CPC", key: "meta_anuncio_cpc", isCurrency: true },
      { label: "CPM", key: "meta_anuncio_cpm", isCurrency: true },
      { label: "Gasto", key: "meta_anuncio_gastos", isCurrency: true },
    ]
  };

  const funnelRecord = dadosUnicos[0] || {};

  const kpiSteps = metricKeys[nivel as "campanha" | "anuncio" | "conjunto"].map((item) => {
    const { label, key, isPercent, isCurrency } = item as {
      label: string;
      key: string;
      isPercent?: boolean;
      isCurrency?: boolean;
    };
    let value = funnelRecord[key];
    if (typeof value === "string") value = parseFloat(value.replace(",", "."));
    value = value || 0;

    // Calcule o valor percentual da barra (0-100%)
    let percent = 0;
    if (isPercent) percent = Math.round((parseFloat(value) || 0) * 100);
    else if (isCurrency) percent = Math.min(Math.round((parseFloat(value) / 100) * 100), 100);
    else percent = Math.round(Number(value) || 0);

    // Formatação visual
    let displayValue = value;
    if (isPercent) {
      displayValue = `${value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}%`;
    } else if (isCurrency) {
      displayValue = `R$ ${parseFloat(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    } else {
      displayValue = value;
    }

    return {
      label,
      percent: Math.max(0, Math.min(percent, 100)),
      value: displayValue,
    };
  });

  return (
    <Container>
      <AiData />

      <ContentContainer>
        <SelectContainer>
          {/* Dropdown de Campanha */}
          <SelectContent>
            <FormControl fullWidth sx={{ mb: 2, marginBottom: 0, maxWidth: 250 }}>
              <InputLabel id="campanha-select-label">Campanha</InputLabel>
              <Select
                labelId="campanha-select-label"
                value={campanhaId}
                label="Campanha"
                onChange={(e) => {
                  setCampanhaId(e.target.value);
                  setConjuntoId("");
                  setAnuncioId("");
                }}
              >
                <MenuItem value="">
                  <em>Selecione uma Campanha</em>
                </MenuItem>
                {campanhas.map((id) => (
                  <MenuItem key={id} value={id}>
                    {resumoNome(getNomePorId(id, "meta_campanha_id", "meta_campanha_nome"))}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Dropdown de Conjunto */}
            {campanhaId && (
              <FormControl fullWidth sx={{ mb: 2, marginBottom: 0 }}>
                <InputLabel id="conjunto-select-label">Conjunto</InputLabel>
                <Select
                  labelId="conjunto-select-label"
                  value={conjuntoId}
                  label="Conjunto"
                  onChange={(e) => {
                    setConjuntoId(e.target.value);
                    setAnuncioId("");
                  }}
                >
                  <MenuItem value="">
                    <em>Selecione um Conjunto</em>
                  </MenuItem>
                  {conjuntos.map((id) => (
                    <MenuItem key={id} value={id}>
                      {resumoNome(getNomePorId(id, "meta_conjunto_id", "meta_conjunto_nome"))}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Dropdown de Anúncio */}
            {conjuntoId && (
              <FormControl fullWidth sx={{ mb: 2, marginBottom: 0 }}>
                <InputLabel id="anuncio-select-label">Anúncio</InputLabel>
                <Select
                  labelId="anuncio-select-label"
                  value={anuncioId}
                  label="Anúncio"
                  onChange={(e) => setAnuncioId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Selecione um Anúncio</em>
                  </MenuItem>
                  {anuncios.map((id) => (
                    <MenuItem key={id} value={id}>
                      {resumoNome(getNomePorId(id, "meta_anuncio_id", "meta_anuncio_nome"))}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </SelectContent>
          <FunnelSVGChart data={funnelData} />
        </SelectContainer>
      </ContentContainer>
      <Funnel metrics={kpiSteps} />
    </Container>
  );
}
