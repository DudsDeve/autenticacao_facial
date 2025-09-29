// pages/Whatsapp/styles.ts
import styled from '@emotion/styled';

export const Container = styled.section`
  display: grid;
  grid-template-columns: 400px 1fr;         /* desktop */
  width: 100%;
  height: calc(100vh - 56px);               /* abaixo do header */
  overflow: hidden;

  @media (max-width: 899px) {
    grid-template-columns: 1fr;             /* mobile: uma coluna */
  }
`;
