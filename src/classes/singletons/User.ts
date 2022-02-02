import { UserStatus } from "../../enums/UserStatus";
import FileHandler from './FileHandler';
import { UserDao } from '../dao/UserDao';
import CheckUsername from "../helpers/CheckUsername";

export class User {

    private static instance: User = new User();

    public userstatus: UserStatus = UserStatus.Guest;
    public username: string = "";
    private path: string = "./data/User.json";

    private constructor() {

        if (User.instance)
            throw new Error("Instead of using new User(), please use User.getInstance() for Singleton!")
        User.instance = this;
    }

    public static getInstance(): User {
        return User.instance;
    }

    public async register(_userName: string, _passwort: string): Promise<boolean> {
        let User: UserDao[] = FileHandler.readJsonFile(this.path)

        for (let nUser = 0; nUser < User.length; nUser++) {
            if (User[nUser].username == _userName) {

                return false;
            }

        }

        if (CheckUsername.checkUsername(_userName)) {
            let newUser: UserDao = {
                username: _userName,
                passwort: _passwort,
                status: UserStatus.Registered
            }
            FileHandler.appendJsonFile(this.path, newUser);
            this.userstatus = UserStatus.Registered;
            return true;
        }
        return false;
    }

    public async login(_userName: string, _passwort: string): Promise<boolean> {

        let allUser: UserDao[] = await FileHandler.readJsonFile(this.path);
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



    public async logout(): Promise<void> {
        this.userstatus = UserStatus.Guest;
        this.username = "";
    }

}
export default User.getInstance();