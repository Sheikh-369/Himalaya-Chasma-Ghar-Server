import express from "express";

const app = express();

import "./database/connection"

import authRoute from "./routes/auth-route"

app.use(express.json())

//for authentications
app.use("/himalaya/auth",authRoute)

export default app;
