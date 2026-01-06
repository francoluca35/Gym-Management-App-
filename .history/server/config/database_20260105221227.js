import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Obtener la URI base (sin nombre de base de datos)
let MONGODB_URI_BASE = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// Si la URI tiene un nombre de base de datos, removerlo
if (MONGODB_URI_BASE.includes('mongodb+srv://')) {
  // Para MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/olddb?params
  const match = MONGODB_URI_BASE.match(/^(mongodb\+srv:\/\/[^\/]+)(\/[^?]+)?(\?.*)?$/);
  if (match) {
    MONGODB_URI_BASE = match[1] + (match[3] || '');
  }
} else if (MONGODB_URI_BASE.includes('mongodb://')) {
  // Para MongoDB local: mongodb://localhost:27017/olddb?params
  const match = MONGODB_URI_BASE.match(/^(mongodb:\/\/[^\/]+)(\/[^?]+)?(\?.*)?$/);
  if (match) {
    MONGODB_URI_BASE = match[1] + (match[3] || '');
  }
}

// Función para construir URI con nombre de base de datos
const buildURI = (dbName) => {
  if (MONGODB_URI_BASE.includes('?')) {
    return MONGODB_URI_BASE.replace('?', `/${dbName}?`);
  }
  return `${MONGODB_URI_BASE}/${dbName}`;
};

// Conexiones separadas para cada base de datos
let gymConnection = null;
let userConnection = null;

export const connectDB = async () => {
  try {
    console.log(`🔌 Conectando a MongoDB...`);
    
    // Conectar a la base de datos "gimnasios"
    const gymURI = buildURI('gimnasios');
    gymConnection = await mongoose.createConnection(gymURI);
    console.log(`✅ Conectado a base de datos: gimnasios`);
    
    // Conectar a la base de datos "usuarios"
    const userURI = buildURI('usuarios');
    userConnection = await mongoose.createConnection(userURI);
    console.log(`✅ Conectado a base de datos: usuarios`);
    
    // También mantener la conexión principal para compatibilidad (usar gimnasios como default)
    await mongoose.connect(gymURI);
    console.log(`✅ Conexión principal establecida en: gimnasios`);
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    console.error('💡 Asegúrate de que:');
    console.error('   1. MongoDB esté corriendo (si usas MongoDB local)');
    console.error('   2. La URI de conexión en .env sea correcta');
    console.error('   3. Las credenciales sean válidas (si usas MongoDB Atlas)');
    throw error;
  }
};
// Exportar las conexiones para usar en los modelos
export const getGymConnection = () => {
  if (!gymConnection) {
    throw new Error('La conexión a la base de datos "gimnasios" no está inicializada');
  }
  return gymConnection;
};

export const getUserConnection = () => {
  if (!userConnection) {
    throw new Error('La conexión a la base de datos "usuarios" no está inicializada');
  }
  return userConnection;
};

