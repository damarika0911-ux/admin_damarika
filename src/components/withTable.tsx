import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import React, { useState } from "react";
import GlobalLoader from "../utils/loader";

interface TableData {
  id: string | number;
  [key: string]: any;
}

interface WithTableProps<T extends TableData> {
  data: T[];
  columns: GridColDef[];
  title: string;
  isLoading?: boolean;
  showSearch?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  searchFields?: string[];
  onRowClick?: (params: any) => void;
  headerActions?: React.ReactNode;
}

const CustomNoRowsOverlay = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      gap: 1,
    }}
  >
    <Typography variant="body1" color="text.secondary" fontWeight={500}>
      No data found
    </Typography>
    <Typography variant="caption" color="text.disabled">
      Try adjusting your search or filters
    </Typography>
  </Box>
);

const withTable = <T extends TableData>(
  WrappedComponent: React.ComponentType<any>
) => {
  return function TableWithPagination(props: WithTableProps<T>) {
    const {
      data,
      columns,
      title,
      isLoading = false,
      showSearch = true,
      defaultPageSize = 5,
      pageSizeOptions = [5, 10, 25],
      searchFields = [],
      onRowClick,
      headerActions,
      ...rest
    } = props;

    const [searchTerm, setSearchTerm] = useState("");
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(
      {
        page: 0,
        pageSize: defaultPageSize,
      }
    );

    const filteredData = React.useMemo(() => {
      if (!searchTerm || searchTerm.trim() === "") return data;
      const searchLower = searchTerm.toLowerCase();
      return data.filter((item) => {
        if (searchFields.length > 0) {
          return searchFields.some((field) => {
            const value = item[field];
            return value && String(value).toLowerCase().includes(searchLower);
          });
        }
        return Object.entries(item).some(([_, value]) => {
          return (
            (typeof value === "string" || typeof value === "number") &&
            String(value).toLowerCase().includes(searchLower)
          );
        });
      });
    }, [data, searchTerm, searchFields]);

    const handlePaginationModelChange = (newModel: GridPaginationModel) => {
      setPaginationModel(newModel);
    };

    return (
      <>
        <GlobalLoader isLoading={isLoading} />
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              borderBottom: "1px solid",
              borderColor: "grey.100",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography
                variant="h6"
                sx={{ fontSize: "1.05rem", fontWeight: 600, color: "#1a1a2e" }}
              >
                {title}
              </Typography>
              <Chip
                label={filteredData.length}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  bgcolor: "#8B4513/10",
                  color: "#8B4513",
                  backgroundColor: "rgba(139, 69, 19, 0.08)",
                }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {showSearch && (
                <TextField
                  placeholder="Search..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2.5,
                      fontSize: "0.85rem",
                      bgcolor: "#F7F8FA",
                      "& fieldset": { borderColor: "transparent" },
                      "&:hover fieldset": { borderColor: "grey.300" },
                      "&.Mui-focused fieldset": { borderColor: "#8B4513", borderWidth: 1.5 },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: "grey.400" }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm("")}
                          edge="end"
                        >
                          <ClearIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              {headerActions}
            </Box>
          </Box>

          {/* Table */}
          <Paper sx={{ width: "100%", boxShadow: "none" }}>
            <DataGrid
              rows={filteredData.filter((row) => row.id !== undefined)}
              getRowId={(row) => row.id}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
              pageSizeOptions={pageSizeOptions}
              onRowClick={onRowClick}
              disableRowSelectionOnClick={!onRowClick}
              autoHeight
              sx={{
                border: 0,
                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: "#F9FAFB",
                  borderBottom: "1px solid",
                  borderColor: "grey.100",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                },
                "& .MuiDataGrid-row": {
                  "&:hover": {
                    bgcolor: "rgba(139, 69, 19, 0.02)",
                  },
                },
                "& .MuiDataGrid-cell": {
                  fontSize: "0.85rem",
                  borderBottom: "1px solid",
                  borderColor: "grey.50",
                  py: 1,
                },
                "& .MuiDataGrid-footerContainer": {
                  borderTop: "1px solid",
                  borderColor: "grey.100",
                },
              }}
              slots={{
                noRowsOverlay: CustomNoRowsOverlay,
              }}
            />
          </Paper>
          <WrappedComponent data={filteredData} {...rest} />
        </Box>
      </>
    );
  };
};

export default withTable;
