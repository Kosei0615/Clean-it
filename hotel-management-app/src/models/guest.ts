export class Guest {
    name: string;
    region: string;
    sourceOfBooking: string;
    stayDuration: number;
    adultMen: number;
    adultWomen: number;
    elementarySchoolStudents: number;
    infantsWithMeal: number;
    infantsWithoutMeal: number;
    totalGuests: number;
    additionalInfo: string;

    constructor(
        name: string,
        region: string,
        sourceOfBooking: string,
        stayDuration: number,
        adultMen: number,
        adultWomen: number,
        elementarySchoolStudents: number,
        infantsWithMeal: number,
        infantsWithoutMeal: number,
        additionalInfo: string
    ) {
        this.name = name;
        this.region = region;
        this.sourceOfBooking = sourceOfBooking;
        this.stayDuration = stayDuration;
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

    public validateGuestInfo(): boolean {
        // Add validation logic as needed
        return true;
    }
}