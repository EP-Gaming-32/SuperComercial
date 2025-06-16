// frontend/components/relatorios/EstoqueVisual.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer, Sector
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

// Componente de tooltip customizado
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = payload[0].payload.total || 100;
    const percentage = ((data.value / total) * 100).toFixed(1);
    
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{data.name}</p>
        <p style={{ margin: 0, color: data.color }}>
          {`Quantidade: ${data.value}`}
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>
          {`${percentage}% do total`}
        </p>
      </div>
    );
  }
  return null;
};

// Setor ativo customizado para hover effect
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize="14" fontWeight="600">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
        fillOpacity={0.3}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none"/>
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none"/>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#64748b" fontSize="12">
        {`${value} itens`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#94a3b8" fontSize="10">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

// Cores modernas com gradientes para status de estoque
const MODERN_COLORS = {
  'normal': { solid: "#4facfe", gradient: "url(#gradientNormal)" },
  'baixo': { solid: "#43e97b", gradient: "url(#gradientBaixo)" },
  'critico': { solid: "#fa709a", gradient: "url(#gradientCritico)" },
  'default': [
    { solid: "#667eea", gradient: "url(#gradient0)" },
    { solid: "#f093fb", gradient: "url(#gradient1)" },
    { solid: "#38f9d7", gradient: "url(#gradient2)" }
  ]
};

export default function EstoqueVisual() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);
  const [selectedFilialId, setSelectedFilialId] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  // Usa o hook useChartData para buscar os dados de status de estoque
  const chartParams = React.useMemo(() => {
    return selectedFilialId ? { id_filial: selectedFilialId } : {};
  }, [selectedFilialId]);
  
  const { data, loading, error, refetch } = useChartData(
    '/relatorios/status-por-estoque',
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

  // Processa os dados para o formato esperado pelo PieChart
  const processedData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const order = ['normal', 'baixo', 'critico'];
    
    return data
      .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
      .map((item, index) => ({
        ...item,
        total: total,
        color: MODERN_COLORS[item.name]?.solid || MODERN_COLORS.default[index % MODERN_COLORS.default.length].solid,
      }));
  }, [data]);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  // Gerencia a mensagem de erro para exibição no Alert
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  // Calcular estatísticas para o resumo
  const summaryStats = React.useMemo(() => {
    if (!processedData || processedData.length === 0) return null;
    
    const total = processedData.reduce((sum, item) => sum + item.value, 0);
    const normal = processedData.find(item => item.name === 'normal')?.value || 0;
    const baixo = processedData.find(item => item.name === 'baixo')?.value || 0;
    const critico = processedData.find(item => item.name === 'critico')?.value || 0;
    
    return {
      total,
      normal,
      baixo,
      critico,
      percentualNormal: ((normal / total) * 100).toFixed(1),
      percentualBaixo: ((baixo / total) * 100).toFixed(1),
      percentualCritico: ((critico / total) * 100).toFixed(1)
    };
  }, [processedData]);

  if (loading || filiaisLoading) {
    return (
      <Card title="Estoque - Status por Filial">
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
      <Card title="Estoque - Status por Filial">
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
    <Card title="Estoque - Status por Filial">
      <div className={styles.modernContainer}>
        <h2 className={styles.modernTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
          </svg>
          Status do Estoque
        </h2>

        <p className={styles.modernSubtitle}>
          Distribuição do status dos produtos em estoque por filial
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
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span>Nenhum dado de status de estoque disponível para os filtros selecionados</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <defs>
                  <radialGradient id="gradientNormal" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4facfe" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#00f2fe" stopOpacity={0.8}/>
                  </radialGradient>
                  <radialGradient id="gradientBaixo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#43e97b" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#38f9d7" stopOpacity={0.8}/>
                  </radialGradient>
                  <radialGradient id="gradientCritico" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fa709a" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#fee140" stopOpacity={0.8}/>
                  </radialGradient>
                  <radialGradient id="gradient0" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#667eea" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#764ba2" stopOpacity={0.8}/>
                  </radialGradient>
                  <radialGradient id="gradient1" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f093fb" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#f5576c" stopOpacity={0.8}/>
                  </radialGradient>
                  <radialGradient id="gradient2" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#38f9d7" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#43e97b" stopOpacity={0.8}/>
                  </radialGradient>
                </defs>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={processedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {processedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        MODERN_COLORS[entry.name]?.gradient || 
                        MODERN_COLORS.default[index % MODERN_COLORS.default.length].gradient
                      }
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {summaryStats && (
          <div className={styles.modernSummary}>
            <h4 className={styles.modernSummaryTitle}>Resumo do Estoque</h4>
            <div className={styles.modernSummaryGrid}>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Total de Itens:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#667eea' }}>
                  {summaryStats.total}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Estoque Normal:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#4facfe' }}>
                  {summaryStats.normal} ({summaryStats.percentualNormal}%)
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Estoque Baixo:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#43e97b' }}>
                  {summaryStats.baixo} ({summaryStats.percentualBaixo}%)
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Estoque Crítico:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#fa709a' }}>
                  {summaryStats.critico} ({summaryStats.percentualCritico}%)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}