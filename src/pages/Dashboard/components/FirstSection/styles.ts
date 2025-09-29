import styled from '@emotion/styled'

export const Container = styled.div`
display:grid;
grid-template-columns: 1fr 1fr 1fr 1fr;
gap:28px;`


export const AssumirButton = styled.button`
  background: #eab308; // amarelo dourado
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 1rem;
  margin-top: 12px;

  &:hover {
    background: #c4910b;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;
