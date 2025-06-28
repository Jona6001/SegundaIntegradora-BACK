import { Request, Response } from "express";
import User from "../models/usuarios.models";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { generateAccessToken } from "../utils/generateToken";
import cache from "../utils/cache";

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
    const { nombre, apellidos, role, telefono, direccion, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        nombre,
        apellidos,
        role,
        telefono,
        direccion,
        password: hashedPassword,
        status: "activo",
        creadoEn: new Date(),
    });
    const user = await newUser.save();
    res.status(201).json({ message: "Usuario creado exitosamente", user });
    } catch (error) {
    res.status(500).json({ message: "Error al crear usuario", error });
    }
};

// ACTUALIZAR USUARIO
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
    const { id } = req.params;
    const { password, role, nombre, apellidos, telefono, direccion, status } = req.body;

    const updateData: any = {};
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (role) updateData.role = role;
    if (nombre) updateData.nombre = nombre;
    if (apellidos) updateData.apellidos = apellidos;
    if (telefono) updateData.telefono = telefono;
    if (direccion) updateData.direccion = direccion;
    if (status) updateData.status = status;

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