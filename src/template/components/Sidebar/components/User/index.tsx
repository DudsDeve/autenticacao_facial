import { Container, UserImage, UserName, UserProfile, UserRole } from './styles'
import ArthurProfile from '@assets/images/arthurdev.png';
export function User() {
  return <Container>
    <UserImage src={ArthurProfile}/>
    <UserProfile>
        <UserName>Arthur</UserName>
        <UserRole>Desenvolvedor</UserRole>
    </UserProfile>
  </Container>;
}