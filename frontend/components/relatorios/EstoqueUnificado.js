// frontend/components/relatorios/EstoqueUnificado.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ComposedChart, Bar, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Sector
} from "recharts";
import { 
  Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, 
  Typography, Alert, Tabs, Tab, Card as MuiCard, CardContent 
} from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData';
import useGrupos from '@/hooks/useGrupos';
import styles from "./ModernVisuals.module.css";

// Componente de tooltip customizado para gráfico de barras
const BarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, color: data.color }}>
          {`Estoque: ${data.value} unidades`}
        </p>
        {data.payload.status_estoque && (
          <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>
            Status: {data.payload.status_estoque}
          </p>
        )}
        {data.value < 10 && (
          <p style={{ margin: 0, color: '#ff4757', fontSize: '0.75rem' }}>
            ⚠️ Estoque baixo
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Componente de tooltip customizado para gráfico de pizza
const PieTooltip = ({ active, payload }) => {
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

// Setor ativo customizado para hover effect no gráfico de pizza
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

// Cores modernas para os gráficos
const STATUS_COLORS = {
  'normal': { solid: "#4facfe", gradient: "url(#gradientNormal)" },
  'baixo': { solid: "#43e97b", gradient: "url(#gradientBaixo)" },
  'critico': { solid: "#fa709a", gradient: "url(#gradientCritico)" },
  'default': [
    { solid: "#667eea", gradient: "url(#gradient0)" },
    { solid: "#f093fb", gradient: "url(#gradient1)" },
    { solid: "#38f9d7", gradient: "url(#gradient2)" }
  ]
};

const PRODUCT_COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#4facfe', 
  '#43e97b', '#fa709a', '#38f9d7', '#fee140'
];

export default function EstoqueUnificado() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);
  const [selectedFilialId, setSelectedFilialId] = useState('');
  const [selectedGrupoId, setSelectedGrupoId] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState(0);

  // Hook para buscar grupos/categorias
  const { grupos, loading: gruposLoading, error: gruposError } = useGrupos();

  // Parâmetros para os hooks de dados
  const chartParams = React.useMemo(() => {
    const params = {};
    if (selectedFilialId && selectedFilialId !== '') {
      params.id_filial = selectedFilialId;
    }
    if (selectedGrupoId && selectedGrupoId !== '') {
      params.id_grupo = selectedGrupoId;
    }
    return params;
  }, [selectedFilialId, selectedGrupoId]);

  // Hooks para buscar dados de status e produtos
  const { 
    data: statusData, 
    loading: statusLoading, 
    error: statusError, 
    setParams: setStatusParams,
    refetch: refetchStatus 
  } = useChartData('/relatorios/status-por-estoque', chartParams);

  const { 
    data: productData, 
    loading: productLoading, 
    error: productError, 
    setParams: setProductParams,
    refetch: refetchProduct 
  } = useChartData('/relatorios/estoque-por-produto', chartParams);

  // Recarrega dados quando a filial ou grupo selecionado muda
  useEffect(() => {
    console.log('[EstoqueUnificado] Parâmetros alterados:', chartParams);
    if (setStatusParams) {
      setStatusParams(chartParams);
    }
    if (setProductParams) {
      setProductParams(chartParams);
    }
  }, [chartParams, setStatusParams, setProductParams]);

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

  const handleGrupoChange = useCallback((event) => {
    setSelectedGrupoId(event.target.value);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Processa os dados de status para o gráfico de pizza
  const processedStatusData = React.useMemo(() => {
    if (!statusData || !Array.isArray(statusData) || statusData.length === 0) return [];
    
    const total = statusData.reduce((sum, item) => sum + item.value, 0);
    const order = ['normal', 'baixo', 'critico'];
    
    return statusData
      .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
      .map((item, index) => ({
        ...item,
        total: total,
        color: STATUS_COLORS[item.name]?.solid || STATUS_COLORS.default[index % STATUS_COLORS.default.length].solid,
      }));
  }, [statusData]);

  // Processa os dados de produtos para o gráfico de barras
  const processedProductData = React.useMemo(() => {
    if (!productData || !Array.isArray(productData)) return [];
    
    return productData.map((item, index) => ({
      ...item,
      color: PRODUCT_COLORS[index % PRODUCT_COLORS.length],
      isLowStock: item.estoque_quantidade < 10
    }));
  }, [productData]);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  // Gerencia mensagens de erro
  const errorMessage = (statusError || productError || filiaisError || gruposError) ?
    (statusError ? (statusError.message || "Erro ao carregar dados de status.") : 
     productError ? (productError.message || "Erro ao carregar dados de produtos.") :
     filiaisError ? (filiaisError.message || "Erro ao carregar filiais.") :
     (gruposError.message || "Erro ao carregar grupos."))
    : null;

  // Calcular estatísticas unificadas
  const unifiedStats = React.useMemo(() => {
    if (!processedStatusData.length && !processedProductData.length) return null;
    
    const statusStats = processedStatusData.length > 0 ? {
      total: processedStatusData.reduce((sum, item) => sum + item.value, 0),
      normal: processedStatusData.find(item => item.name === 'normal')?.value || 0,
      baixo: processedStatusData.find(item => item.name === 'baixo')?.value || 0,
      critico: processedStatusData.find(item => item.name === 'critico')?.value || 0,
    } : null;

    const productStats = processedProductData.length > 0 ? {
      totalProdutos: processedProductData.length,
      totalEstoque: processedProductData.reduce((sum, item) => sum + item.estoque_quantidade, 0),
      produtosBaixoEstoque: processedProductData.filter(item => item.isLowStock).length,
      mediaEstoque: Math.round(processedProductData.reduce((sum, item) => sum + item.estoque_quantidade, 0) / processedProductData.length),
    } : null;
    
    return {
      statusStats,
      productStats
    };
  }, [processedStatusData, processedProductData]);

  const isLoading = statusLoading || productLoading || filiaisLoading || gruposLoading;

  if (isLoading) {
    return (
      <Card title="Análise Unificada de Estoque">
        <div className={styles.modernContainer}>
          <div className={styles.modernLoading}>
            <div className={styles.modernSpinner}></div>
            <span className={styles.modernLoadingText}>Carregando análise unificada...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card title="Análise Unificada de Estoque">
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
    <Card title="Análise Unificada de Estoque">
      <div className={styles.modernContainer}>
        <h2 className={styles.modernTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          Análise Completa de Estoque
        </h2>

        <p className={styles.modernSubtitle}>
          Visão unificada do status do estoque e distribuição por produtos
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <FormControl fullWidth>
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

          <FormControl fullWidth>
            <InputLabel id="grupo-select-label">Categoria</InputLabel>
            <Select
              labelId="grupo-select-label"
              id="grupo-select"
              value={selectedGrupoId}
              label="Categoria"
              onChange={handleGrupoChange}
            >
              <MenuItem value="">
                <em>Todas as Categorias</em>
              </MenuItem>
              {gruposLoading ? (
                <MenuItem disabled><CircularProgress size={20} /></MenuItem>
              ) : gruposError ? (
                <MenuItem disabled><Typography color="error">{gruposError.message || "Erro"}</Typography></MenuItem>
              ) : (
                grupos.map((grupo) => (
                  <MenuItem key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </div>

        {/* Tabs para alternar entre visualizações */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="visualizações de estoque">
            <Tab label="Status do Estoque" />
            <Tab label="Estoque por Produto" />
            <Tab label="Visão Combinada" />
          </Tabs>
        </Box>

        {/* Conteúdo das tabs */}
        {activeTab === 0 && (
          <div className={styles.modernChartContainer}>
            {processedStatusData.length === 0 ? (
              <div className={styles.modernEmpty}>
                <svg className={styles.modernEmptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span>Nenhum dado de status de estoque disponível</span>
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
                  </defs>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={processedStatusData}
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
                    {processedStatusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          STATUS_COLORS[entry.name]?.gradient || 
                          STATUS_COLORS.default[index % STATUS_COLORS.default.length].gradient
                        }
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {activeTab === 1 && (
          <div className={styles.modernChartContainer}>
            {processedProductData.length === 0 ? (
              <div className={styles.modernEmpty}>
                <svg className={styles.modernEmptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                <span>Nenhum dado de produtos disponível</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                  data={processedProductData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <defs>
                    {PRODUCT_COLORS.map((color, index) => (
                      <linearGradient key={index} id={`productGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={color} stopOpacity={0.3}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#e2e8f0" 
                    strokeOpacity={0.5}
                  />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    label={{
                      value: "Quantidade em Estoque",
                      angle: -90,
                      position: "insideLeft",
                      fontSize: 10,
                    }}
                  />
                  <Tooltip content={<BarTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="estoque_quantidade" 
                    name="Quantidade em Estoque"
                    radius={[6, 6, 0, 0]}
                    stroke="#667eea"
                    strokeWidth={1}
                  >
                    {processedProductData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isLowStock ? '#fa709a' : `url(#productGradient${index % PRODUCT_COLORS.length})`}
                      />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {activeTab === 2 && (
          <div className={styles.modernChartContainer}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', height: '400px' }}>
              {/* Status do Estoque - Lado Esquerdo */}
              <div>
                <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: '#64748b' }}>Status do Estoque</h4>
                {processedStatusData.length === 0 ? (
                  <div className={styles.modernEmpty} style={{ height: '300px' }}>
                    <span>Sem dados de status</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={processedStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                      >
                        {processedStatusData.map((entry, index) => (
                          <Cell 
                            key={`status-cell-${index}`} 
                            fill={entry.color}
                            stroke="#ffffff"
                            strokeWidth={1}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Produtos - Lado Direito */}
              <div>
                <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: '#64748b' }}>Top 5 Produtos</h4>
                {processedProductData.length === 0 ? (
                  <div className={styles.modernEmpty} style={{ height: '300px' }}>
                    <span>Sem dados de produtos</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                      data={processedProductData.slice(0, 5)}
                      margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 9, fill: '#64748b' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        width={40}
                      />
                      <Tooltip content={<BarTooltip />} />
                      <Bar 
                        dataKey="estoque_quantidade" 
                        radius={[4, 4, 0, 0]}
                      >
                        {processedProductData.slice(0, 5).map((entry, index) => (
                          <Cell 
                            key={`product-cell-${index}`} 
                            fill={entry.isLowStock ? '#fa709a' : PRODUCT_COLORS[index % PRODUCT_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resumo Estatístico Unificado */}
        {unifiedStats && (
          <div className={styles.modernSummary}>
            <h4 className={styles.modernSummaryTitle}>Resumo da Análise Unificada</h4>
            <div className={styles.modernSummaryGrid}>
              {unifiedStats.statusStats && (
                <>
                  <div className={styles.modernSummaryItem}>
                    <span className={styles.modernSummaryLabel}>Total de Itens por Status:</span>
                    <span className={styles.modernSummaryValue} style={{ color: '#667eea' }}>
                      {unifiedStats.statusStats.total}
                    </span>
                  </div>
                  <div className={styles.modernSummaryItem}>
                    <span className={styles.modernSummaryLabel}>Estoque Normal:</span>
                    <span className={styles.modernSummaryValue} style={{ color: '#4facfe' }}>
                      {unifiedStats.statusStats.normal} ({((unifiedStats.statusStats.normal / unifiedStats.statusStats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className={styles.modernSummaryItem}>
                    <span className={styles.modernSummaryLabel}>Estoque Crítico:</span>
                    <span className={styles.modernSummaryValue} style={{ color: '#fa709a' }}>
                      {unifiedStats.statusStats.critico} ({((unifiedStats.statusStats.critico / unifiedStats.statusStats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </>
              )}
              {unifiedStats.productStats && (
                <>
                  <div className={styles.modernSummaryItem}>
                    <span className={styles.modernSummaryLabel}>Total de Produtos:</span>
                    <span className={styles.modernSummaryValue} style={{ color: '#43e97b' }}>
                      {unifiedStats.productStats.totalProdutos}
                    </span>
                  </div>
                  <div className={styles.modernSummaryItem}>
                    <span className={styles.modernSummaryLabel}>Estoque Total:</span>
                    <span className={styles.modernSummaryValue} style={{ color: '#f093fb' }}>
                      {unifiedStats.productStats.totalEstoque} unidades
                    </span>
                  </div>
                  <div className={styles.modernSummaryItem}>
                    <span className={styles.modernSummaryLabel}>Média por Produto:</span>
                    <span className={styles.modernSummaryValue} style={{ color: '#38f9d7' }}>
                      {unifiedStats.productStats.mediaEstoque} unidades
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

