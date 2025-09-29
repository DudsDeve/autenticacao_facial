import * as React from 'react';
import { DataGrid, type GridColDef, type GridRowParams, type GridColumnVisibilityModel } from '@mui/x-data-grid';
import { useRh } from '../../../hooks/useRh';
import { Container, DialogHeader, DialogInformations, Header } from './styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { CustomToolbarRh } from './components/CustomToolBarRh.tsx';

const sdrCloserColumns: GridColDef[] = [
  { field: 'nome', headerName: 'Nome', flex: 2 },
  { field: 'telefone', headerName: 'Telefone', flex: 1 },
  { field: 'idade', headerName: 'Idade', flex: 1 },
  { field: 'cidade_bairro', headerName: 'Cidade/Bairro', flex: 1.5 },
  {
    field: 'porcentagem_de_qualificacao',
    headerName: 'Qualificação',
    flex: 1.5,
    renderCell: (params) => {
      const percentStr = params.value ? String(params.value).replace(',', '.') : '0';
      const percent = parseFloat(percentStr.replace('%', '')) || 0;
      const maxStars = 5;
      const stars = Math.round((percent / 100) * maxStars * 2) / 2;
      const fullStars = Math.floor(stars);
      const halfStar = stars - fullStars >= 0.5;
      const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);
      const justificativa = params.row.motivo_da_porcentagem_de_qualificacao || 'Sem justificativa';
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
            <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>
              {params.value || '0%'}
            </span>
          </span>
        </Tooltip>
      );
    },
    sortComparator: (v1, v2) => {
      const n1 = parseFloat(String(v1).replace('%', '').replace(',', '.')) || 0;
      const n2 = parseFloat(String(v2).replace('%', '').replace(',', '.')) || 0;
      return n1 - n2;
    },
  },
  {
    field: 'qualificado',
    headerName: 'Qualificado',
    flex: 1,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) =>
      params.value ? (
        <span style={{ color: '#21B573', fontWeight: 600 }}>Sim</span>
      ) : (
        <span style={{ color: '#c4c4c4' }}>Não</span>
      ),
  },
  {
    field: 'muito_qualificado',
    headerName: 'Muito Qualificado',
    flex: 1.5,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => {
      const just = params.row.motivo_muito_qualificado || 'Sem justificativa';
      return (
        <Tooltip
          style={{ padding: 10 }}
          title={<span style={{ whiteSpace: 'pre-line' }}>{just}</span>}
          placement="top"
          TransitionComponent={Zoom}
          arrow
        >
          <span>
            {params.value ? (
              <CheckCircleIcon fontSize="small" htmlColor="#21B573" />
            ) : (
              <RemoveCircleOutlineIcon fontSize="small" htmlColor="#c4c4c4" />
            )}
          </span>
        </Tooltip>
      );
    },
  },
];

const gestorColumns: GridColDef[] = [
  { field: 'nome', headerName: 'Nome', flex: 2 },
  { field: 'telefone', headerName: 'Telefone', flex: 1 },
  { field: 'idade', headerName: 'Idade', flex: 1 },
  { field: 'cidade_bairro', headerName: 'Cidade/Bairro', flex: 1.5 },
  { field: 'experiencia_trafego', headerName: 'Experiência em Tráfego', flex: 1.5 },
  { field: 'experiencia_meta_ads', headerName: 'Meta Ads', flex: 1 },
  { field: 'experiencia_google_ads', headerName: 'Google Ads', flex: 1 },
  {
    field: 'qualificado',
    headerName: 'Qualificado',
    flex: 1,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) =>
      params.value ? (
        <span style={{ color: '#21B573', fontWeight: 600 }}>Sim</span>
      ) : (
        <span style={{ color: '#c4c4c4' }}>Não</span>
      ),
  },
  {
    field: 'muito_qualificado',
    headerName: 'Muito Qualificado',
    flex: 1.5,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => {
      const just = params.row.motivo_muito_qualificado || 'Sem justificativa';
      return (
        <Tooltip
          style={{ padding: 10 }}
          title={<span style={{ whiteSpace: 'pre-line' }}>{just}</span>}
          placement="top"
          TransitionComponent={Zoom}
          arrow
        >
          <span>
            {params.value ? (
              <CheckCircleIcon fontSize="small" htmlColor="#21B573" />
            ) : (
              <RemoveCircleOutlineIcon fontSize="small" htmlColor="#c4c4c4" />
            )}
          </span>
        </Tooltip>
      );
    },
  },
];

export function Resumes() {
  const { sdrs, closers, gestoresDeTrafego, loading } = useRh();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Filtro de tipo
  const [selectedType, setSelectedType] =
    React.useState<'sdr' | 'closer' | 'gestor_de_trafego'>('sdr');

  // Garante arrays
  const safeSdrs = Array.isArray(sdrs) ? sdrs : [];
  const safeClosers = Array.isArray(closers) ? closers : [];
  const safeGestores = Array.isArray(gestoresDeTrafego) ? gestoresDeTrafego : [];

  const data = React.useMemo(() => {
    if (selectedType === 'sdr') return safeSdrs.map(item => ({ ...item, tipo: 'sdr' }));
    if (selectedType === 'closer') return safeClosers.map(item => ({ ...item, tipo: 'closer' }));
    return safeGestores.map(item => ({ ...item, tipo: 'gestor_de_trafego' }));
  }, [selectedType, safeSdrs, safeClosers, safeGestores]);

  const columns = selectedType === 'gestor_de_trafego' ? gestorColumns : sdrCloserColumns;

  // Visibilidade responsiva: no mobile, mostra só nome/telefone/qualificado
  const columnVisibilityModel = React.useMemo<GridColumnVisibilityModel>(() => {
    if (!isMobile) return {};
    // seta tudo como false e libera só os 3
    // (usamos os ids pelo nome do field, que existem em ambos os conjuntos de colunas)
    const base: GridColumnVisibilityModel = {};
    columns.forEach(col => { base[col.field] = false; });
    base['nome'] = true;
    base['telefone'] = true;
    base['qualificado'] = true;
    return base;
  }, [isMobile, columns]);

  // Dialog de detalhes
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const handleRowClick = React.useCallback((params: GridRowParams) => {
    setSelectedRow(params.row);
  }, []);
  const handleClose = () => setSelectedRow(null);

  return (
    <Container>
      <Header><h2>Currículos</h2></Header>
      {/*<div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        <FormControl size="small">
          <InputLabel id="tipo-label">Tipo</InputLabel>
          <Select
            labelId="tipo-label"
            value={selectedType}
            label="Tipo"
            onChange={e => setSelectedType(e.target.value as any)}
            sx={{ minWidth: 180, fontFamily: 'Sora, Arial' }}
          >
            <MenuItem value="sdr">SDR</MenuItem>
            <MenuItem value="closer">Closer</MenuItem>
            <MenuItem value="gestor_de_trafego">Gestor de Tráfego</MenuItem>
          </Select>
        </FormControl>
        <div style={{ fontWeight: 500, fontSize: 16 }}>
          Total: {data.length}
        </div>
      </div>*/}

      <DataGrid
        rows={data.map((row, idx) => ({ ...row, id: row.id ?? idx + 1 }))}
        columns={columns}
        loading={loading}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection={!isMobile}            // <-- esconde seleção no mobile
        onRowClick={handleRowClick}
        showToolbar
        columnVisibilityModel={columnVisibilityModel} // <-- controla visibilidade
        sx={{
          border: 0,
          fontFamily: 'Sora, Arial',
          background: '#fff',
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
            outline: 'none !important',
          },
          '& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row:focus': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
          ...(isMobile && {
            '& .MuiDataGrid-columnHeaders': { fontSize: 12 },
            '& .MuiDataGrid-cell': { fontSize: 13, py: 1 },
          }),
        }}
        initialState={{
          ...(isMobile && { density: 'compact' }),
        }}
        slots={{
          toolbar: () => (
            <CustomToolbarRh
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              total={data.length}
              isMobile={isMobile}
            />
          ),
        }}
      />

      {/* Dialog de detalhes */}
      <Dialog open={!!selectedRow} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogHeader>
          <DialogTitle>
            Detalhes do Candidato
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
          {selectedRow && (
            <DialogInformations>
              <div><strong>Nome:</strong> {selectedRow.nome}</div>
              <div><strong>Telefone:</strong> {selectedRow.telefone}</div>
              <div><strong>Idade:</strong> {selectedRow.idade}</div>
              <div><strong>Cidade/Bairro:</strong> {selectedRow.cidade_bairro}</div>

              {selectedType === 'gestor_de_trafego' ? (
                <>
                  <div><strong>Experiência em Tráfego:</strong> {selectedRow.experiencia_trafego || '-'}</div>
                  <div><strong>Meta Ads:</strong> {selectedRow.experiencia_meta_ads || '-'}</div>
                  <div><strong>Google Ads:</strong> {selectedRow.experiencia_google_ads || '-'}</div>
                </>
              ) : (
                <>
                  <div><strong>Qualificação:</strong> {selectedRow.porcentagem_de_qualificacao || '-'}</div>
                  <div><strong>Qualificado:</strong> {selectedRow.qualificado ? 'Sim' : 'Não'}</div>
                </>
              )}

              <div style={{ marginTop: 8 }}>
                <strong>Muito Qualificado:</strong>{' '}
                {selectedRow.muito_qualificado ? (
                  <span style={{ color: '#21B573', fontWeight: 600 }}>Sim</span>
                ) : (
                  <span style={{ color: '#c4c4c4' }}>Não</span>
                )}
                <br />
                <span style={{ fontSize: 13, color: '#666' }}>
                  {selectedRow.motivo_muito_qualificado || 'Sem justificativa'}
                </span>
              </div>
            </DialogInformations>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
