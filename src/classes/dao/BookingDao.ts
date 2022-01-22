export interface BookingDao {
    date: Date,
    duration: number,
    userName: string, 
    carId: string,
    price: number

}

//Zudem kann dieser Fahrten buchen, eine gebuchte Fahrt besteht aus Datum, Uhrzeit, Dauer, der Verbindung zum Kunden, der Verbindung zum Auto und des entsprechenden Preises für die Fahrt.