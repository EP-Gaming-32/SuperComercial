// frontend/components/relatorios/FornecedorByFilial.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card'; // Importa seu componente Card
import useChartData, { fetchFiliais } from '@/hooks/useChartData'; // Importa o hook e a função de buscar filiais
import styles from "./Visuals.module.css"; // Se você ainda precisar de estilos específicos do módulo

export default function FornecedorByFilial() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);

  const [selectedFilialId, setSelectedFilialId] = useState(''); // Estado para o filtro de filial

  // Usa o hook useChartData para buscar os dados de fornecedores por filial
  // Endpoint: /api/relatorios/fornecedores-por-filial
  // Nota: A query do backend (relatorioFornecedoresPorFilial) não filtra por id_filial.
  // Ela retorna todos os fornecedores associados a filiais.
  // Se quiser filtrar por filial no backend, a query precisaria ser ajustada.
  // Por enquanto, o filtro no frontend será visual, não impactando a API.
  const { data, loading, error } = useChartData(
    '/relatorios/fornecedores-por-filial', // Endpoint correto
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
  // O backend relatorioFornecedoresPorFilial retorna: { nome_filial, nome_fornecedor }
  // Para este gráfico, vamos contar o número de fornecedores por filial
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    const counts = {};
    data.forEach(item => {
      // Se houver filtro de filial, só conta se a filial corresponder
      if (!selectedFilialId || item.id_filial === parseInt(selectedFilialId)) {
        counts[item.nome_filial] = (counts[item.nome_filial] || 0) + 1;
      }
    });

    return Object.keys(counts).map(filialName => ({
      filial: filialName,
      numFornecedores: counts[filialName]
    }));
  }, [data, selectedFilialId]); // Recomputa se 'data' ou 'selectedFilialId' mudar

  // Gerencia a mensagem de erro para exibição no Alert
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  return (
    <Card title="Fornecedores por Loja">
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
            Nenhum dado de fornecedores disponível para os filtros selecionados.
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="filial" /> {/* O nome da filial */}
            <YAxis allowDecimals={false} label={{ value: "Número de Fornecedores", angle: -90, position: "insideLeft", fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="numFornecedores" fill="#82ca9d" name="Fornecedores" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
