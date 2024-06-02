Make sure to add a .env with your MongoDB URI. It is referenced in the server.js.
The variable should be MONGO_URI="<your MongoDB URI>"
DATABASE_URL="<your MongoDB URI>"
PORT=5000

Also set up the GPT_API_KEY="<the api key here>"

Introspection command: npx prisma db pull
When a Schema is changed, make sure to run 'npx prisma generate' in the root of the back-end

my-express-app/
├── node_modules/
├── src/
│   ├── config/         # Configuration files (e.g., database config)
│   ├── controllers/    # Functions to connect routes to business logic
│   ├── models/         # Mongoose models to represent MongoDB collections
│   ├── routes/         # Express route definitions
│   └── app.js          # Main application file where you setup middleware
├── public/             # Publicly accessible files (e.g., images, stylesheets, scripts)
├── views/              # Templates (if you're serving HTML)
├── .env                # Environment variables (not committed to Git)
├── package.json
├── package-lock.json
└── server.js           # Entry point to your application
