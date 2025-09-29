import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'Page A', mesAnterior: 2400, mesAtual: 4000 },
  { name: 'Page B', mesAnterior: 1398, mesAtual: 3000 },
  { name: 'Page C', mesAnterior: 9800, mesAtual: 2000 },
  { name: 'Page D', mesAnterior: 3908, mesAtual: 2780 },
  { name: 'Page E', mesAnterior: 4800, mesAtual: 1890 },
  { name: 'Page F', mesAnterior: 3800, mesAtual: 2390 },
  { name: 'Page G', mesAnterior: 4300, mesAtual: 3490 },
];

export function Graph() {
  return (
    <ResponsiveContainer>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {/* Mês anterior (cinza) */}
        <Area
          type="monotone"
          dataKey="mesAnterior"
          stroke="#CCCCCC"
          fill="none"
          strokeWidth={3}
          dot={false}
        />
        {/* Mês atual (roxo) */}
        <Area
          type="monotone"
          dataKey="mesAtual"
          stroke="#8830e1"
          fill="none"
          strokeWidth={3}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
