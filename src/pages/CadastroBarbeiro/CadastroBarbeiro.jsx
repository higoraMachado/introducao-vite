import { useState } from 'react';
import './CadastroBarbeiro.css';
import logoHope from '../../assets/logo-hope.png';

function CadastroBarbeiro() {
  const [formulario, setFormulario] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    dataNascimento: '',
    especialidade: '',
    foto: null,
  });

  const [previewFoto, setPreviewFoto] = useState('');

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function alterarFoto(event) {
    const arquivo = event.target.files[0];

    if (!arquivo) return;

    setFormulario((anterior) => ({
      ...anterior,
      foto: arquivo,
    }));

    setPreviewFoto(URL.createObjectURL(arquivo));
  }

  function cadastrarBarbeiro(event) {
    event.preventDefault();

    if (
      !formulario.nome ||
      !formulario.email ||
      !formulario.senha ||
      !formulario.telefone ||
      !formulario.dataNascimento ||
      !formulario.especialidade
    ) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    console.log('Barbeiro cadastrado:', formulario);

    alert('Barbeiro cadastrado com sucesso!');

    setFormulario({
      nome: '',
      email: '',
      senha: '',
      telefone: '',
      dataNascimento: '',
      especialidade: '',
      foto: null,
    });

    setPreviewFoto('');
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
          <div className="user-avatar">
            B
          </div>

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

            <h2>
              Cadastrar barbeiro
            </h2>

            <p>
              Preencha os dados abaixo para cadastrar um novo barbeiro.
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

              <h3>
                Dados do barbeiro
              </h3>
            </div>

          </div>


          {/* FORMULÁRIO */}
          <form
            className="cadastro-barbeiro-form"
            onSubmit={cadastrarBarbeiro}
          >

            <div className="form-grid">

              {/* NOME */}
              <div className="form-group">

                <label htmlFor="nome">
                  Nome *
                </label>

                <input
                  id="nome"
                  type="text"
                  name="nome"
                  placeholder="Digite o nome do barbeiro"
                  value={formulario.nome}
                  onChange={alterarFormulario}
                />

              </div>


              {/* E-MAIL */}
              <div className="form-group">

                <label htmlFor="email">
                  E-mail *
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Digite o e-mail"
                  value={formulario.email}
                  onChange={alterarFormulario}
                />

              </div>


              {/* SENHA */}
              <div className="form-group">

                <label htmlFor="senha">
                  Senha *
                </label>

                <input
                  id="senha"
                  type="password"
                  name="senha"
                  placeholder="Digite uma senha"
                  value={formulario.senha}
                  onChange={alterarFormulario}
                />

              </div>


              {/* TELEFONE */}
              <div className="form-group">

                <label htmlFor="telefone">
                  Telefone *
                </label>

                <input
                  id="telefone"
                  type="tel"
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  value={formulario.telefone}
                  onChange={alterarFormulario}
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
                />

              </div>


              {/* FOTO */}
              <div className="form-group form-full">

                <label htmlFor="foto">
                  Foto
                </label>

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
                    />

                    <small>
                      Selecione uma imagem para o perfil do barbeiro.
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
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn-cadastrar"
              >
                Cadastrar barbeiro
              </button>

            </div>

          </form>

        </section>

      </section>

    </main>
  );
}

export default CadastroBarbeiro;