// frontend/components/relatorios/MonitoramentoEstoqueRealTime.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert, Chip, Button } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

// Cores para diferentes status
const STATUS_COLORS = {
  'critico': '#ff4757',
  'baixo': '#fa709a', 
  'normal': '#43e97b',
  'alto': '#4facfe',
  'zerado': '#2c2c54'
};

// Tooltip customizado para pizza
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{data.status}</p>
        <p style={{ margin: 0, color: data.color }}>
          {`Produtos: ${data.quantidade}`}
        </p>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>
          {`${data.percentual.toFixed(1)}% do total`}
        </p>
      </div>
    );
  }
  return null;
};

// Tooltip customizado para linha temporal
const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: 0, color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MonitoramentoEstoqueRealTime() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);
  const [selectedFilialId, setSelectedFilialId] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Usa o hook useChartData para buscar os dados de monitoramento
  const chartParams = React.useMemo(() => {
    return selectedFilialId ? { id_filial: selectedFilialId } : {};
  }, [selectedFilialId]);
  
  const { data, loading, error, refetch } = useChartData(
    '/relatorios/status-por-estoque',
    chartParams
  );

  // Auto-refresh a cada 30 segundos se ativado
  useEffect(() => {
    let interval;
    if (autoRefresh && refetch) {
      interval = setInterval(() => {
        refetch();
        setLastUpdate(new Date());
      }, 30000); // 30 segundos
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refetch]);

  // Recarrega dados quando a filial selecionada muda
  useEffect(() => {
    if (refetch) {
      refetch();
      setLastUpdate(new Date());
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

  const handleRefresh = useCallback(() => {
    if (refetch) {
      refetch();
      setLastUpdate(new Date());
    }
  }, [refetch]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // Processa dados para distribuição por status
  const statusDistribution = React.useMemo(() => {
    if (!data?.distribuicao_status) return [];
    
    const total = data.distribuicao_status.reduce((sum, item) => sum + parseInt(item.quantidade || 0), 0);
    
    return data.distribuicao_status.map(item => ({
      status: item.status_estoque,
      quantidade: parseInt(item.quantidade || 0),
      color: STATUS_COLORS[item.status_estoque] || '#64748b',
      percentual: total > 0 ? (parseInt(item.quantidade || 0) / total) * 100 : 0
    }));
  }, [data]);

  // Processa dados para evolução temporal
  const evolucaoTemporal = React.useMemo(() => {
    if (!data?.evolucao_temporal) return [];
    
    return data.evolucao_temporal.map(item => ({
      periodo: item.periodo,
      alertas_criticos: parseInt(item.alertas_criticos || 0),
      alertas_baixos: parseInt(item.alertas_baixos || 0),
      produtos_normais: parseInt(item.produtos_normais || 0)
    }));
  }, [data]);

  // Estatísticas gerais
  const estatisticasGerais = React.useMemo(() => {
    if (!data?.estatisticas) return null;
    
    const stats = data.estatisticas;
    return {
      totalProdutos: parseInt(stats.total_produtos || 0),
      produtosCriticos: parseInt(stats.produtos_criticos || 0),
      produtosBaixos: parseInt(stats.produtos_baixos || 0),
      produtosZerados: parseInt(stats.produtos_zerados || 0),
      valorEstoqueTotal: parseFloat(stats.valor_estoque_total || 0),
      valorRisco: parseFloat(stats.valor_risco || 0),
      percentualRisco: parseFloat(stats.percentual_risco || 0)
    };
  }, [data]);

  // Gerencia a mensagem de erro
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  if (loading || filiaisLoading) {
    return (
      <Card title="Monitoramento de Estoque em Tempo Real">
        <div className={styles.modernContainer}>
          <div className={styles.modernLoading}>
            <div className={styles.modernSpinner}></div>
            <span className={styles.modernLoadingText}>Carregando monitoramento...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card title="Monitoramento de Estoque em Tempo Real">
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
    <Card title="Monitoramento de Estoque em Tempo Real">
      <div className={styles.modernContainer}>
        <div className={styles.modernHeader}>
          <div>
            <h2 className={styles.modernTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18"/>
                <path d="M13 17l5-5-5-5M6 17l5-5-5-5"/>
              </svg>
              Dashboard de Monitoramento
            </h2>
            <p className={styles.modernSubtitle}>
              Acompanhamento em tempo real dos níveis de estoque e alertas
            </p>
          </div>
          
          <div className={styles.modernActions}>
            <Button
              variant={autoRefresh ? "contained" : "outlined"}
              size="small"
              onClick={toggleAutoRefresh}
              style={{
                backgroundColor: autoRefresh ? '#43e97b' : 'transparent',
                borderColor: '#43e97b',
                color: autoRefresh ? 'white' : '#43e97b'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              onClick={handleRefresh}
              style={{ borderColor: '#4facfe', color: '#4facfe' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              Atualizar
            </Button>
          </div>
        </div>

        <div className={styles.modernInfo}>
          <Typography variant="caption" color="textSecondary">
            Última atualização: {lastUpdate.toLocaleString('pt-BR')}
          </Typography>
        </div>

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

        {/* Estatísticas Gerais */}
        {estatisticasGerais && (
          <div className={styles.modernStatsGrid}>
            <div className={styles.modernStatCard} style={{ borderLeft: '4px solid #ff4757' }}>
              <div className={styles.modernStatNumber}>{estatisticasGerais.produtosCriticos}</div>
              <div className={styles.modernStatLabel}>Produtos Críticos</div>
            </div>
            <div className={styles.modernStatCard} style={{ borderLeft: '4px solid #fa709a' }}>
              <div className={styles.modernStatNumber}>{estatisticasGerais.produtosBaixos}</div>
              <div className={styles.modernStatLabel}>Produtos Baixos</div>
            </div>
            <div className={styles.modernStatCard} style={{ borderLeft: '4px solid #2c2c54' }}>
              <div className={styles.modernStatNumber}>{estatisticasGerais.produtosZerados}</div>
              <div className={styles.modernStatLabel}>Produtos Zerados</div>
            </div>
            <div className={styles.modernStatCard} style={{ borderLeft: '4px solid #4facfe' }}>
              <div className={styles.modernStatNumber}>
                R$ {estatisticasGerais.valorRisco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className={styles.modernStatLabel}>Valor em Risco</div>
            </div>
          </div>
        )}

        {/* Gráficos */}
        <div className={styles.modernChartsGrid}>
          {/* Distribuição por Status */}
          <div className={styles.modernChartContainer}>
            <h4 className={styles.modernChartTitle}>Distribuição por Status</h4>
            {statusDistribution.length === 0 ? (
              <div className={styles.modernEmpty}>
                <span>Nenhum dado de distribuição disponível</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="quantidade"
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Evolução Temporal */}
          <div className={styles.modernChartContainer}>
            <h4 className={styles.modernChartTitle}>Evolução dos Alertas</h4>
            {evolucaoTemporal.length === 0 ? (
              <div className={styles.modernEmpty}>
                <span>Nenhum dado temporal disponível</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={evolucaoTemporal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="periodo" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="alertas_criticos"
                    stackId="1"
                    stroke="#ff4757"
                    fill="#ff4757"
                    fillOpacity={0.6}
                    name="Críticos"
                  />
                  <Area
                    type="monotone"
                    dataKey="alertas_baixos"
                    stackId="1"
                    stroke="#fa709a"
                    fill="#fa709a"
                    fillOpacity={0.6}
                    name="Baixos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Legenda */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip label="Crítico" size="small" style={{ backgroundColor: '#ff4757', color: 'white' }} />
          <Chip label="Baixo" size="small" style={{ backgroundColor: '#fa709a', color: 'white' }} />
          <Chip label="Normal" size="small" style={{ backgroundColor: '#43e97b', color: 'white' }} />
          <Chip label="Alto" size="small" style={{ backgroundColor: '#4facfe', color: 'white' }} />
          <Chip label="Zerado" size="small" style={{ backgroundColor: '#2c2c54', color: 'white' }} />
        </Box>
      </div>
    </Card>
  );
}

