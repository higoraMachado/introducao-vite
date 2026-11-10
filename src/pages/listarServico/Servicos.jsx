
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Servicos.css';
import logoHope from '../../assets/logo_login.png';

const API_URL = 'http://localhost:3333';

function Servicos() {
  const navigate = useNavigate();

  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [pesquisa, setPesquisa] = useState('');
  const [filtro, setFiltro] = useState('Todos');

  const [modalFormulario, setModalFormulario] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);

  const [usuario, setUsuario] = useState({});

  const [formulario, setFormulario] = useState({
    nome: '',
    duracao: '',
    valor: '',
  });

  // =========================================
  // USUÁRIO LOGADO
  // =========================================

  useEffect(() => {
    try {
      const usuarioSalvo = JSON.parse(
        localStorage.getItem('usuario') || '{}'
      );

      setUsuario(usuarioSalvo || {});
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  }, []);

  const nomeUsuario =
    usuario.usuario_nome ||
    usuario.nome ||
    usuario.name ||
    'Usuário';

  const inicialUsuario =
    nomeUsuario.trim().charAt(0).toUpperCase() || 'U';

  // =========================================
  // NAVEGAÇÃO DO CABEÇALHO
  // =========================================

  function voltarPagina() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboardAdministrador');
    }
  }

  function abrirPerfil() {
    navigate('/perfil');
  }

  // =========================================
  // TOKEN
  // =========================================

  function pegarToken() {
    return localStorage.getItem('token');
  }

  // =========================================
  // RESPOSTA DA API
  // =========================================

  async function lerResposta(resposta) {
    const texto = await resposta.text();

    let dados = {};

    try {
      dados = texto ? JSON.parse(texto) : {};
    } catch {
      throw new Error('A API retornou uma resposta inválida.');
    }

    if (!resposta.ok) {
      throw new Error(
        dados.message ||
        dados.mensagem ||
        `Erro na requisição: ${resposta.status}`
      );
    }

    return dados;
  }

  // =========================================
  // CONVERTER DURAÇÃO
  // =========================================

  function converterDuracao(duracao) {
    if (duracao === null || duracao === undefined || duracao === '') {
      return 0;
    }

    if (typeof duracao === 'number') {
      return duracao;
    }

    const texto = String(duracao).trim();

    if (texto.includes(':')) {
      const partes = texto.split(':').map(Number);

      if (partes.some(Number.isNaN)) return 0;

      return (partes[0] || 0) * 60 +
        (partes[1] || 0) +
        (partes[2] || 0) / 60;
    }

    const numero = Number(texto);

    return Number.isFinite(numero) ? numero : 0;
  }

  // =========================================
  // MAPEAR SERVIÇOS
  // =========================================

  function mapearServico(servico) {
    return {
      id: servico.servico_id,
      nome: servico.servico_nome || '',
      duracao: converterDuracao(servico.servico_duracao),
      valor: Number(servico.servico_preco) || 0,
      descricao: servico.servico_descricao || '',
      status: Number(servico.servico_ativo) === 1
        ? 'Ativo'
        : 'Inativo',
    };
  }

  // =========================================
  // CARREGAR SERVIÇOS
  // =========================================

  async function carregarServicos() {
    try {
      setCarregando(true);

      const token = pegarToken();

      if (!token) {
        throw new Error('Você precisa estar logado.');
      }

      const resposta = await fetch(`${API_URL}/servicos`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = await lerResposta(resposta);

      const lista = Array.isArray(dados.dados)
        ? dados.dados
        : [];

      setServicos(lista.map(mapearServico));
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      alert(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarServicos();
  }, []);

  // =========================================
  // PESQUISA E FILTRO
  // =========================================

  const servicosFiltrados = servicos.filter((servico) => {
    const termo = pesquisa.trim().toLowerCase();

    const correspondePesquisa =
      servico.nome.toLowerCase().includes(termo);

    const correspondeFiltro =
      filtro === 'Todos' || servico.status === filtro;

    return correspondePesquisa && correspondeFiltro;
  });

  // =========================================
  // ABRIR CADASTRO
  // =========================================

  function abrirCadastro() {
    setServicoSelecionado(null);

    setFormulario({
      nome: '',
      duracao: '',
      valor: '',
    });

    setModalFormulario(true);
  }

  // =========================================
  // ABRIR EDIÇÃO
  // =========================================

  function abrirEdicao(servico) {
    setServicoSelecionado(servico);

    setFormulario({
      nome: servico.nome,
      duracao: String(servico.duracao),
      valor: String(servico.valor),
    });

    setModalFormulario(true);
  }

  // =========================================
  // ALTERAR FORMULÁRIO
  // =========================================

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // =========================================
  // SALVAR SERVIÇO
  // =========================================

  async function salvarServico(event) {
    event.preventDefault();

    if (
      !formulario.nome.trim() ||
      !formulario.duracao ||
      !formulario.valor
    ) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const valor = Number(
      String(formulario.valor).replace(',', '.')
    );

    const duracao = Number(formulario.duracao);

    if (!Number.isFinite(valor) || valor <= 0) {
      alert('Informe um valor válido.');
      return;
    }

    if (!Number.isInteger(duracao) || duracao <= 0) {
      alert('Informe uma duração válida.');
      return;
    }

    try {
      setSalvando(true);

      const token = pegarToken();

      if (!token) {
        throw new Error('Você precisa estar logado.');
      }

      const corpo = {
        servico_nome: formulario.nome.trim(),
        servico_duracao: duracao,
        servico_preco: valor,
      };

      const editando = Boolean(servicoSelecionado);

      const url = editando
        ? `${API_URL}/servicos/${servicoSelecionado.id}`
        : `${API_URL}/servicos`;

      const resposta = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(corpo),
      });

      await lerResposta(resposta);

      alert(
        editando
          ? 'Serviço atualizado com sucesso!'
          : 'Serviço cadastrado com sucesso!'
      );

      fecharFormulario();
      await carregarServicos();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      alert(error.message);
    } finally {
      setSalvando(false);
    }
  }

  // =========================================
  // ATIVAR OU DESATIVAR
  // =========================================

  async function alterarStatus(servico) {
    const vaiAtivar = servico.status === 'Inativo';

    const mensagem = vaiAtivar
      ? `Deseja ativar o serviço "${servico.nome}"?`
      : `Deseja desativar o serviço "${servico.nome}"?`;

    if (!window.confirm(mensagem)) return;

    try {
      const token = pegarToken();

      if (!token) {
        throw new Error('Você precisa estar logado.');
      }

      const rota = vaiAtivar
        ? `${API_URL}/servicos/${servico.id}/reativar`
        : `${API_URL}/servicos/${servico.id}/desativar`;

      const resposta = await fetch(rota, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await lerResposta(resposta);

      alert(
        vaiAtivar
          ? 'Serviço ativado com sucesso!'
          : 'Serviço desativado com sucesso!'
      );

      await carregarServicos();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert(error.message);
    }
  }

  // =========================================
  // FECHAR FORMULÁRIO
  // =========================================

  function fecharFormulario() {
    setModalFormulario(false);
    setServicoSelecionado(null);

    setFormulario({
      nome: '',
      duracao: '',
      valor: '',
    });
  }

  // =========================================
  // FORMATAÇÃO
  // =========================================

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatarDuracao(duracao) {
    return `${Math.round(Number(duracao) || 0)} minutos`;
  }

  // =========================================
  // TELA
  // =========================================

  return (
    <main className="servicos-page">

      <header className="servicos-header">

        {/* LOGO CLICÁVEL */}

        <div className="servicos-logo">
          <button
            type="button"
            onClick={voltarPagina}
            title="Voltar à página anterior"
            aria-label="Voltar à página anterior"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img
              src={logoHope}
              alt="Hope Barbearia - Voltar"
            />
          </button>
        </div>

        <div className="servicos-title">
          <h1>Serviços</h1>
          <p>Gerenciamento de serviços</p>
        </div>

        {/* PERFIL CLICÁVEL */}

        <button
          type="button"
          className="servicos-user"
          onClick={abrirPerfil}
          title="Abrir meu perfil"
          aria-label="Abrir configurações do perfil"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            font: 'inherit',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div className="user-avatar">
            {inicialUsuario}
          </div>

          <div className="user-info">
            <strong>{nomeUsuario}</strong>
            <span>Minha conta</span>
          </div>
        </button>

      </header>

      <section className="servicos-content">

        <div className="servicos-heading">

          <div>
            <span className="heading-label">
              ÁREA DO BARBEIRO
            </span>

            <h2>Serviços</h2>

            <p>
              Consulte e gerencie os serviços oferecidos pela Hope Barbearia.
            </p>
          </div>

          <button
            type="button"
            className="btn-novo-servico"
            onClick={abrirCadastro}
          >
            + Novo serviço
          </button>

        </div>

        <section className="servicos-card">

          <div className="card-header">
            <div>
              <span className="card-label">SERVIÇOS</span>
              <h3>Lista de serviços</h3>
            </div>

            <div className="total-servicos">
              {servicos.length}{' '}
              {servicos.length === 1 ? 'serviço' : 'serviços'}
            </div>
          </div>

          <div className="servicos-filtros">

            <div className="campo-pesquisa">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Pesquisar serviço..."
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
              />
            </div>

            <select
              value={filtro}
              onChange={(event) => setFiltro(event.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="Ativo">Ativos</option>
              <option value="Inativo">Inativos</option>
            </select>

          </div>

          <div className="tabela-container">

            <table className="servicos-tabela">

              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Duração</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>

                {carregando ? (
                  <tr>
                    <td colSpan="5" className="nenhum-servico">
                      Carregando serviços...
                    </td>
                  </tr>
                ) : servicosFiltrados.length > 0 ? (
                  servicosFiltrados.map((servico) => (
                    <tr key={servico.id}>

                      <td>
                        <strong className="nome-servico">
                          {servico.nome}
                        </strong>
                      </td>

                      <td>
                        <span className="duracao-servico">
                          {formatarDuracao(servico.duracao)}
                        </span>
                      </td>

                      <td>
                        <strong className="valor-servico">
                          {formatarValor(servico.valor)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`status ${
                            servico.status === 'Ativo'
                              ? 'status-ativo'
                              : 'status-inativo'
                          }`}
                        >
                          {servico.status}
                        </span>
                      </td>

                      <td>
                        <div className="acoes">

                          <button
                            type="button"
                            className="acao-editar"
                            onClick={() => abrirEdicao(servico)}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className={
                              servico.status === 'Ativo'
                                ? 'acao-desativar'
                                : 'acao-ativar'
                            }
                            onClick={() => alterarStatus(servico)}
                          >
                            {servico.status === 'Ativo'
                              ? 'Desativar'
                              : 'Ativar'}
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="nenhum-servico">
                      <div>
                        <span>✂</span>
                        <strong>Nenhum serviço encontrado</strong>
                        <p>
                          Tente alterar sua pesquisa ou o filtro selecionado.
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

      {/* MODAL DE CADASTRO E EDIÇÃO */}

      {modalFormulario && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !salvando
            ) {
              fecharFormulario();
            }
          }}
        >

          <div className="modal">

            <div className="modal-header">
              <div>
                <span className="card-label">
                  {servicoSelecionado ? 'SERVIÇO' : 'NOVO SERVIÇO'}
                </span>

                <h3>
                  {servicoSelecionado
                    ? 'Editar serviço'
                    : 'Cadastrar serviço'}
                </h3>
              </div>

              <button
                type="button"
                className="modal-fechar"
                onClick={fecharFormulario}
                disabled={salvando}
              >
                ×
              </button>
            </div>

            <form
              className="servico-form"
              onSubmit={salvarServico}
            >

              <div className="form-grid">

                <div className="form-group form-full">
                  <label htmlFor="nome">
                    Nome do serviço *
                  </label>

                  <input
                    id="nome"
                    type="text"
                    name="nome"
                    placeholder="Ex.: Corte Masculino"
                    value={formulario.nome}
                    onChange={alterarFormulario}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duracao">
                    Duração *
                  </label>

                  <div className="input-com-sufixo">
                    <input
                      id="duracao"
                      type="number"
                      name="duracao"
                      min="1"
                      step="1"
                      placeholder="30"
                      value={formulario.duracao}
                      onChange={alterarFormulario}
                      required
                    />

                    <span>min</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="valor">
                    Valor *
                  </label>

                  <div className="input-com-prefixo">
                    <span>R$</span>

                    <input
                      id="valor"
                      type="number"
                      name="valor"
                      min="0.01"
                      step="0.01"
                      placeholder="35,00"
                      value={formulario.valor}
                      onChange={alterarFormulario}
                      required
                    />
                  </div>
                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={fecharFormulario}
                  disabled={salvando}
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
                    : servicoSelecionado
                      ? 'Salvar alterações'
                      : 'Cadastrar serviço'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}

export default Servicos;
