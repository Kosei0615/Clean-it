import { Router } from 'express';
import FrontDeskController from '../controllers/frontDeskController';

const router = Router();
const frontDeskController = new FrontDeskController();

export function setRoutes(app: Router) {
    app.post('/api/guests', frontDeskController.createGuest);
    app.get('/api/guests/:id', frontDeskController.getGuest);
    app.post('/api/reservations', frontDeskController.createReservation);
    app.get('/api/reservations/:id', frontDeskController.getReservation);
}