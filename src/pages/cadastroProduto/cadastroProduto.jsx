import { useState } from 'react';
import './CadastroProduto.css';
import logoHope from '../../assets/logo-hope.png';

function CadastroProduto() {
  const [formulario, setFormulario] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    quantidade: '',
    precoCompra: '',
    precoVenda: '',
    estoqueMinimo: '',
  });

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function cadastrarProduto(event) {
    event.preventDefault();

    if (
      !formulario.nome ||
      !formulario.descricao ||
      !formulario.categoria ||
      !formulario.quantidade ||
      !formulario.precoCompra ||
      !formulario.precoVenda ||
      !formulario.estoqueMinimo
    ) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    console.log('Produto cadastrado:', formulario);

    alert('Produto cadastrado com sucesso!');

    setFormulario({
      nome: '',
      descricao: '',
      categoria: '',
      quantidade: '',
      precoCompra: '',
      precoVenda: '',
      estoqueMinimo: '',
    });
  }

  function voltar() {
    window.history.back();
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
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn-cadastrar"
              >
                Cadastrar produto
              </button>

            </div>

          </form>

        </section>

      </section>

    </main>
  );
}

export default CadastroProduto;