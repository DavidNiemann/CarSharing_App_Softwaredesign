
import { DriveType } from "../../enums/Drivetype";


export interface CarDao {
    id: number, 
    designation: string,
    driveType: DriveType,
    flatRate: number,
    pricePerMinute: number,
    maxTimeUsage: number,
    bookingTimeFromTo: Date[]

}