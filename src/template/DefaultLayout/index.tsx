// layouts/DefaultLayout/index.tsx
import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarComponent } from '@template/components/Sidebar';
import Header from '@template/components/header';
import { Content, OutletContainer } from './styles';

export function DefaultLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <Content>
      <SidebarComponent mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <OutletContainer>
        <Header onMenuClick={() => setMobileOpen(true)} />
        <Outlet />
      </OutletContainer>
    </Content>
  );
}
