import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_NAME = 'gym-management';
let MONGODB_URI = process.env.MONGODB_URI || `mongodb://localhost:27017/${DB_NAME}`;

// Asegurarse de que la URI incluya el nombre de la base de datos
if (MONGODB_URI.includes('?')) {
  const [baseUri, queryParams] = MONGODB_URI.split('?');
  if (!baseUri.endsWith(DB_NAME)) {
    const uriWithoutDb = baseUri.replace(/\/[^\/]+$/, '');
    MONGODB_URI = `${uriWithoutDb}/${DB_NAME}?${queryParams}`;
  }
} else {
  if (!MONGODB_URI.endsWith(DB_NAME)) {
    MONGODB_URI = MONGODB_URI.replace(/\/[^\/]+$/, `/${DB_NAME}`) || `${MONGODB_URI}/${DB_NAME}`;
  }
}

async function fixIndexes() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log('✅ Conectado a MongoDB');
    console.log(`📊 Base de datos: ${mongoose.connection.db.databaseName}`);

    const db = mongoose.connection.db;
    const usersCollection = db.collection('usuarios');

    // Obtener todos los índices
    const indexes = await usersCollection.indexes();
    console.log('📋 Índices actuales:', indexes.map(idx => idx.name));

    // Eliminar el índice antiguo de username si existe
    try {
      await usersCollection.dropIndex('username_1');
      console.log('✅ Índice antiguo "username_1" eliminado');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  El índice "username_1" no existe (ya fue eliminado)');
      } else {
        throw err;
      }
    }

    // Verificar que el índice compuesto existe
    const finalIndexes = await usersCollection.indexes();
    const hasCompoundIndex = finalIndexes.some(
      idx => idx.name === 'gymId_1_username_1' || 
             (idx.key && idx.key.gymId === 1 && idx.key.username === 1)
    );

    if (!hasCompoundIndex) {
      console.log('⚠️  El índice compuesto no existe. Se creará automáticamente al usar el modelo.');
    } else {
      console.log('✅ Índice compuesto (gymId, username) existe');
    }

    console.log('📋 Índices finales:', finalIndexes.map(idx => idx.name));

    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIndexes();
