
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroServico.css';
import logoHope from '../../assets/logo-hope.png';

const API_URL = 'http://localhost:3333';

function CadastroServico() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nome: '',
    descricao: '',
    valor: '',
    duracao: '',
    status: 'Ativo',
  });

  const [salvando, setSalvando] = useState(false);

  function pegarToken() {
    return localStorage.getItem('token');
  }

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function salvarServico(event) {
    event.preventDefault();

    if (
      !formulario.nome.trim() ||
      !formulario.valor ||
      !formulario.duracao
    ) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const valor = Number(
      String(formulario.valor).replace(',', '.')
    );

    const duracao = Number(formulario.duracao);

    if (!Number.isFinite(valor) || valor <= 0) {
      alert('Informe um valor válido para o serviço.');
      return;
    }

    if (!Number.isInteger(duracao) || duracao <= 0) {
      alert('Informe uma duração válida em minutos.');
      return;
    }

    const token = pegarToken();

    if (!token) {
      alert('Sua sessão não foi encontrada. Faça login novamente.');
      navigate('/login');
      return;
    }

    const corpo = {
      servico_nome: formulario.nome.trim(),
      servico_descricao: formulario.descricao.trim(),
      servico_preco: valor,
      servico_duracao: duracao,
      servico_ativo: formulario.status === 'Ativo' ? 1 : 0,
    };

    try {
      setSalvando(true);

      const resposta = await fetch(`${API_URL}/servicos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(corpo),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        if (resposta.status === 401 || resposta.status === 403) {
          throw new Error(
            dados.message || 'Sua sessão expirou ou você não tem permissão.'
          );
        }

        throw new Error(
          dados.message || 'Não foi possível cadastrar o serviço.'
        );
      }

      alert('Serviço cadastrado com sucesso!');
      navigate('/Servicos');
    } catch (error) {
      console.error('Erro ao cadastrar serviço:', error);
      alert(error.message || 'Erro de comunicação com a API.');
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    navigate(-1);
  }

  return (
    <main className="cadastro-servico-page">
      <header className="cadastro-servico-header">
        <div className="cadastro-servico-logo">
          <img src={logoHope} alt="Hope Barbearia" />
        </div>

        <div className="cadastro-servico-title">
          <h1>Cadastro de serviço</h1>
          <p>Gerenciamento de serviços</p>
        </div>

        <div className="cadastro-servico-user">
          <div className="user-avatar">B</div>

          <div className="user-info">
            <strong>Bruno</strong>
            <span>Minha conta</span>
          </div>
        </div>
      </header>

      <section className="cadastro-servico-content">
        <div className="cadastro-servico-heading">
          <div>
            <span className="heading-label">
              ÁREA DO BARBEIRO
            </span>

            <h2>Cadastrar serviço</h2>

            <p>
              Preencha os dados para cadastrar um novo serviço.
            </p>
          </div>
        </div>

        <section className="cadastro-servico-card">
          <div className="card-header">
            <div>
              <span className="card-label">NOVO SERVIÇO</span>
              <h3>Dados do serviço</h3>
            </div>
          </div>

          <form
            className="cadastro-servico-form"
            onSubmit={salvarServico}
          >
            <div className="form-grid">
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
                  maxLength={150}
                  required
                />
              </div>

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

              <div className="form-group">
                <label htmlFor="valor">
                  Valor *
                </label>

                <div className="input-prefixo">
                  <span>R$</span>

                  <input
                    id="valor"
                    type="number"
                    name="valor"
                    min="0.01"
                    step="0.01"
                    placeholder="35,00"
                    value={formulario.valor}
                    onChange={alterarFormulario}
                    required
                  />
                </div>
              </div>

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
                    step="1"
                    placeholder="30"
                    value={formulario.duracao}
                    onChange={alterarFormulario}
                    required
                  />

                  <span>minutos</span>
                </div>
              </div>

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
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>

            <div className="form-footer">
              <button
                type="button"
                className="btn-cancelar"
                onClick={cancelar}
                disabled={salvando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn-salvar"
                disabled={salvando}
              >
                {salvando
                  ? 'Salvando...'
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
