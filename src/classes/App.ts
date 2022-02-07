
import Console from "./singletons/ConsoleHandler";
import CarList from "./singletons/CarHandler";
import Booking from "./singletons/BookingHandler";
import User from "./singletons/UserHandler";

import { Answers } from "prompts";
import { UserTasks } from "../enums/UserTasks";
import { UserStatus } from "../enums/UserStatus";
import { DriveType } from "../enums/Drivetype";
import { MessagesGer } from "../enums/MessagesGerman";



export class App {

    private run: boolean = true;

    /**
     * launches the app and prompts for tatokeiteb until [UserTasks.ExitApp] is selected
     */
    public async startApp(): Promise<void> {
        while (this.run) {

            await this.showTasks(await this.hndUserTasksToString());
        }
    }

    /**
     * asks the user for their next action
     * @param _task [UserTasks]s as a string array
     */
    private async showTasks(_task: string[]): Promise<void> {

        let answer: Answers<string> = await Console.showOptions(
            _task,
            MessagesGer.QuestionTask
        );


        await this.hndAnswerTasks(_task[answer.value - 1]);
    }

    /**
     * directs the program to the correct method according to the _task
     * @param _task a [UserTasks] as a string
     */
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
                await User.hndLogout();
                break;
            case UserTasks.FilterByTime:
                await this.searchByTime();
                break;
            case UserTasks.ViewBookings:
                await this.showBookings();
                break;
            case UserTasks.ExitApp:
                this.run = false;
                break;
            default:
                break;
        }

    }
    /**
     * asks the user and password, calls the login or registration Methods based on _task
     * @param _task [UserTasks.Login] or [UserTasks.Register]
     */
    private async hndUserLogin(_task: UserTasks): Promise<void> {
        let userName: Answers<string> = await Console.showType(MessagesGer.QuestionUsername, 'text')
        let password: Answers<string> = await Console.showType(MessagesGer.QuestionPassword, 'password')
        let success: boolean = false;

        switch (_task) {
            case UserTasks.Login:
                success = await User.hndLogin(userName.value, password.value);
                if (!success) {
                    Console.printLine(MessagesGer.MessageLogin);
                    await this.hndUserLogin(_task);
                }

                break;
            case UserTasks.Register:
                success = await User.hndRegister(userName.value, password.value);
                if (!success) {
                    Console.printLine(MessagesGer.MessageUsername);
                    await this.hndUserLogin(_task);
                }
                break;

        }

    }
    /**
     * Based on the user's [User Status], the possible actions are returned
     * @returns [UserTasks]s as a string array
     */
    private async hndUserTasksToString(): Promise<string[]> {

        let userTasks: string[] = [];
        let allTasks: string[] = Object.values(UserTasks);

        for (let nTask = 0; nTask < allTasks.length; nTask++) {


            if (allTasks[nTask] == UserTasks.RegisterCar) {
                if (User.userstatus == UserStatus.Administrator) {
                    userTasks.push(allTasks[nTask]);
                }
            } else if (allTasks[nTask] == UserTasks.Login || allTasks[nTask] == UserTasks.Register) {
                if (User.userstatus == UserStatus.Guest) {
                    userTasks.push(allTasks[nTask]);
                }
            }
            else if (allTasks[nTask] == UserTasks.Logout || allTasks[nTask] == UserTasks.ViewBookings) {
                if (User.userstatus != UserStatus.Guest) {
                    userTasks.push(allTasks[nTask]);
                }
            }
            else { userTasks.push(allTasks[nTask]) }



        }
        return userTasks;

    }
    /**
     * asks for the file Car properties and passes them on to the [CarHandler]
     */
    private async hndAddNewCar(): Promise<void> {
        let designation: Answers<string> = await Console.showType(MessagesGer.QuestionCarDesignations, 'text');
        let driveType: Answers<string> = await Console.showOptions(
            Object.values(DriveType),
            MessagesGer.QuestionCarType);

        let flatRate: Answers<string> = await Console.showType(MessagesGer.QuestionCarCost, 'number');
        let pricePerMinute: Answers<string> = await Console.showType(MessagesGer.QuestionCarRentalPrice, 'number');
        let maxTimeforUse: Answers<string> = await Console.showType(MessagesGer.QuestionCarMaxRentalDuration, 'number');
        let bookingTimeFromTo: Date[] = [];
        for (let index = 0; index < 2; index++) {
            let bookingAnswer: Answers<string> = await Console.showTime(MessagesGer.QuestionCarMaxRentalPeriod)
            bookingTimeFromTo.push(bookingAnswer.value)
        }

        await CarList.addNewCar(designation.value, driveType.value, pricePerMinute.value, flatRate.value, maxTimeforUse.value, bookingTimeFromTo);

    }

    /**
     * Time a list with a maximum of 10 cars and add the options to see others Cars or to go back.
     * Parameters are only needed when filtering by time
     * @param _numbers number bast on the CarID
     * @param _date date for a booking
     * @param _duration duration of a booking
     */
    private async showCars(_numbers?: number[], _date?: Date, _duration?: number): Promise<void> {

        let carDesignations: string[] = await CarList.getCarDesignations(_numbers)
        carDesignations.push(MessagesGer.MassageOtherCars);
        carDesignations.push(MessagesGer.TermBack);


        let answer: Answers<string> = await Console.showOptions(
            carDesignations,
            MessagesGer.QuestionCarChoice
        );
        if (answer.value >= carDesignations.length) {
            return;
        }
        else if (answer.value == carDesignations.length - 1) {
            await this.showCars(_numbers, _date, _duration);
            return;

        } else {
            await this.showCarProperties(_numbers ? _numbers[answer.value - 1] : answer.value - 1);
        }
        let ifBooking: Answers<string> = await Console.showType(MessagesGer.QuestionCarConfirmation, 'confirm');
        if (ifBooking.value == true) {
            await this.hndBooking(
                _numbers ? _numbers[answer.value - 1] : answer.value - 1, _date, _duration);
        } else {
            await this.showCars();
        }



    }

    /**
     * Asks the user for details of the booking and checks them
     * Parameters _dateOFBooking and _bookingDuration are only required if after time of the booking is already known
     * @param _carNumber number bast on the CarID
     * @param _dateOFBooking date for a booking
     * @param _bookingDuration duration of a booking
     */
    private async hndBooking(_carNumber: number, _dateOFBooking?: Date, _bookingDuration?: number): Promise<void> {
        console.log(_carNumber)
        if (User.userstatus == UserStatus.Guest) {
            Console.printLine(MessagesGer.MessageRentLogin);
            await this.showTasks([UserTasks.Login, UserTasks.Register, "zurück"])
            if (User.userstatus == UserStatus.Guest) {
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

        Console.printLine(MessagesGer.MassageBookingCost + bookingPrice + MessagesGer.TermCurrency);

        let confirmationBooking: Answers<string> = await Console.showType(MessagesGer.QuestionCarConfirmation, 'confirm');
        if (confirmationBooking.value == false) {
            return;
        }

        let success: boolean = await Booking.addBooking(dateOFBooking, bookingDuration, User.username, _carNumber, bookingPrice);

        if (success) {
            Console.printLine(MessagesGer.MessageBookingConfirmation);
        } else {
            Console.printLine(MessagesGer.MessageBookingError);
        }


    }
    /**
     * asks the user for booking time and duration
     * @returns an array with two fields , the date and time as [Data] and the duration as [number]
     */
    private async askForTime(): Promise<[Date, number]> {
        let dateOFBooking = (await Console.showDate(MessagesGer.QuestionRentStartTime)).value;
        let bookingDuration = (await Console.showType(MessagesGer.QuestionRentDuration, 'number')).value;
        return [dateOFBooking, bookingDuration];
    }

    /**
     * show the properties of a selected car
     * @param _carId Id of selected car
     */
    private async showCarProperties(_carId: number): Promise<void> {
        let carPropertieString: string[] = await CarList.getCarProperties(_carId);
        let CarDateStart: Date = new Date(carPropertieString[4]);
        let CarDateEnd: Date = new Date(carPropertieString[5]);

        Console.printLine("");
        Console.printLine(MessagesGer.TermCar + " : " + carPropertieString[0]);
        Console.printLine(MessagesGer.Termdrivetype + " : " + carPropertieString[1]);
        Console.printLine(MessagesGer.TermPrice + " : " + carPropertieString[2] + " " + MessagesGer.TermCurrency);
        Console.printLine(MessagesGer.TermFlatRate + " : " + carPropertieString[3] + " " + MessagesGer.TermCurrency);
        Console.printLine(MessagesGer.MassageAvailableTime1 + " " + CarDateStart.getHours() + "." + CarDateStart.getMinutes() + MessagesGer.MassageAvailableTime2 + CarDateEnd.getHours() + "." + CarDateEnd.getMinutes() + " " + MessagesGer.TermClock);
        Console.printLine(MessagesGer.TermMaxDuration + " : " + carPropertieString[6] + " " + MessagesGer.termMinutes);


        Console.printLine("");


    }

    /**
     * asks for a car designation and regulates his booking if found
     */
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
    /**
     *  asks for a time and duration and searches cars that are available for this
     * @toDo falsches auto zückgegeben
     */
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
    /**
     * asks if you want to show past pending or statistics of bookings
     */
    private async showBookings(): Promise<void> {

        let answer: Answers<string> = await Console.showOptions(
            [MessagesGer.TermPast, MessagesGer.TermPending, MessagesGer.TermAmount],
            MessagesGer.QuestionExpiredOrPresent
        );
        await this.hndShowBookings(answer.value);
    }
    /**
     * node of the decision which statistics should be displayed
     * @param _answerNumber number for the next steps 
     */
    private async hndShowBookings(_answerNumber: number): Promise<void> {
        let bookings: [number, Date, number, number][] = [];
        let cost: [number, number];
        switch (_answerNumber) {
            case 1:
                bookings = await Booking.getBookingsFromUser(false, User.username);
                if (bookings.length == 0) {
                    Console.printLine(MessagesGer.MassageNoPastBookings);
                    return;
                }
                Console.printLine(MessagesGer.MassagePastBookings);
                await this.outputBookings(bookings)
                break;
            case 2:
                bookings = await Booking.getBookingsFromUser(true, User.username);
                if (bookings.length == 0) {
                    Console.printLine(MessagesGer.MassageNoPendingBookings);
                    return;
                }
                Console.printLine(MessagesGer.MassagePendingBookings);
                await this.outputBookings(bookings)
                break;
            case 3:
                cost = await Booking.getCostsOfBookingsFromUsers(User.username);
                Console.printLine(MessagesGer.MassageBookingPrice1 + " " + cost[0].toFixed(2) + " " + MessagesGer.MassageBookingPrice2);
                Console.printLine(MessagesGer.MassageAverageCost + " " + cost[1].toFixed(2) + " " + MessagesGer.TermCurrency);
                break;
            default:
                break;
        }





    }

    /**
     * displays bookings
     * @param _booking two-dimensional array of AutoID, date, duration and price
     */
    private async outputBookings(_booking: [number, Date, number, number][]): Promise<void> {
        for (let nBooking: number = 0; nBooking < _booking.length; nBooking++) {

            let carDesignation: string[] = await CarList.getCarDesignations([_booking[nBooking][0]])
            let bookingDate: Date = new Date(_booking[nBooking][1]);
            Console.printLine("");
            Console.printLine(MessagesGer.TermCar + " : " + carDesignation[0]);
            Console.printLine(MessagesGer.TermDate + " : " + bookingDate.getDate() + "." + bookingDate.getMonth() + 1 + "." + bookingDate.getFullYear());
            Console.printLine(MessagesGer.TermTime + " : " + bookingDate.getHours() + "." + bookingDate.getMinutes() + MessagesGer.TermClock);
            Console.printLine(MessagesGer.TermDuration + " : " + _booking[nBooking][2] + " " + MessagesGer.termMinutes);
            Console.printLine(MessagesGer.TermPrice + " : " + _booking[nBooking][3].toFixed(2) + " " + MessagesGer.TermCurrency);
            Console.printLine("");
        }
    }

}
