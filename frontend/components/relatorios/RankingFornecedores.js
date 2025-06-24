// frontend/components/relatorios/RankingFornecedores.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ScatterChart, Scatter, Cell
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert, Tabs, Tab, Chip } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

// Componente de tooltip customizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{data.nome_fornecedor}</p>
        <p style={{ margin: 0, color: '#43e97b' }}>
          {`Nota Média: ${data.nota_media.toFixed(1)}/5.0`}
        </p>
        <p style={{ margin: 0, color: '#4facfe' }}>
          {`Total de Pedidos: ${data.total_pedidos}`}
        </p>
        <p style={{ margin: 0, color: '#f093fb' }}>
          {`Valor Total: R$ ${data.valor_total.toFixed(2)}`}
        </p>
        <p style={{ margin: 0, color: '#fa709a', fontSize: '0.75rem' }}>
          {`Prazo Médio: ${data.prazo_medio_entrega} dias`}
        </p>
        <div style={{ marginTop: '0.5rem' }}>
          <Chip 
            label={data.classificacao} 
            size="small" 
            style={{ 
              backgroundColor: data.cor_classificacao, 
              color: 'white',
              fontSize: '0.7rem'
            }} 
          />
        </div>
      </div>
    );
  }
  return null;
};

// Função para classificar fornecedores
const classificarFornecedor = (nota, totalPedidos, prazoMedio) => {
  if (nota >= 4.5 && totalPedidos >= 10 && prazoMedio <= 7) {
    return { classificacao: 'Excelente', cor: '#43e97b' };
  } else if (nota >= 4.0 && totalPedidos >= 5 && prazoMedio <= 10) {
    return { classificacao: 'Muito Bom', cor: '#4facfe' };
  } else if (nota >= 3.5 && totalPedidos >= 3 && prazoMedio <= 15) {
    return { classificacao: 'Bom', cor: '#f093fb' };
  } else if (nota >= 3.0) {
    return { classificacao: 'Regular', cor: '#fa709a' };
  } else {
    return { classificacao: 'Ruim', cor: '#ff4757' };
  }
};

export default function RankingFornecedores() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);
  const [selectedFilialId, setSelectedFilialId] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Usa o hook useChartData para buscar os dados de ranking de fornecedores
  const chartParams = React.useMemo(() => {
    return selectedFilialId ? { id_filial: selectedFilialId } : {};
  }, [selectedFilialId]);
  
  const { data, loading, error, setParams, refetch } = useChartData(
    '/relatorios/fornecedores-por-filial',
    chartParams
  );

  // Recarrega dados quando a filial selecionada muda
  useEffect(() => {
    if (refetch) {
      refetch();
    }
  }, [selectedFilialId, refetch]);

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

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  // Processa os dados para o formato esperado pelos gráficos
  const processedData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    return data.map(item => {
      const classificacao = classificarFornecedor(
        parseFloat(item.nota_media || 0),
        parseInt(item.total_pedidos || 0),
        parseInt(item.prazo_medio_entrega || 0)
      );
      
      return {
        ...item,
        nota_media: parseFloat(item.nota_media || 0),
        total_pedidos: parseInt(item.total_pedidos || 0),
        valor_total: parseFloat(item.valor_total || 0),
        prazo_medio_entrega: parseInt(item.prazo_medio_entrega || 0),
        classificacao: classificacao.classificacao,
        cor_classificacao: classificacao.cor,
        score_geral: (parseFloat(item.nota_media || 0) * 0.4) + 
                    (Math.min(parseInt(item.total_pedidos || 0), 20) * 0.3) + 
                    (Math.max(0, 20 - parseInt(item.prazo_medio_entrega || 0)) * 0.3)
      };
    }).sort((a, b) => b.score_geral - a.score_geral);
  }, [data]);

  // Gerencia a mensagem de erro
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  // Calcular estatísticas para o resumo
  const summaryStats = React.useMemo(() => {
    if (!processedData || processedData.length === 0) return null;
    
    const notaMediaGeral = processedData.reduce((sum, item) => sum + item.nota_media, 0) / processedData.length;
    const totalPedidosGeral = processedData.reduce((sum, item) => sum + item.total_pedidos, 0);
    const valorTotalGeral = processedData.reduce((sum, item) => sum + item.valor_total, 0);
    const prazoMedioGeral = processedData.reduce((sum, item) => sum + item.prazo_medio_entrega, 0) / processedData.length;
    
    const melhorFornecedor = processedData[0];
    const fornecedoresExcelentes = processedData.filter(f => f.classificacao === 'Excelente').length;
    
    return {
      notaMediaGeral,
      totalPedidosGeral,
      valorTotalGeral,
      prazoMedioGeral,
      melhorFornecedor: melhorFornecedor?.nome_fornecedor || 'N/A',
      fornecedoresExcelentes,
      totalFornecedores: processedData.length
    };
  }, [processedData]);

  if (loading || filiaisLoading) {
    return (
      <Card title="Ranking de Fornecedores">
        <div className={styles.modernContainer}>
          <div className={styles.modernLoading}>
            <div className={styles.modernSpinner}></div>
            <span className={styles.modernLoadingText}>Carregando ranking de fornecedores...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card title="Ranking de Fornecedores">
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
    <Card title="Ranking de Fornecedores">
      <div className={styles.modernContainer}>
        <h2 className={styles.modernTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <path d="M20 8v6M23 11l-3 3-3-3"/>
          </svg>
          Performance de Fornecedores
        </h2>

        <p className={styles.modernSubtitle}>
          Ranking baseado em avaliações, pontualidade e volume de negócios
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

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Score Geral" />
          <Tab label="Nota vs Volume" />
        </Tabs>

        <div className={styles.modernChartContainer}>
          {processedData.length === 0 ? (
            <div className={styles.modernEmpty}>
              <svg className={styles.modernEmptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <path d="M20 8v6M23 11l-3 3-3-3"/>
              </svg>
              <span>Nenhum dado de fornecedor disponível para os filtros selecionados</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              {tabValue === 0 ? (
                <BarChart data={processedData.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    {processedData.slice(0, 10).map((item, index) => (
                      <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={item.cor_classificacao} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={item.cor_classificacao} stopOpacity={0.3}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="nome_fornecedor" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    label={{ value: "Score Geral", angle: -90, position: "insideLeft", fontSize: 10 }}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score_geral" radius={[8, 8, 0, 0]}>
                    {processedData.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <ScatterChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis 
                    type="number"
                    dataKey="total_pedidos"
                    name="Total de Pedidos"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    type="number"
                    dataKey="nota_media"
                    name="Nota Média"
                    domain={[0, 5]}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter name="Fornecedores" fill="#4facfe">
                    {processedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor_classificacao} />
                    ))}
                  </Scatter>
                </ScatterChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {summaryStats && (
          <div className={styles.modernSummary}>
            <h4 className={styles.modernSummaryTitle}>Resumo do Ranking</h4>
            <div className={styles.modernSummaryGrid}>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Nota Média Geral:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#43e97b' }}>
                  {summaryStats.notaMediaGeral.toFixed(1)}/5.0
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Total de Pedidos:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#4facfe' }}>
                  {summaryStats.totalPedidosGeral}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Valor Total:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#f093fb' }}>
                  R$ {summaryStats.valorTotalGeral.toFixed(2)}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Prazo Médio:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#fa709a' }}>
                  {summaryStats.prazoMedioGeral.toFixed(1)} dias
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Melhor Fornecedor:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#38f9d7' }}>
                  {summaryStats.melhorFornecedor}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Fornecedores Excelentes:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#667eea' }}>
                  {summaryStats.fornecedoresExcelentes} de {summaryStats.totalFornecedores}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

