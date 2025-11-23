const jwt = require('jsonwebtoken');

// Verificar si el usuario tiene un token válido
exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ success: false, message: 'Token no proporcionado' });
    }

    // El token suele venir como "Bearer xxxxxxx", quitamos el "Bearer "
    const tokenBody = token.slice(7); 

    try {
        const decoded = jwt.verify(tokenBody, process.env.JWT_SECRET);
        req.user = decoded; // Guardamos los datos del usuario en la petición
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
};

// Verificar si es ADMIN
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Acceso denegado: Se requiere rol ADMIN' });
    }
    next();
};