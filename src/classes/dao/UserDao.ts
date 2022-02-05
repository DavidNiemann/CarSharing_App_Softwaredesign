import { UserStatus } from "../../enums/UserStatus";

export interface UserDao {
  id: number, 
  username: string;
  passwort: string;
  status: UserStatus;
}