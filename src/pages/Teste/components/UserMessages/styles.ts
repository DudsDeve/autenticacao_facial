// pages/Whatsapp/components/UserMessages/styles.ts
import styled from '@emotion/styled';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: ${({ theme }) => theme.HEADER_HEIGHT} ;
  width: 100%;
`;

// UserMessages/styles.ts
export const Header = styled.div`
display: flex;

align-items: center;
  padding: 15px;
  gap:20px;
  font-family: 'Sora Medium';
  font-size: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.COLORS.GRAY_50};
`;


export const BackBtn = styled.div`
  display: block;
  @media (min-width: 900px) {
    display: none;
  }
`;

export const ChatProfile = styled.div`
display: flex;
align-items: center;
justify-content: center;
width: 50px;
height: 50px;
color: ${({ theme }) => theme.COLORS.WHITE};
background: ${({ theme }) => theme.COLORS.PURPLE_500};
border-radius: 50%;
font-size: 22px;
font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
`

export const ChatName = styled.h2`
  font-size: var(--name-size);
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
`;

export const MessagesList = styled.ul`
  flex: 1 1 0%;
  overflow-y: auto;
  padding: 36px 0 100px 0;
  margin: 0;
  list-style: none;
  min-height: 0;
    max-height: 100%;

  height: 100%;
    &::-webkit-scrollbar {
    width: 10px;
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.COLORS.PURPLE_100};        
    border-radius: 4px;
    transition: background 0.3s;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.COLORS.PURPLE_500};        
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.COLORS.PURPLE_100} transparent;
`;

export const Bubble = styled.li<{ $fromIA: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $fromIA }) => ($fromIA ? 'flex-end' : 'flex-start')};
  margin: 12px 16px;
  font-family: 'Sora Regular';
  font-size: 14px;

  .bubble-content {
    max-width: 85vw;            /* melhor aproveitamento no mobile */
    min-width: 48px;
    padding: 12px 18px 10px 14px;
    background: ${({ $fromIA }) => ($fromIA ? '#8830E1' : '#F2F2F7')};
    color:  ${({ $fromIA }) => ($fromIA ? '#FFFF' : '#000')};
    border-radius: 10px;
    border-bottom-right-radius: ${({ $fromIA }) => ($fromIA ? '0px' : '10px')};
    border-bottom-left-radius: ${({ $fromIA }) => ($fromIA ? '10px' : '0px')};
    box-shadow: 0 1px 3px rgba(0,0,0,0.11);
    margin-right: ${({ $fromIA }) => ($fromIA ? '0' : 'auto')};
    margin-left: ${({ $fromIA }) => ($fromIA ? 'auto' : '0')};
    white-space: pre-line;
    word-break: break-word;
  }

  .bubble-hour {
    color: ${({ theme }) => theme.COLORS.BLACK};
    font-size: 12px;
    margin-top: 2px;
    padding-right: 6px;
    align-self: flex-end;
    opacity: 0.7;
  }
`;
