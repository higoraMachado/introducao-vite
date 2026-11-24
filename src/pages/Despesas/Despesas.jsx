
import { useState } from 'react';
import './Despesas.css';
import logoHope from '../../assets/logo-hope.png';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3333';

const categorias = [
  'Compra de produtos',
  'Aluguel',
  'Energia',
  'Água',
  'Internet',
  'Manutenção',
  'Outros',
];

const formasPagamento = [
  'Dinheiro',
  'PIX',
  'Cartão de débito',
  'Cartão de crédito',
];

const formularioInicial = () => ({
  descricao: '',
  categoria: 'Compra de produtos',
  valor: '',
  data: new Date().toLocaleDateString('en-CA'),
  formaPagamento: 'Dinheiro',
});

function Despesas() {
  const [form, setForm] = useState(formularioInicial);
  const [carregando, setCarregando] = useState(false);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setForm((atual) => ({
      ...atual,
      [name]: value,
    }));
  }

  function cancelar() {
    setForm(formularioInicial());
  }

  async function registrarDespesa(event) {
    event.preventDefault();

    if (
      !form.descricao.trim() ||
      !form.valor ||
      !form.data
    ) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const valor = Number(form.valor);

    if (!Number.isFinite(valor) || valor <= 0) {
      alert('Informe um valor válido para a despesa.');
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Sua sessão expirou. Entre novamente no sistema.');
      return;
    }

    const dadosDespesa = {
      despesa_nome: form.descricao.trim(),
      despesa_descricao:
        `Categoria: ${form.categoria} | Forma de pagamento: ${form.formaPagamento}`,
      despesa_valor: valor,
      despesa_data: form.data,
      despesa_comprovante: null,
    };

    try {
      setCarregando(true);

      const resposta = await fetch(`${API_URL}/despesas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dadosDespesa),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          resultado.message ||
          resultado.mensagem ||
          resultado.dados ||
          'Não foi possível cadastrar a despesa.'
        );
      }

      alert('Despesa cadastrada com sucesso!');

      setForm(formularioInicial());
    } catch (erro) {
      console.error('Erro ao cadastrar despesa:', erro);

      alert(
        erro.message ||
        'Erro ao conectar com o servidor. Verifique se a API está funcionando.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="despesas-page">
      <header className="despesas-header">
        <div className="header-logo">
          <img src={logoHope} alt="Hope Barbearia" />
        </div>

        <div className="header-title">
          <h1>Despesas</h1>
          <p>Cadastro e acompanhamento de gastos da barbearia</p>
        </div>

        <div className="header-user">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <strong>Administrador</strong>
            <span>Financeiro</span>
          </div>
        </div>
      </header>

      <section className="despesas-content">
        <div className="page-heading">
          <div>
            <span className="heading-label">DESPESAS</span>
            <h2>Cadastro de despesas</h2>
            <p>
              Registre os gastos e mantenha o controle
              financeiro do negócio.
            </p>
          </div>
        </div>

        <form
          className="despesas-form"
          onSubmit={registrarDespesa}
        >
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="descricao">Descrição</label>
              <input
                id="descricao"
                name="descricao"
                type="text"
                value={form.descricao}
                onChange={alterarCampo}
                placeholder="Ex: Compra de produtos"
                maxLength={100}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoria">Categoria</label>
              <select
                id="categoria"
                name="categoria"
                value={form.categoria}
                onChange={alterarCampo}
              >
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="valor">Valor</label>
              <input
                id="valor"
                name="valor"
                type="number"
                min="0.01"
                step="0.01"
                value={form.valor}
                onChange={alterarCampo}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="data">Data</label>
              <input
                id="data"
                name="data"
                type="date"
                value={form.data}
                onChange={alterarCampo}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="formaPagamento">
                Forma de pagamento
              </label>

              <select
                id="formaPagamento"
                name="formaPagamento"
                value={form.formaPagamento}
                onChange={alterarCampo}
              >
                {formasPagamento.map((forma) => (
                  <option key={forma} value={forma}>
                    {forma}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={cancelar}
              disabled={carregando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={carregando}
            >
              {carregando ? 'Salvando...' : 'Salvar despesa'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Despesas;
