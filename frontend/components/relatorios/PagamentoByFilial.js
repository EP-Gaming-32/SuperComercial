"use client";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PagamentoByFilial() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchPagamentos = async () => {
      try {
        const response = await fetch("http://localhost:5000/relatorios/pagamentos-filial");
        if (!response.ok) throw new Error("Erro ao buscar dados");
        const json = await response.json();

        // Transformando os dados para o formato esperado pelo gráfico
        const formatado = json.map((item) => ({
          store: item.nome_filial,
          totalPayments: item.total_pago,
        }));

        setData(formatado);
      } catch (error) {
        console.error("Erro ao carregar dados de pagamentos por filial:", error);
      }
    };

    fetchPagamentos();
  }, []);

  return (
    <div>
      <h3>Relatório de Pagamentos por Loja</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="store" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="totalPayments" stroke="#FF8042" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
