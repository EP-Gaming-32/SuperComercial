// frontend/components/relatorios/EstoqueVisual.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card'; // Importa seu componente Card
import useChartData, { fetchFiliais } from '@/hooks/useChartData'; // Importa o hook e a função de buscar filiais

// Cores mais profissionais para as fatias do gráfico de pizza
const COLORS = [
  '#4CAF50', // Verde para 'normal'
  '#FFC107', // Amarelo para 'baixo'
  '#F44336', // Vermelho para 'critico'
  '#2196F3', // Azul (se houver outros status)
  '#9C27B0', // Roxo
  '#795548', // Marrom
];

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
  const processedData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    // Mapeia para garantir que 'name' e 'value' existem e para padronizar.
    // Garante que o status 'normal', 'baixo', 'critico' tenham cores consistentes.
    const order = ['normal', 'baixo', 'critico'];
    return data.sort((a,b) => order.indexOf(a.name) - order.indexOf(b.name));

  }, [data]);

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
              outerRadius="80%"
              fill="#8884d8"
              dataKey="value" // A propriedade 'value' do backend (COUNT)
              nameKey="name" // A propriedade 'name' do backend (status_estoque)
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} // Label formatado
            >
              {
                processedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    // Associa cores a status específicos para consistência visual
                    fill={
                      entry.name === 'normal' ? COLORS[0] :
                      entry.name === 'baixo' ? COLORS[1] :
                      entry.name === 'critico' ? COLORS[2] :
                      COLORS[index % COLORS.length] // Fallback para outros status
                    }
                  />
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
