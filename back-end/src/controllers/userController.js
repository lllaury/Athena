const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 *
 * @param {*} courseArray
 * @returns a string (true) if has an error with type, else returns an empty string (false)
 */
function ensure_canvas_courses_type(courseArray) {
    for (course of courseArray) {
        if (course.course_id == undefined) {
            return "Failure, no course_id found in one of the canvas courses provided!";
        } else if (course.course_grade == undefined) {
            return "Failure, no course_grade found in one of the canvas courses provided!";
        } else if (course.passing_grade == undefined) {
            return "Failure, no passing_grade found in one of the canvas courses provided!";
        } else if (course.average_completion_time == undefined) {
            return "Failure, no average_completion_time found in one of the canvas courses provided!";
        }
    }

    return "";
}

/**
 *
 * @param {*} settings
 * @returns a string (true) if has an error with type, else returns an empty string (false)
 */
function ensure_settings_type(settings) {
    if (settings.notifications == undefined) {
        return "Failure, no notifications found in your settings!";
    } else if (settings.theme == undefined) {
        return "Failure, no theme found in your settings!";
    } else {
        return "";
    }
}

/**
 *
 * @param {*} stats
 * @returns a string (true) if has an error with type, else returns an empty string (false)
 */
function ensure_user_stats_type(stats) {
    if (stats.average_completion_time == undefined) {
        return "Failure, no average_completion_time found in your user_stats!";
    } else if (stats.average_grade == undefined) {
        return "Failure, no average_grade found in your user_stats!";
    } else if (stats.total_tasks_completed == undefined) {
        return "Failure, no total_tasks_completed found in your user_stats!";
    } else {
        return "";
    }
}

exports.setUser = async (req, res) => {
    let {
        user_id,
        username,
        canvas_courses,
        settings,
        user_stats,
        canvas_api_token,
    } = req.body;
    req.session.user_id = user_id;
    req.session.username = username;
    req.session.canvas_courses = canvas_courses;
    req.session.settings = settings;
    req.session.user_stats = user_stats;
    req.session.canvas_api_token = canvas_api_token;

    // Define default settings
    const defaultSettings = {
        theme: "light", // Default theme
        notifications: true, // Enable notifications by default
        // Add more settings as needed
    };

    // Define default user stats
    const defaultUserStats = {
        average_completion_time: 0, // Default average completion time
        average_grade: 0, // Default average grade
        total_tasks_completed: 0, // Default total tasks completed
        // Add more stats as needed
    };

    console.log("Session user_id set:", req.session.user_id);

    try {
        // Check if user_data exists
        const existingUserData = await prisma.user_data.findUnique({
            where: { id: user_id },
        });

        if (!existingUserData) {
            // if (canvas_courses) console.log("canvas_courses is set to: \n", canvas_courses);

            // Verify types of nested JSON objects
            // Will be a string if verification fails, empty string if passes
            if (canvas_courses) {
                const canvas_courses_error =
                    ensure_canvas_courses_type(canvas_courses);
                if (canvas_courses_error)
                    return res.send({ message: canvas_courses_error });
            }
            if (settings) {
                const settings_error = ensure_settings_type(settings);
                if (settings_error)
                    return res.send({ message: settings_error });
            }
            if (user_stats) {
                const user_stats_error = ensure_user_stats_type(user_stats);
                if (user_stats_error)
                    return res.send({ message: user_stats_error });
            }

            // Set defaults if no info provided
            username = username || user_id;
            canvas_courses = canvas_courses || [];
            settings = settings || defaultSettings;
            user_stats = user_stats || defaultUserStats;
            canvas_api_token = canvas_api_token || "";

            // Create default user_data if it doesn't exist
            await prisma.user_data.create({
                data: {
                    id: user_id,
                    username: username, // Set a default username or get it from the request
                    canvas_api_token: canvas_api_token, // Set a default or empty token
                    canvas_courses: canvas_courses,
                    settings: settings,
                    user_stats: user_stats,
                },
            });

            res.send({ message: "User added and set successfully" });
        } else {
            res.send({ message: "User found and set successfully" });
        }
    } catch (error) {
        console.error("Error setting user:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.updateUser = async (req, res) => {
    const {
        user_id,
        username,
        canvas_courses,
        settings,
        user_stats,
        canvas_api_token,
    } = req.body;

    try {
        if (!user_id) {
            res.send({
                message:
                    "Please include the user_id of the user you would like to update in the JSON",
            });
            console.log("No user_id provided, update canceled");
            return;
        }
        if (
            !username &&
            !canvas_courses &&
            !settings &&
            !user_stats &&
            !canvas_api_token
        ) {
            res.send({
                message:
                    "You must update one of the following fields: username, canvas_courses, settings, user_stats, canvas_api_token",
            });
            console.log(
                "Attempt to update zero or non-existent field(s), update canceled"
            );
            return;
        }

        const existingUserData = await prisma.user_data.findUnique({
            where: { id: user_id },
        });

        // If user DNE, cancel update
        if (!existingUserData) {
            res.send({ message: `User, ${user_id}, could not be found` });
            console.log(
                `Update of user: ${user_id} was denied; could not find user in database`
            );
            return;
        }

        // Verify types of nested JSON objects
        // Will be a string if verification fails, empty string if passes
        if (canvas_courses) {
            const canvas_courses_error =
                ensure_canvas_courses_type(canvas_courses);
            if (canvas_courses_error)
                return res.send({ message: canvas_courses_error });
        }
        if (settings) {
            const settings_error = ensure_settings_type(settings);
            if (settings_error) return res.send({ message: settings_error });
        }
        if (user_stats) {
            const user_stats_error = ensure_user_stats_type(user_stats);
            if (user_stats_error)
                return res.send({ message: user_stats_error });
        }

        await prisma.user_data.update({
            where: { id: user_id },
            data: {
                // updates the user_data document to the new value if it exists OR the old value
                username: username || existingUserData.username,
                canvas_api_token:
                    canvas_api_token || existingUserData.canvas_api_token,
                canvas_courses:
                    canvas_courses || existingUserData.canvas_courses,
                settings: settings || existingUserData.settings,
                user_stats: user_stats || existingUserData.user_stats,
            },
        });
        res.send({ message: "User updated successfully" });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.deleteUser = async (req, res) => {
    const { user_id } = req.body;

    try {
        const existingUserData = await prisma.user_data.findUnique({
            where: { id: user_id },
        });

        // If user DNE, cancel delete
        if (!existingUserData) {
            res.send({
                message: `User, ${user_id}, could not be found, deletion canceled`,
            });
            console.log(
                `Deletion of user: ${user_id} was denied; could not find user in database`
            );
            return;
        }

        await prisma.user_data.delete({
            where: { id: user_id },
        });

        res.send({ message: "User was successfully deleted" });
        console.log(`User: ${user_id} was deleted from the database`);
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.getTasks = async (req, res) => {
    try {
        // Check if user_id is set in the session
        console.log('Trying to fetch tasks from: ' + req.session.user_id);
        if (!req.session.user_id) {
            return res.status(401).send({ message: "User not set in session" });
        }

        // Query tasks by user_id and sort by priority
        const tasks = await prisma.task_data.findMany({
            where: {
                user_id: req.session.user_id,
            },
            orderBy: {
                priority: "desc", // Use 'desc' for descending order
            },
        });

        // Convert BigInt to float
        const convertedTasks = tasks.map((task) => ({
            ...task,
            // Add fields that are BigInt and need conversion
            due_date: Number(task.due_date),
            // Add other fields as necessary
        }));

        res.json(convertedTasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).send("Server Error");
    }
};
