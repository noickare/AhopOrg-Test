# React & Node.js Skill Test

## Estimated Time

- 60 min

## Requirements

- Bug fix to login without any issues (20min) <br/>
  There is no need to change or add login function.
  Interpret the code structure and set the correct environment by the experience of building projects. <br/>
  Here is a login information. <br/>
  ✓ email: admin@gmail.com  ✓ password: admin123

  SOLUTION -> SET REACT_APP_BASE_URL=http://127.0.0.1:5001/ in .env in the client

- Implement Restful API of "Meeting" in the both of server and client sides (40min)<br/>
  Focus Code Style and Code Optimization. <br/>
  Reference other functions.

  ## RUNNING

1. Set up environment files:
   ```bash
   cp Client/.env.example client/.env
   cp Server/.env.example Server/.env
   ```
   Then edit `Server/.env` and set your MongoDB URL in the `DB_URL` variable.

2. Open two terminal windows and run the following commands:

   Terminal 1 (Server):
   ```bash
   cd Server
   yarn install
   yarn start
   ```

   Terminal 2 (Client):
   ```bash
   cd Client
   yarn install
   yarn start
   ```

The application should now be running with the server on port 5001 and the client on port 3000.

  