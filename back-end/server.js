require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo"); // Add this for session store
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Connect to database
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5000",
        ], // Replace with the URL of your frontend
        credentials: true, // This allows the server to accept and send cookies
    })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(
    session({
        secret: "your_secret_key",  // Should be set in .env later
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }), // Use MongoDB for session store
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true, // Recommended to prevent client-side JS from accessing the cookie
            sameSite: "lax", // Helps prevent CSRF attacks
        }, // Set to false for HTTP, true for HTTPS
    })
);

// Define routes
const gptRoute = require("./src/routes/gptRoutes");
app.use("/api/gpt", gptRoute);

const dbRoute = require("./src/routes/dbRoutes");
app.use("/api/db", dbRoute);

const taskRoute = require("./src/routes/taskRoutes");
app.use("/api/task", taskRoute);

const userRoute = require("./src/routes/userRoutes");
app.use("/api/user", userRoute);



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
