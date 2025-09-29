// components/header/index.tsx
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Section } from './styles';

// Mapa para traduzir breadcrumbs
const breadcrumbNameMap: Record<string, string> = {
  ads: 'Anúncio',
  dashboard: 'Dashboard',
  // ...
};

type HeaderProps = {
  onMenuClick?: () => void; // <- para abrir o Drawer no mobile
};

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Section>
      {!isDesktop && (
        <IconButton
          edge="start"
          aria-label="menu"
          onClick={onMenuClick}
          size="large"
          style={{ marginRight: 8 }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Breadcrumbs aria-label="breadcrumb">
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const name = breadcrumbNameMap[value] || value;

          return isLast ? (
            <Typography color="text.primary" key={to}>
              {name}
            </Typography>
          ) : (
            <Link underline="hover" color="inherit" component={RouterLink} to={to} key={to}>
              {name}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Section>
  );
}
