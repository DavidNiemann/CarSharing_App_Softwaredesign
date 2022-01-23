
import Console from "./singletons/Console";
import CarList from "./singletons/CarList";

import { User } from "./User";
import { Answers } from "prompts";
import { UserTasks } from "../enums/UserTasks";
import { UserStatus } from "../enums/UserStatus";
import { DriveType } from "../enums/Drivetype";
import Booking from "./singletons/Booking";



export class App {
    private thisUser: User = new User();
    public static app: App = new App();
    private userTasks: string[] = [];
    private run: boolean = true;
    public async startApp(): Promise<void> {
        while (this.run) {
            await this.hndUserTasksToString();
            await this.showOptions();
        }
    }

    public async showOptions(): Promise<void> {

        let answer: Answers<string> = await Console.showOptions(
            this.userTasks,
            "was wollen sie machen?"
        );

        await this.hndAnswerTasks(answer.value);
    }


    private async hndAnswerTasks(_tasknumber: number): Promise<void> {

        switch (this.userTasks[_tasknumber - 1]) {
            case UserTasks.SearchCar:
                await this.searchCars();
                break;
            case UserTasks.Login:
                await this.hndUserLogin(UserTasks.Login);
                break;
            case UserTasks.Register:
                await this.hndUserLogin(UserTasks.Register);
                break;
            case UserTasks.RegisterCar:
                await this.hadAddNewCar();
                break;
            case UserTasks.ShowCarList:
                await this.showCars();
                break;
            default:
                Console.printLine("Option not available!");
        }

    }


    public async hndUserLogin(_task: UserTasks): Promise<void> {
        let userName: Answers<string> = await Console.showType("gib dein Nutzernamen ein", 'text')
        let password: Answers<string> = await Console.showType("gib dein Passwort ein", 'password')
        let success: boolean = false;

        switch (_task) {
            case UserTasks.Login:
                success = await this.thisUser.login(userName.value, password.value);
                if (!success) {
                    Console.printLine("Nutzernamen oder passwort falsch");
                    await this.hndUserLogin(_task);
                }

                break;
            case UserTasks.Register:
                success = await this.thisUser.register(userName.value, password.value);
                if (!success) {
                    Console.printLine("Nuzernamen enthält sonderzeichen oder ist schon vergeben");
                    await this.hndUserLogin(_task);
                }
                break;

        }

    }

    private async hndUserTasksToString(): Promise<void> {

        this.userTasks = [];

        for (let nTask = 0; nTask < Object.values(UserTasks).length; nTask++) {


            if (Object.values(UserTasks)[nTask] == UserTasks.RegisterCar) {
                if (this.thisUser.userstatus == UserStatus.Administrator) {
                    this.userTasks.push(Object.values(UserTasks)[nTask]);
                }
            } else if (Object.values(UserTasks)[nTask] == UserTasks.Login || Object.values(UserTasks)[nTask] == UserTasks.Register) {
                if (this.thisUser.userstatus == UserStatus.Guest) {
                    this.userTasks.push(Object.values(UserTasks)[nTask]);
                }
            }
            /* else if (Object.values(UserTasks)[nTask] == UserTasks.SearchCar) {
                continue;
            } */
            else { this.userTasks.push(Object.values(UserTasks)[nTask]) }



        }

    }

    public async hadAddNewCar(): Promise<void> {
        let designation: Answers<string> = await Console.showType("gib die Bezeichnung ein", 'text');
        let driveType: Answers<string> = await Console.showOptions(
            Object.values(DriveType),
            "wähl den Anteib aus");

        let flatRate: Answers<string> = await Console.showType("gib den pauschalpreis ein", 'number');
        let pricePerMinute: Answers<string> = await Console.showType("gib dein Preis pro Minute  ein", 'number');
        let maxTimeforUse: Answers<string> = await Console.showType("gib ein wie viele minuten maximal gemieted werden kann", 'number');
        let bookingTimeFromTo: Date[] = [];
        for (let index = 0; index < 2; index++) {
            let bookingAnswer: Answers<string> = await Console.showHour("gib dien Zeitpunkt ein in dem man buchen kann")
            bookingTimeFromTo.push(bookingAnswer.value)
        }

        CarList.addNewCar(designation.value, driveType.value, pricePerMinute.value, flatRate.value, maxTimeforUse.value, bookingTimeFromTo);

    }

    private async showCars(): Promise<void> {

        let carDesignations = await CarList.getCarDesignation()
        carDesignations.push("other Cars");
        carDesignations.push("zurück");


        let answer: Answers<string> = await Console.showOptions(
            carDesignations,
            "Which Car do you want to choose?"
        );
        if (answer.value >= carDesignations.length) {
            return;
        }
        if (answer.value == carDesignations.length - 1) {
            await this.showCars();
            return;

        } else {
            await this.showCarProperties(answer.value - 1);
        }
        let ifBooking: Answers<string> = await Console.showType("Wollen sie diese Auto Buchen", 'confirm');
        if (ifBooking.value == true) { await this.hadBooking(answer.value - 1); } else {
            await this.showCars();
        }



    }


    private async hadBooking(_carNumber: number): Promise<void> {
        if (this.thisUser.userstatus == UserStatus.Guest) {
            Console.printLine("Sie müssen angemeldet sein um Auutos mieten zu kömnnen");

            return;

        }


        let dateOFBooking: Answers<string> = await Console.showDate("an welchem Tag mit start zeitpunkt soll die Buchung sein");
        let bookingDuration: Answers<string> = await Console.showType("wie lange wollen sie dass auto buchen in Minuten", 'number');

        let success: boolean = await CarList.checkAvailability(_carNumber, dateOFBooking.value, bookingDuration.value);

        if (success == false) {
            Console.printLine("Das Auto ist zu dieser Zeit nicht verfügbar");
            return;
        }

        success = await Booking.addBooking(dateOFBooking.value, bookingDuration.value, this.thisUser.username, _carNumber, await CarList.getCarPrice(_carNumber, bookingDuration.value));

        if (success) {
            Console.printLine("Die Buchung wurde Aufgenommen");
        } else {
            Console.printLine("Die Auto ist in dem Zeitraum nicht verfügbar");
        }






    }

    private async showCarProperties(_carId: number): Promise<void> {
        let carPropertieString: string[] = await CarList.getCarProperties(_carId);
        for (let nPropertie: number = 0; nPropertie < carPropertieString.length; nPropertie++) {
            Console.printLine(carPropertieString[nPropertie]);

        }
    }

    private async searchCars(): Promise<void> {

        let designation: Answers<string> = await Console.showType("gib die Bezeichnung ein", 'text');
        let answer: Answers<string> = await Console.showOptions(
            Object.values(DriveType),
            "welche Antreibsart hat das Auto?"
        );

        let foundCarId: number | null = await CarList.getIdByDesignation(designation.value, Object.values(DriveType)[answer.value - 1]);
        console.log(foundCarId);
        if (foundCarId != null) {
            await this.showCarProperties(foundCarId);
            let ifBooking: Answers<string> = await Console.showType("Wollen sie diese Auto Buchen", 'confirm');
            if (ifBooking.value == true) {

                await this.hadBooking(foundCarId);
            }
        }
    }

}
