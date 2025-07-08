import { Router } from "express";
import { deleteUser, getAllUsers, login, saveUser, updateUser, recoverPassword } from "../controllers/user.controller";


const router = Router();

//  Usar: /int/user
router.post("/login", login); 
router.get("/all", getAllUsers);
router.post("/save", saveUser);
router.patch("/update/:id",updateUser);
router.delete("/delete/:id", deleteUser); 
router.post("/recover-pass", recoverPassword);



export default router;
