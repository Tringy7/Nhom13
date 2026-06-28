import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import http from "http";
import viewEngine from "./config/viewEngine.js";
import initWebRoutes from "./route/web.js";
import connectDB from "./config/configdb.js";
import db from "./entities/index.js"; // Import db
import initSocket from "./socket.js";

// config dotenv
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieParser());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
    const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// view engine
viewEngine(app);

// routes
initWebRoutes(app);

// port
const port = process.env.PORT || 8080;

// start server
const startServer = async () => {
    try {
        await connectDB();
        const server = http.createServer(app);
        initSocket(server);
        
        server.listen(port, () => {
            console.log(
                `Backend Nodejs is running on port: ${port}`
            );
        });
    } catch (error) {
        console.error("Failed to start the server:", error);
    }
};

startServer();