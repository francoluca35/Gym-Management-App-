import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Nombre de la base de datos
const DB_NAME = 'gym-management';

// Obtener la URI y asegurarse de que incluya el nombre de la base de datos
let MONGODB_URI = process.env.MONGODB_URI || `mongodb://localhost:27017/${DB_NAME}`;

// Si la URI no termina con el nombre de la base de datos, agregarlo
if (MONGODB_URI.includes('mongodb+srv://') || MONGODB_URI.includes('mongodb://')) {
  // Si tiene parámetros de consulta, insertar el nombre de la base de datos antes de ellos
  if (MONGODB_URI.includes('?')) {
    const [baseUri, queryParams] = MONGODB_URI.split('?');
    if (!baseUri.endsWith(DB_NAME)) {
      // Remover cualquier nombre de base de datos existente y agregar el correcto
      const uriWithoutDb = baseUri.replace(/\/[^\/]+$/, '');
      MONGODB_URI = `${uriWithoutDb}/${DB_NAME}?${queryParams}`;
    }
  } else {
    // Si no tiene parámetros, asegurarse de que termine con el nombre de la base de datos
    if (!MONGODB_URI.endsWith(DB_NAME) && !MONGODB_URI.match(/\/[^\/]+$/)) {
      MONGODB_URI = `${MONGODB_URI}/${DB_NAME}`;
    } else if (!MONGODB_URI.endsWith(DB_NAME)) {
      // Reemplazar el nombre de la base de datos si existe otro
      MONGODB_URI = MONGODB_URI.replace(/\/[^\/]+$/, `/${DB_NAME}`);
    }
  }
}

export const connectDB = async () => {
  try {
    const options = {
      dbName: DB_NAME, // Especificar explícitamente el nombre de la base de datos
    };
    
    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ MongoDB conectado exitosamente');
    console.log(`📊 Base de datos: ${mongoose.connection.db.databaseName}`);
    console.log(`🔗 URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Ocultar credenciales
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
