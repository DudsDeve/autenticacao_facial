import styled from '@emotion/styled'

export const Container = styled.div`
display:flex;
flex-direction:column;
gap:16px;
`

export const SellerContainer = styled.div`
display:flex;

gap:20px;
background-color: ${({ theme }) => theme.COLORS.PURPLE_600};
  color: ${({ theme }) => theme.COLORS.WHITE};
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.COLORS.PURPLE_100};
  padding: 20px 20px;
  width:100%;
`
