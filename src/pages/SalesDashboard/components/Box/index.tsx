import React from 'react'
import { Container } from './styles';


interface BoxProps {
    children: React.ReactNode;
}
export function Box({ children }: BoxProps) {
  return (
    <Container> 
        {children}
    </Container>
  )
}
