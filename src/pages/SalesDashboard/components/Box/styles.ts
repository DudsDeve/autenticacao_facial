import styled from '@emotion/styled';

export const Container = styled.div`
  background-color: ${({ theme }) => theme.COLORS.PURPLE_600};
  color: ${({ theme }) => theme.COLORS.WHITE};
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.COLORS.PURPLE_100};
  padding: 10px 20px;
  width:100%;
`;