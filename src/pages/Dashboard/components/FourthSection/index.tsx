import { FunnelChart, Funnel, Tooltip, LabelList } from 'recharts';

const data = [
  { stage: 'Lead', value: 40 },
  { stage: 'Contato', value: 25 },
  { stage: 'Proposta', value: 10 },
  { stage: 'Fechado', value: 3 }
];

export function FourthSection() {
  return (
    <FunnelChart width={320} height={250}>
      <Tooltip />
      <Funnel
        dataKey="value"
        data={data}
        isAnimationActive
      >
        <LabelList dataKey="stage" position="right" />
      </Funnel>
    </FunnelChart>
  );
}
