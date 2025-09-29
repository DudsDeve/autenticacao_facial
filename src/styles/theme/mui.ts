// styles/theme/mui.ts
import { createTheme } from '@mui/material/styles';
import { theme as customTheme } from './index';

export const muiTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: customTheme.COLORS.PURPLE_500,
        },
        background: {
            default: customTheme.COLORS.WHITE,
        },
    },
});
