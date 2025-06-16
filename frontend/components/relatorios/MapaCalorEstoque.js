// frontend/components/relatorios/MapaCalorEstoque.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer, Tooltip, Cell, Treemap
} from "recharts";
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography, Alert, Tabs, Tab, Chip } from '@mui/material';
import Card from './Card';
import useChartData, { fetchFiliais } from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

// Componente customizado para células do mapa de calor
const CustomizedContent = (props) => {
  const { root, depth, x, y, width, height, index, payload, colors, rank, name } = props;
  
  if (depth !== 1) return null;
  
  const { status_estoque, quantidade, nome_produto, nome_filial, percentual_ocupacao } = payload;
  
  // Cores baseadas no status do estoque
  const getStatusColor = (status) => {
    switch (status) {
      case 'critico': return { bg: '#ff4757', text: '#ffffff', opacity: 0.9 };
      case 'baixo': return { bg: '#fa709a', text: '#ffffff', opacity: 0.8 };
      case 'normal': return { bg: '#43e97b', text: '#ffffff', opacity: 0.7 };
      default: return { bg: '#64748b', text: '#ffffff', opacity: 0.6 };
    }
  };
  
  const color = getStatusColor(status_estoque);
  const fontSize = Math.min(width / 8, height / 4, 14);
  
  return (
    <g>
      <defs>
        <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color.bg} stopOpacity={color.opacity} />
          <stop offset="100%" stopColor={color.bg} stopOpacity={color.opacity * 0.7} />
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
      
      {/* Indicador de status crítico */}
      {status_estoque === 'critico' && width > 40 && height > 20 && (
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
          fontSize={fontSize}
          fontWeight="600"
        >
          {nome_produto || nome_filial}
        </text>
      )}
      
      {/* Quantidade */}
      {width > 80 && height > 50 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + fontSize + 4}
          textAnchor="middle"
          fill={color.text}
          fontSize={fontSize * 0.8}
          fontWeight="400"
        >
          {quantidade} un.
        </text>
      )}
      
      {/* Percentual de ocupação */}
      {width > 100 && height > 70 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + (fontSize * 2) + 8}
          textAnchor="middle"
          fill={color.text}
          fontSize={fontSize * 0.7}
          fontWeight="300"
        >
          {percentual_ocupacao?.toFixed(1)}%
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
        <p style={{ margin: 0, fontWeight: 600 }}>{data.nome_produto}</p>
        <p style={{ margin: 0, color: '#4facfe' }}>
          {`Filial: ${data.nome_filial}`}
        </p>
        <p style={{ margin: 0, color: '#43e97b' }}>
          {`Quantidade: ${data.quantidade} unidades`}
        </p>
        <p style={{ margin: 0, color: '#f093fb' }}>
          {`Ocupação: ${data.percentual_ocupacao?.toFixed(1)}%`}
        </p>
        <p style={{ margin: 0, color: '#fa709a', fontSize: '0.75rem' }}>
          {`Mín: ${data.estoque_minimo} | Máx: ${data.estoque_maximo}`}
        </p>
        <div style={{ marginTop: '0.5rem' }}>
          <Chip 
            label={data.status_estoque.toUpperCase()} 
            size="small" 
            style={{ 
              backgroundColor: data.status_estoque === 'critico' ? '#ff4757' : 
                              data.status_estoque === 'baixo' ? '#fa709a' : '#43e97b', 
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

export default function MapaCalorEstoque() {
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(true);
  const [filiaisError, setFiliaisError] = useState(null);
  const [selectedFilialId, setSelectedFilialId] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Usa o hook useChartData para buscar os dados do mapa de calor de estoque
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

  // Processa os dados para o formato esperado pelo Treemap
  const processedData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    try {
      // Agrupa por filial primeiro
      const groupedByFilial = data.reduce((acc, item) => {
        if (!item) return acc;
        
        const filialKey = item.nome_filial || 'Sem Filial';
        if (!acc[filialKey]) {
          acc[filialKey] = {
            name: filialKey,
            children: []
          };
        }
        
        const quantidade = parseInt(item.quantidade || 0);
        const estoqueMinimo = parseInt(item.estoque_minimo || 0);
        const estoqueMaximo = parseInt(item.estoque_maximo || 1);
        
        const percentualOcupacao = estoqueMaximo > 0 ? 
          (quantidade / estoqueMaximo) * 100 : 0;
        
        acc[filialKey].children.push({
          name: item.nome_produto || 'Produto sem nome',
          size: Math.max(quantidade + 1, 1), // +1 para evitar tamanho 0, mínimo 1
          value: quantidade,
          nome_produto: item.nome_produto || 'Produto sem nome',
          nome_filial: item.nome_filial || 'Sem Filial',
          quantidade: quantidade,
          estoque_minimo: estoqueMinimo,
          estoque_maximo: estoqueMaximo,
          status_estoque: item.status_estoque || 'normal',
          percentual_ocupacao: Math.round(percentualOcupacao * 100) / 100
        });
        
        return acc;
      }, {});

      if (selectedFilialId && selectedFilialId !== '') {
        // Se uma filial específica for selecionada, retorna apenas os produtos dessa filial
        const filialSelecionada = Object.values(groupedByFilial).find(f => 
          data.some(item => item.id_filial === parseInt(selectedFilialId) && item.nome_filial === f.name)
        );
        return filialSelecionada ? filialSelecionada.children : [];
      } else {
        // Se "Todas as Filiais" for selecionado, retorna estrutura hierárquica
        return Object.values(groupedByFilial);
      }
    } catch (error) {
      console.error('Erro ao processar dados do mapa de calor:', error);
      return [];
    }
  }, [data, selectedFilialId]);

  // Dados para análise de status
  const dadosStatus = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    try {
      const statusCount = data.reduce((acc, item) => {
        if (!item) return acc;
        const status = item.status_estoque || 'normal';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(statusCount).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        quantidade: count,
        cor: status === 'critico' ? '#ff4757' : 
             status === 'baixo' ? '#fa709a' : '#43e97b'
      }));
    } catch (error) {
      console.error('Erro ao processar dados de status:', error);
      return [];
    }
  }, [data]);

  // Gerencia a mensagem de erro
  const errorMessage = (error || filiaisError) ?
    (error ? (error.message || "Erro desconhecido ao carregar dados.") : (filiaisError.message || "Erro desconhecido ao carregar filiais."))
    : null;

  // Calcular estatísticas para o resumo
  const summaryStats = React.useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const totalProdutos = data.length;
    const produtosCriticos = data.filter(item => item.status_estoque === 'critico').length;
    const produtosBaixos = data.filter(item => item.status_estoque === 'baixo').length;
    const produtosNormais = data.filter(item => item.status_estoque === 'normal').length;
    
    const ocupacaoMedia = data.reduce((sum, item) => {
      const ocupacao = item.estoque_maximo > 0 ? 
        (parseInt(item.quantidade || 0) / parseInt(item.estoque_maximo || 1)) * 100 : 0;
      return sum + ocupacao;
    }, 0) / totalProdutos;
    
    const filiaisUnicas = [...new Set(data.map(item => item.nome_filial))].length;
    
    return {
      totalProdutos,
      produtosCriticos,
      produtosBaixos,
      produtosNormais,
      ocupacaoMedia,
      filiaisUnicas,
      alertasCriticos: produtosCriticos + produtosBaixos
    };
  }, [data]);

  if (loading || filiaisLoading) {
    return (
      <Card title="Mapa de Calor do Estoque">
        <div className={styles.modernContainer}>
          <div className={styles.modernLoading}>
            <div className={styles.modernSpinner}></div>
            <span className={styles.modernLoadingText}>Carregando mapa de calor...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card title="Mapa de Calor do Estoque">
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
    <Card title="Mapa de Calor do Estoque">
      <div className={styles.modernContainer}>
        <h2 className={styles.modernTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          Visualização Térmica do Estoque
        </h2>

        <p className={styles.modernSubtitle}>
          Mapa visual dos níveis de estoque por produto e filial com alertas de criticidade
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

        {/* Legenda de cores */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Normal" size="small" style={{ backgroundColor: '#43e97b', color: 'white' }} />
          <Chip label="Baixo" size="small" style={{ backgroundColor: '#fa709a', color: 'white' }} />
          <Chip label="Crítico" size="small" style={{ backgroundColor: '#ff4757', color: 'white' }} />
        </Box>

        <div className={styles.modernChartContainer}>
          {processedData.length === 0 ? (
            <div className={styles.modernEmpty}>
              <svg className={styles.modernEmptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span>Nenhum dado de estoque disponível para os filtros selecionados</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <Treemap
                data={processedData}
                dataKey="size"
                aspectRatio={4/3}
                stroke="#fff"
                fill="#8884d8"
                content={<CustomizedContent />}
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
                <span className={styles.modernSummaryLabel}>Total de Produtos:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#4facfe' }}>
                  {summaryStats.totalProdutos}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Status Crítico:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#ff4757' }}>
                  {summaryStats.produtosCriticos}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Status Baixo:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#fa709a' }}>
                  {summaryStats.produtosBaixos}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Status Normal:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#43e97b' }}>
                  {summaryStats.produtosNormais}
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Ocupação Média:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#f093fb' }}>
                  {summaryStats.ocupacaoMedia.toFixed(1)}%
                </span>
              </div>
              <div className={styles.modernSummaryItem}>
                <span className={styles.modernSummaryLabel}>Alertas Ativos:</span>
                <span className={styles.modernSummaryValue} style={{ color: '#38f9d7' }}>
                  {summaryStats.alertasCriticos}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

