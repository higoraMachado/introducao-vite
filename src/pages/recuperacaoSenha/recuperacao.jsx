import { useState } from 'react';
import './recuperacao.css';
import logoHope from '../../assets/logo-hope.png';

function RecuperacaoSenha() {
const [email, setEmail] = useState('');
const [enviado, setEnviado] = useState(false);
const [erro, setErro] = useState('');

function solicitarRecuperacao(event) {
event.preventDefault();

```
if (!email.trim()) {
  setErro('Digite seu e-mail para continuar.');
  return;
}

if (!email.includes('@') || !email.includes('.')) {
  setErro('Digite um e-mail válido.');
  return;
}

setErro('');
setEnviado(true);
```

}

function voltar() {
setEmail('');
setErro('');
setEnviado(false);
}

return ( <main className="recuperacao-page">

```
  {/* HEADER */}
  <header className="recuperacao-header">
    <div className="header-logo">
      <img
        src={logoHope}
        alt="Hope Barbearia"
      />
    </div>

    <div className="header-title">
      <h1>Hope Barbearia</h1>
      <p>Recuperação de senha</p>
    </div>

    <div className="header-spacer"></div>
  </header>

  {/* CONTEÚDO */}
  <section className="recuperacao-content">

    {!enviado ? (
      <div className="recuperacao-card">

        <div className="recuperacao-icon">
          🔑
        </div>

        <span className="heading-label">
          RECUPERAÇÃO DE SENHA
        </span>

        <h2>Esqueceu sua senha?</h2>

        <p className="descricao">
          Digite o e-mail cadastrado na sua conta.
          Enviaremos as instruções para você criar
          uma nova senha.
        </p>

        <form onSubmit={solicitarRecuperacao}>

          <div className="campo">
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErro('');
              }}
            />
          </div>

          {erro && (
            <p className="mensagem-erro">
              {erro}
            </p>
          )}

          <button
            type="submit"
            className="btn-recuperar"
          >
            Solicitar recuperação
          </button>

        </form>

        <button
          type="button"
          className="btn-voltar"
          onClick={voltar}
        >
          ← Voltar para o login
        </button>

      </div>
    ) : (
      <div className="recuperacao-card confirmacao">

        <div className="confirmacao-icon">
          ✓
        </div>

        <span className="heading-label">
          SOLICITAÇÃO ENVIADA
        </span>

        <h2>Verifique seu e-mail</h2>

        <p className="descricao">
          Se o e-mail informado estiver cadastrado,
          você receberá as instruções para recuperar
          sua senha.
        </p>

        <div className="email-confirmacao">
          <span>E-mail informado</span>
          <strong>{email}</strong>
        </div>

        <button
          type="button"
          className="btn-recuperar"
          onClick={voltar}
        >
          Voltar para o login
        </button>

      </div>
    )}

  </section>

  {/* RODAPÉ */}
  <footer className="recuperacao-footer">
    <span>Hope Barbearia</span>
    <span>•</span>
    <span>Agendamento e controle</span>
  </footer>

</main>


);
}

export default RecuperacaoSenha;
