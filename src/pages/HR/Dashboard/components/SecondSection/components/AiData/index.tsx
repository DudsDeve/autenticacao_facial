import type { Lead } from 'src/models/Lead';
import { Container } from './styles';
import { Box } from './Box';
import { useLeads } from '@hooks/useLeads';

export function AiData() {
  const { leads } = useLeads();

  function formatHoursAndMinutes(avgMinutes: number) {
    const hours = Math.floor(avgMinutes / 60);
    const minutes = Math.round(avgMinutes % 60);
    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} h`;
    return `${hours} h ${minutes} min`;
  }

  function getAverageResponseTime(leads: Lead[]) {
    const validLeads = leads.filter(
      lead => !!lead.id && lead.ultimo_contato && lead.created_at
    );
    if (!validLeads.length) return "0min";
    const sum = validLeads.reduce((total, lead) => {
      const created = new Date(lead.created_at);
      const last = new Date(lead.ultimo_contato!);
      const diffMs = last.getTime() - created.getTime();
      const diffMinutes = diffMs / 1000 / 60;
      return total + diffMinutes;
    }, 0);
    const avgMinutes = sum / validLeads.length;
    return formatHoursAndMinutes(avgMinutes);
  }

  function getAverageCompletedResponseTime(leads: Lead[]) {
    // Filtra leads concluídos: transferiu_pra_sdr NÃO está vazio/null/undefined
    const completedLeads = leads.filter(
      lead => lead.transferiu_pra_sdr && 
              lead.transferiu_pra_sdr.trim() !== '' && 
              lead.ultimo_contato && 
              lead.created_at
    );
    
    if (!completedLeads.length) return "0 min";

    // Soma o tempo de cada atendimento (ultimo_contato - created_at)
    const sum = completedLeads.reduce((total, lead) => {
      const created = new Date(lead.created_at);
      const last = new Date(lead.ultimo_contato!);
      const diffMs = last.getTime() - created.getTime();
      const diffMinutes = diffMs / 1000 / 60;
      return total + diffMinutes;
    }, 0);

    // Calcula a média em minutos
    const avgMinutes = sum / completedLeads.length;
    return formatHoursAndMinutes(avgMinutes);
  }
function getMqlCount(leads: Lead[]) {
  return leads.filter(lead => lead['mql?'] === true).length;
}
  const tempoTotal = getAverageResponseTime(leads);
  const tempoMedioConcluido = getAverageCompletedResponseTime(leads);
  const mqlCount = getMqlCount(leads);


  return (
    <Container>
      <Box
        title="Tempo total de atendimento"
        mainNumber={tempoTotal}
      />
      <Box
        title="Tempo médio de atendimento concluído"
        mainNumber={tempoMedioConcluido}
      />
        <Box
      title="Total de MQLs"
      mainNumber={mqlCount}
    />
  
    </Container>
  );
}