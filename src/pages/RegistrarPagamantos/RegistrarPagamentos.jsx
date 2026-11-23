
import { useEffect, useState } from 'react';
import './RegistrarPagamentos.css';
import logoHope from '../../assets/logo-hope.png';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3333';

const formasPagamento = [
  'Dinheiro',
  'PIX',
  'Cartão de débito',
  'Cartão de crédito',
];

const novoFormulario = () => ({
  agendamento_id: '',
  cliente: '',
  servico: '',
  data: new Date().toLocaleDateString('en-CA'),
  valor: '',
  formaPagamento: 'Dinheiro',
  parcelas: '1',
  observacao: '',
});

function formatarData(data) {
  if (!data) return '-';

  const valor = String(data).slice(0, 10);
  const [ano, mes, dia] = valor.split('-');

  return `${dia}/${mes}/${ano.slice(2)}`;
}

function formatarValor(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function RegistrarPagamentos() {
  const [form, setForm] = useState(novoFormulario);
  const [pagamentos, setPagamentos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroForma, setFiltroForma] = useState('Todas');
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  async function carregarDados() {
    try {
      setCarregando(true);

      const [resPagamentos, resAgendamentos] = await Promise.all([
        fetch(`${API_URL}/pagamentos`, { headers }),
        fetch(`${API_URL}/agendamentos`, { headers }),
      ]);

      const dadosPagamentos = await resPagamentos.json();
      const dadosAgendamentos = await resAgendamentos.json();

      if (!resPagamentos.ok) {
        throw new Error(dadosPagamentos.message || 'Erro ao buscar pagamentos.');
      }

      if (!resAgendamentos.ok) {
        throw new Error(dadosAgendamentos.message || 'Erro ao buscar agendamentos.');
      }

      setPagamentos(Array.isArray(dadosPagamentos.dados)
        ? dadosPagamentos.dados
        : []);

      setAgendamentos(Array.isArray(dadosAgendamentos.dados)
        ? dadosAgendamentos.dados
        : []);

    } catch (erro) {
      console.error(erro);
      alert(erro.message || 'Não foi possível carregar os dados.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setForm(atual => ({
      ...atual,
      [name]: value,
    }));
  }

  function selecionarAgendamento(event) {
    const id = event.target.value;

    const agendamento = agendamentos.find(
      item => String(item.agendamento_id) === id
    );

    if (!agendamento) {
      setForm(novoFormulario());
      return;
    }

    setForm(atual => ({
      ...atual,
      agendamento_id: id,
      cliente: agendamento.usuario_nome || '',
      servico: agendamento.servico_nome || '',
      valor: agendamento.servico_preco ?? '',
      data: new Date().toLocaleDateString('en-CA'),
      formaPagamento: agendamento.agendamento_forma_pagamento || 'Dinheiro',
    }));
  }

  function selecionarForma(forma) {
    setForm(atual => ({
      ...atual,
      formaPagamento: forma,
      parcelas: forma === 'Cartão de crédito' ? atual.parcelas : '1',
    }));
  }

  function limparFormulario() {
    setForm(novoFormulario());
  }

  async function registrarPagamento(event) {
    event.preventDefault();

    if (!form.agendamento_id || !form.valor) {
      alert('Selecione um agendamento e informe o valor.');
      return;
    }

    const valor = Number(form.valor);

    if (!Number.isFinite(valor) || valor <= 0) {
      alert('Informe um valor válido.');
      return;
    }

    const dados = {
      agendamento_id: Number(form.agendamento_id),
      pagamento_valor: valor,
      pagamento_desconto: 0,
      pagamento_vl_pago: valor,
      pagamento_data: new Date().toISOString().slice(0, 19).replace('T', ' '),
      pagamento_forma_pagamento: form.formaPagamento,
    };

    try {
      setSalvando(true);

      const resposta = await fetch(`${API_URL}/pagamentos`, {
        method: 'POST',
        headers,
        body: JSON.stringify(dados),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(resultado.message || 'Erro ao registrar pagamento.');
      }

      alert('Pagamento registrado com sucesso!');

      limparFormulario();
      await carregarDados();

    } catch (erro) {
      console.error(erro);
      alert(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluirPagamento(id) {
    if (!window.confirm('Deseja realmente excluir este pagamento?')) {
      return;
    }

    try {
      const resposta = await fetch(`${API_URL}/pagamentos/${id}`, {
        method: 'DELETE',
        headers,
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(resultado.message || 'Erro ao excluir pagamento.');
      }

      alert('Pagamento excluído com sucesso!');
      await carregarDados();

    } catch (erro) {
      console.error(erro);
      alert(erro.message);
    }
  }

  const idsPagos = new Set(
    pagamentos.map(item => Number(item.agendamento_id))
  );

  const agendamentosDisponiveis = agendamentos.filter(item =>
    !idsPagos.has(Number(item.agendamento_id))
  );

  const pagamentosFiltrados = pagamentos.filter(pagamento => {
    const cliente = pagamento.cliente || '';

    const forma = pagamento.agendamento_forma_pagamento || '';

    return (
      cliente.toLowerCase().includes(busca.toLowerCase()) &&
      (filtroForma === 'Todas' || forma === filtroForma)
    );
  });

  const totalRecebido = pagamentos.reduce(
    (total, item) => total + Number(item.pagamento_vl_pago || 0),
    0
  );

  const hoje = new Date().toLocaleDateString('en-CA');

  const pagamentosHoje = pagamentos.filter(item =>
    String(item.pagamento_data).slice(0, 10) === hoje
  );

  const totalHoje = pagamentosHoje.reduce(
    (total, item) => total + Number(item.pagamento_vl_pago || 0),
    0
  );

  return (
    <main className="registrar-pagamento-page">
      <header className="registrar-pagamento-header">
        <div className="header-logo">
          <img src={logoHope} alt="Hope Barbearia" />
        </div>

        <div className="header-title">
          <h1>Financeiro</h1>
          <p>Hope Barbearia</p>
        </div>

        <div className="header-user">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <strong>Administrador</strong>
            <span>Financeiro</span>
          </div>
        </div>
      </header>

      <section className="registrar-pagamento-content">
        <div className="page-heading">
          <span className="heading-label">FINANCEIRO</span>
          <h2>Registrar pagamento</h2>
          <p>Cadastre os recebimentos e acompanhe o histórico financeiro da barbearia.</p>
        </div>

        <div className="pagamento-resumo-cards">
          <div className="resumo-card">
            <div className="resumo-icone">R$</div>
            <div>
              <span>Total recebido</span>
              <strong>{formatarValor(totalRecebido)}</strong>
            </div>
          </div>

          <div className="resumo-card">
            <div className="resumo-icone">$</div>
            <div>
              <span>Recebido hoje</span>
              <strong>{formatarValor(totalHoje)}</strong>
            </div>
          </div>

          <div className="resumo-card">
            <div className="resumo-icone">✓</div>
            <div>
              <span>Pagamentos registrados</span>
              <strong>{pagamentos.length}</strong>
            </div>
          </div>
        </div>

        <div className="pagamento-layout">
          <form className="pagamento-form" onSubmit={registrarPagamento}>
            <div className="form-header">
              <span>REGISTRO</span>
              <h3>Novo recebimento</h3>
              <p>Selecione um agendamento existente para registrar o pagamento.</p>
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="agendamento_id">Agendamento</label>

                <select
                  id="agendamento_id"
                  value={form.agendamento_id}
                  onChange={selecionarAgendamento}
                  required
                >
                  <option value="">Selecione um agendamento</option>

                  {agendamentosDisponiveis.map(item => (
                    <option
                      key={item.agendamento_id}
                      value={item.agendamento_id}
                    >
                      #{item.agendamento_id} - {item.usuario_nome}
                      {' - '}
                      {item.servico_nome}
                      {' - '}
                      {formatarData(item.agendamento_dt_hr_inicio)}
                    </option>
                  ))}
                </select>

                {!agendamentosDisponiveis.length && (
                  <small>Não existem agendamentos disponíveis para pagamento.</small>
                )}
              </div>

              <div className="form-group">
                <label>Cliente</label>
                <input value={form.cliente} readOnly placeholder="Selecione o agendamento" />
              </div>

              <div className="form-group">
                <label>Serviço</label>
                <input value={form.servico} readOnly placeholder="Selecione o agendamento" />
              </div>

              <div className="form-group">
                <label htmlFor="valor">Valor</label>
                <div className="input-valor">
                  <span>R$</span>
                  <input
                    id="valor"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.valor}
                    onChange={event => setForm(atual => ({
                      ...atual,
                      valor: event.target.value,
                    }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Data</label>
                <input value={form.data} readOnly />
              </div>

              <div className="form-group full-width">
                <label>Forma de pagamento</label>

                <div className="formas-pagamento">
                  {formasPagamento.map(forma => (
                    <button
                      key={forma}
                      type="button"
                      className={
                        form.formaPagamento === forma
                          ? 'forma-pagamento selecionada'
                          : 'forma-pagamento'
                      }
                      onClick={() => selecionarForma(forma)}
                    >
                      <span className="forma-icone">
                        {forma === 'Dinheiro' && 'R$'}
                        {forma === 'PIX' && '✦'}
                        {forma === 'Cartão de débito' && '▣'}
                        {forma === 'Cartão de crédito' && '▤'}
                      </span>
                      <span>{forma}</span>
                    </button>
                  ))}
                </div>
              </div>

              {form.formaPagamento === 'Cartão de crédito' && (
                <div className="parcelamento-box full-width">
                  <div className="parcelamento-texto">
                    <span>PARCELAMENTO</span>
                    <strong>Número de parcelas</strong>
                    <p>Escolha em quantas vezes o pagamento será dividido.</p>
                  </div>

                  <select
                    value={form.parcelas}
                    onChange={event => setForm(atual => ({
                      ...atual,
                      parcelas: event.target.value,
                    }))}
                  >
                    {[1, 2, 3, 4, 5, 6, 10, 12].map(n => (
                      <option key={n} value={n}>{n}x</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group full-width">
                <label htmlFor="observacao">Observações</label>
                <textarea
                  id="observacao"
                  value={form.observacao}
                  onChange={event => setForm(atual => ({
                    ...atual,
                    observacao: event.target.value,
                  }))}
                  placeholder="Adicione alguma observação..."
                  rows="4"
                />
                <small>
                  As observações e parcelas ainda não são armazenadas no banco atual.
                </small>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={limparFormulario}
                disabled={salvando}
              >
                Limpar
              </button>

              <button
                type="submit"
                className="btn-primary"
                disabled={salvando || carregando || !form.agendamento_id}
              >
                {salvando ? 'Registrando...' : 'Registrar pagamento'}
              </button>
            </div>
          </form>

          <aside className="pagamento-lateral">
            <div className="resumo-pagamento">
              <div className="resumo-pagamento-header">
                <span>RESUMO</span>
                <h3>Pagamento</h3>
              </div>

              <div className="resumo-pagamento-content">
                <div className="resumo-linha">
                  <span>Cliente</span>
                  <strong>{form.cliente || 'Não informado'}</strong>
                </div>

                <div className="resumo-linha">
                  <span>Serviço</span>
                  <strong>{form.servico || 'Não informado'}</strong>
                </div>

                <div className="resumo-linha">
                  <span>Forma</span>
                  <strong>{form.formaPagamento}</strong>
                </div>

                <div className="resumo-valor">
                  <span>Valor total</span>
                  <strong>{formatarValor(form.valor)}</strong>
                </div>
              </div>
            </div>

            <div className="informacao-card">
              <span>INFORMAÇÃO</span>
              <p>
                Os pagamentos registrados ficam disponíveis no histórico financeiro da barbearia.
              </p>
            </div>
          </aside>
        </div>

        <section className="historico-pagamentos">
          <div className="historico-header">
            <div>
              <span className="heading-label">MOVIMENTAÇÕES</span>
              <h2>Histórico de pagamentos</h2>
              <p>Consulte os recebimentos registrados na barbearia.</p>
            </div>
          </div>

          <div className="historico-filtros">
            <div className="busca-container">
              <span className="busca-icone">⌕</span>
              <input
                type="text"
                placeholder="Buscar por cliente..."
                value={busca}
                onChange={event => setBusca(event.target.value)}
              />
            </div>

            <select
              value={filtroForma}
              onChange={event => setFiltroForma(event.target.value)}
            >
              <option value="Todas">Todas as formas</option>
              {formasPagamento.map(forma => (
                <option key={forma} value={forma}>{forma}</option>
              ))}
            </select>
          </div>

          <div className="historico-tabela-container">
            {carregando ? (
              <p>Carregando pagamentos...</p>
            ) : pagamentosFiltrados.length > 0 ? (
              <table className="historico-tabela">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Serviço</th>
                    <th>Data</th>
                    <th>Pagamento</th>
                    <th>Valor</th>
                    <th>Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {pagamentosFiltrados.map(pagamento => {
                    const forma =
                      pagamento.agendamento_forma_pagamento || '-';

                    return (
                      <tr key={pagamento.pagamento_id}>
                        <td>
                          <div className="cliente-tabela">
                            <div className="cliente-avatar">
                              {(pagamento.cliente || '?').charAt(0).toUpperCase()}
                            </div>
                            <strong>{pagamento.cliente}</strong>
                          </div>
                        </td>

                        <td>{pagamento.servico}</td>
                        <td>{formatarData(pagamento.pagamento_data)}</td>
                        <td>
                          <span className="forma-tag">
                            {forma}
                          </span>
                        </td>
                        <td>
                          <strong className="valor-tabela">
                            {formatarValor(pagamento.pagamento_vl_pago)}
                          </strong>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-excluir"
                            onClick={() => excluirPagamento(pagamento.pagamento_id)}
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="historico-vazio">
                <div className="historico-vazio-icone">—</div>
                <strong>Nenhum pagamento encontrado</strong>
                <p>Tente alterar os filtros ou registrar um novo pagamento.</p>
              </div>
            )}
          </div>

          <div className="historico-footer">
            <span>
              {pagamentosFiltrados.length} pagamento(s) encontrado(s)
            </span>
            <strong>
              Total exibido:{' '}
              {formatarValor(
                pagamentosFiltrados.reduce(
                  (total, item) => total + Number(item.pagamento_vl_pago || 0),
                  0
                )
              )}
            </strong>
          </div>
        </section>
      </section>
    </main>
  );
}

export default RegistrarPagamentos;
