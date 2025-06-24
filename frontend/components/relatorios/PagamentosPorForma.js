"use client";

import React, { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import {
  Tab, Tabs, CircularProgress, Typography, Select, MenuItem
} from '@mui/material';
import Card from './Card';
import useChartData from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

// Cores definidas
const PAYMENT_COLORS = {
  'pix': '#43e97b',
  'cartao de credito': '#4facfe', 
  'cartao de debito': '#667eea',
  'dinheiro': '#fa709a',
  'boleto': '#f093fb',
  'transferencia bancaria': '#38f9d7',
  'nao informado': '#fee140',
  'default': '#fee140'
};

// Remove acentos e normaliza
const normalizeKey = (key) =>
  key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{data.name}</p>
        <p style={{ margin: 0, color: '#43e97b' }}>
          {`Valor: ${data.value}`}
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
  const [selectedFilial, setSelectedFilial] = useState("todas");
  const { data, loading, error } = useChartData('/relatorios/pagamentos-por-filial');

  // Gera lista de filiais únicas para o filtro
  const filiais = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const lista = data.map(d => ({ id: d.id_filial, nome: d.nome_filial }));
    const unicos = Array.from(new Map(lista.map(f => [f.id, f])).values());
    return unicos;
  }, [data]);

  // Agrupamento por forma_pagamento
  const processedData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    const filtrado = selectedFilial === "todas"
      ? data
      : data.filter(d => d.id_filial === parseInt(selectedFilial));

    const agrupado = {};

    for (const item of filtrado) {
      const chave = normalizeKey(item.forma_pagamento || "Não Informado");
      const nome = item.forma_pagamento || "Não Informado";
      const valor = parseFloat(item.total_quantidade) || 0;

      if (!agrupado[chave]) {
        agrupado[chave] = {
          name: nome,
          value: 0,
          color: PAYMENT_COLORS[chave] || PAYMENT_COLORS.default,
        };
      }
      agrupado[chave].value += valor;
    }

    const totalGeral = Object.values(agrupado).reduce((acc, curr) => acc + curr.value, 0);

    return Object.values(agrupado)
      .map(entry => ({
        ...entry,
        percentual: totalGeral > 0 ? (entry.value / totalGeral) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [data, selectedFilial]);

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
        {/* Filtro de Filial */}
        <div style={{ marginBottom: 16, width: 300 }}>
          <Select
            fullWidth
            value={selectedFilial}
            onChange={(e) => setSelectedFilial(e.target.value)}
            displayEmpty
          >
            <MenuItem value="todas">Todas as Filiais</MenuItem>
            {filiais.map(f => (
              <MenuItem key={f.id} value={f.id}>
                {f.nome}
              </MenuItem>
            ))}
          </Select>
        </div>

        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
          <Tab label="Distribuição %" />
          <Tab label="Valor Absoluto" />
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
                    dataKey="value"
                    label={({ name, percentual }) => `${name}: ${percentual.toFixed(1)}%`}
                    labelLine={false}
                  >
                    {processedData.map((entry, idx) => (
                      <Cell key={entry.name + idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              ) : (
                <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {processedData.map((entry, idx) => (
                      <Cell key={entry.name + idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
}