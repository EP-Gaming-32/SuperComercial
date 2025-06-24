// frontend/components/relatorios/PrevisaoRupturaEstoque.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ScatterChart, Scatter
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert, Chip, Tabs, Tab } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

// Tooltip customizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{data.nome_produto}</p>
        <p style={{ margin: 0, color: '#4facfe' }}>
          {`Estoque Atual: ${data.estoque_atual} un.`}
        </p>
        <p style={{ margin: 0, color: '#fa709a' }}>
          {`Vendas/Dia: ${data.vendas_diarias} un.`}
        </p>
        <p style={{ margin: 0, color: '#ff4757' }}>
          {`Dias para Ruptura: ${data.dias_para_ruptura}`}
        </p>
        <p style={{ margin: 0, color: '#43e97b' }}>
          {`Valor em Risco: R$ ${data.valor_risco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        </p>
        <div style={{ marginTop: '0.5rem' }}>
          <Chip 
            label={data.urgencia.toUpperCase()} 
            size="small" 
            style={{ 
              backgroundColor: data.cor_urgencia, 
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

// Tooltip para scatter plot
const CustomScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{data.nome_produto}</p>
        <p style={{ margin: 0, color: '#4facfe' }}>
          {`Estoque: ${data.x} dias`}
        </p>
        <p style={{ margin: 0, color: '#fa709a' }}>
          {`Vendas: ${data.y} un/dia`}
        </p>
        <p style={{ margin: 0, color: '#43e97b' }}>
          {`Valor: R$ ${data.valor_risco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function PrevisaoRupturaEstoque() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);
  const [selectedFilialId, setSelectedFilialId] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Usa o hook useChartData para buscar os dados de previsão de ruptura
  const chartParams = React.useMemo(() => {
    return selectedFilialId ? { id_filial: selectedFilialId } : {};
  }, [selectedFilialId]);
  
  const { data, loading, error, setParams, refetch } = useChartData(
    '/relatorios/estoque-alertas',
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

  // Processa os dados para o formato esperado pelo gráfico
  const processedData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    return data.map(item => {
      const estoqueAtual = parseInt(item.estoque_atual || 0);
      const vendasDiarias = parseFloat(item.vendas_diarias || 0);
      const diasParaRuptura = vendasDiarias > 0 ? Math.floor(estoqueAtual / vendasDiarias) : 999;
      
      // Determina urgência baseada nos dias para ruptura
      let urgencia = 'normal';
      let corUrgencia = '#43e97b';
      
      if (diasParaRuptura <= 3) {
        urgencia = 'critica';
        corUrgencia = '#ff4757';
      } else if (diasParaRuptura <= 7) {
        urgencia = 'alta';
        corUrgencia = '#fa709a';
      } else if (diasParaRuptura <= 15) {
        urgencia = 'media';
        corUrgencia = '#fee140';
      }
      
      return {
        nome_produto: item.nome_produto,
        estoque_atual: estoqueAtual,
        vendas_diarias: vendasDiarias,
        dias_para_ruptura: diasParaRuptura > 365 ? 365 : diasParaRuptura,
        urgencia,
        cor_urgencia: corUrgencia,
        valor_risco: parseFloat(item.valor_risco || 0),
        nome_filial: item.nome_filial,
        // Para scatter plot
        x: diasParaRuptura > 365 ? 365 : diasParaRuptura,
        y: vendasDiarias,
        z: parseFloat(item.valor_risco || 0)
      };
    }).sort((a, b) => a.dias_para_ruptura - b.dias_para_ruptura);
  }, [data]);

  // Filtra dados por urgência para diferentes visualizações
  const dadosPorUrgencia = React.useMemo(() => {
    const criticos = processedData.filter(item => item.urgencia === 'critica');
    const altos = processedData.filter(item => item.urgencia === 'alta');
    const medios = processedData.filter(item => item.urgencia === 'media');
    
    return {
      criticos: criticos.slice(0, 10), // Top 10 mais críticos
      altos: altos.slice(0, 10),
      medios: medios.slice(0, 10),
      todos: processedData.slice(0, 15) // Top 15 geral
    };
  }, [processedData]);

  // Dados para scatter plot (estoque vs vendas)
  const scatterData = React.useMemo(() => {
    return processedData.slice(0, 20).map(item => ({
      ...item,
      fill: item.cor_urgencia
    }));
  }, [processedData]);

  // Gerencia a mensagem de erro
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  // Calcular estatísticas para o resumo
  const summaryStats = React.useMemo(() => {
    if (!processedData || processedData.length === 0) return null;
    
    const criticos = processedData.filter(item => item.urgencia === 'critica').length;
    const altos = processedData.filter(item => item.urgencia === 'alta').length;
    const medios = processedData.filter(item => item.urgencia === 'media').length;
    
    const valorRiscoTotal = processedData.reduce((sum, item) => sum + item.valor_risco, 0);
    const mediaRuptura = processedData.reduce((sum, item) => sum + item.dias_para_ruptura, 0) / processedData.length;
    
    const produtoMaisCritico = processedData.find(item => item.urgencia === 'critica');
    
    return {
      totalProdutos: processedData.length,
      produtosCriticos: criticos,
      produtosAltos: altos,
      produtosMedios: medios,
      valorRiscoTotal,
      mediaRuptura,
      produtoMaisCritico: produtoMaisCritico?.nome_produto || 'N/A',
      diasMaisCritico: produtoMaisCritico?.dias_para_ruptura || 0
    };
  }, [processedData]);

  if (loading || filiaisLoading) {
    return (
      <Card title="Previsão de Ruptura de Estoque">
        <div className={styles.modernContainer}>
          <div className={styles.modernLoading}>
            <div className={styles.modernSpinner}></div>
            <span className={styles.modernLoadingText}>Calculando previsões...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card title="Previsão de Ruptura de Estoque">
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
    <Card title="Previsão de Ruptura de Estoque">
      <div className={styles.modernContainer}>
        <h2 className={styles.modernTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          Análise Preditiva de Ruptura
        </h2>

        <p className={styles.modernSubtitle}>
          Previsão de quando produtos podem ficar em falta baseado no histórico de vendas
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

        {/* Legenda de urgência */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Crítica (≤3 dias)" size="small" style={{ backgroundColor: '#ff4757', color: 'white' }} />
          <Chip label="Alta (≤7 dias)" size="small" style={{ backgroundColor: '#fa709a', color: 'white' }} />
          <Chip label="Média (≤15 dias)" size="small" style={{ backgroundColor: '#fee140', color: 'black' }} />
          <Chip label="Normal (>15 dias)" size="small" style={{ backgroundColor: '#43e97b', color: 'white' }} />
        </Box>

        {/* Tabs para diferentes visualizações */}
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Produtos Críticos" />
          <Tab label="Análise Geral" />
          <Tab label="Correlação Estoque vs Vendas" />
        </Tabs>

        <div className={styles.modernChartContainer}>
          {processedData.length === 0 ? (
            <div className={styles.modernEmpty}>
              <svg className={styles.modernEmptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span>Nenhuma previsão de ruptura disponível para os filtros selecionados</span>
            </div>
          ) : (
            <>
              {/* Tab 0: Produtos Críticos */}
              {tabValue === 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={dadosPorUrgencia.criticos.length > 0 ? dadosPorUrgencia.criticos : dadosPorUrgencia.todos}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="nome_produto" 
                      stroke="#64748b"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#64748b" fontSize={12} label={{ value: 'Dias', angle: -90, position: 'insideLeft' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="dias_para_ruptura" 
                      radius={[4, 4, 0, 0]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {(dadosPorUrgencia.criticos.length > 0 ? dadosPorUrgencia.criticos : dadosPorUrgencia.todos).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor_urgencia} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Tab 1: Análise Geral */}
              {tabValue === 1 && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={dadosPorUrgencia.todos}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="nome_produto" 
                      stroke="#64748b"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#64748b" fontSize={12} label={{ value: 'Dias', angle: -90, position: 'insideLeft' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="dias_para_ruptura" 
                      radius={[4, 4, 0, 0]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {dadosPorUrgencia.todos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor_urgencia} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Tab 2: Scatter Plot */}
              {tabValue === 2 && (
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart
                    data={scatterData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Dias para Ruptura" 
                      stroke="#64748b"
                      fontSize={12}
                      label={{ value: 'Dias para Ruptura', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Vendas Diárias" 
                      stroke="#64748b"
                      fontSize={12}
                      label={{ value: 'Vendas/Dia', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomScatterTooltip />} />
                    <Scatter dataKey="z" fill="#4facfe">
                      {scatterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </>
          )}
        </div>

        {summaryStats && (
          <div className={styles.modernSummary}>
            <h4 className={styles.modernSummaryTitle}>Resumo da Previsão</h4>
            <div className={styles.modernSummaryGrid}>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Produtos Críticos:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#ff4757' }}>
                  {summaryStats.produtosCriticos}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Urgência Alta:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#fa709a' }}>
                  {summaryStats.produtosAltos}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Urgência Média:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#fee140' }}>
                  {summaryStats.produtosMedios}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Valor em Risco:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#4facfe' }}>
                  R$ {summaryStats.valorRiscoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Produto Mais Crítico:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#f093fb' }}>
                  {summaryStats.produtoMaisCritico}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Média de Ruptura:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#38f9d7' }}>
                  {summaryStats.mediaRuptura.toFixed(1)} dias
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

