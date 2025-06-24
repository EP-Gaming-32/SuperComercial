"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, CircularProgress, Typography } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

// Componente de tooltip customizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{`${label}`}</p>
        <p style={{ margin: 0, color: '#4facfe' }}>
          {`Pedidos: ${payload[0].value}`}
        </p>
        {payload[0].payload.valor_total_pedidos && (
          <p style={{ margin: 0, color: '#43e97b', fontSize: '0.75rem' }}>
            {`Valor: R$ ${Number(payload[0].payload.valor_total_pedidos).toFixed(2)}`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const MODERN_COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#4facfe',
  '#43e97b', '#fa709a', '#38f9d7', '#fee140'
];

export default function PedidosByFilial() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);
  const [selectedFilialId, setSelectedFilialId] = useState('');

  const chartParams = React.useMemo(() => {
    return selectedFilialId ? { id_filial: selectedFilialId } : {};
  }, [selectedFilialId]);

  const { data, loading, error, setParams, refetch } = useChartData(
    '/relatorios/pedidos-por-filial',
    chartParams
  );

  useEffect(() => {
    console.log('[PedidosByFilial] Parâmetros alterados:', chartParams);
    if (setParams) {
      setParams(chartParams);
    }
  }, [chartParams, setParams]);

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

  const handleFilialChange = useCallback((e) => {
    setSelectedFilialId(e.target.value);
  }, []);

  const processedData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

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
      acc[item.id_filial].valor_total_pedidos += Number(item.valor_total_pedidos) || 0;
      return acc;
    }, {});

    if (selectedFilialId) {
      const selectedFilial = Object.values(aggregatedData).find(f => f.id_filial === parseInt(selectedFilialId));
      return selectedFilial ? [selectedFilial] : [];
    } else {
      return Object.values(aggregatedData);
    }
  }, [data, selectedFilialId]);

  const errorMessage = (error || filiaisError)
    ? (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  const summaryStats = React.useMemo(() => {
    if (!processedData || processedData.length === 0) return null;

    const totalPedidos = processedData.reduce((sum, item) => sum + item.total_pedidos, 0);
    const totalValor = processedData.reduce((sum, item) => sum + Number(item.valor_total_pedidos || 0), 0);
    const mediaPedidos = Math.round(totalPedidos / processedData.length);
    const mediaValor = totalValor / processedData.length;

    return {
      totalPedidos,
      totalValor,
      mediaPedidos,
      mediaValor,
      totalFiliais: processedData.length
    };
  }, [processedData]);

  if (loading || filiaisLoading) {
    return (
      <Card title="Relatório de Pedidos por Loja">
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
      <Card title="Relatório de Pedidos por Loja">
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
    <Card title="Relatório de Pedidos por Loja">
      <div className={styles.modernContainer}>
        <h3 className={styles.modernTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h18v18H3zM9 9h6v6H9z" />
          </svg>
          Pedidos por Filial
        </h3>

        <p className={styles.modernSubtitle}>
          Visualização dos pedidos realizados por filial selecionada
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
                <path d="M9 17H7A5 5 0 0 1 7 7h2m8 10h2a5 5 0 0 0 0-10h-2m-8 6h8" />
              </svg>
              <span>Nenhum dado de pedidos disponível para os filtros selecionados</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  {MODERN_COLORS.map((color, index) => (
                    <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.3} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="nome_filial" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis label={{ value: "Total de Pedidos", angle: -90, position: "insideLeft", fontSize: 10 }} allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="total_pedidos" name="Total de Pedidos" radius={[8, 8, 0, 0]} stroke="#667eea" strokeWidth={2}>
                  {processedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#gradient${index % MODERN_COLORS.length})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {summaryStats && (
          <div className={styles.modernSummary}>
            <h4 className={styles.modernSummaryTitle}>Resumo dos Pedidos</h4>
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
                  R$ {Number(summaryStats.totalValor || 0).toFixed(2)}
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
                  R$ {Number(summaryStats.mediaValor || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}