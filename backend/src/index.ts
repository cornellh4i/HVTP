import express from 'express';
import bodyParser from 'body-parser';
// import userRouter from './users/views';
import itemsRouter from './routes/items'; 
import customerRouter from './customers/views';
import swaggerUI from 'swagger-ui-express';
import spec from '../api-spec.json';
import { dbConnect } from './database';
import itemRoutes from './routes/items';
import userRouter from "./routes/users";
import locationRoutes from "./routes/locations";
import inventoryRoutes from "./routes/inventory";

const app = express();
 
// Middleware to parse json request bodies
app.use(bodyParser.json()); 
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(spec));

/**
 * Sub-routers for our main router, we should have one sub-router per 'entity' in the application
 */
// app.use('/users', userRouter);
app.use('/customers', customerRouter);
app.use('/api/middleware', itemRoutes);
app.use("/api/middleware", userRouter);
app.use("/api/middleware", inventoryRoutes);
app.use("/api/middleware", locationRoutes);

/**
 * Some dummy routes to illustrate express syntax
 */
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/', (req, res) => {
  res.send(req.body);
});

app.listen(process.env.PORT || 8000, async () => {
  console.log('✅ Server is up and running');
  await dbConnect();
});
