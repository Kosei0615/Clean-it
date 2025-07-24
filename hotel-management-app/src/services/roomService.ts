export class RoomService {
    private rooms: Room[];

    constructor(rooms: Room[]) {
        this.rooms = rooms;
    }

    public checkAvailability(roomType: string, checkInDate: Date, checkOutDate: Date): boolean {
        // Logic to check room availability based on type and dates
        return this.rooms.some(room => room.type === roomType && room.isAvailable(checkInDate, checkOutDate));
    }

    public updateRoomAssignment(roomNumber: number, guestName: string): void {
        const room = this.rooms.find(r => r.roomNumber === roomNumber);
        if (room) {
            room.assignToGuest(guestName);
        }
    }

    public getAvailableRooms(): Room[] {
        return this.rooms.filter(room => room.isAvailable());
    }
}