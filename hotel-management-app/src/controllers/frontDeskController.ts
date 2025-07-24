import { Request, Response } from 'express';
import { ReservationService } from '../services/reservationService';
import { Guest } from '../models/guest';
import { Reservation } from '../models/reservation';

export class FrontDeskController {
    private reservationService: ReservationService;

    constructor() {
        this.reservationService = new ReservationService();
    }

    public async createReservation(req: Request, res: Response): Promise<void> {
        try {
            const guestData = req.body;
            const guest = new Guest(
                guestData.name,
                guestData.region,
                guestData.source,
                guestData.adultMen,
                guestData.adultWomen,
                guestData.elementarySchoolStudents,
                guestData.infantsWithMeal,
                guestData.infantsWithoutMeal
            );

            const reservation = new Reservation(
                guest,
                guestData.roomNumber,
                guestData.stayDuration,
                guestData.additionalInfo
            );

            await this.reservationService.createReservation(reservation);
            res.status(201).json({ message: 'Reservation created successfully', reservation });
        } catch (error) {
            res.status(400).json({ message: 'Error creating reservation', error });
        }
    }
}