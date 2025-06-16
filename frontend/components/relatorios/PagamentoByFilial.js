// frontend/components/relatorios/PagamentoByFilial.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData'; // Importa o hook e a função de buscar filiais

export default function PagamentoByFilial() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);

  const [selectedFilialId, setSelectedFilialId] = useState(''); // Estado para o filtro de filial

  // Usa o hook useChartData para buscar os dados de pagamentos por filial
  // Endpoint: /api/relatorios/pagamentos-por-filial
  // Nota: A query do backend (relatorioPagamentosPorFilial) não filtra por id_filial.
  // Ela retorna todos os pagamentos agregados por filial.
  // Se quiser filtrar por filial no backend, a query precisaria ser ajustada.
  const { data, loading, error } = useChartData(
    '/relatorios/pagamentos-por-filial', // Endpoint correto
    {} // Não passamos id_filial aqui, pois a API não filtra por ele (conforme seu controller atual)
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

  // Processa os dados para o formato esperado pelo BarChart
  // O backend relatorioPagamentosPorFilial retorna: { nome_filial, total_pago, total_pagamentos }
  // Para este gráfico, vamos filtrar no frontend se uma filial específica for selecionada
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    if (selectedFilialId) {
      // Se uma filial específica for selecionada, filtra o array de dados
      // Assumindo que 'data' do backend tem id_filial (sua query de backend já seleciona f.id_filial)
      return data.filter(item => item.id_filial === parseInt(selectedFilialId));
    }
    return data; // Retorna todos os dados se 'Todas as Filiais' estiver selecionado
  }, [data, selectedFilialId]);

  // Gerencia a mensagem de erro para exibição no Alert
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  return (
    <Card title="Relatório de Pagamentos por Loja">
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
            Nenhum dado de pagamentos disponível para os filtros selecionados.
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome_filial" />
            <YAxis label={{ value: "Total Pago (R$)", angle: -90, position: "insideLeft", fontSize: 10 }} />
            <Tooltip formatter={(value, name) => [`R$ ${value.toFixed(2)}`, "Valor Pago"]} />
            <Legend />
            <Bar dataKey="total_pago" fill="#8884d8" name="Total Pago" />
            {/* Opcional: Adicionar Bar para total_pagamentos se quiser ambos */}
            {/* <Bar dataKey="total_pagamentos" fill="#82ca9d" name="Total de Pagamentos" /> */}
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
