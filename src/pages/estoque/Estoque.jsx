import { useState } from 'react';
import './Estoque.css';
import logoHope from '../../assets/logo-hope.png';

const estoqueInicial = [
  {
    id: 1,
    produto: 'Pomada',
    categoria: 'Finalização',
    quantidade: 15,
    preco: 25,
    estoqueMinimo: 5,
    status: 'Normal',
  },
  {
    id: 2,
    produto: 'Shampoo',
    categoria: 'Higiene',
    quantidade: 3,
    preco: 30,
    estoqueMinimo: 5,
    status: 'Baixo',
  },
  {
    id: 3,
    produto: 'Condicionador',
    categoria: 'Higiene',
    quantidade: 8,
    preco: 28,
    estoqueMinimo: 5,
    status: 'Normal',
  },
  {
    id: 4,
    produto: 'Óleo para barba',
    categoria: 'Barba',
    quantidade: 2,
    preco: 35,
    estoqueMinimo: 4,
    status: 'Baixo',
  },
];

function Estoque() {
  const [estoque, setEstoque] = useState(estoqueInicial);

  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [statusFiltro, setStatusFiltro] = useState('Todos');

  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const [formulario, setFormulario] = useState({
    produto: '',
    categoria: '',
    quantidade: '',
    preco: '',
    estoqueMinimo: '',
  });

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function abrirNovoProduto() {
    setModoEdicao(false);
    setItemSelecionado(null);

    setFormulario({
      produto: '',
      categoria: '',
      quantidade: '',
      preco: '',
      estoqueMinimo: '',
    });

    setModalAberto(true);
  }

  function abrirEdicao(item) {
    setModoEdicao(true);
    setItemSelecionado(item);

    setFormulario({
      produto: item.produto,
      categoria: item.categoria,
      quantidade: item.quantidade,
      preco: item.preco,
      estoqueMinimo: item.estoqueMinimo,
    });

    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  function salvarProduto(event) {
    event.preventDefault();

    if (
      !formulario.produto ||
      formulario.quantidade === '' ||
      formulario.preco === '' ||
      formulario.estoqueMinimo === ''
    ) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const quantidade = Number(formulario.quantidade);
    const preco = Number(formulario.preco);
    const estoqueMinimo = Number(formulario.estoqueMinimo);

    const status = quantidade <= estoqueMinimo
      ? 'Baixo'
      : 'Normal';

    if (modoEdicao && itemSelecionado) {
      setEstoque((anterior) =>
        anterior.map((item) =>
          item.id === itemSelecionado.id
            ? {
                ...item,
                produto: formulario.produto,
                categoria:
                  formulario.categoria || 'Sem categoria',
                quantidade,
                preco,
                estoqueMinimo,
                status,
              }
            : item
        )
      );

      alert('Produto atualizado com sucesso.');
    } else {
      const novoProduto = {
        id: Date.now(),
        produto: formulario.produto,
        categoria:
          formulario.categoria || 'Sem categoria',
        quantidade,
        preco,
        estoqueMinimo,
        status,
      };

      setEstoque((anterior) => [
        ...anterior,
        novoProduto,
      ]);

      alert('Produto adicionado ao estoque com sucesso.');
    }

    fecharModal();
  }

  function alterarStatus(id) {
    setEstoque((anterior) =>
      anterior.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          status:
            item.status === 'Inativo'
              ? item.quantidade <= item.estoqueMinimo
                ? 'Baixo'
                : 'Normal'
              : 'Inativo',
        };
      })
    );
  }

  function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  const estoqueFiltrado = estoque.filter((item) => {
    const correspondeBusca = item.produto
      .toLowerCase()
      .includes(busca.toLowerCase());

    const correspondeCategoria =
      categoria === 'Todas' ||
      item.categoria === categoria;

    const correspondeStatus =
      statusFiltro === 'Todos' ||
      item.status === statusFiltro;

    return (
      correspondeBusca &&
      correspondeCategoria &&
      correspondeStatus
    );
  });

  const produtosBaixos = estoque.filter(
    (item) => item.status === 'Baixo'
  ).length;

  return (
    <main className="estoque-page">

      {/* HEADER */}
      <header className="estoque-header">

        <div className="estoque-logo">
          <img
            src={logoHope}
            alt="Hope Barbearia"
          />
        </div>

        <div className="estoque-title">
          <h1>Estoque</h1>
          <p>Controle de estoque da Hope Barbearia</p>
        </div>

        <div className="estoque-user">

          <div className="user-avatar">
            B
          </div>

          <div className="user-info">
            <strong>Bruno</strong>
            <span>Minha conta</span>
          </div>

        </div>

      </header>

      {/* CONTEÚDO */}
      <section className="estoque-content">

        <div className="estoque-heading">

          <div>
            <span className="heading-label">
              ÁREA DO BARBEIRO
            </span>

            <h2>Estoque</h2>

            <p>
              Gerencie os produtos, quantidades e níveis
              mínimos de estoque da barbearia.
            </p>
          </div>

          <button
            className="btn-adicionar"
            onClick={abrirNovoProduto}
          >
            + Adicionar produto
          </button>

        </div>

        {/* CARD */}
        <section className="estoque-card">

          <div className="card-header">

            <div>
              <span className="card-label">
                CONTROLE DE ESTOQUE
              </span>

              <h3>Itens em estoque</h3>
            </div>

            <div className="card-informacoes">
              <span>
                {estoque.length} itens
              </span>

              {produtosBaixos > 0 && (
                <span className="alerta-estoque">
                  {produtosBaixos} com estoque baixo
                </span>
              )}
            </div>

          </div>

          {/* FILTROS */}
          <div className="estoque-filtros">

            <div className="filtro-busca">

              <label htmlFor="busca">
                Buscar produto
              </label>

              <input
                id="busca"
                type="text"
                placeholder="Digite o nome do produto..."
                value={busca}
                onChange={(event) =>
                  setBusca(event.target.value)
                }
              />

            </div>

            <div className="filtro-item">

              <label htmlFor="categoria">
                Categoria
              </label>

              <select
                id="categoria"
                value={categoria}
                onChange={(event) =>
                  setCategoria(event.target.value)
                }
              >
                <option value="Todas">
                  Todas
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

              </select>

            </div>

            <div className="filtro-item">

              <label htmlFor="status">
                Status
              </label>

              <select
                id="status"
                value={statusFiltro}
                onChange={(event) =>
                  setStatusFiltro(event.target.value)
                }
              >
                <option value="Todos">
                  Todos
                </option>

                <option value="Normal">
                  Normal
                </option>

                <option value="Baixo">
                  Baixo
                </option>

                <option value="Inativo">
                  Inativo
                </option>

              </select>

            </div>

          </div>

          {/* TABELA */}
          <div className="tabela-container">

            <table className="estoque-tabela">

              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Quantidade</th>
                  <th>Preço</th>
                  <th>Estoque mínimo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>

                {estoqueFiltrado.length > 0 ? (

                  estoqueFiltrado.map((item) => (

                    <tr key={item.id}>

                      <td>
                        <strong>
                          {item.produto}
                        </strong>
                      </td>

                      <td>
                        <span className="categoria-texto">
                          {item.categoria}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            item.quantidade <=
                            item.estoqueMinimo
                              ? 'quantidade baixa'
                              : 'quantidade'
                          }
                        >
                          {item.quantidade}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {formatarPreco(item.preco)}
                        </strong>
                      </td>

                      <td>
                        {item.estoqueMinimo}
                      </td>

                      <td>

                        <span
                          className={`status-badge status-${item.status.toLowerCase()}`}
                        >
                          {item.status}
                        </span>

                      </td>

                      <td>

                        <div className="acoes">

                          <button
                            className="btn-editar"
                            onClick={() =>
                              abrirEdicao(item)
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="btn-status"
                            onClick={() =>
                              alterarStatus(item.id)
                            }
                          >
                            {item.status === 'Inativo'
                              ? 'Ativar'
                              : 'Desativar'}
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>
                    <td
                      colSpan="7"
                      className="tabela-vazia"
                    >
                      Nenhum item encontrado no estoque.
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* RODAPÉ */}
          <div className="tabela-footer">

            <span>
              Mostrando {estoqueFiltrado.length} de{' '}
              {estoque.length} itens
            </span>

            <span>
              Quantidade total em estoque:{' '}
              <strong>
                {estoque.reduce(
                  (total, item) =>
                    total +
                    (item.status !== 'Inativo'
                      ? item.quantidade
                      : 0),
                  0
                )}
              </strong>
            </span>

          </div>

        </section>

      </section>

      {/* MODAL */}
      {modalAberto && (

        <div
          className="modal-overlay"
          onClick={fecharModal}
        >

          <div
            className="estoque-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <span className="modal-label">
                  {modoEdicao
                    ? 'EDIÇÃO DE ESTOQUE'
                    : 'ADICIONAR AO ESTOQUE'}
                </span>

                <h3>
                  {modoEdicao
                    ? 'Editar produto'
                    : 'Adicionar produto'}
                </h3>
              </div>

              <button
                className="btn-fechar"
                onClick={fecharModal}
              >
                ×
              </button>

            </div>

            <form
              className="estoque-form"
              onSubmit={salvarProduto}
            >

              <div className="form-grid">

                <div className="form-group form-full">

                  <label htmlFor="produto">
                    Produto *
                  </label>

                  <input
                    id="produto"
                    name="produto"
                    type="text"
                    placeholder="Ex.: Pomada"
                    value={formulario.produto}
                    onChange={alterarFormulario}
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="categoria-form">
                    Categoria
                  </label>

                  <select
                    id="categoria-form"
                    name="categoria"
                    value={formulario.categoria}
                    onChange={alterarFormulario}
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

                  </select>

                </div>

                <div className="form-group">

                  <label htmlFor="preco">
                    Preço *
                  </label>

                  <div className="input-prefixo">

                    <span>R$</span>

                    <input
                      id="preco"
                      name="preco"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={formulario.preco}
                      onChange={alterarFormulario}
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label htmlFor="quantidade">
                    Quantidade *
                  </label>

                  <input
                    id="quantidade"
                    name="quantidade"
                    type="number"
                    min="0"
                    placeholder="Ex.: 15"
                    value={formulario.quantidade}
                    onChange={alterarFormulario}
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="estoqueMinimo">
                    Estoque mínimo *
                  </label>

                  <input
                    id="estoqueMinimo"
                    name="estoqueMinimo"
                    type="number"
                    min="0"
                    placeholder="Ex.: 5"
                    value={formulario.estoqueMinimo}
                    onChange={alterarFormulario}
                  />

                </div>

              </div>

              <div className="form-info">

                <strong>
                  Controle automático
                </strong>

                <span>
                  O estoque será identificado como
                  <b> Baixo </b>
                  quando a quantidade for igual ou menor
                  que o estoque mínimo.
                </span>

              </div>

              <div className="form-footer">

                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-salvar"
                >
                  {modoEdicao
                    ? 'Salvar alterações'
                    : 'Adicionar ao estoque'}
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