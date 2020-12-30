# issue-tracker-ui
This repository is a part of the MERN project named Issue Tracker. It contains the code for the UI written in React and Express.
This project requires Node version 10.x and npm version 6.x.

To run this project on a your PC:

1. Clone this repository or download it as a zip.
2. Navigate to the folder ui, in bash or cmd depending on your OS.
3. Run npm install to install all the required dependencies.
4. Create a .env file within UI directory and set the following constants
   a. UI_SERVER_PORT = Any valid free port number.
   b. UI_API_ENDPOINT = http://localhost:{port_number}/graphql. // Port on which api server is running.
   c. GOOGLE_CLIENT_ID = Google OAuth2 API credentials.
5. Now, set up, your backend server by following the instructions in the [linked](https://github.com/Being-Maverick/issue-tracker-api) repository.
6. Run "npm run dev-all" if you are on Mac, or "npm run watch-server-hmr" and "npm start" if you are on Windows.
