// frontend/components/relatorios/FeedbackPedido.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"; // Exemplo, ajuste os componentes de gráfico conforme o Feedback
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData'; // Importa o hook e a função de buscar filiais

export default function FeedbackPedido() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);

  const [selectedFilialId, setSelectedFilialId] = useState(''); // Se o relatório tiver filtro de filial

  // Endpoint para este visual - você não forneceu um específico para Feedback
  // Vou assumir um endpoint genérico que talvez você precise criar no backend:
  // /api/relatorios/feedback-por-filial
  // Se o feedback estiver mais ligado a OrdemCompra do que PedidoFilial, a query do backend precisará de mais joins.
  const { data, loading, error } = useChartData(
    '/relatorios/feedback-por-filial', // <--- VOCÊ PODE PRECISAR CRIAR ESTE ENDPOINT NO BACKEND!
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
  // Este processamento é um CHUTE, pois não sei o formato do seu feedback no BD.
  // Pode ser que você queira média de nota por filial, ou contagem de feedbacks.
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Exemplo: Agrupar por filial e calcular média de nota
    const feedbackByFilial = {};
    data.forEach(item => {
      // Supondo que o item do backend tenha 'nome_filial' e 'nota'
      if (!selectedFilialId || item.id_filial === parseInt(selectedFilialId)) {
        if (!feedbackByFilial[item.nome_filial]) {
          feedbackByFilial[item.nome_filial] = { totalNotas: 0, count: 0 };
        }
        feedbackByFilial[item.nome_filial].totalNotas += item.nota;
        feedbackByFilial[item.nome_filial].count++;
      }
    });

    return Object.keys(feedbackByFilial).map(filialName => ({
      filial: filialName,
      media_nota: feedbackByFilial[filialName].totalNotas / feedbackByFilial[filialName].count
    }));

  }, [data, selectedFilialId]);

  // Gerencia a mensagem de erro
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  return (
    <Card title="Feedback de Pedidos por Loja">
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
            Nenhum dado de feedback disponível para os filtros selecionados.
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="filial" />
            <YAxis type="number" domain={[0, 5]} label={{ value: "Média de Nota", angle: -90, position: "insideLeft", fontSize: 10 }} />
            <Tooltip formatter={(value) => value.toFixed(2)} />
            <Legend />
            <Bar dataKey="media_nota" fill="#8884d8" name="Média de Nota" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
