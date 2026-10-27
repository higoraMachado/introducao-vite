import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import './ControleFinanceiro.css';
import logoHope from '../../assets/logo-hope.png';

const API_URL = 'http://localhost:3333';

const CORES_GRAFICO = ['#d6ad50', '#b85b55', '#f0d78a', '#80601f'];

const moeda = (valor) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(Number(valor) || 0);

const moedaCompacta = (valor) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(valor) || 0);

// Formata uma data sem problemas de fuso horário.
function formatarData(data) {
  if (!data) return '';

  const texto = String(data);

  if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
    const [ano, mes, dia] = texto.slice(0, 10).split('-');
    return `${dia}/${mes}/${ano}`;
  }

  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return '';
  }

  return dataConvertida.toLocaleDateString('pt-BR');
}

// Mantém o formato YYYY-MM-DD usando a data local.
function dataLocalISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function obterIntervalo(periodo) {
  const hoje = new Date();

  const inicio = new Date(
    hoje.getFullYear(),
    hoje.getMonth() - Number(periodo) + 1,
    1
  );

  return {
    inicio: dataLocalISO(inicio),
    fim: dataLocalISO(hoje),
  };
}

function normalizarTipo(tipo) {
  const valor = String(tipo || '').trim().toLowerCase();

  if (valor === 'entrada') {
    return 'Entrada';
  }

  if (valor === 'saida' || valor === 'saída') {
    return 'Saída';
  }

  return tipo || 'Não identificado';
}

function TooltipFinanceiro({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="financeiro-tooltip">
      <strong>{label}</strong>

      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {moeda(item.value)}
        </p>
      ))}
    </div>
  );
}

function ControleFinanceiro() {
  const [periodo, setPeriodo] = useState('6');
  const [filtroTipo, setFiltroTipo] = useState('Todos');

  const [resumo, setResumo] = useState({
    receitas: 0,
    despesas: 0,
    lucro: 0,
  });

  const [movimentacoes, setMovimentacoes] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const intervalo = useMemo(
    () => obterIntervalo(periodo),
    [periodo]
  );

  // Busca os dados financeiros reais na API.
  useEffect(() => {
    let ativo = true;

    async function carregarDadosFinanceiros() {
      setCarregando(true);
      setErro('');

      try {
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error(
            'Sua sessão não foi encontrada. Entre novamente no sistema.'
          );
        }

        const parametros = new URLSearchParams({
          inicio: intervalo.inicio,
          fim: intervalo.fim,
        });

        const cabecalhos = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const [respostaResumo, respostaMovimentacoes] =
          await Promise.all([
            fetch(
              `${API_URL}/financeiro/resumo?${parametros.toString()}`,
              {
                method: 'GET',
                headers: cabecalhos,
              }
            ),
            fetch(`${API_URL}/financeiro/movimentacoes`, {
              method: 'GET',
              headers: cabecalhos,
            }),
          ]);

        const dadosResumo = await respostaResumo.json();
        const dadosMovimentacoes =
          await respostaMovimentacoes.json();

        if (!respostaResumo.ok) {
          throw new Error(
            dadosResumo.mensagem ||
              'Não foi possível carregar o resumo financeiro.'
          );
        }

        if (!respostaMovimentacoes.ok) {
          throw new Error(
            dadosMovimentacoes.mensagem ||
              'Não foi possível carregar as movimentações.'
          );
        }

        const resumoRecebido =
          dadosResumo.dados || dadosResumo;

        const movimentacoesRecebidas =
          dadosMovimentacoes.dados || dadosMovimentacoes;

        if (!Array.isArray(movimentacoesRecebidas)) {
          throw new Error(
            'A API retornou as movimentações em um formato inesperado.'
          );
        }

        const receitas = Number(
          resumoRecebido.faturamento ??
            resumoRecebido.receitas ??
            0
        );

        const despesas = Number(
          resumoRecebido.despesas ?? 0
        );

        const lucro = Number(
          resumoRecebido.lucro ??
            resumoRecebido.resultado ??
            receitas - despesas
        );

        const movimentacoesFormatadas =
          movimentacoesRecebidas.map((item, index) => {
            const tipo = normalizarTipo(item.tipo);

            return {
              id:
                item.id ??
                item.venda_id ??
                item.despesa_id ??
                `${item.data}-${item.descricao}-${index}`,
              dataOriginal: item.data || '',
              data: formatarData(item.data),
              descricao: item.descricao || 'Movimentação financeira',
              categoria:
                item.categoria ||
                (tipo === 'Entrada' ? 'Vendas' : 'Despesas'),
              tipo,
              valor: Number(item.valor) || 0,
            };
          });

        if (!ativo) return;

        setResumo({
          receitas,
          despesas,
          lucro,
        });

        setMovimentacoes(movimentacoesFormatadas);
      } catch (error) {
        if (!ativo) return;

        console.error(
          'Erro ao carregar controle financeiro:',
          error
        );

        setErro(
          error.message ||
            'Ocorreu um erro ao carregar os dados financeiros.'
        );
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDadosFinanceiros();

    return () => {
      ativo = false;
    };
  }, [intervalo]);

  // Filtra as movimentações pelo período selecionado.
  const movimentacoesPeriodo = useMemo(() => {
    return movimentacoes.filter((item) => {
      if (!item.dataOriginal) return false;

      const data = String(item.dataOriginal).slice(0, 10);

      return (
        data >= intervalo.inicio &&
        data <= intervalo.fim
      );
    });
  }, [movimentacoes, intervalo]);

  // Aplica o filtro de entrada ou saída.
  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoesPeriodo.filter((item) => {
      return (
        filtroTipo === 'Todos' ||
        item.tipo === filtroTipo
      );
    });
  }, [movimentacoesPeriodo, filtroTipo]);

  // Monta o gráfico mensal usando as movimentações da API.
  const historicoFinanceiro = useMemo(() => {
    const meses = [];
    const hoje = new Date();

    for (let i = Number(periodo) - 1; i >= 0; i--) {
      const dataMes = new Date(
        hoje.getFullYear(),
        hoje.getMonth() - i,
        1
      );

      const ano = dataMes.getFullYear();
      const mesNumero = String(
        dataMes.getMonth() + 1
      ).padStart(2, '0');

      const chave = `${ano}-${mesNumero}`;

      const nomeMes = dataMes
        .toLocaleDateString('pt-BR', { month: 'short' })
        .replace('.', '');

      meses.push({
        chave,
        mes: nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1),
        receitas: 0,
        despesas: 0,
      });
    }

    movimentacoesPeriodo.forEach((item) => {
      const data = String(item.dataOriginal).slice(0, 10);
      const chave = data.slice(0, 7);

      const mesEncontrado = meses.find(
        (mes) => mes.chave === chave
      );

      if (!mesEncontrado) return;

      if (item.tipo === 'Entrada') {
        mesEncontrado.receitas += item.valor;
      } else if (item.tipo === 'Saída') {
        mesEncontrado.despesas += item.valor;
      }
    });

    return meses;
  }, [movimentacoesPeriodo, periodo]);

  // Calcula uma projeção baseada na média dos meses disponíveis.
  const projecao = useMemo(() => {
    const mesesComDados = historicoFinanceiro.filter(
      (item) => item.receitas > 0 || item.despesas > 0
    );

    const recentes = mesesComDados.slice(-3);

    if (recentes.length === 0) {
      return {
        receita: 0,
        despesa: 0,
        lucro: 0,
      };
    }

    const totalReceitas = recentes.reduce(
      (total, item) => total + item.receitas,
      0
    );

    const totalDespesas = recentes.reduce(
      (total, item) => total + item.despesas,
      0
    );

    const mediaReceita = totalReceitas / recentes.length;
    const mediaDespesa = totalDespesas / recentes.length;

    return {
      receita: mediaReceita,
      despesa: mediaDespesa,
      lucro: mediaReceita - mediaDespesa,
    };
  }, [historicoFinanceiro]);

  const dadosProjecao = useMemo(() => {
    const realizados = historicoFinanceiro.slice(-4).map(
      (item) => ({
        mes: item.mes,
        realizado: item.receitas,
        projetado: null,
      })
    );

    const hoje = new Date();

    const proximoMes = new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 1,
      1
    );

    const mesSeguinte = new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 2,
      1
    );

    const nomeProximoMes = proximoMes.toLocaleDateString(
      'pt-BR',
      { month: 'short' }
    );

    const nomeMesSeguinte = mesSeguinte.toLocaleDateString(
      'pt-BR',
      { month: 'short' }
    );

    return [
      ...realizados,
      {
        mes: `${nomeProximoMes.replace('.', '')}*`,
        realizado: null,
        projetado: Math.round(projecao.receita),
      },
      {
        mes: `${nomeMesSeguinte.replace('.', '')}*`,
        realizado: null,
        projetado: Math.round(projecao.receita * 1.03),
      },
    ];
  }, [historicoFinanceiro, projecao]);

  // Distribuição real entre receitas e despesas do período.
  const distribuicaoReceitas = useMemo(() => {
    const total = resumo.receitas + resumo.despesas;

    if (total <= 0) {
      return [
        { name: 'Receitas', value: 0 },
        { name: 'Despesas', value: 0 },
      ];
    }

    return [
      {
        name: 'Receitas',
        value: Number(
          ((resumo.receitas / total) * 100).toFixed(1)
        ),
      },
      {
        name: 'Despesas',
        value: Number(
          ((resumo.despesas / total) * 100).toFixed(1)
        ),
      },
    ];
  }, [resumo]);

  const metaMensal = 12000;

  const mesAtual = historicoFinanceiro.length
    ? historicoFinanceiro[historicoFinanceiro.length - 1]
    : { receitas: 0 };

  const progressoMeta = Math.min(
    (mesAtual.receitas / metaMensal) * 100,
    100
  );

  return (
    <main className="financeiro-page">
      <header className="financeiro-header">
        <div className="financeiro-logo-wrap">
          <img
            src={logoHope}
            alt="Hope Barbearia"
            className="financeiro-logo"
          />
        </div>

        <div className="financeiro-title-wrap">
          <span className="financeiro-eyebrow">
            GESTÃO DO NEGÓCIO
          </span>

          <h1>Controle financeiro</h1>

          <p>
            Acompanhe resultados, despesas e previsões da Hope
            Barbearia.
          </p>
        </div>

        <div className="financeiro-user">
          <div className="financeiro-avatar">A</div>

          <div className="financeiro-user-info">
            <strong>Administrador</strong>
            <span>Painel financeiro</span>
          </div>
        </div>
      </header>

      <section className="financeiro-content">
        <div className="financeiro-toolbar">
          <div>
            <h2>Visão geral</h2>

            <p>
              Dados financeiros registrados no banco de dados.
            </p>
          </div>

          <label className="financeiro-periodo">
            Período

            <select
              value={periodo}
              onChange={(event) => setPeriodo(event.target.value)}
            >
              <option value="3">Últimos 3 meses</option>
              <option value="6">Últimos 6 meses</option>
            </select>
          </label>
        </div>

        {carregando && (
          <div className="financeiro-aviso">
            Carregando informações financeiras...
          </div>
        )}

        {erro && (
          <div className="financeiro-erro">
            <strong>Não foi possível carregar os dados.</strong>
            <p>{erro}</p>
            <p>
              Confira se a API está rodando e se sua sessão continua
              válida.
            </p>
          </div>
        )}

        <div className="financeiro-summary">
          <article className="financeiro-card financeiro-card-positivo">
            <div className="financeiro-card-topo">
              <span className="financeiro-card-icon">↗</span>

              <span className="financeiro-card-label">
                Receitas no período
              </span>
            </div>

            <strong>{moeda(resumo.receitas)}</strong>

            <small>
              Entradas registradas no período selecionado
            </small>
          </article>

          <article className="financeiro-card financeiro-card-negativo">
            <div className="financeiro-card-topo">
              <span className="financeiro-card-icon">↘</span>

              <span className="financeiro-card-label">
                Despesas no período
              </span>
            </div>

            <strong>{moeda(resumo.despesas)}</strong>

            <small>
              Saídas registradas no período selecionado
            </small>
          </article>

          <article className="financeiro-card financeiro-card-lucro">
            <div className="financeiro-card-topo">
              <span className="financeiro-card-icon">✦</span>

              <span className="financeiro-card-label">
                Resultado do período
              </span>
            </div>

            <strong>{moeda(resumo.lucro)}</strong>

            <small>
              Receitas menos despesas registradas
            </small>
          </article>
        </div>

        <div className="financeiro-graficos-grid">
          <section className="financeiro-panel financeiro-panel-grande">
            <div className="financeiro-panel-header">
              <div>
                <span className="financeiro-section-kicker">
                  DESEMPENHO
                </span>

                <h3>Receitas x despesas</h3>

                <p>Comparativo mensal em reais</p>
              </div>

              <span className="financeiro-badge">Mensal</span>
            </div>

            <div className="financeiro-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={historicoFinanceiro}
                  margin={{
                    top: 12,
                    right: 8,
                    left: 4,
                    bottom: 4,
                  }}
                  barGap={8}
                >
                  <CartesianGrid
                    stroke="#292929"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="mes"
                    tick={{ fill: '#b8b8b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tickFormatter={moedaCompacta}
                    tick={{ fill: '#b8b8b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                  />

                  <Tooltip
                    content={<TooltipFinanceiro />}
                    cursor={{
                      fill: 'rgba(214,173,80,0.08)',
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      color: '#e8e8e8',
                      fontSize: 12,
                    }}
                  />

                  <Bar
                    dataKey="receitas"
                    name="Receitas"
                    fill="#d6ad50"
                    radius={[5, 5, 0, 0]}
                  />

                  <Bar
                    dataKey="despesas"
                    name="Despesas"
                    fill="#b85b55"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="financeiro-panel">
            <div className="financeiro-panel-header">
              <div>
                <span className="financeiro-section-kicker">
                  DISTRIBUIÇÃO
                </span>

                <h3>Receitas e despesas</h3>

                <p>Participação nos valores do período</p>
              </div>
            </div>

            <div className="financeiro-chart financeiro-chart-donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribuicaoReceitas}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={91}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {distribuicaoReceitas.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={
                          CORES_GRAFICO[
                            index % CORES_GRAFICO.length
                          ]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => [
                      `${value}%`,
                      'Participação',
                    ]}
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={34}
                    wrapperStyle={{
                      color: '#d4d4d4',
                      fontSize: 11,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="financeiro-panel financeiro-panel-grande">
            <div className="financeiro-panel-header">
              <div>
                <span className="financeiro-section-kicker">
                  PLANEJAMENTO
                </span>

                <h3>Projeção de faturamento</h3>

                <p>
                  Estimativa baseada na média dos últimos meses com
                  movimentações
                </p>
              </div>

              <span className="financeiro-badge financeiro-badge-projecao">
                Previsão
              </span>
            </div>

            <div className="financeiro-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dadosProjecao}
                  margin={{
                    top: 12,
                    right: 10,
                    left: 4,
                    bottom: 4,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="corRealizado"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#d6ad50"
                        stopOpacity={0.35}
                      />

                      <stop
                        offset="95%"
                        stopColor="#d6ad50"
                        stopOpacity={0}
                      />
                    </linearGradient>

                    <linearGradient
                      id="corProjetado"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8f8f8f"
                        stopOpacity={0.28}
                      />

                      <stop
                        offset="95%"
                        stopColor="#8f8f8f"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#292929"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="mes"
                    tick={{ fill: '#b8b8b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tickFormatter={moedaCompacta}
                    tick={{ fill: '#b8b8b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                  />

                  <Tooltip content={<TooltipFinanceiro />} />

                  <Legend
                    wrapperStyle={{
                      color: '#e8e8e8',
                      fontSize: 12,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="realizado"
                    name="Realizado"
                    stroke="#d6ad50"
                    strokeWidth={3}
                    fill="url(#corRealizado)"
                    connectNulls={false}
                  />

                  <Area
                    type="monotone"
                    dataKey="projetado"
                    name="Projetado*"
                    stroke="#a6a6a6"
                    strokeWidth={3}
                    strokeDasharray="6 5"
                    fill="url(#corProjetado)"
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="financeiro-nota">
              *A projeção é uma estimativa baseada nos dados
              disponíveis, não uma garantia de faturamento.
            </p>
          </section>

          <section className="financeiro-panel financeiro-meta-panel">
            <div className="financeiro-panel-header">
              <div>
                <span className="financeiro-section-kicker">
                  OBJETIVO DO MÊS
                </span>

                <h3>Meta de faturamento</h3>

                <p>Meta configurada de {moeda(metaMensal)}</p>
              </div>
            </div>

            <div className="financeiro-meta-valor">
              <strong>{moeda(mesAtual.receitas)}</strong>

              <span>de {moeda(metaMensal)}</span>
            </div>

            <div className="financeiro-progress-track">
              <div
                className="financeiro-progress-fill"
                style={{
                  width: `${progressoMeta}%`,
                }}
              />
            </div>

            <div className="financeiro-meta-footer">
              <span>{progressoMeta.toFixed(0)}% atingido</span>

              <span>
                Faltam{' '}
                {moeda(
                  Math.max(metaMensal - mesAtual.receitas, 0)
                )}
              </span>
            </div>

            <div className="financeiro-projecao-mini">
              <span>Lucro mensal projetado</span>

              <strong>{moeda(projecao.lucro)}</strong>
            </div>
          </section>
        </div>

        <section className="financeiro-panel financeiro-table-panel">
          <div className="financeiro-panel-header financeiro-table-heading">
            <div>
              <span className="financeiro-section-kicker">
                MOVIMENTAÇÃO RECENTE
              </span>

              <h3>Últimos lançamentos</h3>

              <p>
                Vendas e despesas registradas no banco de dados
              </p>
            </div>

            <label className="financeiro-periodo financeiro-filtro-tipo">
              Tipo

              <select
                value={filtroTipo}
                onChange={(event) =>
                  setFiltroTipo(event.target.value)
                }
              >
                <option value="Todos">Todos</option>
                <option value="Entrada">Entrada</option>
                <option value="Saída">Saída</option>
              </select>
            </label>
          </div>

          <div className="financeiro-table-wrap">
            <table className="financeiro-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                </tr>
              </thead>

              <tbody>
                {movimentacoesFiltradas.map((movimentacao) => (
                  <tr key={movimentacao.id}>
                    <td>{movimentacao.data || '—'}</td>

                    <td className="financeiro-descricao">
                      {movimentacao.descricao}
                    </td>

                    <td>{movimentacao.categoria}</td>

                    <td>
                      <span
                        className={`tipo-movimentacao ${
                          movimentacao.tipo === 'Entrada'
                            ? 'tipo-entrada'
                            : 'tipo-saida'
                        }`}
                      >
                        {movimentacao.tipo}
                      </span>
                    </td>

                    <td
                      className={
                        movimentacao.tipo === 'Entrada'
                          ? 'valor-entrada'
                          : 'valor-saida'
                      }
                    >
                      {movimentacao.tipo === 'Saída' ? '− ' : '+ '}
                      {moeda(movimentacao.valor)}
                    </td>
                  </tr>
                ))}

                {!carregando &&
                  !erro &&
                  movimentacoesFiltradas.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="financeiro-sem-dados"
                      >
                        Nenhuma movimentação encontrada para esse
                        período e filtro.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

export default ControleFinanceiro;