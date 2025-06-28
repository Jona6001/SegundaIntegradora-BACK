import { Schema, model, Document } from 'mongoose';

export interface IUsuario extends Document {
  nombre: string;
  apellidos: string;
  role: 'empleado' | 'gerente' | 'administrador';
  telefono?: string;
  direccion?: string;
  password: string;
  status?: 'activo' | 'inactivo';
  creadoEn?: Date;
}

const usuarioSchema = new Schema<IUsuario>({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  role: { type: String, enum: ['empleado', 'gerente', 'administrador'], required: true },
  telefono: { type: String },
  direccion: { type: String },
  password: { type: String, required: true },
  status: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
  creadoEn: { type: Date, default: Date.now }
});

export default model<IUsuario>('Usuario', usuarioSchema);