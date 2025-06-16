// frontend/components/relatorios/PrevisaoPedidos.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart
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
        <p style={{ margin: 0, fontWeight: 600 }}>{`Mês: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: 0, color: entry.color }}>
            {`${entry.name}: ${entry.value} pedidos`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PrevisaoPedidos() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);
  const [selectedFilialId, setSelectedFilialId] = useState('');

  // Usa o hook useChartData para buscar os dados de previsão de pedidos
  const chartParams = React.useMemo(() => {
    return selectedFilialId ? { id_filial: selectedFilialId } : {};
  }, [selectedFilialId]);
  
  const { data, loading, error, refetch } = useChartData(
    '/relatorios/previsao-pedido',
    chartParams
  );

  // Recarrega dados quando a filial selecionada muda
  useEffect(() => {
    if (refetch) {
      refetch();
    }
  }, [selectedFilialId, refetch]);

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

  // Processa os dados para o formato esperado pelo LineChart
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Se uma filial específica for selecionada, filtre os dados para essa filial
    if (selectedFilialId) {
      const filialData = data.find(f => f.id_filial === parseInt(selectedFilialId));
      return filialData ? filialData.dados : [];
    }

    // Se "Todas as Filiais" for selecionado, mostra dados agregados
    if (data.length > 0) {
      // Agrega dados de todas as filiais por mês
      const aggregatedData = {};
      data.forEach(filial => {
        if (filial.dados) {
          filial.dados.forEach(item => {
            if (!aggregatedData[item.mes]) {
              aggregatedData[item.mes] = {
                mes: item.mes,
                total_pedidos: 0,
                previsao: 0
              };
            }
            aggregatedData[item.mes].total_pedidos += item.total_pedidos || 0;
            aggregatedData[item.mes].previsao += item.previsao || 0;
          });
        }
      });
      return Object.values(aggregatedData);
    }
    return [];
  }, [data, selectedFilialId]);

  // Gerencia a mensagem de erro
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  // Calcular estatísticas para o resumo
  const summaryStats = React.useMemo(() => {
    if (!processedData || processedData.length === 0) return null;
    
    const totalPedidos = processedData.reduce((sum, item) => sum + (item.total_pedidos || 0), 0);
    const totalPrevisao = processedData.reduce((sum, item) => sum + (item.previsao || 0), 0);
    const mediaPedidos = Math.round(totalPedidos / processedData.length);
    const mediaPrevisao = Math.round(totalPrevisao / processedData.length);
    const acuracia = totalPedidos > 0 ? ((1 - Math.abs(totalPrevisao - totalPedidos) / totalPedidos) * 100) : 0;
    
    return {
      totalPedidos,
      totalPrevisao,
      mediaPedidos,
      mediaPrevisao,
      acuracia: Math.max(0, acuracia),
      meses: processedData.length
    };
  }, [processedData]);

  if (loading || filiaisLoading) {
    return (
      <Card title="Previsão de Pedidos por Loja">
        <div className={styles.modernContainer}>
          <div className={styles.modernLoading}>
            <div className={styles.modernSpinner}></div>
            <span className={styles.modernLoadingText}>Carregando previsões...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card title="Previsão de Pedidos por Loja">
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
    <Card title="Previsão de Pedidos por Loja">
      <div className={styles.modernContainer}>
        <h2 className={styles.modernTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v5h5M3 21l6-6m2-5h8l-2-3h-6l-2 3zm0 0v7a2 2 0 002 2h6a2 2 0 002-2v-7"/>
            <path d="M21 14l-3 3-3-3"/>
          </svg>
          Previsão de Pedidos
        </h2>

        <p className={styles.modernSubtitle}>
          Análise preditiva dos pedidos futuros baseada em dados históricos
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
                <path d="M3 3v5h5M3 21l6-6m2-5h8l-2-3h-6l-2 3zm0 0v7a2 2 0 002 2h6a2 2 0 002-2v-7"/>
                <path d="M21 14l-3 3-3-3"/>
              </svg>
              <span>Nenhum dado de previsão disponível para os filtros selecionados</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart 
                data={processedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="pedidosGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4facfe" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#4facfe" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="previsaoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#43e97b" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#43e97b" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e2e8f0" 
                  strokeOpacity={0.5}
                />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  label={{ value: "Total de Pedidos", angle: -90, position: "insideLeft", fontSize: 10 }}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Área para pedidos reais */}
                <Area
                  type="monotone"
                  dataKey="total_pedidos"
                  stroke="#4facfe"
                  fill="url(#pedidosGradient)"
                  strokeWidth={3}
                  name="Pedidos Reais"
                />
                
                {/* Linha para previsão */}
                <Line 
                  type="monotone" 
                  dataKey="previsao" 
                  stroke="#43e97b" 
                  strokeWidth={3}
                  strokeDasharray="8 4" 
                  name="Previsão"
                  dot={{ fill: '#43e97b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#43e97b', strokeWidth: 2 }}
                />
                
                {/* Linha sólida para pedidos reais */}
                <Line 
                  type="monotone" 
                  dataKey="total_pedidos" 
                  stroke="#4facfe" 
                  strokeWidth={2}
                  name="Tendência Real"
                  dot={{ fill: '#4facfe', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#4facfe', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {summaryStats && (
          <div className={styles.modernSummary}>
            <h4 className={styles.modernSummaryTitle}>Resumo da Previsão</h4>
            <div className={styles.modernSummaryGrid}>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Total de Pedidos:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#4facfe' }}>
                  {summaryStats.totalPedidos}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Previsão Total:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#43e97b' }}>
                  {summaryStats.totalPrevisao}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Acurácia da Previsão:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#f093fb' }}>
                  {summaryStats.acuracia.toFixed(1)}%
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Média Mensal:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#fa709a' }}>
                  {summaryStats.mediaPedidos} pedidos
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Período Analisado:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#38f9d7' }}>
                  {summaryStats.meses} meses
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

