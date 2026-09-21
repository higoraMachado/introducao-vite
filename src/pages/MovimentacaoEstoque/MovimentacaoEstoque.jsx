import { useMemo, useState } from 'react';
import './MovimentacaoEstoque.css';
import logoHope from '../../assets/logo-hope.png';

const produtosIniciais = [
  {
    id: 1,
    nome: 'Pomada Modeladora',
    categoria: 'Finalização',
    quantidade: 15,
    precoCompra: 15,
    precoVenda: 25,
  },
  {
    id: 2,
    nome: 'Shampoo Masculino',
    categoria: 'Higiene',
    quantidade: 8,
    precoCompra: 18,
    precoVenda: 30,
  },
  {
    id: 3,
    nome: 'Cera para Barba',
    categoria: 'Barba',
    quantidade: 11,
    precoCompra: 12,
    precoVenda: 22,
  },
  {
    id: 4,
    nome: 'Óleo para Barba',
    categoria: 'Barba',
    quantidade: 4,
    precoCompra: 20,
    precoVenda: 35,
  },
];

const hoje = new Date().toISOString().slice(0, 10);

const movimentosIniciais = [
  {
    id: 1,
    tipo: 'entrada',
    produto: 'Pomada Modeladora',
    categoria: 'Finalização',
    quantidade: 10,
    data: '2026-09-18',
    motivo: 'Reposição de fornecedor',
    valor: 150,
  },
  {
    id: 2,
    tipo: 'saida',
    produto: 'Shampoo Masculino',
    categoria: 'Higiene',
    quantidade: 3,
    data: '2026-09-17',
    motivo: 'Uso em atendimento',
    valor: 54,
  },
  {
    id: 3,
    tipo: 'entrada',
    produto: 'Cera para Barba',
    categoria: 'Barba',
    quantidade: 6,
    data: '2026-09-15',
    motivo: 'Compra de lotes adicionais',
    valor: 72,
  },
];

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function formatarData(data) {
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function MovimentacaoEstoque() {
  const [produtos, setProdutos] = useState(produtosIniciais);
  const [movimentos, setMovimentos] = useState(movimentosIniciais);
  const [tipoMovimentacao, setTipoMovimentacao] = useState('entrada');
  const [filtro, setFiltro] = useState('todos');
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [novoProdutoForm, setNovoProdutoForm] = useState({
    nome: '',
    categoria: 'Finalização',
    quantidade: '',
    precoCompra: '',
    precoVenda: '',
  });
  const [form, setForm] = useState({
    produtoId: '1',
    quantidade: '',
    data: hoje,
    motivo: '',
  });

  const resumo = useMemo(() => {
    const entradas = movimentos.filter((item) => item.tipo === 'entrada');
    const saidas = movimentos.filter((item) => item.tipo === 'saida');

    const totalEntradas = entradas.reduce((total, item) => total + item.quantidade, 0);
    const totalSaidas = saidas.reduce((total, item) => total + item.quantidade, 0);
    const valorEntradas = entradas.reduce((total, item) => total + item.valor, 0);
    const valorSaidas = saidas.reduce((total, item) => total + item.valor, 0);
    const saldoFinanceiro = valorEntradas - valorSaidas;

    return {
      totalEntradas,
      totalSaidas,
      valorEntradas,
      valorSaidas,
      saldoFinanceiro,
    };
  }, [movimentos]);

  const movimentosFiltrados = movimentos.filter((movimento) => {
    if (filtro === 'todos') return true;
    return movimento.tipo === filtro;
  });

  function alterarFormulario(event) {
    const { name, value } = event.target;
    setForm((estadoAtual) => ({
      ...estadoAtual,
      [name]: value,
    }));
  }

  function alterarNovoProduto(event) {
    const { name, value } = event.target;
    setNovoProdutoForm((estadoAtual) => ({
      ...estadoAtual,
      [name]: value,
    }));
  }

  function cadastrarProduto(event) {
    event.preventDefault();

    const nome = novoProdutoForm.nome.trim();
    const quantidade = Number(novoProdutoForm.quantidade);
    const precoCompra = Number(novoProdutoForm.precoCompra);
    const precoVenda = Number(novoProdutoForm.precoVenda);

    if (!nome) {
      alert('Informe o nome do produto.');
      return;
    }

    if (!novoProdutoForm.categoria) {
      alert('Selecione a categoria do produto.');
      return;
    }

    if (!quantidade || quantidade <= 0) {
      alert('Informe uma quantidade inicial válida.');
      return;
    }

    if (!precoCompra || precoCompra <= 0) {
      alert('Informe o preço de compra válido.');
      return;
    }

    if (!precoVenda || precoVenda <= 0) {
      alert('Informe o preço de venda válido.');
      return;
    }

    const produtoNovo = {
      id: Date.now(),
      nome,
      categoria: novoProdutoForm.categoria,
      quantidade,
      precoCompra,
      precoVenda,
    };

    setProdutos((estadoAtual) => [...estadoAtual, produtoNovo]);
    setForm((estadoAtual) => ({
      ...estadoAtual,
      produtoId: String(produtoNovo.id),
    }));
    setNovoProdutoForm({
      nome: '',
      categoria: 'Finalização',
      quantidade: '',
      precoCompra: '',
      precoVenda: '',
    });
    setModalCadastroAberto(false);
  }

  function registrarMovimentacao(event) {
    event.preventDefault();

    const produtoSelecionado = produtos.find(
      (produto) => produto.id === Number(form.produtoId)
    );

    const quantidade = Number(form.quantidade);

    if (!produtoSelecionado) {
      alert('Selecione um produto válido.');
      return;
    }

    if (!quantidade || quantidade <= 0) {
      alert('Informe uma quantidade válida.');
      return;
    }

    if (!form.data) {
      alert('Informe a data da movimentação.');
      return;
    }

    if (!form.motivo.trim()) {
      alert('Descreva o motivo da movimentação.');
      return;
    }

    setProdutos((estadoAtual) =>
      estadoAtual.map((produto) => {
        if (produto.id !== produtoSelecionado.id) {
          return produto;
        }

        const novaQuantidade =
          tipoMovimentacao === 'entrada'
            ? produto.quantidade + quantidade
            : produto.quantidade - quantidade;

        if (tipoMovimentacao === 'saida' && novaQuantidade < 0) {
          alert('A quantidade de saída não pode ser maior que o estoque atual.');
          return produto;
        }

        return {
          ...produto,
          quantidade: novaQuantidade,
        };
      })
    );

    const valorMovimento = quantidade * produtoSelecionado.precoCompra;

    const novoMovimento = {
      id: Date.now(),
      tipo: tipoMovimentacao,
      produto: produtoSelecionado.nome,
      categoria: produtoSelecionado.categoria,
      quantidade,
      data: form.data,
      motivo: form.motivo.trim(),
      valor: valorMovimento,
    };

    setMovimentos((estadoAtual) => [novoMovimento, ...estadoAtual]);
    setForm({
      produtoId: String(produtoSelecionado.id),
      quantidade: '',
      data: hoje,
      motivo: '',
    });
  }

  return (
    <main className="movimentacao-page">
      <header className="movimentacao-header">
        <div className="header-logo">
          <img src={logoHope} alt="Hope Barbearia" />
        </div>

        <div className="header-title">
          <h1>Movimentação de estoque</h1>
          <p>Registro de entradas, saídas e acompanhamento financeiro</p>
        </div>

        <div className="header-user">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <strong>Administrador</strong>
            <span>Financeiro</span>
          </div>
        </div>
      </header>

      <section className="movimentacao-content">
        <div className="page-heading">
          <div>
            <span className="heading-label">GESTÃO FINANCEIRA</span>
            <h2>Estoque e movimentações</h2>
            <p>Controle de entradas, saídas e o impacto financeiro do estoque.</p>
          </div>

          <button
            type="button"
            className="new-product-button"
            onClick={() => setModalCadastroAberto(true)}
          >
            + Cadastrar novo produto
          </button>
        </div>

        {modalCadastroAberto && (
          <div className="modal-overlay" onClick={() => setModalCadastroAberto(false)}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModalCadastroAberto(false)}
              >
                ×
              </button>

              <div className="modal-icon">+</div>
              <h3>Cadastrar produto</h3>
              <p>Adicione um novo item ao estoque.</p>

              <form className="modal-form" onSubmit={cadastrarProduto}>
                <div className="form-group">
                  <label htmlFor="novo-nome">Nome</label>
                  <input
                    id="novo-nome"
                    type="text"
                    name="nome"
                    value={novoProdutoForm.nome}
                    onChange={alterarNovoProduto}
                    placeholder="Ex: Gel fixador"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="novo-categoria">Categoria</label>
                  <select
                    id="novo-categoria"
                    name="categoria"
                    value={novoProdutoForm.categoria}
                    onChange={alterarNovoProduto}
                  >
                    <option value="Finalização">Finalização</option>
                    <option value="Higiene">Higiene</option>
                    <option value="Barba">Barba</option>
                    <option value="Acessórios">Acessórios</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="novo-quantidade">Quantidade</label>
                    <input
                      id="novo-quantidade"
                      type="number"
                      name="quantidade"
                      min="1"
                      value={novoProdutoForm.quantidade}
                      onChange={alterarNovoProduto}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="novo-precoCompra">Preço de compra</label>
                    <input
                      id="novo-precoCompra"
                      type="number"
                      name="precoCompra"
                      min="0.01"
                      step="0.01"
                      value={novoProdutoForm.precoCompra}
                      onChange={alterarNovoProduto}
                      placeholder="R$ 0,00"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="novo-precoVenda">Preço de venda</label>
                  <input
                    id="novo-precoVenda"
                    type="number"
                    name="precoVenda"
                    min="0.01"
                    step="0.01"
                    value={novoProdutoForm.precoVenda}
                    onChange={alterarNovoProduto}
                    placeholder="R$ 0,00"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setModalCadastroAberto(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="primary-button">
                    Salvar produto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="summary-grid">
          <article className="summary-card accent">
            <span className="summary-label">Entradas</span>
            <strong>{resumo.totalEntradas}</strong>
            <small>{formatarMoeda(resumo.valorEntradas)}</small>
          </article>

          <article className="summary-card danger">
            <span className="summary-label">Saídas</span>
            <strong>{resumo.totalSaidas}</strong>
            <small>{formatarMoeda(resumo.valorSaidas)}</small>
          </article>

          <article className="summary-card neutral">
            <span className="summary-label">Saldo financeiro</span>
            <strong>{formatarMoeda(resumo.saldoFinanceiro)}</strong>
            <small>Impacto estimado do estoque</small>
          </article>
        </div>

        <div className="movement-layout">
          <section className="panel form-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">REGISTRAR</span>
                <h3>Movimentação</h3>
              </div>
            </div>

            <form className="movement-form" onSubmit={registrarMovimentacao}>
              <div className="movement-type" aria-label="Tipo de movimentação">
                <button
                  type="button"
                  className={tipoMovimentacao === 'entrada' ? 'active' : ''}
                  onClick={() => setTipoMovimentacao('entrada')}
                >
                  Entrada de produto
                </button>
                <button
                  type="button"
                  className={tipoMovimentacao === 'saida' ? 'active' : ''}
                  onClick={() => setTipoMovimentacao('saida')}
                >
                  Saída de produto
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="produtoId">Produto</label>
                <select
                  id="produtoId"
                  name="produtoId"
                  value={form.produtoId}
                  onChange={alterarFormulario}
                >
                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quantidade">Quantidade</label>
                  <input
                    id="quantidade"
                    type="number"
                    name="quantidade"
                    min="1"
                    value={form.quantidade}
                    onChange={alterarFormulario}
                    placeholder="Ex: 8"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="data">Data</label>
                  <input
                    id="data"
                    type="date"
                    name="data"
                    value={form.data}
                    onChange={alterarFormulario}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="motivo">Motivo</label>
                <input
                  id="motivo"
                  type="text"
                  name="motivo"
                  value={form.motivo}
                  onChange={alterarFormulario}
                  placeholder="Ex: Compra de fornecedor"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="secondary-button">
                  Cancelar
                </button>
                <button type="submit" className="primary-button">
                  Registrar movimentação
                </button>
              </div>
            </form>
          </section>

          <aside className="panel info-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">ESTOQUE</span>
                <h3>Resumo atual</h3>
              </div>
            </div>

            <div className="stock-list">
              {produtos.map((produto) => (
                <div key={produto.id} className="stock-item">
                  <div>
                    <strong>{produto.nome}</strong>
                    <small>{produto.categoria}</small>
                  </div>
                  <span>{produto.quantidade} un.</span>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <section className="panel table-panel">
          <div className="panel-header table-header">
            <div>
              <span className="panel-kicker">HISTÓRICO</span>
              <h3>Últimas movimentações</h3>
            </div>

            <select value={filtro} onChange={(event) => setFiltro(event.target.value)}>
              <option value="todos">Todas</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Data</th>
                  <th>Motivo</th>
                  <th>Financeiro</th>
                </tr>
              </thead>
              <tbody>
                {movimentosFiltrados.map((movimento) => (
                  <tr key={movimento.id}>
                    <td>
                      <div className="product-cell">
                        <span className="product-bullet">{movimento.tipo === 'entrada' ? '+' : '-'}</span>
                        <div>
                          <strong>{movimento.produto}</strong>
                          <small>{movimento.categoria}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${movimento.tipo}`}>
                        {movimento.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td>{movimento.quantidade}</td>
                    <td>{formatarData(movimento.data)}</td>
                    <td>{movimento.motivo}</td>
                    <td>{formatarMoeda(movimento.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

export default MovimentacaoEstoque;
