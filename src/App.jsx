import { Routes, Route, } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Dashboard from './pages/dashboardCliente/Dashboard';
import Login from './pages/login/login';
import Agendamento from './pages/agendamento';
import RecuperacaoSenha from './pages/recuperacaoSenha/recuperacao';
import RedefinirSenha from './pages/redefinirSenha.jsx/redefinirSenha';
import Clientes from './pages/clientesGerenciamento/Clientes';
import DashboardBarbeiro from './pages/dashboardBarbeiro/dashboardBarbeiro';
import Perfil from './pages/perfil/Perfil';
import CadastroBarbeiro from './pages/CadastroBarbeiro/CadastroBarbeiro';
import Servicos from './pages/listarServico/Servicos';
import CadastroServico from './pages/CadastroServico/CadastroServico';
import Estoque from './pages/estoque/Estoque';
import DashboardAdministrador from './pages/dashboardAdministrador/dashboardAdministrador';
import CadastroProduto from './pages/cadastroProduto/cadastroProduto';
import CadastroCliente from './pages/cadastroClientes/cadastroCliente';
import MovimentacaoEstoque from './pages/MovimentacaoEstoque/MovimentacaoEstoque';
import ControleFinanceiro from './pages/ControleFinanceiro/ControleFinanceiro';
import RegistrarPagamentos from './pages/RegistrarPagamantos/RegistrarPagamentos';
import Despesas from './pages/Despesas/Despesas';
import Landing from './pages/landing/Landing';
import GerenciamentoBarbeiros from './pages/barbeirosGerenciamento/GerenciamentoBarbeiros';


function App() {
    return (
        <Routes>

            {/* PÚBLICAS */}

            <Route
                path="/"
                element={<Landing />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/recuperacaoSenha"
                element={<RecuperacaoSenha />}
            />

            <Route
                path="/redefinirSenha"
                element={<RedefinirSenha />}
            />

            {/* CLIENTE */}

            <Route
                path="/dashboardCliente"
                element={
                    <ProtectedRoute tiposPermitidos={[3]}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/agendamento"
                element={
                    <ProtectedRoute tiposPermitidos={[3]}>
                        <Agendamento />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/perfil"
                element={
                    <ProtectedRoute tiposPermitidos={[2, 3]}>
                        <Perfil />
                    </ProtectedRoute>
                }
            />

            {/* BARBEIRO */}

            <Route
                path="/dashboardBarbeiro"
                element={
                    <ProtectedRoute tiposPermitidos={[2]}>
                        <DashboardBarbeiro />
                    </ProtectedRoute>
                }
            />

            {/* ADMINISTRADOR */}
      
            <Route
                path="/dashboardAdministrador"
                element={
                    <ProtectedRoute tiposPermitidos={[1]}>
                        <DashboardAdministrador />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/PainelAdministracao"
                element={
                    <ProtectedRoute tiposPermitidos={[1]}>
                        <DashboardAdministrador />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/GerenciamentoCliente"
                element={
                    <ProtectedRoute tiposPermitidos={[1]}>
                        <Clientes />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/barbeiros"
                element={
                    <ProtectedRoute tiposPermitidos={[1]}>
                        <GerenciamentoBarbeiros />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/CadastroCliente"
                element={<CadastroCliente />}
            />

            <Route
                path="/CadastroBarbeiro"
                element={<CadastroBarbeiro />}
            />

            <Route
                path="/Servicos"
                element={
                    <ProtectedRoute tiposPermitidos={[1]}>
                        <Servicos />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/CadastroServico"
                element={
                    <ProtectedRoute tiposPermitidos={[1]}>
                        <CadastroServico />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/Estoque"
                element={
                    <ProtectedRoute tiposPermitidos={[1]}>
                        <Estoque />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/MovimentacaoEstoque"
                element={
                    <ProtectedRoute tiposPermitidos={[1]}>
                        <MovimentacaoEstoque />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/CadastroProduto"
                element={
                    <ProtectedRoute tiposPermitidos={[1]}>
                        <CadastroProduto />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/ControleFinanceiro"
                element={
                    <ProtectedRoute tiposPermitidos={[1]}>
                        <ControleFinanceiro />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/RegistrarPagamentos"
                element={
                    <ProtectedRoute tiposPermitidos={[1]}>
                        <RegistrarPagamentos />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/Despesas"
                element={
                    <ProtectedRoute tiposPermitidos={[1]}>
                        <Despesas />
                    </ProtectedRoute>
                }
            />

        </Routes>
    );
}

export default App;