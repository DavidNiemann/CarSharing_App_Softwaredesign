# CarSharing_App_Softwaredesign
Software design WS 21/22
Link to UML the Reposetory: https://github.com/DavidNiemann/CarSharing_App_Softwaredesign  
Link to UML diagrams: https://github.com/DavidNiemann/CarSharing_App_Softwaredesign/tree/main/UML  

## Requirements

- Node.js
- Node Package Manager (npm)
- Visual Studio Code or other IDE

## To get this to work:

1. Download all files in this folder
2. Open a console program, "cmd", "terminal" or something else
3. Navigate to the root of this folder
4. Type in "npm install" and press enter, node_modules will be installed now
5. After installation of the node_modules, you can run the program now with "npm run start"

## Things to consider

### admin: 
- username: admin   
- passwort: 123  

- If a new admin is to be added, he must be entered manually in the "data\User.json".  
- *username* and *password* are freely selectable.  
- The *status* must have the value **administrator**.  
- For the id see the ***Create ID:*** paragraph  

### JSON:
- There must be a Booking.json, Cars.json and User.json exist in the data orderer.  
- All json files must contain [].  

### Create ID: 
- The ID are set in such a way that a new entry has the next higher ID number than the previous entry.  
- In the case of a manual entry, only take place at the end of a file.  