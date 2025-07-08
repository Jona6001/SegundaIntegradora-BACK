import { Request, Response } from "express";
import User from "../models/usuarios.models";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { generateAccessToken } from "../utils/generateToken";
import cache from "../utils/cache";
import { sendEmail } from "../utils/sendEmail";

// LOGIN
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre, password } = req.body;
        const user = await User.findOne({ nombre }) as (typeof User)["prototype"] & { _id: any };

        if (!user) {
            res.status(401).json({ message: "Usuario no encontrado" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Contraseña incorrecta" });
            return;
        }

        const userId = user._id.toString();
        const accessToken = generateAccessToken(userId);
        cache.set(userId, accessToken, 60 * 15); // 15 minutos

        res.json({
            message: "Login exitoso",
            accessToken,
            user: { _id: user._id, nombre: user.nombre, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: "Error en login", error });
    }
};

// OBTENER TODOS LOS USUARIOS
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const userList = await User.find();
        res.json({ userList });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios", error });
    }
};

// CREAR USUARIO
export const saveUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre, apellidos, role, telefono, direccion, password, email } = req.body;

        if (!email) {
            res.status(400).json({ message: "El campo email es obligatorio" });
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "El email ya está registrado" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            nombre,
            apellidos,
            role,
            telefono,
            direccion,
            password: hashedPassword,
            email,
            status: "activo",
            creadoEn: new Date(),
        });

        const user = await newUser.save();

        await sendEmail(
            email,
            "Bienvenido/a al sistema",
            `Hola ${nombre},\n\nTu cuenta ha sido creada exitosamente.\n\n¡Bienvenido/a al sistema!\n\nSaludos.`
        );

        res.status(201).json({ message: "Usuario creado exitosamente", user });
    } catch (error) {
        res.status(500).json({ message: "Error al crear usuario", error });
    }
};


// ACTUALIZAR USUARIO
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { password, role, nombre, apellidos, telefono, direccion, status, email } = req.body;

        const updateData: any = {};
        if (password) updateData.password = await bcrypt.hash(password, 10);
        if (role) updateData.role = role;
        if (nombre) updateData.nombre = nombre;
        if (apellidos) updateData.apellidos = apellidos;
        if (telefono) updateData.telefono = telefono;
        if (direccion) updateData.direccion = direccion;
        if (status) updateData.status = status;
        if (email) updateData.email = email;

        // verificar Email no esté duplicado
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                res.status(400).json({ message: "El email ya está registrado por otro usuario" });
                return;
            }
        }

        const user = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return;
        }
        res.json({ message: "Usuario actualizado", user });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar usuario", error });
    }
};

// ELIMINAR (DAR DE BAJA) USUARIO
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(
            id,
            { status: "inactivo", eliminadoEn: new Date() },
            { new: true }
        );
        if (!user) {
            res.status(404).json({ message: "No se pudo eliminar el usuario" });
            return;
        }
        res.json({ message: "Usuario dado de baja", user });
    } catch (error) {
        res.status(500).json({ message: "Error al dar de baja usuario", error });
    }
};

// RECUPERAR CONTRASEÑA
export const recoverPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado con ese email" });
            return;
        }

        // Genera una nueva contraseña temporal
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        user.password = hashedPassword;
        await user.save();

        // Envía el correo al usuario
        await sendEmail(
            email,
            "Recuperación de contraseña",
            `Hola ${user.nombre}, tu nueva contraseña temporal es: ${tempPassword}\nPor favor, cámbiala después de iniciar sesión.`
        );

        res.json({ message: "Contraseña restablecida. Revisa tu correo electrónico." });
    } catch (error) {
        res.status(500).json({ message: "Error al recuperar contraseña", error });
    }
};