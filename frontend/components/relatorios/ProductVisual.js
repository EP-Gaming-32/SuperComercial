// frontend/components/relatorios/ProductVisual.js
"use client";

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

// Componente de tooltip customizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, color: data.color }}>
          {`Estoque: ${data.value} unidades`}
        </p>
        {data.value < 10 && (
          <p style={{ margin: 0, color: '#ff4757', fontSize: '0.75rem' }}>
            ⚠️ Estoque baixo
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Cores modernas para as barras
const MODERN_COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#4facfe', 
  '#43e97b', '#fa709a', '#38f9d7', '#fee140'
];

export default function ProductVisual() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);
  const [selectedFilialId, setSelectedFilialId] = useState('');

  // Usa o hook customizado para buscar os dados específicos deste visual
  const chartParams = React.useMemo(() => {
    return selectedFilialId ? { id_filial: selectedFilialId } : {};
  }, [selectedFilialId]);
  
  const { data, loading, error, setParams, refetch } = useChartData(
    '/relatorios/estoque-por-produto',
    chartParams
  );

  // Recarrega dados quando a filial selecionada muda
  useEffect(() => {
    if (refetch) {
      refetch();
    } else if (setParams) {
      setParams(chartParams);
    }
  }, [selectedFilialId, refetch, setParams, chartParams]);

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

  const handleFilialChange = (event) => {
    setSelectedFilialId(event.target.value);
  };

  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  // Processa os dados para adicionar cores e informações extras
  const processedData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item, index) => ({
      ...item,
      color: MODERN_COLORS[index % MODERN_COLORS.length],
      isLowStock: item.estoque_quantidade < 10
    }));
  }, [data]);

  // Calcular estatísticas para o resumo
  const summaryStats = React.useMemo(() => {
    if (!processedData || processedData.length === 0) return null;
    
    const totalProdutos = processedData.length;
    const totalEstoque = processedData.reduce((sum, item) => sum + item.estoque_quantidade, 0);
    const produtosBaixoEstoque = processedData.filter(item => item.isLowStock).length;
    const mediaEstoque = Math.round(totalEstoque / totalProdutos);
    const maiorEstoque = Math.max(...processedData.map(item => item.estoque_quantidade));
    const menorEstoque = Math.min(...processedData.map(item => item.estoque_quantidade));
    
    return {
      totalProdutos,
      totalEstoque,
      produtosBaixoEstoque,
      mediaEstoque,
      maiorEstoque,
      menorEstoque,
      percentualBaixoEstoque: ((produtosBaixoEstoque / totalProdutos) * 100).toFixed(1)
    };
  }, [processedData]);

  if (loading || filiaisLoading) {
    return (
      <Card title="Visual de Produtos (Estoque por Produto)">
        <div className={styles.modernContainer}>
          <div className={styles.modernLoading}>
            <div className={styles.modernSpinner}></div>
            <span className={styles.modernLoadingText}>Carregando dados...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card title="Visual de Produtos (Estoque por Produto)">
        <div className={styles.modernContainer}>
          <div className={styles.modernError}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Visual de Produtos (Estoque por Produto)">
      <div className={styles.modernContainer}>
        <h2 className={styles.modernTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          Estoque por Produto
        </h2>

        <p className={styles.modernSubtitle}>
          Visualização detalhada do estoque disponível por produto
        </p>

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

        <div className={styles.modernChartContainer}>
          {processedData.length === 0 ? (
            <div className={styles.modernEmpty}>
              <svg className={styles.modernEmptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <span>Nenhum dado disponível para este visual</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={processedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <defs>
                  {MODERN_COLORS.map((color, index) => (
                    <linearGradient key={index} id={`productGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                      <stop offset="100%" stopColor={color} stopOpacity={0.3}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e2e8f0" 
                  strokeOpacity={0.5}
                />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  label={{
                    value: "Quantidade em Estoque",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 10,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="estoque_quantidade" 
                  name="Quantidade em Estoque"
                  radius={[6, 6, 0, 0]}
                  stroke="#667eea"
                  strokeWidth={1}
                >
                  {processedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isLowStock ? '#fa709a' : `url(#productGradient${index % MODERN_COLORS.length})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {summaryStats && (
          <div className={styles.modernSummary}>
            <h4 className={styles.modernSummaryTitle}>Resumo dos Produtos</h4>
            <div className={styles.modernSummaryGrid}>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Total de Produtos:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#667eea' }}>
                  {summaryStats.totalProdutos}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Total em Estoque:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#4facfe' }}>
                  {summaryStats.totalEstoque} unidades
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Produtos com Estoque Baixo:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#fa709a' }}>
                  {summaryStats.produtosBaixoEstoque} ({summaryStats.percentualBaixoEstoque}%)
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Média por Produto:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#43e97b' }}>
                  {summaryStats.mediaEstoque} unidades
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Maior Estoque:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#f093fb' }}>
                  {summaryStats.maiorEstoque} unidades
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Menor Estoque:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#38f9d7' }}>
                  {summaryStats.menorEstoque} unidades
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

