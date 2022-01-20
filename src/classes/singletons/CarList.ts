import { DriveType } from "../../enums/Drivetype";
import { Car } from "../Car";
import FileHandler from "./FileHandler";

export class CarList {

    private static instance: CarList = new CarList();
    private allSaveCars: Car[] = [];
    private carCounter: number = 0;

    private constructor() {
        if (CarList.instance)
            throw new Error("Instead of using new CarList(), please use CarList.getInstance() for Singleton!")
        CarList.instance = this;
    }

    public static getInstance(): CarList {
        return CarList.instance;
    }


    public async addNewCar(_id: string, _designation: string, _driveType: number, _pricePerMinute: number, _flatRate: number, _maxTimeUsage: number, _bookingTimeFromTo: Date[]): Promise<void> {



        FileHandler.appendJsonFile("./data/Cars.json", new Car(_id, _designation, Object.values(DriveType)[_driveType - 1], _pricePerMinute, _flatRate, _maxTimeUsage, _bookingTimeFromTo));
    }

    private async getAllCars(): Promise<Car[]> {
        return await FileHandler.readJsonFile("./data/Cars.json");

    }

    public async getCarDesignation(): Promise<string[]> {
        if (this.carCounter == 0 || this.carCounter >= this.allSaveCars.length) {
            this.allSaveCars = await this.getAllCars();
            this.carCounter = 0;
        }


        let CarsDesignation: string[] = [];


        for (let nCar = this.carCounter; nCar < this.allSaveCars.length; nCar++) {

            if (CarsDesignation.length >= 10) {
                
                break;
            }

            CarsDesignation.push(this.allSaveCars[nCar].designation);
            this.carCounter++;
        }
        
        return CarsDesignation;
    }

    public async getCarProperties(_carNumber: number): Promise<string[]> {
        let chosenCar: Car = this.allSaveCars[_carNumber + this.carCounter - 1];
        let PropertieString: string[] = [];
        chosenCar.bookingTimeFromTo[0] = new Date(chosenCar.bookingTimeFromTo[0])
        chosenCar.bookingTimeFromTo[1] = new Date(chosenCar.bookingTimeFromTo[1])
        for (let [key, value] of Object.entries(chosenCar)) {
            if (key == "bookingTimeFromTo") {

                PropertieString.push(key + ": " + chosenCar.bookingTimeFromTo[0].getHours() + " to "+ chosenCar.bookingTimeFromTo[1].getHours() + " o'clock");
            }
            else {
                PropertieString.push(key + ": " + value);
            }

        }

        return PropertieString;
    }

}

export default CarList.getInstance();