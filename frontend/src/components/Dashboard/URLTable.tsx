import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { getURLs, analyzeURL, deleteURL } from '../../services/api';

const URLTable: React.FC = () => {
  const [urls, setUrls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Search and filter state
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'url', headerName: 'URL', width: 300 },
    { field: 'status', headerName: 'Status', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <>
          <Button 
            variant="contained" 
            size="small"
            onClick={() => handleAnalyze(params.row.id)}
            disabled={params.row.status === 'processing'}
          >
            Analyze
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            size="small" 
            sx={{ ml: 1 }}
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  const fetchURLs = async () => {
    setLoading(true);
    try {
      const response = await getURLs(paginationModel.page + 1, paginationModel.pageSize);
      setUrls(response.data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (id: number) => {
    try {
      await analyzeURL(id);
      fetchURLs();
    } catch (error) {
      console.error('Error analyzing URL:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteURL(id);
      fetchURLs();
    } catch (error) {
      console.error('Error deleting URL:', error);
    }
  };

  // Bulk Actions
  const handleBulkAnalyze = async () => {
    try {
      await Promise.all(selectedIds.map(id => analyzeURL(id)));
      fetchURLs();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error in bulk analyze:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => deleteURL(id)));
      fetchURLs();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error in bulk delete:', error);
    }
  };

  // Filter URLs based on search and status filter
  const filteredUrls = urls.filter(url => {
    const matchesSearch =
      url.url.toLowerCase().includes(searchText.toLowerCase()) ||
      (url.title?.toLowerCase().includes(searchText.toLowerCase()) ?? false);
    const matchesStatus = !statusFilter || url.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchURLs();
  }, [paginationModel]);

  return (
    <Box sx={{ height: 500, width: '100%' }}>
      {/* Bulk Action Buttons and Filters */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button 
          variant="contained"
          onClick={handleBulkAnalyze}
          disabled={selectedIds.length === 0}
        >
          Analyze Selected
        </Button>
        <Button 
          variant="outlined" 
          color="error"
          onClick={handleBulkDelete}
          disabled={selectedIds.length === 0}
        >
          Delete Selected
        </Button>

        <TextField
          label="Search URLs"
          variant="outlined"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <DataGrid
        rows={filteredUrls}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection
        onRowSelectionModelChange={(newSelection) => {
          setSelectedIds(newSelection as number[]);
        }}
        rowSelectionModel={selectedIds}
        autoHeight
      />
    </Box>
  );
};

export default URLTable;

