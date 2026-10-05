import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, tiposPermitidos }) {
    const location = useLocation();

    const token = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    // =====================================================
    // NAO ESTA LOGADO
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
    // TENTA LER O USUARIO
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
    // TIPO DO USUARIO
    // =====================================================

    const tipoUsuario = Number(usuario.usuario_tipo);

    // =====================================================
    // ADMINISTRADOR
    // =====================================================

    if (tipoUsuario === 1) {
        return children;
    }

    // =====================================================
    // VERIFICA SE O TIPO PODE ACESSAR A PAGINA
    // =====================================================

    if (!tiposPermitidos.includes(tipoUsuario)) {

        // BARBEIRO
        if (tipoUsuario === 2) {
            return (
                <Navigate
                    to="/dashboardBarbeiro"
                    replace
                />
            );
        }

        // CLIENTE
        if (tipoUsuario === 3) {
            return (
                <Navigate
                    to="/dashboardCliente"
                    replace
                />
            );
        }

        // TIPO DESCONHECIDO
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
    // ACESSO LIBERADO
    // =====================================================

    return children;
}

export default ProtectedRoute;