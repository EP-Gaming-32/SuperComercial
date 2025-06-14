"use client";
import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PrevisaoPedidos() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const res = await fetch("http://localhost:5000/relatorios/previsao-pedidos");
        const data = await res.json();

        const filialSelecionada = data.find(filial => filial.id_filial === 1);
        if (filialSelecionada) {
          const formatado = filialSelecionada.dados.map(item => ({
            mes: item.mes,
            pedidos: item.total_pedidos,
            previsao: item.previsao,
          }));
          setDados(formatado);
        }
      } catch (error) {
        console.error("Erro ao carregar dados de previsão:", error);
      }
    };

    carregarDados();
  }, []);

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">Previsão de Pedidos - Filial 1</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip
            formatter={(value, name, props) => [
              `${value} pedidos`,
              props.payload.previsao ? "Previsão" : "Histórico",
            ]}
          />
          <Area
            type="monotone"
            dataKey="pedidos"
            stroke="#8884d8"
            fill="#8884d8"
            strokeDasharray="3 3"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
