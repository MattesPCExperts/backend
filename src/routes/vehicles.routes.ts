import { Router } from 'express';
import { authenticateJwt } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { deleteVehicle, getVehicles, saveVehicles } from '../controllers/vehicles.controller';
import { saveVehiclesSchema, vehicleIdParamSchema } from '../utils/validators';

const router = Router();

router.use(authenticateJwt);

router.post('/save', validateRequest(saveVehiclesSchema), saveVehicles);
router.get('/', getVehicles);
router.delete('/:id', validateRequest(vehicleIdParamSchema), deleteVehicle);

export default router;

