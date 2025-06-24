"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, CircularProgress, Typography, Tabs, Tab, Chip } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

// Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className={styles.modernTooltip}>
        <strong>{d.nome_produto}</strong>
        <p>Estoque: {d.quantidade_atual} unidades</p>
        <p>Vendas: {d.vendas_periodo} unidades</p>
        <p>Giro: {d.giro_estoque.toFixed(2)}x</p>
        <p>Dias p/ renovar: {d.dias_renovacao.toFixed(0)}</p>
        <Chip label={d.classificacao_giro} size="small" sx={{ mt:1, backgroundColor: d.cor_classificacao, color: '#fff', fontSize: '0.7rem' }} />
      </div>
    );
  }
  return null;
};

// classificar giro
const classificarGiro = (giro) => {
  if (giro >= 12) return { classificacao: 'Muito Alto', cor: '#43e97b' };
  if (giro >= 8) return { classificacao: 'Alto', cor: '#4facfe' };
  if (giro >= 4) return { classificacao: 'Médio', cor: '#f093fb' };
  if (giro >= 2) return { classificacao: 'Baixo', cor: '#fa709a' };
  return { classificacao: 'Muito Baixo', cor: '#ff4757' };
};

export default function GiroEstoque() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);
  const [filial, setFilial] = useState('');
  const [tab, setTab] = useState(0);

  const params = filial ? { id_filial: filial } : {};
  const { data, loading, error, setParams, refetch } = useChartData('/relatorios/giro-estoque', params);

  useEffect(() => { 
    console.log('[GiroEstoque] Parâmetros alterados:', { id_filial: filial });
    if(setParams) setParams({ id_filial: filial }); 
  }, [filial, setParams]);
  useEffect(() => {
    fetchFiliais().then(setFiliais).catch(setFiliaisError).finally(() => setFiliaisLoading(false));
  }, []);

  const processed = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map(item => {
      const qtd = item.quantidade_atual;
      const vendas = item.vendas_periodo;
      const giro = qtd > 0 ? vendas / qtd : 0;
      const dias = giro>0 ? 365/giro : 0;
      const cls = classificarGiro(giro);
      return {
        ...item,
        giro_estoque: giro,
        dias_renovacao: dias,
        classificacao_giro: cls.classificacao,
        cor_classificacao: cls.cor
      };
    }).sort((a,b)=>b.giro_estoque-a.giro_estoque);
  }, [data]);

  if (loading||filiaisLoading) return <Card title="Giro de Estoque"><CircularProgress/></Card>;
  if (error||filiaisError) return <Card title="Giro de Estoque"><Typography color="error">Erro ao carregar dados</Typography></Card>;

  return (
    <Card title="Análise de Giro de Estoque">
      <FormControl fullWidth sx={{ mb:2 }}>
        <InputLabel>Filial</InputLabel>
        <Select value={filial} label="Filial" onChange={e=>setFilial(e.target.value)}>
          <MenuItem value=""><em>Todas</em></MenuItem>
          {filiais.map(f=><MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>)}
        </Select>
      </FormControl>
      <Tabs value={tab} onChange={(e,v)=>setTab(v)} sx={{ mb:2 }}> 
        <Tab label="Top Giro" />
        <Tab label="Giro vs Estoque" />
      </Tabs>
      <div className={styles.modernChartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          {tab===0 ? (
            <BarChart data={processed.slice(0,10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome_produto" tick={{fontSize:12}} angle={-45} textAnchor="end" height={60}/>
              <YAxis label={{value:'Giro',angle:-90,position:'insideLeft'}} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="giro_estoque">
                {processed.slice(0,10).map((d,i)=><Cell key={i} fill={d.cor_classificacao}/>)}
              </Bar>
            </BarChart>
          ) : (
            <ScatterChart data={processed}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="quantidade_atual" name="Estoque" />
              <YAxis type="number" dataKey="giro_estoque" name="Giro" />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={processed} fill="#8884d8">
                {processed.map((d,i)=><Cell key={i} fill={d.cor_classificacao}/>)}
              </Scatter>
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}