// src/pages/HR/HrDashboard/FirstSection/index.tsx
import { useHrMessagesCount } from "@hooks/useHrMessagesCount";
import { FirstSectionBox } from "./FirstSectionBox";
import { Container } from "./styles";

export function FirstSection() {
  const {
    sent,
    received,
    total,
    sentToday,
    receivedToday,
    totalToday,
  } = useHrMessagesCount();

  return (
    <Container>
      <FirstSectionBox title="Mensagens totais (RH)" mainNumber={total} growthNumber={totalToday} />
      <FirstSectionBox title="Recebidas (RH)" mainNumber={received} growthNumber={receivedToday} />
      <FirstSectionBox title="Enviadas (RH)" mainNumber={sent} growthNumber={sentToday} />
      {/* …adicione outras métricas se precisar */}
    </Container>
  );
}
