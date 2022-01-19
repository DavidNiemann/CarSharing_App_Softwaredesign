import { DriveType } from "../../enums/Drivetype";
import { Car } from "../Car";
import FileHandler from "./FileHandler";

export class CarList {

    private static instance: CarList = new CarList();


    private constructor() {
        if (CarList.instance)
            throw new Error("Instead of using new CarList(), please use CarList.getInstance() for Singleton!")
        CarList.instance = this;
    }

    public static getInstance(): CarList {
        return CarList.instance;
    }


    public addNewCar(_id: string, _designation: string, _driveType: number, _pricePerMinute: number, _flatRate: number, _maxTimeUsage: number, _bookingTimeFromTo: Date[]): void {



        FileHandler.appendJsonFile("./data/Cars.json", new Car(_id, _designation, Object.values(DriveType)[_driveType - 1], _pricePerMinute, _flatRate, _maxTimeUsage, _bookingTimeFromTo));
    }

}

export default CarList.getInstance();