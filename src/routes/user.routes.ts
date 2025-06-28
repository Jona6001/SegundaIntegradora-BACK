import { Router } from "express";
import { deleteUser, getAllUsers, login, saveUser, updateUser } from "../controllers/user.controller";


const router = Router();

//  Usar: /int/user
router.post("/login", login); 
router.get("/all", getAllUsers);
router.post("/save", saveUser);
router.patch("/update/:id",updateUser);
router.delete("/delete/:id", deleteUser); 


export default router;
