import * as React from 'react';
import { useGridApiRef, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import { useOperationGroup } from '@hooks/useOperationGroup';
import { DataGrid } from '@mui/x-data-grid';
import { parseISO, format } from 'date-fns';

import { Container, DialogHeader, DialogInformations } from './styles';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { CustomToolbar } from './components/CustomToolbar';
import { ptBR } from '@mui/x-data-grid/locales';

const columns: GridColDef[] = [
  {
    field: 'grupo_nome',
    headerName: 'Grupo',
    flex: 2,
    renderCell: (params) => {
      // Remove o prefixo "Aure Digital + " se existir
      const prefix = 'Aure Digital + ';
      const value = params.value || '';
      return value.startsWith(prefix) ? value.slice(prefix.length) : value;
    }
  },
  { field: 'categoria', headerName: 'Categoria', flex: 1 },
  { field: 'pontos_importantes', headerName: 'Pontos Importantes', flex: 1 },
  { field: 'pontos_positivos', headerName: 'Pontos Positivos', flex: 1 },
  { field: 'pontos_negativos', headerName: 'Pontos Negativos', flex: 1 },
  { field: 'resumo_da_conversa', headerName: 'Resumo', flex: 1.8 },

  { field: 'grupo_numero_de_integrantes', headerName: 'Integrantes', flex: 0.7 },
 
  {field: 'data_da_triagem', headerName: 'Data da Triagem', flex: 1.2, valueFormatter: (params: any) => params.value ? format(parseISO(params.value), 'dd/MM/yyyy HH:mm') : ''},


];

export default function DataTable() {
  const { operationGroups = [], loading } = useOperationGroup();
console.log('operationGroups:', operationGroups);

  // Mapeando os dados do banco para as linhas do DataGrid
  const rows = React.useMemo(
    () =>
      operationGroups.map((item, idx) => ({
        id: item.id ?? idx + 1,
        grupo_nome: item.grupo_nome,
        grupo_dono: item.grupo_dono,
        grupo_numero_de_integrantes: item.grupo_numero_de_integrantes,
        grupo_total_de_mensagens: item.grupo_total_de_mensagens,
        nome_dos_participantes: item.nome_dos_participantes,
        created_at: item.created_at,
        from_me: item.from_me,
        categoria: item.categoria,
        resumo_da_conversa: item.resumo_da_conversa,
        data_da_triagem: item.data_da_triagem,
        pontos_importantes: item.pontos_importantes,
        pontos_positivos: item.pontos_positivos,
        pontos_negativos: item.pontos_negativos,
        nome_usuarios_aure: item.nome_usuarios_aure,
        nome_clientes: item.nome_clientes,
        // Adicione mais campos conforme quiser exibir nos detalhes!
        
      })),
    [operationGroups]
  );

  const [selectedGroup, setSelectedGroup] = React.useState<any>(null);

  const handleRowClick = React.useCallback((params: GridRowParams) => {
    setSelectedGroup(params.row);
  }, []);

  const handleClose = () => setSelectedGroup(null);
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
        checkboxSelection
        onRowClick={handleRowClick}
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
          }
        }}
        showToolbar
        slots={{
          toolbar: () => <CustomToolbar rows={rows} columns={columns} apiRef={apiRef} />
        }}
        initialState={{
          sorting: {
            sortModel: [{ field: 'created_at', sort: 'asc' }]
          }
        }}
      />

      <Dialog open={!!selectedGroup} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogHeader>
          <DialogTitle>
            Detalhes do Grupo
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
              size="large">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
        </DialogHeader>
        <DialogContent dividers>
          {selectedGroup && (
            <div style={{ fontSize: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <div style={{
                  background: "#DFE0FF",
                  borderRadius: 50,
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 24,
                  marginRight: 16
                }}>
                  {selectedGroup.grupo_nome?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 20 }}>{selectedGroup.grupo_nome}</div>
                  <div style={{ fontSize: 14, color: "#888" }}>{selectedGroup.grupo_dono}</div>
                </div>
              </div>
              <DialogInformations>
                <div><strong>Participantes:</strong> {selectedGroup.nome_dos_participantes}</div>
                <div><strong>Categoria:</strong> {selectedGroup.categoria}</div>
                <div><strong>Criado em:</strong> {selectedGroup.created_at && format(parseISO(selectedGroup.created_at), 'dd/MM/yyyy HH:mm')}</div>
                <div><strong>Resumo da conversa:</strong> <span style={{ color: '#666', marginTop: 4 }}>{selectedGroup.resumo_da_conversa}</span></div>
                <div><strong>Enviado por mim:</strong> {selectedGroup.from_me ? "Sim" : "Não"}</div>
                <div><strong>Total de mensagens:</strong> {selectedGroup.grupo_total_de_mensagens}</div>
                <div><strong>Número de integrantes:</strong> {selectedGroup.grupo_numero_de_integrantes}</div>
                {/* Adicione mais campos se quiser */}
              </DialogInformations>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
