import { useState } from 'react';
import './Servicos.css';
import logoHope from '../../assets/logo-hope.png';

const servicosIniciais = [
  {
    id: 1,
    nome: 'Corte',
    duracao: 30,
    valor: 35,
    status: 'Ativo',
  },
  {
    id: 2,
    nome: 'Barba',
    duracao: 20,
    valor: 25,
    status: 'Ativo',
  },
  {
    id: 3,
    nome: 'Corte + Barba',
    duracao: 50,
    valor: 55,
    status: 'Ativo',
  },
];

function Servicos() {
  const [servicos, setServicos] = useState(servicosIniciais);

  const [pesquisa, setPesquisa] = useState('');
  const [filtro, setFiltro] = useState('Todos');

  const [modalFormulario, setModalFormulario] = useState(false);

  const [servicoSelecionado, setServicoSelecionado] = useState(null);

  const [formulario, setFormulario] = useState({
    nome: '',
    duracao: '',
    valor: '',
  });


  /* =========================================
     FILTRO E PESQUISA
  ========================================= */

  const servicosFiltrados = servicos.filter((servico) => {
    const termo = pesquisa.toLowerCase();

    const correspondePesquisa =
      servico.nome.toLowerCase().includes(termo);

    const correspondeFiltro =
      filtro === 'Todos' || servico.status === filtro;

    return correspondePesquisa && correspondeFiltro;
  });


  /* =========================================
     ABRIR CADASTRO
  ========================================= */

  function abrirCadastro() {
    setServicoSelecionado(null);

    setFormulario({
      nome: '',
      duracao: '',
      valor: '',
    });

    setModalFormulario(true);
  }


  /* =========================================
     ABRIR EDIÇÃO
  ========================================= */

  function abrirEdicao(servico) {
    setServicoSelecionado(servico);

    setFormulario({
      nome: servico.nome,
      duracao: servico.duracao,
      valor: servico.valor,
    });

    setModalFormulario(true);
  }


  /* =========================================
     ALTERAR FORMULÁRIO
  ========================================= */

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }


  /* =========================================
     SALVAR SERVIÇO
  ========================================= */

  function salvarServico(event) {
    event.preventDefault();

    if (
      !formulario.nome ||
      !formulario.duracao ||
      !formulario.valor
    ) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const valorNumerico = Number(
      String(formulario.valor).replace(',', '.')
    );

    const duracaoNumerica = Number(formulario.duracao);

    if (valorNumerico <= 0) {
      alert('Informe um valor válido.');
      return;
    }

    if (duracaoNumerica <= 0) {
      alert('Informe uma duração válida.');
      return;
    }


    /* EDITAR */

    if (servicoSelecionado) {
      setServicos((anterior) =>
        anterior.map((servico) =>
          servico.id === servicoSelecionado.id
            ? {
                ...servico,
                nome: formulario.nome,
                duracao: duracaoNumerica,
                valor: valorNumerico,
              }
            : servico
        )
      );

      alert('Serviço atualizado com sucesso!');
    }


    /* NOVO SERVIÇO */

    else {
      const novoServico = {
        id:
          servicos.length > 0
            ? Math.max(
                ...servicos.map((servico) => servico.id)
              ) + 1
            : 1,

        nome: formulario.nome,
        duracao: duracaoNumerica,
        valor: valorNumerico,
        status: 'Ativo',
      };

      setServicos((anterior) => [
        ...anterior,
        novoServico,
      ]);

      alert('Serviço cadastrado com sucesso!');
    }

    fecharFormulario();
  }


  /* =========================================
     ALTERAR STATUS
  ========================================= */

  function alterarStatus(servico) {
    const novoStatus =
      servico.status === 'Ativo'
        ? 'Inativo'
        : 'Ativo';

    const mensagem =
      novoStatus === 'Inativo'
        ? `Deseja desativar o serviço "${servico.nome}"?`
        : `Deseja ativar o serviço "${servico.nome}"?`;

    if (!window.confirm(mensagem)) {
      return;
    }

    setServicos((anterior) =>
      anterior.map((item) =>
        item.id === servico.id
          ? {
              ...item,
              status: novoStatus,
            }
          : item
      )
    );
  }


  /* =========================================
     FECHAR MODAL
  ========================================= */

  function fecharFormulario() {
    setModalFormulario(false);

    setServicoSelecionado(null);
  }


  /* =========================================
     FORMATAR VALOR
  ========================================= */

  function formatarValor(valor) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }


  /* =========================================
     TELA
  ========================================= */

  return (
    <main className="servicos-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="servicos-header">

        <div className="servicos-logo">
          <img
            src={logoHope}
            alt="Hope Barbearia"
          />
        </div>


        <div className="servicos-title">

          <h1>
            Serviços
          </h1>

          <p>
            Gerenciamento de serviços
          </p>

        </div>


        <div className="servicos-user">

          <div className="user-avatar">
            B
          </div>

          <div className="user-info">

            <strong>
              Bruno
            </strong>

            <span>
              Minha conta
            </span>

          </div>

        </div>

      </header>


      {/* =====================================
          CONTEÚDO
      ===================================== */}

      <section className="servicos-content">

        {/* TÍTULO */}

        <div className="servicos-heading">

          <div>

            <span className="heading-label">
              ÁREA DO BARBEIRO
            </span>

            <h2>
              Serviços
            </h2>

            <p>
              Consulte e gerencie os serviços oferecidos pela Hope Barbearia.
            </p>

          </div>


          <button
            className="btn-novo-servico"
            onClick={abrirCadastro}
          >
            + Novo serviço
          </button>

        </div>


        {/* =====================================
            CARD
        ===================================== */}

        <section className="servicos-card">

          {/* HEADER CARD */}

          <div className="card-header">

            <div>

              <span className="card-label">
                SERVIÇOS
              </span>

              <h3>
                Lista de serviços
              </h3>

            </div>


            <div className="total-servicos">
              {servicos.length}{' '}
              {servicos.length === 1
                ? 'serviço'
                : 'serviços'}
            </div>

          </div>


          {/* =====================================
              FILTROS
          ===================================== */}

          <div className="servicos-filtros">

            <div className="campo-pesquisa">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Pesquisar serviço..."
                value={pesquisa}
                onChange={(event) =>
                  setPesquisa(event.target.value)
                }
              />

            </div>


            <select
              value={filtro}
              onChange={(event) =>
                setFiltro(event.target.value)
              }
            >

              <option value="Todos">
                Todos
              </option>

              <option value="Ativo">
                Ativos
              </option>

              <option value="Inativo">
                Inativos
              </option>

            </select>

          </div>


          {/* =====================================
              TABELA
          ===================================== */}

          <div className="tabela-container">

            <table className="servicos-tabela">

              <thead>

                <tr>

                  <th>
                    Serviço
                  </th>

                  <th>
                    Duração
                  </th>

                  <th>
                    Valor
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Ações
                  </th>

                </tr>

              </thead>


              <tbody>

                {servicosFiltrados.length > 0 ? (

                  servicosFiltrados.map((servico) => (

                    <tr key={servico.id}>

                      {/* SERVIÇO */}

                      <td>

                        <strong className="nome-servico">
                          {servico.nome}
                        </strong>

                      </td>


                      {/* DURAÇÃO */}

                      <td>

                        <span className="duracao-servico">

                          {servico.duracao}{' '}
                          min

                        </span>

                      </td>


                      {/* VALOR */}

                      <td>

                        <strong className="valor-servico">
                          {formatarValor(servico.valor)}
                        </strong>

                      </td>


                      {/* STATUS */}

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


                      {/* AÇÕES */}

                      <td>

                        <div className="acoes">

                          <button
                            className="acao-editar"
                            onClick={() =>
                              abrirEdicao(servico)
                            }
                          >
                            Editar
                          </button>


                          <button
                            className={
                              servico.status === 'Ativo'
                                ? 'acao-desativar'
                                : 'acao-ativar'
                            }
                            onClick={() =>
                              alterarStatus(servico)
                            }
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

                    <td
                      colSpan="5"
                      className="nenhum-servico"
                    >

                      <div>

                        <span>
                          ✂
                        </span>

                        <strong>
                          Nenhum serviço encontrado
                        </strong>

                        <p>
                          Tente alterar sua pesquisa
                          ou o filtro selecionado.
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


      {/* =====================================
          MODAL DE CADASTRO / EDIÇÃO
      ===================================== */}

      {modalFormulario && (

        <div
          className="modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target === event.currentTarget
            ) {
              fecharFormulario();
            }

          }}
        >

          <div className="modal">

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <span className="card-label">

                  {servicoSelecionado
                    ? 'SERVIÇO'
                    : 'NOVO SERVIÇO'}

                </span>

                <h3>

                  {servicoSelecionado
                    ? 'Editar serviço'
                    : 'Cadastrar serviço'}

                </h3>

              </div>


              <button
                className="modal-fechar"
                onClick={fecharFormulario}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="servico-form"
              onSubmit={salvarServico}
            >

              <div className="form-grid">

                {/* NOME */}

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
                  />

                </div>


                {/* DURAÇÃO */}

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
                      placeholder="30"
                      value={formulario.duracao}
                      onChange={alterarFormulario}
                    />

                    <span>
                      min
                    </span>

                  </div>

                </div>


                {/* VALOR */}

                <div className="form-group">

                  <label htmlFor="valor">
                    Valor *
                  </label>

                  <div className="input-com-prefixo">

                    <span>
                      R$
                    </span>

                    <input
                      id="valor"
                      type="number"
                      name="valor"
                      min="0"
                      step="0.01"
                      placeholder="35,00"
                      value={formulario.valor}
                      onChange={alterarFormulario}
                    />

                  </div>

                </div>

              </div>


              {/* FOOTER */}

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
                >

                  {servicoSelecionado
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