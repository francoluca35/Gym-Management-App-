import mongoose from 'mongoose';

// Esquema para usuarios individuales
const userDataSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['admin', 'empleado'],
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  _id: false,
  timestamps: true
});

// Esquema principal: usuarios > gymId > nombreGym > users[]
const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    alias: 'gymId'
  }
}, {
  collection: 'gyms', // Colección: gyms (no usuarios)
  strict: false // Permite campos dinámicos
});

// Método estático para guardar usuarios con la estructura anidada
// Estructura: { _id: nombreGym, users: [admin, empleadoM, empleadoT, empleadoN] }
userSchema.statics.saveUsers = async function(nombreGym, users) {
  // Crear el documento con la estructura: { _id: nombreGym, users: [...] }
  const userDoc = {
    _id: nombreGym,
    users: users
  };
  
  return await this.findByIdAndUpdate(
    nombreGym,
    userDoc,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

// Método estático para agregar un usuario
userSchema.statics.addUser = async function(gymId, nombreGym, userData) {
  const userDoc = await this.findById(gymId);
  
  if (!userDoc) {
    // Crear nuevo documento
    const newDoc = {
      _id: gymId,
      [nombreGym]: {
        users: [userData]
      }
    };
    return await this.create(newDoc);
  }
  
  // Agregar usuario al array
  const docObj = userDoc.toObject();
  if (!docObj[nombreGym]) {
    docObj[nombreGym] = { users: [] };
  }
  if (!docObj[nombreGym].users) {
    docObj[nombreGym].users = [];
  }
  
  // Verificar que el usuario no exista
  const existingUser = docObj[nombreGym].users.find(
    u => u.username === userData.username
  );
  
  if (existingUser) {
    throw new Error('El usuario ya existe');
  }
  
  docObj[nombreGym].users.push(userData);
  
  return await this.findByIdAndUpdate(
    gymId,
    { $set: docObj },
    { new: true }
  );
};

// Método estático para buscar un usuario
userSchema.statics.findUser = async function(gymId, username) {
  const userDoc = await this.findById(gymId);
  if (!userDoc) return null;
  
  const docObj = userDoc.toObject();
  const nombreGym = Object.keys(docObj).find(key => key !== '_id' && key !== '__v');
  
  if (!nombreGym || !docObj[nombreGym] || !docObj[nombreGym].users) {
    return null;
  }
  
  return docObj[nombreGym].users.find(u => u.username === username.toLowerCase());
};

// Método estático para obtener todos los usuarios de un gimnasio
userSchema.statics.getUsersByGym = async function(gymId) {
  const userDoc = await this.findById(gymId);
  if (!userDoc) return [];
  
  const docObj = userDoc.toObject();
  const nombreGym = Object.keys(docObj).find(key => key !== '_id' && key !== '__v');
  
  if (!nombreGym || !docObj[nombreGym] || !docObj[nombreGym].users) {
    return [];
  }
  
  return docObj[nombreGym].users;
};

// Función para obtener el modelo (lazy loading después de que la conexión esté lista)
const getUserModel = () => {
  const userConnection = getUserConnection();
  return userConnection.models.User || userConnection.model('User', userSchema);
};

export default getUserModel();
