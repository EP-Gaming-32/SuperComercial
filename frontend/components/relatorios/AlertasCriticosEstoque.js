// frontend/components/relatorios/AlertasCriticosEstoque.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert, Chip } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

// Tooltip customizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, color: '#ff4757' }}>
          {`Produtos Críticos: ${data.produtos_criticos}`}
        </p>
        <p style={{ margin: 0, color: '#fa709a' }}>
          {`Produtos Baixos: ${data.produtos_baixos}`}
        </p>
        <p style={{ margin: 0, color: '#fee140' }}>
          {`Total de Alertas: ${data.total_alertas}`}
        </p>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>
          {`Valor em Risco: R$ ${data.valor_risco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function AlertasCriticosEstoque() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);
  const [selectedFilialId, setSelectedFilialId] = useState('');

  // Usa o hook useChartData para buscar os dados de alertas críticos
  const chartParams = React.useMemo(() => {
    return selectedFilialId ? { id_filial: selectedFilialId } : {};
  }, [selectedFilialId]);
  
  const { data, loading, error, setParams, refetch } = useChartData(
    '/relatorios/estoque-alertas',
    chartParams
  );

  // Recarrega dados quando a filial selecionada muda
  useEffect(() => {
    console.log('[AlertasCriticosEstoque] Parâmetros alterados:', chartParams);
    if (setParams) {
      setParams(chartParams);
    }
  }, [chartParams, setParams]);

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

  // Processa os dados para o formato esperado pelo gráfico
  const processedData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    return data.map(item => {
      const produtosCriticos = parseInt(item.produtos_criticos || 0);
      const produtosBaixos = parseInt(item.produtos_baixos || 0);
      const totalAlertas = produtosCriticos + produtosBaixos;
      
      return {
        nome_filial: item.nome_filial || 'Sem Filial',
        produtos_criticos: produtosCriticos,
        produtos_baixos: produtosBaixos,
        total_alertas: totalAlertas,
        valor_risco: parseFloat(item.valor_risco || 0),
        percentual_criticos: totalAlertas > 0 ? (produtosCriticos / totalAlertas) * 100 : 0
      };
    }).sort((a, b) => b.total_alertas - a.total_alertas);
  }, [data]);

  // Cores baseadas no nível de criticidade
  const getBarColor = (item) => {
    if (item.produtos_criticos > item.produtos_baixos) {
      return '#ff4757'; // Vermelho para crítico
    } else if (item.produtos_baixos > 0) {
      return '#fa709a'; // Rosa para baixo
    } else {
      return '#fee140'; // Amarelo para atenção
    }
  };

  // Gerencia a mensagem de erro
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  // Calcular estatísticas para o resumo
  const summaryStats = React.useMemo(() => {
    if (!processedData || processedData.length === 0) return null;
    
    const totalCriticos = processedData.reduce((sum, item) => sum + item.produtos_criticos, 0);
    const totalBaixos = processedData.reduce((sum, item) => sum + item.produtos_baixos, 0);
    const totalAlertas = totalCriticos + totalBaixos;
    const valorRiscoTotal = processedData.reduce((sum, item) => sum + item.valor_risco, 0);
    
    const filialMaisCritica = processedData.reduce((max, item) => 
      item.total_alertas > max.total_alertas ? item : max, processedData[0]
    );
    
    const mediaAlertasPorFilial = totalAlertas / processedData.length;
    
    return {
      totalCriticos,
      totalBaixos,
      totalAlertas,
      valorRiscoTotal,
      filialMaisCritica: filialMaisCritica?.nome_filial || 'N/A',
      mediaAlertasPorFilial,
      filiaisComAlertas: processedData.filter(item => item.total_alertas > 0).length
    };
  }, [processedData]);

  if (loading || filiaisLoading) {
    return (
      <Card title="Alertas Críticos de Estoque">
        <div className={styles.modernContainer}>
          <div className={styles.modernLoading}>
            <div className={styles.modernSpinner}></div>
            <span className={styles.modernLoadingText}>Carregando alertas críticos...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card title="Alertas Críticos de Estoque">
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
    <Card title="Alertas Críticos de Estoque">
      <div className={styles.modernContainer}>
        <h2 className={styles.modernTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Monitoramento de Alertas Críticos
        </h2>

        <p className={styles.modernSubtitle}>
          Produtos com estoque crítico ou baixo que requerem atenção imediata
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

        {/* Legenda de cores */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Crítico" size="small" style={{ backgroundColor: '#ff4757', color: 'white' }} />
          <Chip label="Baixo" size="small" style={{ backgroundColor: '#fa709a', color: 'white' }} />
          <Chip label="Atenção" size="small" style={{ backgroundColor: '#fee140', color: 'black' }} />
        </Box>

        <div className={styles.modernChartContainer}>
          {processedData.length === 0 ? (
            <div className={styles.modernEmpty}>
              <svg className={styles.modernEmptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
              <span>Nenhum alerta crítico encontrado para os filtros selecionados</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={processedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="nome_filial" 
                  stroke="#64748b"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="total_alertas" 
                  radius={[4, 4, 0, 0]}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {processedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {summaryStats && (
          <div className={styles.modernSummary}>
            <h4 className={styles.modernSummaryTitle}>Resumo dos Alertas</h4>
            <div className={styles.modernSummaryGrid}>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Produtos Críticos:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#ff4757' }}>
                  {summaryStats.totalCriticos}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Produtos Baixos:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#fa709a' }}>
                  {summaryStats.totalBaixos}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Total de Alertas:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#fee140' }}>
                  {summaryStats.totalAlertas}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Valor em Risco:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#4facfe' }}>
                  R$ {summaryStats.valorRiscoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Filial Mais Crítica:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#f093fb' }}>
                  {summaryStats.filialMaisCritica}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Filiais com Alertas:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#38f9d7' }}>
                  {summaryStats.filiaisComAlertas}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

