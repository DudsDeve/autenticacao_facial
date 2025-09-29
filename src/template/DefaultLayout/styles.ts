// layouts/DefaultLayout/styles.ts
import styled from '@emotion/styled';

export const Content = styled.section`
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

export const OutletContainer = styled.section`
  flex: 1 1 auto;
  height: 100%;
  overflow: auto;
  margin-left: 0;

  @media (min-width: 900px) {
    margin-left: 220px; /* mesma largura da sidebar fixa */
  }
`;
