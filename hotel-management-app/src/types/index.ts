export interface GuestInfo {
    name: string;
    stayDuration: number; // in days
    region: string;
    source: string;
    demographics: {
        adultMen: number;
        adultWomen: number;
        elementarySchoolStudents: number;
        infantsWithMeal: number;
        infantsWithoutMeal: number;
    };
    totalGuests: number;
    additionalInfo?: string;
}

export interface ReservationInfo {
    guest: GuestInfo;
    roomNumber: string;
    checkInDate: Date;
    checkOutDate: Date;
    totalGuests: number;
    additionalInfo?: string;
}