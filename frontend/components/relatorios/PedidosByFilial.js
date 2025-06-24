"use client";

import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import { CircularProgress, Typography } from '@mui/material';
import Card from './Card';
import useChartData from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

// Tooltip customizado para pedidos
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
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

const MODERN_COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#38f9d7', '#fee140'];

export default function PedidosByFilial() {
  const { data, loading, error } = useChartData('/relatorios/pedidos-por-filial');

  // Agrupa por filial
  const processedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const aggregated = data.reduce((acc, item) => {
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

    return Object.values(aggregated);
  }, [data]);

  // Estatísticas de resumo
  const summaryStats = useMemo(() => {
    if (!processedData.length) return null;
    const totalPedidos = processedData.reduce((sum, item) => sum + item.total_pedidos, 0);
    const totalValor = processedData.reduce((sum, item) => sum + item.valor_total_pedidos, 0);
    const mediaPedidos = Math.round(totalPedidos / processedData.length);
    const mediaValor = totalValor / processedData.length;
    return { totalPedidos, totalValor, mediaPedidos, mediaValor };
  }, [processedData]);

  if (loading) {
    return (
      <Card title="Relatório de Pedidos por Loja">
        <div className={styles.modernContainer}>
          <CircularProgress />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Relatório de Pedidos por Loja">
        <div className={styles.modernContainer}>
          <Typography color="error">Erro ao carregar dados.</Typography>
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
          Visualização dos pedidos realizados por filial
        </p>

        <div className={styles.modernChartContainer}>
          {processedData.length === 0 ? (
            <Typography>Nenhum dado de pedidos disponível</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  {MODERN_COLORS.map((color, index) => (
                    <linearGradient key={index} id={`grad${index}`} x1="0" y1="0" x2="0" y2="1">
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
                  {processedData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#grad${index % MODERN_COLORS.length})`} />
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
                <span className={styles.modernSummaryValue} style={{ color: '#667eea' }}>{summaryStats.totalPedidos}</span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Valor Total:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#43e97b' }}>R$ {summaryStats.totalValor.toFixed(2)}</span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Média de Pedidos:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#f093fb' }}>{summaryStats.mediaPedidos}</span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Valor Médio:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#fa709a' }}>R$ {summaryStats.mediaValor.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}