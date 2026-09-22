import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroCliente.css';
import logoHope from '../../assets/logo-hope.png';

function CadastroCliente() {
    const navigate = useNavigate();

    const [formulario, setFormulario] = useState({
        nome: '',
        email: '',
        senha: '',
        telefone: '',
        dataNascimento: ''
    });

    const [carregando, setCarregando] = useState(false);

    function alterarFormulario(event) {
        const { name, value } = event.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value
        }));
    }

    async function cadastrarCliente(event) {
        event.preventDefault();

        if (
            !formulario.nome ||
            !formulario.email ||
            !formulario.senha ||
            !formulario.telefone ||
            !formulario.dataNascimento
        ) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        const telefone = formulario.telefone.replace(/\D/g, '');

        if (telefone.length < 10 || telefone.length > 11) {
            alert('Digite um telefone válido.');
            return;
        }

        if (formulario.senha.length < 8) {
            alert('A senha deve possuir pelo menos 8 caracteres.');
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch('http://localhost:3333/clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    usuario_nome: formulario.nome,
                    usuario_email: formulario.email,
                    usuario_senha: formulario.senha,
                    usuario_telefone: telefone,
                    usuario_dt_nascimento: formulario.dataNascimento
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok || !dados.sucesso) {
                throw new Error(
                    dados.message || 'Não foi possível cadastrar o cliente.'
                );
            }

            alert('Cliente cadastrado com sucesso!');

            setFormulario({
                nome: '',
                email: '',
                senha: '',
                telefone: '',
                dataNascimento: ''
            });

            navigate('/GerenciamentoCliente');

        } catch (error) {
            console.error('Erro ao cadastrar cliente:', error);

            alert(
                error.message ||
                'Erro ao cadastrar cliente. Verifique se a API está funcionando.'
            );
        } finally {
            setCarregando(false);
        }
    }

    function cancelarCadastro() {
        navigate('/GerenciamentoCliente');
    }

    return (
        <main className="cadastro-cliente-page">

            {/* HEADER */}
            <header className="cadastro-cliente-header">

                <div className="cadastro-cliente-header-left">

                    <div className="cadastro-cliente-logo-area">
                        <img
                            src={logoHope}
                            alt="Hope Barbearia"
                            className="cadastro-cliente-logo"
                        />
                    </div>

                    <div className="cadastro-cliente-titulo-area">
                        <h1>Cadastro de cliente</h1>
                        <p>Gerenciamento de clientes</p>
                    </div>

                </div>

                <div className="cadastro-cliente-usuario">
                    <div className="cadastro-cliente-avatar">
                        B
                    </div>

                    <div className="cadastro-cliente-usuario-info">
                        <strong>Bruno</strong>
                        <span>Administrador</span>
                    </div>
                </div>

            </header>


            {/* CONTEÚDO */}
            <section className="cadastro-cliente-content">

                <div className="cadastro-cliente-heading">

                    <span>ÁREA DO CLIENTE</span>

                    <h2>Cadastrar cliente</h2>

                    <p>
                        Preencha os dados abaixo para cadastrar um novo cliente.
                    </p>

                </div>


                {/* CARD */}
                <div className="cadastro-cliente-card">

                    <div className="cadastro-cliente-card-header">
                        <div>
                            <h3>NOVO CLIENTE</h3>
                            <p>Dados do cliente</p>
                        </div>
                    </div>


                    <form
                        className="cadastro-cliente-form"
                        onSubmit={cadastrarCliente}
                    >

                        {/* NOME */}
                        <div className="cadastro-cliente-form-group">

                            <label htmlFor="nome">
                                Nome completo
                            </label>

                            <input
                                id="nome"
                                name="nome"
                                type="text"
                                placeholder="Digite o nome completo"
                                value={formulario.nome}
                                onChange={alterarFormulario}
                                autoComplete="name"
                                required
                            />

                        </div>


                        {/* EMAIL */}
                        <div className="cadastro-cliente-form-group">

                            <label htmlFor="email">
                                E-mail
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Digite o e-mail"
                                value={formulario.email}
                                onChange={alterarFormulario}
                                autoComplete="email"
                                required
                            />

                        </div>


                        {/* SENHA */}
                        <div className="cadastro-cliente-form-group">

                            <label htmlFor="senha">
                                Senha
                            </label>

                            <input
                                id="senha"
                                name="senha"
                                type="password"
                                placeholder="Digite a senha"
                                value={formulario.senha}
                                onChange={alterarFormulario}
                                autoComplete="new-password"
                                required
                            />

                            <small>
                                A senha deve possuir pelo menos 8 caracteres.
                            </small>

                        </div>


                        {/* TELEFONE */}
                        <div className="cadastro-cliente-form-group">

                            <label htmlFor="telefone">
                                Telefone
                            </label>

                            <input
                                id="telefone"
                                name="telefone"
                                type="tel"
                                placeholder="Digite o telefone"
                                value={formulario.telefone}
                                onChange={alterarFormulario}
                                maxLength="15"
                                autoComplete="tel"
                                required
                            />

                        </div>


                        {/* DATA DE NASCIMENTO */}
                        <div className="cadastro-cliente-form-group">

                            <label htmlFor="dataNascimento">
                                Data de nascimento
                            </label>

                            <input
                                id="dataNascimento"
                                name="dataNascimento"
                                type="date"
                                value={formulario.dataNascimento}
                                onChange={alterarFormulario}
                                required
                            />

                        </div>


                        {/* INFORMAÇÃO */}
                        <div className="cadastro-cliente-info">

                            <div className="cadastro-cliente-info-icon">
                                i
                            </div>

                            <div>
                                <strong>Cadastro de cliente</strong>

                                <p>
                                    Ao cadastrar, o cliente será registrado
                                    automaticamente no sistema da Hope Barbearia.
                                </p>
                            </div>

                        </div>


                        {/* FOOTER */}
                        <div className="cadastro-cliente-form-footer">

                            <button
                                type="button"
                                className="cadastro-cliente-btn cadastro-cliente-btn-cancelar"
                                onClick={cancelarCadastro}
                                disabled={carregando}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="cadastro-cliente-btn cadastro-cliente-btn-cadastrar"
                                disabled={carregando}
                            >
                                {carregando
                                    ? 'Cadastrando...'
                                    : 'Cadastrar cliente'
                                }
                            </button>

                        </div>

                    </form>

                </div>

            </section>

        </main>
    );
}

export default CadastroCliente;