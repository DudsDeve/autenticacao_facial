
import { FirstSection } from "./components/FirstSection";
import { SecondSection } from "./components/SecondSection";
import { Background, Container, Header} from "./styles";

export function HrDashboard() {
  return <Background>
    <Container>
      <Header><h2>Dashboard</h2></Header>
      <FirstSection/>
      <SecondSection/>

      
     
      </Container>
      </Background>;
}