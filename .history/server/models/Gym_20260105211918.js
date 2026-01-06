import mongoose from 'mongoose';

const gymSchema = new mongoose.Schema({
  gymId: {
    type: String,
    unique: true,
    index: true
  },
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
  timestamps: true,
  collection: 'gimnasios' // Nombre de la colección en MongoDB
});

// Hook para generar gymId si no se proporciona (fallback)
gymSchema.pre('save', async function(next) {
  if (!this.gymId) {
    // Generar ID único basado en nombre del gym, timestamp y número aleatorio
    const baseName = this.nombreGym
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 10)
      .toLowerCase() || 'gym';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.gymId = `${baseName}_${timestamp}${random}`;
  }
  next();
});

export default mongoose.model('Gym', gymSchema);
