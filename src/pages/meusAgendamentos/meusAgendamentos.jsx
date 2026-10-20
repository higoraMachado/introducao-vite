
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoHope from "../../assets/logo-hope.png";
import "./MeusAgendamentos.css";

const API = "http://localhost:3333";

const FORM_INICIAL = {
  usuario_id: "",
  barbeiro_servico_id: "",
  data: "",
  horario: "",
  agendamento_status: "agendado",
  agendamento_forma_pagamento: "",
  agendamento_observacoes: "",
};

function lista(resposta) {
  if (Array.isArray(resposta)) return resposta;
  if (Array.isArray(resposta?.dados)) return resposta.dados;
  return [];
}

function dataLocal(valor) {
  if (!valor) return "";

  if (
    typeof valor === "string" &&
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(valor)
  ) {
    return valor.slice(0, 16).replace(" ", "T");
  }

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "";

  const dois = (n) => String(n).padStart(2, "0");

  return (
    `${data.getFullYear()}-` +
    `${dois(data.getMonth() + 1)}-` +
    `${dois(data.getDate())}T` +
    `${dois(data.getHours())}:` +
    `${dois(data.getMinutes())}`
  );
}

function formatarData(valor) {
  const texto = dataLocal(valor);
  if (!texto) return "-";

  const [data, hora] = texto.split("T");
  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano} ${hora}`;
}

function duracaoMinutos(valor) {
  if (valor == null || valor === "") return 0;

  if (typeof valor === "number") {
    return valor > 0 ? valor : 0;
  }

  const texto = String(valor).trim();

  if (/^\d+$/.test(texto)) {
    return Number(texto);
  }

  const partes = texto.split(":").map(Number);

  if (
    partes.length < 2 ||
    partes.length > 3 ||
    partes.some((n) => !Number.isFinite(n))
  ) {
    return 0;
  }

  const [horas, minutos, segundos = 0] = partes;

  if (minutos >= 60 || segundos >= 60) return 0;

  return horas * 60 + minutos + segundos / 60;
}

function calcularFim(inicio, minutos) {
  if (!inicio || !minutos) return "";

  const data = new Date(inicio);
  if (Number.isNaN(data.getTime())) return "";

  data.setTime(data.getTime() + minutos * 60000);
  return dataLocal(data);
}

function statusNormalizado(valor) {
  return String(valor || "").toLowerCase().trim();
}

function statusFinalizado(valor) {
  return [
    "cancelado",
    "cancelada",
    "concluido",
    "concluído",
  ].includes(statusNormalizado(valor));
}

function tituloStatus(valor) {
  const nomes = {
    agendado: "Agendado",
    confirmado: "Confirmado",
    concluido: "Concluído",
    "concluído": "Concluído",
    cancelado: "Cancelado",
    cancelada: "Cancelado",
  };

  return nomes[statusNormalizado(valor)] || valor || "-";
}

function nomeCliente(cliente) {
  return (
    cliente.usuario_nome ||
    cliente.cliente_nome ||
    cliente.nome ||
    `Cliente #${cliente.usuario_id || cliente.cliente_id}`
  );
}

function idCliente(cliente) {
  return cliente.usuario_id ?? cliente.cliente_id;
}

function hojeISO() {
  const hoje = new Date();

  return (
    `${hoje.getFullYear()}-` +
    `${String(hoje.getMonth() + 1).padStart(2, "0")}-` +
    `${String(hoje.getDate()).padStart(2, "0")}`
  );
}

export default function MeusAgendamentos() {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [pesquisa, setPesquisa] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);

  const [horarios, setHorarios] = useState([]);
  const [buscandoHorarios, setBuscandoHorarios] =
    useState(false);
  const [erroHorarios, setErroHorarios] = useState("");

  const requisicao = useCallback(async (rota, opcoes = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const resposta = await fetch(`${API}${rota}`, {
      ...opcoes,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...opcoes.headers,
      },
    });

    let dados = {};

    try {
      dados = await resposta.json();
    } catch {
      throw new Error("A API retornou uma resposta inválida.");
    }

    if (!resposta.ok) {
      throw new Error(
        dados.message ||
          dados.mensagem ||
          `Erro HTTP ${resposta.status}`
      );
    }

    return dados;
  }, []);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const [rPerfil, rAgenda, rClientes, rServicos] =
        await Promise.all([
          requisicao("/usuarios/perfil"),
          requisicao("/agendamentos"),
          requisicao("/clientes"),
          requisicao("/barbeiros_servicos"),
        ]);

      const usuario = rPerfil.dados;

      if (!usuario?.usuario_id) {
        throw new Error("Não foi possível identificar o barbeiro.");
      }

      if (Number(usuario.usuario_tipo) !== 2) {
        throw new Error(
          "Esta página é exclusiva para barbeiros."
        );
      }

      const barbeiroId = Number(usuario.usuario_id);

      setPerfil(usuario);

      // A API já restringe a agenda pelo usuário
      // autenticado. O filtro adicional protege a tela.
      setAgendamentos(
        lista(rAgenda).filter(
          (item) => Number(item.barbeiro_id) === barbeiroId
        )
      );

      setClientes(
        lista(rClientes).filter(
          (item) =>
            item.usuario_ativo === undefined ||
            Number(item.usuario_ativo) === 1
        )
      );

      setServicos(
        lista(rServicos).filter(
          (item) => Number(item.usuario_id) === barbeiroId
        )
      );
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [requisicao]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const servicoSelecionado = useMemo(
    () =>
      servicos.find(
        (item) =>
          String(item.barbeiro_servico_id) ===
          String(form.barbeiro_servico_id)
      ),
    [servicos, form.barbeiro_servico_id]
  );

  const duracao = duracaoMinutos(
    servicoSelecionado?.servico_duracao
  );

  const inicio =
    form.data && form.horario
      ? `${form.data}T${form.horario}`
      : "";

  const fim = calcularFim(inicio, duracao);

  // Consulta de disponibilidade da própria API.
  useEffect(() => {
    let ativo = true;

    async function consultar() {
      setHorarios([]);
      setErroHorarios("");

      if (
        !modalAberto ||
        !perfil?.usuario_id ||
        !form.data ||
        !servicoSelecionado?.servico_id
      ) {
        setBuscandoHorarios(false);
        return;
      }

      setBuscandoHorarios(true);

      try {
        const parametros = new URLSearchParams({
          data: form.data,
          barbeiro_id: String(perfil.usuario_id),
          servico_id: String(servicoSelecionado.servico_id),
        });

        const resposta = await requisicao(
          `/agendamentos/disponibilidade?${parametros}`
        );

        if (!ativo) return;

        const encontrados = lista(resposta)
          .map((item) =>
            typeof item === "string" ? item : item.inicio
          )
          .filter(
            (hora) =>
              typeof hora === "string" &&
              /^\d{2}:\d{2}$/.test(hora)
          );

        setHorarios([...new Set(encontrados)].sort());
      } catch (e) {
        if (ativo) setErroHorarios(e.message);
      } finally {
        if (ativo) setBuscandoHorarios(false);
      }
    }

    consultar();

    return () => {
      ativo = false;
    };
  }, [
    modalAberto,
    perfil?.usuario_id,
    form.data,
    servicoSelecionado?.servico_id,
    requisicao,
  ]);

  const inicioOriginal = editando
    ? dataLocal(editando.agendamento_dt_hr_inicio)
    : "";

  const mesmoHorarioOriginal =
    Boolean(editando) &&
    inicio === inicioOriginal &&
    String(form.barbeiro_servico_id) ===
      String(editando?.barbeiro_servico_id);

  const horariosExibidos = useMemo(() => {
    const resultado = [...horarios];

    if (
      editando &&
      form.horario &&
      inicio === inicioOriginal &&
      String(form.barbeiro_servico_id) ===
        String(editando.barbeiro_servico_id)
    ) {
      resultado.push(form.horario);
    }

    return [...new Set(resultado)].sort();
  }, [
    horarios,
    editando,
    form.horario,
    form.barbeiro_servico_id,
    inicio,
    inicioOriginal,
  ]);

  const filtrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();

    return agendamentos.filter((item) => {
      const texto = [
        item.usuario_nome,
        item.servico_nome,
        item.agendamento_id,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!termo || texto.includes(termo)) &&
        (!filtroStatus ||
          statusNormalizado(item.agendamento_status) ===
            filtroStatus) &&
        (!filtroData ||
          dataLocal(
            item.agendamento_dt_hr_inicio
          ).startsWith(filtroData))
      );
    });
  }, [agendamentos, pesquisa, filtroStatus, filtroData]);

  const resumo = useMemo(() => {
    const contar = (status) =>
      agendamentos.filter(
        (a) =>
          statusNormalizado(a.agendamento_status) === status
      ).length;

    return {
      total: agendamentos.length,
      agendados: contar("agendado"),
      confirmados: contar("confirmado"),
      concluidos: contar("concluido") + contar("concluído"),
      cancelados: contar("cancelado") + contar("cancelada"),
    };
  }, [agendamentos]);

  function abrirNovo() {
    setEditando(null);
    setForm({
      ...FORM_INICIAL,
      data: hojeISO(),
    });
    setHorarios([]);
    setErroHorarios("");
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function abrirEdicao(item) {
    const data = dataLocal(item.agendamento_dt_hr_inicio);

    setEditando(item);
    setForm({
      usuario_id: String(item.usuario_id || ""),
      barbeiro_servico_id: String(
        item.barbeiro_servico_id || ""
      ),
      data: data.slice(0, 10),
      horario: data.slice(11, 16),
      agendamento_status:
        item.agendamento_status || "agendado",
      agendamento_forma_pagamento:
        item.agendamento_forma_pagamento || "",
      agendamento_observacoes:
        item.agendamento_observacoes || "",
    });

    setHorarios([]);
    setErroHorarios("");
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setEditando(null);
    setForm(FORM_INICIAL);
    setErro("");
    setErroHorarios("");
  }

  function alterarCampo(e) {
    const { name, value } = e.target;

    setForm((anterior) => ({
      ...anterior,
      [name]: value,
      ...(name === "data" ||
      name === "barbeiro_servico_id"
        ? { horario: "" }
        : {}),
    }));
  }

  async function salvar(e) {
    e.preventDefault();
    setErro("");

    if (
      !form.usuario_id ||
      !form.barbeiro_servico_id ||
      !form.data ||
      !form.horario
    ) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!duracao || !fim) {
      setErro("O serviço precisa ter uma duração válida.");
      return;
    }

    if (buscandoHorarios || erroHorarios) {
      setErro(
        "Aguarde a consulta de disponibilidade."
      );
      return;
    }

    if (
      !horarios.includes(form.horario) &&
      !mesmoHorarioOriginal
    ) {
      setErro(
        "Este horário não está disponível. Escolha outro."
      );
      return;
    }

    const dados = {
      usuario_id: Number(form.usuario_id),
      barbeiro_servico_id: Number(
        form.barbeiro_servico_id
      ),
      agendamento_dt_hr_inicio:
        `${inicio.replace("T", " ")}:00`,
      agendamento_dt_hr_fim:
        `${fim.replace("T", " ")}:00`,
      agendamento_observacoes:
        form.agendamento_observacoes.trim(),
      agendamento_forma_pagamento:
        form.agendamento_forma_pagamento.trim() || null,
    };

    if (editando) {
      dados.agendamento_status =
        form.agendamento_status;
    }

    setSalvando(true);

    try {
      await requisicao(
        editando
          ? `/agendamentos/${editando.agendamento_id}`
          : "/agendamentos",
        {
          method: editando ? "PUT" : "POST",
          body: JSON.stringify(dados),
        }
      );

      setModalAberto(false);
      setEditando(null);
      setForm(FORM_INICIAL);

      await carregar();

      setSucesso(
        editando
          ? "Agendamento atualizado com sucesso!"
          : "Agendamento cadastrado com sucesso!"
      );
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function cancelar(item) {
    if (
      !window.confirm(
        `Deseja cancelar o agendamento #${item.agendamento_id} de ${item.usuario_nome}?`
      )
    ) {
      return;
    }

    setErro("");
    setSucesso("");

    try {
      await requisicao(
        `/agendamentos/${item.agendamento_id}`,
        { method: "DELETE" }
      );

      await carregar();
      setSucesso("Agendamento cancelado com sucesso!");
    } catch (e) {
      setErro(e.message);
    }
  }

  function voltar() {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/dashboardBarbeiro");
    }
  }

  return (
    <div className="mba-pagina">
      <header className="mba-cabecalho">
        <button
          type="button"
          className="mba-logo-botao"
          onClick={voltar}
          title="Voltar"
        >
          <img src={logoHope} alt="Hope Barbearia" />
        </button>

        <div>
          <h1>Meus Agendamentos</h1>
          <p>Hope Barbearia — Área do Barbeiro</p>
        </div>
      </header>

      <main className="mba-conteudo">
        <div className="mba-topo">
          <div>
            <h2>Minha Agenda</h2>
            <p>
              Visualize e gerencie seus atendimentos.
            </p>
          </div>

          <button
            type="button"
            className="mba-btn mba-btn-dourado"
            onClick={abrirNovo}
          >
            + Novo Agendamento
          </button>
        </div>

        {sucesso && (
          <div className="mba-alerta mba-sucesso">
            {sucesso}
          </div>
        )}

        {erro && !modalAberto && (
          <div className="mba-alerta mba-erro">
            {erro}
          </div>
        )}

        <section className="mba-estatisticas">
          {[
            ["Total", resumo.total],
            ["Agendados", resumo.agendados],
            ["Confirmados", resumo.confirmados],
            ["Concluídos", resumo.concluidos],
            ["Cancelados", resumo.cancelados],
          ].map(([titulo, valor]) => (
            <div className="mba-card" key={titulo}>
              <span>{titulo}</span>
              <strong>{valor}</strong>
            </div>
          ))}
        </section>

        <section className="mba-painel">
          <h3>Filtrar Agendamentos</h3>

          <div className="mba-filtros">
            <div className="mba-campo">
              <label htmlFor="mba-pesquisa">
                Pesquisar
              </label>
              <input
                id="mba-pesquisa"
                type="text"
                placeholder="Cliente, serviço ou ID"
                value={pesquisa}
                onChange={(e) =>
                  setPesquisa(e.target.value)
                }
              />
            </div>

            <div className="mba-campo">
              <label htmlFor="mba-filtro-data">
                Data
              </label>
              <input
                id="mba-filtro-data"
                type="date"
                value={filtroData}
                onChange={(e) =>
                  setFiltroData(e.target.value)
                }
              />
            </div>

            <div className="mba-campo">
              <label htmlFor="mba-filtro-status">
                Status
              </label>
              <select
                id="mba-filtro-status"
                value={filtroStatus}
                onChange={(e) =>
                  setFiltroStatus(e.target.value)
                }
              >
                <option value="">Todos</option>
                <option value="agendado">Agendado</option>
                <option value="confirmado">Confirmado</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <button
              type="button"
              className="mba-btn mba-btn-secundario"
              onClick={carregar}
            >
              Atualizar
            </button>
          </div>
        </section>

        <section className="mba-painel">
          <div className="mba-tabela-titulo">
            <h3>Atendimentos</h3>
            <span>{filtrados.length} resultado(s)</span>
          </div>

          {carregando ? (
            <p className="mba-vazio">
              Carregando agendamentos...
            </p>
          ) : (
            <div className="mba-tabela-rolagem">
              <table className="mba-tabela">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Serviço</th>
                    <th>Início</th>
                    <th>Término</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {filtrados.map((item) => {
                    const bloqueado = statusFinalizado(
                      item.agendamento_status
                    );

                    return (
                      <tr key={item.agendamento_id}>
                        <td>#{item.agendamento_id}</td>
                        <td>{item.usuario_nome || "-"}</td>
                        <td>{item.servico_nome || "-"}</td>
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
                            className={
                              "mba-status mba-status-" +
                              statusNormalizado(
                                item.agendamento_status
                              )
                            }
                          >
                            {tituloStatus(
                              item.agendamento_status
                            )}
                          </span>
                        </td>
                        <td>
                          <div className="mba-acoes">
                            <button
                              type="button"
                              className="mba-btn mba-btn-editar"
                              disabled={bloqueado}
                              onClick={() =>
                                abrirEdicao(item)
                              }
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className="mba-btn mba-btn-cancelar"
                              disabled={bloqueado}
                              onClick={() =>
                                cancelar(item)
                              }
                            >
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!filtrados.length && (
                    <tr>
                      <td colSpan={7} className="mba-vazio">
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

      {modalAberto && (
        <div className="mba-modal-fundo">
          <div
            className="mba-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mba-modal-titulo"
          >
            <div className="mba-modal-topo">
              <h2 id="mba-modal-titulo">
                {editando
                  ? "Editar / Reagendar Atendimento"
                  : "Novo Agendamento"}
              </h2>

              <button
                type="button"
                className="mba-fechar"
                onClick={fecharModal}
                disabled={salvando}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <form
              className="mba-formulario"
              onSubmit={salvar}
            >
              <div className="mba-campo">
                <label htmlFor="mba-cliente">
                  Cliente *
                </label>
                <select
                  id="mba-cliente"
                  name="usuario_id"
                  value={form.usuario_id}
                  onChange={alterarCampo}
                  required
                >
                  <option value="">
                    Selecione o cliente
                  </option>
                  {clientes.map((cliente) => (
                    <option
                      key={idCliente(cliente)}
                      value={idCliente(cliente)}
                    >
                      {nomeCliente(cliente)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mba-campo">
                <label htmlFor="mba-servico">
                  Meu Serviço *
                </label>
                <select
                  id="mba-servico"
                  name="barbeiro_servico_id"
                  value={form.barbeiro_servico_id}
                  onChange={alterarCampo}
                  required
                >
                  <option value="">
                    Selecione o serviço
                  </option>
                  {servicos.map((item) => (
                    <option
                      key={item.barbeiro_servico_id}
                      value={item.barbeiro_servico_id}
                    >
                      {item.servico_nome} —{" "}
                      {duracaoMinutos(
                        item.servico_duracao
                      )} min
                    </option>
                  ))}
                </select>
              </div>

              <div className="mba-campo">
                <label htmlFor="mba-data">
                  Data do Atendimento *
                </label>
                <input
                  id="mba-data"
                  type="date"
                  name="data"
                  min={editando ? undefined : hojeISO()}
                  value={form.data}
                  onChange={alterarCampo}
                  required
                />
              </div>

              <div className="mba-campo">
                <label>
                  Horários Disponíveis *
                </label>

                {!form.barbeiro_servico_id ||
                !form.data ? (
                  <p className="mba-ajuda">
                    Escolha o serviço e a data.
                  </p>
                ) : buscandoHorarios ? (
                  <p className="mba-ajuda">
                    Consultando horários...
                  </p>
                ) : erroHorarios ? (
                  <div className="mba-alerta mba-erro">
                    {erroHorarios}
                  </div>
                ) : horariosExibidos.length === 0 ? (
                  <p className="mba-ajuda">
                    Nenhum horário disponível nesta data.
                    Escolha outro dia.
                  </p>
                ) : (
                  <div className="mba-horarios">
                    {horariosExibidos.map((hora) => {
                      const selecionado =
                        form.horario === hora;

                      const permitido =
                        horarios.includes(hora) ||
                        (selecionado &&
                          mesmoHorarioOriginal);

                      return (
                        <button
                          key={hora}
                          type="button"
                          disabled={!permitido}
                          className={
                            "mba-horario" +
                            (selecionado
                              ? " mba-horario-selecionado"
                              : "")
                          }
                          aria-pressed={selecionado}
                          onClick={() => {
                            setForm((anterior) => ({
                              ...anterior,
                              horario: hora,
                            }));
                            setErro("");
                          }}
                        >
                          {hora}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mba-resumo">
                <h3>Resumo do Atendimento</h3>
                <p>
                  <strong>Duração:</strong>{" "}
                  {duracao
                    ? `${duracao} minutos`
                    : "Selecione um serviço"}
                </p>
                <p>
                  <strong>Início:</strong>{" "}
                  {inicio
                    ? formatarData(inicio)
                    : "Selecione um horário"}
                </p>
                <p>
                  <strong>Término:</strong>{" "}
                  {fim
                    ? formatarData(fim)
                    : "Aguardando seleção"}
                </p>
              </div>

              {editando && (
                <div className="mba-campo">
                  <label htmlFor="mba-status">
                    Status
                  </label>
                  <select
                    id="mba-status"
                    name="agendamento_status"
                    value={form.agendamento_status}
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

              <div className="mba-campo">
                <label htmlFor="mba-pagamento">
                  Forma de Pagamento
                </label>
                <select
                  id="mba-pagamento"
                  name="agendamento_forma_pagamento"
                  value={
                    form.agendamento_forma_pagamento
                  }
                  onChange={alterarCampo}
                >
                  <option value="">
                    Não informado
                  </option>
                  <option value="pix">Pix</option>
                  <option value="dinheiro">
                    Dinheiro
                  </option>
                  <option value="cartao">
                    Cartão
                  </option>
                </select>
              </div>

              <div className="mba-campo">
                <label htmlFor="mba-observacoes">
                  Observações
                </label>
                <textarea
                  id="mba-observacoes"
                  name="agendamento_observacoes"
                  rows={3}
                  placeholder="Observações sobre o atendimento"
                  value={form.agendamento_observacoes}
                  onChange={alterarCampo}
                />
              </div>

              {erro && (
                <div className="mba-alerta mba-erro">
                  {erro}
                </div>
              )}

              <div className="mba-modal-acoes">
                <button
                  type="button"
                  className="mba-btn mba-btn-secundario"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  className="mba-btn mba-btn-dourado"
                  disabled={
                    salvando ||
                    buscandoHorarios ||
                    Boolean(erroHorarios) ||
                    !duracao ||
                    !fim
                  }
                >
                  {salvando
                    ? "Salvando..."
                    : editando
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
