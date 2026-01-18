import { Router } from 'express';
import * as userController from '../controllers/userController';
import { validate } from '../middlewares/validate';
import {
  userLoginSchema,
  userRegisterSchema,
} from '../controllers/userController';

const router = Router();

router.post('/register', validate(userRegisterSchema), userController.register);
router.post('/login', validate(userLoginSchema), userController.login);

export default router;
