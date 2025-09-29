import * as React from 'react';
import { useGridApiRef, type GridColDef, type GridRowParams, type GridColumnVisibilityModel } from '@mui/x-data-grid';
import { useLeads } from '@hooks/useLeads';
import { DataGrid } from '@mui/x-data-grid';
import { parseISO, format } from 'date-fns';

import { Container, DialogHeader, DialogInformations } from './styles';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { CustomToolbar } from './components/CustomToolbar';
import { ptBR } from '@mui/x-data-grid/locales';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const columns: GridColDef[] = [
  { field: 'nome', headerName: 'Nome', flex: 1.5 },
  { field: 'telefone', headerName: 'Telefone', flex: 1.3 },
  { field: 'empresa', headerName: 'Empresa', flex: 1.3 },
  { field: 'sub_canal', headerName: 'Sub canal', flex: 0.8 },
  { field: 'created_at', headerName: 'Data de criação', flex: 1.6 },

  {
    field: 'temperatura',
    headerName: 'Temperatura',
    flex: 1.2,
    renderCell: (params) => {
      const percentStr = params.value || '0%';
      const percent = parseInt(percentStr.replace('%', ''), 10) || 0;
      const maxStars = 5;
      const stars = Math.round((percent / 100) * maxStars * 2) / 2;
      const fullStars = Math.floor(stars);
      const halfStar = stars - fullStars >= 0.5;
      const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);
      const justificativa = params.row.justificativa || 'Sem justificativa';
      return (
        <Tooltip
          style={{ padding: 10 }}
          title={<span style={{ whiteSpace: 'pre-line' }}>{justificativa}</span>}
          placement="top"
          TransitionComponent={Zoom}
          arrow
        >
          <span style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            {[...Array(fullStars)].map((_, i) => (
              <StarIcon key={`full_${i}`} fontSize="small" htmlColor="#FFD700" />
            ))}
            {halfStar && (
              <StarIcon
                key="half"
                fontSize="small"
                htmlColor="#FFD700"
                style={{ clipPath: 'inset(0 50% 0 0)' }}
              />
            )}
            {[...Array(emptyStars)].map((_, i) => (
              <StarBorderIcon key={`empty_${i}`} fontSize="small" />
            ))}
            <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>{percentStr}</span>
          </span>
        </Tooltip>
      );
    },
    sortComparator: (v1, v2) => {
      const n1 = parseInt(String(v1).replace('%', ''), 10) || 0;
      const n2 = parseInt(String(v2).replace('%', ''), 10) || 0;
      return n1 - n2;
    },
  },
  {
    field: 'lead_score',
    headerName: 'Lead Score',
    flex: 1.2,
    renderCell: (params) => {
      const scoreStr = params.value || '0%';
      const score = parseInt(scoreStr.replace('%', ''), 10) || 0;
      const maxStars = 5;
      const stars = Math.round((score / 100) * maxStars * 2) / 2;
      const fullStars = Math.floor(stars);
      const halfStar = stars - fullStars >= 0.5;
      const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);
      const justificativa = params.row.lead_score_justificativa || 'Sem justificativa';

      return (
        <Tooltip
          style={{ padding: 10 }}
          title={<span style={{ whiteSpace: 'pre-line' }}>{justificativa}</span>}
          placement="top"
          TransitionComponent={Zoom}
          arrow
        >
          <span style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            {[...Array(fullStars)].map((_, i) => (
              <StarIcon key={`score_full_${i}`} fontSize="small" htmlColor="#21B573" />
            ))}
            {halfStar && (
              <StarIcon
                key="score_half"
                fontSize="small"
                htmlColor="#21B573"
                style={{ clipPath: 'inset(0 50% 0 0)' }}
              />
            )}
            {[...Array(emptyStars)].map((_, i) => (
              <StarBorderIcon key={`score_empty_${i}`} fontSize="small" />
            ))}
            <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>{scoreStr}</span>
          </span>
        </Tooltip>
      );
    },
    sortComparator: (v1, v2) => {
      const n1 = parseInt(String(v1).replace('%', ''), 10) || 0;
      const n2 = parseInt(String(v2).replace('%', ''), 10) || 0;
      return n1 - n2;
    },
  },
  {
    field: 'mql',
    headerName: 'MQL',
    flex: 0.7,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => {
      const value = params.value;
      const isTrue =
        value === true ||
        value === 1 ||
        value === 'true' ||
        value === 'TRUE' ||
        value === 'Sim' ||
        value === 'sim';
      return isTrue ? (
        <CheckCircleIcon fontSize="small" htmlColor="#21B573" titleAccess="MQL" />
      ) : (
        <RemoveCircleOutlineIcon fontSize="small" htmlColor="#c4c4c4" titleAccess="Não MQL" />
      );
    },
  },
];

export default function DataTable() {
  const { leads = [], loading } = useLeads();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Visibilidade responsiva: em mobile, mostra apenas nome/telefone/mql; mantém as demais colunas ocultas (para filtros).
  const columnVisibilityModel = React.useMemo<GridColumnVisibilityModel>(() => {
    if (!isMobile) return {};
    return {
      nome: true,
      telefone: true,
      mql: true,
      empresa: false,
      sub_canal: false,
      created_at: false,
      temperatura: false,
      lead_score: false,
      // quaisquer outros fields calculados/auxiliares também podem ficar ocultos
      lead_score_justificativa: false,
      ultimo_contato: false,
      justificativa: false,
      resumo: false,
      email: false,
      instagram: false,
      cidade: false,
      created_at_raw: false,
    } as GridColumnVisibilityModel;
  }, [isMobile]);

  function formatTimestampRaw(timestampz: string) {
    if (!timestampz) return '';
    const match = timestampz.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
    if (!match) return timestampz;
    const [, year, month, day, hour, min, sec] = match;
    return `${hour}:${min}:${sec} - ${day}/${month}/${year}`;
  }

  const rows = React.useMemo(
    () =>
      leads.map((lead, idx) => ({
        id: lead.id ?? idx + 1,
        nome: lead.nome,
        telefone: lead.telefone,
        empresa: lead.empresa,
        temperatura: lead.nivel_da_temperatura,
        mql: lead['mql?'],
        lead_score: lead.lead_score,
        lead_score_justificativa: lead.lead_score_justificativa,
        ultimo_contato: formatTimestampRaw(lead.ultimo_contato),
        justificativa: lead.temperatura_porcentagem_justificativa,
        resumo: lead.resumo || '',
        email: lead.email,
        instagram: lead.instagram,
        cidade: lead.cidade,
        sub_canal: lead.sub_canal,
        created_at_raw: lead.created_at,
        created_at: lead.created_at ? format(parseISO(lead.created_at), 'dd-MM-yyyy') : '',
      })),
    [leads]
  );

  const [selectedLead, setSelectedLead] = React.useState<any>(null);
  const handleRowClick = React.useCallback((params: GridRowParams) => {
    setSelectedLead(params.row);
  }, []);
  const handleClose = () => setSelectedLead(null);
  const apiRef = useGridApiRef();

  return (
    <Container>
      <DataGrid
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection={!isMobile}   // <-- aqui: só mostra se NÃO for mobile

        onRowClick={handleRowClick}
        columnVisibilityModel={columnVisibilityModel} // <-- controla visibilidade sem perder filtros
        sx={{
          border: 0,
          fontFamily: 'Sora, Arial',
          background: '#ffffff',
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
            outline: 'none !important',
          },
          '& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row:focus': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
          // Ajustes finos para telas pequenas
          ...(isMobile && {
            '& .MuiDataGrid-columnHeaders': { fontSize: 12 },
            '& .MuiDataGrid-cell': { fontSize: 13, py: 1 },
          }),
        }}
        showToolbar
        slots={{
          toolbar: () => <CustomToolbar rows={rows} columns={columns} apiRef={apiRef} isMobile={isMobile}/>,
        }}
        initialState={{
          sorting: {
            sortModel: [{ field: 'created_at', sort: 'asc' }],
          },
          // Opcional: densidade mais compacta no mobile
          ...(isMobile && {
            density: 'compact',
          }),
        }}
      />

      <Dialog open={!!selectedLead} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogHeader>
          <DialogTitle>
            Detalhes do Lead
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
              size="large"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
        </DialogHeader>
        <DialogContent dividers>
          {selectedLead && (
            <div style={{ fontSize: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <div
                  style={{
                    background: '#DFE0FF',
                    borderRadius: 50,
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 24,
                    marginRight: 16,
                  }}
                >
                  {selectedLead.nome?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 20 }}>{selectedLead.nome}</div>
                  <div style={{ fontSize: 14, color: '#888' }}>{selectedLead.empresa}</div>
                </div>
              </div>
              <DialogInformations>
                <div>
                  <strong>Telefone:</strong> {selectedLead.telefone}
                </div>
                <div>
                  <strong>Temperatura:</strong> {selectedLead.temperatura}
                </div>
                <div>
                  <strong>Justificativa:</strong>
                  <span style={{ fontStyle: 'italic', color: '#555', marginBottom: 8 }}>
                    {selectedLead.justificativa}
                  </span>
                </div>
                <div>
                  <strong>Último contato:</strong> {selectedLead.ultimo_contato}
                </div>
                <div>
                  <strong>MQL:</strong> {selectedLead.mql ? 'Sim' : 'Não'}
                </div>
                <div>
                  <strong>Email:</strong> {selectedLead.email || '-'}
                </div>
                <div>
                  <strong>Instagram:</strong> {selectedLead.instagram || '-'}
                </div>
                <div>
                  <strong>Cidade:</strong> {selectedLead.cidade || '-'}
                </div>
                {selectedLead.resumo && (
                  <>
                    <strong>Resumo:</strong>
                    <div style={{ color: '#666', marginTop: 4 }}>{selectedLead.resumo}</div>
                  </>
                )}
              </DialogInformations>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
