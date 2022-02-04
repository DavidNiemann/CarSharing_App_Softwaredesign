import { connected } from "process";
import { BookingDao } from "../dao/BookingDao"
import FileHandler from "./FileHandler";

export class BookingHandler {

    private static instance: BookingHandler = new BookingHandler();
    private path: string = "./data/Booking.json";
    private constructor() {
        if (BookingHandler.instance)
            throw new Error("Instead of using new Booking(), please use Booking.getInstance() for Singleton!")
        BookingHandler.instance = this;
    }

    public static getInstance(): BookingHandler {
        return BookingHandler.instance;
    }

    public async addBooking(_date: Date, _duration: number, _userName: string, _carId: number, _price: number): Promise<boolean> {
        let newBooking: BookingDao = {
            date: _date,
            duration: _duration,
            userName: _userName,
            carId: _carId,
            price: _price
        }
        if (await this.checkBookingTime(_carId, _date, _duration)) {

            FileHandler.appendJsonFile(this.path, newBooking);
            return true;
        }
        else {

            return false;
        }


    }

    public async checkBookingTime(_carId: number, _date: Date, _duration: number): Promise<boolean> {
        let allBookings: BookingDao[] = await this.getAllBooking();
        let bookdate: Date = new Date(_date);
        for (let nBooking = 0; nBooking < allBookings.length; nBooking++) {
            if (allBookings[nBooking].carId == _carId) {
                let oldBookdate: Date = new Date(allBookings[nBooking].date);

                //console.log(oldBookdate);
                //console.log(bookdate);
                if (bookdate >= oldBookdate) {

                    oldBookdate.setMinutes(oldBookdate.getMinutes() + allBookings[nBooking].duration % 60);
                    oldBookdate.setHours(oldBookdate.getHours() + Math.floor(allBookings[nBooking].duration / 60));
                    // console.log(oldBookdate);

                    if (bookdate <= oldBookdate) {
                        return false;
                    }

                }
                oldBookdate = new Date(allBookings[nBooking].date);
                if (bookdate <= oldBookdate) {

                    bookdate.setMinutes(bookdate.getMinutes() + _duration % 60);
                    bookdate.setHours(bookdate.getHours() + _duration / 60);
                    // console.log(oldBookdate);

                    if (bookdate >= oldBookdate) {
                        return false;
                    }

                }

            }

        }
        return true;
    }

    private async getAllBooking(): Promise<BookingDao[]> {
        return await FileHandler.readJsonFile(this.path);

    }

    public async getBookingsFromUser(_past: boolean, _user: string): Promise<[number, Date, number, number][]> {
        let allBookings: BookingDao[] = await this.getAllBooking();
        let bookingString: [number, Date, number, number][] = [];
        for (let nBooking = 0; nBooking < allBookings.length; nBooking++) {
            if (allBookings[nBooking].userName == _user) {
                if (await this.isTheBookingInThePast(allBookings[nBooking]) == _past) {

                    bookingString.push([allBookings[nBooking].carId, allBookings[nBooking].date, allBookings[nBooking].duration, allBookings[nBooking].price]);
                }

            }
        }
        return bookingString;

    }
    private async isTheBookingInThePast(_booking: BookingDao): Promise<boolean> {
        let dateNow: Date = new Date();
        let bookinDate: Date = new Date(_booking.date);
        if (dateNow >= bookinDate) {
            return false;
        }
        return true;
    }

    public async getCostsOfBookingsFromUsers(_user: string): Promise<[number, number]> {
        let allBookings: BookingDao[] = await this.getAllBooking();
        let totalCost: number = 0;
        let amountOfBookings: number = 0;
        for (let nBooking = 0; nBooking < allBookings.length; nBooking++) {
            if (allBookings[nBooking].userName == _user) {
                totalCost += allBookings[nBooking].price;
                amountOfBookings++;
            }

        } return [totalCost, totalCost / amountOfBookings];
    }

}

export default BookingHandler.getInstance();