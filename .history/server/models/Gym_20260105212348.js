import mongoose from 'mongoose';

// Esquema para la estructura anidada: gimnasios > gymId > nombreGym > datos
const gymDataSchema = new mongoose.Schema({
  nombreGym: {
    type: String,
    required: true
  },
  direccion: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  propietario: {
    type: String,
    required: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  },
  ipRegistro: {
    type: String,
    required: true
  },
  datosFormulario: {
    capacidadMaxima: Number,
    horarios: String,
    tiposClases: [String],
    planes: [{
      nombre: String,
      precio: Number
    }],
    instagram: String,
    descripcion: String
  }
}, {
  _id: false,
  timestamps: true
});

// Esquema principal que usa gymId como _id
const gymSchema = new mongoose.Schema({
  _id: {
    type: String,
    alias: 'gymId'
  }
}, {
  collection: 'gimnasios',
  strict: false // Permite campos dinámicos
});

// Método estático para guardar con la estructura anidada
gymSchema.statics.saveGym = async function(gymId, nombreGym, gymData) {
  // Crear el documento con la estructura: { _id: gymId, [nombreGym]: gymData }
  const gymDoc = {
    _id: gymId
  };
  gymDoc[nombreGym] = gymData;
  
  return await this.findByIdAndUpdate(
    gymId,
    gymDoc,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

// Método estático para obtener un gimnasio
gymSchema.statics.getGym = async function(gymId) {
  const gym = await this.findById(gymId);
  if (!gym) return null;
  
  // Obtener el nombre del gimnasio (primer campo que no sea _id)
  const nombreGym = Object.keys(gym.toObject()).find(key => key !== '_id' && key !== '__v');
  if (!nombreGym) return null;
  
  return {
    gymId: gym._id,
    nombreGym: nombreGym,
    ...gym.toObject()[nombreGym]
  };
};

export default mongoose.model('Gym', gymSchema);
