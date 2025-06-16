// frontend/components/relatorios/FilialVisual.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

// Componente de tooltip customizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{`${label}`}</p>
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

// Cores modernas para as barras
const MODERN_COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#4facfe', 
  '#43e97b', '#fa709a', '#38f9d7', '#fee140'
];

export default function FilialVisual() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);
  const [selectedFilialId, setSelectedFilialId] = useState('');

  // Endpoint para este visual
  const chartParams = React.useMemo(() => {
    return selectedFilialId ? { id_filial: selectedFilialId } : {};
  }, [selectedFilialId]);
  
  const { data, loading, error, refetch } = useChartData(
    '/relatorios/pedidos-por-filial',
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

  // Processa os dados para o formato do gráfico
  const processedData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    // Agrupa por filial
    const aggregatedData = data.reduce((acc, item) => {
      if (!acc[item.id_filial]) {
        acc[item.id_filial] = {
          id_filial: item.id_filial,
          nome_filial: item.nome_filial,
          total_pedidos: 0,
          valor_total_pedidos: 0
        };
      }
      acc[item.id_filial].total_pedidos += item.total_pedidos;
      acc[item.id_filial].valor_total_pedidos += item.valor_total_pedidos;
      return acc;
    }, {});

    return Object.values(aggregatedData);
  }, [data]);

  // Gerencia a mensagem de erro
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  // Calcular estatísticas para o resumo
  const summaryStats = React.useMemo(() => {
    if (!processedData || processedData.length === 0) return null;
    
    const totalPedidos = processedData.reduce((sum, item) => sum + item.total_pedidos, 0);
    const totalValor = processedData.reduce((sum, item) => sum + item.valor_total_pedidos, 0);
    const mediaValor = totalValor / processedData.length;
    const mediaPedidos = Math.round(totalPedidos / processedData.length);
    
    return {
      totalPedidos,
      totalValor,
      mediaValor,
      mediaPedidos,
      totalFiliais: processedData.length
    };
  }, [processedData]);

  if (loading || filiaisLoading) {
    return (
      <Card title="Performance por Filial">
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
      <Card title="Performance por Filial">
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
    <Card title="Performance por Filial">
      <div className={styles.modernContainer}>
        <h2 className={styles.modernTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Performance das Filiais
        </h2>

        <p className={styles.modernSubtitle}>
          Comparativo de performance entre as filiais da rede
        </p>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="filial-select-label">Filtrar por Filial</InputLabel>
          <Select
            labelId="filial-select-label"
            id="filial-select"
            value={selectedFilialId}
            label="Filtrar por Filial"
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
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Nenhum dado de performance disponível</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={processedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  {MODERN_COLORS.map((color, index) => (
                    <linearGradient key={index} id={`filialGradient${index}`} x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="nome_filial" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  label={{
                    value: "Total de Pedidos",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 10,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="total_pedidos" 
                  name="Total de Pedidos"
                  radius={[8, 8, 0, 0]}
                  stroke="#667eea"
                  strokeWidth={2}
                >
                  {processedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#filialGradient${index % MODERN_COLORS.length})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {summaryStats && (
          <div className={styles.modernSummary}>
            <h4 className={styles.modernSummaryTitle}>Resumo da Performance</h4>
            <div className={styles.modernSummaryGrid}>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Total de Pedidos:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#667eea' }}>
                  {summaryStats.totalPedidos}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Valor Total:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#43e97b' }}>
                  R$ {summaryStats.totalValor.toFixed(2)}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Média de Pedidos:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#f093fb' }}>
                  {summaryStats.mediaPedidos} por filial
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Valor Médio:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#fa709a' }}>
                  R$ {summaryStats.mediaValor.toFixed(2)}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Filiais Ativas:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#4facfe' }}>
                  {summaryStats.totalFiliais}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}