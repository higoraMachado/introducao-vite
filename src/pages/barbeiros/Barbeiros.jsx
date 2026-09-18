import { useState } from 'react';
import './Barbeiros.css';
import logoHope from '../../assets/logo-hope.png';

const barbeirosIniciais = [
  {
    id: 1,
    nome: 'João',
    especialidade: 'Corte',
    status: 'Ativo',
    foto: '',
  },
  {
    id: 2,
    nome: 'Carlos',
    especialidade: 'Barba',
    status: 'Ativo',
    foto: '',
  },
  {
    id: 3,
    nome: 'Rafael',
    especialidade: 'Corte + Barba',
    status: 'Ativo',
    foto: '',
  },
  {
    id: 4,
    nome: 'Lucas',
    especialidade: 'Degradê',
    status: 'Inativo',
    foto: '',
  },
];

function Barbeiros() {
  const [barbeiros, setBarbeiros] = useState(barbeirosIniciais);

  const [pesquisa, setPesquisa] = useState('');
  const [filtro, setFiltro] = useState('Todos');

  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState(false);

  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState(null);

  const [formulario, setFormulario] = useState({
    nome: '',
    especialidade: '',
    foto: '',
  });

  /* =========================================
     PESQUISA E FILTRO
  ========================================= */

  const barbeirosFiltrados = barbeiros.filter((barbeiro) => {
    const termo = pesquisa.toLowerCase();

    const correspondePesquisa =
      barbeiro.nome.toLowerCase().includes(termo) ||
      barbeiro.especialidade.toLowerCase().includes(termo);

    const correspondeFiltro =
      filtro === 'Todos' ||
      barbeiro.status === filtro;

    return correspondePesquisa && correspondeFiltro;
  });

  /* =========================================
     NOVO BARBEIRO
  ========================================= */

  function abrirCadastro() {
    setFormulario({
      nome: '',
      especialidade: '',
      foto: '',
    });

    setBarbeiroSelecionado(null);
    setModalFormulario(true);
  }

  /* =========================================
     EDITAR BARBEIRO
  ========================================= */

  function abrirEdicao(barbeiro) {
    setBarbeiroSelecionado(barbeiro);

    setFormulario({
      nome: barbeiro.nome,
      especialidade: barbeiro.especialidade,
      foto: barbeiro.foto,
    });

    setModalFormulario(true);
  }

  /* =========================================
     ALTERAR FORMULÁRIO
  ========================================= */

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  /* =========================================
     SALVAR
  ========================================= */

  function salvarBarbeiro(event) {
    event.preventDefault();

    if (!formulario.nome || !formulario.especialidade) {
      alert('Preencha o nome e a especialidade.');
      return;
    }

    if (barbeiroSelecionado) {
      setBarbeiros((anterior) =>
        anterior.map((barbeiro) =>
          barbeiro.id === barbeiroSelecionado.id
            ? {
                ...barbeiro,
                nome: formulario.nome,
                especialidade: formulario.especialidade,
                foto: formulario.foto,
              }
            : barbeiro
        )
      );

      alert('Barbeiro atualizado com sucesso!');
    } else {
      const novoBarbeiro = {
        id:
          barbeiros.length > 0
            ? Math.max(
                ...barbeiros.map((barbeiro) => barbeiro.id)
              ) + 1
            : 1,

        nome: formulario.nome,
        especialidade: formulario.especialidade,
        foto: formulario.foto,
        status: 'Ativo',
      };

      setBarbeiros((anterior) => [
        ...anterior,
        novoBarbeiro,
      ]);

      alert('Barbeiro cadastrado com sucesso!');
    }

    fecharFormulario();
  }

  /* =========================================
     VISUALIZAR
  ========================================= */

  function visualizarBarbeiro(barbeiro) {
    setBarbeiroSelecionado(barbeiro);
    setModalVisualizar(true);
  }

  /* =========================================
     ATIVAR / DESATIVAR
  ========================================= */

  function alterarStatus(barbeiro) {
    const novoStatus =
      barbeiro.status === 'Ativo'
        ? 'Inativo'
        : 'Ativo';

    const mensagem =
      novoStatus === 'Inativo'
        ? `Deseja desativar ${barbeiro.nome}?`
        : `Deseja ativar ${barbeiro.nome}?`;

    if (!window.confirm(mensagem)) {
      return;
    }

    setBarbeiros((anterior) =>
      anterior.map((item) =>
        item.id === barbeiro.id
          ? {
              ...item,
              status: novoStatus,
            }
          : item
      )
    );
  }

  /* =========================================
     FECHAR MODAIS
  ========================================= */

  function fecharFormulario() {
    setModalFormulario(false);
    setBarbeiroSelecionado(null);
  }

  function fecharVisualizacao() {
    setModalVisualizar(false);
    setBarbeiroSelecionado(null);
  }

  return (
    <main className="barbeiros-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="barbeiros-header">

        <div className="barbeiros-logo">
          <img
            src={logoHope}
            alt="Hope Barbearia"
          />
        </div>

        <div className="barbeiros-title">
          <h1>Barbeiros</h1>
          <p>Gerenciamento de barbeiros</p>
        </div>

        <div className="barbeiros-user">

          <div className="user-avatar">
            B
          </div>

          <div className="user-info">
            <strong>Bruno</strong>
            <span>Minha conta</span>
          </div>

        </div>

      </header>

      {/* =====================================
          CONTEÚDO
      ===================================== */}

      <section className="barbeiros-content">

        <div className="barbeiros-heading">

          <div>

            <span className="heading-label">
              ÁREA DO BARBEIRO
            </span>

            <h2>Barbeiros</h2>

            <p>
              Consulte e gerencie os barbeiros
              cadastrados na Hope Barbearia.
            </p>

          </div>

          <button
            className="btn-novo-barbeiro"
            onClick={abrirCadastro}
          >
            + Novo barbeiro
          </button>

        </div>

        {/* =====================================
            CARD
        ===================================== */}

        <section className="barbeiros-card">

          <div className="card-header">

            <div>
              <span className="card-label">
                BARBEIROS
              </span>

              <h3>
                Lista de barbeiros
              </h3>
            </div>

            <div className="total-barbeiros">
              {barbeiros.length} barbeiros
            </div>

          </div>

          {/* =====================================
              FILTROS
          ===================================== */}

          <div className="barbeiros-filtros">

            <div className="campo-pesquisa">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Pesquisar barbeiro..."
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
                Todos
              </option>

              <option value="Ativo">
                Ativos
              </option>

              <option value="Inativo">
                Inativos
              </option>
            </select>

          </div>

          {/* =====================================
              TABELA
          ===================================== */}

          <div className="tabela-container">

            <table className="barbeiros-tabela">

              <thead>

                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Especialidade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>

              </thead>

              <tbody>

                {barbeirosFiltrados.length > 0 ? (

                  barbeirosFiltrados.map((barbeiro) => (

                    <tr key={barbeiro.id}>

                      {/* FOTO */}

                      <td>

                        <div className="barbeiro-foto">

                          {barbeiro.foto ? (

                            <img
                              src={barbeiro.foto}
                              alt={barbeiro.nome}
                            />

                          ) : (

                            barbeiro.nome
                              .charAt(0)
                              .toUpperCase()

                          )}

                        </div>

                      </td>

                      {/* NOME */}

                      <td>

                        <strong className="nome-barbeiro">
                          {barbeiro.nome}
                        </strong>

                      </td>

                      {/* ESPECIALIDADE */}

                      <td>
                        <span className="especialidade">
                          {barbeiro.especialidade}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`status ${
                            barbeiro.status === 'Ativo'
                              ? 'status-ativo'
                              : 'status-inativo'
                          }`}
                        >
                          {barbeiro.status}
                        </span>

                      </td>

                      {/* AÇÕES */}

                      <td>

                        <div className="acoes">

                          <button
                            className="acao-visualizar"
                            onClick={() =>
                              visualizarBarbeiro(barbeiro)
                            }
                          >
                            Visualizar
                          </button>

                          <button
                            className="acao-editar"
                            onClick={() =>
                              abrirEdicao(barbeiro)
                            }
                          >
                            Editar
                          </button>

                          <button
                            className={
                              barbeiro.status === 'Ativo'
                                ? 'acao-desativar'
                                : 'acao-ativar'
                            }
                            onClick={() =>
                              alterarStatus(barbeiro)
                            }
                          >
                            {barbeiro.status === 'Ativo'
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
                      colSpan="5"
                      className="nenhum-barbeiro"
                    >
                      <div>

                        <span>✂</span>

                        <strong>
                          Nenhum barbeiro encontrado
                        </strong>

                        <p>
                          Tente alterar sua pesquisa
                          ou o filtro selecionado.
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

      {/* =====================================
          MODAL — NOVO / EDITAR
      ===================================== */}

      {modalFormulario && (

        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              fecharFormulario();
            }
          }}
        >

          <div className="modal">

            <div className="modal-header">

              <div>

                <span className="card-label">
                  {barbeiroSelecionado
                    ? 'BARBEIRO'
                    : 'NOVO BARBEIRO'}
                </span>

                <h3>
                  {barbeiroSelecionado
                    ? 'Editar barbeiro'
                    : 'Cadastrar barbeiro'}
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
              className="barbeiro-form"
              onSubmit={salvarBarbeiro}
            >

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Nome *
                  </label>

                  <input
                    type="text"
                    name="nome"
                    placeholder="Nome do barbeiro"
                    value={formulario.nome}
                    onChange={alterarFormulario}
                  />

                </div>

                <div className="form-group">

                  <label>
                    Especialidade *
                  </label>

                  <input
                    type="text"
                    name="especialidade"
                    placeholder="Ex.: Corte, Barba..."
                    value={formulario.especialidade}
                    onChange={alterarFormulario}
                  />

                </div>

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
                    Você poderá utilizar a foto do
                    barbeiro posteriormente.
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
                  {barbeiroSelecionado
                    ? 'Salvar alterações'
                    : 'Cadastrar barbeiro'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================
          MODAL — VISUALIZAR
      ===================================== */}

      {modalVisualizar &&
        barbeiroSelecionado && (

          <div
            className="modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget
              ) {
                fecharVisualizacao();
              }
            }}
          >

            <div className="modal">

              <div className="modal-header">

                <div>

                  <span className="card-label">
                    BARBEIRO
                  </span>

                  <h3>
                    Dados do barbeiro
                  </h3>

                </div>

                <button
                  className="modal-fechar"
                  onClick={fecharVisualizacao}
                >
                  ×
                </button>

              </div>

              <div className="barbeiro-detalhes">

                <div className="barbeiro-detalhe-topo">

                  <div className="barbeiro-foto grande">

                    {barbeiroSelecionado.foto ? (

                      <img
                        src={barbeiroSelecionado.foto}
                        alt={barbeiroSelecionado.nome}
                      />

                    ) : (

                      barbeiroSelecionado.nome
                        .charAt(0)
                        .toUpperCase()

                    )}

                  </div>

                  <div>

                    <h4>
                      {barbeiroSelecionado.nome}
                    </h4>

                    <span className="especialidade-detalhe">
                      {barbeiroSelecionado.especialidade}
                    </span>

                    <br />

                    <span
                      className={`status ${
                        barbeiroSelecionado.status ===
                        'Ativo'
                          ? 'status-ativo'
                          : 'status-inativo'
                      }`}
                    >
                      {barbeiroSelecionado.status}
                    </span>

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
                    abrirEdicao(
                      barbeiroSelecionado
                    );
                  }}
                >
                  Editar barbeiro
                </button>

              </div>

            </div>

          </div>

        )}

    </main>
  );
}

export default Barbeiros;