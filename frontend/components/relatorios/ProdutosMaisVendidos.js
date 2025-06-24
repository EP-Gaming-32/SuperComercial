// frontend/components/relatorios/ProdutosMaisVendidos.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert, Tabs, Tab, Chip } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

// Componente de tooltip customizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{data.nome_produto}</p>
        <p style={{ margin: 0, color: '#43e97b' }}>
          {`Quantidade: ${data.quantidade_vendida} unidades`}
        </p>
        <p style={{ margin: 0, color: '#4facfe' }}>
          {`Receita: R$ ${data.receita_total.toFixed(2)}`}
        </p>
        <p style={{ margin: 0, color: '#f093fb' }}>
          {`Grupo: ${data.nome_grupo}`}
        </p>
        <p style={{ margin: 0, color: '#fa709a', fontSize: '0.75rem' }}>
          {`Participação: ${data.participacao_vendas.toFixed(1)}%`}
        </p>
        <div style={{ marginTop: '0.5rem' }}>
          <Chip 
            label={data.categoria_abc} 
            size="small" 
            style={{ 
              backgroundColor: data.cor_categoria, 
              color: 'white',
              fontSize: '0.7rem'
            }} 
          />
        </div>
      </div>
    );
  }
  return null;
};

// Função para classificação ABC
const classificarABC = (participacao) => {
  if (participacao >= 80) {
    return { categoria: 'A', cor: '#43e97b' }; // Verde - Produtos mais importantes
  } else if (participacao >= 50) {
    return { categoria: 'B', cor: '#4facfe' }; // Azul - Produtos intermediários
  } else {
    return { categoria: 'C', cor: '#fa709a' }; // Rosa - Produtos menos importantes
  }
};

// Cores para grupos de produtos
const GROUP_COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#4facfe', 
  '#43e97b', '#fa709a', '#38f9d7', '#fee140'
];

export default function ProdutosMaisVendidos() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);
  const [selectedFilialId, setSelectedFilialId] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Usa o hook useChartData para buscar os dados de produtos mais vendidos
  const chartParams = React.useMemo(() => {
    return selectedFilialId ? { id_filial: selectedFilialId } : {};
  }, [selectedFilialId]);
  
  const { data, loading, error, setParams, refetch } = useChartData(
    '/relatorios/produtos-mais-vendidos',
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

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  // Processa os dados para o formato esperado pelos gráficos
  const processedData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    const totalVendas = data.reduce((sum, item) => sum + parseFloat(item.receita_total || 0), 0);
    let participacaoAcumulada = 0;

    return data.map((item, index) => {
      const receita = parseFloat(item.receita_total || 0);
      const participacao = totalVendas > 0 ? (receita / totalVendas) * 100 : 0;
      participacaoAcumulada += participacao;
      
      const classificacao = classificarABC(participacaoAcumulada);
      
      return {
        ...item,
        quantidade_vendida: parseInt(item.quantidade_vendida || 0),
        receita_total: receita,
        participacao_vendas: participacao,
        participacao_acumulada: participacaoAcumulada,
        categoria_abc: classificacao.categoria,
        cor_categoria: classificacao.cor,
        cor_grupo: GROUP_COLORS[index % GROUP_COLORS.length],
        posicao_ranking: index + 1
      };
    }).sort((a, b) => b.receita_total - a.receita_total);
  }, [data]);

  // Dados para análise ABC
  const dadosABC = React.useMemo(() => {
    const grupos = { A: 0, B: 0, C: 0 };
    processedData.forEach(item => {
      grupos[item.categoria_abc]++;
    });
    
    return Object.entries(grupos).map(([categoria, quantidade]) => ({
      categoria: `Categoria ${categoria}`,
      quantidade,
      cor: categoria === 'A' ? '#43e97b' : categoria === 'B' ? '#4facfe' : '#fa709a'
    }));
  }, [processedData]);

  // Gerencia a mensagem de erro
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  // Calcular estatísticas para o resumo
  const summaryStats = React.useMemo(() => {
    if (!processedData || processedData.length === 0) return null;
    
    const receitaTotal = processedData.reduce((sum, item) => sum + item.receita_total, 0);
    const quantidadeTotal = processedData.reduce((sum, item) => sum + item.quantidade_vendida, 0);
    const ticketMedio = quantidadeTotal > 0 ? receitaTotal / quantidadeTotal : 0;
    
    const top3Produtos = processedData.slice(0, 3);
    const produtosA = processedData.filter(p => p.categoria_abc === 'A').length;
    const gruposUnicos = [...new Set(processedData.map(p => p.nome_grupo))].length;
    
    return {
      receitaTotal,
      quantidadeTotal,
      ticketMedio,
      top3Produtos,
      produtosA,
      gruposUnicos,
      totalProdutos: processedData.length
    };
  }, [processedData]);

  if (loading || filiaisLoading) {
    return (
      <Card title="Produtos Mais Vendidos">
        <div className={styles.modernContainer}>
          <div className={styles.modernLoading}>
            <div className={styles.modernSpinner}></div>
            <span className={styles.modernLoadingText}>Carregando produtos mais vendidos...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card title="Produtos Mais Vendidos">
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
    <Card title="Produtos Mais Vendidos">
      <div className={styles.modernContainer}>
        <h2 className={styles.modernTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Top Produtos por Vendas
        </h2>

        <p className={styles.modernSubtitle}>
          Análise dos produtos com melhor performance de vendas e classificação ABC
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

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Top 10 Produtos" />
          <Tab label="Análise ABC" />
          <Tab label="Curva de Pareto" />
        </Tabs>

        <div className={styles.modernChartContainer}>
          {processedData.length === 0 ? (
            <div className={styles.modernEmpty}>
              <svg className={styles.modernEmptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span>Nenhum dado de vendas disponível para os filtros selecionados</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              {tabValue === 0 ? (
                <BarChart data={processedData.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    {processedData.slice(0, 10).map((item, index) => (
                      <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={item.cor_categoria} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={item.cor_categoria} stopOpacity={0.3}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="nome_produto" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    label={{ value: "Receita (R$)", angle: -90, position: "insideLeft", fontSize: 10 }}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="receita_total" radius={[8, 8, 0, 0]}>
                    {processedData.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                    ))}
                  </Bar>
                </BarChart>
              ) : tabValue === 1 ? (
                <PieChart>
                  <Pie
                    data={dadosABC}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="quantidade"
                    label={({ categoria, quantidade }) => `${categoria}: ${quantidade}`}
                    labelLine={false}
                  >
                    {dadosABC.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              ) : (
                <LineChart data={processedData.slice(0, 20)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="posicao_ranking"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    label={{ value: "Participação Acumulada (%)", angle: -90, position: "insideLeft", fontSize: 10 }}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="participacao_acumulada" 
                    stroke="#4facfe" 
                    strokeWidth={3}
                    dot={{ fill: '#4facfe', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#4facfe', strokeWidth: 2 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {summaryStats && (
          <div className={styles.modernSummary}>
            <h4 className={styles.modernSummaryTitle}>Resumo de Vendas</h4>
            <div className={styles.modernSummaryGrid}>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Receita Total:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#43e97b' }}>
                  R$ {summaryStats.receitaTotal.toFixed(2)}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Quantidade Total:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#4facfe' }}>
                  {summaryStats.quantidadeTotal} unidades
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Ticket Médio:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#f093fb' }}>
                  R$ {summaryStats.ticketMedio.toFixed(2)}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Produtos Categoria A:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#fa709a' }}>
                  {summaryStats.produtosA} de {summaryStats.totalProdutos}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Grupos Ativos:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#38f9d7' }}>
                  {summaryStats.gruposUnicos}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Líder de Vendas:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#667eea' }}>
                  {summaryStats.top3Produtos[0]?.nome_produto || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

