import { Router } from 'express';
import HousekeepingController from '../controllers/housekeepingController';

const router = Router();
const housekeepingController = new HousekeepingController();

const setRoutes = () => {
    router.get('/reservations', housekeepingController.getReservations);
    router.put('/rooms/:roomId/status', housekeepingController.updateRoomStatus);
    // Additional routes can be added here as needed

    return router;
};

export default setRoutes;