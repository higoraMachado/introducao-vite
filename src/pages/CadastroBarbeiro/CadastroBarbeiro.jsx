import { useEffect, useState } from 'react';
import './CadastroBarbeiro.css';
import logoHope from '../../assets/logo-hope.png';

const API_URL = 'http://localhost:3333';

const formularioInicial = {
  nome: '',
  email: '',
  senha: '',
  telefone: '',
  dataNascimento: '',
  especialidade: '',
  foto: null,
};

function CadastroBarbeiro() {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [previewFoto, setPreviewFoto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    return () => {
      if (previewFoto) {
        URL.revokeObjectURL(previewFoto);
      }
    };
  }, [previewFoto]);

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setErro('');
    setMensagem('');
  }

  function alterarFoto(event) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
      setErro('Selecione um arquivo de imagem válido.');
      event.target.value = '';
      return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
      setErro('A imagem deve ter no máximo 2 MB.');
      event.target.value = '';
      return;
    }

    setFormulario((anterior) => ({
      ...anterior,
      foto: arquivo,
    }));

    setPreviewFoto(URL.createObjectURL(arquivo));
    setErro('');
  }

  function converterFotoParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
      if (!arquivo) {
        resolve(null);
        return;
      }

      const leitor = new FileReader();

      leitor.onload = () => resolve(leitor.result);
      leitor.onerror = () => reject(
        new Error('Não foi possível ler a foto selecionada.')
      );

      leitor.readAsDataURL(arquivo);
    });
  }

  async function enviarRequisicao(rota, dados, token) {
    let resposta;

    try {
      resposta = await fetch(`${API_URL}${rota}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dados),
      });
    } catch {
      throw new Error(
        'Não foi possível conectar à API. Verifique se o servidor está rodando na porta 3333.'
      );
    }

    let resultado;

    try {
      resultado = await resposta.json();
    } catch {
      throw new Error(
        `A API retornou uma resposta inválida (${resposta.status}).`
      );
    }

    if (!resposta.ok || resultado.sucesso === false) {
      throw new Error(
        resultado.message ||
        resultado.mensagem ||
        resultado.erro ||
        'Ocorreu um erro ao salvar os dados.'
      );
    }

    return resultado;
  }

  async function cadastrarBarbeiro(event) {
    event.preventDefault();

    if (carregando) return;

    setErro('');
    setMensagem('');

    const {
      nome,
      email,
      senha,
      telefone,
      dataNascimento,
      especialidade,
      foto,
    } = formulario;

    if (
      !nome.trim() ||
      !email.trim() ||
      !senha ||
      !telefone.trim() ||
      !dataNascimento ||
      !especialidade.trim()
    ) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    const telefoneLimpo = telefone.replace(/\D/g, '');

    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      setErro('Informe um telefone válido com 10 ou 11 dígitos.');
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      setErro('Sua sessão expirou. Faça login novamente.');
      return;
    }

    setCarregando(true);

    let usuarioCriadoId = null;

    try {
      // 1. Cria o usuário no banco de dados
      const respostaUsuario = await enviarRequisicao(
        '/usuarios',
        {
          usuario_nome: nome.trim(),
          usuario_email: email.trim().toLowerCase(),
          usuario_senha: senha,
          usuario_tipo: 1,
          usuario_telefone: telefoneLimpo,
          usuario_dt_nascimento: dataNascimento,
        },
        token
      );

      const usuarioId = respostaUsuario.dados?.usuario_id;

      if (!usuarioId) {
        throw new Error(
          'O usuário foi enviado, mas a API não retornou seu ID. Verifique o cadastro antes de tentar novamente.'
        );
      }

      usuarioCriadoId = usuarioId;

      // 2. Prepara a foto
      const fotoBase64 = await converterFotoParaBase64(foto);

      // 3. Vincula o usuário à tabela barbeiros
      await enviarRequisicao(
        '/barbeiros',
        {
          usuario_id: usuarioId,
          barbeiro_especialidade: especialidade.trim(),
          barbeiro_foto: fotoBase64,
        },
        token
      );

      setMensagem('Barbeiro cadastrado com sucesso!');
      setFormulario({ ...formularioInicial });
      setPreviewFoto('');

    } catch (error) {
      console.error('Erro ao cadastrar barbeiro:', error);

      if (usuarioCriadoId) {
        setErro(
          `O usuário ID ${usuarioCriadoId} foi criado, mas não foi possível concluir o cadastro como barbeiro: ${error.message}. Não tente cadastrar o mesmo e-mail novamente.`
        );
      } else {
        setErro(error.message);
      }
    } finally {
      setCarregando(false);
    }
  }

  function voltar() {
    window.history.back();
  }

  return (
    <main className="cadastro-barbeiro-page">

      {/* HEADER */}
      <header className="cadastro-barbeiro-header">

        <div className="cadastro-barbeiro-logo">
          <img src={logoHope} alt="Hope Barbearia" />
        </div>

        <div className="cadastro-barbeiro-title">
          <h1>Cadastro de barbeiro</h1>
          <p>Gerenciamento de barbeiros</p>
        </div>

        <div className="cadastro-barbeiro-user">
          <div className="user-avatar">B</div>

          <div className="user-info">
            <strong>Bruno</strong>
            <span>Minha conta</span>
          </div>
        </div>

      </header>

      {/* CONTEÚDO */}
      <section className="cadastro-barbeiro-content">

        {/* TÍTULO */}
        <div className="cadastro-barbeiro-heading">
          <div>
            <span className="heading-label">
              ÁREA DO BARBEIRO
            </span>

            <h2>Cadastrar barbeiro</h2>

            <p>
              Preencha os dados abaixo para cadastrar
              um novo barbeiro.
            </p>
          </div>
        </div>

        {/* CARD */}
        <section className="cadastro-barbeiro-card">

          {/* CABEÇALHO DO CARD */}
          <div className="card-header">
            <div>
              <span className="card-label">
                NOVO BARBEIRO
              </span>

              <h3>Dados do barbeiro</h3>
            </div>
          </div>

          {/* MENSAGENS */}
          {erro && (
            <div
              role="alert"
              style={{
                padding: '14px',
                marginBottom: '18px',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                fontWeight: '500',
              }}
            >
              {erro}
            </div>
          )}

          {mensagem && (
            <div
              role="status"
              style={{
                padding: '14px',
                marginBottom: '18px',
                borderRadius: '8px',
                backgroundColor: '#dcfce7',
                color: '#166534',
                fontWeight: '500',
              }}
            >
              {mensagem}
            </div>
          )}

          {/* FORMULÁRIO */}
          <form
            className="cadastro-barbeiro-form"
            onSubmit={cadastrarBarbeiro}
          >

            <div className="form-grid">

              {/* NOME */}
              <div className="form-group">
                <label htmlFor="nome">Nome *</label>

                <input
                  id="nome"
                  type="text"
                  name="nome"
                  placeholder="Digite o nome do barbeiro"
                  value={formulario.nome}
                  onChange={alterarFormulario}
                  disabled={carregando}
                  required
                />
              </div>

              {/* E-MAIL */}
              <div className="form-group">
                <label htmlFor="email">E-mail *</label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Digite o e-mail"
                  value={formulario.email}
                  onChange={alterarFormulario}
                  disabled={carregando}
                  required
                />
              </div>

              {/* SENHA */}
              <div className="form-group">
                <label htmlFor="senha">Senha *</label>

                <input
                  id="senha"
                  type="password"
                  name="senha"
                  placeholder="Digite uma senha"
                  value={formulario.senha}
                  onChange={alterarFormulario}
                  disabled={carregando}
                  minLength={6}
                  required
                />
              </div>

              {/* TELEFONE */}
              <div className="form-group">
                <label htmlFor="telefone">Telefone *</label>

                <input
                  id="telefone"
                  type="tel"
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  value={formulario.telefone}
                  onChange={alterarFormulario}
                  disabled={carregando}
                  required
                />
              </div>

              {/* DATA DE NASCIMENTO */}
              <div className="form-group">
                <label htmlFor="dataNascimento">
                  Data de nascimento *
                </label>

                <input
                  id="dataNascimento"
                  type="date"
                  name="dataNascimento"
                  value={formulario.dataNascimento}
                  onChange={alterarFormulario}
                  disabled={carregando}
                  required
                />
              </div>

              {/* ESPECIALIDADE */}
              <div className="form-group">
                <label htmlFor="especialidade">
                  Especialidade *
                </label>

                <input
                  id="especialidade"
                  type="text"
                  name="especialidade"
                  placeholder="Ex.: Corte, Barba, Degradê..."
                  value={formulario.especialidade}
                  onChange={alterarFormulario}
                  disabled={carregando}
                  required
                />
              </div>

              {/* FOTO */}
              <div className="form-group form-full">
                <label htmlFor="foto">Foto</label>

                <div className="foto-container">

                  <div className="foto-preview">
                    {previewFoto ? (
                      <img
                        src={previewFoto}
                        alt="Prévia do barbeiro"
                      />
                    ) : (
                      <span>
                        {formulario.nome
                          ? formulario.nome.charAt(0).toUpperCase()
                          : 'F'}
                      </span>
                    )}
                  </div>

                  <div className="foto-upload">

                    <label
                      htmlFor="foto"
                      className="btn-escolher-foto"
                    >
                      Escolher foto
                    </label>

                    <input
                      id="foto"
                      type="file"
                      accept="image/*"
                      onChange={alterarFoto}
                      disabled={carregando}
                    />

                    <small>
                      Selecione uma imagem para o perfil
                      do barbeiro (máximo de 2 MB).
                    </small>

                  </div>

                </div>
              </div>

            </div>

            {/* RODAPÉ */}
            <div className="form-footer">

              <button
                type="button"
                className="btn-cancelar"
                onClick={voltar}
                disabled={carregando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn-cadastrar"
                disabled={carregando}
              >
                {carregando
                  ? 'Cadastrando...'
                  : 'Cadastrar barbeiro'}
              </button>

            </div>

          </form>

        </section>
      </section>
    </main>
  );
}

export default CadastroBarbeiro;