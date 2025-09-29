import { css } from 'styled-components'

import { SoraRegular, SoraBold, SoraMedium } from '@assets/fonts/index'

export const MainFontFace = css`
  @font-face {
    font-family: 'Sora Regular';
    src: url('${SoraRegular}')  format('truetype');
  }

  @font-face {
    font-family: 'Sora Medium';
    src: url('${SoraMedium}')  format('truetype');
  }
    @font-face {
    font-family: 'Sora Bold';
    src: url('${SoraBold}')  format('truetype');
  }
`