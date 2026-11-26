
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MovimentacaoEstoque.css';
import logoHope from '../../assets/logo-hope.png';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3333';

// =====================================================
// DATA LOCAL
// =====================================================

function pegarDataAtual() {
  const data = new Date();

  const ano = data.getFullYear();

  const mes = String(
    data.getMonth() + 1
  ).padStart(2, '0');

  const dia = String(
    data.getDate()
  ).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

// =====================================================
// USUÁRIO AUTENTICADO
// =====================================================

function pegarUsuarioLogado() {
  try {
    const usuario = localStorage.getItem('usuario');

    return usuario ? JSON.parse(usuario) : null;
  } catch {
    return null;
  }
}

// =====================================================
// REQUISIÇÕES PARA API
// =====================================================

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error(
      'Sessão expirada. Faça login novamente.'
    );
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || data?.sucesso === false) {
    throw new Error(
      data?.mensagem ||
      data?.message ||
      'Erro ao realizar operação.'
    );
  }

  if (!data) {
    throw new Error(
      'A API retornou uma resposta inválida.'
    );
  }

  return data;
}

// =====================================================
// NORMALIZAR PRODUTOS
// =====================================================

function normalizarProduto(produto) {
  return {
    id: Number(produto.produto_id),

    nome: produto.produto_nome ?? '',

    categoria:
      produto.produto_categoria ?? 'Sem categoria',

    quantidade:
      Number(produto.produto_est_atual ?? 0),

    precoCompra:
      Number(produto.produto_custo ?? 0),

    precoVenda:
      Number(produto.produto_preco ?? 0),
  };
}

// =====================================================
// FORMATAR MOEDA
// =====================================================

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(data) {
  if (!data) {
    return 'Não informada';
  }

  const dataFormatada = new Date(
    `${data}T00:00:00`
  );

  if (Number.isNaN(dataFormatada.getTime())) {
    return 'Data inválida';
  }

  return dataFormatada.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// =====================================================
// COMPONENTE
// =====================================================

function MovimentacaoEstoque() {
  const navigate = useNavigate();

  const usuario = pegarUsuarioLogado();

  const nomeUsuario =
    usuario?.usuario_nome ||
    usuario?.nome ||
    'Usuário';

  const inicialUsuario =
    nomeUsuario.trim().charAt(0).toUpperCase() ||
    'U';

  const tipoUsuario = Number(
    usuario?.usuario_tipo
  );

  const cargoUsuario =
    tipoUsuario === 1
      ? 'Administrador'
      : tipoUsuario === 2
        ? 'Barbeiro'
        : tipoUsuario === 3
          ? 'Cliente'
          : 'Usuário';

  // =====================================================
  // ESTADOS
  // =====================================================

  const [produtos, setProdutos] = useState([]);

  const [carregando, setCarregando] =
    useState(true);

  const [enviando, setEnviando] =
    useState(false);

  const [erroProdutos, setErroProdutos] =
    useState('');

  // Histórico temporário da página.
  // O banco armazena a quantidade atual do estoque,
  // mas não armazena o histórico individual.

  const [movimentos, setMovimentos] =
    useState([]);

  const [tipoMovimentacao, setTipoMovimentacao] =
    useState('entrada');

  const [filtro, setFiltro] =
    useState('todos');

  const [form, setForm] = useState({
    produtoId: '',
    quantidade: '',
    data: pegarDataAtual(),
    motivo: '',
  });

  // =====================================================
  // CARREGAR PRODUTOS
  // =====================================================

  async function carregarProdutos() {
    try {
      setCarregando(true);
      setErroProdutos('');

      const resposta = await request('/produtos');

      if (!Array.isArray(resposta?.dados)) {
        throw new Error(
          'A API retornou uma lista de produtos inválida.'
        );
      }

      const normalizados =
        resposta.dados.map(normalizarProduto);

      setProdutos(normalizados);

      setForm((estadoAtual) => {
        const aindaExiste = normalizados.some(
          (produto) =>
            String(produto.id) ===
            estadoAtual.produtoId
        );

        return aindaExiste
          ? estadoAtual
          : {
              ...estadoAtual,

              produtoId: normalizados[0]
                ? String(normalizados[0].id)
                : '',
            };
      });

    } catch (error) {
      console.error(
        'Erro ao carregar produtos:',
        error
      );

      setProdutos([]);

      setErroProdutos(
        error.message ||
        'Não foi possível carregar os produtos.'
      );

    } finally {
      setCarregando(false);
    }
  }

  // =====================================================
  // CARREGAMENTO INICIAL
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    carregarProdutos();
  }, [navigate]);

  // =====================================================
  // RESUMO DAS MOVIMENTAÇÕES DA SESSÃO
  // =====================================================

  const resumo = useMemo(() => {
    const entradas = movimentos.filter(
      (item) => item.tipo === 'entrada'
    );

    const saidas = movimentos.filter(
      (item) => item.tipo === 'saida'
    );

    const totalEntradas = entradas.reduce(
      (total, item) => total + item.quantidade,
      0
    );

    const totalSaidas = saidas.reduce(
      (total, item) => total + item.quantidade,
      0
    );

    const valorEntradas = entradas.reduce(
      (total, item) => total + item.valor,
      0
    );

    const valorSaidas = saidas.reduce(
      (total, item) => total + item.valor,
      0
    );

    const saldoEstoque =
      valorEntradas - valorSaidas;

    return {
      totalEntradas,
      totalSaidas,
      valorEntradas,
      valorSaidas,
      saldoEstoque,
    };
  }, [movimentos]);

  // =====================================================
  // FILTRAR MOVIMENTAÇÕES
  // =====================================================

  const movimentosFiltrados = movimentos.filter(
    (movimento) => {
      if (filtro === 'todos') {
        return true;
      }

      return movimento.tipo === filtro;
    }
  );

  // =====================================================
  // ALTERAR FORMULÁRIO
  // =====================================================

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setForm((estadoAtual) => ({
      ...estadoAtual,
      [name]: value,
    }));
  }

  // =====================================================
  // CANCELAR MOVIMENTAÇÃO
  // =====================================================

  function cancelarMovimentacao() {
    if (enviando) {
      return;
    }

    setForm((estadoAtual) => ({
      produtoId: estadoAtual.produtoId,
      quantidade: '',
      data: pegarDataAtual(),
      motivo: '',
    }));

    setTipoMovimentacao('entrada');
  }

  // =====================================================
  // REGISTRAR MOVIMENTAÇÃO
  // =====================================================

  async function registrarMovimentacao(event) {
    event.preventDefault();

    if (enviando || carregando) {
      return;
    }

    const produtoSelecionado = produtos.find(
      (produto) =>
        produto.id === Number(form.produtoId)
    );

    const quantidade = Number(form.quantidade);

    // Validar produto.

    if (!produtoSelecionado) {
      alert('Selecione um produto válido.');
      return;
    }

    // Validar quantidade inteira.

    if (
      !Number.isSafeInteger(quantidade) ||
      quantidade <= 0
    ) {
      alert(
        'Informe uma quantidade inteira maior que zero.'
      );

      return;
    }

    // Validar data.

    if (!form.data) {
      alert('Informe a data da movimentação.');
      return;
    }

    if (form.data > pegarDataAtual()) {
      alert(
        'A data não pode ser posterior à data atual.'
      );

      return;
    }

    // Validar motivo.

    if (!form.motivo.trim()) {
      alert(
        'Descreva o motivo da movimentação.'
      );

      return;
    }

    // Validar estoque disponível.

    if (
      tipoMovimentacao === 'saida' &&
      quantidade > produtoSelecionado.quantidade
    ) {
      alert(
        'A quantidade de saída não pode ser maior que o estoque atual.'
      );

      return;
    }

    try {
      setEnviando(true);

      // Atualizar quantidade no banco de dados.

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

      // Registrar no histórico temporário somente
      // depois da confirmação da API.

      setMovimentos((estadoAtual) => [
        {
          id: Date.now(),

          tipo: tipoMovimentacao,

          produto: produtoSelecionado.nome,

          categoria: produtoSelecionado.categoria,

          quantidade,

          data: form.data,

          motivo: form.motivo.trim(),

          valor:
            quantidade *
            produtoSelecionado.precoCompra,
        },

        ...estadoAtual,
      ]);

      // Limpar formulário.

      setForm({
        produtoId: String(produtoSelecionado.id),
        quantidade: '',
        data: pegarDataAtual(),
        motivo: '',
      });

      // Buscar as quantidades atualizadas no MySQL.

      await carregarProdutos();

      alert(
        tipoMovimentacao === 'entrada'
          ? 'Entrada de estoque realizada com sucesso!'
          : 'Saída de estoque realizada com sucesso!'
      );

    } catch (error) {
      console.error(
        'Erro ao registrar movimentação:',
        error
      );

      alert(
        error.message ||
        'Não foi possível registrar a movimentação.'
      );

    } finally {
      setEnviando(false);
    }
  }

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <main className="movimentacao-page">

      {/* HEADER */}

      <header className="movimentacao-header">

        <div className="header-logo">
          <img
            src={logoHope}
            alt="Hope Barbearia"
          />
        </div>

        <div className="header-title">
          <h1>Movimentação de estoque</h1>

          <p>
            Registro de entradas, saídas e controle de estoque
          </p>
        </div>

        <div className="header-user">

          <div className="user-avatar">
            {inicialUsuario}
          </div>

          <div className="user-info">
            <strong>{nomeUsuario}</strong>
            <span>{cargoUsuario}</span>
          </div>

        </div>

      </header>

      {/* CONTEÚDO */}

      <section className="movimentacao-content">

        <div className="page-heading">

          <div>

            <span className="heading-label">
              GESTÃO DE ESTOQUE
            </span>

            <h2>Estoque e movimentações</h2>

            <p>
              Controle de entradas, saídas e valores
              estimados do estoque.
            </p>

          </div>

          <button
            type="button"
            className="new-product-button"
            onClick={() =>
              navigate('/CadastroProduto')
            }
          >
            + Cadastrar novo produto
          </button>

        </div>

        {/* CARDS DE RESUMO */}

        <div className="summary-grid">

          <article className="summary-card accent">

            <span className="summary-label">
              Entradas da sessão
            </span>

            <strong>
              {resumo.totalEntradas}
            </strong>

            <small>
              {formatarMoeda(resumo.valorEntradas)}
            </small>

          </article>

          <article className="summary-card danger">

            <span className="summary-label">
              Saídas da sessão
            </span>

            <strong>
              {resumo.totalSaidas}
            </strong>

            <small>
              {formatarMoeda(resumo.valorSaidas)}
            </small>

          </article>

          <article className="summary-card neutral">

            <span className="summary-label">
              Variação do estoque
            </span>

            <strong>
              {formatarMoeda(resumo.saldoEstoque)}
            </strong>

            <small>
              Valor estimado pelo custo dos produtos
            </small>

          </article>

        </div>

        {/* FORMULÁRIO E RESUMO */}

        <div className="movement-layout">

          <section className="panel form-panel">

            <div className="panel-header">

              <div>

                <span className="panel-kicker">
                  REGISTRAR
                </span>

                <h3>Movimentação</h3>

              </div>

            </div>

            <form
              className="movement-form"
              onSubmit={registrarMovimentacao}
            >

              {/* TIPO DE MOVIMENTAÇÃO */}

              <div
                className="movement-type"
                aria-label="Tipo de movimentação"
              >

                <button
                  type="button"
                  className={
                    tipoMovimentacao === 'entrada'
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setTipoMovimentacao('entrada')
                  }
                  disabled={enviando}
                >
                  Entrada de produto
                </button>

                <button
                  type="button"
                  className={
                    tipoMovimentacao === 'saida'
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setTipoMovimentacao('saida')
                  }
                  disabled={enviando}
                >
                  Saída de produto
                </button>

              </div>

              {/* PRODUTO */}

              <div className="form-group">

                <label htmlFor="produtoId">
                  Produto
                </label>

                <select
                  id="produtoId"
                  name="produtoId"
                  value={form.produtoId}
                  onChange={alterarFormulario}
                  disabled={carregando || enviando}
                  required
                >

                  {produtos.length === 0 && (
                    <option value="">

                      {carregando
                        ? 'Carregando produtos...'
                        : erroProdutos
                          ? 'Erro ao carregar produtos'
                          : 'Nenhum produto cadastrado'}

                    </option>
                  )}

                  {produtos.map((produto) => (

                    <option
                      key={produto.id}
                      value={produto.id}
                    >
                      {produto.nome}
                    </option>

                  ))}

                </select>

              </div>

              <div className="form-row">

                {/* QUANTIDADE */}

                <div className="form-group">

                  <label htmlFor="quantidade">
                    Quantidade
                  </label>

                  <input
                    id="quantidade"
                    type="number"
                    name="quantidade"
                    min="1"
                    step="1"
                    value={form.quantidade}
                    onChange={alterarFormulario}
                    placeholder="Ex: 8"
                    disabled={enviando}
                    required
                  />

                </div>

                {/* DATA */}

                <div className="form-group">

                  <label htmlFor="data">
                    Data (registro local)
                  </label>

                  <input
                    id="data"
                    type="date"
                    name="data"
                    value={form.data}
                    max={pegarDataAtual()}
                    onChange={alterarFormulario}
                    disabled={enviando}
                    required
                  />

                </div>

              </div>

              {/* MOTIVO */}

              <div className="form-group">

                <label htmlFor="motivo">
                  Motivo (registro local)
                </label>

                <input
                  id="motivo"
                  type="text"
                  name="motivo"
                  value={form.motivo}
                  onChange={alterarFormulario}
                  placeholder="Ex: Compra de fornecedor"
                  disabled={enviando}
                  required
                />

              </div>

              {/* BOTÕES */}

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={cancelarMovimentacao}
                  disabled={enviando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    enviando ||
                    carregando ||
                    produtos.length === 0
                  }
                >
                  {enviando
                    ? 'Registrando...'
                    : 'Registrar movimentação'}
                </button>

              </div>

            </form>

          </section>

          {/* RESUMO ATUAL DO ESTOQUE */}

          <aside className="panel info-panel">

            <div className="panel-header">

              <div>

                <span className="panel-kicker">
                  ESTOQUE
                </span>

                <h3>Resumo atual</h3>

              </div>

            </div>

            <div className="stock-list">

              {carregando && (

                <div className="stock-item">
                  <span>
                    Carregando produtos...
                  </span>
                </div>

              )}

              {!carregando && erroProdutos && (

                <div className="stock-item">

                  <div>

                    <strong>
                      Não foi possível carregar o estoque.
                    </strong>

                    <small>{erroProdutos}</small>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={carregarProdutos}
                    >
                      Tentar novamente
                    </button>

                  </div>

                </div>

              )}

              {!carregando &&
                !erroProdutos &&
                produtos.length === 0 && (

                  <div className="stock-item">

                    <span>
                      Nenhum produto cadastrado.
                    </span>

                  </div>

                )}

              {!carregando &&
                produtos.map((produto) => (

                  <div
                    key={produto.id}
                    className="stock-item"
                  >

                    <div>

                      <strong>
                        {produto.nome}
                      </strong>

                      <small>
                        {produto.categoria}
                      </small>

                    </div>

                    <span>
                      {produto.quantidade} un.
                    </span>

                  </div>

                ))}

            </div>

          </aside>

        </div>

        {/* HISTÓRICO TEMPORÁRIO */}

        <section className="panel table-panel">

          <div className="panel-header table-header">

            <div>

              <span className="panel-kicker">
                HISTÓRICO DA SESSÃO
              </span>

              <h3>
                Últimas movimentações
              </h3>

              <p>
                As quantidades são salvas no banco de dados.
                O histórico abaixo é temporário e será limpo
                ao sair ou atualizar a página.
              </p>

            </div>

            <select
              value={filtro}
              onChange={(event) =>
                setFiltro(event.target.value)
              }
            >

              <option value="todos">
                Todas
              </option>

              <option value="entrada">
                Entradas
              </option>

              <option value="saida">
                Saídas
              </option>

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
                  <th>Custo estimado</th>
                </tr>

              </thead>

              <tbody>

                {/* HISTÓRICO VAZIO */}

                {movimentosFiltrados.length === 0 && (

                  <tr>

                    <td
                      colSpan={6}
                      style={{
                        textAlign: 'center',
                        padding: '24px',
                      }}
                    >

                      {movimentos.length === 0
                        ? 'Nenhuma movimentação realizada nesta sessão.'
                        : 'Nenhuma movimentação encontrada para este filtro.'}

                    </td>

                  </tr>

                )}

                {/* LISTAGEM */}

                {movimentosFiltrados.map(
                  (movimento) => (

                    <tr key={movimento.id}>

                      <td>

                        <div className="product-cell">

                          <span className="product-bullet">

                            {movimento.tipo === 'entrada'
                              ? '+'
                              : '-'}

                          </span>

                          <div>

                            <strong>
                              {movimento.produto}
                            </strong>

                            <small>
                              {movimento.categoria}
                            </small>

                          </div>

                        </div>

                      </td>

                      <td>

                        <span
                          className={`badge ${movimento.tipo}`}
                        >

                          {movimento.tipo === 'entrada'
                            ? 'Entrada'
                            : 'Saída'}

                        </span>

                      </td>

                      <td>
                        {movimento.quantidade}
                      </td>

                      <td>
                        {formatarData(movimento.data)}
                      </td>

                      <td>
                        {movimento.motivo}
                      </td>

                      <td>
                        {formatarMoeda(movimento.valor)}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      </section>

    </main>
  );
}

export default MovimentacaoEstoque;
