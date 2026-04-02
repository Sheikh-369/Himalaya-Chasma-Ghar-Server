import express from "express";
import cors from "cors"

const app = express();

import "./database/connection"

import authRoute from "./routes/auth-route"
import productRoute from "./routes/product-route"
import orderRoute from "./routes/order-route"

app.use(express.json())

app.use(
  cors({
    origin:[
      "http://localhost:4028",
      "himalayachasmaghar.vercel.app"
    ],  //do not use slash(/) here

    credentials: true
  })
);

//for authentications
app.use("/himalaya/auth",authRoute)

//for product
app.use("/himalaya",productRoute)

//for order
app.use("/himalaya",orderRoute)

export default app;
