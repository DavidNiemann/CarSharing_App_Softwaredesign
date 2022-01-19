import { appendFile, readFileSync, writeFileSync, access, constants } from "fs";


export class FileHandler {
  private static instance: FileHandler = new FileHandler();


  private constructor() {
    if (FileHandler.instance)
      throw new Error("Instead of using new FileHandler(), please use FileHandler.getInstance() for Singleton!")
    FileHandler.instance = this;
  }

  public static getInstance(): FileHandler {
    return FileHandler.instance;
  }

  public readJsonFile(_pathToFile: string) : any {
    let jsonRaw : Buffer = readFileSync(_pathToFile);
    let json : any = JSON.parse(jsonRaw.toString());
    return json;
  }

  public writeJsonFile(_pathToFile: string, _dataToFile: any): void {
    writeFileSync(_pathToFile, JSON.stringify(_dataToFile));
  }

  public appendJsonFile(_pathToFile: string, _dataToFile: any): void {
    let file: any[] = this.readJsonFile(_pathToFile)
    file.push(_dataToFile)
    writeFileSync(_pathToFile, JSON.stringify(file));
  }

}

export default FileHandler.getInstance();