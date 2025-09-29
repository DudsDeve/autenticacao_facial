import styled from '@emotion/styled';

export const Background = styled.section`
 height:100vh;
  padding: 28px 0px 0px 28px;
  background-color: ${({ theme }) => theme.COLORS.PURPLE_600};
  color: ${({ theme }) => theme.COLORS.WHITE};
  
`

export const Container = styled.div`
 height: calc(100vh - 100px) ;
display: flex;
  flex-direction: column;
  gap: 24px;
    overflow-y: auto; 
    padding-right: 28px;  
    
`

export const Header = styled.div`

`
export const SellerContainer = styled.div`
display:flex;

gap:16px;
`