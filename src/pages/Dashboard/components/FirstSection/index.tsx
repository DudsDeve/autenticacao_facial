import { useMessagesCount } from '@hooks/useMessagesCount';
import {  FirstSectionBox } from './FirstSectionBox/index';
import { Container } from './styles';
import { useLeads } from '@hooks/useLeads';

export function FirstSection() {
  const {
    sent,
    received,
    total,
    sentToday,
    receivedToday,
    totalToday
  } = useMessagesCount();

  const { allLeads, leadsToday } = useLeads();

  return (
    <Container>
      <FirstSectionBox title='Mensagens totais' mainNumber={total} growthNumber={totalToday} />
      <FirstSectionBox title='Mensagens recebidas' mainNumber={received} growthNumber={receivedToday} />
      <FirstSectionBox title='Mensagens enviadas' mainNumber={sent} growthNumber={sentToday} />
      <FirstSectionBox title='Conversas' mainNumber={allLeads} growthNumber={leadsToday} />
    </Container>
  );
}
