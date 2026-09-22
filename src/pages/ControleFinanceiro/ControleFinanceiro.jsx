import './ControleFinanceiro.css';
import logoHope from '../../assets/logo-hope.png';

const resumoFinanceiro = [
  {
    titulo: 'Faturamento',
    valor: 'R$ 8.450,00',
    classe: 'positivo',
  },
  {
    titulo: 'Despesas',
    valor: 'R$ 2.300,00',
    classe: 'negativo',
  },
  {
    titulo: 'Lucro',
    valor: 'R$ 6.150,00',
    classe: 'lucro',
  },
];

const movimentacoes = [
  {
    data: '17/09',
    descricao: 'Corte',
    tipo: 'Entrada',
    valor: 'R$ 35',
  },
  {
    data: '17/09',
    descricao: 'Compra de pomada',
    tipo: 'Saída',
    valor: 'R$ 100',
  },
];

function ControleFinanceiro() {
  return (
    <main className="financeiro-page">
      <header className="financeiro-header">
        <div className="financeiro-logo-wrap">
          <img src={logoHope} alt="Hope Barbearia" className="financeiro-logo" />
        </div>

        <div className="financeiro-title-wrap">
          <h1>Controle financeiro</h1>
          <p>Acompanhamento de faturamento, despesas e lucro</p>
        </div>

        <div className="financeiro-user">
          <div className="financeiro-avatar">A</div>
          <div className="financeiro-user-info">
            <strong>Administrador</strong>
            <span>Financeiro</span>
          </div>
        </div>
      </header>

      <section className="financeiro-content">
        <div className="financeiro-summary">
          {resumoFinanceiro.map((item) => (
            <article className={`financeiro-card financeiro-card-${item.classe}`} key={item.titulo}>
              <h2>{item.titulo}</h2>
              <strong>{item.valor}</strong>
            </article>
          ))}
        </div>

        <section className="financeiro-table-panel">
          <div className="financeiro-table-header">
            <h3>Movimentações</h3>
          </div>

          <div className="financeiro-table-wrap">
            <table className="financeiro-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map((movimentacao) => (
                  <tr key={`${movimentacao.data}-${movimentacao.descricao}`}>
                    <td>{movimentacao.data}</td>
                    <td>{movimentacao.descricao}</td>
                    <td>
                      <span className={movimentacao.tipo === 'Entrada' ? 'tipo-entrada' : 'tipo-saida'}>
                        {movimentacao.tipo}
                      </span>
                    </td>
                    <td>{movimentacao.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

export default ControleFinanceiro;
