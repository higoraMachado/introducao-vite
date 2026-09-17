import { useState } from 'react';
import './Clientes.css';
import logoHope from '../../assets/logo-hope.png';

const clientesIniciais = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao@email.com',
    senha: '123456',
    telefone: '(14) 99999-1111',
    nascimento: '15/03/1998',
    foto: '',
    status: 'Ativo',
  },
  {
    id: 2,
    nome: 'Pedro Souza',
    email: 'pedro@email.com',
    senha: '123456',
    telefone: '(14) 98888-2222',
    nascimento: '21/07/1995',
    foto: '',
    status: 'Ativo',
  },
  {
    id: 3,
    nome: 'Carlos Oliveira',
    email: 'carlos@email.com',
    senha: '123456',
    telefone: '(14) 97777-3333',
    nascimento: '09/11/2000',
    foto: '',
    status: 'Ativo',
  },
  {
    id: 4,
    nome: 'Lucas Santos',
    email: 'lucas@email.com',
    senha: '123456',
    telefone: '(14) 96666-4444',
    nascimento: '02/05/1992',
    foto: '',
    status: 'Inativo',
  },
];

function Clientes() {
  const [clientes, setClientes] = useState(clientesIniciais);

  const [pesquisa, setPesquisa] = useState('');
  const [filtro, setFiltro] = useState('Todos');

  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState(false);

  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const [formulario, setFormulario] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    nascimento: '',
    foto: '',
  });

  /* =========================================
     PESQUISA E FILTRO
  ========================================= */

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = pesquisa.toLowerCase();

    const correspondePesquisa =
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.email.toLowerCase().includes(termo) ||
      cliente.telefone.includes(termo);

    const correspondeFiltro =
      filtro === 'Todos' || cliente.status === filtro;

    return correspondePesquisa && correspondeFiltro;
  });

  /* =========================================
     FORMULÁRIO
  ========================================= */

  function abrirCadastro() {
    setModoEdicao(false);

    setFormulario({
      nome: '',
      email: '',
      senha: '',
      telefone: '',
      nascimento: '',
      foto: '',
    });

    setModalFormulario(true);
  }

  function abrirEdicao(cliente) {
    setModoEdicao(true);
    setClienteSelecionado(cliente);

    setFormulario({
      nome: cliente.nome,
      email: cliente.email,
      senha: cliente.senha,
      telefone: cliente.telefone,
      nascimento: cliente.nascimento,
      foto: cliente.foto,
    });

    setModalFormulario(true);
  }

  function fecharFormulario() {
    setModalFormulario(false);
    setClienteSelecionado(null);
  }

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function salvarCliente(event) {
    event.preventDefault();

    if (
      !formulario.nome ||
      !formulario.email ||
      !formulario.senha ||
      !formulario.telefone
    ) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    if (modoEdicao) {
      setClientes((anterior) =>
        anterior.map((cliente) =>
          cliente.id === clienteSelecionado.id
            ? {
                ...cliente,
                ...formulario,
              }
            : cliente
        )
      );

      alert('Cliente atualizado com sucesso!');
    } else {
      const novoCliente = {
        id:
          clientes.length > 0
            ? Math.max(...clientes.map((cliente) => cliente.id)) + 1
            : 1,

        ...formulario,

        status: 'Ativo',
      };

      setClientes((anterior) => [...anterior, novoCliente]);

      alert('Cliente cadastrado com sucesso!');
    }

    fecharFormulario();
  }

  /* =========================================
     VISUALIZAR
  ========================================= */

  function visualizarCliente(cliente) {
    setClienteSelecionado(cliente);
    setModalVisualizar(true);
  }

  function fecharVisualizacao() {
    setClienteSelecionado(null);
    setModalVisualizar(false);
  }

  /* =========================================
     ATIVAR / DESATIVAR
  ========================================= */

  function alterarStatus(cliente) {
    const novoStatus =
      cliente.status === 'Ativo' ? 'Inativo' : 'Ativo';

    const mensagem =
      novoStatus === 'Inativo'
        ? `Deseja desativar o cliente ${cliente.nome}?`
        : `Deseja ativar o cliente ${cliente.nome}?`;

    if (!window.confirm(mensagem)) {
      return;
    }

    setClientes((anterior) =>
      anterior.map((item) =>
        item.id === cliente.id
          ? {
              ...item,
              status: novoStatus,
            }
          : item
      )
    );
  }

  return (
    <main className="clientes-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="clientes-header">

        <div className="clientes-logo">
          <img
            src={logoHope}
            alt="Hope Barbearia"
          />
        </div>

        <div className="clientes-title">
          <h1>Clientes</h1>
          <p>Gerenciamento de clientes</p>
        </div>

        <div className="clientes-user">

          <div className="user-avatar">
            B
          </div>

          <div className="user-info">
            <strong>Bruno</strong>
            <span>Barbeiro</span>
          </div>

        </div>

      </header>

      {/* =========================================
          CONTEÚDO
      ========================================= */}

      <section className="clientes-content">

        {/* CABEÇALHO DA PÁGINA */}

        <div className="clientes-heading">

          <div>

            <span className="heading-label">
              ÁREA DO BARBEIRO
            </span>

            <h2>Meus clientes</h2>

            <p>
              Cadastre, consulte e gerencie os clientes
              da Hope Barbearia.
            </p>

          </div>

          <button
            className="btn-cadastrar"
            onClick={abrirCadastro}
          >
            + Cadastrar cliente
          </button>

        </div>

        {/* =========================================
            CARD PRINCIPAL
        ========================================= */}

        <section className="clientes-card">

          <div className="card-top">

            <div>

              <span className="card-label">
                CLIENTES
              </span>

              <h3>
                Lista de clientes
              </h3>

            </div>

            <div className="total-clientes">
              {clientes.length} clientes
            </div>

          </div>

          {/* =========================================
              FILTROS
          ========================================= */}

          <div className="clientes-filtros">

            <div className="campo-pesquisa">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Pesquisar cliente..."
                value={pesquisa}
                onChange={(event) =>
                  setPesquisa(event.target.value)
                }
              />

            </div>

            <select
              value={filtro}
              onChange={(event) =>
                setFiltro(event.target.value)
              }
            >
              <option value="Todos">
                Todos os clientes
              </option>

              <option value="Ativo">
                Ativos
              </option>

              <option value="Inativo">
                Inativos
              </option>
            </select>

          </div>

          {/* =========================================
              TABELA
          ========================================= */}

          <div className="tabela-container">

            <table className="clientes-tabela">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>

              </thead>

              <tbody>

                {clientesFiltrados.length > 0 ? (

                  clientesFiltrados.map((cliente) => (

                    <tr key={cliente.id}>

                      <td className="cliente-id">
                        {String(cliente.id).padStart(2, '0')}
                      </td>

                      <td>

                        <div className="cliente-nome">

                          <div className="cliente-avatar">

                            {cliente.foto ? (
                              <img
                                src={cliente.foto}
                                alt={cliente.nome}
                              />
                            ) : (
                              cliente.nome
                                .charAt(0)
                                .toUpperCase()
                            )}

                          </div>

                          <strong>
                            {cliente.nome}
                          </strong>

                        </div>

                      </td>

                      <td>
                        {cliente.telefone}
                      </td>

                      <td>
                        {cliente.email}
                      </td>

                      <td>

                        <span
                          className={`status ${
                            cliente.status === 'Ativo'
                              ? 'status-ativo'
                              : 'status-inativo'
                          }`}
                        >
                          {cliente.status}
                        </span>

                      </td>

                      <td>

                        <div className="acoes">

                          <button
                            className="acao-visualizar"
                            onClick={() =>
                              visualizarCliente(cliente)
                            }
                            title="Visualizar"
                          >
                            Visualizar
                          </button>

                          <button
                            className="acao-editar"
                            onClick={() =>
                              abrirEdicao(cliente)
                            }
                            title="Editar"
                          >
                            Editar
                          </button>

                          <button
                            className={
                              cliente.status === 'Ativo'
                                ? 'acao-desativar'
                                : 'acao-ativar'
                            }
                            onClick={() =>
                              alterarStatus(cliente)
                            }
                            title={
                              cliente.status === 'Ativo'
                                ? 'Desativar'
                                : 'Ativar'
                            }
                          >
                            {cliente.status === 'Ativo'
                              ? 'Desativar'
                              : 'Ativar'}
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      className="nenhum-cliente"
                    >
                      <div>
                        <span>⌕</span>

                        <strong>
                          Nenhum cliente encontrado
                        </strong>

                        <p>
                          Tente alterar sua pesquisa ou
                          o filtro selecionado.
                        </p>
                      </div>
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      </section>

      {/* =========================================
          MODAL — CADASTRO / EDIÇÃO
      ========================================= */}

      {modalFormulario && (

        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              fecharFormulario();
            }
          }}
        >

          <div className="modal">

            <div className="modal-header">

              <div>

                <span className="card-label">
                  {modoEdicao
                    ? 'CLIENTE'
                    : 'NOVO CLIENTE'}
                </span>

                <h3>
                  {modoEdicao
                    ? 'Editar cliente'
                    : 'Cadastrar cliente'}
                </h3>

              </div>

              <button
                className="modal-fechar"
                onClick={fecharFormulario}
              >
                ×
              </button>

            </div>

            <form
              className="cliente-form"
              onSubmit={salvarCliente}
            >

              <div className="form-grid">

                {/* NOME */}

                <div className="form-group form-full">

                  <label>
                    Nome *
                  </label>

                  <input
                    type="text"
                    name="nome"
                    placeholder="Digite o nome completo"
                    value={formulario.nome}
                    onChange={alterarFormulario}
                  />

                </div>

                {/* E-MAIL */}

                <div className="form-group">

                  <label>
                    E-mail *
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="cliente@email.com"
                    value={formulario.email}
                    onChange={alterarFormulario}
                  />

                </div>

                {/* SENHA */}

                <div className="form-group">

                  <label>
                    Senha *
                  </label>

                  <input
                    type="password"
                    name="senha"
                    placeholder="Digite a senha"
                    value={formulario.senha}
                    onChange={alterarFormulario}
                  />

                </div>

                {/* TELEFONE */}

                <div className="form-group">

                  <label>
                    Telefone *
                  </label>

                  <input
                    type="tel"
                    name="telefone"
                    placeholder="(00) 00000-0000"
                    value={formulario.telefone}
                    onChange={alterarFormulario}
                  />

                </div>

                {/* DATA DE NASCIMENTO */}

                <div className="form-group">

                  <label>
                    Data de nascimento
                  </label>

                  <input
                    type="date"
                    name="nascimento"
                    value={formulario.nascimento}
                    onChange={alterarFormulario}
                  />

                </div>

                {/* FOTO */}

                <div className="form-group form-full">

                  <label>
                    Foto
                  </label>

                  <input
                    type="text"
                    name="foto"
                    placeholder="URL da foto (opcional)"
                    value={formulario.foto}
                    onChange={alterarFormulario}
                  />

                  <small>
                    Campo opcional para a foto do cliente.
                  </small>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={fecharFormulario}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-salvar"
                >
                  {modoEdicao
                    ? 'Salvar alterações'
                    : 'Salvar cliente'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================================
          MODAL — VISUALIZAÇÃO
      ========================================= */}

      {modalVisualizar && clienteSelecionado && (

        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              fecharVisualizacao();
            }
          }}
        >

          <div className="modal modal-visualizacao">

            <div className="modal-header">

              <div>

                <span className="card-label">
                  CLIENTE
                </span>

                <h3>
                  Dados do cliente
                </h3>

              </div>

              <button
                className="modal-fechar"
                onClick={fecharVisualizacao}
              >
                ×
              </button>

            </div>

            <div className="cliente-detalhes">

              <div className="cliente-detalhe-topo">

                <div className="cliente-avatar grande">

                  {clienteSelecionado.foto ? (

                    <img
                      src={clienteSelecionado.foto}
                      alt={clienteSelecionado.nome}
                    />

                  ) : (

                    clienteSelecionado.nome
                      .charAt(0)
                      .toUpperCase()

                  )}

                </div>

                <div>

                  <h4>
                    {clienteSelecionado.nome}
                  </h4>

                  <span
                    className={`status ${
                      clienteSelecionado.status === 'Ativo'
                        ? 'status-ativo'
                        : 'status-inativo'
                    }`}
                  >
                    {clienteSelecionado.status}
                  </span>

                </div>

              </div>

              <div className="detalhes-grid">

                <div>
                  <small>ID</small>
                  <strong>
                    #{String(clienteSelecionado.id).padStart(2, '0')}
                  </strong>
                </div>

                <div>
                  <small>Telefone</small>
                  <strong>
                    {clienteSelecionado.telefone}
                  </strong>
                </div>

                <div>
                  <small>E-mail</small>
                  <strong>
                    {clienteSelecionado.email}
                  </strong>
                </div>

                <div>
                  <small>Data de nascimento</small>
                  <strong>
                    {clienteSelecionado.nascimento || 'Não informado'}
                  </strong>
                </div>

              </div>

            </div>

            <div className="modal-footer">

              <button
                className="btn-cancelar"
                onClick={fecharVisualizacao}
              >
                Fechar
              </button>

              <button
                className="btn-salvar"
                onClick={() => {
                  fecharVisualizacao();
                  abrirEdicao(clienteSelecionado);
                }}
              >
                Editar cliente
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

export default Clientes;