
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GerenciamentoBarbeiros.css";
import logo from "../../assets/logo-hope.png";

const API_URL = "http://localhost:3333";

const FORMULARIO_INICIAL = {
  nome: "",
  email: "",
  senha: "",
  telefone: "",
  dataNascimento: "",
  especialidade: "",
  foto: "",
};

function GerenciamentoBarbeiros() {
  const navigate = useNavigate();

  const [barbeiros, setBarbeiros] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);

  const token = localStorage.getItem("token");

  async function requisicao(endpoint, options = {}) {
    const resposta = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
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
        "Não foi possível concluir a operação."
      );
    }

    return dados;
  }

  async function carregarBarbeiros() {
    try {
      setCarregando(true);

      const dados = await requisicao("/barbeiros");

      setBarbeiros(
        Array.isArray(dados.dados) ? dados.dados : []
      );
    } catch (error) {
      console.error("Erro ao carregar barbeiros:", error);
      alert(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    carregarBarbeiros();
  }, []);

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function abrirCadastro() {
    setModoEdicao(false);
    setBarbeiroSelecionado(null);
    setFormulario({ ...FORMULARIO_INICIAL });
    setModalAberto(true);
  }

  async function abrirEdicao(barbeiro) {
    try {
      const resposta = await requisicao(
        `/barbeiros/${barbeiro.usuario_id}`
      );

      const usuario = resposta.dados;

      setModoEdicao(true);
      setBarbeiroSelecionado(barbeiro);

      setFormulario({
        nome: usuario.usuario_nome || "",
        email: usuario.usuario_email || "",
        senha: "",
        telefone: usuario.usuario_telefone || "",
        dataNascimento: usuario.usuario_dt_nascimento
          ? String(usuario.usuario_dt_nascimento).substring(0, 10)
          : "",
        especialidade: usuario.barbeiro_especialidade || "",
        foto: usuario.barbeiro_foto || "",
      });

      setModalAberto(true);
    } catch (error) {
      console.error("Erro ao buscar barbeiro:", error);
      alert(error.message);
    }
  }

  function fecharModal() {
    setModalAberto(false);
    setBarbeiroSelecionado(null);
    setFormulario({ ...FORMULARIO_INICIAL });
  }

  async function salvarBarbeiro(event) {
    event.preventDefault();

    if (salvando) return;

    if (
      !formulario.nome.trim() ||
      !formulario.email.trim() ||
      !formulario.telefone.trim() ||
      !formulario.especialidade.trim()
    ) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!modoEdicao && !formulario.senha.trim()) {
      alert("Informe uma senha para o barbeiro.");
      return;
    }

    try {
      setSalvando(true);

      if (!modoEdicao) {
        const dadosUsuario = await requisicao("/usuarios", {
          method: "POST",
          body: JSON.stringify({
            usuario_nome: formulario.nome.trim(),
            usuario_email: formulario.email.trim(),
            usuario_senha: formulario.senha,
            usuario_tipo: 2,
            usuario_telefone: formulario.telefone,
            usuario_dt_nascimento: formulario.dataNascimento || null,
          }),
        });

        const usuarioId = dadosUsuario.dados?.usuario_id;

        if (!usuarioId) {
          throw new Error(
            "A API não retornou o ID do usuário cadastrado."
          );
        }

        await requisicao("/barbeiros", {
          method: "POST",
          body: JSON.stringify({
            usuario_id: usuarioId,
            barbeiro_especialidade: formulario.especialidade.trim(),
            barbeiro_foto: formulario.foto || null,
          }),
        });

        alert("Barbeiro cadastrado com sucesso!");
      } else {
        const id = barbeiroSelecionado.usuario_id;

        const dadosUsuario = {
          usuario_nome: formulario.nome.trim(),
          usuario_email: formulario.email.trim(),
          usuario_telefone: formulario.telefone,
          usuario_dt_nascimento: formulario.dataNascimento || null,
        };

        if (formulario.senha.trim()) {
          dadosUsuario.usuario_senha = formulario.senha;
        }

        await requisicao(`/usuarios/${id}`, {
          method: "PUT",
          body: JSON.stringify(dadosUsuario),
        });

        await requisicao(`/barbeiros/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            barbeiro_especialidade: formulario.especialidade.trim(),
            barbeiro_foto: formulario.foto || null,
          }),
        });

        alert("Barbeiro atualizado com sucesso!");
      }

      fecharModal();
      await carregarBarbeiros();
    } catch (error) {
      console.error("Erro ao salvar barbeiro:", error);
      alert(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluirBarbeiro(barbeiro) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o barbeiro "${barbeiro.usuario_nome}"?`
    );

    if (!confirmar) return;

    try {
      await requisicao(`/barbeiros/${barbeiro.usuario_id}`, {
        method: "DELETE",
      });

      alert("Barbeiro excluído com sucesso!");
      await carregarBarbeiros();
    } catch (error) {
      console.error("Erro ao excluir barbeiro:", error);
      alert(error.message);
    }
  }

  async function alterarStatusBarbeiro(barbeiro) {
    const ativo = Number(barbeiro.usuario_ativo) === 1;
    const acao = ativo ? "ocultar" : "reativar";

    if (
      !window.confirm(
        `Deseja ${ativo ? "inativar" : "reativar"} o barbeiro "${barbeiro.usuario_nome}"?`
      )
    ) {
      return;
    }

    try {
      await requisicao(
        `/usuarios/${barbeiro.usuario_id}/${acao}`,
        { method: "PATCH" }
      );

      alert(
        `Barbeiro ${ativo ? "inativado" : "reativado"} com sucesso!`
      );

      await carregarBarbeiros();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert(error.message);
    }
  }

  const barbeirosFiltrados = barbeiros.filter((barbeiro) => {
    const ativo = Number(barbeiro.usuario_ativo) === 1;

    if (filtroStatus === "ativos" && !ativo) return false;
    if (filtroStatus === "inativos" && ativo) return false;

    const texto = busca.toLowerCase();

    return [
      barbeiro.usuario_nome,
      barbeiro.usuario_email,
      barbeiro.usuario_telefone,
      barbeiro.barbeiro_especialidade,
    ].some((valor) =>
      String(valor || "").toLowerCase().includes(texto)
    );
  });

  const totalAtivos = barbeiros.filter(
    (item) => Number(item.usuario_ativo) === 1
  ).length;

  function voltarDashboard() {
    navigate("/dashboardAdministrador");
  }

  function abrirPerfil() {
    navigate("/perfil");
  }

  return (
    <div className="gerenciamento-barbeiros-page">
      <header className="gerenciamento-header">
        <button
          type="button"
          className="gerenciamento-logo"
          onClick={voltarDashboard}
          title="Voltar ao Dashboard Administrativo"
          aria-label="Voltar ao Dashboard Administrativo"
        >
          <img src={logo} alt="Hope Barbearia" />
        </button>

        <div className="gerenciamento-title">
          <h1>Gerenciamento de Barbeiros</h1>
          <p>Gerencie os profissionais da Hope Barbearia</p>
        </div>

        <button
          type="button"
          className="gerenciamento-user"
          onClick={abrirPerfil}
          title="Abrir minha conta"
        >
          <div className="gerenciamento-avatar">A</div>
          <div>
            <strong>Administrador</strong>
            <span>Minha conta</span>
          </div>
        </button>
      </header>

      <main className="gerenciamento-content">
        <div className="gerenciamento-heading">
          <div>
            <span>ADMINISTRADOR</span>
            <h2>Barbeiros</h2>
            <p>
              Consulte, cadastre e gerencie os barbeiros da barbearia.
            </p>
          </div>

          <button
            type="button"
            className="btn-voltar"
            onClick={voltarDashboard}
          >
            ← Dashboard
          </button>
        </div>

        <section className="barbeiro-stats">
          <div className="barbeiro-stat">
            <div className="stat-icon">✂</div>
            <div>
              <span>Total de barbeiros</span>
              <strong>{barbeiros.length}</strong>
            </div>
          </div>

          <div className="barbeiro-stat">
            <div className="stat-icon">✓</div>
            <div>
              <span>Profissionais ativos</span>
              <strong>{totalAtivos}</strong>
            </div>
          </div>

          <div className="barbeiro-stat">
            <div className="stat-icon">🔎</div>
            <div>
              <span>Resultados encontrados</span>
              <strong>{barbeirosFiltrados.length}</strong>
            </div>
          </div>
        </section>

        <section className="gerenciamento-card">
          <div className="card-top">
            <div>
              <span>EQUIPE</span>
              <h3>Barbeiros cadastrados</h3>
            </div>

            <button
              type="button"
              className="btn-novo-barbeiro"
              onClick={abrirCadastro}
            >
              + Novo barbeiro
            </button>
          </div>

          <div className="barra-filtros">
            <div className="campo-busca">
              <span>🔎</span>
              <input
                type="text"
                placeholder="Buscar por nome, e-mail, telefone ou especialidade..."
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
            </div>

            <div
              className="filtros-status"
              aria-label="Filtrar barbeiros por status"
            >
              {["todos", "ativos", "inativos"].map((filtro) => (
                <button
                  type="button"
                  key={filtro}
                  className={
                    filtroStatus === filtro ? "filtro-ativo" : ""
                  }
                  onClick={() => setFiltroStatus(filtro)}
                >
                  {filtro.charAt(0).toUpperCase() + filtro.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {carregando ? (
            <div className="estado-tabela">
              Carregando barbeiros...
            </div>
          ) : barbeirosFiltrados.length === 0 ? (
            <div className="estado-tabela">
              <div>✂</div>
              <strong>Nenhum barbeiro encontrado</strong>
              <span>
                Cadastre um novo profissional para começar.
              </span>
            </div>
          ) : (
            <div className="tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>BARBEIRO</th>
                    <th>CONTATO</th>
                    <th>ESPECIALIDADE</th>
                    <th>STATUS</th>
                    <th>AÇÕES</th>
                  </tr>
                </thead>

                <tbody>
                  {barbeirosFiltrados.map((barbeiro) => {
                    const ativo =
                      Number(barbeiro.usuario_ativo) === 1;

                    return (
                      <tr key={barbeiro.usuario_id}>
                        <td>
                          <div className="barbeiro-info">
                            <div className="barbeiro-avatar">
                              {barbeiro.usuario_nome
                                ?.charAt(0)
                                .toUpperCase() || "B"}
                            </div>

                            <div>
                              <strong>{barbeiro.usuario_nome}</strong>
                              <span>#{barbeiro.usuario_id}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="contato-info">
                            <span>{barbeiro.usuario_email}</span>
                            <small>
                              {barbeiro.usuario_telefone ||
                                "Telefone não informado"}
                            </small>
                          </div>
                        </td>

                        <td>
                          <span className="especialidade">
                            {barbeiro.barbeiro_especialidade ||
                              "Não informada"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              ativo
                                ? "status ativo"
                                : "status inativo"
                            }
                          >
                            {ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>

                        <td>
                          <div className="acoes">
                            <button
                              type="button"
                              className="acao-editar"
                              onClick={() => abrirEdicao(barbeiro)}
                              title="Editar barbeiro"
                            >
                              ✏
                            </button>

                            <button
                              type="button"
                              className="acao-inativar"
                              onClick={() =>
                                alterarStatusBarbeiro(barbeiro)
                              }
                              title={ativo ? "Inativar barbeiro" : "Reativar barbeiro"}
                            >
                              {ativo ? "🚫" : "↻"}
                            </button>

                            <button
                              type="button"
                              className="acao-excluir"
                              onClick={() => excluirBarbeiro(barbeiro)}
                              title="Excluir barbeiro"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {modalAberto && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) fecharModal();
          }}
        >
          <div className="barbeiro-modal">
            <div className="modal-header">
              <div>
                <span>
                  {modoEdicao ? "EDITAR BARBEIRO" : "NOVO BARBEIRO"}
                </span>
                <h2>
                  {modoEdicao
                    ? "Editar profissional"
                    : "Cadastrar barbeiro"}
                </h2>
              </div>

              <button
                type="button"
                className="modal-fechar"
                onClick={fecharModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={salvarBarbeiro}>
              <div className="modal-grid">
                <div className="campo">
                  <label>Nome *</label>
                  <input
                    type="text"
                    name="nome"
                    value={formulario.nome}
                    onChange={alterarFormulario}
                    placeholder="Nome do barbeiro"
                    required
                  />
                </div>

                <div className="campo">
                  <label>E-mail *</label>
                  <input
                    type="email"
                    name="email"
                    value={formulario.email}
                    onChange={alterarFormulario}
                    placeholder="E-mail"
                    required
                  />
                </div>

                {!modoEdicao && (
                  <div className="campo">
                    <label>Senha *</label>
                    <input
                      type="password"
                      name="senha"
                      value={formulario.senha}
                      onChange={alterarFormulario}
                      placeholder="Senha de acesso"
                      required
                    />
                  </div>
                )}

                <div className="campo">
                  <label>Telefone *</label>
                  <input
                    type="text"
                    name="telefone"
                    value={formulario.telefone}
                    onChange={alterarFormulario}
                    placeholder="11999999999"
                    required
                  />
                </div>

                <div className="campo">
                  <label>Data de nascimento</label>
                  <input
                    type="date"
                    name="dataNascimento"
                    value={formulario.dataNascimento}
                    onChange={alterarFormulario}
                  />
                </div>

                <div className="campo">
                  <label>Especialidade *</label>
                  <input
                    type="text"
                    name="especialidade"
                    value={formulario.especialidade}
                    onChange={alterarFormulario}
                    placeholder="Ex.: Corte, Barba, Degradê"
                    required
                  />
                </div>

                <div className="campo campo-full">
                  <label>Foto</label>
                  <input
                    type="text"
                    name="foto"
                    value={formulario.foto}
                    onChange={alterarFormulario}
                    placeholder="Nome ou caminho da foto"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancelar"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-modal-salvar"
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando..."
                    : modoEdicao
                      ? "Salvar alterações"
                      : "Cadastrar barbeiro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GerenciamentoBarbeiros;
