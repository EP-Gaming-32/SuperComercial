"use client";
import React from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

export default function EstoqueTreemap() {
  // Mock data: Each store has child categories with stock values.
  const data = [
    {
      name: "Loja A",
      children: [
        { name: "Eletrônicos", stock: 400 },
        { name: "Alimentos", stock: 300 },
        { name: "Higiene", stock: 200 },
      ],
    },
    {
      name: "Loja B",
      children: [
        { name: "Eletrônicos", stock: 250 },
        { name: "Alimentos", stock: 450 },
        { name: "Higiene", stock: 150 },
      ],
    },
    {
      name: "Loja C",
      children: [
        { name: "Eletrônicos", stock: 500 },
        { name: "Alimentos", stock: 350 },
        { name: "Higiene", stock: 100 },
      ],
    },
  ];

  return (
    <div>
      <h3>Relatório de Estoque por Loja</h3>
      <ResponsiveContainer width="100%" height={400}>
        <Treemap
          data={data}
          dataKey="stock"
          nameKey="name"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#82ca9d"
          content={<CustomTreemapContent />}
        >
          <Tooltip />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}

const CustomTreemapContent = (props) => {
  const { depth, x, y, width, height, name, stock } = props;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={depth === 1 ? "#82ca9d" : "#8dd1e1"}
        stroke="#fff"
      />
      {width > 60 && height > 20 ? (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
        >
          {name} {stock ? `(${stock})` : ""}
        </text>
      ) : null}
    </g>
  );
};
