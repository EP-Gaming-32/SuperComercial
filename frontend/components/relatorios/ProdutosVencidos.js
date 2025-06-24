"use client";

import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import Card from './Card';
import useChartData from '@/hooks/useChartData';
import styles from "./ModernVisuals.module.css";

export default function ProdutosVencidos() {
  const { data, loading, error } = useChartData('/relatorios/produtos/vencidos-danificados');

  return (
    <Card title="Produtos Vencidos/Danificados por Loja">
      <div className={styles.modernContainer}>
        <h3 className={styles.modernTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h18v18H3zM7 13h10M7 17h10M7 9h10" />
          </svg>
          Produtos Vencidos e Danificados
        </h3>
        <p className={styles.modernSubtitle}>
          Quantidade de itens vencidos e danificados por filial
        </p>

        <div className={styles.modernChartContainer}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error.message || 'Erro ao carregar dados.'}</Alert>
          ) : (!Array.isArray(data) || data.length === 0) ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <Typography variant="body1" color="text.secondary">
                Nenhum dado disponível.
              </Typography>
            </Box>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome_filial" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="vencidos" stackId="a" fill="#FF4D4D" name="Vencidos" />
                  <Bar dataKey="danificados" stackId="a" fill="#FFA64D" name="Danificados" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}