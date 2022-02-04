export class CheckUsername {
    private static instance : CheckUsername = new CheckUsername();
  
    private constructor() {
      if(CheckUsername.instance) 
        throw new Error("Instead of using new CheckUsername(), please use CheckUsername.getInstance() for Singleton!")
        CheckUsername.instance = this;
    }
  
    public static getInstance() : CheckUsername {
      return CheckUsername.instance;
    }
    /**
     *  checks whether the username corresponds to the specifications
     * @param _username to check the string
     * @returns true if the specifications are met
     */
    public checkUsername(_username: string): boolean {
        let pattern = /^[a-zA-Z0-9]{3,15}$/;
        return pattern.test(_username);
    }
    
  }
  
  export default CheckUsername.getInstance();