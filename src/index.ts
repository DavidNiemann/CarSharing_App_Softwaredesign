
import { App } from './classes/App';

namespace CarSharing {
  export class Main {
    public async start() : Promise<void> {
      let app:App  = new App()
      await app.startApp();
    }
  }

  let main : Main = new Main();
  main.start();
}