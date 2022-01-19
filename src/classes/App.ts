import { Answers } from "prompts";
import Console from "./singletons/Console";
import { User } from "./User";

import { UserTasks } from "../enums/UserTasks";
import { UserStatus } from "../enums/UserStatus";

export class App {
    private thisUser: User = new User();
    public static app: App = new App();
    private userTasks: string[] = Object.values(UserTasks);
    public async startApp(): Promise<void> {

        await this.showOptionsLogIn();

    }

    public async showOptionsLogIn(): Promise<void> {
        let answer: Answers<string> = await Console.showOptions(
            this.hndUserTasksToString(),
            "Which option do you want to choose?"
        );

        await this.handleAnswerTasks(answer.value);
    }


    private async handleAnswerTasks(_tasknumber: number): Promise<void> {

        switch (this.userTasks[_tasknumber - 1]) {
            case UserTasks.BookCar:

                break;
            case UserTasks.Login:
                await this.handleUserLogin(UserTasks.Login);
                break;
            case UserTasks.Register:
                await this.handleUserLogin(UserTasks.Register);
                break;
            case UserTasks.RegisterCar:

                break;
            case UserTasks.ShowCarList:

                break;
            default:
                Console.printLine("Option not available!");
        }
      

    }


    public async handleUserLogin(_task: UserTasks): Promise<void> {
        let userName: Answers<string> = await Console.showType("gib dein Nutzernamen ein", 'text')
        let password: Answers<string> = await Console.showType("gib dein Passwort ein", 'password')
        let success: boolean = false;

        switch (_task) {
            case UserTasks.Login:
                success = await this.thisUser.login(userName.value, password.value);
                if (!success) {
                    Console.printLine("Nutzernamen oder passwort falsch");
                    this.handleUserLogin(_task);
                }

                break;
            case UserTasks.Register:
                success = await this.thisUser.register(userName.value, password.value);
                if (!success) {
                    Console.printLine("Nuzernamen enthält sonderzeichen oder ist schon vergeben");
                    this.handleUserLogin(_task);
                }
                break;

        }
        Console.printLine(this.thisUser.userstatus);
        Console.printLine(this.thisUser.username);
    }

    private hndUserTasksToString(): string[] {

        let currentTsks: string[] = []

        for (let nTask = 0; nTask < this.userTasks.length; nTask++) {


            if (this.userTasks[nTask] == UserTasks.RegisterCar) {
                if (this.thisUser.userstatus == UserStatus.Administrator) {
                    currentTsks.push(this.userTasks[nTask])
                }
            } else if (this.userTasks[nTask] == UserTasks.Login || this.userTasks[nTask] == UserTasks.Register) {
                if (this.thisUser.userstatus == UserStatus.Guest) {
                    currentTsks.push(this.userTasks[nTask])
                }
            }
            else if (this.userTasks[nTask] == UserTasks.BookCar) {
                continue;
            }
            else { currentTsks.push(this.userTasks[nTask]) }



        }
        return currentTsks;
    }
}