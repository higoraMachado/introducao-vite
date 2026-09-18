import { useState } from 'react';
import './Estoque.css';

import logoHope from '../../assets/logo-hope.png';

function Estoque() {

  // ========================================
  // PRODUTOS
  // ========================================

  const [produtos, setProdutos] = useState([
    {
      id: 1,
      nome: 'Pomada Modeladora',
      descricao: 'Pomada para modelagem dos cabelos',
      categoria: 'Finalização',
      quantidade: 15,
      precoCompra: 15.00,
      precoVenda: 25.00,
      estoqueMinimo: 5
    },
    {
      id: 2,
      nome: 'Shampoo Masculino',
      descricao: 'Shampoo para uso profissional',
      categoria: 'Higiene',
      quantidade: 3,
      precoCompra: 18.00,
      precoVenda: 30.00,
      estoqueMinimo: 5
    },
    {
      id: 3,
      nome: 'Cera para Barba',
      descricao: 'Cera para acabamento da barba',
      categoria: 'Barba',
      quantidade: 8,
      precoCompra: 12.00,
      precoVenda: 22.00,
      estoqueMinimo: 4
    },
    {
      id: 4,
      nome: 'Óleo para Barba',
      descricao: 'Óleo hidratante para barba',
      categoria: 'Barba',
      quantidade: 2,
      precoCompra: 20.00,
      precoVenda: 35.00,
      estoqueMinimo: 5
    }
  ]);

  // ========================================
  // ESTADOS
  // ========================================

  const [busca, setBusca] = useState('');

  const [categoriaFiltro, setCategoriaFiltro] =
    useState('Todas');

  const [modalProduto, setModalProduto] =
    useState(false);

  const [modalMovimentacao, setModalMovimentacao] =
    useState(false);

  const [produtoSelecionado, setProdutoSelecionado] =
    useState(null);

  const [tipoMovimentacao, setTipoMovimentacao] =
    useState('entrada');

  // ========================================
  // FORMULÁRIO PRODUTO
  // ========================================

  const [produtoForm, setProdutoForm] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    quantidade: '',
    precoCompra: '',
    precoVenda: '',
    estoqueMinimo: ''
  });

  // ========================================
  // FORMULÁRIO MOVIMENTAÇÃO
  // ========================================

  const [movimentacaoForm, setMovimentacaoForm] =
    useState({
      quantidade: '',
      motivo: ''
    });

  // ========================================
  // ALTERAR FORMULÁRIO
  // ========================================

  function alterarProduto(event) {

    const { name, value } = event.target;

    setProdutoForm({
      ...produtoForm,
      [name]: value
    });
  }

  function alterarMovimentacao(event) {

    const { name, value } = event.target;

    setMovimentacaoForm({
      ...movimentacaoForm,
      [name]: value
    });
  }

  // ========================================
  // CADASTRAR PRODUTO
  // ========================================

  function cadastrarProduto(event) {

    event.preventDefault();

    const novoProduto = {
      id: Date.now(),

      nome: produtoForm.nome,

      descricao: produtoForm.descricao,

      categoria: produtoForm.categoria,

      quantidade: Number(produtoForm.quantidade),

      precoCompra: Number(produtoForm.precoCompra),

      precoVenda: Number(produtoForm.precoVenda),

      estoqueMinimo: Number(produtoForm.estoqueMinimo)
    };

    setProdutos([
      ...produtos,
      novoProduto
    ]);

    setProdutoForm({
      nome: '',
      descricao: '',
      categoria: '',
      quantidade: '',
      precoCompra: '',
      precoVenda: '',
      estoqueMinimo: ''
    });

    setModalProduto(false);
  }

  // ========================================
  // MOVIMENTAÇÃO
  // ========================================

  function registrarMovimentacao(event) {

    event.preventDefault();

    const quantidade =
      Number(movimentacaoForm.quantidade);

    if (!quantidade || quantidade <= 0) {
      alert('Informe uma quantidade válida.');
      return;
    }

    if (!produtoSelecionado) {
      return;
    }

    setProdutos(
      produtos.map((produto) => {

        if (produto.id !== produtoSelecionado.id) {
          return produto;
        }

        let novaQuantidade =
          produto.quantidade;

        if (tipoMovimentacao === 'entrada') {
          novaQuantidade += quantidade;
        }

        if (tipoMovimentacao === 'saida') {

          novaQuantidade -= quantidade;

          if (novaQuantidade < 0) {
            alert(
              'A quantidade de saída não pode ser maior que o estoque.'
            );

            return produto;
          }
        }

        return {
          ...produto,
          quantidade: novaQuantidade
        };

      })
    );

    setMovimentacaoForm({
      quantidade: '',
      motivo: ''
    });

    setModalMovimentacao(false);
  }

  // ========================================
  // ABRIR MOVIMENTAÇÃO
  // ========================================

  function abrirMovimentacao(produto) {

    setProdutoSelecionado(produto);

    setTipoMovimentacao('entrada');

    setMovimentacaoForm({
      quantidade: '',
      motivo: ''
    });

    setModalMovimentacao(true);
  }

  // ========================================
  // STATUS
  // ========================================

  function obterStatus(produto) {

    if (produto.quantidade === 0) {
      return 'Esgotado';
    }

    if (produto.quantidade <= produto.estoqueMinimo) {
      return 'Baixo';
    }

    return 'Normal';
  }

  // ========================================
  // FILTRO
  // ========================================

  const produtosFiltrados = produtos.filter(
    (produto) => {

      const correspondeBusca =
        produto.nome
          .toLowerCase()
          .includes(busca.toLowerCase());

      const correspondeCategoria =
        categoriaFiltro === 'Todas' ||
        produto.categoria === categoriaFiltro;

      return (
        correspondeBusca &&
        correspondeCategoria
      );
    }
  );

  // ========================================
  // CATEGORIAS
  // ========================================

  const categorias = [
    'Todas',
    ...new Set(
      produtos.map(
        (produto) => produto.categoria
      )
    )
  ];

  // ========================================
  // ESTATÍSTICAS
  // ========================================

  const totalProdutos =
    produtos.length;

  const produtosBaixos =
    produtos.filter(
      (produto) =>
        produto.quantidade <=
        produto.estoqueMinimo
    ).length;

  const produtosEsgotados =
    produtos.filter(
      (produto) =>
        produto.quantidade === 0
    ).length;

  const valorEstoque =
    produtos.reduce(
      (total, produto) =>
        total +
        produto.quantidade *
        produto.precoCompra,
      0
    );

  // ========================================
  // FORMATAR VALOR
  // ========================================

  function formatarMoeda(valor) {

    return valor.toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    );
  }

  // ========================================
  // RETURN
  // ========================================

  return (

    <main className="estoque-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="estoque-header">

        <div className="header-logo">

          <img
            src={logoHope}
            alt="Hope Barbearia"
          />

        </div>

        <div className="header-title">

          <h1>
            Estoque
          </h1>

          <p>
            Controle de produtos e movimentações
          </p>

        </div>

        <div className="header-user">

          <button className="user-button">

            <div className="user-avatar">
              B
            </div>

            <div className="user-info">

              <strong>
                Barbeiro
              </strong>

              <span>
                Minha conta
              </span>

            </div>

            <span className="user-arrow">
              ⌄
            </span>

          </button>

        </div>

      </header>


      {/* ========================================
          CONTEÚDO
      ======================================== */}

      <section className="estoque-content">

        {/* TÍTULO */}

        <div className="page-heading">

          <div>

            <span className="heading-label">
              CONTROLE DE ESTOQUE
            </span>

            <h2>
              Produtos
            </h2>

            <p>
              Gerencie seus produtos e acompanhe
              o estoque da barbearia.
            </p>

          </div>

          <button
            className="btn-novo-produto"
            onClick={() =>
              setModalProduto(true)
            }
          >
            <span>+</span>

            Novo produto

          </button>

        </div>


        {/* ========================================
            CARDS DE RESUMO
        ======================================== */}

        <div className="estoque-stats">

          <div className="stat-card">

            <div className="stat-icon">
              📦
            </div>

            <div>

              <span>
                Total de produtos
              </span>

              <strong>
                {totalProdutos}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon warning">
              ⚠
            </div>

            <div>

              <span>
                Estoque baixo
              </span>

              <strong>
                {produtosBaixos}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon danger">
              !
            </div>

            <div>

              <span>
                Esgotados
              </span>

              <strong>
                {produtosEsgotados}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              R$
            </div>

            <div>

              <span>
                Valor em estoque
              </span>

              <strong>
                {formatarMoeda(valorEstoque)}
              </strong>

            </div>

          </div>

        </div>


        {/* ========================================
            LISTA DE PRODUTOS
        ======================================== */}

        <section className="products-card">

          <div className="products-header">

            <div>

              <h3>
                Produtos cadastrados
              </h3>

              <p>
                Consulte e atualize o estoque.
              </p>

            </div>

            <div className="products-filters">

              <div className="search-box">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={busca}
                  onChange={(event) =>
                    setBusca(event.target.value)
                  }
                />

              </div>

              <select
                value={categoriaFiltro}
                onChange={(event) =>
                  setCategoriaFiltro(
                    event.target.value
                  )
                }
              >

                {categorias.map(
                  (categoria) => (
                    <option
                      key={categoria}
                      value={categoria}
                    >
                      {categoria}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>


          {/* TABELA */}

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Produto
                  </th>

                  <th>
                    Categoria
                  </th>

                  <th>
                    Quantidade
                  </th>

                  <th>
                    Preço
                  </th>

                  <th>
                    Estoque mínimo
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Ações
                  </th>

                </tr>

              </thead>

              <tbody>

                {produtosFiltrados.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="empty-table"
                    >
                      Nenhum produto encontrado.
                    </td>

                  </tr>

                ) : (

                  produtosFiltrados.map(
                    (produto) => {

                      const status =
                        obterStatus(produto);

                      return (

                        <tr
                          key={produto.id}
                        >

                          <td>

                            <div className="product-name">

                              <div className="product-icon">
                                📦
                              </div>

                              <div>

                                <strong>
                                  {produto.nome}
                                </strong>

                                <span>
                                  {produto.descricao}
                                </span>

                              </div>

                            </div>

                          </td>

                          <td>
                            {produto.categoria}
                          </td>

                          <td>

                            <strong className="quantity">
                              {produto.quantidade}
                            </strong>

                          </td>

                          <td>

                            <strong>
                              {formatarMoeda(
                                produto.precoVenda
                              )}
                            </strong>

                          </td>

                          <td>

                            {produto.estoqueMinimo}

                          </td>

                          <td>

                            <span
                              className={`status ${status.toLowerCase()}`}
                            >
                              {status}
                            </span>

                          </td>

                          <td>

                            <button
                              className="btn-movimentar"
                              onClick={() =>
                                abrirMovimentacao(
                                  produto
                                )
                              }
                            >
                              Movimentar
                            </button>

                          </td>

                        </tr>

                      );

                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </section>

      </section>


      {/* ========================================
          MODAL — NOVO PRODUTO
      ======================================== */}

      {modalProduto && (

        <div
          className="modal-overlay"
          onClick={() =>
            setModalProduto(false)
          }
        >

          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setModalProduto(false)
              }
            >
              ×
            </button>

            <div className="modal-icon">
              +
            </div>

            <h3>
              Cadastrar produto
            </h3>

            <p>
              Adicione um novo produto ao estoque.
            </p>


            <form
              onSubmit={cadastrarProduto}
              className="product-form"
            >

              <div className="form-group">

                <label>
                  Nome
                </label>

                <input
                  type="text"
                  name="nome"
                  placeholder="Nome do produto"
                  value={produtoForm.nome}
                  onChange={alterarProduto}
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Descrição
                </label>

                <input
                  type="text"
                  name="descricao"
                  placeholder="Descrição do produto"
                  value={produtoForm.descricao}
                  onChange={alterarProduto}
                />

              </div>


              <div className="form-group">

                <label>
                  Categoria
                </label>

                <select
                  name="categoria"
                  value={produtoForm.categoria}
                  onChange={alterarProduto}
                  required
                >

                  <option value="">
                    Selecione uma categoria
                  </option>

                  <option value="Finalização">
                    Finalização
                  </option>

                  <option value="Higiene">
                    Higiene
                  </option>

                  <option value="Barba">
                    Barba
                  </option>

                  <option value="Acessórios">
                    Acessórios
                  </option>

                </select>

              </div>


              <div className="form-row">

                <div className="form-group">

                  <label>
                    Quantidade
                  </label>

                  <input
                    type="number"
                    name="quantidade"
                    min="0"
                    placeholder="0"
                    value={produtoForm.quantidade}
                    onChange={alterarProduto}
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Estoque mínimo
                  </label>

                  <input
                    type="number"
                    name="estoqueMinimo"
                    min="0"
                    placeholder="0"
                    value={produtoForm.estoqueMinimo}
                    onChange={alterarProduto}
                    required
                  />

                </div>

              </div>


              <div className="form-row">

                <div className="form-group">

                  <label>
                    Preço de compra
                  </label>

                  <input
                    type="number"
                    name="precoCompra"
                    min="0"
                    step="0.01"
                    placeholder="R$ 0,00"
                    value={produtoForm.precoCompra}
                    onChange={alterarProduto}
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Preço de venda
                  </label>

                  <input
                    type="number"
                    name="precoVenda"
                    min="0"
                    step="0.01"
                    placeholder="R$ 0,00"
                    value={produtoForm.precoVenda}
                    onChange={alterarProduto}
                    required
                  />

                </div>

              </div>


              <div className="modal-actions">

                <button
                  type="button"
                  className="btn-modal-secondary"
                  onClick={() =>
                    setModalProduto(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-modal-primary"
                >
                  Cadastrar produto
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ========================================
          MODAL — MOVIMENTAÇÃO
      ======================================== */}

      {modalMovimentacao && produtoSelecionado && (

        <div
          className="modal-overlay"
          onClick={() =>
            setModalMovimentacao(false)
          }
        >

          <div
            className="modal modal-movimentacao"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setModalMovimentacao(false)
              }
            >
              ×
            </button>

            <div className="modal-icon">
              ⇅
            </div>

            <h3>
              Movimentar estoque
            </h3>

            <p>
              Produto: <strong>
                {produtoSelecionado.nome}
              </strong>
            </p>


            <div className="current-stock">

              <span>
                Estoque atual
              </span>

              <strong>
                {produtoSelecionado.quantidade}
                {' '}
                unidades
              </strong>

            </div>


            <form
              onSubmit={registrarMovimentacao}
              className="product-form"
            >

              <div className="movement-type">

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
                >
                  Entrada
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
                >
                  Saída
                </button>

              </div>


              <div className="form-group">

                <label>
                  Quantidade
                </label>

                <input
                  type="number"
                  name="quantidade"
                  min="1"
                  placeholder="Informe a quantidade"
                  value={
                    movimentacaoForm.quantidade
                  }
                  onChange={
                    alterarMovimentacao
                  }
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Motivo
                </label>

                <input
                  type="text"
                  name="motivo"
                  placeholder="Ex: Compra de produtos"
                  value={
                    movimentacaoForm.motivo
                  }
                  onChange={
                    alterarMovimentacao
                  }
                  required
                />

              </div>


              <div className="modal-actions">

                <button
                  type="button"
                  className="btn-modal-secondary"
                  onClick={() =>
                    setModalMovimentacao(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-modal-primary"
                >
                  Registrar movimentação
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}

export default Estoque;