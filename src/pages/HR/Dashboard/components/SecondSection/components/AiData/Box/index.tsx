import { Container, MainNumber, Numbers, Title } from './styles'
interface BoxesProps{
    title: string
    mainNumber?:number | string
    growthNumber?:number
    

}
export function Box({ title, mainNumber}: BoxesProps) {
  return <Container>
    <Title>{title}</Title>
    <Numbers>
      <MainNumber>{mainNumber}</MainNumber>
    </Numbers>
    </Container>;
}