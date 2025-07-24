export class Room {
    roomNumber: string;
    type: string;
    isAvailable: boolean;

    constructor(roomNumber: string, type: string, isAvailable: boolean = true) {
        this.roomNumber = roomNumber;
        this.type = type;
        this.isAvailable = isAvailable;
    }

    checkAvailability(): boolean {
        return this.isAvailable;
    }

    updateStatus(status: boolean): void {
        this.isAvailable = status;
    }
}