import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { NextFunction, Request, Response } from "express";
// import userRouter from './users/views';
import customerRouter from "./customers/views";
import swaggerUI from "swagger-ui-express";
import spec from "../api-spec.json";
import { dbConnect } from "./database";
import itemRoutes from "./routes/items";
import userRouter from "./routes/users";
import locationRoutes from "./routes/locations";
import inventoryRoutes from "./routes/inventory";
import auditLogRoutes from "./routes/auditLogs";

const app = express();

// Middleware to parse json request bodies
app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(spec));

/**
 * Sub-routers for our main router, we should have one sub-router per 'entity' in the application
 */
// app.use('/users', userRouter);
app.use("/customers", customerRouter);
app.use("/api/middleware", itemRoutes);
app.use("/api/middleware", userRouter);
app.use("/api/middleware", inventoryRoutes);
app.use("/api/middleware", locationRoutes);
app.use("/api/", auditLogRoutes);
app.use("/api", inventoryRoutes);

/**
 * Some dummy routes to illustrate express syntax
 */
app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.post("/", (req, res) => {
  res.send(req.body);
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

app.listen(process.env.PORT || 8000, async () => {
  console.log("✅ Server is up and running");
  await dbConnect();
});
