import type { ReactNode } from 'react'
import { Container } from './styles'

interface BoxesProps{
    children?:ReactNode
}
export function SecondSectionBox({ children}: BoxesProps) {
  return <Container>
   {children}
    </Container>;
}