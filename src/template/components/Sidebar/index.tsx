// components/Sidebar/SidebarComponent.tsx
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';

import DashboardIcon from '@mui/icons-material/Dashboard';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PeopleIcon from '@mui/icons-material/People';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import FolderIcon from '@mui/icons-material/Folder';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';

import { User } from './components/User';
import { Container, Footer, Logo } from './styles';
import LogoAure from '@assets/images/logo_aure_icon.svg';
import { PATHS } from '@utils/paths';

const SIDEBAR_WIDTH = 220;

type Props = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function SidebarComponent({ mobileOpen, onClose }: Props) {
  const [rhOpen, setRhOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const isActive = (path: string) => location.pathname === path;

  const Content = (
    <List
      component="nav"
      sx={{
        width: SIDEBAR_WIDTH,
        bgcolor: 'background.paper',
        minHeight: '100vh',
        borderRight: '1px solid #EBEBEB',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        pb: '20px',
      }}
    >
      <div>
        <User />
        <div>
          <Divider sx={{ my: 1 }} />
          <ListItemButton selected={isActive(PATHS.salesDashboard)} onClick={() => { navigate(PATHS.salesDashboard); onClose(); }}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Vendas" />
          </ListItemButton>

          <ListItemButton selected={isActive(PATHS.dashboard)} onClick={() => { navigate(PATHS.dashboard); onClose(); }}>
            <ListItemIcon><AssessmentIcon /></ListItemIcon>
            <ListItemText primary="AurIA" />
          </ListItemButton>

          <Divider sx={{ my: 1 }} />

          <ListItemButton selected={isActive(PATHS.whatsapp)} onClick={() => { navigate(PATHS.whatsapp); onClose(); }}>
            <ListItemIcon><WhatsAppIcon /></ListItemIcon>
            <ListItemText primary="Whatsapp" />
          </ListItemButton>

          <ListItemButton selected={isActive(PATHS.leads)} onClick={() => { navigate(PATHS.leads); onClose(); }}>
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Leads" />
          </ListItemButton>

          <ListItemButton onClick={() => setRhOpen(!rhOpen)}>
            <ListItemIcon><BusinessCenterIcon /></ListItemIcon>
            <ListItemText primary="Rh" />
            {rhOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={rhOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }} selected={isActive(PATHS.resumes)} onClick={() => { navigate(PATHS.resumes); onClose(); }}>
                <ListItemIcon><FolderIcon /></ListItemIcon>
                <ListItemText primary="Currículos" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} selected={isActive(PATHS.hrMessages)} onClick={() => { navigate(PATHS.hrMessages); onClose(); }}>
                <ListItemIcon><MarkChatUnreadIcon /></ListItemIcon>
                <ListItemText primary="Entrevistas IA" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} selected={isActive(PATHS.kanbanHr)} onClick={() => { navigate(PATHS.kanbanHr); onClose(); }}>
                <ListItemIcon><ViewKanbanIcon /></ListItemIcon>
                <ListItemText primary="Kanban RH" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} selected={isActive(PATHS.jobs)} onClick={() => { navigate(PATHS.jobs); onClose(); }}>
                <ListItemIcon><GroupWorkIcon /></ListItemIcon>
                <ListItemText primary="Vagas" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} selected={isActive(PATHS.dashboardHr)} onClick={() => { navigate(PATHS.dashboardHr); onClose(); }}>
                <ListItemIcon><AssessmentIcon /></ListItemIcon>
                <ListItemText primary="Dashboard RH" />
              </ListItemButton>
            </List>
          </Collapse>

          <ListItemButton selected={isActive(PATHS.operationGroup)} onClick={() => { navigate(PATHS.operationGroup); onClose(); }}>
            <ListItemIcon><GroupWorkIcon /></ListItemIcon>
            <ListItemText primary="Operação" />
          </ListItemButton>

          <ListItemButton selected={isActive(PATHS.teste)} onClick={() => { navigate(PATHS.teste); onClose(); }}>
            <ListItemIcon><AccountCircleIcon /></ListItemIcon>
            <ListItemText primary="Teste pausa na conversa" />
          </ListItemButton>
        </div>
      </div>

      <Footer>
        <Logo src={LogoAure} />
      </Footer>
    </List>
  );

  if (isDesktop) {
    // Desktop: fixa
    return <Container style={{ width: SIDEBAR_WIDTH }}>{Content}</Container>;
  }

  // Mobile: overlay
  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{ sx: { width: SIDEBAR_WIDTH } }}
    >
      {Content}
    </Drawer>
  );
}
