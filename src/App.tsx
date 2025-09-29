// src/App.tsx
import { BrowserRouter } from "react-router-dom";
import { Router } from "./routes";
import { GlobalStyle } from "@styles/global";
import { theme } from "@styles/theme";
import { ThemeProvider } from "@emotion/react";
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@styles/theme/mui';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <MuiThemeProvider theme={muiTheme}>
       
          <BrowserRouter>
            <Router />
          </BrowserRouter>
          <GlobalStyle />
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

export default App;
