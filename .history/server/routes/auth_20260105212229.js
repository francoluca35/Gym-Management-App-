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

    // Verificar si el usuario ya existe (se verificará después de crear el gym)

    // Obtener IP del cliente
    const ipRegistro = getClientIP(req);

    // Generar gymId único
    const baseName = nombreGym
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 10)
      .toLowerCase() || 'gym';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const gymId = `${baseName}_${timestamp}${random}`;

    // Verificar que el gymId sea único (por si acaso hay colisión)
    let existingGymId = await Gym.findById(gymId);
    let finalGymId = gymId;
    let counter = 0;
    while (existingGymId && counter < 10) {
      const newRandom = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      finalGymId = `${baseName}_${timestamp}${newRandom}`;
      existingGymId = await Gym.findById(finalGymId);
      counter++;
    }

    // Preparar datos del gimnasio
    const gymData = {
      nombreGym,
      propietario,
      direccion,
      telefono,
      email: email.toLowerCase(),
      ipRegistro,
      datosFormulario: {}
    };

    // Guardar el gimnasio con la estructura: gimnasios > gymId > nombreGym > datos
    await Gym.saveGym(finalGymId, nombreGym, gymData);

    // Verificar si el usuario ya existe para este gymId
    const existingUser = await User.findUser(finalGymId, usuario.toLowerCase());
    if (existingUser) {
      // Si el usuario ya existe, eliminar el gym
      await Gym.findByIdAndDelete(finalGymId);
      return res.status(400).json({ 
        error: 'El nombre de usuario ya está en uso para este gimnasio' 
      });
    }

    // Hashear las contraseñas
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const empleadoPassword = await bcrypt.hash('12345', 10);

    // Crear usuario admin
    const adminUser = {
      username: usuario.toLowerCase(),
      password: hashedPassword,
      rol: 'admin',
      nombre: propietario,
      activo: true
    };

    // Crear usuarios empleados predeterminados
    const empleados = [
      { username: 'empleadoM', nombre: 'Empleado Mañana', shift: 'morning' },
      { username: 'empleadoT', nombre: 'Empleado Tarde', shift: 'afternoon' },
      { username: 'empleadoN', nombre: 'Empleado Noche', shift: 'night' }
    ];

    const empleadoUsers = empleados.map(empleado => ({
      username: empleado.username,
      password: empleadoPassword,
      rol: 'empleado',
      nombre: empleado.nombre,
      activo: true
    }));

    // Guardar todos los usuarios: usuarios > gymId > nombreGym > users[]
    const allUsers = [adminUser, ...empleadoUsers];
    await User.saveUsers(finalGymId, nombreGym, allUsers);

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

    // Buscar usuario (el username puede repetirse entre diferentes gimnasios)
    // Por ahora buscamos por username, pero idealmente deberíamos tener el gymId
    const user = await User.findOne({ 
      username: usuario.toLowerCase(),
      activo: true
    }).sort({ createdAt: -1 }); // Tomar el más reciente si hay duplicados

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
