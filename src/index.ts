import express from 'express';
import morgan from 'morgan';
import userRoutes  from './routes/user.routes';
import ProductRoutes from './routes/product.routes'
import StockRoutes from './routes/stock.routes'
import SellsRoutes from './routes/sell.routes';
import connect from './config/db';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 6001;

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());



app.use("/int/user", userRoutes);
app.use("/int/products", ProductRoutes);
app.use("/int/stock", StockRoutes);
app.use("/int/sells", SellsRoutes);






connect().then(() => {
app.listen(PORT, () => {
    console.log(`Servidor corriendo en: http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error('Error al conectar a la base de datos:', err);
});