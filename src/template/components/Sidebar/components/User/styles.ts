//import styled from 'styled-components'
import styled from '@emotion/styled';

export const Container = styled.section`
display:flex;
gap:10px;
align-items:center;
padding: 5px 20px 5px 10px;
`

export const UserImage = styled.img`
height: 40px;
width: 40px;
border-radius: 40px;
`

export const UserProfile = styled.div`
display:flex;
flex-direction:column`

export const UserName = styled.span`
font-size:18px;`

export const UserRole = styled.span`
font-size: 12px;
color:${({ theme }) => theme.COLORS.GRAY_400};
`

