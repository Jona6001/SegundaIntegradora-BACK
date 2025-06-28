import { Request, Response } from "express";
import Sell from "../models/ventas.models";

// Obtener todas las ventas
export const getAllSells = async (req: Request, res: Response): Promise<void> => {
    try {
        const sellsList = await Sell.find();
        res.json({ sellsList });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las ventas", error });
    }
};

// Obtener una venta por ID
export const getSellById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const sell = await Sell.findById(id);
        if (!sell) {
            res.status(404).json({ message: "Venta no encontrada" });
            return;
        }
        res.json({ sell });
    } catch (error) {
        res.status(500).json({ message: "Error al buscar la venta", error });
    }
};

// Crear venta
export const createSell = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productos, total, vendedor_id, status } = req.body;
        const newSell = new Sell({
            productos,
            total,
            vendedor_id,
            status: status || "activo",
            fecha: new Date()
        });
        const sell = await newSell.save();
        res.status(201).json({ message: "Venta creada exitosamente", sell });
    } catch (error) {
        res.status(500).json({ message: "Error al crear venta", error });
    }
};

// Actualizar venta
export const updateSell = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { productos, total, vendedor_id, status } = req.body;
        const updateData: any = {};
        if (productos) updateData.productos = productos;
        if (total !== undefined) updateData.total = total;
        if (vendedor_id !== undefined) updateData.vendedor_id = vendedor_id;
        if (status) updateData.status = status;

        const sell = await Sell.findByIdAndUpdate(id, updateData, { new: true });
        if (!sell) {
            res.status(404).json({ message: "Venta no encontrada" });
            return;
        }
        res.json({ message: "Venta actualizada", sell });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar venta", error });
    }
};

// Eliminar (dar de baja) venta
export const deleteSell = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const sell = await Sell.findByIdAndUpdate(
            id,
            { status: "inactivo" },
            { new: true }
        );
        if (!sell) {
            res.status(404).json({ message: "No se pudo eliminar la venta" });
            return;
        }
        res.json({ message: "Venta dada de baja", sell });
    } catch (error) {
        res.status(500).json({ message: "Error al dar de baja venta", error });
    }
};