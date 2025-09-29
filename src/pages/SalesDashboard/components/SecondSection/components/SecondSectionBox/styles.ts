import styled from '@emotion/styled'

export const Container = styled.div`
height: 100%;
display: flex;
min-width: 200px;
padding:  24px;
flex-direction: column;
align-items: flex-start;
gap: 8px;
flex: 1 0 0;
border-radius: 16px;
background: ${({ theme }) => theme.COLORS.PURPLE_50};

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
font-size: 12px;

`