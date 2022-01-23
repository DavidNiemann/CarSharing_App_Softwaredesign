
import Console from "./singletons/Console";
import CarList from "./singletons/CarList";
import Booking from "./singletons/Booking";

import { User } from "./User";
import { Answers } from "prompts";
import { UserTasks } from "../enums/UserTasks";
import { UserStatus } from "../enums/UserStatus";
import { DriveType } from "../enums/Drivetype";
import { MessagesGer } from "../enums/MessagesGerman";



export class App {
    private thisUser: User = new User();
    public static app: App = new App();
    private run: boolean = true;
    public async startApp(): Promise<void> {
        while (this.run) {

            await this.showOptions(await this.hndUserTasksToString());
        }
    }

    public async showOptions(_task: string[]): Promise<void> {

        let answer: Answers<string> = await Console.showOptions(
            _task,
            MessagesGer.QuestionTask
        );


        await this.hndAnswerTasks(_task[answer.value - 1]);
    }


    private async hndAnswerTasks(_task: string): Promise<void> {

        switch (_task) {
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
            case UserTasks.Logout:
                await this.thisUser.logout();
                break;
            default:
                break;
        }

    }


    public async hndUserLogin(_task: UserTasks): Promise<void> {
        let userName: Answers<string> = await Console.showType(MessagesGer.QuestionUsername, 'text')
        let password: Answers<string> = await Console.showType(MessagesGer.QuestionPassword, 'password')
        let success: boolean = false;

        switch (_task) {
            case UserTasks.Login:
                success = await this.thisUser.login(userName.value, password.value);
                if (!success) {
                    Console.printLine(MessagesGer.MessageLogin);
                    await this.hndUserLogin(_task);
                }

                break;
            case UserTasks.Register:
                success = await this.thisUser.register(userName.value, password.value);
                if (!success) {
                    Console.printLine(MessagesGer.MessageUsername);
                    await this.hndUserLogin(_task);
                }
                break;

        }

    }

    private async hndUserTasksToString(): Promise<string[]> {

        let userTasks: string[] = [];
        let allTasks: string[] = Object.values(UserTasks);

        for (let nTask = 0; nTask < allTasks.length; nTask++) {


            if (allTasks[nTask] == UserTasks.RegisterCar) {
                if (this.thisUser.userstatus == UserStatus.Administrator) {
                    userTasks.push(allTasks[nTask]);
                }
            } else if (allTasks[nTask] == UserTasks.Login || allTasks[nTask] == UserTasks.Register) {
                if (this.thisUser.userstatus == UserStatus.Guest) {
                    userTasks.push(allTasks[nTask]);
                }
            }
            else if (allTasks[nTask] == UserTasks.Logout) {
                if (this.thisUser.userstatus != UserStatus.Guest) {
                    userTasks.push(allTasks[nTask]);
                }
            }
            else { userTasks.push(allTasks[nTask]) }



        }
        return userTasks;

    }

    public async hadAddNewCar(): Promise<void> {
        let designation: Answers<string> = await Console.showType(MessagesGer.QuestionCarDesignations, 'text');
        let driveType: Answers<string> = await Console.showOptions(
            Object.values(DriveType),
            MessagesGer.QuestionCarType);

        let flatRate: Answers<string> = await Console.showType(MessagesGer.QuestionCarCost, 'number');
        let pricePerMinute: Answers<string> = await Console.showType(MessagesGer.QuestionCarRentalPrice, 'number');
        let maxTimeforUse: Answers<string> = await Console.showType(MessagesGer.QuestionCarMaxRentalDuration, 'number');
        let bookingTimeFromTo: Date[] = [];
        for (let index = 0; index < 2; index++) {
            let bookingAnswer: Answers<string> = await Console.showHour(MessagesGer.QuestionCarMaxRentalPeriod)
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
            MessagesGer.QuestionCarChoice
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
        let ifBooking: Answers<string> = await Console.showType(MessagesGer.QuestionCarConfirmation, 'confirm');
        if (ifBooking.value == true) { await this.hadBooking(answer.value - 1); } else {
            await this.showCars();
        }



    }


    private async hadBooking(_carNumber: number): Promise<void> {
        if (this.thisUser.userstatus == UserStatus.Guest) {
            Console.printLine(MessagesGer.MessageRentLogin);
            await this.showOptions([UserTasks.Login, UserTasks.Register, "Zurück"])
            if (this.thisUser.userstatus == UserStatus.Guest) {// usertask zurück einfügen 
                return;
            }
        }


        let dateOFBooking: Answers<string> = await Console.showDate(MessagesGer.QuestionRentStartTime);
        let bookingDuration: Answers<string> = await Console.showType(MessagesGer.QuestionRentDuration, 'number');

        let success: boolean = await CarList.checkAvailability(_carNumber, dateOFBooking.value, bookingDuration.value);

        if (success == false) {
            Console.printLine(MessagesGer.MessageRentTime);
            return;
        }

        success = await Booking.addBooking(dateOFBooking.value, bookingDuration.value, this.thisUser.username, _carNumber, await CarList.getCarPrice(_carNumber, bookingDuration.value));

        if (success) {
            Console.printLine(MessagesGer.MessageBookingConfirmation);
        } else {
            Console.printLine(MessagesGer.MessageRentTime);
        }






    }

    private async showCarProperties(_carId: number): Promise<void> {
        let carPropertieString: string[] = await CarList.getCarProperties(_carId);
        for (let nPropertie: number = 0; nPropertie < carPropertieString.length; nPropertie++) {
            Console.printLine(carPropertieString[nPropertie]);

        }
    }

    private async searchCars(): Promise<void> {

        let designation: Answers<string> = await Console.showType(MessagesGer.QuestionCarDesignations, 'text');
        let answer: Answers<string> = await Console.showOptions(
            Object.values(DriveType),
            MessagesGer.QuestionCarType
        );

        let foundCarId: number | null = await CarList.getIdByDesignation(designation.value, Object.values(DriveType)[answer.value - 1]);
        if (foundCarId != null) {
            await this.showCarProperties(foundCarId);
            let ifBooking: Answers<string> = await Console.showType(MessagesGer.QuestionCarConfirmation, 'confirm');
            if (ifBooking.value == true) {

                await this.hadBooking(foundCarId);
            }
        }
        else {

            Console.printLine(MessagesGer.MessageCarSearch);
        }
    }

}
