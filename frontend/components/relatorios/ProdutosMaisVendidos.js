"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

// Tooltip customizado
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{d.nome_produto}</p>
        <p style={{ margin: 0, color: '#43e97b' }}>{`Qtd: ${d.quantidade_vendida}`}</p>
        <p style={{ margin: 0, color: '#4facfe' }}>{`Receita: R$ ${d.receita_total.toFixed(2)}`}</p>
        <p style={{ margin: 0, color: '#fa709a', fontSize: '0.75rem' }}>{`Filial: ${d.nome_filial}`}</p>
      </div>
    );
  }
  return null;
};

// Cores para barras
const COLORS = ['#667eea','#764ba2','#f093fb','#4facfe','#43e97b','#fa709a','#38f9d7','#fee140'];

export default function ProdutosMaisVendidos() {
  const [filiais, setFiliais] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(true);
  const [errorFiliais, setErrorFiliais] = useState(null);
  const [filial, setFilial] = useState('');

  // Carrega filiais
  useEffect(() => {
    fetchFiliais()
      .then(setFiliais)
      .catch(e => setErrorFiliais(e))
      .finally(() => setLoadingFiliais(false));
  }, []);

  // Hook de dados
  const { data, loading, error, setParams } = useChartData('/relatorios/produtos-mais-vendidos', {});

  // Atualiza filtro
  useEffect(() => {
    setParams(filial ? { id_filial: filial } : {});
  }, [filial, setParams]);

  // Processa dados para o gráfico
  const processed = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .map((i, idx) => ({
        ...i,
        quantidade_vendida: +i.quantidade_vendida,
        receita_total: parseFloat(i.receita_total),
        cor_categoria: COLORS[idx % COLORS.length],
      }))
      .sort((a, b) => b.receita_total - a.receita_total);
  }, [data]);

  if (loading || loadingFiliais) return (
    <Card title="Produtos Mais Vendidos">
      <div className={styles.modernContainer}><CircularProgress/></div>
    </Card>
  );

  if (error || errorFiliais) return (
    <Card title="Produtos Mais Vendidos">
      <div className={styles.modernContainer}><Alert severity="error">{error?.message || errorFiliais?.message}</Alert></div>
    </Card>
  );

  return (
    <Card title="Produtos Mais Vendidos">
      <div className={styles.modernContainer}>
        <h2 className={styles.modernTitle}>Top 10 Produtos por Receita</h2>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Filial</InputLabel>
          <Select value={filial} label="Filial" onChange={e => setFilial(e.target.value)}>
            <MenuItem value=""><em>Todas</em></MenuItem>
            {filiais.map(f => <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>)}
          </Select>
        </FormControl>
        <div className={styles.modernChartContainer}>
          {!processed.length ? (
            <Typography>Nenhum dado</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processed.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  {processed.slice(0, 10).map((i, idx) => (
                    <linearGradient key={idx} id={`g${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={i.cor_categoria} stopOpacity={0.8}/>
                      <stop offset="100%" stopColor={i.cor_categoria} stopOpacity={0.3}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5}/>
                <XAxis dataKey="nome_produto" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12, fill: '#64748b' }}/>
                <YAxis label={{ value: 'Receita', angle: -90, position: 'insideLeft' }}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="receita_total" radius={[8, 8, 0, 0]}>
                  {processed.slice(0, 10).map((_, idx) => (
                    <Cell key={idx} fill={`url(#g${idx})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
}