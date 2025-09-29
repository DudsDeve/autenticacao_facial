import styled from '@emotion/styled';

export const Container = styled.aside`
 height: ${({ theme }) => theme.HEADER_HEIGHT} ;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${({ theme }) => theme.COLORS.GRAY_50};
  width:400px;
  min-width: 400px;

.css-9qokjt span{
  font-size: 16px;
}
@media (max-width: 899px) {
    width: 100%;
    min-width: 100%;
    border-right: none; /* sem divisor no mobile */
  }
`;

export const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px 16px;
  span {
  font-family:'Sora Medium';
  font-size: 25px;
  }
  
`;
export const DateContainer = styled.div`

`
export const DataTypes = styled.div`
display:flex;
flex:1;
gap:10px;`
export const Type = styled.div`
font-size: 12px;
color:${({ theme }) => theme.COLORS.BLACK} ;
font-family:'Sora Regular';
padding: 5px 8px;
border-radius: 10px;
border: 1px solid ${({ theme }) => theme.COLORS.GRAY_100};
cursor: pointer;
`

export const SearchBar = styled.div`
  input {
     border: 2px solid ${({ theme }) => theme.COLORS.PURPLE_500};

    width: 100%;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
  }
`;

export const ChatList = styled.div`
  flex: 1;
  height: 100vh;
  padding-right: 8px;    
  padding-top: 8px;      
  margin: 0;
  overflow-y: auto;

  /* Scrollbar custom */
  &::-webkit-scrollbar { width: 8px; background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.COLORS.PURPLE_100};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track { background: transparent; }
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.COLORS.PURPLE_100} transparent;

`;

export const ChatItem = styled.div`
  display: flex;
  gap:10px;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.COLORS.GRAY_50};
  transition: background 0.2s;
  &:hover{
    background: ${({ theme }) => theme.COLORS.PURPLE_100};
    color: ${({ theme }) => theme.COLORS.WHITE} ;

  }
`;
export const ChatProfile = styled.div`
display: flex;
align-items: center;
justify-content: center;
width: 50px;
height: 50px;
background: ${({ theme }) => theme.COLORS.PURPLE_500};
border-radius: 50%;
font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
`

export const ChatName = styled.div`
  font-weight: 500;
  font-size: 1.08rem;
  margin-bottom: 2px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-family: 'Sora Medium';
  
`;

export const ChatLastMessage = styled.div`
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Sora Regular';

`;

export const ChatHour = styled.div`
  font-size: 10px;
`;

export const ChatBadge = styled.div`
  background: #1ed760;
  color: #fff;
  font-size: 0.80rem;
  font-weight: 700;
  border-radius: 999px;
  min-width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  margin-top: 4px;
  display: inline-block;
`;
