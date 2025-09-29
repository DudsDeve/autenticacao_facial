import styled from '@emotion/styled'

export const Container = styled.div`
display: flex;
padding:  20px;
flex-direction: column;
align-items: flex-start;
gap: 15px;
flex: 1 0 0;
border-radius: 16px;
background: ${({ theme }) => theme.COLORS.PURPLE_500};
box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
color: ${({ theme }) => theme.COLORS.WHITE};

`

export const Title = styled.div`
font-size: 14px;

`
export const Numbers = styled.div`
width: 100%;
display: flex;
justify-content: space-between;
align-items: center;

`
export const MainNumber = styled.div`
font-size: 24px;
font-weight: bold;`

export const GrowthNumber = styled.div`
display: flex;
align-items: center;
gap: 4px;
font-size: 16px;
font-weight: bold;
color:${({ theme }) => theme.COLORS.GREEN_500};

 img{
    width: 18px;
    height: 18px;
 }
`