import styled from '@emotion/styled'
import Paper from '@mui/material/Paper'

export const Container = styled(Paper)`
height: calc(100vh - 112px);
border: none;`

export const DialogHeader = styled.div`
background: ${({ theme }) => theme.COLORS.PURPLE_500};
color: ${({ theme }) => theme.COLORS.WHITE};
 `
export const DialogInformations = styled.div`
display: flex;
flex-direction: column;
gap:10px;
`