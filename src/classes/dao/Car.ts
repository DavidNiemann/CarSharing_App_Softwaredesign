import { DriveType } from "../../enums/Drivetype";


export class Car {
    public id: number;
    public designation: string;
    public driveType: string;
    public flatRate: number;
    public pricePerMinute: number;
    public maxTimeUsage: number;
    public bookingTimeFromTo: Date[];

    constructor(_id: number, _designation: string, _driveType: DriveType, _pricePerMinute: number, _flatRate: number, _maxTimeUsage: number, _bookingTimeFromTo: Date[]) {
        this.id = _id;
        this.designation = _designation;
        this.driveType = _driveType
        this.pricePerMinute = _pricePerMinute;
        this.flatRate = _flatRate;
        this.bookingTimeFromTo = _bookingTimeFromTo;
        this.maxTimeUsage = _maxTimeUsage;
     
    }



}