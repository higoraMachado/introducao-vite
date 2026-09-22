import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './RedefinirSenha.css';

function RedefinirSenha() {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const email = searchParams.get('email');
    const token = searchParams.get('token');

    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [carregando, setCarregando] = useState(false);

    const redefinirSenha = async (e) => {
        e.preventDefault();

        setErro('');
        setSucesso('');

        if (!email || !token) {
            setErro(
                'Link de recuperação inválido ou incompleto.'
            );
            return;
        }

        if (!novaSenha || !confirmarSenha) {
            setErro(
                'Preencha os dois campos de senha.'
            );
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setErro(
                'As senhas não coincidem.'
            );
            return;
        }

        if (novaSenha.length < 6) {
            setErro(
                'A senha deve possuir pelo menos 6 caracteres.'
            );
            return;
        }

        try {
            setCarregando(true);

            const resposta = await fetch(
                'http://localhost:3333/redefinir-senha',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        token: token,
                        novaSenha: novaSenha
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                setErro(
                    dados.erro ||
                    dados.message ||
                    'Não foi possível alterar a senha.'
                );
                return;
            }

            setSucesso(
                'Senha alterada com sucesso!'
            );

            setNovaSenha('');
            setConfirmarSenha('');

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error(
                'Erro ao redefinir senha:',
                error
            );

            setErro(
                'Não foi possível conectar ao servidor.'
            );

        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="redefinir-page">

            <div className="redefinir-card">

                <h1>Redefinir senha</h1>

                <p>
                    Digite sua nova senha abaixo.
                </p>

                {erro && (
                    <div className="mensagem erro">
                        {erro}
                    </div>
                )}

                {sucesso && (
                    <div className="mensagem sucesso">
                        {sucesso}
                    </div>
                )}

                <form onSubmit={redefinirSenha}>

                    <label>
                        Nova senha
                    </label>

                    <input
                        type="password"
                        value={novaSenha}
                        onChange={(e) =>
                            setNovaSenha(e.target.value)
                        }
                        placeholder="Digite sua nova senha"
                    />

                    <label>
                        Confirmar senha
                    </label>

                    <input
                        type="password"
                        value={confirmarSenha}
                        onChange={(e) =>
                            setConfirmarSenha(e.target.value)
                        }
                        placeholder="Digite novamente sua senha"
                    />

                    <button
                        type="submit"
                        disabled={carregando}
                    >
                        {carregando
                            ? 'Alterando...'
                            : 'Redefinir senha'
                        }
                    </button>

                </form>

                <button
                    type="button"
                    className="voltar-login"
                    onClick={() => navigate('/login')}
                >
                    Voltar para o login
                </button>

            </div>

        </div>
    );
}

export default RedefinirSenha;