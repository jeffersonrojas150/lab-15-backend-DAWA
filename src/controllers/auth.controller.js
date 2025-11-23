const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar nuevo usuario
exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // 1. Validar si el usuario ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'El email ya está registrado' });
        }

        // 2. Buscar el rol (Por defecto CUSTOMER si no se especifica)
        const roleName = role || 'CUSTOMER'; 
        const roleRecord = await Role.findOne({ where: { nombre: roleName } });
        
        if (!roleRecord) {
            return res.status(400).json({ success: false, message: 'Rol no válido' });
        }

        // 3. Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Crear usuario
        const newUser = await User.create({
            email,
            password: hashedPassword,
            roleId: roleRecord.id
        });

        res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente'
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

// Iniciar Sesión
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar usuario
        const user = await User.findOne({ 
            where: { email },
            include: Role // Incluimos el rol para saber quién es
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
        }

        // 2. Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
        }

        // 3. Generar Token JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.Role.nombre 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.Role.nombre
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};