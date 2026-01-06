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
userSchema.statics.addUser = async function(nombreGym, userData) {
  const userDoc = await this.findById(nombreGym);
  
  if (!userDoc) {
    // Crear nuevo documento
    const newDoc = {
      _id: nombreGym,
      users: [userData]
    };
    return await this.create(newDoc);
  }
  
  // Agregar usuario al array
  const docObj = userDoc.toObject();
  if (!docObj.users) {
    docObj.users = [];
  }
  
  // Verificar que el usuario no exista
  const existingUser = docObj.users.find(
    u => u.username === userData.username
  );
  
  if (existingUser) {
    throw new Error('El usuario ya existe');
  }
  
  docObj.users.push(userData);
  
  return await this.findByIdAndUpdate(
    nombreGym,
    { $set: { users: docObj.users } },
    { new: true }
  );
};

// Método estático para buscar un usuario
userSchema.statics.findUser = async function(nombreGym, username) {
  const userDoc = await this.findById(nombreGym);
  if (!userDoc || !userDoc.users) return null;
  
  return userDoc.users.find(u => u.username === username.toLowerCase());
};

// Método estático para obtener todos los usuarios de un gimnasio
userSchema.statics.getUsersByGym = async function(nombreGym) {
  const userDoc = await this.findById(nombreGym);
  if (!userDoc || !userDoc.users) return [];
  
  return userDoc.users;
};

// Función para obtener el modelo (lazy loading después de que la conexión esté lista)
const getUserModel = () => {
  const userConnection = getUserConnection();
  return userConnection.models.User || userConnection.model('User', userSchema);
};

export default getUserModel();
