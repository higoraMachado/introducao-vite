
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Clientes.css';
import logoHope from '../../assets/logo_login.png';

const API_URL = 'http://localhost:3333';

function obterUsuarioLogado() {
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    const tipo = Number(
      usuario.usuario_tipo ?? usuario.tipo ?? usuario.tipo_usuario
    );

    const nome =
      usuario.usuario_nome ||
      usuario.nome ||
      usuario.name ||
      'Usuário';

    const tipos = {
      1: 'Administrador',
      2: 'Barbeiro',
      3: 'Cliente',
    };

    return {
      nome,
      tipo,
      cargo: tipos[tipo] || 'Usuário',
      inicial: nome.charAt(0).toUpperCase(),
    };
  } catch {
    return {
      nome: 'Usuário',
      tipo: 0,
      cargo: 'Usuário',
      inicial: 'U',
    };
  }
}

function Clientes() {
  const navigate = useNavigate();

  const [usuario] = useState(obterUsuarioLogado);

  const [clientes, setClientes] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [filtro, setFiltro] = useState('Todos');

  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const formularioInicial = {
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    nascimento: '',
    foto: '',
  };

  const [formulario, setFormulario] = useState(formularioInicial);

  async function requisicaoAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
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

    if (!resposta.ok) {
      throw new Error(
        dados.message ||
        dados.mensagem ||
        dados.erro ||
        'Erro na comunicação com a API.'
      );
    }

    return dados;
  }

  function formatarData(data) {
    return data ? String(data).substring(0, 10) : '';
  }

  async function carregarClientes() {
    try {
      const resposta = await requisicaoAPI('/clientes');

      const lista = Array.isArray(resposta.dados)
        ? resposta.dados
        : [];

      setClientes(
        lista.map((cliente) => ({
          id: cliente.usuario_id,
          nome: cliente.usuario_nome || '',
          email: cliente.usuario_email || '',
          telefone: cliente.usuario_telefone || '',
          nascimento: formatarData(cliente.usuario_dt_nascimento),
          foto: cliente.usuario_foto || '',
          status: Number(cliente.usuario_ativo) === 1
            ? 'Ativo'
            : 'Inativo',
        }))
      );
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      alert(error.message || 'Erro ao carregar clientes.');
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = pesquisa.toLowerCase();

    const correspondePesquisa =
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.email.toLowerCase().includes(termo) ||
      String(cliente.telefone).includes(termo);

    const correspondeFiltro =
      filtro === 'Todos' || cliente.status === filtro;

    return correspondePesquisa && correspondeFiltro;
  });

  function abrirCadastro() {
    setModoEdicao(false);
    setClienteSelecionado(null);
    setFormulario(formularioInicial);
    setModalFormulario(true);
  }

  function abrirEdicao(cliente) {
    setModoEdicao(true);
    setClienteSelecionado(cliente);

    setFormulario({
      nome: cliente.nome,
      email: cliente.email,
      senha: '',
      telefone: cliente.telefone,
      nascimento: cliente.nascimento,
      foto: cliente.foto,
    });

    setModalFormulario(true);
  }

  function fecharFormulario() {
    setModalFormulario(false);
    setClienteSelecionado(null);
    setFormulario(formularioInicial);
  }

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function salvarCliente(event) {
    event.preventDefault();

    if (salvando) return;

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

    if (!modoEdicao && !formulario.senha.trim()) {
      alert('Digite a senha do cliente.');
      return;
    }

    const dadosCliente = {
      usuario_nome: formulario.nome.trim(),
      usuario_email: formulario.email.trim(),
      usuario_telefone: formulario.telefone.replace(/\D/g, ''),
      usuario_dt_nascimento: formulario.nascimento || null,
    };

    if (!modoEdicao) {
      dadosCliente.usuario_senha = formulario.senha;
    } else if (formulario.senha.trim()) {
      dadosCliente.usuario_senha = formulario.senha;
    }

    try {
      setSalvando(true);

      if (modoEdicao) {
        await requisicaoAPI(`/clientes/${clienteSelecionado.id}`, {
          method: 'PUT',
          body: JSON.stringify(dadosCliente),
        });

        alert('Cliente atualizado com sucesso!');
      } else {
        await requisicaoAPI('/clientes', {
          method: 'POST',
          body: JSON.stringify(dadosCliente),
        });

        alert('Cliente cadastrado com sucesso!');
      }

      await carregarClientes();
      fecharFormulario();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert(error.message || 'Erro ao salvar cliente.');
    } finally {
      setSalvando(false);
    }
  }

  function visualizarCliente(cliente) {
    setClienteSelecionado(cliente);
    setModalVisualizar(true);
  }

  function fecharVisualizacao() {
    setClienteSelecionado(null);
    setModalVisualizar(false);
  }

  async function alterarStatus(cliente) {
    const ativar = cliente.status !== 'Ativo';

    const mensagem = ativar
      ? `Deseja ativar o cliente ${cliente.nome}?`
      : `Deseja desativar o cliente ${cliente.nome}?`;

    if (!window.confirm(mensagem)) return;

    try {
      const acao = ativar ? 'reativar' : 'ocultar';

      await requisicaoAPI(`/clientes/${cliente.id}/${acao}`, {
        method: 'PATCH',
      });

      alert(
        ativar
          ? 'Cliente ativado com sucesso.'
          : 'Cliente desativado com sucesso.'
      );

      await carregarClientes();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert(error.message || 'Erro ao alterar status do cliente.');
    }
  }

  function irParaPainel() {
    if (usuario.tipo === 1) {
      navigate('/dashboardAdministrador');
    } else if (usuario.tipo === 2) {
      navigate('/dashboardBarbeiro');
    } else {
      navigate('/dashboardCliente');
    }
  }

  function irParaPerfil() {
    navigate('/perfil');
  }

  return (
    <main className="clientes-page">
      <header className="clientes-header">
        <div
          className="clientes-logo"
          onClick={irParaPainel}
          title="Voltar ao painel"
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter') irParaPainel();
          }}
        >
          <img src={logoHope} alt="Hope Barbearia" />
        </div>

        <div className="clientes-title">
          <h1>Clientes</h1>
          <p>Gerenciamento de clientes</p>
        </div>

        <div
          className="clientes-user"
          onClick={irParaPerfil}
          title="Abrir minha conta"
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter') irParaPerfil();
          }}
        >
          <div className="user-avatar">{usuario.inicial}</div>

          <div className="user-info">
            <strong>{usuario.nome}</strong>
            <span>{usuario.cargo}</span>
          </div>
        </div>
      </header>

      <section className="clientes-content">
        <div className="clientes-heading">
          <div>
            <span className="heading-label">
              {usuario.tipo === 1 ? 'ADMINISTRADOR' : 'ÁREA DO BARBEIRO'}
            </span>

            <h2>
              {usuario.tipo === 1 ? 'Gerenciamento de clientes' : 'Meus clientes'}
            </h2>

            <p>Cadastre, consulte e gerencie os clientes da Hope Barbearia.</p>
          </div>

          <button
            className="btn-cadastrar"
            onClick={abrirCadastro}
          >
            + Cadastrar cliente
          </button>
        </div>

        <section className="clientes-card">
          <div className="card-top">
            <div>
              <span className="card-label">CLIENTES</span>
              <h3>Lista de clientes</h3>
            </div>

            <div className="total-clientes">
              {clientes.length} clientes
            </div>
          </div>

          <div className="clientes-filtros">
            <div className="campo-pesquisa">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Pesquisar cliente..."
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
              />
            </div>

            <select
              value={filtro}
              onChange={(event) => setFiltro(event.target.value)}
            >
              <option value="Todos">Todos os clientes</option>
              <option value="Ativo">Ativos</option>
              <option value="Inativo">Inativos</option>
            </select>
          </div>

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
                              <img src={cliente.foto} alt={cliente.nome} />
                            ) : (
                              cliente.nome.charAt(0).toUpperCase()
                            )}
                          </div>

                          <strong>{cliente.nome || 'Sem nome'}</strong>
                        </div>
                      </td>

                      <td>{cliente.telefone || 'Não informado'}</td>
                      <td>{cliente.email || 'Não informado'}</td>

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
                            onClick={() => visualizarCliente(cliente)}
                          >
                            Visualizar
                          </button>

                          <button
                            className="acao-editar"
                            onClick={() => abrirEdicao(cliente)}
                          >
                            Editar
                          </button>

                          <button
                            className={
                              cliente.status === 'Ativo'
                                ? 'acao-desativar'
                                : 'acao-ativar'
                            }
                            onClick={() => alterarStatus(cliente)}
                          >
                            {cliente.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="nenhum-cliente">
                      <div>
                        <span>⌕</span>
                        <strong>Nenhum cliente encontrado</strong>
                        <p>Tente alterar sua pesquisa ou o filtro selecionado.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

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
                  {modoEdicao ? 'CLIENTE' : 'NOVO CLIENTE'}
                </span>

                <h3>
                  {modoEdicao ? 'Editar cliente' : 'Cadastrar cliente'}
                </h3>
              </div>

              <button
                type="button"
                className="modal-fechar"
                onClick={fecharFormulario}
              >
                ×
              </button>
            </div>

            <form className="cliente-form" onSubmit={salvarCliente}>
              <div className="form-grid">
                <div className="form-group form-full">
                  <label>Nome *</label>
                  <input
                    type="text"
                    name="nome"
                    placeholder="Digite o nome completo"
                    value={formulario.nome}
                    onChange={alterarFormulario}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>E-mail *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="cliente@email.com"
                    value={formulario.email}
                    onChange={alterarFormulario}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Senha {modoEdicao ? '(opcional)' : '*'}
                  </label>

                  <input
                    type="password"
                    name="senha"
                    placeholder={
                      modoEdicao
                        ? 'Deixe vazio para manter'
                        : 'Digite a senha'
                    }
                    value={formulario.senha}
                    onChange={alterarFormulario}
                    required={!modoEdicao}
                  />
                </div>

                <div className="form-group">
                  <label>Telefone *</label>
                  <input
                    type="tel"
                    name="telefone"
                    placeholder="(00) 00000-0000"
                    value={formulario.telefone}
                    onChange={alterarFormulario}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Data de nascimento</label>
                  <input
                    type="date"
                    name="nascimento"
                    value={formulario.nascimento}
                    onChange={alterarFormulario}
                  />
                </div>

                <div className="form-group form-full">
                  <label>Foto</label>
                  <input
                    type="text"
                    name="foto"
                    placeholder="URL da foto (opcional)"
                    value={formulario.foto}
                    onChange={alterarFormulario}
                  />
                  <small>Campo opcional para foto do cliente.</small>
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
                  disabled={salvando}
                >
                  {salvando
                    ? 'Salvando...'
                    : modoEdicao
                      ? 'Salvar alterações'
                      : 'Salvar cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <span className="card-label">CLIENTE</span>
                <h3>Dados do cliente</h3>
              </div>

              <button
                type="button"
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
                    clienteSelecionado.nome.charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <h4>{clienteSelecionado.nome}</h4>

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
                    {clienteSelecionado.telefone || 'Não informado'}
                  </strong>
                </div>

                <div>
                  <small>E-mail</small>
                  <strong>
                    {clienteSelecionado.email || 'Não informado'}
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
                type="button"
                className="btn-cancelar"
                onClick={fecharVisualizacao}
              >
                Fechar
              </button>

              <button
                type="button"
                className="btn-salvar"
                onClick={() => {
                  const cliente = clienteSelecionado;
                  fecharVisualizacao();
                  abrirEdicao(cliente);
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
