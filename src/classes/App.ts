
import Console from "./singletons/Console";
import CarList from "./singletons/CarList";

import { User } from "./User";
import { Answers } from "prompts";
import { UserTasks } from "../enums/UserTasks";
import { UserStatus } from "../enums/UserStatus";
import { DriveType } from "../enums/Drivetype";


export class App {
    private thisUser: User = new User();
    public static app: App = new App();
    private userTasks: string[] = []
    public async startApp(): Promise<void> {

        await this.showOptions();

    }

    public async showOptions(): Promise<void> {
       await this.hndUserTasksToString();
        let answer: Answers<string> = await Console.showOptions(
            this.userTasks,
            "Which option do you want to choose?"
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

                break;
            default:
                Console.printLine("Option not available!");
        }

        await this.showOptions();
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
        let designation: Answers<string> = await Console.showType("gib dei Bezeichnung ein", 'text');
        let driveType: Answers<string> = await Console.showOptions(
            Object.values(DriveType),
            "wähl den Anteib aus" );

        let flatRate: Answers<string> = await Console.showType("gib den pauschalpreis ein", 'number');
        let pricePerMinute: Answers<string> = await Console.showType("gib dein Preis pro Minute  ein", 'number');
        let bookingTimeFromTo: Date[] = [];
        for (let index = 0; index < 2; index++) {
            let bookingAnswer: Answers<string> = await Console.showDate("gib dein Passwort ein")
            bookingTimeFromTo.push(bookingAnswer.value)
        }

        CarList.addNewCar(carId.value, designation.value, driveType.value, pricePerMinute.value, flatRate.value, pricePerMinute.value, bookingTimeFromTo);

    }
}