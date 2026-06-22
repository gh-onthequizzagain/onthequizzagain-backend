import "dotenv/config";
import express from "express";
import cors from "cors";

import defaultRouter from "./routes/default";

import questionRouter from "./routes/question.routes";

import { PORT_SERVER, DB_NAME } from "./constants";
import { logInfo } from "./helpers/log";

import errorHandler from "./middlewares/error";
import { connectDB } from "./config/db";

// mongoDb init
connectDB(DB_NAME);

// express init
const app = express();
app.use(express.json());
app.use(cors());

//routes métier (montées avant le routeur par défaut qui contient le 404)

app.use("/api/questions", questionRouter);

//routes par défaut (welcome + catch-all 404)
app.use(defaultRouter);

//Error : on gère les erreurs de maniere global
//bien mettre l appelle après tout sinon sa marche pas
app.use(errorHandler);

app.listen(PORT_SERVER, () => logInfo(`Server running at port ${PORT_SERVER}`));
