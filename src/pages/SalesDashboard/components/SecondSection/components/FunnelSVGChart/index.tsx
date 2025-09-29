import  { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Tooltip from "@mui/material/Tooltip";
import { Container } from "./styles";

const COLORS = ["#dbbbfc", "#c287fc", "#8830E1"];
const STEPS_WIDTHS = [1, 0.7, 0.35];

function getPercent(val: number, prev: number) {
  if (!prev) return "";
  return ((val / prev) * 100).toFixed(2) + "%";
}

export function FunnelSVGChart({ data }: { data: any[] }) {
  const containerRef = useRef(null);
  const aspectRatio = 700 / 440;
  const [dimensions, setDimensions] = useState({ width: "100%", height: "100%" });

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const width = (containerRef.current as HTMLDivElement).offsetWidth;
        const height = (containerRef.current as HTMLDivElement).offsetHeight || width / aspectRatio;
        setDimensions({ width: width.toString(), height: height.toString() });
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { width, height } = dimensions;
  const numSteps = data.length;
  const numericHeight = typeof height === "number" ? height : 100;
  const bandHeight = numericHeight / numSteps;
  const margin = 32;
  const centerX = Number(width) / 2;
  const widths = STEPS_WIDTHS.map((pct) => pct * (Number(width) - margin));
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [activeStages, setActiveStages] = useState([0]);
  const ANIMATION_DURATION = 0.6;

  useEffect(() => {
    let timeouts = [];
    for (let i = 1; i < data.length; i++) {
      const timeout = setTimeout(() => {
        setActiveStages((stages) => [...stages, i]);
      }, i * ANIMATION_DURATION * 950);
      timeouts.push(timeout);
    }
    return () => timeouts.forEach(clearTimeout);
  }, [data.length]);

  return (
    <Container>
      <div
        ref={containerRef}
        style={{
          width: "90%",
          height: "90%",
          position: "relative"
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: "block", overflow: "visible" }}
          preserveAspectRatio="xMidYMid meet"
        >
          {data.map((stage, i) => {
            const wTop = widths[i];
            const wBot = widths[i + 1] || 0;
            const yTop = i * bandHeight;
            const yBot = (i + 1) * bandHeight;
            const points = [
              [centerX - wTop / 2, yTop],
              [centerX + wTop / 2, yTop],
              [centerX + wBot / 2, yBot],
              [centerX - wBot / 2, yBot]
            ]
              .map(([x, y]) => `${x},${y}`)
              .join(" ");

            // Conteúdo da Tooltip do MUI
            const tooltipContent = (
              <div>
                <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>
                  {stage.label}
                </div>
                <div>
                  Valor: <span style={{ color: COLORS[i] }}>{stage.value}</span>
                </div>
                {i > 0 && (
                  <div>
                    Conversão:{" "}
                    <span style={{ color: "#666" }}>
                      {getPercent(stage.value, data[i - 1].value)}
                    </span>
                  </div>
                )}
              </div>
            );

            return (
              <Tooltip
                key={i}
                title={tooltipContent}
                arrow
                placement="left"
                enterDelay={300}
                disableInteractive
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: "#fff",
                      color: "#222",
                      border: "1px solid #eee",
                      borderRadius: 2,
                      boxShadow: "0 2px 12px #0002",
                      fontSize: 15,
                      fontWeight: 500,
                      p: 2,
                      minWidth: 160,
                    }
                  },
                  arrow: {
                    sx: {
                      color: "#fff"
                    }
                  }
                }}
              >
                <motion.polygon
                  points={points}
                  fill={COLORS[i]}
                  initial={{ opacity: 0, scaleY: 0.2, originY: 0 }}
                  animate={
                    activeStages.includes(i)
                      ? { opacity: 1, scaleY: 1 }
                      : { opacity: 0, scaleY: 0.2 }
                  }
                  transition={{ duration: ANIMATION_DURATION }}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  style={{ cursor: "pointer" }}
                />
              </Tooltip>
            );
          })}

          {/* Valores centrais */}
          {data.map((stage, i) => {
            const y = i * bandHeight + bandHeight / 2 + 8;
            return (
              <text
                key={i}
                x={centerX}
                y={y}
                textAnchor="middle"
                fill="#fff"
                fontWeight="bold"
                fontSize={28}
                style={{
                  userSelect: "none",
                  filter: hoverIdx === i ? "drop-shadow(0px 1px 8px #0009)" : undefined,
                  transition: "filter .2s",
                  opacity: activeStages.includes(i) ? 1 : 0,
                  transitionDelay: `${i * ANIMATION_DURATION}s`
                }}
                pointerEvents="none"
              >
                {stage.value.toLocaleString('pt-BR')}
              </text>
            );
          })}

          {/* Labels à direita */}
          {data.map((stage, i) => {
            const y = i * bandHeight + bandHeight / 2 + 8;
            return (
              <text
                key={i + "label"}
                x={width + 40}
                y={y}
                textAnchor="end"
                fill="#888"
                fontWeight="bold"
                fontSize={16}
                style={{
                  userSelect: "none",
                  opacity: activeStages.includes(i) ? 1 : 0,
                  transition: `opacity 0.3s`,
                  transitionDelay: `${i * ANIMATION_DURATION}s`
                }}
              >
                {stage.label}
              </text>
            );
          })}
        </svg>
      </div>
    </Container>
  );
}
