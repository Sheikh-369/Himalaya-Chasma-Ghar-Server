import express from "express";

const app = express();

import "./database/connection"

import authRoute from "./routes/auth-route"
import productRoute from "./routes/product-route"

app.use(express.json())

//for authentications
app.use("/himalaya/auth",authRoute)

//for product
app.use("/himalaya",productRoute)

export default app;
