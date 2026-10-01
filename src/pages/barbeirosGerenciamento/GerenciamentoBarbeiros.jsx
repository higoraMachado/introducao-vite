import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GerenciamentoBarbeiros.css";
import logo from "../../assets/logo-hope.png";

function GerenciamentoBarbeiros() {
  const navigate = useNavigate();

  const [barbeiros, setBarbeiros] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);

  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState(null);

  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    dataNascimento: "",
    especialidade: "",
    foto: "",
  });

  const token = localStorage.getItem("token");

  // =====================================================
  // BUSCAR BARBEIROS
  // =====================================================

  async function carregarBarbeiros() {
    try {
      setCarregando(true);

      const resposta = await fetch(
        "http://localhost:3333/barbeiros",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.message || "Erro ao carregar barbeiros."
        );
      }

      setBarbeiros(dados.dados || []);
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
        "Não foi possível carregar os barbeiros."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarBarbeiros();
  }, []);

  // =====================================================
  // ALTERAR FORMULÁRIO
  // =====================================================

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // =====================================================
  // ABRIR CADASTRO
  // =====================================================

  function abrirCadastro() {
    setModoEdicao(false);

    setBarbeiroSelecionado(null);

    setFormulario({
      nome: "",
      email: "",
      senha: "",
      telefone: "",
      dataNascimento: "",
      especialidade: "",
      foto: "",
    });

    setModalAberto(true);
  }

  // =====================================================
  // ABRIR EDIÇÃO
  // =====================================================

  async function abrirEdicao(barbeiro) {
    try {
      const resposta = await fetch(
        `http://localhost:3333/usuarios/${barbeiro.usuario_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.message ||
          "Erro ao buscar dados do barbeiro."
        );
      }

      const usuario = dados.dados;

      setModoEdicao(true);

      setBarbeiroSelecionado(barbeiro);

      setFormulario({
        nome: usuario.usuario_nome || "",
        email: usuario.usuario_email || "",
        senha: "",
        telefone: usuario.usuario_telefone || "",
        dataNascimento:
          usuario.usuario_dt_nascimento
            ? String(usuario.usuario_dt_nascimento).substring(0, 10)
            : "",
        especialidade:
          barbeiro.barbeiro_especialidade || "",
        foto: barbeiro.barbeiro_foto || "",
      });

      setModalAberto(true);

    } catch (error) {
      console.error(error);

      alert(
        error.message ||
        "Não foi possível carregar os dados."
      );
    }
  }

  // =====================================================
  // FECHAR MODAL
  // =====================================================

  function fecharModal() {
    setModalAberto(false);
    setBarbeiroSelecionado(null);
  }

  // =====================================================
  // SALVAR
  // =====================================================

  async function salvarBarbeiro(event) {
    event.preventDefault();

    if (
      !formulario.nome ||
      !formulario.email ||
      !formulario.telefone ||
      !formulario.especialidade
    ) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {

      // =================================================
      // CADASTRO
      // =================================================

      if (!modoEdicao) {

        if (!formulario.senha) {
          alert("Informe uma senha para o barbeiro.");
          return;
        }

        // Primeiro cria o usuário
        const respostaUsuario = await fetch(
          "http://localhost:3333/usuarios",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              usuario_nome: formulario.nome,
              usuario_email: formulario.email,
              usuario_senha: formulario.senha,
              usuario_tipo: 2,
              usuario_telefone: formulario.telefone,
              usuario_dt_nascimento:
                formulario.dataNascimento || null,
            }),
          }
        );

        const dadosUsuario =
          await respostaUsuario.json();

        if (!respostaUsuario.ok) {
          throw new Error(
            dadosUsuario.message ||
            "Erro ao cadastrar usuário."
          );
        }

        const usuarioId =
          dadosUsuario.dados.usuario_id;

        // Depois cria o barbeiro
        const respostaBarbeiro = await fetch(
          "http://localhost:3333/barbeiros",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              usuario_id: usuarioId,
              barbeiro_especialidade:
                formulario.especialidade,
              barbeiro_foto:
                formulario.foto || null,
            }),
          }
        );

        const dadosBarbeiro =
          await respostaBarbeiro.json();

        if (!respostaBarbeiro.ok) {
          throw new Error(
            dadosBarbeiro.message ||
            "Erro ao cadastrar barbeiro."
          );
        }

        alert("Barbeiro cadastrado com sucesso!");

      }

      // =================================================
      // EDIÇÃO
      // =================================================

      else {

        const id =
          barbeiroSelecionado.usuario_id;

        // Atualiza dados do usuário
        const respostaUsuario = await fetch(
          `http://localhost:3333/usuarios/${id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              usuario_nome: formulario.nome,
              usuario_email: formulario.email,
              usuario_telefone: formulario.telefone,
              usuario_dt_nascimento:
                formulario.dataNascimento || null,
            }),
          }
        );

        const dadosUsuario =
          await respostaUsuario.json();

        if (!respostaUsuario.ok) {
          throw new Error(
            dadosUsuario.message ||
            "Erro ao atualizar usuário."
          );
        }

        // Atualiza dados específicos do barbeiro
        const respostaBarbeiro = await fetch(
          `http://localhost:3333/barbeiros/${id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              barbeiro_especialidade:
                formulario.especialidade,

              barbeiro_foto:
                formulario.foto || null,
            }),
          }
        );

        const dadosBarbeiro =
          await respostaBarbeiro.json();

        if (!respostaBarbeiro.ok) {
          throw new Error(
            dadosBarbeiro.message ||
            "Erro ao atualizar barbeiro."
          );
        }

        alert("Barbeiro atualizado com sucesso!");
      }

      fecharModal();
      carregarBarbeiros();

    } catch (error) {
      console.error(error);

      alert(
        error.message ||
        "Não foi possível salvar o barbeiro."
      );
    }
  }

  // =====================================================
  // EXCLUIR
  // =====================================================

  async function excluirBarbeiro(barbeiro) {

    const confirmar = window.confirm(
      `Deseja realmente excluir o barbeiro "${barbeiro.usuario_nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {

      const resposta = await fetch(
        `http://localhost:3333/barbeiros/${barbeiro.usuario_id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.message ||
          "Não foi possível excluir o barbeiro."
        );
      }

      alert("Barbeiro excluído com sucesso!");

      carregarBarbeiros();

    } catch (error) {
      console.error(error);

      alert(
        error.message ||
        "Erro ao excluir barbeiro."
      );
    }
  }

  // =====================================================
  // INATIVAR
  // =====================================================

  async function inativarBarbeiro(barbeiro) {

    const confirmar = window.confirm(
      `Deseja inativar o barbeiro "${barbeiro.usuario_nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {

      const resposta = await fetch(
        `http://localhost:3333/usuarios/${barbeiro.usuario_id}/ocultar`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.message ||
          "Não foi possível inativar o barbeiro."
        );
      }

      alert("Barbeiro inativado com sucesso!");

      carregarBarbeiros();

    } catch (error) {
      console.error(error);

      alert(
        error.message ||
        "Erro ao inativar barbeiro."
      );
    }
  }

  // =====================================================
  // FILTRO
  // =====================================================

  const barbeirosFiltrados = barbeiros.filter(
    (barbeiro) => {

      const texto =
        busca.toLowerCase();

      return (
        barbeiro.usuario_nome
          ?.toLowerCase()
          .includes(texto) ||

        barbeiro.usuario_email
          ?.toLowerCase()
          .includes(texto) ||

        barbeiro.barbeiro_especialidade
          ?.toLowerCase()
          .includes(texto) ||

        barbeiro.usuario_telefone
          ?.toLowerCase()
          .includes(texto)
      );
    }
  );

  // =====================================================
  // VOLTAR
  // =====================================================

  function voltarDashboard() {
    navigate("/dashboardAdministrador");
  }

  return (
    <div className="gerenciamento-barbeiros-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="gerenciamento-header">

        <div className="gerenciamento-logo">
          <img
            src={logo}
            alt="Hope Barbearia"
          />
        </div>

        <div className="gerenciamento-title">

          <h1>
            Gerenciamento de Barbeiros
          </h1>

          <p>
            Gerencie os profissionais da Hope Barbearia
          </p>

        </div>

        <div className="gerenciamento-user">

          <div className="gerenciamento-avatar">
            A
          </div>

          <div>
            <strong>
              Administrador
            </strong>

            <span>
              Minha conta
            </span>
          </div>

        </div>

      </header>


      {/* =================================================
          CONTEÚDO
      ================================================= */}

      <main className="gerenciamento-content">

        {/* TÍTULO */}

        <div className="gerenciamento-heading">

          <div>

            <span>
              ADMINISTRADOR
            </span>

            <h2>
              Barbeiros
            </h2>

            <p>
              Consulte, cadastre e gerencie os barbeiros
              da barbearia.
            </p>

          </div>

          <button
            className="btn-voltar"
            onClick={voltarDashboard}
          >
            ← Dashboard
          </button>

        </div>


        {/* =================================================
            ESTATÍSTICAS
        ================================================= */}

        <section className="barbeiro-stats">

          <div className="barbeiro-stat">

            <div className="stat-icon">
              ✂
            </div>

            <div>
              <span>
                Total de barbeiros
              </span>

              <strong>
                {barbeiros.length}
              </strong>
            </div>

          </div>


          <div className="barbeiro-stat">

            <div className="stat-icon">
              ✓
            </div>

            <div>
              <span>
                Profissionais ativos
              </span>

              <strong>
                {barbeiros.filter(
                  (item) =>
                    Number(item.usuario_ativo) === 1
                ).length}
              </strong>
            </div>

          </div>


          <div className="barbeiro-stat">

            <div className="stat-icon">
              🔎
            </div>

            <div>
              <span>
                Resultados encontrados
              </span>

              <strong>
                {barbeirosFiltrados.length}
              </strong>
            </div>

          </div>

        </section>


        {/* =================================================
            LISTAGEM
        ================================================= */}

        <section className="gerenciamento-card">

          <div className="card-top">

            <div>

              <span>
                EQUIPE
              </span>

              <h3>
                Barbeiros cadastrados
              </h3>

            </div>

            <button
              className="btn-novo-barbeiro"
              onClick={abrirCadastro}
            >
              + Novo barbeiro
            </button>

          </div>


          {/* BUSCA */}

          <div className="barra-filtros">

            <div className="campo-busca">

              <span>
                🔎
              </span>

              <input
                type="text"
                placeholder="Buscar por nome, e-mail, telefone ou especialidade..."
                value={busca}
                onChange={(event) =>
                  setBusca(event.target.value)
                }
              />

            </div>

          </div>


          {/* TABELA */}

          {carregando ? (

            <div className="estado-tabela">
              Carregando barbeiros...
            </div>

          ) : barbeirosFiltrados.length === 0 ? (

            <div className="estado-tabela">

              <div>
                ✂
              </div>

              <strong>
                Nenhum barbeiro encontrado
              </strong>

              <span>
                Cadastre um novo profissional
                para começar.
              </span>

            </div>

          ) : (

            <div className="tabela-container">

              <table>

                <thead>

                  <tr>

                    <th>
                      BARBEIRO
                    </th>

                    <th>
                      CONTATO
                    </th>

                    <th>
                      ESPECIALIDADE
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      AÇÕES
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {barbeirosFiltrados.map(
                    (barbeiro) => (

                      <tr
                        key={barbeiro.usuario_id}
                      >

                        {/* BARBEIRO */}

                        <td>

                          <div className="barbeiro-info">

                            <div className="barbeiro-avatar">

                              {barbeiro.usuario_nome
                                ?.charAt(0)
                                .toUpperCase() || "B"}

                            </div>

                            <div>

                              <strong>
                                {barbeiro.usuario_nome}
                              </strong>

                              <span>
                                #{barbeiro.usuario_id}
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* CONTATO */}

                        <td>

                          <div className="contato-info">

                            <span>
                              {barbeiro.usuario_email}
                            </span>

                            <small>
                              {barbeiro.usuario_telefone ||
                                "Telefone não informado"}
                            </small>

                          </div>

                        </td>


                        {/* ESPECIALIDADE */}

                        <td>

                          <span className="especialidade">

                            {barbeiro.barbeiro_especialidade ||
                              "Não informada"}

                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              Number(
                                barbeiro.usuario_ativo
                              ) === 1
                                ? "status ativo"
                                : "status inativo"
                            }
                          >

                            {Number(
                              barbeiro.usuario_ativo
                            ) === 1
                              ? "Ativo"
                              : "Inativo"}

                          </span>

                        </td>


                        {/* AÇÕES */}

                        <td>

                          <div className="acoes">

                            <button
                              className="acao-editar"
                              onClick={() =>
                                abrirEdicao(barbeiro)
                              }
                              title="Editar barbeiro"
                            >
                              ✏
                            </button>

                            <button
                              className="acao-inativar"
                              onClick={() =>
                                inativarBarbeiro(barbeiro)
                              }
                              title="Inativar barbeiro"
                            >
                              🚫
                            </button>

                            <button
                              className="acao-excluir"
                              onClick={() =>
                                excluirBarbeiro(barbeiro)
                              }
                              title="Excluir barbeiro"
                            >
                              🗑
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>


      {/* =================================================
          MODAL
      ================================================= */}

      {modalAberto && (

        <div className="modal-overlay">

          <div className="barbeiro-modal">

            <div className="modal-header">

              <div>

                <span>
                  {modoEdicao
                    ? "EDITAR BARBEIRO"
                    : "NOVO BARBEIRO"}
                </span>

                <h2>
                  {modoEdicao
                    ? "Editar profissional"
                    : "Cadastrar barbeiro"}
                </h2>

              </div>

              <button
                className="modal-fechar"
                onClick={fecharModal}
              >
                ×
              </button>

            </div>


            <form
              onSubmit={salvarBarbeiro}
            >

              <div className="modal-grid">

                {/* NOME */}

                <div className="campo">

                  <label>
                    Nome *
                  </label>

                  <input
                    type="text"
                    name="nome"
                    value={formulario.nome}
                    onChange={alterarFormulario}
                    placeholder="Nome do barbeiro"
                  />

                </div>


                {/* EMAIL */}

                <div className="campo">

                  <label>
                    E-mail *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formulario.email}
                    onChange={alterarFormulario}
                    placeholder="E-mail"
                  />

                </div>


                {/* SENHA */}

                {!modoEdicao && (

                  <div className="campo">

                    <label>
                      Senha *
                    </label>

                    <input
                      type="password"
                      name="senha"
                      value={formulario.senha}
                      onChange={alterarFormulario}
                      placeholder="Senha de acesso"
                    />

                  </div>

                )}


                {/* TELEFONE */}

                <div className="campo">

                  <label>
                    Telefone *
                  </label>

                  <input
                    type="text"
                    name="telefone"
                    value={formulario.telefone}
                    onChange={alterarFormulario}
                    placeholder="11999999999"
                  />

                </div>


                {/* NASCIMENTO */}

                <div className="campo">

                  <label>
                    Data de nascimento
                  </label>

                  <input
                    type="date"
                    name="dataNascimento"
                    value={
                      formulario.dataNascimento
                    }
                    onChange={alterarFormulario}
                  />

                </div>


                {/* ESPECIALIDADE */}

                <div className="campo">

                  <label>
                    Especialidade *
                  </label>

                  <input
                    type="text"
                    name="especialidade"
                    value={
                      formulario.especialidade
                    }
                    onChange={alterarFormulario}
                    placeholder="Ex.: Corte, Barba, Degradê"
                  />

                </div>


                {/* FOTO */}

                <div className="campo campo-full">

                  <label>
                    Foto
                  </label>

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
                >
                  {modoEdicao
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

