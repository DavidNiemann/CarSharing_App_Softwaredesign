
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
            case UserTasks.BookCar:

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
            else if (Object.values(UserTasks)[nTask] == UserTasks.BookCar) {
                continue;
            }
            else { this.userTasks.push(Object.values(UserTasks)[nTask]) }



        }

    }

    public async hadAddNewCar(): Promise<void> {
        let carId: Answers<string> = await Console.showType("gib die autoId ein", 'text');
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

        CarList.addNewCar(carId.value, designation.value, driveType.value, pricePerMinute.value, flatRate.value, maxTimeforUse.value, bookingTimeFromTo);

    }

    private async showCars(): Promise<void> {

        let carDesignations = await CarList.getCarDesignation()
        carDesignations.push("other Cars");

        let answer: Answers<string> = await Console.showOptions(
            carDesignations,
            "Which Car do you want to choose?"
        );

        if (answer.value >= carDesignations.length) {
            await this.showCars();
        } else {
            let carPropertieString: string[] = await CarList.getCarProperties(answer.value - 1);
            for (let nPropertie: number = 0; nPropertie < carPropertieString.length; nPropertie++) {
                Console.printLine(carPropertieString[nPropertie]);

            }
        }
        let ifBooking: Answers<string> = await Console.showType("Wollen sie diese Auto Buchen", 'confirm');
        if (ifBooking.value == true) { await this.hadBooking(answer.value - 1); } else {
            await this.showCars();
        }


    }


    private async hadBooking(_carNumber: number): Promise<void> {
        if (this.thisUser.userstatus == UserStatus.Guest) {
            Console.printLine("you must be registered to rent a car");
            this.userTasks = [];
            this.userTasks.push(UserTasks.Login);
            this.userTasks.push(UserTasks.Register);
            //await this.showOptions();
            //await this.hadBooking(_carNumber);

        } else {

            let dateOFBooking: Answers<string> = await Console.showDate("an welchem Tag mit start zeitpunkt soll die Buchung sein");
            let bookingDuration: Answers<string> = await Console.showType("wie lange wollen sie dass auto buchen in Minuten", 'number');
            
            await Booking.addBooking(dateOFBooking.value, bookingDuration.value, this.thisUser.username, await CarList.getCarId(_carNumber), await CarList.getCarPrice(_carNumber, bookingDuration.value));

        }




    }


}
