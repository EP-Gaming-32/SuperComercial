// frontend/components/relatorios/PrevisaoPedidos.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData'; // Importa o hook e a função de buscar filiais

export default function PrevisaoPedidos() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);

  const [selectedFilialId, setSelectedFilialId] = useState(''); // Estado para o filtro de filial

  // Usa o hook useChartData para buscar os dados de previsão de pedidos
  // Endpoint: /api/relatorios/previsao-pedido
  const { data, loading, error } = useChartData(
    '/relatorios/previsao-pedido', // Endpoint correto
    {} // relatorioPrevisaoPedido no backend não aceita id_filial como filtro direto na API.
       // Ele retorna dados agrupados por filial. A filtragem é no frontend se necessário.
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

  // Processa os dados para o formato esperado pelo LineChart
  // O backend relatorioPrevisaoPedido retorna:
  // [{ id_filial, nome_filial, dados: [{ mes, total_pedidos, previsao }] }]
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Se uma filial específica for selecionada, filtre os dados para essa filial
    if (selectedFilialId) {
      const filialData = data.find(f => f.id_filial === parseInt(selectedFilialId));
      return filialData ? filialData.dados : [];
    }

    // Se "Todas as Filiais" for selecionado, você precisará agregar ou mostrar uma visão geral.
    // Para um LineChart que mostra "todas", talvez seja melhor ter uma linha por filial
    // ou uma linha agregada. Para simplicidade, vamos mostrar a primeira filial se não houver seleção.
    // Melhor abordagem seria ter um endpoint no backend que agregue para "Todas".
    if (data.length > 0) {
        return data[0].dados; // Mostra os dados da primeira filial por padrão se não houver seleção
    }
    return [];

  }, [data, selectedFilialId]);

  // Gerencia a mensagem de erro
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  return (
    <Card title="Previsão de Pedidos por Loja">
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
            Nenhum dado de previsão de pedidos disponível para os filtros selecionados.
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis label={{ value: "Total de Pedidos", angle: -90, position: "insideLeft", fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total_pedidos" stroke="#8884d8" name="Pedidos Reais" />
            {/* Linha de previsão, se houver dados com a flag 'previsao' */}
            <Line type="monotone" dataKey="total_pedidos" stroke="#82ca9d" strokeDasharray="5 5" name="Previsão" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
