import { UserStatus } from "../../enums/UserStatus";
import FileHandler from './FileHandler';
import { UserDao } from '../dao/UserDao';
import CheckUsername from "../../helpers/CheckUsername";

export class UserHandler {

    private static instance: UserHandler = new UserHandler();

    public userstatus: UserStatus = UserStatus.Guest;
    public username: string = "";
    private path: string = "./data/User.json";

    private constructor() {

        if (UserHandler.instance)
            throw new Error("Instead of using new User(), please use User.getInstance() for Singleton!")
        UserHandler.instance = this;
    }

    public static getInstance(): UserHandler {
        return UserHandler.instance;
    }
    /**
     * 
     * @returns true if you registration was successful
     */
    public async hndRegister(_userName: string, _passwort: string): Promise<boolean> {
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
    /**
     * 
     * @returns true if you Login was successful
     */
    public async hndLogin(_userName: string, _passwort: string): Promise<boolean> {

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

    /**
     * resets the user to guest and deletes the username
     */
    public async hndLogout(): Promise<void> {
        this.userstatus = UserStatus.Guest;
        this.username = "";
    }

}
export default UserHandler.getInstance();