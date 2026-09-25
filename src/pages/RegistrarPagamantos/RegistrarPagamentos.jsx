import { useState } from 'react';
import './RegistrarPagamentos.css';
import logoHope from '../../assets/logo-hope.png';

const formasPagamento = [
  'Dinheiro',
  'PIX',
  'Cartão de débito',
  'Cartão de crédito',
];

const pagamentosIniciais = [
  {
    id: 1,
    cliente: 'João Silva',
    servico: 'Corte de cabelo',
    data: '2026-09-24',
    valor: 45,
    formaPagamento: 'PIX',
    parcelas: '1',
    observacao: '',
  },
  {
    id: 2,
    cliente: 'Maria Souza',
    servico: 'Corte + Barba',
    data: '2026-09-24',
    valor: 70,
    formaPagamento: 'Cartão de crédito',
    parcelas: '2',
    observacao: '',
  },
  {
    id: 3,
    cliente: 'Carlos Lima',
    servico: 'Barba',
    data: '2026-09-23',
    valor: 35,
    formaPagamento: 'Dinheiro',
    parcelas: '1',
    observacao: '',
  },
];

function formatarData(data) {
  if (!data) return '-';

  const [ano, mes, dia] = data.split('-');

  return `${dia}/${mes}/${ano.slice(2)}`;
}

function formatarValor(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function RegistrarPagamentos() {
  const [form, setForm] = useState({
    cliente: '',
    servico: '',
    data: new Date().toISOString().slice(0, 10),
    valor: '',
    formaPagamento: 'Dinheiro',
    parcelas: '1',
    observacao: '',
  });

  const [pagamentos, setPagamentos] = useState(
    pagamentosIniciais
  );

  const [busca, setBusca] = useState('');

  const [filtroForma, setFiltroForma] = useState('Todas');

  function alterarCampo(event) {
    const { name, value } = event.target;

    setForm((estadoAtual) => ({
      ...estadoAtual,
      [name]: value,
    }));
  }

  function selecionarForma(forma) {
    setForm((estadoAtual) => ({
      ...estadoAtual,
      formaPagamento: forma,
      parcelas:
        forma === 'Cartão de crédito'
          ? estadoAtual.parcelas
          : '1',
    }));
  }

  function limparFormulario() {
    setForm({
      cliente: '',
      servico: '',
      data: new Date().toISOString().slice(0, 10),
      valor: '',
      formaPagamento: 'Dinheiro',
      parcelas: '1',
      observacao: '',
    });
  }

  function registrarPagamento(event) {
    event.preventDefault();

    if (
      !form.cliente ||
      !form.servico ||
      !form.valor ||
      !form.data
    ) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const novoPagamento = {
      id: Date.now(),
      cliente: form.cliente,
      servico: form.servico,
      data: form.data,
      valor: Number(form.valor),
      formaPagamento: form.formaPagamento,
      parcelas: form.parcelas,
      observacao: form.observacao,
    };

    setPagamentos((listaAtual) => [
      novoPagamento,
      ...listaAtual,
    ]);

    alert('Pagamento registrado com sucesso!');

    limparFormulario();
  }

  function excluirPagamento(id) {
    const confirmar = window.confirm(
      'Deseja realmente excluir este pagamento?'
    );

    if (!confirmar) return;

    setPagamentos((listaAtual) =>
      listaAtual.filter(
        (pagamento) => pagamento.id !== id
      )
    );
  }

  const pagamentosFiltrados = pagamentos.filter(
    (pagamento) => {
      const correspondeBusca =
        pagamento.cliente
          .toLowerCase()
          .includes(busca.toLowerCase());

      const correspondeForma =
        filtroForma === 'Todas' ||
        pagamento.formaPagamento === filtroForma;

      return correspondeBusca && correspondeForma;
    }
  );

  const totalRecebido = pagamentos.reduce(
    (total, pagamento) =>
      total + Number(pagamento.valor),
    0
  );

  const quantidadePagamentos = pagamentos.length;

  const pagamentosHoje = pagamentos.filter(
    (pagamento) =>
      pagamento.data ===
      new Date().toISOString().slice(0, 10)
  );

  const totalHoje = pagamentosHoje.reduce(
    (total, pagamento) =>
      total + Number(pagamento.valor),
    0
  );

  return (
    <main className="registrar-pagamento-page">

      {/* =========================================
          CABEÇALHO
      ========================================= */}

      <header className="registrar-pagamento-header">

        <div className="header-logo">
          <img
            src={logoHope}
            alt="Hope Barbearia"
          />
        </div>

        <div className="header-title">
          <h1>Financeiro</h1>
          <p>Hope Barbearia</p>
        </div>

        <div className="header-user">

          <div className="user-avatar">
            A
          </div>

          <div className="user-info">
            <strong>Administrador</strong>
            <span>Financeiro</span>
          </div>

        </div>

      </header>


      {/* =========================================
          CONTEÚDO
      ========================================= */}

      <section className="registrar-pagamento-content">

        {/* TÍTULO */}

        <div className="page-heading">

          <span className="heading-label">
            FINANCEIRO
          </span>

          <h2>
            Registrar pagamento
          </h2>

          <p>
            Cadastre os recebimentos e acompanhe
            o histórico financeiro da barbearia.
          </p>

        </div>


        {/* =========================================
            CARDS DE RESUMO
        ========================================= */}

        <div className="pagamento-resumo-cards">

          <div className="resumo-card">

            <div className="resumo-icone">
              R$
            </div>

            <div>
              <span>
                Total recebido
              </span>

              <strong>
                {formatarValor(totalRecebido)}
              </strong>
            </div>

          </div>


          <div className="resumo-card">

            <div className="resumo-icone">
              $
            </div>

            <div>
              <span>
                Recebido hoje
              </span>

              <strong>
                {formatarValor(totalHoje)}
              </strong>
            </div>

          </div>


          <div className="resumo-card">

            <div className="resumo-icone">
              ✓
            </div>

            <div>
              <span>
                Pagamentos registrados
              </span>

              <strong>
                {quantidadePagamentos}
              </strong>
            </div>

          </div>

        </div>


        {/* =========================================
            ÁREA PRINCIPAL
        ========================================= */}

        <div className="pagamento-layout">


          {/* =====================================
              FORMULÁRIO
          ===================================== */}

          <form
            className="pagamento-form"
            onSubmit={registrarPagamento}
          >

            <div className="form-header">

              <span>
                REGISTRO
              </span>

              <h3>
                Novo recebimento
              </h3>

              <p>
                Informe os dados do pagamento
                realizado pelo cliente.
              </p>

            </div>


            <div className="form-grid">


              {/* CLIENTE */}

              <div className="form-group">

                <label htmlFor="cliente">
                  Cliente
                </label>

                <input
                  id="cliente"
                  name="cliente"
                  type="text"
                  value={form.cliente}
                  onChange={alterarCampo}
                  placeholder="Nome do cliente"
                  required
                />

              </div>


              {/* SERVIÇO */}

              <div className="form-group">

                <label htmlFor="servico">
                  Serviço
                </label>

                <input
                  id="servico"
                  name="servico"
                  type="text"
                  value={form.servico}
                  onChange={alterarCampo}
                  placeholder="Ex: Corte de cabelo"
                  required
                />

              </div>


              {/* DATA */}

              <div className="form-group">

                <label htmlFor="data">
                  Data
                </label>

                <input
                  id="data"
                  name="data"
                  type="date"
                  value={form.data}
                  onChange={alterarCampo}
                  required
                />

              </div>


              {/* VALOR */}

              <div className="form-group">

                <label htmlFor="valor">
                  Valor
                </label>

                <div className="input-valor">

                  <span>
                    R$
                  </span>

                  <input
                    id="valor"
                    name="valor"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.valor}
                    onChange={alterarCampo}
                    placeholder="0,00"
                    required
                  />

                </div>

              </div>


              {/* FORMA DE PAGAMENTO */}

              <div className="form-group full-width">

                <label>
                  Forma de pagamento
                </label>

                <div className="formas-pagamento">

                  {formasPagamento.map((forma) => (

                    <button
                      key={forma}
                      type="button"
                      className={
                        form.formaPagamento === forma
                          ? 'forma-pagamento selecionada'
                          : 'forma-pagamento'
                      }
                      onClick={() =>
                        selecionarForma(forma)
                      }
                    >

                      <span className="forma-icone">

                        {forma === 'Dinheiro' && 'R$'}

                        {forma === 'PIX' && '✦'}

                        {forma === 'Cartão de débito' && '▣'}

                        {forma === 'Cartão de crédito' && '▤'}

                      </span>

                      <span>
                        {forma}
                      </span>

                    </button>

                  ))}

                </div>

              </div>


              {/* PARCELAMENTO */}

              {form.formaPagamento ===
                'Cartão de crédito' && (

                <div className="parcelamento-box full-width">

                  <div className="parcelamento-texto">

                    <span>
                      PARCELAMENTO
                    </span>

                    <strong>
                      Número de parcelas
                    </strong>

                    <p>
                      Escolha em quantas vezes
                      o pagamento será dividido.
                    </p>

                  </div>

                  <select
                    name="parcelas"
                    value={form.parcelas}
                    onChange={alterarCampo}
                  >

                    <option value="1">
                      1x
                    </option>

                    <option value="2">
                      2x
                    </option>

                    <option value="3">
                      3x
                    </option>

                    <option value="4">
                      4x
                    </option>

                    <option value="5">
                      5x
                    </option>

                    <option value="6">
                      6x
                    </option>

                    <option value="10">
                      10x
                    </option>

                    <option value="12">
                      12x
                    </option>

                  </select>

                </div>

              )}


              {/* OBSERVAÇÃO */}

              <div className="form-group full-width">

                <label htmlFor="observacao">
                  Observações
                </label>

                <textarea
                  id="observacao"
                  name="observacao"
                  value={form.observacao}
                  onChange={alterarCampo}
                  placeholder="Adicione alguma observação..."
                  rows="4"
                />

              </div>

            </div>


            {/* BOTÕES */}

            <div className="form-actions">

              <button
                type="button"
                className="btn-secondary"
                onClick={limparFormulario}
              >
                Limpar
              </button>

              <button
                type="submit"
                className="btn-primary"
              >
                Registrar pagamento
              </button>

            </div>

          </form>


          {/* =====================================
              RESUMO LATERAL
          ===================================== */}

          <aside className="pagamento-lateral">

            <div className="resumo-pagamento">

              <div className="resumo-pagamento-header">

                <span>
                  RESUMO
                </span>

                <h3>
                  Pagamento
                </h3>

              </div>


              <div className="resumo-pagamento-content">

                <div className="resumo-linha">

                  <span>
                    Cliente
                  </span>

                  <strong>
                    {form.cliente ||
                      'Não informado'}
                  </strong>

                </div>


                <div className="resumo-linha">

                  <span>
                    Serviço
                  </span>

                  <strong>
                    {form.servico ||
                      'Não informado'}
                  </strong>

                </div>


                <div className="resumo-linha">

                  <span>
                    Forma
                  </span>

                  <strong>
                    {form.formaPagamento}
                  </strong>

                </div>


                {form.formaPagamento ===
                  'Cartão de crédito' && (

                  <div className="resumo-linha">

                    <span>
                      Parcelamento
                    </span>

                    <strong>
                      {form.parcelas}x
                    </strong>

                  </div>

                )}


                <div className="resumo-valor">

                  <span>
                    Valor total
                  </span>

                  <strong>
                    {form.valor
                      ? formatarValor(form.valor)
                      : 'R$ 0,00'}
                  </strong>

                </div>

              </div>

            </div>


            <div className="informacao-card">

              <span>
                INFORMAÇÃO
              </span>

              <p>
                Os pagamentos registrados ficam
                disponíveis no histórico financeiro
                da barbearia.
              </p>

            </div>

          </aside>

        </div>


        {/* =========================================
            HISTÓRICO
        ========================================= */}

        <section className="historico-pagamentos">

          <div className="historico-header">

            <div>

              <span className="heading-label">
                MOVIMENTAÇÕES
              </span>

              <h2>
                Histórico de pagamentos
              </h2>

              <p>
                Consulte os recebimentos registrados
                na barbearia.
              </p>

            </div>

          </div>


          {/* FILTROS */}

          <div className="historico-filtros">

            <div className="busca-container">

              <span className="busca-icone">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Buscar por cliente..."
                value={busca}
                onChange={(event) =>
                  setBusca(event.target.value)
                }
              />

            </div>


            <select
              value={filtroForma}
              onChange={(event) =>
                setFiltroForma(event.target.value)
              }
            >

              <option value="Todas">
                Todas as formas
              </option>

              {formasPagamento.map((forma) => (

                <option
                  key={forma}
                  value={forma}
                >
                  {forma}
                </option>

              ))}

            </select>

          </div>


          {/* TABELA */}

          <div className="historico-tabela-container">

            {pagamentosFiltrados.length > 0 ? (

              <table className="historico-tabela">

                <thead>

                  <tr>

                    <th>
                      Cliente
                    </th>

                    <th>
                      Serviço
                    </th>

                    <th>
                      Data
                    </th>

                    <th>
                      Pagamento
                    </th>

                    <th>
                      Parcelas
                    </th>

                    <th>
                      Valor
                    </th>

                    <th>
                      Ação
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {pagamentosFiltrados.map(
                    (pagamento) => (

                      <tr key={pagamento.id}>

                        <td>

                          <div className="cliente-tabela">

                            <div className="cliente-avatar">
                              {pagamento.cliente
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <strong>
                              {pagamento.cliente}
                            </strong>

                          </div>

                        </td>


                        <td>
                          {pagamento.servico}
                        </td>


                        <td>
                          {formatarData(
                            pagamento.data
                          )}
                        </td>


                        <td>

                          <span
                            className={`forma-tag ${
                              pagamento.formaPagamento
                                .toLowerCase()
                                .replaceAll(
                                  ' ',
                                  '-'
                                )
                            }`}
                          >

                            {pagamento.formaPagamento}

                          </span>

                        </td>


                        <td>

                          {pagamento.formaPagamento ===
                          'Cartão de crédito'
                            ? `${pagamento.parcelas}x`
                            : '-'}

                        </td>


                        <td>

                          <strong className="valor-tabela">
                            {formatarValor(
                              pagamento.valor
                            )}
                          </strong>

                        </td>


                        <td>

                          <button
                            type="button"
                            className="btn-excluir"
                            onClick={() =>
                              excluirPagamento(
                                pagamento.id
                              )
                            }
                            title="Excluir pagamento"
                          >
                            Excluir
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            ) : (

              <div className="historico-vazio">

                <div className="historico-vazio-icone">
                  —
                </div>

                <strong>
                  Nenhum pagamento encontrado
                </strong>

                <p>
                  Tente alterar os filtros ou
                  registrar um novo pagamento.
                </p>

              </div>

            )}

          </div>


          {/* RODAPÉ DO HISTÓRICO */}

          <div className="historico-footer">

            <span>
              {pagamentosFiltrados.length}{' '}
              pagamento(s) encontrado(s)
            </span>

            <strong>
              Total exibido:{' '}
              {formatarValor(
                pagamentosFiltrados.reduce(
                  (total, pagamento) =>
                    total +
                    Number(pagamento.valor),
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