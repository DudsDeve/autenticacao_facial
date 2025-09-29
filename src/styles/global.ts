import { createGlobalStyle } from 'styled-components'
import { MainFontFace } from './fonts'




export const GlobalStyle = createGlobalStyle`
  ${MainFontFace};

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box; 
    font-family: 'Sora Regular';
    .recharts-wrapper:focus,
.recharts-responsive-container:focus,
.recharts-surface:focus {
  outline: none !important;
  box-shadow: none !important;
 

}

  }

  

`
