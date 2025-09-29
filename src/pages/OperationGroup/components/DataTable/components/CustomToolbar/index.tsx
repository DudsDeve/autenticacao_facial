import {
    
    GridToolbarQuickFilter,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    Toolbar
  } from '@mui/x-data-grid';
  
  import {  Menu, MenuItem, IconButton } from '@mui/material';
  import MoreVertIcon from '@mui/icons-material/MoreVert';
  import * as XLSX from "xlsx";
  import { saveAs } from "file-saver";
  import React from 'react';
  
  export function CustomToolbar({ rows, columns, apiRef }: { rows: any[], columns: any[], apiRef: any }) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
  console.log(apiRef)
    const handleMenu = (event: any) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
  
    const handleExportExcel = () => {
      const visibleColumns = columns.map(col => col.field);
      const data = rows.map(row =>
        visibleColumns.reduce((acc, field) => {
          acc[field] = row[field];
          return acc;
        }, {})
      );
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, "leads.xlsx");
      handleClose();
    };
  
    return (
        <Toolbar>
        <GridToolbarQuickFilter />
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <IconButton size="small" onClick={handleMenu}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
      
          <MenuItem onClick={handleExportExcel}>Exportar Excel</MenuItem>
        </Menu>
      </Toolbar>
    );
  }
  