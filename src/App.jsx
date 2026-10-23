import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Páginas públicas
import Landing from "./pages/landing/Landing";
import Login from "./pages/login/login";
import RecuperacaoSenha from "./pages/recuperacaoSenha/recuperacao";
import RedefinirSenha from "./pages/redefinirSenha.jsx/redefinirSenha";

// Páginas compartilhadas
import Perfil from "./pages/perfil/Perfil";

// Cliente
import Dashboard from "./pages/dashboardCliente/Dashboard";
import Agendamento from "./pages/agendamento";

// Barbeiro
import DashboardBarbeiro from "./pages/dashboardBarbeiro/dashboardBarbeiro";
import MeusAgendamentos from "./pages/meusAgendamentos/meusAgendamentos";

// Administrador
import DashboardAdministrador from "./pages/dashboardAdministrador/dashboardAdministrador";
import GerenciamentoAgendamentos from "./pages/gerenciamentoAgendamentos/GerenciamentoAgendamentos";
import Clientes from "./pages/clientesGerenciamento/Clientes";
import GerenciamentoBarbeiros from "./pages/barbeirosGerenciamento/GerenciamentoBarbeiros";
import CadastroCliente from "./pages/cadastroClientes/cadastroCliente";
import CadastroBarbeiro from "./pages/CadastroBarbeiro/CadastroBarbeiro";
import Servicos from "./pages/listarServico/Servicos";
import CadastroServico from "./pages/CadastroServico/CadastroServico";
import Estoque from "./pages/estoque/Estoque";
import MovimentacaoEstoque from "./pages/MovimentacaoEstoque/MovimentacaoEstoque";
import CadastroProduto from "./pages/cadastroProduto/cadastroProduto";
import ControleFinanceiro from "./pages/ControleFinanceiro/ControleFinanceiro";
import RegistrarPagamentos from "./pages/RegistrarPagamantos/RegistrarPagamentos";
import Despesas from "./pages/Despesas/Despesas";

function App() {
  return (
    <Routes>
      {/* =========================================
          ROTAS PÚBLICAS
      ========================================= */}

      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/recuperacaoSenha"
        element={<RecuperacaoSenha />}
      />

      <Route
        path="/redefinirSenha"
        element={<RedefinirSenha />}
      />

      <Route
        path="/CriarConta"
        element={<CadastroCliente modoPublico />}
      />

      {/* =========================================
          PERFIL - TODOS OS USUÁRIOS
          1 = Administrador
          2 = Barbeiro
          3 = Cliente
      ========================================= */}

      <Route
        path="/perfil"
        element={
          <ProtectedRoute tiposPermitidos={[1, 2, 3]}>
            <Perfil />
          </ProtectedRoute>
        }
      />

      {/* =========================================
          CLIENTE - TIPO 3
      ========================================= */}

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

      {/* =========================================
          BARBEIRO - TIPO 2
      ========================================= */}

      <Route
        path="/dashboardBarbeiro"
        element={
          <ProtectedRoute tiposPermitidos={[2]}>
            <DashboardBarbeiro />
          </ProtectedRoute>
        }
      />

      <Route
        path="/meusAgendamentosBarbeiro"
        element={
          <ProtectedRoute tiposPermitidos={[2]}>
            <MeusAgendamentos />
          </ProtectedRoute>
        }
      />

      {/* =========================================
          ADMINISTRADOR - TIPO 1
      ========================================= */}

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
        path="/gerenciamentoAgendamentos"
        element={
          <ProtectedRoute tiposPermitidos={[1]}>
            <GerenciamentoAgendamentos />
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
        element={
          <ProtectedRoute tiposPermitidos={[1]}>
            <CadastroCliente />
          </ProtectedRoute>
        }
      />

      <Route
        path="/CadastroBarbeiro"
        element={
          <ProtectedRoute tiposPermitidos={[1]}>
            <CadastroBarbeiro />
          </ProtectedRoute>
        }
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