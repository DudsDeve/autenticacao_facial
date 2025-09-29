import { Container, MainNumber, Numbers, Title, GrowthNumber } from './styles'

interface BoxesProps {
  title: string
  mainNumber?: number | string
  growthNumber?: number
}

export function FirstSectionBox({ title, mainNumber, growthNumber }: BoxesProps) {
  return (
    <Container>
      <Title>{title}</Title>
      <Numbers>
        <MainNumber>{mainNumber}</MainNumber>
        {growthNumber && (
          <GrowthNumber>
            <img src="/icons/arrow-up.svg" alt="Crescimento" />
            {growthNumber}
          </GrowthNumber>
        )}
      </Numbers>
    </Container>
  );
}
