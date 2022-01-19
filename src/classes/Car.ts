import { DriveType } from "../enums/drivetype";

export class Car {
    public id: string;
    public designation: string;
    public driveType: string;
    public flatRate: number;
    public pricePerMinute: number;
    public bookingTimeFromTo: Date;
    public bookingTime: Date | undefined;

    constructor(_id: string, _designation: string, _driveType: DriveType, _pricePerMinute: number, _flatRate: number, _bookingTimeFromTo: Date, _bookingTime?: Date) {
        this.id = _id;
        this.designation = _designation;
        this.driveType = _driveType
        this.pricePerMinute = _pricePerMinute;
        this.flatRate = _flatRate;
        this.bookingTimeFromTo = _bookingTimeFromTo; 
        if (_bookingTime) { this.bookingTime = _bookingTime }

    }



}