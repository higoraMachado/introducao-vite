import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/dashboardCliente/Dashboard';
import Login from './pages/login/login';
import Agendamento from './pages/agendamento';
import RecuperacaoSenha from './pages/recuperacaoSenha/recuperacao';
import RedefinirSenha from './pages/redefinirSenha.jsx/redefinirSenha';
import Clientes from './pages/clientesGerenciamento/Clientes';
import Barbeiros from './pages/barbeiros/Barbeiros';
import Perfil from './pages/perfil/Perfil';
import CadastroBarbeiro from './pages/CadastroBarbeiro/CadastroBarbeiro';
import Servicos from './pages/listarServico/Servicos';
import CadastroServico from './pages/CadastroServico/CadastroServico';
import Estoque from './pages/estoque/Estoque';
import PainelAdministracao from './pages/admpainel/adm';
import CadastroProduto from './pages/cadastroProduto/cadastroProduto';
import CadastroCliente from './pages/cadastroClientes/cadastroCliente';
import MovimentacaoEstoque from './pages/MovimentacaoEstoque/MovimentacaoEstoque';
import ControleFinanceiro from './pages/ControleFinanceiro/ControleFinanceiro';
import RegistrarPagamentos from './pages/RegistrarPagamantos/RegistrarPagamentos';
import Despesas from './pages/Despesas/Despesas';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboardCliente" element={<Dashboard />} />
      <Route path="/agendamento" element={<Agendamento />} />
      <Route path="/recuperacaoSenha" element={<RecuperacaoSenha/>} />
      <Route path="/GerenciamentoCliente" element={<Clientes/>} />
      <Route path="/perfil" element={<Perfil/>} />
      <Route path="/barbeiros" element={<Barbeiros/>}/>
      <Route path="/CadastroBarbeiro" element={<CadastroBarbeiro/>}/>
      <Route path="/Servicos" element={<Servicos/>}/>
      <Route path="/CadastroServico" element={<CadastroServico/>}/>
      <Route path="/Estoque" element={<Estoque/>}/>
      <Route path="/MovimentacaoEstoque" element={<MovimentacaoEstoque/>}/>
      <Route path="/PainelAdministracao" element={<PainelAdministracao/>}/>
      <Route path="/CadastroProduto" element={<CadastroProduto/>}/>
      <Route path="/CadastroCliente"element={<CadastroCliente />}/>
      <Route path="/ControleFinanceiro" element={<ControleFinanceiro />} />
      <Route path="/RegistrarPagamentos" element={<RegistrarPagamentos />} />
      <Route path="/Despesas" element={<Despesas />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
    </Routes>
  );
}

export default App;