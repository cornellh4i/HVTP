import { Router } from "express";
import UserController from "../controllers/user";
import { authenticateToken } from "../middleware/middleware";
import { errorJson, successJson } from "../utils/jsonResponses";

const userRouter = Router();

userRouter.use(authenticateToken);

userRouter.get("/userById", async (req, res) => {
  const { id } = req.query;

  if (typeof id !== "string" || id.trim() === "") {
    res.status(400).send(errorJson("Missing or invalid 'id' query parameter"));
    return;
  }

  try {
    const user = await UserController.getUserById(id.trim());

    if (!user) {
      res.status(404).send(errorJson("User not found"));
      return;
    }

    res.status(200).send(successJson(user));
  } catch (error) {
    res.status(500).send(errorJson(error));
  }
});

userRouter.post("/createUser", async (req, res) => {
  const { id, name, email } = req.body as {
    id?: string;
    name?: string;
    email?: string;
  };

  if (!name || typeof name !== "string" || name.trim() === "") {
    res.status(400).send(errorJson("Missing or invalid 'name' in request body"));
    return;
  }

  if (!email || typeof email !== "string" || email.trim() === "") {
    res.status(400).send(errorJson("Missing or invalid 'email' in request body"));
    return;
  }

  if (id !== undefined && (typeof id !== "string" || id.trim() === "")) {
    res.status(400).send(errorJson("Invalid 'id' in request body"));
    return;
  }

  try {
    const createdUser = await UserController.createUser({
      ...(id !== undefined ? { id: id.trim() } : {}),
      name: name.trim(),
      email: email.trim(),
    });

    res.status(201).send(successJson(createdUser));
  } catch (error) {
    res.status(500).send(errorJson(error));
  }
});

userRouter.patch("/updateUser", async (req, res) => {
  const { id, ...updates } = req.body as {
    id?: string;
    name?: string;
    email?: string;
  };

  if (!id || typeof id !== "string" || id.trim() === "") {
    res.status(400).send(errorJson("Missing or invalid 'id' in request body"));
    return;
  }

  if (
    updates.name !== undefined &&
    (typeof updates.name !== "string" || updates.name.trim() === "")
  ) {
    res.status(400).send(errorJson("Invalid 'name' field"));
    return;
  }

  if (
    updates.email !== undefined &&
    (typeof updates.email !== "string" || updates.email.trim() === "")
  ) {
    res.status(400).send(errorJson("Invalid 'email' field"));
    return;
  }

  try {
    const updatedUser = await UserController.updateUser(id.trim(), {
      ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
      ...(updates.email !== undefined ? { email: updates.email.trim() } : {}),
    });

    if (!updatedUser) {
      res.status(404).send(errorJson("User not found"));
      return;
    }

    res.status(200).send(successJson(updatedUser));
  } catch (error) {
    res.status(500).send(errorJson(error));
  }
});

export default userRouter;
