import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  gymId: {
    type: String,
    required: true,
    index: true
  },
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
  timestamps: true
});

// Índice compuesto único para que username sea único por gymId
userSchema.index({ gymId: 1, username: 1 }, { unique: true });

export default mongoose.model('User', userSchema);
