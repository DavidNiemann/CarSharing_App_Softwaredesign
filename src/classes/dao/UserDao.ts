import { UserStatus } from "../../enums/UserStatus";

export interface UserDao {
  username: string;
  passwort: string;
  status: UserStatus;
}