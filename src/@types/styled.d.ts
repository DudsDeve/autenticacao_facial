// src/styles/styled.d.ts
/*import 'styled-components';
import { theme } from '@styles/theme/index';


declare module 'styled-components' {
    type ThemeType = typeof theme;

    export interface DefaultTheme extends ThemeType { }
}
*/
// styles/theme/types.ts (ou um arquivo .d.ts qualquer, pode ser global.d.ts)

// IMPORTANTE: o caminho deve bater com onde está seu theme!
import '@emotion/react';
import type { theme } from '@styles/theme/index'; // Caminho relativo para o theme

type ThemeType = typeof theme;

declare module '@emotion/react' {
    export interface Theme extends ThemeType { }
}
