"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert, Tabs, Tab, Chip } from '@mui/material';
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
        <Chip label={d.categoria_abc} size="small" style={{ backgroundColor: d.cor_categoria, color:'white', fontSize: '0.7rem', marginTop: 4 }} />
      </div>
    );
  }
  return null;
};

// ABC
const classificarABC = (acum) => acum >= 80 ? {cat:'A', cor:'#43e97b'} : acum >=50 ? {cat:'B', cor:'#4facfe'} : {cat:'C', cor:'#fa709a'};
const COLORS = ['#667eea','#764ba2','#f093fb','#4facfe','#43e97b','#fa709a','#38f9d7','#fee140'];

export default function ProdutosMaisVendidos() {
  const [filiais, setFiliais] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(true);
  const [errorFiliais, setErrorFiliais] = useState(null);
  const [filial, setFilial] = useState('');
  const [tab, setTab] = useState(0);

  // Carrega filiais
  useEffect(() => {
    fetchFiliais()
      .then(setFiliais)
      .catch(e=>setErrorFiliais(e))
      .finally(()=>setLoadingFiliais(false));
  }, []);

  // Hook de dados
  const { data, loading, error, setParams } = useChartData('/relatorios/produtos-mais-vendidos', {});

  // Atualiza filtro
  useEffect(() => {
    setParams(filial ? { id_filial: filial } : {});
  }, [filial, setParams]);

  // Processa
  const processed = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const tot = data.reduce((s,i)=>s+parseFloat(i.receita_total),0);
    let ac=0;
    return data.map((i,idx)=>{
      const rec = parseFloat(i.receita_total);
      const part = tot>0?(rec/tot)*100:0;
      ac+=part;
      const c = classificarABC(ac);
      return { ...i,
        quantidade_vendida: +i.quantidade_vendida,
        receita_total: rec,
        participacao: part,
        participacaoAc: ac,
        categoria_abc: c.cat,
        cor_categoria: c.cor,
        cor_grupo: COLORS[idx%COLORS.length],
        posicao: idx+1
      };
    }).sort((a,b)=>b.receita_total-a.receita_total);
  }, [data]);

  const dadosABC = useMemo(()=>{
    const c={A:0,B:0,C:0}; processed.forEach(i=>c[i.categoria_abc]++);
    return ['A','B','C'].map(k=>({categoria:k,quantidade:c[k],cor:k==='A'?'#43e97b':k==='B'?'#4facfe':'#fa709a'}));
  },[processed]);

  const sum = useMemo(()=>{
    if(!processed.length) return null;
    const totR=processed.reduce((s,i)=>s+i.receita_total,0);
    const totQ=processed.reduce((s,i)=>s+i.quantidade_vendida,0);
    const tk=totQ? totR/totQ:0;
    return { totR, totQ, tk, grps:new Set(processed.map(i=>i.nome_grupo)).size, prodA:processed.filter(i=>i.categoria_abc==='A').length, totalP:processed.length };
  },[processed]);

  if(loading||loadingFiliais) return <Card title="Produtos Mais Vendidos"><div className={styles.modernContainer}><CircularProgress/></div></Card>;
  if(error||errorFiliais) return <Card title="Produtos Mais Vendidos"><div className={styles.modernContainer}><Alert severity="error">{error?.message||errorFiliais?.message}</Alert></div></Card>;

  return (
    <Card title="Produtos Mais Vendidos">
      <div className={styles.modernContainer}>
        <h2 className={styles.modernTitle}>Top Produtos por Vendas</h2>
        <FormControl fullWidth sx={{mb:2}}>
          <InputLabel>Filial</InputLabel>
          <Select value={filial} label="Filial" onChange={e=>setFilial(e.target.value)}>
            <MenuItem value=""><em>Todas</em></MenuItem>
            {filiais.map(f=><MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>)}
          </Select>
        </FormControl>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{mb:2}}>
          <Tab label="Top 10" />
          <Tab label="ABC" />
          <Tab label="Pareto" />
        </Tabs>
        <div className={styles.modernChartContainer}>
          {!processed.length? <Typography>Nenhum dado</Typography> : (
            <ResponsiveContainer width="100%" height={300}>
              {tab===0? (
                <BarChart data={processed.slice(0,10)} margin={{top:20,right:30,left:20,bottom:20}}>
                  <defs>{processed.slice(0,10).map((i,idx)=><linearGradient key={idx} id={`g${idx}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={i.cor_categoria} stopOpacity={0.8}/><stop offset="100%" stopColor={i.cor_categoria} stopOpacity={0.3}/></linearGradient>)}</defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5}/>
                  <XAxis dataKey="nome_produto" angle={-45} textAnchor="end" height={80} tick={{fontSize:12,fill:'#64748b'}}/>
                  <YAxis label={{value:'Receita',angle:-90,position:'insideLeft'}}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="receita_total" radius={[8,8,0,0]}>{processed.slice(0,10).map((_,idx)=><Cell key={idx} fill={`url(#g${idx})`}/>)}</Bar>
                </BarChart>
              ) : tab===1? (
                <PieChart><Pie data={dadosABC} dataKey="quantidade" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({categoria,quantidade})=>`${categoria}: ${quantidade}`} >{dadosABC.map((e,i)=><Cell key={i} fill={e.cor}/>)} </Pie><Tooltip/><Legend/></PieChart>
              ) : (
                <LineChart data={processed.slice(0,20)} margin={{top:20,right:30,left:20,bottom:20}}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5}/><XAxis dataKey="posicao"/><YAxis label={{value:'Acum (%)',angle:-90,position:'insideLeft'}}/><Tooltip content={<CustomTooltip/>}/><Line type="monotone" dataKey="participacaoAc" stroke="#4facfe" strokeWidth={3} dot={{r:4}} activeDot={{r:6}}/></LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
        {sum && (
          <div className={styles.modernSummary}><h4 className={styles.modernSummaryTitle}>Resumo</h4><div className={styles.modernSummaryGrid}><div className={styles.modernSummaryItem}><span>Total Receita:</span><strong style={{color:'#43e97b'}}>R$ {sum.totR.toFixed(2)}</strong></div><div className={styles.modernSummaryItem}><span>Total Qtd:</span><strong style={{color:'#4facfe'}}>{sum.totQ}</strong></div><div className={styles.modernSummaryItem}><span>Ticket Médio:</span><strong style={{color:'#f093fb'}}>R$ {sum.tk.toFixed(2)}</strong></div><div className={styles.modernSummaryItem}><span>Produtos A:</span><strong style={{color:'#667eea'}}>{sum.prodA} de {sum.totalP}</strong></div><div className={styles.modernSummaryItem}><span>Grupos:</span><strong style={{color:'#38f9d7'}}>{sum.grps}</strong></div></div></div>
        )}
      </div>
    </Card>
  );
}