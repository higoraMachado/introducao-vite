import { useState } from 'react';
import './CadastroServico.css';
import logoHope from '../../assets/logo-hope.png';

function CadastroServico() {
  const [modoEdicao, setModoEdicao] = useState(false);

  const [formulario, setFormulario] = useState({
    nome: '',
    descricao: '',
    valor: '',
    duracao: '',
    status: 'Ativo',
  });

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function salvarServico(event) {
    event.preventDefault();

    if (
      !formulario.nome ||
      !formulario.valor ||
      !formulario.duracao
    ) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    console.log('Serviço:', formulario);

    if (modoEdicao) {
      alert('Serviço atualizado com sucesso!');
    } else {
      alert('Serviço cadastrado com sucesso!');
    }
  }

  function cancelar() {
    window.history.back();
  }

  return (
    <main className="cadastro-servico-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="cadastro-servico-header">

        <div className="cadastro-servico-logo">
          <img
            src={logoHope}
            alt="Hope Barbearia"
          />
        </div>

        <div className="cadastro-servico-title">
          <h1>
            {modoEdicao
              ? 'Editar serviço'
              : 'Cadastro de serviço'}
          </h1>

          <p>
            Gerenciamento de serviços
          </p>
        </div>

        <div className="cadastro-servico-user">

          <div className="user-avatar">
            B
          </div>

          <div className="user-info">
            <strong>Bruno</strong>
            <span>Minha conta</span>
          </div>

        </div>

      </header>


      {/* =====================================================
          CONTEÚDO
      ===================================================== */}

      <section className="cadastro-servico-content">

        <div className="cadastro-servico-heading">

          <div>

            <span className="heading-label">
              ÁREA DO BARBEIRO
            </span>

            <h2>
              {modoEdicao
                ? 'Editar serviço'
                : 'Cadastrar serviço'}
            </h2>

            <p>
              {modoEdicao
                ? 'Altere as informações do serviço selecionado.'
                : 'Preencha os dados para cadastrar um novo serviço.'}
            </p>

          </div>

        </div>


        {/* =====================================================
            CARD
        ===================================================== */}

        <section className="cadastro-servico-card">

          <div className="card-header">

            <div>

              <span className="card-label">
                {modoEdicao
                  ? 'EDIÇÃO DE SERVIÇO'
                  : 'NOVO SERVIÇO'}
              </span>

              <h3>
                Dados do serviço
              </h3>

            </div>

          </div>


          {/* =====================================================
              FORMULÁRIO
          ===================================================== */}

          <form
            className="cadastro-servico-form"
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


              {/* DESCRIÇÃO */}

              <div className="form-group form-full">

                <label htmlFor="descricao">
                  Descrição
                </label>

                <textarea
                  id="descricao"
                  name="descricao"
                  placeholder="Descreva o serviço..."
                  value={formulario.descricao}
                  onChange={alterarFormulario}
                  rows="5"
                />

              </div>


              {/* VALOR */}

              <div className="form-group">

                <label htmlFor="valor">
                  Valor *
                </label>

                <div className="input-prefixo">

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


              {/* DURAÇÃO */}

              <div className="form-group">

                <label htmlFor="duracao">
                  Duração *
                </label>

                <div className="input-sufixo">

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
                    minutos
                  </span>

                </div>

              </div>


              {/* STATUS */}

              <div className="form-group">

                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={formulario.status}
                  onChange={alterarFormulario}
                >

                  <option value="Ativo">
                    Ativo
                  </option>

                  <option value="Inativo">
                    Inativo
                  </option>

                </select>

              </div>

            </div>


            {/* =================================================
                RODAPÉ
            ================================================= */}

            <div className="form-footer">

              <button
                type="button"
                className="btn-cancelar"
                onClick={cancelar}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn-salvar"
              >
                {modoEdicao
                  ? 'Salvar alterações'
                  : 'Cadastrar serviço'}
              </button>

            </div>

          </form>

        </section>

      </section>

    </main>
  );
}

export default CadastroServico;