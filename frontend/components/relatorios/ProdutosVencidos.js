// frontend/components/relatorios/ProdutosVencidos.js
"use client";

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData';

export default function ProdutosVencidos() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);
  const [selectedFilialId, setSelectedFilialId] = useState('');

  const { data, loading, error } = useChartData(
    '/relatorios/produtos/vencidos-danificados',
    selectedFilialId ? { id_filial: selectedFilialId } : {}
  );

  useEffect(() => {
    const getFiliais = async () => {
      setFiliaisLoading(true);
      setFiliaisError(null);
      try {
        const result = await fetchFiliais();
        setFiliais(result);
      } catch (err) {
        setFiliaisError(err.message);
      } finally {
        setFiliaisLoading(false);
      }
    };
    getFiliais();
  }, []);

  const handleFilialChange = (event) => {
    setSelectedFilialId(event.target.value);
  };

  return (
    <Card title="Produtos Vencidos/Danificados por Loja">
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="filial-select-label">Filial</InputLabel>
        <Select
          labelId="filial-select-label"
          id="filial-select"
          value={selectedFilialId}
          label="Filial"
          onChange={handleFilialChange}
        >
          <MenuItem value="">
            <em>Todas as Filiais</em>
          </MenuItem>
          {filiaisLoading ? (
            <MenuItem disabled><CircularProgress size={20} /></MenuItem>
          ) : filiaisError ? (
            <MenuItem disabled>
              <Typography color="error">{filiaisError}</Typography>
            </MenuItem>
          ) : (
            filiais.map((filial) => (
              <MenuItem key={filial.id} value={filial.id}>
                {filial.nome}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      {(loading || filiaisLoading) ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Box>
      ) : (error || filiaisError) ? (
        <Alert severity="error">{error || filiaisError}</Alert>
      ) : (!data || data.length === 0) ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <Typography variant="body1" color="text.secondary">
            Nenhum dado disponível para os filtros selecionados.
          </Typography>
        </Box>
      ) : (
        // Envolvemos o ResponsiveContainer em uma div de altura fixa
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome_filial" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="vencidos" stackId="a" fill="#FF4D4D" name="Vencidos" />
              <Bar dataKey="danificados" stackId="a" fill="#FFA64D" name="Danificados" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}