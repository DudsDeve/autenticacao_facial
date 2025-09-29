import { useState } from "react";
import { HrMessagesProvider } from "@contexts/HrMessages";
import { HrUsersLayout } from "./components/HrUsersLayout";
import { HrUsersMessages } from "./components/HrUserMessages";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Container } from "./styles";

export function HrMessagesPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 900px

  const handleOpenChat = (sessionId: string) => setSelected(sessionId);
  const handleBack = () => setSelected(null);

  return (
    <HrMessagesProvider>
      <Container>
        {isMobile ? (
          // MOBILE: ou lista OU chat
          selected ? (
            <HrUsersMessages
              sessionId={selected}
              isMobile
              onBack={handleBack}   // seta aparece aqui
            />
          ) : (
            <HrUsersLayout
              selectedSession={selected}
              onSelectUser={handleOpenChat}
            />
          )
        ) : (
          // DESKTOP: dois painéis lado a lado
          <>
            <HrUsersLayout
              selectedSession={selected}
              onSelectUser={handleOpenChat}
            />
            <HrUsersMessages sessionId={selected} />
          </>
        )}
      </Container>
    </HrMessagesProvider>
  );
}
