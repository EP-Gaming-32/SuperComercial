// frontend/components/relatorios/ProdutosVencidos.js
"use client";

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card'; // Importa seu componente Card (frontend/components/relatorios/Card.js)
import useChartData, { fetchFiliais } from '@/hooks/useChartData'; // Importa o hook e a função de buscar filiais

export default function ProdutosVencidos() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);

  const [selectedFilialId, setSelectedFilialId] = useState(''); // Estado para o filtro de filial

  // Usa o hook customizado para buscar os dados do gráfico
  // endpoint: '/relatorios/produtos/vencidos-danificados' (ou como você configurar no backend)
  // params: Condicionalmente inclui id_filial se um for selecionado
  const { data, loading, error, setParams } = useChartData(
    '/relatorios/produtos/vencidos-danificados', // <--- AJUSTE ESTE ENDPOINT SE NECESSÁRIO
    selectedFilialId ? { id_filial: selectedFilialId } : {}
  );

  // Carrega a lista de filiais uma vez ao montar o componente
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
    const newFilialId = event.target.value;
    setSelectedFilialId(newFilialId);
    // O useChartData já reagirá à mudança de selectedFilialId (via 'params') e fará a nova busca
    // Não é necessário chamar setParams explicitamente aqui, pois selectedFilialId já é uma dependência dos params do hook
  };

  // processedData agora só é acessado dentro da condição que verifica se 'data' existe e é um array.
  // Não precisamos de uma variável 'processedData' separada no escopo superior.

  return (
    <Card title="Produtos Vencidos/Danificados por Loja">
      {/* Seletor de Filial */}
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
          {/* Renderização condicional para o estado de carregamento/erro das filiais */}
          {filiaisLoading ? (
            <MenuItem disabled><CircularProgress size={20} /></MenuItem>
          ) : filiaisError ? (
            <MenuItem disabled><Typography color="error">{filiaisError}</Typography></MenuItem>
          ) : (
            filiais.map((filial) => (
              <MenuItem key={filial.id} value={filial.id}>
                {filial.nome}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      {/* Renderização condicional para o estado de carregamento/erro dos dados do gráfico */}
      {(loading || filiaisLoading) ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      ) : (error || filiaisError) ? (
        <Alert severity="error">{error || filiaisError.message}</Alert> // Garante que a mensagem de erro seja exibida
      ) : (!data || data.length === 0) ? ( // Verifica se 'data' é nulo/undefined ou um array vazio
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="body1" color="text.secondary">
            Nenhum dado disponível para os filtros selecionados.
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%"> {/* Altura 100% para preencher o Card content */}
          <BarChart
            data={data} // Usa 'data' diretamente, pois sabemos que é um array aqui
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome_filial" /> {/* Usa 'nome_filial' que vem do seu backend */}
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="vencidos" stackId="a" fill="#FF4D4D" name="Vencidos" />
            <Bar dataKey="danificados" stackId="a" fill="#FFA64D" name="Danificados" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
