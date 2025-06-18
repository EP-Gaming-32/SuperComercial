// components/ItemComponent.js

"use client";
import React from "react";
import styles from "./ItemComponent.module.css";

// ===============================================
// FUNÇÃO PARA FORMATAR A DATA PARA EXIBIÇÃO (VERSÃO MAIS ROBUSTA)
// ===============================================
// Esta função lida com datas no formato ISO 8601 (vindo da API) e DDMMYYYY (se precisar de fallback)
const formatarData = (dataString) => {
    if (!dataString) return '';

    // Tenta remover tags HTML (para segurança e limpeza)
    const cleanDataString = typeof dataString === 'string' 
                            ? dataString.replace(/<[^>]*>?/gm, '') 
                            : dataString;
    
    // Tenta parsear a string como um objeto Date
    const dataObjeto = new Date(cleanDataString);

    // Verifica se a data é válida (isNaN(getTime()) é a forma canônica de verificar validade de Date)
    if (isNaN(dataObjeto.getTime())) {
        // Fallback: se não conseguiu parsear, verifica se é DDMMYYYY e formata
        if (typeof cleanDataString === 'string' && cleanDataString.length === 8 && /^\d+$/.test(cleanDataString)) {
            const dia = cleanDataString.substring(0, 2);
            const mes = cleanDataString.substring(2, 4);
            const ano = cleanDataString.substring(4, 8);
            return `${dia}/${mes}/${ano}`;
        }
        return 'Data Inválida'; // Se não for nenhum dos formatos, é inválida
    }

    // Se for uma data válida, formata para DD/MM/YYYY
    const dia = String(dataObjeto.getUTCDate()).padStart(2, '0');
    const mes = String(dataObjeto.getUTCMonth() + 1).padStart(2, '0'); 
    const ano = dataObjeto.getUTCFullYear();

    return `${dia}/${mes}/${ano}`;
};


// Função para formatar telefone (já existe)
const formatTelefone = (value) => {
    if (!value) return '';
    const cleanValue = value.replace(/\D/g, ''); 
    if (cleanValue.length === 0) return '';
    if (cleanValue.length <= 10) { 
      return cleanValue
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else { 
      return cleanValue
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{4})$/, '$1-$2');
    }
};

// NOVA FUNÇÃO PARA FORMATAR MOEDA
const formatCurrency = (value) => {
    // Garante que o valor é um número. Se for nulo, indefinido, ou não um número, retorna R$ 0,00
    if (value === null || value === undefined || isNaN(Number(value))) {
        return 'R$ 0,00'; 
    }
    const numValue = Number(value);
    // Usa Intl.NumberFormat para formatação robusta de moeda no padrão brasileiro
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',   // Estilo de moeda
        currency: 'BRL',     // Código da moeda para Real Brasileiro
        minimumFractionDigits: 2, // Garante pelo menos 2 casas decimais
        maximumFractionDigits: 2, // Garante no máximo 2 casas decimais
    }).format(numValue);
};


export default function ItemComponent({ item, fields, onClick, endpoint, idField }) { // Certifique-se que idField está aqui
    const handleDelete = async (e) => {
        e.stopPropagation();

        const confirmDelete = window.confirm(
            "Tem certeza que deseja inativar este item?"
        );
        if (!confirmDelete) return;

        // Use idField vindo das props
        if (!idField || !item[idField]) { 
            alert("ID não identificado para inativação.");
            return;
        }

        const idValue = item[idField];

        try {
            const res = await fetch(
                `http://localhost:5000/${endpoint}/${idValue}`,
                { method: "DELETE" }
            );

            const contentType = res.headers.get("content-type");
            if (res.ok) {
                alert(
                    `${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)} inativado com sucesso!`
                );
                window.location.reload(); 
            } else {
                const errorText = await res.text();
                console.error("Erro detalhado do servidor:", errorText);

                if (contentType?.includes("application/json")) {
                    try {
                        const data = JSON.parse(errorText);
                        alert(data.message || "Erro ao inativar.");
                    } catch (jsonError) {
                        alert("Erro inesperado no servidor (JSON inválido). Veja console.");
                    }
                } else {
                    alert("Erro inesperado no servidor (não JSON). Veja console.");
                }
            }
        } catch (err) {
            console.error("Erro na inativação:", err);
            alert("Erro na conexão com o servidor.");
        }
    };

    return (
        <div className={styles.itemBlock} onClick={() => onClick(item)}>
            {fields.map((fieldObj, index) => {
                const key = typeof fieldObj === "string" ? fieldObj : fieldObj.value;
                const label = typeof fieldObj === "string" ? fieldObj : fieldObj.label;

                const fieldValue = item[key]; // Valor bruto do campo

                let displayedValue = fieldValue; // Valor a ser exibido, inicialmente o bruto

                // APLICA FORMATAÇÃO CONDICIONAL PARA DATAS, TELEFONES E MOEDA
                // Para datas
                if (key === 'data_pedido' || key === 'data_ordem' || key === 'data_movimentacao') { 
                    displayedValue = formatarData(fieldValue);
                } 
                // Para números de telefone
                else if (key === 'telefone_fornecedor' || key === 'telefone_filial') { 
                    displayedValue = formatTelefone(fieldValue);
                }
                // Para valores monetários
                else if (key === 'valor_produto') { 
                    displayedValue = formatCurrency(fieldValue);
                }

                return (
                    <div
                        key={`field-${key}-${index}`}
                        className={styles.fieldBlock}
                    >
                        <span className={styles.fieldLabel}>{label}:</span>
                        <span className={styles.fieldValue}>
                            {displayedValue} {/* Exibe o valor já formatado */}
                        </span>
                    </div>
                );
            })}

            <div className={styles.fieldBlock}>
                <button className={styles.deleteButton} onClick={handleDelete}>
                    Inativar
                </button>
            </div>
        </div>
    );
}