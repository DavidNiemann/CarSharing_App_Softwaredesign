import { DriveType } from "../../enums/Drivetype";
import { CarDao } from "../dao/CarDao";
import FileHandler from "./FileHandler";

export class CarHandler {

    private static instance: CarHandler = new CarHandler();
    private carCounter: number = 0;
    private path: string = "./data/Cars.json";
    private constructor() {
        if (CarHandler.instance)
            throw new Error("Instead of using new CarList(), please use CarList.getInstance() for Singleton!")
        CarHandler.instance = this;
    }

    public static getInstance(): CarHandler {
        return CarHandler.instance;
    }

    /**
     * creates new car and saves it in the json
     */
    public async addNewCar(_designation: string, _driveType: number, _pricePerMinute: number, _flatRate: number, _maxTimeUsage: number, _bookingTimeFromTo: Date[]): Promise<void> {

        let alleCars: CarDao[] = await this.getAllCars();

        let newCar = {
            id: alleCars[alleCars.length - 1].id + 1,
            designation: _designation,
            driveType: Object.values(DriveType)[_driveType - 1],
            pricePerMinute: _pricePerMinute,
            flatRate: _flatRate,
            maxTimeUsage: _maxTimeUsage,
            bookingTimeFromTo: _bookingTimeFromTo

        }


        FileHandler.appendJsonFile(this.path, newCar);
    }
    /**
     * @returns all Cars from the Json
     */
    private async getAllCars(): Promise<CarDao[]> {
        return await FileHandler.readJsonFile(this.path);

    }
    /**
     * returns car names up to 10.
     * on the next call, the display starts with the last call
     * @param _numbers if not all cars should be considered
     * @returns car designations 
     */
    public async getCarDesignations(_numbers?: number[]): Promise<string[]> {
        let cars: CarDao[] = []
        if (_numbers) {

            for (let nID = 0; nID < _numbers.length; nID++) {
                let car: CarDao | null = await this.getCarById(_numbers[nID])
                if (car)
                    cars.push(car);

            }
        } else {
            cars = await this.getAllCars()
        }

        if (this.carCounter >= cars.length) {
            this.carCounter = 0;
        }


        let CarsDesignation: string[] = [];


        for (let nCar = this.carCounter; nCar < cars.length; nCar++) {

            if (CarsDesignation.length >= 10) {

                break;
            }
            if (cars[nCar].driveType == DriveType.Electronic) {
                CarsDesignation.push(cars[nCar].designation + "(E)");
                this.carCounter++;
            }
            else {
                CarsDesignation.push(cars[nCar].designation);
                this.carCounter++;
            }
        }

        return CarsDesignation;
    }
    /**
     * @param _carID id of the selected car
     * @returns car properties
     */
    public async getCarProperties(_carID: number): Promise<string[]> {
        let chosenCar: CarDao | null = await this.getCarById(_carID);
        if (chosenCar == null) {
            return []
        }
        let PropertieString: string[] = [];
        chosenCar.bookingTimeFromTo[0] = new Date(chosenCar.bookingTimeFromTo[0])
        chosenCar.bookingTimeFromTo[1] = new Date(chosenCar.bookingTimeFromTo[1])
        for (let [key, value] of Object.entries(chosenCar)) {
            if (key == "bookingTimeFromTo") {

                PropertieString.push(chosenCar.bookingTimeFromTo[0].toJSON());
                PropertieString.push(chosenCar.bookingTimeFromTo[1].toJSON());
            } else if (key != "id") {
                PropertieString.push(value + "")
            }

        }

        return PropertieString;
    }
    /**
     * 
     * @param _carID id of the searched car
     * @returns [CarDao] based on an id if ID not found returns null
     */
    private async getCarById(_carID: number): Promise<CarDao | null> {
        let allCars: CarDao[] = await this.getAllCars();
        for (let nCar = 0; nCar < allCars.length; nCar++) {
            if (allCars[nCar].id == _carID) {
                return allCars[nCar];
            }

        }
        return null;

    }

    /**
     * 
     * @param _carDesignation Designation of the searched car
     * @param _driveType if the [DriveType] is to be considered
     * @returns ID of the Car
     */
    public async getIdByDesignation(_carDesignation: string, _driveType?: DriveType): Promise<number | null> {
        let allCars: CarDao[] = await this.getAllCars();
        for (let nCar = 0; nCar < allCars.length; nCar++) {
            if (allCars[nCar].designation == _carDesignation) {

                if (!_driveType || _driveType == allCars[nCar].driveType) {
                    return allCars[nCar].id;
                }
            }

        }
        return null;

    }
    /**
     * @returns Cost of booking
     */
    public async getCarPrice(_carID: number, _duration: number): Promise<number> {
        let allCars: CarDao[] = await this.getAllCars();
        return allCars[_carID].flatRate + (allCars[_carID].pricePerMinute * _duration);
    }
    /**
     * @returns rtrue if the car matches in time
     */
    public async checkAvailability(_carID: number, _startTime: Date, _duration: number): Promise<boolean> {

        let car: CarDao | null = await this.getCarById(_carID);
        if (car == null) {
            return false
        }

        if (car.maxTimeUsage < _duration) {
            return false;
        }
        let bookdate: Date = new Date(_startTime);
        bookdate.setFullYear(1999, 3, 16);
        let bookingTime = bookdate.getTime();
        let startTime: number = new Date(car.bookingTimeFromTo[0]).getTime();
        let endTime: number = new Date(car.bookingTimeFromTo[1]).getTime();
        let timeToDate: number = new Date(1999, 3, 16, 0, 0, 0).getTime();
        startTime -= timeToDate;
        endTime -= timeToDate;
        let bookingTimeStart: number = bookingTime - timeToDate;
        let bookingTimeEnd: number = bookingTimeStart + (_duration * 60000);

        if (bookingTimeStart >= startTime && bookingTimeEnd <= endTime) {
            return true;
        }
        return false;
    }

    /**
     * @returns all cars that are available at the time
     */
    public async getAllAvailableCarIDsByTime(_start: Date, _duration: number): Promise<number[]> {
        let allCar: CarDao[] = await this.getAllCars();
        let availableCarIDs: number[] = [];
        for (let nCar = 0; nCar < allCar.length; nCar++) {
            if (await this.checkAvailability(allCar[nCar].id, _start, _duration)) {

                availableCarIDs.push(allCar[nCar].id);
            }

        }
        return availableCarIDs;
    }



}

export default CarHandler.getInstance();