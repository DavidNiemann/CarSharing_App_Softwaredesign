
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
                await this.hndAddNewCar();
                break;
            case UserTasks.ShowCarList:
                await this.showCars();
                break;
            case UserTasks.Logout:
                await this.thisUser.logout();
                break;
            case UserTasks.FilterByTime:
                await this.searchByTime();
                break;
            case UserTasks.ViewBookings:
                await this.showBookings();
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
            else if (allTasks[nTask] == UserTasks.Logout || allTasks[nTask] == UserTasks.ViewBookings) {
                if (this.thisUser.userstatus != UserStatus.Guest) {
                    userTasks.push(allTasks[nTask]);
                }
            }
            else { userTasks.push(allTasks[nTask]) }



        }
        return userTasks;

    }

    public async hndAddNewCar(): Promise<void> {
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

        await CarList.addNewCar(designation.value, driveType.value, pricePerMinute.value, flatRate.value, maxTimeforUse.value, bookingTimeFromTo);

    }

    private async showCars(_numbers?: number[], _date?: Date, _duration?: number): Promise<void> {

        let carDesignations: string[] = await CarList.getCarDesignations(_numbers)
        carDesignations.push("zeig andere Autos");
        carDesignations.push("zurück");


        let answer: Answers<string> = await Console.showOptions(
            carDesignations,
            MessagesGer.QuestionCarChoice
        );
        if (answer.value >= carDesignations.length) {
            return;
        }
        if (answer.value == carDesignations.length - 1) {
            await this.showCars(_numbers, _date, _duration);
            return;

        } else {
            await this.showCarProperties(answer.value - 1);
        }
        let ifBooking: Answers<string> = await Console.showType(MessagesGer.QuestionCarConfirmation, 'confirm');
        if (ifBooking.value == true) { await this.hndBooking(answer.value - 1, _date, _duration); } else {
            await this.showCars();
        }



    }


    private async hndBooking(_carNumber: number, _dateOFBooking?: Date, _bookingDuration?: number): Promise<void> {
        if (this.thisUser.userstatus == UserStatus.Guest) {
            Console.printLine(MessagesGer.MessageRentLogin);
            await this.showOptions([UserTasks.Login, UserTasks.Register, "zurück"])
            if (this.thisUser.userstatus == UserStatus.Guest) {// usertask zurück einfügen 
                return;
            }
        }
        let dateOFBooking: Date;
        let bookingDuration: number;


        if (_dateOFBooking && _bookingDuration) {

            dateOFBooking = _dateOFBooking;
            bookingDuration = _bookingDuration;
        } else {
            let dateAndDuration: [Date, number] = await this.askForTime();

            dateOFBooking = dateAndDuration[0];
            bookingDuration = dateAndDuration[1];

            let carAilability: boolean = await CarList.checkAvailability(_carNumber, dateOFBooking, bookingDuration);

            if (carAilability == false) {
                Console.printLine(MessagesGer.MessageRentTime);
                return;
            }
            let bookingAilability: boolean = await Booking.checkBookingTime(_carNumber, dateOFBooking, bookingDuration);

            if (bookingAilability == false) {
                Console.printLine(MessagesGer.MessageRentTime);
                return;
            }
            Console.printLine(MessagesGer.MessageCaraccessible);
        }

        let bookingPrice: number = await CarList.getCarPrice(_carNumber, bookingDuration);

        Console.printLine(MessagesGer.MassageBookingCost + bookingPrice + MessagesGer.termCurrency);

        let confirmationBooking: Answers<string> = await Console.showType(MessagesGer.QuestionCarConfirmation, 'confirm');
        if (confirmationBooking.value == false) {
            return;
        }

        let success: boolean = await Booking.addBooking(dateOFBooking, bookingDuration, this.thisUser.username, _carNumber, bookingPrice);

        if (success) {
            Console.printLine(MessagesGer.MessageBookingConfirmation);
        } else {
            Console.printLine(MessagesGer.MessageBookingError);
        }






    }

    private async askForTime(): Promise<[Date, number]> {
        let dateOFBooking = (await Console.showDate(MessagesGer.QuestionRentStartTime)).value;
        let bookingDuration = (await Console.showType(MessagesGer.QuestionRentDuration, 'number')).value;
        return [dateOFBooking, bookingDuration];
    }


    private async showCarProperties(_carId: number): Promise<void> {
        let carPropertieString: string[] = await CarList.getCarProperties(_carId);
        let CarDateStart: Date = new Date(carPropertieString[4]);
        let CarDateEnd: Date = new Date(carPropertieString[5]);

        Console.printLine("");
        Console.printLine(MessagesGer.termCar + " : " + carPropertieString[0]);
        Console.printLine(MessagesGer.termdrivetype + " : " + carPropertieString[1]);
        Console.printLine(MessagesGer.termPrice + " : " + carPropertieString[2] + " " + MessagesGer.termCurrency);
        Console.printLine(MessagesGer.termFlatRate + " : " + carPropertieString[3] + " " + MessagesGer.termCurrency);
        Console.printLine(MessagesGer.MassageAvailableTime1 + " "+ CarDateStart.getHours() + "." + CarDateStart.getMinutes() + MessagesGer.MassageAvailableTime2 + CarDateEnd.getHours() + "." + CarDateEnd.getMinutes() + " " + MessagesGer.termClock);
        Console.printLine(MessagesGer.termMaxDuration + " : " + carPropertieString[6] + " " + MessagesGer.termMinutes);


        Console.printLine("");


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

                await this.hndBooking(foundCarId);
            }
        }
        else {

            Console.printLine(MessagesGer.MessageCarSearch);
        }
    }

    private async searchByTime(): Promise<void> {  
        let dateAndDuration: [Date, number] = await this.askForTime();
        let availableCars: number[] = await CarList.getAllAvailableCarIDsByTime(dateAndDuration[0], dateAndDuration[1]);

        for (let nID = availableCars.length - 1; nID >= 0; nID--) {
            let available: boolean = await Booking.checkBookingTime(availableCars[nID], dateAndDuration[0], dateAndDuration[1]);
            if (available == false) {
                availableCars.splice(nID, 1);
            }
        }
        if (availableCars.length == 0) {
            Console.printLine(MessagesGer.MessageCarSearch);
            return;
        }
        await this.showCars(availableCars, dateAndDuration[0], dateAndDuration[1]);

    }

    private async showBookings(): Promise<void> {

        let answer: Answers<string> = await Console.showOptions(
            ["Vergangene", "Ausstehende", "Durchschnittspreis und Gessambetrag"],
            MessagesGer.QuestionExpiredOrPresent
        );
        await this.hndShowBookings(answer.value);
    }

    private async hndShowBookings(_answerNumber: number): Promise<void> {
        let bookings: [number, Date, number, number][] = [];
        let cost: [number, number];
        switch (_answerNumber) {
            case 1:
                bookings = await Booking.getBookingsFromUser(false, this.thisUser.username);
                if (bookings.length == 0) {
                    Console.printLine(MessagesGer.MassageNoPastBookings);
                    return;
                }
                Console.printLine(MessagesGer.MassagePastBookings);
                await this.outputBookings(bookings)
                break;
            case 2:
                bookings = await Booking.getBookingsFromUser(true, this.thisUser.username);
                if (bookings.length == 0) {
                    Console.printLine(MessagesGer.MassageNoPendingBookings);
                    return;
                }
                Console.printLine(MessagesGer.MassagePendingBookings);
                await this.outputBookings(bookings)
                break;
            case 3:
                cost = await Booking.getCostsOfBookingsFromUsers(this.thisUser.username);
                Console.printLine(MessagesGer.MassageBookingPrice1 + cost[0].toFixed(2) + MessagesGer.MassageBookingPrice2);
                Console.printLine(MessagesGer.MassageAverageCost + cost[1].toFixed(2) + MessagesGer.termCurrency);
                break;
            default:
                break;
        }





    }
    private async outputBookings(_booking: [number, Date, number, number][]): Promise<void> {
        for (let nBooking: number = 0; nBooking < _booking.length; nBooking++) {

            let carDesignation: string[] = await CarList.getCarDesignations([_booking[nBooking][0]])
            let bookingDate: Date = new Date(_booking[nBooking][1]);
            Console.printLine("");
            Console.printLine(MessagesGer.termCar + " : " + carDesignation[0]);
            Console.printLine(MessagesGer.termDate + " : " + bookingDate.getDate() + "." + bookingDate.getMonth() + 1 + "." + bookingDate.getFullYear());
            Console.printLine(MessagesGer.termTime + " : " + bookingDate.getHours() + "." + bookingDate.getMinutes() + MessagesGer.termClock);
            Console.printLine(MessagesGer.termDuration + " : " + _booking[nBooking][2] + " " + MessagesGer.termMinutes);
            Console.printLine(MessagesGer.termPrice + " : " + _booking[nBooking][3].toFixed(2) + " " + MessagesGer.termCurrency);
            Console.printLine("");
        }
    }

}
