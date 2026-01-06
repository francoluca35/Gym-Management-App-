import express from 'express';
import bcrypt from 'bcryptjs';
import Gym from '../models/Gym.js';
import User from '../models/User.js';

const router = express.Router();

// Función para obtener la IP del cliente
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         req.ip ||
         'unknown';
};

// Ruta de registro
router.post('/register', async (req, res) => {
  try {
    const {
      nombreGym,
      propietario,
      direccion,
      telefono,
      email,
      usuario,
      contraseña
    } = req.body;

    // Validar campos requeridos
    if (!nombreGym || !propietario || !direccion || !telefono || !email || !usuario || !contraseña) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // Verificar si el email ya existe
    const existingGym = await Gym.findOne({ email });
    if (existingGym) {
      return res.status(400).json({ 
        error: 'Ya existe un gimnasio registrado con este email' 
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username: usuario.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'El nombre de usuario ya está en uso' 
      });
    }

    // Obtener IP del cliente
    const ipRegistro = getClientIP(req);

    // Crear el gimnasio
    const gym = new Gym({
      nombreGym,
      propietario,
      direccion,
      telefono,
      email: email.toLowerCase(),
      ipRegistro,
      datosFormulario: {}
    });

    await gym.save();

    // Hashear la contraseña del admin
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear usuario admin
    const adminUser = new User({
      gymId: gym.gymId,
      username: usuario.toLowerCase(),
      password: hashedPassword,
      rol: 'admin',
      nombre: propietario
    });

    await adminUser.save();

    // Crear usuarios empleados predeterminados
    const empleados = [
      { username: 'empleadoM', nombre: 'Empleado Mañana', shift: 'morning' },
      { username: 'empleadoT', nombre: 'Empleado Tarde', shift: 'afternoon' },
      { username: 'empleadoN', nombre: 'Empleado Noche', shift: 'night' }
    ];

    const empleadoPassword = await bcrypt.hash('12345', 10);

    for (const empleado of empleados) {
      const empleadoUser = new User({
        gymId: gym.gymId,
        username: empleado.username,
        password: empleadoPassword,
        rol: 'empleado',
        nombre: empleado.nombre
      });
      await empleadoUser.save();
    }

    res.status(201).json({
      message: 'Gimnasio registrado exitosamente',
      gymId: gym.gymId,
      gym: {
        nombreGym: gym.nombreGym,
        email: gym.email,
        propietario: gym.propietario
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Error al registrar el gimnasio',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Ruta de login
router.post('/login', async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
      return res.status(400).json({ 
        error: 'Usuario y contraseña son requeridos' 
      });
    }

    // Buscar usuario
    const user = await User.findOne({ 
      username: usuario.toLowerCase(),
      activo: true
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario o contraseña incorrectos' 
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(contraseña, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Usuario o contraseña incorrectos' 
      });
    }

    // Obtener información del gimnasio
    const gym = await Gym.findOne({ gymId: user.gymId, activo: true });
    if (!gym) {
      return res.status(401).json({ 
        error: 'Gimnasio no encontrado o inactivo' 
      });
    }

    res.json({
      message: 'Login exitoso',
      user: {
        id: user._id,
        username: user.username,
        nombre: user.nombre,
        rol: user.rol,
        gymId: user.gymId
      },
      gym: {
        gymId: gym.gymId,
        nombreGym: gym.nombreGym,
        direccion: gym.direccion,
        telefono: gym.telefono,
        email: gym.email
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Error al iniciar sesión',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
