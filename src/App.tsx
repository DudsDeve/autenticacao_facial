// src/App.tsx
import { BrowserRouter } from "react-router-dom";
import { Router } from "./routes";
import { GlobalStyle } from "@styles/global";
import { theme } from "@styles/theme";
import { ThemeProvider } from "@emotion/react";
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@styles/theme/mui';
import { AppProviders } from "./AppProviders";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <MuiThemeProvider theme={muiTheme}>
        <AppProviders>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
          <GlobalStyle />
        </AppProviders>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

export default App;
