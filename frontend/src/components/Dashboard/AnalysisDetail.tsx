import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { getAnalysis } from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalysisDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await getAnalysis(Number(id));
        setAnalysis(response.data);
      } catch (error) {
        console.error('Error fetching analysis:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!analysis) return <div>Analysis not found</div>;

  const headingsData = analysis.headings.map((h: any) => ({
    name: `H${h.level}`,
    value: h.count
  }));

  const linksData = [
    { name: 'Internal', value: analysis.links.filter((l: any) => l.is_internal).length },
    { name: 'External', value: analysis.links.filter((l: any) => !l.is_internal).length },
    { name: 'Broken', value: analysis.links.filter((l: any) => l.is_inaccessible).length }
  ];

  const brokenLinks = analysis.links.filter((l: any) => l.is_inaccessible);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analysis for {analysis.url}
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="h6">HTML Version</Typography>
          <Typography>{analysis.html_version || 'Unknown'}</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="h6">Title</Typography>
          <Typography>{analysis.title || 'No title'}</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="h6">Login Form</Typography>
          <Typography>{analysis.login_form ? 'Yes' : 'No'}</Typography>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Paper sx={{ p: 2, width: '100%', maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>Headings Distribution</Typography>
          <PieChart width={400} height={300}>
            <Pie
              data={headingsData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {headingsData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </Paper>

        <Paper sx={{ p: 2, width: '100%', maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>Links Distribution</Typography>
          <BarChart
            width={400}
            height={300}
            data={linksData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </Paper>
      </Box>

      {brokenLinks.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" gutterBottom>Broken Links</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>URL</TableCell>
                  <TableCell>Status Code</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {brokenLinks.map((link: any) => (
                  <TableRow key={link.id}>
                    <TableCell>{link.url}</TableCell>
                    <TableCell>{link.status_code}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default AnalysisDetail;
