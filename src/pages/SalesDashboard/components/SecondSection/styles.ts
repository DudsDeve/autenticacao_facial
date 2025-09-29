import styled from '@emotion/styled'

export const Container = styled.div`
display:grid;
grid-template-columns: 200px 1fr 300px;
gap:28px;

height: 100%;

`
export const ContentContainer = styled.div`
background: ${({ theme }) => theme.COLORS.GRAY_50};
height: 100%;
width: 100%;
border-radius: 16px;
padding: 20px;
justify-content: space-between;

`
export const SelectContainer = styled.div`
display: flex;
flex-direction: column;
height: 100%;
margin-bottom: 20px;

`
export const SelectContent = styled.div`
display: flex;
gap: 16px;

`
