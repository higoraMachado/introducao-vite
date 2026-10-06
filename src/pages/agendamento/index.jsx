import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Agendamento.css';
import logoHope from '../../assets/logo-hope.png';

const API_URL = 'http://localhost:3333';

/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function formatarData(data) {
  if (!data) return '';

  const [ano, mes, dia] = data.split('-');

  return `${dia}/${mes}/${ano}`;
}

function criarDataLocal(data) {
  const [ano, mes, dia] = data.split('-').map(Number);

  return new Date(ano, mes - 1, dia);
}

function dataParaString(data) {
  const ano = data.getFullYear();

  const mes = String(
    data.getMonth() + 1
  ).padStart(2, '0');

  const dia = String(
    data.getDate()
  ).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function gerarCalendario(mesAtual) {
  const ano = mesAtual.getFullYear();
  const mes = mesAtual.getMonth();

  const primeiroDia = new Date(
    ano,
    mes,
    1
  );

  const ultimoDia = new Date(
    ano,
    mes + 1,
    0
  );

  const diasNoMes =
    ultimoDia.getDate();

  const primeiroDiaSemana =
    (primeiroDia.getDay() + 6) % 7;

  const dias = [];

  for (
    let i = 0;
    i < primeiroDiaSemana;
    i++
  ) {
    dias.push(null);
  }

  for (
    let dia = 1;
    dia <= diasNoMes;
    dia++
  ) {
    dias.push(
      new Date(
        ano,
        mes,
        dia
      )
    );
  }

  return dias;
}

function converterDuracaoParaMinutos(
  duracao
) {
  if (!duracao) {
    return 30;
  }

  if (
    typeof duracao === 'number'
  ) {
    return duracao;
  }

  const texto =
    String(duracao);

  if (!texto.includes(':')) {
    return Number(texto) || 30;
  }

  const partes =
    texto
      .split(':')
      .map(Number);

  const horas =
    partes[0] || 0;

  const minutos =
    partes[1] || 0;

  return (
    horas * 60 +
    minutos
  );
}

function montarDataHora(
  data,
  hora
) {
  if (!data || !hora) {
    return null;
  }

  const horaCompleta =
    hora.length === 5
      ? `${hora}:00`
      : hora;

  return `${data} ${horaCompleta}`;
}

function formatarPreco(valor) {
  const numero =
    Number(valor) || 0;

  return numero.toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  );
}

function extrairDataBanco(
  dataHora
) {
  if (!dataHora) {
    return '';
  }

  const texto =
    String(dataHora);

  return texto.slice(0, 10);
}

function extrairHoraBanco(
  dataHora
) {
  if (!dataHora) {
    return '';
  }

  const texto =
    String(dataHora);

  if (texto.includes('T')) {
    return texto
      .split('T')[1]
      .slice(0, 5);
  }

  if (texto.includes(' ')) {
    return texto
      .split(' ')[1]
      .slice(0, 5);
  }

  return '';
}

/* =========================================================
   COMPONENTE
========================================================= */

function AppAgendamento() {
  const navigate =
    useNavigate();

  const hoje =
    new Date();

  /* =======================================================
     DADOS DA API
  ======================================================= */

  const [
    barbeiros,
    setBarbeiros,
  ] = useState([]);

  const [
    servicos,
    setServicos,
  ] = useState([]);

  const [
    barbeirosServicos,
    setBarbeirosServicos,
  ] = useState([]);

  const [
    horariosDisponiveis,
    setHorariosDisponiveis,
  ] = useState([]);

  /* =======================================================
     CARREGAMENTOS
  ======================================================= */

  const [
    carregandoDados,
    setCarregandoDados,
  ] = useState(true);

  const [
    carregandoHorarios,
    setCarregandoHorarios,
  ] = useState(false);

  const [
    salvandoAgendamento,
    setSalvandoAgendamento,
  ] = useState(false);

  const [
    cancelandoAgendamento,
    setCancelandoAgendamento,
  ] = useState(false);

  /* =======================================================
     CALENDÁRIO
  ======================================================= */

  const [
    mesAtual,
    setMesAtual,
  ] = useState(
    new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      1
    )
  );

  const [
    dataSelecionada,
    setDataSelecionada,
  ] = useState(
    dataParaString(hoje)
  );

  /* =======================================================
     SELEÇÕES
  ======================================================= */

  const [
    barbeiroSelecionado,
    setBarbeiroSelecionado,
  ] = useState(null);

  const [
    servicoSelecionado,
    setServicoSelecionado,
  ] = useState(null);

  const [
    horarioSelecionado,
    setHorarioSelecionado,
  ] = useState(null);

  /* =======================================================
     USUÁRIO
  ======================================================= */

  const [
    fotoUsuario,
    setFotoUsuario,
  ] = useState(
    localStorage.getItem(
      'hope-foto-usuario'
    ) || null
  );

  const [
    menuUsuario,
    setMenuUsuario,
  ] = useState(false);

  /* =======================================================
     AGENDAMENTO
  ======================================================= */

  const [
    agendamento,
    setAgendamento,
  ] = useState(null);

  const [
    modalConfirmacao,
    setModalConfirmacao,
  ] = useState(false);

  const [
    modalCancelamento,
    setModalCancelamento,
  ] = useState(false);

  const [
    modoReagendamento,
    setModoReagendamento,
  ] = useState(false);

  /* =======================================================
     CALENDÁRIO
  ======================================================= */

  const diasCalendario =
    useMemo(
      () =>
        gerarCalendario(
          mesAtual
        ),
      [mesAtual]
    );

  const nomeMes =
    mesAtual.toLocaleDateString(
      'pt-BR',
      {
        month: 'long',
        year: 'numeric',
      }
    );

  /* =======================================================
     USUÁRIO LOGADO
  ======================================================= */

  function obterUsuarioLogado() {
    try {
      const usuarioSalvo =
        localStorage.getItem(
          'usuario'
        );

      if (!usuarioSalvo) {
        return null;
      }

      return JSON.parse(
        usuarioSalvo
      );
    } catch (error) {
      console.error(
        'Erro ao ler usuário:',
        error
      );

      return null;
    }
  }

  const usuarioLogado =
    obterUsuarioLogado();

  const nomeUsuario =
    usuarioLogado?.usuario_nome ||
    usuarioLogado?.nome ||
    'Cliente';

  /* =======================================================
     SERVIÇO E BARBEIRO ATUAIS
  ======================================================= */

  const servicoAtual =
    servicos.find(
      (servico) =>
        Number(servico.id) ===
        Number(
          servicoSelecionado
        )
    );

  const barbeiroAtual =
    barbeiros.find(
      (barbeiro) =>
        Number(barbeiro.id) ===
        Number(
          barbeiroSelecionado
        )
    );

  /* =======================================================
     SERVIÇOS DO BARBEIRO
  ======================================================= */

  const servicosDoBarbeiro =
    useMemo(() => {
      if (
        !barbeiroSelecionado
      ) {
        return [];
      }

      const idsServicos =
        barbeirosServicos
          .filter(
            (item) =>
              Number(
                item.usuario_id
              ) ===
              Number(
                barbeiroSelecionado
              )
          )
          .map(
            (item) =>
              Number(
                item.servico_id
              )
          );

      return servicos.filter(
        (servico) =>
          idsServicos.includes(
            Number(servico.id)
          )
      );
    }, [
      barbeiroSelecionado,
      barbeirosServicos,
      servicos,
    ]);

  /* =======================================================
     TOKEN
  ======================================================= */

  function pegarToken() {
    return localStorage.getItem(
      'token'
    );
  }

  /* =======================================================
     HEADERS
  ======================================================= */

  function criarHeaders() {
    const token =
      pegarToken();

    return {
      'Content-Type':
        'application/json',

      Authorization:
        `Bearer ${token}`,
    };
  }

  /* =======================================================
     TRATAR ERRO DE AUTENTICAÇÃO
  ======================================================= */

  function verificarAutenticacao(
    resposta
  ) {
    if (
      resposta.status === 401 ||
      resposta.status === 403
    ) {
      localStorage.removeItem(
        'token'
      );

      localStorage.removeItem(
        'usuario'
      );

      navigate('/login');

      return false;
    }

    return true;
  }

  /* =======================================================
     CARREGAR DADOS INICIAIS
  ======================================================= */

  async function carregarDadosIniciais() {
    try {
      setCarregandoDados(true);

      const token =
        pegarToken();

      if (!token) {
        navigate('/login');
        return;
      }

      const headers =
        criarHeaders();

      const [
        respostaBarbeiros,
        respostaServicos,
        respostaVinculos,
      ] = await Promise.all([
        fetch(
          `${API_URL}/barbeiros`,
          {
            method: 'GET',
            headers,
          }
        ),

        fetch(
          `${API_URL}/servicos`,
          {
            method: 'GET',
            headers,
          }
        ),

        fetch(
          `${API_URL}/barbeiros_servicos`,
          {
            method: 'GET',
            headers,
          }
        ),
      ]);

      if (
        !verificarAutenticacao(
          respostaBarbeiros
        )
      ) {
        return;
      }

      if (
        !verificarAutenticacao(
          respostaServicos
        )
      ) {
        return;
      }

      if (
        !verificarAutenticacao(
          respostaVinculos
        )
      ) {
        return;
      }

      const dadosBarbeiros =
        await respostaBarbeiros.json();

      const dadosServicos =
        await respostaServicos.json();

      const dadosVinculos =
        await respostaVinculos.json();

      if (
        !respostaBarbeiros.ok
      ) {
        throw new Error(
          dadosBarbeiros.message ||
          dadosBarbeiros.mensagem ||
          'Erro ao carregar barbeiros.'
        );
      }

      if (
        !respostaServicos.ok
      ) {
        throw new Error(
          dadosServicos.message ||
          dadosServicos.mensagem ||
          'Erro ao carregar serviços.'
        );
      }

      if (
        !respostaVinculos.ok
      ) {
        throw new Error(
          dadosVinculos.message ||
          dadosVinculos.mensagem ||
          'Erro ao carregar os serviços dos barbeiros.'
        );
      }

      const listaBarbeiros =
        Array.isArray(
          dadosBarbeiros.dados
        )
          ? dadosBarbeiros.dados
          : [];

      const listaServicos =
        Array.isArray(
          dadosServicos.dados
        )
          ? dadosServicos.dados
          : [];

      const listaVinculos =
        Array.isArray(
          dadosVinculos.dados
        )
          ? dadosVinculos.dados
          : [];

      setBarbeiros(
        listaBarbeiros.map(
          (barbeiro) => ({
            id: Number(
              barbeiro.usuario_id
            ),

            nome:
              barbeiro.usuario_nome,

            especialidade:
              barbeiro.barbeiro_especialidade ||
              'Barbeiro',

            foto:
              barbeiro.barbeiro_foto ||
              null,
          })
        )
      );

      setServicos(
        listaServicos
          .filter(
            (servico) =>
              Number(
                servico.servico_ativo
              ) === 1
          )
          .map(
            (servico) => ({
              id: Number(
                servico.servico_id
              ),

              nome:
                servico.servico_nome,

              duracao:
                converterDuracaoParaMinutos(
                  servico.servico_duracao
                ),

              preco:
                Number(
                  servico.servico_preco
                ) || 0,

              descricao:
                servico.servico_descricao ||
                '',
            })
          )
      );

      setBarbeirosServicos(
        listaVinculos
      );
    } catch (error) {
      console.error(
        'Erro ao carregar dados:',
        error
      );

      alert(
        error.message
      );
    } finally {
      setCarregandoDados(false);
    }
  }

  /* =======================================================
     CARREGAR AGENDAMENTO DO CLIENTE
  ======================================================= */

  async function carregarAgendamentoCliente() {
    try {
      const token =
        pegarToken();

      const usuario =
        obterUsuarioLogado();

      if (
        !token ||
        !usuario
      ) {
        return;
      }

      const usuarioId =
        Number(
          usuario.usuario_id ||
          usuario.id
        );

      if (!usuarioId) {
        return;
      }

      const resposta =
        await fetch(
          `${API_URL}/agendamentos`,
          {
            method: 'GET',
            headers:
              criarHeaders(),
          }
        );

      if (
        !verificarAutenticacao(
          resposta
        )
      ) {
        return;
      }

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.message ||
          'Erro ao carregar agendamentos.'
        );
      }

      const lista =
        Array.isArray(
          dados.dados
        )
          ? dados.dados
          : [];

      const meusAgendamentos =
        lista
          .filter(
            (item) =>
              Number(
                item.usuario_id
              ) ===
              usuarioId
          )
          .filter(
            (item) =>
              item.agendamento_status !==
              'cancelado'
          )
          .sort(
            (a, b) =>
              new Date(
                a.agendamento_dt_hr_inicio
              ) -
              new Date(
                b.agendamento_dt_hr_inicio
              )
          );

      const agora =
        new Date();

      const proximo =
        meusAgendamentos.find(
          (item) =>
            new Date(
              item.agendamento_dt_hr_inicio
            ) >= agora
        );

      if (!proximo) {
        setAgendamento(null);
        return;
      }

      const barbeiro =
        barbeiros.find(
          (item) =>
            Number(item.id) ===
            Number(
              proximo.barbeiro_id
            )
        );

      setAgendamento({
        id:
          proximo.agendamento_id,

        data:
          extrairDataBanco(
            proximo.agendamento_dt_hr_inicio
          ),

        horario:
          extrairHoraBanco(
            proximo.agendamento_dt_hr_inicio
          ),

        barbeiroId:
          Number(
            proximo.barbeiro_id
          ),

        barbeiroNome:
          barbeiro?.nome ||
          proximo.barbeiro_nome ||
          'Barbeiro',

        servicoId:
          Number(
            proximo.servico_id
          ),

        servicoNome:
          proximo.servico_nome,

        preco:
          Number(
            proximo.servico_preco
          ) || 0,

        duracao:
          converterDuracaoParaMinutos(
            proximo.servico_duracao
          ),
      });
    } catch (error) {
      console.error(
        'Erro ao carregar agendamento:',
        error
      );
    }
  }

  /* =======================================================
     USE EFFECT INICIAL
  ======================================================= */

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    if (
      barbeiros.length > 0
    ) {
      carregarAgendamentoCliente();
    }
  }, [barbeiros]);

  /* =======================================================
     CARREGAR HORÁRIOS
  ======================================================= */

  async function carregarHorariosDisponiveis() {
    if (
      !dataSelecionada ||
      !barbeiroSelecionado ||
      !servicoSelecionado
    ) {
      setHorariosDisponiveis([]);
      return;
    }

    try {
      setCarregandoHorarios(
        true
      );

      const token =
        pegarToken();

      if (!token) {
        navigate('/login');
        return;
      }

      const parametros =
        new URLSearchParams({
          data:
            dataSelecionada,

          barbeiro_id:
            String(
              barbeiroSelecionado
            ),

          servico_id:
            String(
              servicoSelecionado
            ),
        });

      const resposta =
        await fetch(
          `${API_URL}/agendamentos/disponibilidade?${parametros.toString()}`,
          {
            method: 'GET',

            headers:
              criarHeaders(),
          }
        );

      if (
        !verificarAutenticacao(
          resposta
        )
      ) {
        return;
      }

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem ||
          dados.message ||
          'Erro ao consultar horários disponíveis.'
        );
      }

      const lista =
        Array.isArray(
          dados.dados
        )
          ? dados.dados
          : [];

      setHorariosDisponiveis(
        lista
      );
    } catch (error) {
      console.error(
        'Erro ao carregar horários:',
        error
      );

      setHorariosDisponiveis(
        []
      );
    } finally {
      setCarregandoHorarios(
        false
      );
    }
  }

  useEffect(() => {
    carregarHorariosDisponiveis();
  }, [
    dataSelecionada,
    barbeiroSelecionado,
    servicoSelecionado,
  ]);

  /* =======================================================
     FOTO DO USUÁRIO
  ======================================================= */

  function selecionarFotoUsuario(
    event
  ) {
    const arquivo =
      event.target.files[0];

    if (!arquivo) {
      return;
    }

    if (
      !arquivo.type.startsWith(
        'image/'
      )
    ) {
      alert(
        'Escolha uma imagem válida.'
      );

      return;
    }

    const leitor =
      new FileReader();

    leitor.onload = () => {
      const imagem =
        leitor.result;

      setFotoUsuario(
        imagem
      );

      localStorage.setItem(
        'hope-foto-usuario',
        imagem
      );
    };

    leitor.readAsDataURL(
      arquivo
    );
  }

  /* =======================================================
     CALENDÁRIO
  ======================================================= */

  function selecionarData(
    data
  ) {
    const dataString =
      dataParaString(data);

    setDataSelecionada(
      dataString
    );

    setHorarioSelecionado(
      null
    );

    setHorariosDisponiveis(
      []
    );
  }

  function mesAnterior() {
    setMesAtual(
      new Date(
        mesAtual.getFullYear(),
        mesAtual.getMonth() - 1,
        1
      )
    );
  }

  function proximoMes() {
    setMesAtual(
      new Date(
        mesAtual.getFullYear(),
        mesAtual.getMonth() + 1,
        1
      )
    );
  }

  /* =======================================================
     BARBEIRO
  ======================================================= */

  function selecionarBarbeiro(
    id
  ) {
    setBarbeiroSelecionado(
      Number(id)
    );

    setServicoSelecionado(
      null
    );

    setHorarioSelecionado(
      null
    );

    setHorariosDisponiveis(
      []
    );
  }

  /* =======================================================
     SERVIÇO
  ======================================================= */

  function selecionarServico(
    id
  ) {
    setServicoSelecionado(
      Number(id)
    );

    setHorarioSelecionado(
      null
    );

    setHorariosDisponiveis(
      []
    );
  }

  /* =======================================================
     HORÁRIO
  ======================================================= */

  function selecionarHorario(
    horario
  ) {
    setHorarioSelecionado(
      horario
    );
  }

  /* =======================================================
     BARBEIRO SERVIÇO ID
  ======================================================= */

  function encontrarBarbeiroServicoId() {
    const vinculo =
      barbeirosServicos.find(
        (item) =>
          Number(
            item.usuario_id
          ) ===
            Number(
              barbeiroSelecionado
            ) &&
          Number(
            item.servico_id
          ) ===
            Number(
              servicoSelecionado
            )
      );

    if (!vinculo) {
      return null;
    }

    return Number(
      vinculo.barbeiro_servico_id
    );
  }

  /* =======================================================
     ABRIR CONFIRMAÇÃO
  ======================================================= */

  function abrirConfirmacao() {
    if (
      !dataSelecionada ||
      !barbeiroSelecionado ||
      !servicoSelecionado ||
      !horarioSelecionado
    ) {
      alert(
        'Complete todas as etapas antes de confirmar.'
      );

      return;
    }

    setModalConfirmacao(
      true
    );
  }

  /* =======================================================
     CONFIRMAR AGENDAMENTO
  ======================================================= */

  async function confirmarAgendamento() {
    try {
      setSalvandoAgendamento(
        true
      );

      const token =
        pegarToken();

      const usuario =
        obterUsuarioLogado();

      if (
        !token ||
        !usuario
      ) {
        alert(
          'Você precisa estar logado para agendar.'
        );

        navigate('/login');

        return;
      }

      const usuarioId =
        Number(
          usuario.usuario_id ||
          usuario.id
        );

      if (!usuarioId) {
        throw new Error(
          'Não foi possível identificar o cliente logado.'
        );
      }

      const barbeiroServicoId =
        encontrarBarbeiroServicoId();

      if (
        !barbeiroServicoId
      ) {
        throw new Error(
          'O serviço selecionado não está vinculado a este barbeiro.'
        );
      }

      const horario =
        horariosDisponiveis.find(
          (item) =>
            item.inicio ===
            horarioSelecionado
        );

      /*
       * Durante reagendamento o horário antigo
       * pode não estar na lista porque já está ocupado
       * pelo próprio agendamento.
       */
      let horarioInicio =
        horario?.inicio ||
        horarioSelecionado;

      let horarioFim =
        horario?.fim;

      if (!horarioFim) {
        const [
          horas,
          minutos,
        ] =
          horarioInicio
            .split(':')
            .map(Number);

        const dataHora =
          new Date(
            2000,
            0,
            1,
            horas,
            minutos
          );

        dataHora.setMinutes(
          dataHora.getMinutes() +
          (
            servicoAtual?.duracao ||
            30
          )
        );

        horarioFim =
          `${String(
            dataHora.getHours()
          ).padStart(
            2,
            '0'
          )}:${String(
            dataHora.getMinutes()
          ).padStart(
            2,
            '0'
          )}`;
      }

      const corpo = {
        agendamento_dt_hr_inicio:
          montarDataHora(
            dataSelecionada,
            horarioInicio
          ),

        agendamento_dt_hr_fim:
          montarDataHora(
            dataSelecionada,
            horarioFim
          ),

        agendamento_status:
          'agendado',

        agendamento_observacoes:
          null,

        agendamento_forma_pagamento:
          null,

        barbeiro_servico_id:
          barbeiroServicoId,

        usuario_id:
          usuarioId,
      };

      const eraReagendamento =
        modoReagendamento &&
        agendamento?.id;

      let resposta;

      if (
        eraReagendamento
      ) {
        resposta =
          await fetch(
            `${API_URL}/agendamentos/${agendamento.id}`,
            {
              method: 'PUT',

              headers:
                criarHeaders(),

              body:
                JSON.stringify(
                  corpo
                ),
            }
          );
      } else {
        resposta =
          await fetch(
            `${API_URL}/agendamentos`,
            {
              method: 'POST',

              headers:
                criarHeaders(),

              body:
                JSON.stringify(
                  corpo
                ),
            }
          );
      }

      if (
        !verificarAutenticacao(
          resposta
        )
      ) {
        return;
      }

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.dados ||
          dados.message ||
          dados.mensagem ||
          'Erro ao salvar agendamento.'
        );
      }

      const salvo =
        dados.dados;

      const novoAgendamento = {
        id:
          salvo.agendamento_id,

        data:
          dataSelecionada,

        horario:
          horarioInicio,

        barbeiroId:
          barbeiroAtual.id,

        barbeiroNome:
          barbeiroAtual.nome,

        servicoId:
          servicoAtual.id,

        servicoNome:
          servicoAtual.nome,

        preco:
          Number(
            servicoAtual.preco
          ),

        duracao:
          servicoAtual.duracao,
      };

      setAgendamento(
        novoAgendamento
      );

      setModalConfirmacao(
        false
      );

      setModoReagendamento(
        false
      );

      setHorarioSelecionado(
        null
      );

      await carregarHorariosDisponiveis();

      alert(
        eraReagendamento
          ? 'Agendamento reagendado com sucesso!'
          : 'Agendamento confirmado com sucesso!'
      );
    } catch (error) {
      console.error(
        'Erro ao confirmar agendamento:',
        error
      );

      alert(
        error.message
      );
    } finally {
      setSalvandoAgendamento(
        false
      );
    }
  }

  /* =======================================================
     REAGENDAR
  ======================================================= */

  function iniciarReagendamento() {
    if (!agendamento) {
      return;
    }

    setModoReagendamento(
      true
    );

    setDataSelecionada(
      agendamento.data
    );

    setBarbeiroSelecionado(
      Number(
        agendamento.barbeiroId
      )
    );

    setServicoSelecionado(
      Number(
        agendamento.servicoId
      )
    );

    setHorarioSelecionado(
      null
    );

    const data =
      criarDataLocal(
        agendamento.data
      );

    setMesAtual(
      new Date(
        data.getFullYear(),
        data.getMonth(),
        1
      )
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  /* =======================================================
     CANCELAMENTO
  ======================================================= */

  function abrirCancelamento() {
    if (!agendamento) {
      return;
    }

    setModalCancelamento(
      true
    );
  }

  async function confirmarCancelamento() {
    if (!agendamento?.id) {
      return;
    }

    try {
      setCancelandoAgendamento(
        true
      );

      const resposta =
        await fetch(
          `${API_URL}/agendamentos/${agendamento.id}`,
          {
            method: 'DELETE',

            headers:
              criarHeaders(),
          }
        );

      if (
        !verificarAutenticacao(
          resposta
        )
      ) {
        return;
      }

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.message ||
          dados.mensagem ||
          dados.dados ||
          'Erro ao cancelar agendamento.'
        );
      }

      setAgendamento(
        null
      );

      setModalCancelamento(
        false
      );

      limparFormulario();

      await carregarHorariosDisponiveis();

      alert(
        'Agendamento cancelado com sucesso!'
      );
    } catch (error) {
      console.error(
        'Erro ao cancelar agendamento:',
        error
      );

      alert(
        error.message
      );
    } finally {
      setCancelandoAgendamento(
        false
      );
    }
  }

  /* =======================================================
     LIMPAR FORMULÁRIO
  ======================================================= */

  function limparFormulario() {
    setDataSelecionada(
      dataParaString(hoje)
    );

    setBarbeiroSelecionado(
      null
    );

    setServicoSelecionado(
      null
    );

    setHorarioSelecionado(
      null
    );

    setHorariosDisponiveis(
      []
    );

    setModoReagendamento(
      false
    );

    setMesAtual(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
      )
    );
  }

  /* =======================================================
     SAIR
  ======================================================= */

  function sair() {
    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'usuario'
    );

    setMenuUsuario(
      false
    );

    navigate('/');
  }

  /* =======================================================
     FORMULÁRIO COMPLETO
  ======================================================= */

  const formularioCompleto =
    Boolean(
      dataSelecionada &&
      barbeiroSelecionado &&
      servicoSelecionado &&
      horarioSelecionado
    );

  /* =======================================================
     TELA
  ======================================================= */

  return (
    <main className="agendamento-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="agendamento-header">

        <div
          className="header-logo"
          onClick={() =>
            navigate(
              '/dashboardCliente'
            )
          }
          style={{
            cursor: 'pointer',
          }}
          title="Voltar para o painel"
        >
          <img
            src={logoHope}
            alt="Hope Barbearia"
          />
        </div>

        <div className="header-title">

          <h1>
            Agendamento
          </h1>

          <p>
            {modoReagendamento
              ? 'Reagende seu atendimento'
              : 'Agende seu próximo atendimento'}
          </p>

        </div>

        <div className="header-user">

          <input
            type="file"
            id="fotoUsuario"
            accept="image/*"
            onChange={
              selecionarFotoUsuario
            }
            className="input-foto"
          />

          <button
            type="button"
            className="user-button"
            onClick={() =>
              setMenuUsuario(
                !menuUsuario
              )
            }
          >

            <label
              htmlFor="fotoUsuario"
              className="user-avatar"
              onClick={(event) =>
                event.stopPropagation()
              }
              title="Alterar foto"
            >

              {fotoUsuario ? (

                <img
                  src={fotoUsuario}
                  alt="Foto do usuário"
                />

              ) : (

                <span>
                  {nomeUsuario
                    .charAt(0)
                    .toUpperCase()}
                </span>

              )}

            </label>

            <div className="user-info">

              <strong>
                {nomeUsuario}
              </strong>

              <span>
                Minha conta
              </span>

            </div>

            <span className="user-arrow">
              {menuUsuario
                ? '⌃'
                : '⌄'}
            </span>

          </button>

          {menuUsuario && (

            <div className="user-menu">

              <label
                htmlFor="fotoUsuario"
                className="menu-item"
                onClick={() =>
                  setMenuUsuario(
                    false
                  )
                }
              >
                📷
                <span>
                  Alterar foto
                </span>
              </label>

              <button
                type="button"
                className="menu-item"
                onClick={() => {
                  setMenuUsuario(
                    false
                  );

                  navigate(
                    '/perfil'
                  );
                }}
              >
                👤

                <span>
                  Meu perfil
                </span>

              </button>

              <div className="menu-divider" />

              <button
                type="button"
                className="menu-item menu-sair"
                onClick={sair}
              >
                🚪

                <span>
                  Sair
                </span>

              </button>

            </div>

          )}

        </div>

      </header>

      {/* ===================================================
          CONTEÚDO
      =================================================== */}

      <section className="agendamento-content">

        <div className="page-heading">

          <div>

            <span className="heading-label">

              {modoReagendamento
                ? 'REAGENDAMENTO'
                : 'NOVO AGENDAMENTO'}

            </span>

            <h2>

              {modoReagendamento
                ? 'Escolha uma nova data e horário'
                : 'Agende seu atendimento'}

            </h2>

            <p>
              Escolha o dia, barbeiro,
              serviço e horário que deseja.
            </p>

          </div>

          {modoReagendamento && (

            <button
              type="button"
              className="btn-cancelar-modo"
              onClick={
                limparFormulario
              }
            >
              Cancelar reagendamento
            </button>

          )}

        </div>

        {carregandoDados ? (

          <section className="card">

            <div className="empty-state">

              <strong>
                Carregando...
              </strong>

              <p>
                Buscando barbeiros e
                serviços disponíveis.
              </p>

            </div>

          </section>

        ) : (

          <div className="agendamento-grid">

            {/* =============================================
                COLUNA PRINCIPAL
            ============================================= */}

            <div className="agendamento-main">

              {/* ===========================================
                  ETAPA 1 - DATA
              =========================================== */}

              <section className="card">

                <div className="card-title">

                  <div className="step-number">
                    1
                  </div>

                  <div>

                    <h3>
                      Escolha a data
                    </h3>

                    <p>
                      Selecione o melhor
                      dia para você.
                    </p>

                  </div>

                </div>

                <div className="calendar">

                  <div className="calendar-header">

                    <button
                      type="button"
                      className="month-button"
                      onClick={
                        mesAnterior
                      }
                      aria-label="Mês anterior"
                    >
                      ‹
                    </button>

                    <h4>

                      {nomeMes
                        .charAt(0)
                        .toUpperCase() +
                        nomeMes.slice(1)}

                    </h4>

                    <button
                      type="button"
                      className="month-button"
                      onClick={
                        proximoMes
                      }
                      aria-label="Próximo mês"
                    >
                      ›
                    </button>

                  </div>

                  <div className="week-days">

                    <span>SEG</span>
                    <span>TER</span>
                    <span>QUA</span>
                    <span>QUI</span>
                    <span>SEX</span>
                    <span>SÁB</span>
                    <span>DOM</span>

                  </div>

                  <div className="calendar-days">

                    {diasCalendario.map(
                      (
                        dia,
                        index
                      ) => {

                        if (!dia) {
                          return (
                            <div
                              key={`vazio-${index}`}
                              className="calendar-empty"
                            />
                          );
                        }

                        const dataString =
                          dataParaString(
                            dia
                          );

                        const selecionado =
                          dataSelecionada ===
                          dataString;

                        const hojeString =
                          dataParaString(
                            hoje
                          );

                        const passado =
                          dataString <
                          hojeString;

                        const domingo =
                          dia.getDay() ===
                          0;

                        const desabilitado =
                          passado ||
                          domingo;

                        return (

                          <button
                            type="button"
                            key={
                              dataString
                            }
                            className={`calendar-day ${
                              selecionado
                                ? 'selected'
                                : ''
                            } ${
                              desabilitado
                                ? 'disabled'
                                : ''
                            }`}
                            disabled={
                              desabilitado
                            }
                            onClick={() =>
                              selecionarData(
                                dia
                              )
                            }
                          >
                            {dia.getDate()}
                          </button>

                        );
                      }
                    )}

                  </div>

                </div>

              </section>

              {/* ===========================================
                  ETAPA 2 - BARBEIRO
              =========================================== */}

              <section className="card">

                <div className="card-title">

                  <div className="step-number">
                    2
                  </div>

                  <div>

                    <h3>
                      Escolha o barbeiro
                    </h3>

                    <p>
                      Selecione o
                      profissional desejado.
                    </p>

                  </div>

                </div>

                {barbeiros.length === 0 ? (

                  <div className="empty-state">

                    <strong>
                      Nenhum barbeiro disponível
                    </strong>

                    <p>
                      Não existem barbeiros
                      ativos cadastrados.
                    </p>

                  </div>

                ) : (

                  <div className="barbers-grid">

                    {barbeiros.map(
                      (barbeiro) => (

                        <button
                          type="button"
                          key={
                            barbeiro.id
                          }
                          className={`barber-card ${
                            Number(
                              barbeiroSelecionado
                            ) ===
                            Number(
                              barbeiro.id
                            )
                              ? 'selected'
                              : ''
                          }`}
                          onClick={() =>
                            selecionarBarbeiro(
                              barbeiro.id
                            )
                          }
                        >

                          <div className="barber-avatar">

                            {barbeiro.foto ? (

                              <img
                                src={
                                  barbeiro.foto.startsWith(
                                    'http'
                                  )
                                    ? barbeiro.foto
                                    : `${API_URL}${barbeiro.foto}`
                                }
                                alt={
                                  barbeiro.nome
                                }
                              />

                            ) : (

                              <span>
                                {barbeiro.nome
                                  ?.charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </span>

                            )}

                          </div>

                          <div className="barber-info">

                            <strong>
                              {barbeiro.nome}
                            </strong>

                            <span>
                              {
                                barbeiro.especialidade
                              }
                            </span>

                          </div>

                          <div className="selection-check">
                            ✓
                          </div>

                        </button>

                      )
                    )}

                  </div>

                )}

              </section>

              {/* ===========================================
                  ETAPA 3 - SERVIÇO
              =========================================== */}

              <section className="card">

                <div className="card-title">

                  <div className="step-number">
                    3
                  </div>

                  <div>

                    <h3>
                      Escolha o serviço
                    </h3>

                    <p>
                      Selecione o serviço
                      que deseja realizar.
                    </p>

                  </div>

                </div>

                {!barbeiroSelecionado ? (

                  <div className="empty-state">

                    <strong>
                      Escolha um barbeiro
                    </strong>

                    <p>
                      Primeiro selecione
                      um profissional.
                    </p>

                  </div>

                ) : servicosDoBarbeiro.length ===
                  0 ? (

                  <div className="empty-state">

                    <strong>
                      Nenhum serviço disponível
                    </strong>

                    <p>
                      Este barbeiro ainda
                      não possui serviços
                      vinculados.
                    </p>

                  </div>

                ) : (

                  <div className="services-grid">

                    {servicosDoBarbeiro.map(
                      (servico) => (

                        <button
                          type="button"
                          key={
                            servico.id
                          }
                          className={`service-option ${
                            Number(
                              servicoSelecionado
                            ) ===
                            Number(
                              servico.id
                            )
                              ? 'selected'
                              : ''
                          }`}
                          onClick={() =>
                            selecionarServico(
                              servico.id
                            )
                          }
                        >

                          <div className="service-option-main">

                            <div className="service-icon">
                              ✂
                            </div>

                            <div>

                              <strong>
                                {servico.nome}
                              </strong>

                              <span>
                                {
                                  servico.duracao
                                }{' '}
                                min
                              </span>

                            </div>

                          </div>

                          <div className="service-price">

                            {formatarPreco(
                              servico.preco
                            )}

                          </div>

                        </button>

                      )
                    )}

                  </div>

                )}

              </section>

              {/* ===========================================
                  ETAPA 4 - HORÁRIO
              =========================================== */}

              <section className="card">

                <div className="card-title">

                  <div className="step-number">
                    4
                  </div>

                  <div>

                    <h3>
                      Escolha o horário
                    </h3>

                    <p>
                      Horários disponíveis
                      para a data escolhida.
                    </p>

                  </div>

                </div>

                {!barbeiroSelecionado ||
                !servicoSelecionado ? (

                  <div className="empty-state">

                    <strong>
                      Selecione barbeiro e serviço
                    </strong>

                    <p>
                      Depois disso os
                      horários disponíveis
                      aparecerão aqui.
                    </p>

                  </div>

                ) : carregandoHorarios ? (

                  <div className="empty-state">

                    <strong>
                      Carregando horários...
                    </strong>

                    <p>
                      Consultando disponibilidade.
                    </p>

                  </div>

                ) : horariosDisponiveis.length ===
                  0 ? (

                  <div className="empty-state">

                    <strong>
                      Nenhum horário disponível
                    </strong>

                    <p>
                      Escolha outra data
                      ou outro barbeiro.
                    </p>

                  </div>

                ) : (

                  <>

                    <div className="time-grid">

                      {horariosDisponiveis.map(
                        (
                          horario,
                          index
                        ) => (

                          <button
                            type="button"
                            key={`${horario.horario_disponivel_id}-${horario.inicio}-${index}`}
                            className={`time-button ${
                              horarioSelecionado ===
                              horario.inicio
                                ? 'selected'
                                : ''
                            }`}
                            onClick={() =>
                              selecionarHorario(
                                horario.inicio
                              )
                            }
                          >
                            {
                              horario.inicio
                            }
                          </button>

                        )
                      )}

                    </div>

                    <div className="time-legend">

                      <span>

                        <i className="legend available" />

                        Disponível

                      </span>

                      <span>

                        <i className="legend selected" />

                        Selecionado

                      </span>

                    </div>

                  </>

                )}

              </section>

            </div>

            {/* =============================================
                SIDEBAR
            ============================================= */}

            <aside className="agendamento-sidebar">

              <section className="summary-card">

                <div className="summary-header">

                  <div>

                    <span>
                      RESUMO
                    </span>

                    <h3>
                      Seu agendamento
                    </h3>

                  </div>

                  <div className="summary-icon">
                    ✓
                  </div>

                </div>

                <div className="summary-content">

                  <div className="summary-item">

                    <span className="summary-icon-small">
                      📅
                    </span>

                    <div>

                      <small>
                        Data
                      </small>

                      <strong>

                        {dataSelecionada
                          ? formatarData(
                              dataSelecionada
                            )
                          : 'Não selecionada'}

                      </strong>

                    </div>

                  </div>

                  <div className="summary-item">

                    <span className="summary-icon-small">
                      💈
                    </span>

                    <div>

                      <small>
                        Barbeiro
                      </small>

                      <strong>

                        {barbeiroAtual
                          ? barbeiroAtual.nome
                          : 'Não selecionado'}

                      </strong>

                    </div>

                  </div>

                  <div className="summary-item">

                    <span className="summary-icon-small">
                      ✂
                    </span>

                    <div>

                      <small>
                        Serviço
                      </small>

                      <strong>

                        {servicoAtual
                          ? servicoAtual.nome
                          : 'Não selecionado'}

                      </strong>

                    </div>

                  </div>

                  <div className="summary-item">

                    <span className="summary-icon-small">
                      🕐
                    </span>

                    <div>

                      <small>
                        Horário
                      </small>

                      <strong>
                        {horarioSelecionado ||
                          'Não selecionado'}
                      </strong>

                    </div>

                  </div>

                </div>

                <div className="summary-price">

                  <span>
                    Total
                  </span>

                  <strong>

                    {servicoAtual
                      ? formatarPreco(
                          servicoAtual.preco
                        )
                      : 'R$ 0,00'}

                  </strong>

                </div>

                <button
                  type="button"
                  className="btn-confirmar"
                  disabled={
                    !formularioCompleto ||
                    salvandoAgendamento
                  }
                  onClick={
                    abrirConfirmacao
                  }
                >

                  {modoReagendamento
                    ? 'Reagendar atendimento'
                    : 'Confirmar agendamento'}

                </button>

                {!formularioCompleto && (

                  <p className="summary-warning">
                    Complete todas as
                    etapas para continuar.
                  </p>

                )}

              </section>

              {/* ===========================================
                  PRÓXIMO AGENDAMENTO
              =========================================== */}

              {agendamento && (

                <section className="next-appointment">

                  <div className="next-header">

                    <div>

                      <span>
                        PRÓXIMO ATENDIMENTO
                      </span>

                      <h3>
                        Agendamento confirmado
                      </h3>

                    </div>

                    <div className="confirmed-badge">
                      ✓
                    </div>

                  </div>

                  <div className="appointment-date">

                    <strong>

                      {formatarData(
                        agendamento.data
                      )}

                    </strong>

                    <span>
                      às{' '}
                      {
                        agendamento.horario
                      }
                    </span>

                  </div>

                  <div className="appointment-details">

                    <div>

                      <span>
                        Barbeiro
                      </span>

                      <strong>
                        {
                          agendamento.barbeiroNome
                        }
                      </strong>

                    </div>

                    <div>

                      <span>
                        Serviço
                      </span>

                      <strong>
                        {
                          agendamento.servicoNome
                        }
                      </strong>

                    </div>

                    <div>

                      <span>
                        Valor
                      </span>

                      <strong>

                        {formatarPreco(
                          agendamento.preco
                        )}

                      </strong>

                    </div>

                  </div>

                  <div className="appointment-actions">

                    <button
                      type="button"
                      className="btn-reagendar"
                      onClick={
                        iniciarReagendamento
                      }
                    >
                      ↻ Reagendar
                    </button>

                    <button
                      type="button"
                      className="btn-cancelar"
                      onClick={
                        abrirCancelamento
                      }
                    >
                      Cancelar
                    </button>

                  </div>

                </section>

              )}

            </aside>

          </div>

        )}

      </section>

      {/* ===================================================
          MODAL CONFIRMAÇÃO
      =================================================== */}

      {modalConfirmacao && (

        <div
          className="modal-overlay"
          onClick={() =>
            !salvandoAgendamento &&
            setModalConfirmacao(
              false
            )
          }
        >

          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="modal-close"
              disabled={
                salvandoAgendamento
              }
              onClick={() =>
                setModalConfirmacao(
                  false
                )
              }
            >
              ×
            </button>

            <div className="modal-icon success">
              ✓
            </div>

            <h3>

              {modoReagendamento
                ? 'Confirmar reagendamento?'
                : 'Confirmar agendamento?'}

            </h3>

            <p>
              Confira os detalhes
              antes de confirmar.
            </p>

            <div className="modal-details">

              <div>

                <span>
                  Data
                </span>

                <strong>
                  {formatarData(
                    dataSelecionada
                  )}
                </strong>

              </div>

              <div>

                <span>
                  Horário
                </span>

                <strong>
                  {
                    horarioSelecionado
                  }
                </strong>

              </div>

              <div>

                <span>
                  Barbeiro
                </span>

                <strong>
                  {
                    barbeiroAtual?.nome
                  }
                </strong>

              </div>

              <div>

                <span>
                  Serviço
                </span>

                <strong>
                  {
                    servicoAtual?.nome
                  }
                </strong>

              </div>

              <div>

                <span>
                  Valor
                </span>

                <strong>

                  {servicoAtual
                    ? formatarPreco(
                        servicoAtual.preco
                      )
                    : 'R$ 0,00'}

                </strong>

              </div>

            </div>

            <div className="modal-actions">

              <button
                type="button"
                className="modal-secondary"
                disabled={
                  salvandoAgendamento
                }
                onClick={() =>
                  setModalConfirmacao(
                    false
                  )
                }
              >
                Voltar
              </button>

              <button
                type="button"
                className="modal-primary"
                disabled={
                  salvandoAgendamento
                }
                onClick={
                  confirmarAgendamento
                }
              >

                {salvandoAgendamento
                  ? 'Salvando...'
                  : modoReagendamento
                  ? 'Confirmar reagendamento'
                  : 'Confirmar'}

              </button>

            </div>

          </div>

        </div>

      )}

      {/* ===================================================
          MODAL CANCELAMENTO
      =================================================== */}

      {modalCancelamento && (

        <div
          className="modal-overlay"
          onClick={() =>
            !cancelandoAgendamento &&
            setModalCancelamento(
              false
            )
          }
        >

          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="modal-close"
              disabled={
                cancelandoAgendamento
              }
              onClick={() =>
                setModalCancelamento(
                  false
                )
              }
            >
              ×
            </button>

            <div className="modal-icon danger">
              !
            </div>

            <h3>
              Cancelar agendamento?
            </h3>

            <p>
              Tem certeza que deseja
              cancelar este atendimento?
            </p>

            {agendamento && (

              <div className="cancel-info">

                <strong>

                  {formatarData(
                    agendamento.data
                  )}{' '}
                  às{' '}
                  {
                    agendamento.horario
                  }

                </strong>

                <span>

                  {
                    agendamento.servicoNome
                  }{' '}
                  com{' '}
                  {
                    agendamento.barbeiroNome
                  }

                </span>

              </div>

            )}

            <div className="modal-actions">

              <button
                type="button"
                className="modal-secondary"
                disabled={
                  cancelandoAgendamento
                }
                onClick={() =>
                  setModalCancelamento(
                    false
                  )
                }
              >
                Voltar
              </button>

              <button
                type="button"
                className="modal-danger"
                disabled={
                  cancelandoAgendamento
                }
                onClick={
                  confirmarCancelamento
                }
              >

                {cancelandoAgendamento
                  ? 'Cancelando...'
                  : 'Sim, cancelar'}

              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

export default AppAgendamento;