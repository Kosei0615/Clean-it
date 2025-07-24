export class Reservation {
    guestName: string;
    stayDuration: number; // in days
    roomNumber: string;
    region: string;
    bookingSource: string;
    totalGuests: number;
    adultMen: number;
    adultWomen: number;
    elementarySchoolStudents: number;
    infantsWithMeal: number;
    infantsWithoutMeal: number;
    additionalInfo: string;

    constructor(
        guestName: string,
        stayDuration: number,
        roomNumber: string,
        region: string,
        bookingSource: string,
        adultMen: number,
        adultWomen: number,
        elementarySchoolStudents: number,
        infantsWithMeal: number,
        infantsWithoutMeal: number,
        additionalInfo: string
    ) {
        this.guestName = guestName;
        this.stayDuration = stayDuration;
        this.roomNumber = roomNumber;
        this.region = region;
        this.bookingSource = bookingSource;
        this.adultMen = adultMen;
        this.adultWomen = adultWomen;
        this.elementarySchoolStudents = elementarySchoolStudents;
        this.infantsWithMeal = infantsWithMeal;
        this.infantsWithoutMeal = infantsWithoutMeal;
        this.totalGuests = this.calculateTotalGuests();
        this.additionalInfo = additionalInfo;
    }

    private calculateTotalGuests(): number {
        return this.adultMen + this.adultWomen + this.elementarySchoolStudents + this.infantsWithMeal + this.infantsWithoutMeal;
    }

    public getReservationDetails(): object {
        return {
            guestName: this.guestName,
            stayDuration: this.stayDuration,
            roomNumber: this.roomNumber,
            region: this.region,
            bookingSource: this.bookingSource,
            totalGuests: this.totalGuests,
            adultMen: this.adultMen,
            adultWomen: this.adultWomen,
            elementarySchoolStudents: this.elementarySchoolStudents,
            infantsWithMeal: this.infantsWithMeal,
            infantsWithoutMeal: this.infantsWithoutMeal,
            additionalInfo: this.additionalInfo
        };
    }
}