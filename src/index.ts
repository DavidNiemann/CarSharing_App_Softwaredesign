import * as readline from 'readline';
import { App } from './classes/App';

namespace CarSharing {
  export class Main {
    public consoleLine : readline.ReadLine;

    constructor() {
      this.consoleLine = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
    }

    public async showProgramStatus() : Promise<void> {
      let app:App  = new App()
      await app.startApp();
    }
  }

  let main : Main = new Main();
  main.showProgramStatus();
}