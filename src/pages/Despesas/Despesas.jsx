import { useState } from 'react';
import './Despesas.css';
import logoHope from '../../assets/logo-hope.png';

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

function Despesas() {
  const [form, setForm] = useState({
    descricao: '',
    categoria: 'Compra de produtos',
    valor: '',
    data: new Date().toISOString().slice(0, 10),
    formaPagamento: 'Dinheiro',
  });

  function alterarCampo(event) {
    const { name, value } = event.target;

    setForm((estadoAtual) => ({
      ...estadoAtual,
      [name]: value,
    }));
  }

  function registrarDespesa(event) {
    event.preventDefault();

    if (!form.descricao || !form.valor) {
      alert('Preencha a descrição e o valor da despesa.');
      return;
    }

    alert(`Despesa registrada: ${form.descricao}`);
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
            <p>Registre os gastos e mantenha o controle financeiro do negócio.</p>
          </div>
        </div>

        <form className="despesas-form" onSubmit={registrarDespesa}>
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
                min="0"
                step="0.01"
                value={form.valor}
                onChange={alterarCampo}
                placeholder="0.00"
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
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="formaPagamento">Forma de pagamento</label>
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
            <button type="button" className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar despesa
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Despesas;
