import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { NextFunction, Request, Response } from "express";
import swaggerUI from "swagger-ui-express";
import spec from "../api-spec.json";
import { dbConnect } from "./database";
import itemRoutes from "./routes/items";
import userRouter from "./routes/users";
import locationRoutes from "./routes/locations";
import inventoryRoutes from "./routes/inventory";
import auditLogRoutes from "./routes/auditLogs";
import farmerRoutes from "./routes/farmers";
import salesRoutes from "./routes/sales";
import dashboardRoutes from "./routes/dashboard";

const app = express();

// Middleware to parse json request bodies
app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(spec));

/**
 * Sub-routers for our main router, we should have one sub-router per 'entity' in the application
 */
// app.use('/users', userRouter);
app.use("/api", itemRoutes);
app.use("/api", userRouter);
app.use("/api", locationRoutes);
app.use("/api/", auditLogRoutes);
app.use("/api", farmerRoutes);
app.use("/api", inventoryRoutes);
app.use("/api", salesRoutes);
app.use("/api/dashboard", dashboardRoutes);

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
