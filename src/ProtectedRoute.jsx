import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, tiposPermitidos }) {
    const token = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    if (!token || !usuarioSalvo) {
        return <Navigate to="/login" replace />;
    }

    let usuario;

    try {
        usuario = JSON.parse(usuarioSalvo);
    } catch (error) {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');

        return <Navigate to="/login" replace />;
    }

    const tipoUsuario = Number(usuario.usuario_tipo);

    // ADMINISTRADOR TEM ACESSO A TUDO
    if (tipoUsuario === 1) {
        return children;
    }

    // Verifica os outros tipos
    if (!tiposPermitidos.includes(tipoUsuario)) {
        switch (tipoUsuario) {
            case 2:
                return <Navigate to="/dashboardBarbeiro" replace />;

            case 3:
                return <Navigate to="/dashboardCliente" replace />;

            default:
                localStorage.removeItem('usuario');
                localStorage.removeItem('token');
                return <Navigate to="/login" replace />;
        }
    }

    return children;
}

export default ProtectedRoute;