import * as React from 'react';
import { Box, Stack, useMediaQuery, useTheme } from '@mui/material';
import UsersLayout, { type TabKey } from './components/UsersLayout';
import UserMessages from './components/UserMessages';

export default function Whatsapp() {
  const [tab, setTab] = React.useState<TabKey>('mql');
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px

  const handleOpenChat = (leadId: string) => setSelectedLeadId(leadId);
  const handleBack = () => setSelectedLeadId(null);

  return (
    <Box sx={{ height: '100vh', bgcolor: 'background.default' }}>
      {isMobile ? (
        // MOBILE: ou lista OU chat
        selectedLeadId ? (
          <UserMessages
            tab={tab}
            selectedLeadId={selectedLeadId}
            isMobile
            onBack={handleBack}
          />
        ) : (
          <UsersLayout
            tab={tab}
            onChangeTab={setTab}
            selectedLeadId={selectedLeadId}
            onSelectLead={handleOpenChat}
          />
        )
      ) : (
        // DESKTOP: dois painéis lado a lado
        <Stack direction="row" sx={{ height: '100%' }}>
         
            <UsersLayout
              tab={tab}
              onChangeTab={setTab}
              selectedLeadId={selectedLeadId}
              onSelectLead={handleOpenChat}
            />
        
        
            <UserMessages tab={tab} selectedLeadId={selectedLeadId} />
         
        </Stack>
      )}
    </Box>
  );
}
