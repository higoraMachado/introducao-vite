import { useState, useEffect } from 'react';
import './Clientes.css';
import logoHope from '../../assets/logo-hope.png';

function Clientes() {
  // =====================================================
  // CONFIGURACAO DA API
  // =====================================================

  const API_URL = 'http://localhost:3333';

  // =====================================================
  // FUNCAO PARA FAZER REQUISICOES NA API
  // =====================================================

  async function requisicaoAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const resposta = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let dados = {};

    try {
      dados = await resposta.json();
    } catch {
      dados = {};
    }

    console.log('Resposta API:', endpoint, dados);

    if (!resposta.ok) {
      throw new Error(
        dados?.message ||
        dados?.mensagem ||
        dados?.erro ||
        'Erro na comunicacao com a API.'
      );
    }

    return dados;
  }

  // =====================================================
  // ESTADOS
  // =====================================================

  const [clientes, setClientes] = useState([]);

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

  // =====================================================
  // BUSCAR CLIENTES NA API
  // =====================================================

 async function carregarClientes() {
  try {
    const resposta = await requisicaoAPI('/clientes');

    // =================================================
    // MOSTRAR A RESPOSTA COMPLETA DA API
    // =================================================

    console.log(
      '========== RESPOSTA COMPLETA DA API =========='
    );

    console.log(
      JSON.stringify(resposta, null, 2)
    );

    console.log(
      '=============================================='
    );

    // =================================================
    // IDENTIFICAR ONDE ESTA A LISTA DE CLIENTES
    // =================================================

    let listaClientes = [];

    if (Array.isArray(resposta)) {
      listaClientes = resposta;
    } else if (Array.isArray(resposta?.dados)) {
      listaClientes = resposta.dados;
    } else if (
      Array.isArray(resposta?.dados?.clientes)
    ) {
      listaClientes = resposta.dados.clientes;
    } else if (
      Array.isArray(resposta?.clientes)
    ) {
      listaClientes = resposta.clientes;
    }

    console.log(
      '========== CLIENTES ENCONTRADOS =========='
    );

    console.log(
      JSON.stringify(listaClientes, null, 2)
    );

    console.log(
      '=========================================='
    );

    // =================================================
    // NORMALIZAR OS CLIENTES
    // =================================================

    const clientesFormatados = listaClientes.map(
  (cliente) => ({
   
    id: cliente?.usuario_id ?? 0,

    nome: cliente?.usuario_nome ?? '',

    email: cliente?.usuario_email ?? '',

    telefone: cliente?.usuario_telefone ?? '',

    nascimento:
      cliente?.usuario_dt_nascimento ?? '',

 
    foto: '',

    status:
      Number(cliente?.usuario_ativo) === 1
        ? 'Ativo'
        : 'Inativo',

    // A API nao retorna senha
    senha: '',
  })
);

    console.log(
      '========== CLIENTES FORMATADOS =========='
    );

    console.log(
      JSON.stringify(
        clientesFormatados,
        null,
        2
      )
    );

    console.log(
      '========================================='
    );

    setClientes(clientesFormatados);

  } catch (error) {
    console.error(
      'Erro ao carregar clientes:',
      error
    );

    alert(
      error?.message ||
      'Erro ao carregar clientes.'
    );
  }
}

  // =====================================================
  // CARREGAR CLIENTES AO ABRIR A TELA
  // =====================================================

  useEffect(() => {
    carregarClientes();
  }, []);

  // =====================================================
  // PESQUISA E FILTRO
  // =====================================================

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = String(
      pesquisa ?? ''
    ).toLowerCase();

    const nome = String(
      cliente?.nome ?? ''
    );

    const email = String(
      cliente?.email ?? ''
    );

    const telefone = String(
      cliente?.telefone ?? ''
    );

    const status = String(
      cliente?.status ?? 'Ativo'
    );

    const correspondePesquisa =
      nome.toLowerCase().includes(termo) ||
      email.toLowerCase().includes(termo) ||
      telefone.includes(termo);

    const correspondeFiltro =
      filtro === 'Todos' ||
      status === filtro;

    return (
      correspondePesquisa &&
      correspondeFiltro
    );
  });

  // =====================================================
  // ABRIR CADASTRO
  // =====================================================

  function abrirCadastro() {
    setModoEdicao(false);
    setClienteSelecionado(null);

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

  // =====================================================
  // ABRIR EDICAO
  // =====================================================

  function abrirEdicao(cliente) {
    setModoEdicao(true);
    setClienteSelecionado(cliente);

    setFormulario({
      nome: cliente?.nome ?? '',
      email: cliente?.email ?? '',
      senha: '',
      telefone: cliente?.telefone ?? '',
      nascimento: cliente?.nascimento ?? '',
      foto: cliente?.foto ?? '',
    });

    setModalFormulario(true);
  }

  // =====================================================
  // FECHAR FORMULARIO
  // =====================================================

  function fecharFormulario() {
    setModalFormulario(false);
    setClienteSelecionado(null);

    setFormulario({
      nome: '',
      email: '',
      senha: '',
      telefone: '',
      nascimento: '',
      foto: '',
    });
  }

  // =====================================================
  // ALTERAR FORMULARIO
  // =====================================================

  function alterarFormulario(event) {
    const {
      name,
      value,
    } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // =====================================================
  // SALVAR CLIENTE
  // =====================================================

  async function salvarCliente(event) {
    event.preventDefault();

    // ---------------------------------------------
    // VALIDACAO
    // ---------------------------------------------

    if (!formulario.nome.trim()) {
      alert('Digite o nome do cliente.');
      return;
    }

    if (!formulario.email.trim()) {
      alert('Digite o e-mail do cliente.');
      return;
    }

    if (!formulario.telefone.trim()) {
      alert('Digite o telefone do cliente.');
      return;
    }

    /*
     * No cadastro a senha e obrigatoria.
     *
     * Na edicao nao obrigamos a senha porque
     * normalmente ela nao e retornada pela API.
     */

    if (
      !modoEdicao &&
      !formulario.senha.trim()
    ) {
      alert('Digite a senha do cliente.');
      return;
    }

    try {
      // =================================================
      // EDITAR
      // =================================================

      if (modoEdicao) {
        /*
         * Montamos os dados da alteracao.
         */

        const dadosCliente = {
          nome: formulario.nome,
          email: formulario.email,
          telefone: formulario.telefone,
          nascimento: formulario.nascimento,
          foto: formulario.foto,
        };

        /*
         * Se o usuario digitou uma nova senha,
         * enviamos tambem.
         */

        if (formulario.senha.trim()) {
          dadosCliente.senha =
            formulario.senha;
        }

        const resposta =
          await requisicaoAPI(
            `/clientes/${clienteSelecionado.id}`,
            {
              method: 'PUT',
              body: JSON.stringify(
                dadosCliente
              ),
            }
          );

        console.log(
          'Cliente atualizado:',
          resposta
        );

        alert(
          'Cliente atualizado com sucesso!'
        );
      }

      // =================================================
      // CADASTRAR
      // =================================================

      else {
        const dadosCliente = {
          nome: formulario.nome,
          email: formulario.email,
          senha: formulario.senha,
          telefone: formulario.telefone,
          nascimento: formulario.nascimento,
          foto: formulario.foto,
        };

        const resposta =
          await requisicaoAPI(
            '/clientes',
            {
              method: 'POST',
              body: JSON.stringify(
                dadosCliente
              ),
            }
          );

        console.log(
          'Cliente cadastrado:',
          resposta
        );

        alert(
          'Cliente cadastrado com sucesso!'
        );
      }

      // =================================================
      // ATUALIZAR LISTA
      // =================================================

      await carregarClientes();

      fecharFormulario();

    } catch (error) {
      console.error(
        'Erro ao salvar cliente:',
        error
      );

      alert(
        error?.message ||
        'Erro ao salvar cliente.'
      );
    }
  }

  // =====================================================
  // VISUALIZAR CLIENTE
  // =====================================================

  function visualizarCliente(cliente) {
    setClienteSelecionado(cliente);
    setModalVisualizar(true);
  }

  // =====================================================
  // FECHAR VISUALIZACAO
  // =====================================================

  function fecharVisualizacao() {
    setClienteSelecionado(null);
    setModalVisualizar(false);
  }

  // =====================================================
  // ATIVAR / DESATIVAR
  // =====================================================

  async function alterarStatus(cliente) {
    const novoStatus =
      cliente.status === 'Ativo'
        ? 'Inativo'
        : 'Ativo';

    const mensagem =
      novoStatus === 'Inativo'
        ? `Deseja desativar o cliente ${cliente.nome}?`
        : `Deseja ativar o cliente ${cliente.nome}?`;

    const confirmou =
      window.confirm(mensagem);

    if (!confirmou) {
      return;
    }

    // =================================================
    // DESATIVAR
    // =================================================

    if (novoStatus === 'Inativo') {
      try {
        const resposta =
          await requisicaoAPI(
            `/clientes/${cliente.id}/ocultar`,
            {
              method: 'PATCH',
            }
          );

        console.log(
          'Cliente desativado:',
          resposta
        );

        await carregarClientes();

        alert(
          'Cliente desativado com sucesso!'
        );

      } catch (error) {
        console.error(
          'Erro ao desativar cliente:',
          error
        );

        alert(
          error?.message ||
          'Erro ao desativar cliente.'
        );
      }

      return;
    }

    // =================================================
    // ATIVAR
    // =================================================

    /*
     * Pela rota da API que temos atualmente,
     * existe a rota de ocultar/desativar:
     *
     * PATCH /clientes/:id/ocultar
     *
     * Mas nao temos uma rota de reativacao
     * confirmada.
     *
     * Portanto nao fazemos uma falsa requisicao.
     */

    alert(
      'A API ainda nao possui uma rota de reativacao do cliente.'
    );
  }

  // =====================================================
  // TELA
  // =====================================================

  return (
    <main className="clientes-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="clientes-header">

        <div className="clientes-logo">
          <img
            src={logoHope}
            alt="Hope Barbearia"
          />
        </div>

        <div className="clientes-title">

          <h1>
            Clientes
          </h1>

          <p>
            Gerenciamento de clientes
          </p>

        </div>

        <div className="clientes-user">

          <div className="user-avatar">
            B
          </div>

          <div className="user-info">

            <strong>
              Bruno
            </strong>

            <span>
              Barbeiro
            </span>

          </div>

        </div>

      </header>

      {/* =================================================
          CONTEUDO
      ================================================= */}

      <section className="clientes-content">

        {/* CABECALHO */}

        <div className="clientes-heading">

          <div>

            <span className="heading-label">
              AREA DO BARBEIRO
            </span>

            <h2>
              Meus clientes
            </h2>

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

        {/* =================================================
            CARD
        ================================================= */}

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

          {/* =================================================
              FILTROS
          ================================================= */}

          <div className="clientes-filtros">

            <div className="campo-pesquisa">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Pesquisar cliente..."
                value={pesquisa}
                onChange={(event) =>
                  setPesquisa(
                    event.target.value
                  )
                }
              />

            </div>

            <select
              value={filtro}
              onChange={(event) =>
                setFiltro(
                  event.target.value
                )
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

          {/* =================================================
              TABELA
          ================================================= */}

          <div className="tabela-container">

            <table className="clientes-tabela">

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Nome
                  </th>

                  <th>
                    Telefone
                  </th>

                  <th>
                    E-mail
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

                {clientesFiltrados.length > 0 ? (

                  clientesFiltrados.map(
                    (cliente) => (

                      <tr
                        key={cliente.id}
                      >

                        <td className="cliente-id">

                          {String(
                            cliente.id ?? ''
                          ).padStart(
                            2,
                            '0'
                          )}

                        </td>

                        <td>

                          <div className="cliente-nome">

                            <div className="cliente-avatar">

                              {cliente.foto ? (

                                <img
                                  src={cliente.foto}
                                  alt={
                                    cliente.nome
                                  }
                                />

                              ) : (

                                String(
                                  cliente.nome ??
                                  '?'
                                )
                                  .charAt(0)
                                  .toUpperCase()

                              )}

                            </div>

                            <strong>
                              {cliente.nome ||
                                'Sem nome'}
                            </strong>

                          </div>

                        </td>

                        <td>

                          {cliente.telefone ||
                            'Não informado'}

                        </td>

                        <td>

                          {cliente.email ||
                            'Não informado'}

                        </td>

                        <td>

                          <span
                            className={`status ${
                              cliente.status ===
                              'Ativo'
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
                                visualizarCliente(
                                  cliente
                                )
                              }
                              title="Visualizar"
                            >
                              Visualizar
                            </button>

                            <button
                              className="acao-editar"
                              onClick={() =>
                                abrirEdicao(
                                  cliente
                                )
                              }
                              title="Editar"
                            >
                              Editar
                            </button>

                            <button
                              className={
                                cliente.status ===
                                'Ativo'
                                  ? 'acao-desativar'
                                  : 'acao-ativar'
                              }
                              onClick={() =>
                                alterarStatus(
                                  cliente
                                )
                              }
                              title={
                                cliente.status ===
                                'Ativo'
                                  ? 'Desativar'
                                  : 'Ativar'
                              }
                            >

                              {cliente.status ===
                              'Ativo'
                                ? 'Desativar'
                                : 'Ativar'}

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      className="nenhum-cliente"
                    >

                      <div>

                        <span>
                          ⌕
                        </span>

                        <strong>
                          Nenhum cliente encontrado
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

      {/* =================================================
          MODAL - CADASTRO / EDICAO
      ================================================= */}

      {modalFormulario && (

        <div
          className="modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
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
                type="button"
                className="modal-fechar"
                onClick={
                  fecharFormulario
                }
              >
                ×
              </button>

            </div>

            <form
              className="cliente-form"
              onSubmit={
                salvarCliente
              }
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
                    value={
                      formulario.nome
                    }
                    onChange={
                      alterarFormulario
                    }
                  />

                </div>

                {/* EMAIL */}

                <div className="form-group">

                  <label>
                    E-mail *
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="cliente@email.com"
                    value={
                      formulario.email
                    }
                    onChange={
                      alterarFormulario
                    }
                  />

                </div>

                {/* SENHA */}

                <div className="form-group">

                  <label>
                    Senha
                    {!modoEdicao && ' *'}
                  </label>

                  <input
                    type="password"
                    name="senha"
                    placeholder={
                      modoEdicao
                        ? 'Deixe vazio para manter'
                        : 'Digite a senha'
                    }
                    value={
                      formulario.senha
                    }
                    onChange={
                      alterarFormulario
                    }
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
                    value={
                      formulario.telefone
                    }
                    onChange={
                      alterarFormulario
                    }
                  />

                </div>

                {/* DATA */}

                <div className="form-group">

                  <label>
                    Data de nascimento
                  </label>

                  <input
                    type="date"
                    name="nascimento"
                    value={
                      formulario.nascimento
                    }
                    onChange={
                      alterarFormulario
                    }
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
                    value={
                      formulario.foto
                    }
                    onChange={
                      alterarFormulario
                    }
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
                  onClick={
                    fecharFormulario
                  }
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

      {/* =================================================
          MODAL - VISUALIZACAO
      ================================================= */}

      {modalVisualizar &&
        clienteSelecionado && (

          <div
            className="modal-overlay"
            onMouseDown={(event) => {

              if (
                event.target ===
                event.currentTarget
              ) {
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
                  type="button"
                  className="modal-fechar"
                  onClick={
                    fecharVisualizacao
                  }
                >
                  ×
                </button>

              </div>

              <div className="cliente-detalhes">

                <div className="cliente-detalhe-topo">

                  <div className="cliente-avatar grande">

                    {clienteSelecionado.foto ? (

                      <img
                        src={
                          clienteSelecionado.foto
                        }
                        alt={
                          clienteSelecionado.nome
                        }
                      />

                    ) : (

                      String(
                        clienteSelecionado.nome ??
                        '?'
                      )
                        .charAt(0)
                        .toUpperCase()

                    )}

                  </div>

                  <div>

                    <h4>
                      {clienteSelecionado.nome ||
                        'Sem nome'}
                    </h4>

                    <span
                      className={`status ${
                        clienteSelecionado.status ===
                        'Ativo'
                          ? 'status-ativo'
                          : 'status-inativo'
                      }`}
                    >

                      {
                        clienteSelecionado.status
                      }

                    </span>

                  </div>

                </div>

                <div className="detalhes-grid">

                  <div>

                    <small>
                      ID
                    </small>

                    <strong>
                      #
                      {String(
                        clienteSelecionado.id ??
                        ''
                      ).padStart(
                        2,
                        '0'
                      )}
                    </strong>

                  </div>

                  <div>

                    <small>
                      Telefone
                    </small>

                    <strong>
                      {
                        clienteSelecionado.telefone ||
                        'Não informado'
                      }
                    </strong>

                  </div>

                  <div>

                    <small>
                      E-mail
                    </small>

                    <strong>
                      {
                        clienteSelecionado.email ||
                        'Não informado'
                      }
                    </strong>

                  </div>

                  <div>

                    <small>
                      Data de nascimento
                    </small>

                    <strong>
                      {
                        clienteSelecionado.nascimento ||
                        'Não informado'
                      }
                    </strong>

                  </div>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={
                    fecharVisualizacao
                  }
                >
                  Fechar
                </button>

                <button
                  type="button"
                  className="btn-salvar"
                  onClick={() => {

                    const cliente =
                      clienteSelecionado;

                    fecharVisualizacao();

                    abrirEdicao(
                      cliente
                    );

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