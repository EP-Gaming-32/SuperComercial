// frontend/components/relatorios/EstoqueVisual.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card'; // Importa seu componente Card
import useChartData, { fetchFiliais } from '@/hooks/useChartData'; // Importa o hook e a função de buscar filiais

// Cores para as fatias do gráfico de pizza
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8B008B', '#00CED1', '#FF4500'];

export default function EstoqueVisual() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);

  const [selectedFilialId, setSelectedFilialId] = useState(''); // Estado para o filtro de filial

  // Usa o hook useChartData para buscar os dados de status de estoque
  // Endpoint: /api/relatorios/status-por-estoque
  const chartParams = selectedFilialId ? { id_filial: selectedFilialId } : {};
  const { data, loading, error } = useChartData(
    '/relatorios/status-por-estoque', // Endpoint correto para status de estoque
    chartParams
  );

  // Carrega a lista de filiais usando a função compartilhada do hook
  useEffect(() => {
    const getFiliais = async () => {
      setFiliaisLoading(true);
      setFiliaisError(null);
      try {
        const result = await fetchFiliais();
        setFiliais(result);
      } catch (err) {
        setFiliaisError(err);
      } finally {
        setFiliaisLoading(false);
      }
    };
    getFiliais();
  }, []);

  const handleFilialChange = useCallback((event) => {
    setSelectedFilialId(event.target.value);
  }, []);

  // Processa os dados para o formato esperado pelo PieChart
  // O backend relatorioStatusPorEstoque retorna: { name: "status_estoque", value: COUNT }
  const processedData = data || [];

  // Gerencia a mensagem de erro para exibição no Alert
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  return (
    <Card title="Estoque - Status por Filial">
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
            <MenuItem disabled><Typography color="error">{filiaisError.message || "Erro"}</Typography></MenuItem>
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
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      ) : errorMessage ? (
        <Alert severity="error">{errorMessage}</Alert>
      ) : processedData.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="body1" color="text.secondary">
            Nenhum dado de status de estoque disponível para os filtros selecionados.
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              outerRadius="80%" // Tamanho do Pie
              fill="#8884d8"
              dataKey="value" // A propriedade 'value' do backend (COUNT)
              nameKey="name" // A propriedade 'name' do backend (status_estoque)
              labelLine={false} // Não mostra as linhas para labels
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} // Label formatado
            >
              {
                processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))
              }
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
