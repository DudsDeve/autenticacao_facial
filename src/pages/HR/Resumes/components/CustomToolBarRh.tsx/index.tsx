// CustomToolbarRh.tsx
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

type Props = {
  selectedType: 'sdr' | 'closer' | 'gestor_de_trafego';
  setSelectedType: (v: 'sdr' | 'closer' | 'gestor_de_trafego') => void;
  total: number;
  isMobile?: boolean;
};

export function CustomToolbarRh({ selectedType, setSelectedType, total, isMobile }: Props) {
  return (
    <GridToolbarContainer
      sx={{
        px: 1,
        py: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {/* Esquerda: Select + Total */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 260 }}>
        <FormControl size="small" sx={{ width: 160 }}>
          <InputLabel id="tipo-label">Vaga</InputLabel>
          <Select
            labelId="tipo-label"
            label="Tipo"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
          >
            <MenuItem value="sdr">SDR</MenuItem>
            <MenuItem value="closer">Closer</MenuItem>
            <MenuItem value="gestor_de_trafego">Gestor de Tráfego</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ fontWeight: 500 }}>Total: {total}</Box>
      </Box>

      {/* Centro (cresce): Busca */}
      <Box sx={{ flex: 1, minWidth: isMobile ? 120 : 280 }}>
        <GridToolbarQuickFilter
          debounceMs={300}
          quickFilterParser={(v) => v.split(/\s+/).filter(Boolean)}
        />
      </Box>

      {/* Direita: botões (em mobile pode ocultar, se quiser) */}
      {!isMobile && (
        <>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
        </>
      )}
    </GridToolbarContainer>
  );
}
