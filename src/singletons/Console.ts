import readline from 'readline';
import prompts, { Answers, PromptType } from 'prompts';

class Console {
  private static instance : Console = new Console();

  public consoleLine : readline.ReadLine = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

  constructor() {
    if(Console.instance) 
      throw new Error("Instead of using new Console(), please use Console.getInstance() for Singleton!")
    Console.instance = this;
  }

  public static getInstance() : Console {
    return Console.instance;
  }

  public printLine(line : string) : void {
    this.consoleLine.write(line);
    this.consoleLine.write("\n");
  }

  //for showing options (choices)
  public showOptions(_options : string[], _question: string) : Promise<Answers<string>> {

    let choices: any[] = []

    for(let i: number = 1; i <= _options.length; i++) {
      choices.push( { title: _options[i-1], value: i })
    }
    return prompts({
      type: 'select',
      name: 'value',
      message: _question,
      choices: choices,
      initial: 1
    })
  }

  //for input
  public askForAnAnswers(_question: string , _type: PromptType) : Promise<Answers<string>> {
    return prompts({
      type: _type,
      name: 'value',
      message: _question,
      initial: 1
    })
  }

}

export default Console.getInstance();