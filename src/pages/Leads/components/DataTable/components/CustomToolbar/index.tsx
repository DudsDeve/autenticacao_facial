import * as React from "react";
import {
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Box, Menu, MenuItem, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type Props = {
  rows: any[];
  columns: any[];
  apiRef: any;
  isMobile?: boolean;
};

export function CustomToolbar({ rows, columns, apiRef, isMobile }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleExportExcel = () => {
    // tenta respeitar colunas visíveis; se não houver info, exporta todas
    let visibleFields: string[] | null = null;

    try {
      const visibilityModel =
        apiRef?.current?.state?.columns?.visibilityModel ??
        apiRef?.current?.getState?.()?.columns?.visibilityModel;

      if (visibilityModel && typeof visibilityModel === "object") {
        const visible = Object.entries(visibilityModel)
          .filter(([, v]) => v !== false) // true ou undefined = visível
          .map(([k]) => k);
        // garante ordem conforme `columns`
        visibleFields = columns
          .map((c: any) => c.field)
          .filter((f: string) => visible.includes(f));
      }
    } catch {
      // ignora, cai no fallback
    }

    const fieldsToUse =
      visibleFields && visibleFields.length > 0
        ? visibleFields
        : columns.map((c: any) => c.field);

    const data = rows.map((row) =>
      fieldsToUse.reduce((acc: Record<string, any>, field: string) => {
        acc[field] = row[field];
        return acc;
      }, {})
    );

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "leads.xlsx");
    handleMenuClose();
  };

  // --- MOBILE: apenas busca e menu (3 pontos) ---
  if (isMobile) {
    return (
      <GridToolbarContainer
        sx={{
          px: 1,
          py: 0.5,
          gap: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <GridToolbarQuickFilter
            quickFilterParser={(v) => v.split(/\s+/).filter(Boolean)}
            debounceMs={300}
          />
        </Box>

        <IconButton size="small" onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          <MenuItem onClick={handleExportExcel}>Exportar Excel</MenuItem>
        </Menu>
      </GridToolbarContainer>
    );
  }

  // --- DESKTOP: busca + botões (colunas/filtros) + menu ---
  return (
    <GridToolbarContainer
      sx={{
        px: 1,
        py: 0.5,
        gap: 1,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 280 }}>
        <GridToolbarQuickFilter
          quickFilterParser={(v) => v.split(/\s+/).filter(Boolean)}
          debounceMs={300}
        />
      </Box>

      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />

      <IconButton size="small" onClick={handleMenuOpen}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={handleExportExcel}>Exportar Excel</MenuItem>
      </Menu>
    </GridToolbarContainer>
  );
}
