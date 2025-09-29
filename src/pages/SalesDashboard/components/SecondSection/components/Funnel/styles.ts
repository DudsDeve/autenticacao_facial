import styled from '@emotion/styled'

export const Container = styled.div`
height: 100%;
display:flex;
flex-direction:column;
gap:25px;
background: ${({ theme }) => theme.COLORS.GRAY_50};
border-radius: 16px;
padding: 20px;

.recharts-bar-rectangle:focus {
  outline: none !important;
}`

export const Title = styled.div`
font-size: 22px;
font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
`
export const Description = styled.div`
color:${({ theme }) => theme.COLORS.GRAY_400};
`
export const CategoriesContainer = styled.div`
display: flex;
flex-direction:column;
`
export const Categories = styled.div`
display: flex;
flex-direction: column;
justify-content: space-between;
`
export const CategoryData = styled.div`
display: flex;
width: 100%;
justify-content: space-between;
`
export const Category = styled.div`
width: 100%;
`
export const Percentage = styled.div`
font-family:  ${({ theme }) => theme.FONT_FAMILY.BOLD};
`
export const Graph = styled.div`
width: 100%;
`