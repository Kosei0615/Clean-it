import { Request, Response } from 'express';
import { ReservationService } from '../services/reservationService';
import { RoomService } from '../services/roomService';

export class HousekeepingController {
    private reservationService: ReservationService;
    private roomService: RoomService;

    constructor() {
        this.reservationService = new ReservationService();
        this.roomService = new RoomService();
    }

    public async getReservationDetails(req: Request, res: Response): Promise<void> {
        const reservationId = req.params.id;
        try {
            const reservation = await this.reservationService.getReservationById(reservationId);
            if (reservation) {
                res.status(200).json(reservation);
            } else {
                res.status(404).json({ message: 'Reservation not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving reservation details', error });
        }
    }

    public async updateRoomStatus(req: Request, res: Response): Promise<void> {
        const roomId = req.params.id;
        const { status } = req.body;
        try {
            const updatedRoom = await this.roomService.updateRoomStatus(roomId, status);
            if (updatedRoom) {
                res.status(200).json(updatedRoom);
            } else {
                res.status(404).json({ message: 'Room not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error updating room status', error });
        }
    }
}