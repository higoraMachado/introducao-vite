import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroProduto.css';
import logoHope from '../../assets/logo-hope.png';

function CadastroProduto() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    quantidade: '',
    precoCompra: '',
    precoVenda: '',
    estoqueMinimo: '',
  });

  const [imagem, setImagem] = useState(null);
  const [previewImagem, setPreviewImagem] = useState(null);
  const [carregando, setCarregando] = useState(false);

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

    function alterarImagem(event) {
    const arquivo = event.target.files[0];

    if (!arquivo) return;

        const tiposPermitidos = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ];

    // Verifica se é realmente uma imagem
    if (!tiposPermitidos.includes(arquivo.type)) {
        alert('Selecione uma imagem JPG, PNG ou WEBP.');
        event.target.value = '';
        return;
    }

    // Limite de 5 MB
    if (arquivo.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5 MB.');
      event.target.value = '';
      return;
    }

    setImagem(arquivo);
    setPreviewImagem(URL.createObjectURL(arquivo));

    // Cria preview da imagem
    const urlImagem = URL.createObjectURL(arquivo);
    setPreviewImagem(urlImagem);
  }

async function cadastrarProduto(event) {
  event.preventDefault();

  if (
    !formulario.nome ||
    !formulario.descricao ||
    !formulario.categoria ||
    formulario.quantidade === '' ||
    formulario.precoCompra === '' ||
    formulario.precoVenda === '' ||
    formulario.estoqueMinimo === ''
  ) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }

  try {
    setCarregando(true);

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Sua sessão expirou. Faça login novamente.');
      navigate('/login');
      return;
    }

          const dadosFormulario = new FormData();

      dadosFormulario.append('nome', formulario.nome);
      dadosFormulario.append('descricao', formulario.descricao);
      dadosFormulario.append('categoria', formulario.categoria);
      dadosFormulario.append(
        'quantidade',
        formulario.quantidade
      );
      dadosFormulario.append(
        'custo',
        formulario.precoCompra
      );
      dadosFormulario.append(
        'preco',
        formulario.precoVenda
      );
      dadosFormulario.append(
        'estoqueMinimo',
        formulario.estoqueMinimo
      );

      // Só envia imagem se o usuário selecionou uma
      if (imagem) {
        dadosFormulario.append('imagem', imagem);
      }

    const resposta = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3333'}/produtos`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dadosFormulario,
      }
    );

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(
        dados.mensagem ||
        dados.message ||
        'Não foi possível cadastrar o produto.'
      );
    }

    alert('Produto cadastrado com sucesso!');

    // Limpa formulário
    setFormulario({
      nome: '',
      descricao: '',
      categoria: '',
      quantidade: '',
      precoCompra: '',
      precoVenda: '',
      estoqueMinimo: '',
    });

    // Limpa imagem
    setImagem(null);
    setPreviewImagem(null);

    navigate('/Estoque');

  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);

    alert(
      error.message ||
      'Ocorreu um erro ao cadastrar o produto.'
    );
  } finally {
    setCarregando(false);
  }
}

  function voltar() {
    navigate('/Estoque');
  }

  return (
    <main className="cadastro-produto-page">

      {/* HEADER */}
      <header className="cadastro-produto-header">

        <div className="cadastro-produto-logo">
          <img src={logoHope} alt="Hope Barbearia" />
        </div>

        <div className="cadastro-produto-title">
          <h1>Cadastro de produto</h1>
          <p>Controle de estoque</p>
        </div>

        <div className="cadastro-produto-user">
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
      <section className="cadastro-produto-content">

        {/* TÍTULO */}
        <div className="cadastro-produto-heading">

          <div>
            <span className="heading-label">
              CONTROLE DE ESTOQUE
            </span>

            <h2>
              Cadastrar produto
            </h2>

            <p>
              Preencha os dados abaixo para cadastrar um novo produto.
            </p>
          </div>

        </div>


        {/* CARD */}
        <section className="cadastro-produto-card">

          {/* CABEÇALHO DO CARD */}
          <div className="card-header">

            <div>
              <span className="card-label">
                NOVO PRODUTO
              </span>

              <h3>
                Dados do produto
              </h3>
            </div>

          </div>


          {/* FORMULÁRIO */}
          <form
            className="cadastro-produto-form"
            onSubmit={cadastrarProduto}
          >

            <div className="form-grid">

          {/* IMAGEM */}
          <div className="campo-formulario campo-imagem">
              <label>Imagem do produto</label>

              <input
                  id="imagem"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={alterarImagem}
                  hidden
              />

              <label htmlFor="imagem" className="botao-upload">
                  <span className="icone-upload">📷</span>
                  <span>
                      {imagem ? 'Alterar imagem' : 'Adicionar imagem'}
                  </span>
              </label>

              {imagem &&  (
                  <p className="nome-arquivo">
                      {imagem.name}
                  </p>
              )}

              {previewImagem && (
                  <div className="preview-imagem">
                      <img
                          src={previewImagem}
                          alt="Pré-visualização do produto"
                      />
                  </div>
              )}
          </div>

              {/* NOME */}
              <div className="form-group">

                <label htmlFor="nome">
                  Nome *
                </label>

                <input
                  id="nome"
                  type="text"
                  name="nome"
                  placeholder="Digite o nome do produto"
                  value={formulario.nome}
                  onChange={alterarFormulario}
                />

              </div>


              {/* DESCRIÇÃO */}
              <div className="form-group">

                <label htmlFor="descricao">
                  Descrição *
                </label>

                <input
                  id="descricao"
                  type="text"
                  name="descricao"
                  placeholder="Digite uma descrição do produto"
                  value={formulario.descricao}
                  onChange={alterarFormulario}
                />

              </div>


              {/* CATEGORIA */}
              <div className="form-group">

                <label htmlFor="categoria">
                  Categoria *
                </label>

                <select
                  id="categoria"
                  name="categoria"
                  value={formulario.categoria}
                  onChange={alterarFormulario}
                >
                  <option value="">
                    Selecione uma categoria
                  </option>

                  <option value="Higiene">
                    Higiene
                  </option>

                  <option value="Finalização">
                    Finalização
                  </option>

                  <option value="Barbear">
                    Barbear
                  </option>

                  <option value="Acessórios">
                    Acessórios
                  </option>

                  <option value="Outros">
                    Outros
                  </option>

                </select>

              </div>


              {/* QUANTIDADE */}
              <div className="form-group">

                <label htmlFor="quantidade">
                  Quantidade *
                </label>

                <input
                  id="quantidade"
                  type="number"
                  min="0"
                  name="quantidade"
                  placeholder="Quantidade em estoque"
                  value={formulario.quantidade}
                  onChange={alterarFormulario}
                />

              </div>


              {/* PREÇO DE COMPRA */}
              <div className="form-group">

                <label htmlFor="precoCompra">
                  Preço de compra *
                </label>

                <input
                  id="precoCompra"
                  type="number"
                  min="0"
                  step="0.01"
                  name="precoCompra"
                  placeholder="R$ 0,00"
                  value={formulario.precoCompra}
                  onChange={alterarFormulario}
                />

              </div>


              {/* PREÇO DE VENDA */}
              <div className="form-group">

                <label htmlFor="precoVenda">
                  Preço de venda *
                </label>

                <input
                  id="precoVenda"
                  type="number"
                  min="0"
                  step="0.01"
                  name="precoVenda"
                  placeholder="R$ 0,00"
                  value={formulario.precoVenda}
                  onChange={alterarFormulario}
                />

              </div>


              {/* ESTOQUE MÍNIMO */}
              <div className="form-group">

                <label htmlFor="estoqueMinimo">
                  Estoque mínimo *
                </label>

                <input
                  id="estoqueMinimo"
                  type="number"
                  min="0"
                  name="estoqueMinimo"
                  placeholder="Quantidade mínima"
                  value={formulario.estoqueMinimo}
                  onChange={alterarFormulario}
                />

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
                  : 'Cadastrar produto'}
              </button>

            </div>

          </form>

        </section>

      </section>

    </main>
  );
}

export default CadastroProduto;