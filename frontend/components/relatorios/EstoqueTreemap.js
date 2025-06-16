// frontend/components/relatorios/EstoqueTreemap.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  Tooltip,
  Legend,
  Treemap, // Treemap para visualização hierárquica
  Cell // Para customizar cores das células do Treemap
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData'; // Importa o hook e a função de buscar filiais
import styles from "./Visuals.module.css"; // Se você ainda precisar de estilos específicos do módulo

// Customização de conteúdo para o Treemap
const CustomizedContent = (props) => {
  const { depth, x, y, width, height, index, name, value, colors } = props;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[index % colors.length], // Usa cores baseadas no índice
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1),
          strokeOpacity: 1,
        }}
      />
      {width > 30 && height > 20 ? ( // Renderiza texto apenas se o retângulo for grande o suficiente
        <text
          x={x + width / 2}
          y={y + height / 2 + 7} // Centraliza verticalmente
          textAnchor="middle"
          fill="#fff"
          fontSize={depth === 1 ? 16 : 12} // Fonte maior para níveis mais altos
        >
          {name}
        </text>
      ) : null}
      {width > 30 && height > 20 && depth === 1 ? ( // Exibe o valor para o primeiro nível
        <text
          x={x + width / 2}
          y={y + height / 2 - 10} // Acima do nome
          textAnchor="middle"
          fill="#fff"
          fontSize={10}
        >
          ({value})
        </text>
      ) : null}
    </g>
  );
};


export default function EstoqueTreemap() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);

  const [selectedFilialId, setSelectedFilialId] = useState(''); // Estado para o filtro de filial

  // Usa o hook useChartData para buscar os dados de estoque por filial (detalhado por produto)
  // O endpoint é /api/relatorios/estoque-por-filial
  const chartParams = selectedFilialId ? { id_filial: selectedFilialId } : {};
  const { data, loading, error } = useChartData(
    '/relatorios/estoque-por-filial', // Endpoint correto para estoque detalhado por filial
    chartParams
  );

  // Cores para o Treemap (ajuste conforme sua paleta)
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#AF19FF', '#FF0000', '#00FFFF', '#0000FF'];

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

  const handleFilialChange = useCallback((event) => {
    setSelectedFilialId(event.target.value);
  }, []);

  // Prepara os dados para o Treemap
  // O backend relatorioEstoquePorFilial retorna: { nome_filial, nome_produto, quantidade }
  // O Treemap precisa de uma estrutura hierárquica: { name, children: [{ name, size }] } ou { name, value }
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Agrupa por filial primeiro (se não estiver filtrado por uma única filial)
    const groupedByFilial = data.reduce((acc, item) => {
      const filialName = item.nome_filial;
      if (!acc[filialName]) {
        acc[filialName] = { name: filialName, children: [] };
      }
      // Adiciona produtos como filhos
      acc[filialName].children.push({ name: item.nome_produto, size: item.quantidade });
      return acc;
    }, {});

    // Se uma filial foi selecionada, mostra apenas os produtos dessa filial
    // Se 'Todas as Filiais' está selecionado, o Treemap terá um nível de 'Filial' e depois 'Produtos'
    const treemapData = Object.values(groupedByFilial).map(filial => {
        // Se há apenas uma filial ou se o filtro está ativo, mostre os produtos diretamente
        if (selectedFilialId && Object.keys(groupedByFilial).length === 1) {
            return {
                name: filial.name, // Nome da filial como root
                children: filial.children, // Produtos como filhos diretos
            };
        } else {
            // Se 'Todas as Filiais', agrupa tudo em um único root para visualizar
            return filial; // Mantém a estrutura com children
        }
    });

    // Se não há filtro de filial ou se o objetivo é um Treemap global
    // O Treemap funciona melhor com uma hierarquia raiz -> filhos
    // Vamos criar uma raiz "Estoque Total" se não houver filtro de filial.
    if (!selectedFilialId && treemapData.length > 1) {
        return [{
            name: "Estoque Total",
            children: treemapData.map(filial => ({
                name: filial.name,
                children: filial.children,
            }))
        }];
    } else {
        return treemapData;
    }

  }, [data, selectedFilialId]); // Recalcula se 'data' ou 'selectedFilialId' mudar

  // Gerencia a mensagem de erro para exibição no Alert
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  return (
    <Card title="Estoque por Filial (Detalhado)">
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
            Nenhum dado disponível para este relatório.
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={processedData}
            dataKey="size" // O valor para determinar o tamanho do retângulo
            aspectRatio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
            content={<CustomizedContent colors={COLORS} />}
          >
            <Tooltip />
          </Treemap>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
