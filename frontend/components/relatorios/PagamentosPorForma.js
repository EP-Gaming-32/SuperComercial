"use client";

import React, { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { Tab, Tabs, CircularProgress, Typography } from '@mui/material';
import Card from './Card';
import useChartData from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

const PAYMENT_COLORS = {
  'PIX': '#43e97b',
  'Cartão de Crédito': '#4facfe', 
  'Cartão de Débito': '#667eea',
  'Dinheiro': '#fa709a',
  'Boleto': '#f093fb',
  'Transferência Bancária': '#38f9d7',
  'Não Informado': '#fee140',
  'default': '#fee140'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{data.forma_pagamento}</p>
        <p style={{ margin: 0, color: '#43e97b' }}>
          {`Quantidade: ${data.total_quantidade}`}
        </p>
        <p style={{ margin: 0, color: '#4facfe' }}>
          {`Movimentações: ${data.total_movimentacoes}`}
        </p>
        <p style={{ margin: 0, color: '#f093fb', fontSize: '0.75rem' }}>
          {`${data.percentual.toFixed(1)}% do total`}
        </p>
      </div>
    );
  }
  return null;
};

export default function PagamentosPorForma() {
  const [tabValue, setTabValue] = useState(0);
  const { data, loading, error } = useChartData('/relatorios/pagamentos-por-filial');

  const processedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const filtered = data.filter(item => parseFloat(item.total_quantidade) > 0);
    const totalGeral = filtered.reduce(
      (sum, item) => sum + parseFloat(item.total_quantidade), 0
    );
    return filtered.map(item => ({
      forma_pagamento: item.forma_pagamento || 'Não Informado',
      total_quantidade: parseFloat(item.total_quantidade),
      total_movimentacoes: item.total_movimentacoes,
      percentual: totalGeral > 0 ? (parseFloat(item.total_quantidade) / totalGeral) * 100 : 0,
      color: PAYMENT_COLORS[item.forma_pagamento] || PAYMENT_COLORS.default
    })).sort((a, b) => b.total_quantidade - a.total_quantidade);
  }, [data]);

  const summaryStats = useMemo(() => {
    if (!processedData.length) return null;
    const totalQuantidade = processedData.reduce((sum, item) => sum + item.total_quantidade, 0);
    const totalMovimentacoes = processedData.reduce((sum, item) => sum + item.total_movimentacoes, 0);
    const media = totalMovimentacoes > 0 ? totalQuantidade / totalMovimentacoes : 0;
    const formaMaisUsada = processedData.reduce((prev, curr) => 
      prev.total_movimentacoes > curr.total_movimentacoes ? prev : curr
    );
    return { totalQuantidade, totalMovimentacoes, media, formaMaisUsada: formaMaisUsada.forma_pagamento, formasDisponiveis: processedData.length };
  }, [processedData]);

  if (loading) {
    return (
      <Card title="Análise de Pagamentos por Forma">
        <div className={styles.modernContainer}>
          <CircularProgress />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Análise de Pagamentos por Forma">
        <div className={styles.modernContainer}>
          <Typography color="error">Erro ao carregar dados.</Typography>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Análise de Pagamentos por Forma">
      <div className={styles.modernContainer}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
          <Tab label="Distribuição %" />
          <Tab label="Quantidade Absoluta" />
        </Tabs>

        <div className={styles.modernChartContainer}>
          {processedData.length === 0 ? (
            <Typography>Nenhum dado disponível.</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              {tabValue === 0 ? (
                <PieChart>
                  <Pie
                    data={processedData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="total_quantidade"
                    label={({ forma_pagamento, percentual }) => `${forma_pagamento}: ${percentual.toFixed(1)}%`}
                    labelLine={false}
                  >
                    {processedData.map((entry, idx) => (
                      <Cell key={entry.forma_pagamento + idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              ) : (
                <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="forma_pagamento" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total_quantidade" radius={[8, 8, 0, 0]}>
                    {processedData.map((entry, idx) => (
                      <Cell key={entry.forma_pagamento + idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {summaryStats && (
          <div className={styles.modernSummary}>
            <h4 className={styles.modernSummaryTitle}>Resumo das Movimentações</h4>
            <div className={styles.modernSummaryGrid}>
              <div className={styles.modernSummaryItem}>
                <span>Total Quantidade:</span> 
                <strong style={{ color: '#43e97b' }}>{summaryStats.totalQuantidade}</strong>
              </div>
              <div className={styles.modernSummaryItem}>
                <span>Total Movimentações:</span> 
                <strong style={{ color: '#4facfe' }}>{summaryStats.totalMovimentacoes}</strong>
              </div>
              <div className={styles.modernSummaryItem}>
                <span>Média por Movimentação:</span> 
                <strong style={{ color: '#f093fb' }}>{summaryStats.media.toFixed(2)}</strong>
              </div>
              <div className={styles.modernSummaryItem}>
                <span>Forma Mais Usada:</span> 
                <strong style={{ color: '#fa709a' }}>{summaryStats.formaMaisUsada}</strong>
              </div>
              <div className={styles.modernSummaryItem}>
                <span>Formas Disponíveis:</span> 
                <strong style={{ color: '#667eea' }}>{summaryStats.formasDisponiveis}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}