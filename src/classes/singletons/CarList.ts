import { DriveType } from "../../enums/Drivetype";
import { Car } from "../dao/Car";
import FileHandler from "./FileHandler";

export class CarList {

    private static instance: CarList = new CarList();
    private carCounter: number = 0;
    private path: string = "./data/Cars.json";
    private constructor() {
        if (CarList.instance)
            throw new Error("Instead of using new CarList(), please use CarList.getInstance() for Singleton!")
        CarList.instance = this;
    }

    public static getInstance(): CarList {
        return CarList.instance;
    }


    public async addNewCar(_designation: string, _driveType: number, _pricePerMinute: number, _flatRate: number, _maxTimeUsage: number, _bookingTimeFromTo: Date[]): Promise<void> {

        let alleCars: Car[] = await this.getAllCars();

        FileHandler.appendJsonFile(this.path, new Car(alleCars.length, _designation, Object.values(DriveType)[_driveType - 1], _pricePerMinute, _flatRate, _maxTimeUsage, _bookingTimeFromTo));
    }

    private async getAllCars(): Promise<Car[]> {
        return await FileHandler.readJsonFile(this.path);

    }

    public async getCarDesignations(_numbers?: number[]): Promise<string[]> {
        let cars: Car[] = []
        if (_numbers) {

            for (let nID = 0; nID < _numbers.length; nID++) {
                let car: Car | null = await this.getCarById(_numbers[nID])
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

    public async getCarProperties(_carID: number): Promise<string[]> {
        let chosenCar: Car | null = await this.getCarById(_carID);
        if (chosenCar == null) {
            return []
        }
        let PropertieString: string[] = [];
        chosenCar.bookingTimeFromTo[0] = new Date(chosenCar.bookingTimeFromTo[0])
        chosenCar.bookingTimeFromTo[1] = new Date(chosenCar.bookingTimeFromTo[1])
        for (let [key, value] of Object.entries(chosenCar)) {
            if (key == "bookingTimeFromTo") {

                PropertieString.push( chosenCar.bookingTimeFromTo[0].toJSON());
                PropertieString.push( chosenCar.bookingTimeFromTo[1].toJSON());
            } else if (key != "id") {
                PropertieString.push(value + "")
            }

        }

        return PropertieString;
    }

    private async getCarById(_carID: number): Promise<Car | null> {
        let allCars: Car[] = await this.getAllCars();
        for (let nCar = 0; nCar < allCars.length; nCar++) {
            if (allCars[nCar].id == _carID) {
                return allCars[nCar];
            }

        }
        return null;

    }
    public async getIdByDesignation(_carDesignation: string, _driveType?: DriveType): Promise<number | null> {
        let allCars: Car[] = await this.getAllCars();
        for (let nCar = 0; nCar < allCars.length; nCar++) {
            if (allCars[nCar].designation == _carDesignation) {
                console.log();
                if (!_driveType || _driveType == allCars[nCar].driveType) {
                    return allCars[nCar].id;
                }
            }

        }
        return null;

    }

    public async getCarPrice(_carID: number, _duration: number): Promise<number> {
        let allCars: Car[] = await this.getAllCars();
        return allCars[_carID].flatRate + (allCars[_carID].pricePerMinute * _duration);
    }

    public async checkAvailability(_carID: number, _startTime: Date, _duration: number): Promise<boolean> { // einigen Auf id oder ID

        let car: Car | null = await this.getCarById(_carID);
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

    public async getAllAvailableCarIDsByTime(_start: Date, _duration: number): Promise<number[]> {
        let allCar: Car[] = await this.getAllCars();
        let availableCarIDs: number[] = [];
        for (let nCar = 0; nCar < allCar.length; nCar++) {
            if (await this.checkAvailability(allCar[nCar].id, _start, _duration)) {

                availableCarIDs.push(allCar[nCar].id);
            }

        }
        return availableCarIDs;
    }



}

export default CarList.getInstance();