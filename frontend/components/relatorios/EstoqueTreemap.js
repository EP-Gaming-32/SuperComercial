// frontend/components/relatorios/EstoqueTreemap.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  Tooltip,
  Legend,
  Treemap,
  Cell
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

// Cores modernas para o treemap
const MODERN_COLORS = [
  { bg: '#667eea', text: '#ffffff' },
  { bg: '#764ba2', text: '#ffffff' },
  { bg: '#f093fb', text: '#ffffff' },
  { bg: '#4facfe', text: '#ffffff' },
  { bg: '#43e97b', text: '#ffffff' },
  { bg: '#fa709a', text: '#ffffff' },
  { bg: '#38f9d7', text: '#1e293b' },
  { bg: '#fee140', text: '#1e293b' }
];

// Customização de conteúdo modernizada para o Treemap
const ModernCustomizedContent = (props) => {
  const { depth, x, y, width, height, index, name, value } = props;
  const color = MODERN_COLORS[index % MODERN_COLORS.length];
  const opacity = depth === 0 ? 0.9 : 0.7;
  const stock = value || 0;
  
  return (
    <g>
      <defs>
        <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color.bg} stopOpacity={opacity} />
          <stop offset="100%" stopColor={color.bg} stopOpacity={opacity * 0.7} />
        </linearGradient>
        <filter id={`shadow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#gradient-${index})`}
        filter={`url(#shadow-${index})`}
        stroke="#ffffff"
        strokeWidth={2}
        rx="8"
        ry="8"
      />
      
      {/* Indicador de estoque baixo */}
      {stock < 10 && width > 40 && height > 20 && (
        <circle
          cx={x + width - 12}
          cy={y + 12}
          r="6"
          fill="#ff4757"
          stroke="#ffffff"
          strokeWidth="2"
        />
      )}
      
      {/* Nome do produto/filial */}
      {width > 60 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill={color.text}
          fontSize={Math.min(width / 8, height / 4, 14)}
          fontWeight="600"
          dominantBaseline="middle"
        >
          {name.length > 15 ? `${name.substring(0, 12)}...` : name}
        </text>
      )}
      
      {/* Valor do estoque */}
      {width > 60 && height > 50 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 16}
          textAnchor="middle"
          fill={color.text}
          fontSize={Math.min(width / 10, height / 6, 12)}
          opacity="0.9"
          dominantBaseline="middle"
        >
          {stock} un.
        </text>
      )}
      
      {/* Borda de destaque para itens grandes */}
      {width > 100 && height > 80 && (
        <rect
          x={x + 2}
          y={y + 2}
          width={width - 4}
          height={height - 4}
          fill="none"
          stroke={color.text}
          strokeWidth="1"
          strokeOpacity="0.3"
          rx="6"
          ry="6"
        />
      )}
    </g>
  );
};

// Tooltip customizado
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.modernTooltip}>
        <p style={{ margin: 0, fontWeight: 600 }}>{data.name}</p>
        <p style={{ margin: 0, color: '#4facfe' }}>
          {`Estoque: ${data.size || data.value} unidades`}
        </p>
        {data.size < 10 && (
          <p style={{ margin: 0, color: '#ff4757', fontSize: '0.75rem' }}>
            ⚠️ Estoque baixo
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function EstoqueTreemap() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);
  const [selectedFilialId, setSelectedFilialId] = useState('');

  // Usa o hook useChartData para buscar os dados de estoque por filial
  const chartParams = React.useMemo(() => {
    return selectedFilialId ? { id_filial: selectedFilialId } : {};
  }, [selectedFilialId]);
  
  const { data, loading, error, refetch } = useChartData(
    '/relatorios/estoque-por-filial',
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

  // Prepara os dados para o Treemap
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Agrupa por filial primeiro
    const groupedByFilial = data.reduce((acc, item) => {
      const filialName = item.nome_filial;
      if (!acc[filialName]) {
        acc[filialName] = { name: filialName, children: [] };
      }
      acc[filialName].children.push({ 
        name: item.nome_produto, 
        size: item.quantidade,
        value: item.quantidade
      });
      return acc;
    }, {});

    const treemapData = Object.values(groupedByFilial).map(filial => {
      if (selectedFilialId && Object.keys(groupedByFilial).length === 1) {
        return {
          name: filial.name,
          children: filial.children,
        };
      } else {
        return filial;
      }
    });

    if (!selectedFilialId && treemapData.length > 1) {
      return [{
        name: "Estoque Total",
        children: treemapData.map(filial => ({
          name: filial.name,
          children: filial.children,
        }))
      }];
    } else {
      return treemapData;
    }
  }, [data, selectedFilialId]);

  // Gerencia a mensagem de erro para exibição no Alert
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  // Calcular estatísticas para o resumo
  const summaryStats = React.useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const totalItens = data.reduce((sum, item) => sum + item.quantidade, 0);
    const totalProdutos = data.length;
    const estoqueBaixo = data.filter(item => item.quantidade < 10).length;
    const mediaEstoque = Math.round(totalItens / totalProdutos);
    const maiorEstoque = Math.max(...data.map(item => item.quantidade));
    
    return {
      totalItens,
      totalProdutos,
      estoqueBaixo,
      mediaEstoque,
      maiorEstoque,
      percentualBaixo: ((estoqueBaixo / totalProdutos) * 100).toFixed(1)
    };
  }, [data]);

  if (loading || filiaisLoading) {
    return (
      <Card title="Estoque por Filial (Detalhado)">
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
      <Card title="Estoque por Filial (Detalhado)">
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
    <Card title="Estoque por Filial (Detalhado)">
      <div className={styles.modernContainer}>
        <h2 className={styles.modernTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          Mapa de Estoque
        </h2>

        <p className={styles.modernSubtitle}>
          Visualização hierárquica do estoque por produtos e filiais
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
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              <span>Nenhum dado disponível para este relatório</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              <Treemap
                data={processedData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#ffffff"
                strokeWidth={2}
                content={<ModernCustomizedContent />}
              >
                <Tooltip content={<CustomTooltip />} />
              </Treemap>
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
                  {summaryStats.totalItens} unidades
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Total de Produtos:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#4facfe' }}>
                  {summaryStats.totalProdutos}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Estoque Baixo:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#fa709a' }}>
                  {summaryStats.estoqueBaixo} ({summaryStats.percentualBaixo}%)
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Média por Produto:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#43e97b' }}>
                  {summaryStats.mediaEstoque} unidades
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Maior Estoque:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#f093fb' }}>
                  {summaryStats.maiorEstoque} unidades
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}