import { useState } from 'react';
import './RegistrarPagamentos.css';
import logoHope from '../../assets/logo-hope.png';

const formasPagamento = [
  'Dinheiro',
  'PIX',
  'Cartão de débito',
  'Cartão de crédito',
];

function RegistrarPagamentos() {
  const [form, setForm] = useState({
    cliente: '',
    servico: '',
    data: new Date().toISOString().slice(0, 10),
    valor: '',
    formaPagamento: 'Dinheiro',
  });

  function alterarCampo(event) {
    const { name, value } = event.target;

    setForm((estadoAtual) => ({
      ...estadoAtual,
      [name]: value,
    }));
  }

  function registrarPagamento(event) {
    event.preventDefault();

    if (!form.cliente || !form.servico || !form.valor) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    alert(`Pagamento registrado para ${form.cliente}`);
  }

  return (
    <main className="registrar-pagamento-page">
      <header className="registrar-pagamento-header">
        <div className="header-logo">
          <img src={logoHope} alt="Hope Barbearia" />
        </div>

        <div className="header-title">
          <h1>Registrar pagamento</h1>
          <p>Registro de recebimentos e confirmação de pagamentos</p>
        </div>

        <div className="header-user">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <strong>Administrador</strong>
            <span>Financeiro</span>
          </div>
        </div>
      </header>

      <section className="registrar-pagamento-content">
        <div className="page-heading">
          <div>
            <span className="heading-label">PAGAMENTO</span>
            <h2>Novo recebimento</h2>
            <p>Cadastre o pagamento do cliente de forma rápida e organizada.</p>
          </div>
        </div>

        <form className="pagamento-form" onSubmit={registrarPagamento}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="cliente">Cliente</label>
              <input
                id="cliente"
                name="cliente"
                type="text"
                value={form.cliente}
                onChange={alterarCampo}
                placeholder="Nome do cliente"
              />
            </div>

            <div className="form-group">
              <label htmlFor="servico">Serviço</label>
              <input
                id="servico"
                name="servico"
                type="text"
                value={form.servico}
                onChange={alterarCampo}
                placeholder="Ex: Corte de cabelo"
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
              Registrar pagamento
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default RegistrarPagamentos;
