# athena-backend
The backend for the Athena app

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/my-express-app.git
   ```
2. Navigate to the project directory:
   ```bash
   cd my-express-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   MONGO_URI="<your MongoDB URI>"
   DATABASE_URL="<your MongoDB URI>"
   PORT=5000
   GPT_API_KEY="<the api key here>"
   ```
   **Note**: Do not add the `.env` file to your Git repository.

### Running the Application

Start the server:
```bash
npm start
```

The application should now be running on [http://localhost:5000](http://localhost:5000).

## Development

### Prisma Introspection

To introspect your database schema:
```bash
npx prisma db pull
```

### Prisma Generate

When a schema is changed, make sure to run the following command in the root of the backend:
```bash
prisma generate
```

## Project Structure

```
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
```

## License

This project is licensed under the [MIT License](LICENSE).
```