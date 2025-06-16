// frontend/components/relatorios/FilialVisual.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"; // Usando BarChart, ajuste se for outro tipo
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData'; // Importa o hook e a função de buscar filiais

export default function FilialVisual() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);

  const [selectedFilialId, setSelectedFilialId] = useState(''); // Se o relatório tiver filtro de filial

  // Endpoint para este visual - você não forneceu um específico para 'FilialVisual'
  // Vou assumir que 'FilialVisual' é para mostrar alguma métrica da filial, talvez o número de pedidos por filial,
  // ou o valor total de pedidos por filial. Vou usar 'relatorioPedidosPorFilial' para exemplo.
  // SE ESTE NÃO FOR O RELATÓRIO QUE VOCÊ QUER, VOCÊ PRECISARÁ AJUSTAR O ENDPOINT E OS dataKeys.
  const { data, loading, error } = useChartData(
    '/relatorios/pedidos-por-filial', // Exemplo: relatorioPedidosPorFilial
    selectedFilialId ? { id_filial: selectedFilialId } : {}
  );

  // Carrega a lista de filiais
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

  // Processa os dados para o formato do gráfico
  // relatorioPedidosPorFilial retorna: { mes, id_filial, nome_filial, total_pedidos, valor_total_pedidos }
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Para este visual, vamos mostrar o valor total de pedidos por filial.
    // Se o filtro 'Todas as Filiais' estiver ativo, agregamos por filial.
    // Se uma filial específica estiver selecionada, mostramos os dados mensais para essa filial.
    if (!selectedFilialId) {
        // Se 'Todas as Filiais' selecionado, agregamos os totais por filial
        const aggregated = {};
        data.forEach(item => {
            if (!aggregated[item.id_filial]) {
                aggregated[item.id_filial] = {
                    nome_filial: item.nome_filial,
                    valor_total_pedidos: 0,
                    total_pedidos: 0
                };
            }
            aggregated[item.id_filial].valor_total_pedidos += item.valor_total_pedidos;
            aggregated[item.id_filial].total_pedidos += item.total_pedidos;
        });
        return Object.values(aggregated);
    } else {
        // Se uma filial específica selecionada, mostramos os dados mensais dela
        // Aqui, precisamos ajustar para que o XAxis use 'mes'
        return data.filter(item => item.id_filial === parseInt(selectedFilialId));
    }

  }, [data, selectedFilialId]);

  // Gerencia a mensagem de erro
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  return (
    <Card title="Visual de Filiais (Pedidos por Filial)">
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
            Nenhum dado disponível para este visual.
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            {selectedFilialId ? (
                <XAxis dataKey="mes" /> // Se uma filial específica for selecionada, mostramos por mês
            ) : (
                <XAxis dataKey="nome_filial" /> // Se 'Todas as Filiais', mostramos por filial
            )}
            <YAxis label={{ value: "Valor Total (R$)", angle: -90, position: "insideLeft", fontSize: 10 }} />
            <Tooltip formatter={(value, name) => [`R$ ${value.toFixed(2)}`, "Valor Total"]} />
            <Legend />
            <Bar dataKey="valor_total_pedidos" fill="#8884d8" name="Valor Total de Pedidos" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
