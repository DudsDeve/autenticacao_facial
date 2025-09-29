// Funnel.jsx
import { Categories, CategoriesContainer, Category, CategoryData, Container, Description, Graph, Percentage, Title } from "./styles";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

export function Funnel({ metrics }: { metrics: any[] }) {
  return (
    <Container>
      <Title>Funil</Title>
      <Description>Esses números são baseados no total de leads do período.</Description>
      <CategoriesContainer>
        {metrics.map((step) => (
          <Categories key={step.label}>
            <CategoryData>
              <Category>{step.label}</Category>
              {step.value}
              
              <Percentage>
  {typeof step.value === 'string' && step.value.includes('R$')
    ? (
        'R$ ' + Number(
          step.value
            .replace('R$', '')
            .replace(/\./g, '')
            .replace(',', '.')
            .replace(/\s/g, '')
        ).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      )
    : (
        // Para os outros números
        step.value && !isNaN(Number(step.value.replace(/\s/g, '').replace('null', '')))
          ? Number(step.value.replace(/\s/g, '').replace('null', '')).toLocaleString('pt-BR', { maximumFractionDigits: 0 })
          : '-'
      )
  }
</Percentage>






            </CategoryData>
            <Graph>
              <div style={{ width: '100%', height: 50 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: step.label, value: step.percent }]} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Bar
                      dataKey="value"
                      isAnimationActive={true}
                      animationDuration={1000}
                      radius={[10, 10, 10, 10]}
                      barSize={8}
                    >
                      <Cell fill="#8830E1" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Graph>
          </Categories>
        ))}
      </CategoriesContainer>
    </Container>
  );
}
