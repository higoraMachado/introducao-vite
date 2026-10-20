import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MovimentacaoEstoque.css';
import logoHope from '../../assets/logo-hope.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

const hoje = new Date().toISOString().slice(0, 10);

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.mensagem || data?.message || 'Erro ao realizar operação.'
    );
  }

  return data;
}

// Converte o produto da API para o formato usado na tela
function normalizarProduto(produto) {
  return {
    id: produto.produto_id,
    nome: produto.produto_nome ?? '',
    categoria: produto.produto_categoria ?? 'Sem categoria',
    quantidade: Number(produto.produto_est_atual ?? 0),
    precoCompra: Number(produto.produto_custo ?? 0),
    precoVenda: Number(produto.produto_preco ?? 0),
  };
}

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
  const navigate = useNavigate();

  // Produtos vêm SOMENTE da API
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Movimentações feitas nesta sessão (a API ainda não guarda histórico)
  const [movimentos, setMovimentos] = useState([]);

  const [tipoMovimentacao, setTipoMovimentacao] = useState('entrada');
  const [filtro, setFiltro] = useState('todos');
  const [form, setForm] = useState({
    produtoId: '',
    quantidade: '',
    data: hoje,
    motivo: '',
  });

  async function carregarProdutos() {
    try {
      setCarregando(true);

      const resposta = await request('/produtos');
      const lista = Array.isArray(resposta?.dados) ? resposta.dados : [];
      const normalizados = lista.map(normalizarProduto);

      setProdutos(normalizados);

      // Garante que o select tenha um produto válido selecionado
      setForm((estadoAtual) => {
        const aindaExiste = normalizados.some(
          (produto) => String(produto.id) === estadoAtual.produtoId
        );

        return aindaExiste
          ? estadoAtual
          : {
              ...estadoAtual,
              produtoId: normalizados[0] ? String(normalizados[0].id) : '',
            };
      });
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      alert(error.message || 'Não foi possível carregar os produtos.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

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

  async function registrarMovimentacao(event) {
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

    if (tipoMovimentacao === 'saida' && quantidade > produtoSelecionado.quantidade) {
      alert('A quantidade de saída não pode ser maior que o estoque atual.');
      return;
    }

    try {
      setEnviando(true);

      await request(
        `/produtos/${produtoSelecionado.id}/estoque/${tipoMovimentacao}`,
        {
          method: 'POST',
          body: JSON.stringify({
            tipo: tipoMovimentacao,
            quantidade,
            motivo: form.motivo.trim(),
          }),
        }
      );

      setMovimentos((estadoAtual) => [
        {
          id: Date.now(),
          tipo: tipoMovimentacao,
          produto: produtoSelecionado.nome,
          categoria: produtoSelecionado.categoria,
          quantidade,
          data: form.data,
          motivo: form.motivo.trim(),
          valor: quantidade * produtoSelecionado.precoCompra,
        },
        ...estadoAtual,
      ]);

      setForm({
        produtoId: String(produtoSelecionado.id),
        quantidade: '',
        data: hoje,
        motivo: '',
      });

      // Atualiza as quantidades com o que está no banco
      await carregarProdutos();
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      alert(error.message || 'Não foi possível registrar a movimentação.');
    } finally {
      setEnviando(false);
    }
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
            onClick={() => navigate('/CadastroProduto')}
          >
            + Cadastrar novo produto
          </button>
        </div>

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
                  {produtos.length === 0 && (
                    <option value="">
                      {carregando ? 'Carregando produtos...' : 'Nenhum produto cadastrado'}
                    </option>
                  )}
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
                <button
                  type="submit"
                  className="primary-button"
                  disabled={enviando || produtos.length === 0}
                >
                  {enviando ? 'Registrando...' : 'Registrar movimentação'}
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
              {!carregando && produtos.length === 0 && (
                <div className="stock-item">
                  <span>Nenhum produto cadastrado.</span>
                </div>
              )}
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