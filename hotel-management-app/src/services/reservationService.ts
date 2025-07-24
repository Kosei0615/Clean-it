export class ReservationService {
    private reservations: Reservation[] = [];

    createReservation(guest: Guest, room: Room, stayDuration: number, additionalInfo?: string): Reservation {
        const totalGuests = guest.adultMen + guest.adultWomen + guest.elementarySchoolStudents + guest.infantsWithMeal + guest.infantsWithoutMeal;
        const reservation = new Reservation(guest, room, stayDuration, totalGuests, additionalInfo);
        this.reservations.push(reservation);
        return reservation;
    }

    updateReservation(reservationId: number, updatedData: Partial<Reservation>): Reservation | null {
        const reservation = this.reservations.find(res => res.id === reservationId);
        if (reservation) {
            Object.assign(reservation, updatedData);
            return reservation;
        }
        return null;
    }

    getReservation(reservationId: number): Reservation | null {
        return this.reservations.find(res => res.id === reservationId) || null;
    }

    getAllReservations(): Reservation[] {
        return this.reservations;
    }
}