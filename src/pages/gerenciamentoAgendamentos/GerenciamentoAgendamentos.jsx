
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GerenciamentoAgendamentos.css";
import logoHope from "../../assets/logo-hope.png";

const API_URL = "http://localhost:3333";

const formularioInicial = {
  usuario_id: "",
  barbeiro_servico_id: "",
  agendamento_dt_hr_inicio: "",
  agendamento_status: "agendado",
  agendamento_observacoes: "",
  agendamento_forma_pagamento: "",
};

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function extrairLista(resposta) {
  if (Array.isArray(resposta)) return resposta;
  if (Array.isArray(resposta?.dados)) return resposta.dados;
  if (Array.isArray(resposta?.dados?.dados)) {
    return resposta.dados.dados;
  }
  return [];
}

function normalizarStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function nomeStatus(status) {
  const nomes = {
    agendado: "Agendado",
    confirmado: "Confirmado",
    concluido: "Concluído",
    "concluído": "Concluído",
    cancelado: "Cancelado",
    cancelada: "Cancelado",
  };

  return nomes[normalizarStatus(status)] || status || "-";
}

function statusBloqueado(status) {
  return [
    "cancelado",
    "cancelada",
    "concluido",
    "concluído",
  ].includes(normalizarStatus(status));
}

function dataParaInput(valor) {
  if (!valor) return "";

  if (
    typeof valor === "string" &&
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(valor)
  ) {
    return valor.slice(0, 16).replace(" ", "T");
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");

  return (
    `${data.getFullYear()}-` +
    `${pad(data.getMonth() + 1)}-` +
    `${pad(data.getDate())}T` +
    `${pad(data.getHours())}:` +
    `${pad(data.getMinutes())}`
  );
}

function dataParaAPI(valor) {
  if (!valor) return null;
  return `${valor.replace("T", " ")}:00`;
}

function formatarData(valor) {
  if (!valor) return "-";

  const data = new Date(dataParaInput(valor));

  if (Number.isNaN(data.getTime())) {
    return String(valor);
  }

  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// Aceita duração em minutos (40, "40")
// ou em formato de horário ("00:40:00").
function duracaoEmMinutos(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  if (typeof valor === "number") {
    return Number.isFinite(valor) && valor > 0
      ? valor
      : null;
  }

  const texto = String(valor).trim();

  if (/^\d+(?:[.,]\d+)?$/.test(texto)) {
    const minutos = Number(texto.replace(",", "."));
    return minutos > 0 ? minutos : null;
  }

  const partes = texto.split(":");

  if (
    (partes.length === 2 || partes.length === 3) &&
    partes.every((parte) => /^\d+$/.test(parte))
  ) {
    const horas = Number(partes[0]);
    const minutos = Number(partes[1]);
    const segundos = Number(partes[2] || 0);

    if (minutos >= 60 || segundos >= 60) return null;

    const total = horas * 60 + minutos + segundos / 60;
    return total > 0 ? total : null;
  }

  return null;
}

function calcularTermino(inicioTexto, duracao) {
  if (!inicioTexto || !duracao || duracao <= 0) {
    return "";
  }

  const inicio = new Date(inicioTexto);

  if (Number.isNaN(inicio.getTime())) return "";

  const fim = new Date(
    inicio.getTime() + Math.round(duracao * 60000)
  );

  return dataParaInput(fim);
}

function obterIdCliente(cliente) {
  return cliente.usuario_id ?? cliente.cliente_id;
}

function obterNomeCliente(cliente) {
  return (
    cliente.usuario_nome ||
    cliente.cliente_nome ||
    cliente.nome ||
    `Cliente #${obterIdCliente(cliente)}`
  );
}

function obterNomeBarbeiroServico(item) {
  const barbeiro =
    item.barbeiro_nome ||
    item.usuario_nome ||
    `Barbeiro #${item.usuario_id ?? item.barbeiro_id}`;

  const servico =
    item.servico_nome ||
    `Serviço #${item.servico_id}`;

  return `${barbeiro} — ${servico}`;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function GerenciamentoAgendamentos() {
  const navigate = useNavigate();

  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vinculos, setVinculos] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [pesquisa, setPesquisa] = useState("");
  const [filtroBarbeiro, setFiltroBarbeiro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroData, setFiltroData] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] =
    useState(null);

  const [formulario, setFormulario] = useState({
    ...formularioInicial,
  });

  // ===================================================
  // LOGO: VOLTAR À PÁGINA ANTERIOR
  // ===================================================

  function voltar() {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/dashboardAdministrador", {
        replace: true,
      });
    }
  }

  // ===================================================
  // REQUISIÇÕES
  // ===================================================

  const requisicao = useCallback(async (rota, opcoes = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "Sessão expirada. Faça login novamente."
      );
    }

    const resposta = await fetch(`${API_URL}${rota}`, {
      ...opcoes,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...opcoes.headers,
      },
    });

    const texto = await resposta.text();

    let resultado = {};

    try {
      resultado = texto ? JSON.parse(texto) : {};
    } catch {
      throw new Error(
        "A API retornou uma resposta inválida."
      );
    }

    if (!resposta.ok) {
      throw new Error(
        resultado.mensagem ||
        resultado.message ||
        `Erro HTTP ${resposta.status}`
      );
    }

    return resultado;
  }, []);

  // ===================================================
  // CARREGAR DADOS
  // ===================================================

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const [
        respostaAgendamentos,
        respostaClientes,
        respostaVinculos,
      ] = await Promise.all([
        requisicao("/agendamentos"),
        requisicao("/clientes"),
        requisicao("/barbeiros_servicos"),
      ]);

      setAgendamentos(
        extrairLista(respostaAgendamentos)
      );

      setClientes(
        extrairLista(respostaClientes)
      );

      setVinculos(
        extrairLista(respostaVinculos)
      );
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, [requisicao]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // ===================================================
  // BARBEIROS
  // ===================================================

  const nomesBarbeiros = useMemo(() => {
    const mapa = new Map();

    vinculos.forEach((item) => {
      const id = item.usuario_id ?? item.barbeiro_id;

      if (!id) return;

      mapa.set(
        String(id),
        item.barbeiro_nome ||
          item.usuario_nome ||
          `Barbeiro #${id}`
      );
    });

    agendamentos.forEach((item) => {
      if (!item.barbeiro_id) return;

      const id = String(item.barbeiro_id);

      if (!mapa.has(id)) {
        mapa.set(
          id,
          item.barbeiro_nome || `Barbeiro #${id}`
        );
      }
    });

    return mapa;
  }, [vinculos, agendamentos]);

  // ===================================================
  // SERVIÇO SELECIONADO E DURAÇÃO
  // ===================================================

  const servicoSelecionado = useMemo(() => {
    return vinculos.find(
      (item) =>
        String(item.barbeiro_servico_id) ===
        String(formulario.barbeiro_servico_id)
    );
  }, [vinculos, formulario.barbeiro_servico_id]);

  const duracaoSelecionada = useMemo(() => {
    return duracaoEmMinutos(
      servicoSelecionado?.servico_duracao
    );
  }, [servicoSelecionado]);

  // Calculado automaticamente ao trocar o serviço
  // ou a data e hora de início.
  const terminoCalculado = useMemo(() => {
    return calcularTermino(
      formulario.agendamento_dt_hr_inicio,
      duracaoSelecionada
    );
  }, [
    formulario.agendamento_dt_hr_inicio,
    duracaoSelecionada,
  ]);

  // ===================================================
  // FILTROS
  // ===================================================

  const agendamentosFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();

    return agendamentos.filter((item) => {
      const texto = [
        item.agendamento_id,
        item.usuario_nome,
        item.servico_nome,
        nomesBarbeiros.get(String(item.barbeiro_id)),
      ]
        .join(" ")
        .toLowerCase();

      const correspondePesquisa =
        !termo || texto.includes(termo);

      const correspondeBarbeiro =
        !filtroBarbeiro ||
        String(item.barbeiro_id) === filtroBarbeiro;

      const correspondeStatus =
        !filtroStatus ||
        normalizarStatus(item.agendamento_status) ===
          filtroStatus;

      const correspondeData =
        !filtroData ||
        dataParaInput(
          item.agendamento_dt_hr_inicio
        ).startsWith(filtroData);

      return (
        correspondePesquisa &&
        correspondeBarbeiro &&
        correspondeStatus &&
        correspondeData
      );
    });
  }, [
    agendamentos,
    pesquisa,
    filtroBarbeiro,
    filtroStatus,
    filtroData,
    nomesBarbeiros,
  ]);

  // ===================================================
  // ESTATÍSTICAS
  // ===================================================

  const estatisticas = useMemo(() => {
    const contar = (status) =>
      agendamentos.filter(
        (item) =>
          normalizarStatus(item.agendamento_status) ===
          status
      ).length;

    return {
      total: agendamentos.length,
      agendados: contar("agendado"),
      confirmados: contar("confirmado"),
      concluidos:
        contar("concluido") + contar("concluído"),
      cancelados:
        contar("cancelado") + contar("cancelada"),
    };
  }, [agendamentos]);

  // ===================================================
  // CADASTRO
  // ===================================================

  function abrirCadastro() {
    setAgendamentoEditando(null);
    setFormulario({ ...formularioInicial });
    setErro("");
    setMensagem("");
    setModalAberto(true);
  }

  // ===================================================
  // EDIÇÃO
  // ===================================================

  function abrirEdicao(item) {
    setAgendamentoEditando(item);

    setFormulario({
      usuario_id: String(item.usuario_id ?? ""),
      barbeiro_servico_id: String(
        item.barbeiro_servico_id ?? ""
      ),
      agendamento_dt_hr_inicio: dataParaInput(
        item.agendamento_dt_hr_inicio
      ),
      agendamento_status:
        item.agendamento_status || "agendado",
      agendamento_observacoes:
        item.agendamento_observacoes || "",
      agendamento_forma_pagamento:
        item.agendamento_forma_pagamento || "",
    });

    setErro("");
    setMensagem("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setAgendamentoEditando(null);
    setFormulario({ ...formularioInicial });
    setErro("");
  }

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // ===================================================
  // SALVAR COM TÉRMINO AUTOMÁTICO
  // ===================================================

  async function salvarAgendamento(evento) {
    evento.preventDefault();

    setErro("");
    setMensagem("");

    if (
      !formulario.usuario_id ||
      !formulario.barbeiro_servico_id ||
      !formulario.agendamento_dt_hr_inicio
    ) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!duracaoSelecionada) {
      setErro(
        "O serviço selecionado não possui uma duração válida cadastrada. Verifique o cadastro do serviço."
      );
      return;
    }

    if (!terminoCalculado) {
      setErro(
        "Não foi possível calcular o horário de término."
      );
      return;
    }

    const inicio = new Date(
      formulario.agendamento_dt_hr_inicio
    );

    const fim = new Date(terminoCalculado);

    if (
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(fim.getTime()) ||
      fim <= inicio
    ) {
      setErro("Informe uma data e hora de início válidas.");
      return;
    }

    const dados = {
      usuario_id: Number(formulario.usuario_id),

      barbeiro_servico_id: Number(
        formulario.barbeiro_servico_id
      ),

      agendamento_dt_hr_inicio: dataParaAPI(
        formulario.agendamento_dt_hr_inicio
      ),

      agendamento_dt_hr_fim: dataParaAPI(
        terminoCalculado
      ),

      agendamento_observacoes:
        formulario.agendamento_observacoes.trim(),

      agendamento_forma_pagamento:
        formulario.agendamento_forma_pagamento.trim() ||
        null,
    };

    if (agendamentoEditando) {
      dados.agendamento_status =
        formulario.agendamento_status;
    }

    setSalvando(true);

    try {
      const editando = Boolean(agendamentoEditando);

      const rota = editando
        ? `/agendamentos/${agendamentoEditando.agendamento_id}`
        : "/agendamentos";

      await requisicao(rota, {
        method: editando ? "PUT" : "POST",
        body: JSON.stringify(dados),
      });

      setModalAberto(false);
      setAgendamentoEditando(null);
      setFormulario({ ...formularioInicial });

      await carregarDados();

      setMensagem(
        editando
          ? "Agendamento atualizado com sucesso!"
          : "Agendamento cadastrado com sucesso!"
      );
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  // ===================================================
  // CANCELAMENTO
  // ===================================================

  async function cancelarAgendamento(item) {
    const confirmado = window.confirm(
      `Deseja realmente cancelar o agendamento #${item.agendamento_id} de ${item.usuario_nome || "este cliente"}?`
    );

    if (!confirmado) return;

    setErro("");
    setMensagem("");

    try {
      await requisicao(
        `/agendamentos/${item.agendamento_id}`,
        { method: "DELETE" }
      );

      await carregarDados();

      setMensagem(
        "Agendamento cancelado com sucesso!"
      );
    } catch (error) {
      setErro(error.message);
    }
  }

  // ===================================================
  // INTERFACE
  // ===================================================

  return (
    <div className="ga-pagina">
      <header className="ga-cabecalho">
        <button
          type="button"
          className="ga-botao-logo"
          onClick={voltar}
          title="Voltar à página anterior"
          aria-label="Voltar à página anterior"
        >
          <img
            src={logoHope}
            alt="Hope Barbearia"
            className="ga-logo"
          />
        </button>

        <div className="ga-titulo-cabecalho">
          <h1>Gerenciamento de Agendamentos</h1>
          <p>Hope Barbearia — Administração</p>
        </div>
      </header>

      <main className="ga-conteudo">
        <div className="ga-topo-conteudo">
          <div>
            <h2>Agenda da Barbearia</h2>
            <p>
              Gerencie os atendimentos de todos os
              profissionais.
            </p>
          </div>

          <button
            type="button"
            className="ga-btn ga-btn-dourado"
            onClick={abrirCadastro}
          >
            + Novo Agendamento
          </button>
        </div>

        {mensagem && (
          <div className="ga-alerta ga-alerta-sucesso">
            {mensagem}
          </div>
        )}

        {erro && !modalAberto && (
          <div className="ga-alerta ga-alerta-erro">
            {erro}
          </div>
        )}

        {/* ESTATÍSTICAS */}

        <section className="ga-estatisticas">
          <div className="ga-card">
            <span>Total</span>
            <strong>{estatisticas.total}</strong>
          </div>

          <div className="ga-card">
            <span>Agendados</span>
            <strong>{estatisticas.agendados}</strong>
          </div>

          <div className="ga-card">
            <span>Confirmados</span>
            <strong>{estatisticas.confirmados}</strong>
          </div>

          <div className="ga-card">
            <span>Concluídos</span>
            <strong>{estatisticas.concluidos}</strong>
          </div>

          <div className="ga-card">
            <span>Cancelados</span>
            <strong>{estatisticas.cancelados}</strong>
          </div>
        </section>

        {/* FILTROS */}

        <section className="ga-painel">
          <div className="ga-painel-titulo">
            <h3>Filtrar Agendamentos</h3>
          </div>

          <div className="ga-filtros">
            <div className="ga-grupo-campo">
              <label htmlFor="ga-pesquisa">
                Pesquisar
              </label>

              <input
                id="ga-pesquisa"
                type="text"
                placeholder="Cliente, serviço ou ID"
                value={pesquisa}
                onChange={(e) =>
                  setPesquisa(e.target.value)
                }
              />
            </div>

            <div className="ga-grupo-campo">
              <label htmlFor="ga-barbeiro">
                Barbeiro
              </label>

              <select
                id="ga-barbeiro"
                value={filtroBarbeiro}
                onChange={(e) =>
                  setFiltroBarbeiro(e.target.value)
                }
              >
                <option value="">
                  Todos os barbeiros
                </option>

                {[...nomesBarbeiros.entries()].map(
                  ([id, nome]) => (
                    <option key={id} value={id}>
                      {nome}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="ga-grupo-campo">
              <label htmlFor="ga-data">
                Data
              </label>

              <input
                id="ga-data"
                type="date"
                value={filtroData}
                onChange={(e) =>
                  setFiltroData(e.target.value)
                }
              />
            </div>

            <div className="ga-grupo-campo">
              <label htmlFor="ga-status">
                Status
              </label>

              <select
                id="ga-status"
                value={filtroStatus}
                onChange={(e) =>
                  setFiltroStatus(e.target.value)
                }
              >
                <option value="">
                  Todos os status
                </option>
                <option value="agendado">
                  Agendado
                </option>
                <option value="confirmado">
                  Confirmado
                </option>
                <option value="concluido">
                  Concluído
                </option>
                <option value="cancelado">
                  Cancelado
                </option>
              </select>
            </div>

            <button
              type="button"
              className="ga-btn ga-btn-atualizar"
              onClick={carregarDados}
            >
              Atualizar
            </button>
          </div>
        </section>

        {/* TABELA DE AGENDAMENTOS */}

        <section className="ga-painel">
          <div className="ga-painel-titulo">
            <h3>Todos os Agendamentos</h3>
            <span>
              {agendamentosFiltrados.length} resultado(s)
            </span>
          </div>

          {carregando ? (
            <p className="ga-estado">
              Carregando agendamentos...
            </p>
          ) : (
            <div className="ga-tabela-container">
              <table className="ga-tabela">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Barbeiro</th>
                    <th>Serviço</th>
                    <th>Início</th>
                    <th>Término</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {agendamentosFiltrados.map((item) => {
                    const status = normalizarStatus(
                      item.agendamento_status
                    );

                    const bloqueado = statusBloqueado(
                      item.agendamento_status
                    );

                    return (
                      <tr key={item.agendamento_id}>
                        <td>#{item.agendamento_id}</td>

                        <td>
                          {item.usuario_nome || "-"}
                        </td>

                        <td>
                          {nomesBarbeiros.get(
                            String(item.barbeiro_id)
                          ) || "-"}
                        </td>

                        <td>
                          {item.servico_nome || "-"}
                        </td>

                        <td>
                          {formatarData(
                            item.agendamento_dt_hr_inicio
                          )}
                        </td>

                        <td>
                          {formatarData(
                            item.agendamento_dt_hr_fim
                          )}
                        </td>

                        <td>
                          <span
                            className={`ga-status ga-status-${status}`}
                          >
                            {nomeStatus(
                              item.agendamento_status
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="ga-acoes">
                            <button
                              type="button"
                              className="ga-btn ga-btn-editar"
                              onClick={() =>
                                abrirEdicao(item)
                              }
                              disabled={bloqueado}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className="ga-btn ga-btn-cancelar"
                              onClick={() =>
                                cancelarAgendamento(item)
                              }
                              disabled={bloqueado}
                            >
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!agendamentosFiltrados.length && (
                    <tr>
                      <td
                        colSpan={8}
                        className="ga-sem-registros"
                      >
                        Nenhum agendamento encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* MODAL */}

      {modalAberto && (
        <div className="ga-modal-fundo">
          <div
            className="ga-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ga-modal-titulo"
          >
            <div className="ga-modal-cabecalho">
              <h2 id="ga-modal-titulo">
                {agendamentoEditando
                  ? "Editar / Reagendar"
                  : "Novo Agendamento"}
              </h2>

              <button
                type="button"
                className="ga-fechar"
                onClick={fecharModal}
                disabled={salvando}
                aria-label="Fechar formulário"
              >
                ×
              </button>
            </div>

            <form
              className="ga-formulario"
              onSubmit={salvarAgendamento}
            >
              {/* CLIENTE */}

              <div className="ga-grupo-campo">
                <label htmlFor="ga-cliente-form">
                  Cliente *
                </label>

                <select
                  id="ga-cliente-form"
                  name="usuario_id"
                  value={formulario.usuario_id}
                  onChange={alterarCampo}
                  required
                >
                  <option value="">
                    Selecione o cliente
                  </option>

                  {clientes.map((cliente) => (
                    <option
                      key={obterIdCliente(cliente)}
                      value={obterIdCliente(cliente)}
                    >
                      {obterNomeCliente(cliente)}
                    </option>
                  ))}
                </select>
              </div>

              {/* BARBEIRO E SERVIÇO */}

              <div className="ga-grupo-campo">
                <label htmlFor="ga-servico-form">
                  Barbeiro e Serviço *
                </label>

                <select
                  id="ga-servico-form"
                  name="barbeiro_servico_id"
                  value={
                    formulario.barbeiro_servico_id
                  }
                  onChange={alterarCampo}
                  required
                >
                  <option value="">
                    Selecione o barbeiro e serviço
                  </option>

                  {vinculos.map((item) => {
                    const duracao = duracaoEmMinutos(
                      item.servico_duracao
                    );

                    return (
                      <option
                        key={item.barbeiro_servico_id}
                        value={item.barbeiro_servico_id}
                      >
                        {obterNomeBarbeiroServico(item)}
                        {duracao
                          ? ` — ${duracao} min`
                          : " — duração não cadastrada"}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* INÍCIO */}

              <div className="ga-grupo-campo">
                <label htmlFor="ga-inicio-form">
                  Data e hora de início *
                </label>

                <input
                  id="ga-inicio-form"
                  type="datetime-local"
                  name="agendamento_dt_hr_inicio"
                  value={
                    formulario.agendamento_dt_hr_inicio
                  }
                  onChange={alterarCampo}
                  required
                />
              </div>

              {/* TÉRMINO AUTOMÁTICO */}

              <div
                className="ga-grupo-campo"
                aria-live="polite"
              >
                <label>
                  Término calculado automaticamente
                </label>

                <div
                  style={{
                    padding: "15px",
                    border: "1px solid #e5d4ad",
                    borderRadius: "8px",
                    background: "#faf7ef",
                  }}
                >
                  {servicoSelecionado && (
                    <p
                      style={{
                        margin: "0 0 8px",
                        fontSize: "13px",
                        color: "#555",
                      }}
                    >
                      <strong>Duração do serviço:</strong>{" "}
                      {duracaoSelecionada
                        ? `${duracaoSelecionada} minutos`
                        : "Duração não cadastrada"}
                    </p>
                  )}

                  <strong
                    style={{
                      color: "#222",
                      fontSize: "17px",
                    }}
                  >
                    {terminoCalculado
                      ? formatarData(terminoCalculado)
                      : "Selecione o serviço e o início"}
                  </strong>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#777",
                      fontSize: "12px",
                    }}
                  >
                    O horário de término será calculado
                    com base na duração cadastrada.
                  </p>
                </div>
              </div>

              {/* STATUS: SOMENTE EDIÇÃO */}

              {agendamentoEditando && (
                <div className="ga-grupo-campo">
                  <label htmlFor="ga-status-form">
                    Status
                  </label>

                  <select
                    id="ga-status-form"
                    name="agendamento_status"
                    value={
                      formulario.agendamento_status
                    }
                    onChange={alterarCampo}
                  >
                    <option value="agendado">
                      Agendado
                    </option>
                    <option value="confirmado">
                      Confirmado
                    </option>
                    <option value="concluido">
                      Concluído
                    </option>
                  </select>
                </div>
              )}

              {/* FORMA DE PAGAMENTO */}

              <div className="ga-grupo-campo">
                <label htmlFor="ga-pagamento-form">
                  Forma de pagamento
                </label>

                <input
                  id="ga-pagamento-form"
                  type="text"
                  name="agendamento_forma_pagamento"
                  placeholder="Ex.: Pix, dinheiro ou cartão"
                  value={
                    formulario.agendamento_forma_pagamento
                  }
                  onChange={alterarCampo}
                />
              </div>

              {/* OBSERVAÇÕES */}

              <div className="ga-grupo-campo">
                <label htmlFor="ga-observacoes-form">
                  Observações
                </label>

                <textarea
                  id="ga-observacoes-form"
                  name="agendamento_observacoes"
                  rows={3}
                  placeholder="Informações adicionais"
                  value={
                    formulario.agendamento_observacoes
                  }
                  onChange={alterarCampo}
                />
              </div>

              {erro && (
                <div className="ga-alerta ga-alerta-erro">
                  {erro}
                </div>
              )}

              <div className="ga-modal-acoes">
                <button
                  type="button"
                  className="ga-btn ga-btn-secundario"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  className="ga-btn ga-btn-dourado"
                  disabled={
                    salvando ||
                    !duracaoSelecionada ||
                    !terminoCalculado
                  }
                >
                  {salvando
                    ? "Salvando..."
                    : agendamentoEditando
                      ? "Salvar Alterações"
                      : "Cadastrar Agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
