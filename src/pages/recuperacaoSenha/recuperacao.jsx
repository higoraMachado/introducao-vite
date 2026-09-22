import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './recuperacao.css';

import logoHope from '../../assets/logo-hope.png';

function RecuperacaoSenha() {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [enviado, setEnviado] = useState(false);
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);


const solicitarRecuperacao = async (e) => {
    e.preventDefault();

    if (!email) {
        setErro('Digite seu e-mail.');
        return;
    }

    try {
        setErro('');
        setCarregando(true);

        const resposta = await fetch(
            'http://localhost:3333/recuperacao-senha',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            setErro(
                dados.erro ||
                dados.message ||
                'Não foi possível solicitar a recuperação.'
            );
            return;
        }

        setEnviado(true);

    } catch (error) {
        console.error('Erro na recuperação:', error);

        setErro(
            'Não foi possível conectar ao servidor.'
        );

    } finally {
        setCarregando(false);
    }
};


    function voltarLogin() {

        navigate('/login');
    }


    return (

        <main className="recuperacao-page">

            <section className="recuperacao-card">

                <img
                    src={logoHope}
                    alt="Hope Barbearia"
                    className="recuperacao-logo"
                />


                {!enviado ? (

                    <>

                        <h1>
                            Recuperar senha
                        </h1>


                        <p>
                            Digite o e-mail cadastrado
                            para receber o link de recuperação.
                        </p>


                        <form
                            onSubmit={solicitarRecuperacao}
                        >

                            <label>
                                E-mail
                            </label>


                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="Digite seu e-mail"
                            />


                            {erro && (

                                <span className="erro">
                                    {erro}
                                </span>

                            )}


                            <button
                                type="submit"
                                disabled={carregando} >
                                {carregando
                                    ? 'Enviando...'
                                    : 'Enviar link de recuperação'}
                            </button>

                        </form>


                        <button
                            type="button"
                            className="btn-voltar"
                            onClick={voltarLogin}
                        >
                            Voltar para o login
                        </button>

                    </>

                ) : (

                    <>

                        <h1>
                            E-mail enviado!
                        </h1>


                        <p>
                            Verifique sua caixa de entrada
                            e clique no link enviado para
                            redefinir sua senha.
                        </p>


                        <button
                            type="button"
                            onClick={voltarLogin}
                        >
                            Voltar para o login
                        </button>

                    </>

                )}

            </section>

        </main>
    );
}

export default RecuperacaoSenha;