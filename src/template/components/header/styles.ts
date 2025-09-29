// components/header/styles.ts
import styled from '@emotion/styled';

export const Section = styled.section`
  width: 100%;
  height: 56px;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid ${({ theme }) => theme.COLORS.GRAY_50};
  position: sticky;
  top: 0;
  z-index: 1100;
  background: ${({ theme }) => (theme as any).palette?.background?.paper || '#fff'};
`;
