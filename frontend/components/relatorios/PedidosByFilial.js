// frontend/components/relatorios/PedidosByFilial.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend, // Adicionado Legend para melhor leitura do gráfico
  ResponsiveContainer,
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card'; // Importa seu componente Card
import useChartData, { fetchFiliais } from '@/hooks/useChartData'; // Importa o hook e a função de buscar filiais
// import styles from "./Visuals.module.css"; // Você pode manter se tiver estilos específicos, mas muitos serão do MUI

export default function PedidosByFilial() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);

  const [selectedFilialId, setSelectedFilialId] = useState(''); // Estado para o filtro de filial

  // Usa o hook useChartData para buscar os dados de pedidos por filial
  // Endpoint: /api/relatorios/pedidos-por-filial
  const chartParams = selectedFilialId ? { id_filial: selectedFilialId } : {};
  const { data, loading, error } = useChartData(
    '/relatorios/pedidos-por-filial', // Endpoint correto para pedidos por filial
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
        // Opcional: pré-selecionar a primeira filial se houver dados
        // if (result.length > 0) {
        //   setSelectedFilialId(result[0].id);
        // }
      } catch (err) {
        setFiliaisError(err);
      } finally {
        setFiliaisLoading(false);
      }
    };
    getFiliais();
  }, []);

  const handleFilialChange = useCallback((e) => {
    setSelectedFilialId(e.target.value);
  }, []);

  // Processa os dados para o formato esperado pelo BarChart
  // O backend relatorioPedidosPorFilial retorna: { mes, id_filial, nome_filial, total_pedidos, valor_total_pedidos }
  const processedData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    // Se "Todas as Filiais" for selecionado, agregamos por filial para ter uma barra por filial.
    // Se uma filial específica for selecionada, os dados já virão do backend filtrados por mês,
    // então a lógica de XAxis precisaria mudar (talvez para 'mes').
    // Para simplificar, vou manter o gráfico como "Total de Pedidos por Loja"
    // e o filtro fará o gráfico mostrar a filial selecionada ou todas agregadas.
    const aggregatedData = data.reduce((acc, item) => {
      if (!acc[item.id_filial]) {
        acc[item.id_filial] = {
          nome_filial: item.nome_filial,
          total_pedidos: 0,
          valor_total_pedidos: 0
        };
      }
      acc[item.id_filial].total_pedidos += item.total_pedidos;
      acc[item.id_filial].valor_total_pedidos += item.valor_total_pedidos;
      return acc;
    }, {});

    // Se uma filial específica for selecionada, o processedData já será um array com dados filtrados para essa filial,
    // mas ainda precisamos formatá-lo para que o XAxis funcione bem.
    // Se selecionada uma filial, a query retorna por mês, o que não faz sentido para um BarChart simples por Loja.
    // Vamos garantir que se o filtro for por filial, mostre apenas o total daquela filial.
    if (selectedFilialId) {
        const selectedFilial = Object.values(aggregatedData).find(f => f.id_filial === parseInt(selectedFilialId));
        return selectedFilial ? [selectedFilial] : [];
    } else {
        return Object.values(aggregatedData);
    }
  }, [data, selectedFilialId]);


  // Gerencia a mensagem de erro para exibição no Alert
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  return (
    <Card title="Relatório de Pedidos por Loja">
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
            Nenhum dado de pedidos disponível para os filtros selecionados.
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome_filial" /> {/* Exibe o nome da filial no eixo X */}
            <YAxis label={{ value: "Total de Pedidos", angle: -90, position: "insideLeft", fontSize: 10 }} allowDecimals={false} />
            <Tooltip
              formatter={(value, name) => {
                if (name === "total_pedidos") return [value, "Total de Pedidos"];
                if (name === "valor_total_pedidos") return [`R$ ${value.toFixed(2)}`, "Valor Total"];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="total_pedidos" fill="#8884d8" name="Total de Pedidos" />
            {/* Opcional: Adicionar a barra para valor_total_pedidos se quiser ambos no mesmo gráfico */}
            {/* <Bar dataKey="valor_total_pedidos" fill="#82ca9d" name="Valor Total" /> */}
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
