import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Nombre de la base de datos única
const DB_NAME = 'gym-management';

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

// Construir la URI final con el nombre de base de datos
let MONGODB_URI;
if (MONGODB_URI_BASE.includes('?')) {
  MONGODB_URI = MONGODB_URI_BASE.replace('?', `/${DB_NAME}?`);
} else {
  MONGODB_URI = `${MONGODB_URI_BASE}/${DB_NAME}`;
}

export const connectDB = async () => {
  try {
    console.log(`🔌 Conectando a MongoDB...`);
    console.log(`📊 Base de datos: ${DB_NAME}`);
    
    const options = {
      dbName: DB_NAME, // Forzar el nombre de la base de datos
    };
    
    await mongoose.connect(MONGODB_URI, options);
    
    // Verificar que realmente esté usando la base de datos correcta
    const actualDbName = mongoose.connection.db.databaseName;
    if (actualDbName !== DB_NAME) {
      console.error(`❌ ERROR: Se está usando la base de datos "${actualDbName}" en lugar de "${DB_NAME}"`);
      throw new Error(`Base de datos incorrecta: ${actualDbName}`);
    }
    
    console.log('✅ MongoDB conectado exitosamente');
    console.log(`📊 Base de datos confirmada: ${actualDbName}`);
    console.log(`📁 Colecciones: gimnasios, gyms`);
    
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
