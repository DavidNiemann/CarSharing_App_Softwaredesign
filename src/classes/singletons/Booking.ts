import { BookingDao } from "../dao/BookingDao"
import FileHandler from "./FileHandler";

export class Booking {

    private static instance: Booking = new Booking();

    private constructor() {
        if (Booking.instance)
            throw new Error("Instead of using new Booking(), please use Booking.getInstance() for Singleton!")
        Booking.instance = this;
    }

    public static getInstance(): Booking {
        return Booking.instance;
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

            FileHandler.appendJsonFile("./data/Booking.json", newBooking);
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
        return await FileHandler.readJsonFile("./data/Booking.json");

    }

}

export default Booking.getInstance();