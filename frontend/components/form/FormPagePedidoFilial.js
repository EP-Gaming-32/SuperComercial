'use client';
import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';
import HistoricoSection from '@/components/searchPage/HistoricoSection';

export default function FormPagePedidoFilial({
  data,
  filial = [],
  produtos = [],
  mode,
  onSubmit,
  onCancel
}) {
  const [formData, setFormData] = useState({
    id_filial: '',
    observacao: '',
    data_pedido: new Date().toISOString().split('T')[0],
    status: 'Pendente'
  });

  const [produtosPedido, setProdutosPedido] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);

  useEffect(() => {
    if (data) {
      setFormData({
        id_filial: data.id_filial || '',
        observacao: data.observacao || '',
        data_pedido: data.data_pedido ? data.data_pedido.split('T')[0] : '',
        status: data.status || 'Pendente'
      });
      if (data.produtos && Array.isArray(data.produtos)) {
        setProdutosPedido(data.produtos);
      }
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdicionarProduto = () => {
    if (!produtoSelecionado || quantidadeSelecionada <= 0) return;

    const produto = produtos.find(p => p.id_produto === parseInt(produtoSelecionado));
    if (!produto) return;

    const produtoExistente = produtosPedido.find(p => p.id_produto === parseInt(produtoSelecionado));

    if (produtoExistente) {
      setProdutosPedido(prev =>
        prev.map(p =>
          p.id_produto === parseInt(produtoSelecionado)
            ? { ...p, quantidade: p.quantidade + quantidadeSelecionada }
            : p
        )
      );
    } else {
      const novoProduto = {
        id_produto: produto.id_produto,
        nome_produto: produto.nome_produto,
        sku: produto.sku,
        valor_produto: produto.valor_produto,
        quantidade: quantidadeSelecionada
      };
      setProdutosPedido(prev => [...prev, novoProduto]);
    }

    setProdutoSelecionado('');
    setQuantidadeSelecionada(1);
  };

  const handleRemoverProduto = (id_produto) => {
    setProdutosPedido(prev => prev.filter(p => p.id_produto !== id_produto));
  };

  const handleAlterarQuantidade = (id_produto, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      handleRemoverProduto(id_produto);
      return;
    }

    setProdutosPedido(prev =>
      prev.map(p =>
        p.id_produto === id_produto
          ? { ...p, quantidade: novaQuantidade }
          : p
      )
    );
  };

  const calcularValorTotal = () => {
    return produtosPedido.reduce((total, produto) => {
      return total + (produto.valor_produto * produto.quantidade);
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dadosCompletos = {
      ...formData,
      produtos: produtosPedido,
      valor_total: calcularValorTotal()
    };

    onSubmit(dadosCompletos);
  };

  const campoConfig = [
    {
      name: 'id_filial',
      label: 'Filial',
      type: 'select',
      options: filial,
      optionKey: 'id_filial',
      optionLabel: 'nome_filial',
      required: true
    },
    {
      name: 'data_pedido',
      label: 'Data do Pedido',
      type: 'date',
      required: true
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'Pendente', label: 'Pendente' },
        { value: 'Atendido', label: 'Atendido' },
        { value: 'Cancelado', label: 'Cancelado' }
      ],
      optionKey: 'value',
      optionLabel: 'label'
    },
    {
      name: 'observacao',
      label: 'Observação',
      type: 'textarea',
      maxLength: 255
    }
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Campos básicos do pedido */}
      {campoConfig.map(({ name, label, type, options, optionKey, optionLabel, maxLength, required }) => (
        <div key={name} className={styles.field}>
          <label htmlFor={name} className={styles.label}>
            {label} {required && <span className={styles.required}>*</span>}
          </label>
          {type === 'select' ? (
            <select
              id={name}
              name={name}
              value={formData[name] ?? ''}
              onChange={handleChange}
              className={styles.input}
              required={required}
            >
              <option value="">Selecione...</option>
              {options.map(opt => (
                <option key={opt[optionKey]} value={opt[optionKey]}>
                  {opt[optionLabel]}
                </option>
              ))}
            </select>
          ) : type === 'textarea' ? (
            <textarea
              id={name}
              name={name}
              value={formData[name] ?? ''}
              onChange={handleChange}
              className={styles.input}
              rows={3}
              {...(maxLength ? { maxLength } : {})}
              style={{ resize: 'none' }}
            />
          ) : (
            <input
              id={name}
              name={name}
              type={type}
              value={formData[name] ?? ''}
              onChange={handleChange}
              className={styles.input}
              required={required}
              {...(type === 'text' && maxLength ? { maxLength } : {})}
            />
          )}
        </div>
      ))}

      {/* Seção de Produtos */}
      <div className={styles.produtosSection}>
        <h3 className={styles.sectionTitle}>Produtos do Pedido</h3>

        {/* Adicionar produto */}
        <div className={styles.adicionarProduto}>
          <div className={styles.produtoInputGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Produto</label>
              <select
                value={produtoSelecionado}
                onChange={(e) => setProdutoSelecionado(e.target.value)}
                className={styles.input}
              >
                <option value="">Selecione um produto...</option>
                {produtos.map(produto => (
                  <option key={produto.id_produto} value={produto.id_produto}>
                    {produto.nome_produto} - {produto.sku}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Quantidade</label>
              <input
                type="number"
                min="1"
                value={quantidadeSelecionada}
                onChange={(e) => setQuantidadeSelecionada(parseInt(e.target.value) || 1)}
                className={styles.input}
              />
            </div>

            <button
              type="button"
              onClick={handleAdicionarProduto}
              className={styles.addButton}
              disabled={!produtoSelecionado}
            >
              Adicionar
            </button>
          </div>
        </div>

        {/* ✅ ALTERAÇÃO AQUI: Lista de produtos adicionados com novo layout */}
        {produtosPedido.length > 0 && (
          <div className={styles.produtosAdicionadosContainer}>
            <h4 className={styles.listTitle}>Produtos Adicionados:</h4>

            <div className={styles.productGrid}>
              {produtosPedido.map(produto => (
                <div key={produto.id_produto} className={styles.productCard}>
                  <span className={styles.produtoNome}>{produto.nome_produto}</span>

                  <div className={styles.detailRow}>
                    <span>SKU:</span>
                    <span>{produto.sku}</span>
                  </div>

                  <div className={styles.detailRow}>
                    <span>Valor Unit.:</span>
                    <span>R$ {produto.valor_produto.toFixed(2)}</span>
                  </div>

                  <div className={styles.detailRow}>
                    <span>Subtotal:</span>
                    <span>R$ {(produto.valor_produto * produto.quantidade).toFixed(2)}</span>
                  </div>

                  <div className={styles.detailRow}>
                    <label htmlFor={`qty-${produto.id_produto}`}>Quantidade:</label>
                    <input
                      id={`qty-${produto.id_produto}`}
                      type="number"
                      min="1"
                      value={produto.quantidade}
                      onChange={(e) => handleAlterarQuantidade(produto.id_produto, parseInt(e.target.value) || 1)}
                      className={styles.quantityInput}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoverProduto(produto.id_produto)}
                    className={styles.removeButton}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.tableFooter} style={{ marginTop: '2rem', textAlign: 'center' }}>
              <span className={styles.totalLabel} style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Total do Pedido: </span>
              <span className={styles.totalValue} style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                R$ {calcularValorTotal().toFixed(2)}
              </span>
            </div>

          </div>
        )}
      </div>

      {/* Histórico entre produtos e botões */}
      {mode === 'edit' && data?.id_pedido_filial && (
        <div className={styles.historicoWrapper}>
          <HistoricoSection id_pedido_filial={data.id_pedido_filial} />
        </div>
      )}

      <div className={styles.buttonGroup}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.backButton}>
            Voltar
          </button>
        )}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={produtosPedido.length === 0}
        >
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Pedido
        </button>
      </div>
    </form>
  );
}