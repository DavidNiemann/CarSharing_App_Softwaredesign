import { UserStatus } from "../enums/UserStatus";
import FileHandler from '../classes/singletons/FileHandler';
import { UserDao } from '../classes/dao/UserDao';

export class User {
    public userstatus: UserStatus = UserStatus.Guest;
    public username: string = "";
    constructor() { }

    public async register(_userName: string, _passwort: string): Promise<boolean> {
        let User: UserDao[] = FileHandler.readJsonFile("./data/User.json")

        for (let nUser = 0; nUser < User.length; nUser++) {
            if (User[nUser].username == _userName) {

                return false;
            }

        }

        if (this.checkUserName(_userName)) {
            let newUser: UserDao = {
                username: _userName,
                passwort: _passwort,
                status: UserStatus.Registered
            }
            FileHandler.appendJsonFile("./data/User.json", newUser);
            this.userstatus = UserStatus.Registered;
            return true;
        }
        return false;
    }

    public async login(_userName: string, _passwort: string): Promise<boolean> {

        let allUser: UserDao[] = await FileHandler.readJsonFile("./data/User.json");
        for (let i: number = 0; i < allUser.length; i++) {
            if (allUser[i].username == _userName && allUser[i].passwort == _passwort) {

                if (allUser[i].status == UserStatus.Administrator) {
                    this.userstatus = UserStatus.Administrator;

                } else { this.userstatus = UserStatus.Registered }
                this.username = _userName;
                return true
            }
        }
        return false;
    }

    private checkUserName(_username: string): boolean {
        let pattern = /^[a-zA-Z0-9]{3,15}$/;
        return pattern.test(_username);
    }

    public async logout(): Promise<void> {
        this.userstatus = UserStatus.Guest;
        this.username = "";
    }

}