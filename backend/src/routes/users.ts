import { Request, Router } from "express";
import UserController from "../controllers/user";
import { authenticateToken } from "../middleware/middleware";
import { UserInsert, UserUpdate } from "../models/users";
import { errorJson, successJson } from "../utils/jsonResponses";

const userRouter = Router();

userRouter.use(authenticateToken);

interface GetUserQuery {
  id?: string;
}

type CreateUserBody = UserInsert;

interface UpdateUserBody extends UserUpdate {
  id?: string;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

userRouter.get(
  "/userById",
  async (req: Request<{}, unknown, unknown, GetUserQuery>, res) => {
  const { id } = req.query;

  if (!isNonEmptyString(id)) {
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
}
);

userRouter.post("/addUser", async (req: Request<{}, unknown, CreateUserBody>, res) => {
  const { id, name, email } = req.body;

  if (!isNonEmptyString(name)) {
    res.status(400).send(errorJson("Missing or invalid 'name' in request body"));
    return;
  }

  if (!isNonEmptyString(email)) {
    res.status(400).send(errorJson("Missing or invalid 'email' in request body"));
    return;
  }

  if (id !== undefined && !isNonEmptyString(id)) {
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

userRouter.patch("/updateUser", async (req: Request<{}, unknown, UpdateUserBody>, res) => {
  const { id, ...updates } = req.body;

  if (!isNonEmptyString(id)) {
    res.status(400).send(errorJson("Missing or invalid 'id' in request body"));
    return;
  }

  if (updates.name !== undefined && !isNonEmptyString(updates.name)) {
    res.status(400).send(errorJson("Invalid 'name' field"));
    return;
  }

  if (updates.email !== undefined && !isNonEmptyString(updates.email)) {
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
