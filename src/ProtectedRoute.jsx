
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, tiposPermitidos = [] }) {
    const location = useLocation();

    const token = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    // =====================================================
    // VERIFICA SE O USUARIO ESTA LOGADO
    // =====================================================

    if (!token || !usuarioSalvo) {
        return (
            <Navigate
                to="/login"
                state={{
                    from: location.pathname,
                }}
                replace
            />
        );
    }

    // =====================================================
    // TENTA LER OS DADOS DO USUARIO
    // =====================================================

    let usuario;

    try {
        usuario = JSON.parse(usuarioSalvo);
    } catch (error) {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // =====================================================
    // IDENTIFICA O TIPO DO USUARIO
    // =====================================================

    const tipoUsuario = Number(usuario?.usuario_tipo);

    // =====================================================
    // VERIFICA SE O TIPO E VALIDO
    // =====================================================

    if (![1, 2, 3].includes(tipoUsuario)) {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // =====================================================
    // VERIFICA SE O USUARIO TEM PERMISSAO
    // =====================================================

    const acessoPermitido = tiposPermitidos
        .map(Number)
        .includes(tipoUsuario);

    if (!acessoPermitido) {

        // ADMINISTRADOR - TIPO 1
        if (tipoUsuario === 1) {
            return (
                <Navigate
                    to="/dashboardAdministrador"
                    replace
                />
            );
        }

        // BARBEIRO - TIPO 2
        if (tipoUsuario === 2) {
            return (
                <Navigate
                    to="/dashboardBarbeiro"
                    replace
                />
            );
        }

        // CLIENTE - TIPO 3
        if (tipoUsuario === 3) {
            return (
                <Navigate
                    to="/dashboardCliente"
                    replace
                />
            );
        }
    }

    // =====================================================
    // ACESSO AUTORIZADO
    // =====================================================

    return children;
}

export default ProtectedRoute;
