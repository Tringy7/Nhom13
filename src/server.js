import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import viewEngine from "./config/viewEngine.js";
import initWebRoutes from "./route/web.js";
import connectDB from "./config/configdb.js";

// load env
dotenv.config();

const app = express();

// connect database
connectDB();

// middleware
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieParser());

// config view engine
viewEngine(app);

// init routes
initWebRoutes(app);

// port
const port = process.env.PORT || 6969;

// start server
app.listen(port, () => {
    console.log(`Backend Nodejs is running on port: ${port}`);
});