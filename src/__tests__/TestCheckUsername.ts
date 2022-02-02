import CheckUsername from "../helpers/CheckUsername";

describe("check mail addresses", () => {
    let invalidUsernams: string[] = ["d@david", "-dav+d:", "davidNimann1234567", "d"];
    let validUsernames: string[] = ["David123", "Peter212"];
    for (let usernames of invalidUsernams) {
        test("check invalid mail address", () => {
            expect(CheckUsername.checkUsername(usernames)).toBeFalsy();
        });
    }

    for (let usernames of validUsernames) {
        test("check valid mail address", () => {
            expect(CheckUsername.checkUsername(usernames)).toBeTruthy();
        });
    }
});