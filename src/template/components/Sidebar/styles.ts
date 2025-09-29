// components/Sidebar/styles.ts
import styled from '@emotion/styled';
import { NavLink } from 'react-router-dom';

export const Container = styled.aside`
  display: none;

  @media (min-width: 900px) {
    display: block;
    position: fixed;
    left: 0;
    top: 0;
    width: 220px;
    height: 100vh;
    box-sizing: border-box;                /* <-- garante que o border entra nos 220px */
    border-right: 1px solid ${({ theme }) => theme.COLORS.GRAY_50};
    background: ${({ theme }) => (theme as any).palette?.background?.paper || '#fff'};
    z-index: 1200;
    overflow-y: auto;                       /* rola só o conteúdo da sidebar */
    /* Oculta a barra da sidebar no desktop (opcional) */
    &::-webkit-scrollbar { width: 0; height: 0; }
    scrollbar-width: none;
  }
`;

export const Footer = styled.div`
  display: flex;
  align-self: center;
  justify-content: center;
`;

export const Logo = styled.img`
  display: flex;
  width: 72px;
  height: 40px;
  justify-content: center;
  align-items: center;
`;

export const Link = styled(NavLink)`
  text-decoration: none;
`;
