const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateTaskData } = require("../services/gpt");
const {
    calculatePriority,
    manuallyUpdatePriority,
    updateAllPriorities,
} = require("../services/priority");

const stringDateToEpochMillis = (dateString) => {
    // string is in form 202X-MM-DD
    const epochMillis = Date.parse(dateString);
    return epochMillis;
}

exports.generateTask = async (req, res) => {
    try {
        // Check if user_id is set in the session
        if (!req.session.user_id) {
            return res.status(401).send({ message: "User not set in session" });
        }

        // Generate task data
        const { title, details, dueDate, course_id, weight } = req.body;
        const taskData = await generateTaskData(
            title,
            details,
            dueDate,
            course_id,
            weight
        );

        // Add user_id and other default values to the task data
        const newTaskData = {
            title: taskData.title,
            course_id: taskData.course_id,
            description: taskData.description,
            due_date: stringDateToEpochMillis(dueDate),
            estimated_completion_time: taskData.estimated_completion_time || 0,
            running_time: 0,
            completion_time: 0,
            priority: 0, // Set a default priority updated after this
            status: "to-do",
            sub_tasks: taskData.sub_tasks,
            user_id: req.session.user_id,
            created_at: new Date().toISOString(),
            weight: taskData.weight || 0,
        };

        newTaskData.priority = await calculatePriority(newTaskData);

        // Save the task to the database
        const newTask = await prisma.task_data.create({
            data: newTaskData,
        });
        // res.json(newTask);
        res.send({ message: "Task has been generated" });
    } catch (error) {
        console.error("Error generating task:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.updatePriorities = async (req, res) => {
    const { user_id } = req.body;
    if (user_id) {
        await updateAllPriorities(user_id);
    } else {
        await updateAllPriorities("");
    }

    res.send({ message: "Priorities have been updated" });
};

exports.updateTaskStatus = async (req, res) => {
    try {
        if (!req.session.user_id) {
            return res.status(401).send({ message: "User not set in session" });
        }

        const { task_id, new_status } = req.body; // Assuming each task has a unique task_id
        if (!task_id || !new_status) {
            return res
                .status(400)
                .send({ message: "Missing task_id or new_status" });
        }

        // Ensure new_status is valid
        const validStatuses = ["to-do", "completed", "in-progress"];
        if (!validStatuses.includes(new_status)) {
            return res.status(400).send({ message: "Invalid status provided" });
        }

        const task = await prisma.task_data.update({
            where: {
                id: task_id, // Using task_id assuming it's unique
                user_id: req.session.user_id, // Ensuring that the task belongs to the user
            },
            data: {
                status: new_status,
            },
        });

        res.send({ message: "Task status updated successfully" });
    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.deleteTask = async (req, res) => {
    const { id } = req.body;

    try {
        const existingTask = await prisma.task_data.findUnique({
            where: { id: id },
        });

        // If user DNE, cancel delete
        if (!existingTask) {
            res.send({
                message: `Task, ${id}, could not be found, deletion canceled`,
            });
            console.log(
                `Deletion of task: ${id} was denied; could not find task in database`
            );
            return;
        }

        await prisma.task_data.delete({
            where: { id: id },
        });

        res.send({ message: "Task was successfully deleted" });
        console.log(`Task: ${id} was deleted from the database`);
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.updateSubtaskStatus = async (req, res) => {
    const { taskId, description, newStatus } = req.body;

    try {
        const task = await prisma.task_data.findUnique({
            where: { id: taskId },
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Locate the subtask by description and update its status
        const updatedSubTasks = task.sub_tasks.map((subtask) => {
            if (subtask.description === description) {
                return { ...subtask, status: newStatus };
            }
            return subtask;
        });

        // Save the updated task back to the database
        const updatedTask = await prisma.task_data.update({
            where: { id: taskId },
            data: { sub_tasks: updatedSubTasks },
        });
        //Convert BigInt to string and send response
        const response = JSON.stringify(updatedTask, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
        );
        res.json({
            message: "Subtask status updated successfully",
            response,
        });
    } catch (error) {
        console.error("Error updating subtask status:", error);
        res.status(500).send("Error updating subtask status");
    }
};
// exports.calculatePriority = async (req, res) => {

//   try {
//     // Check if user_id is set in the session
//     if (!req.session.user_id) {
//       return res.status(401).send({ message: 'User not set in session' });
//     }

//     // Query tasks by user_id and sort by priority
//     const tasks = await prisma.task_data.findMany({
//       where: {
//         user_id: req.session.user_id,
//       },
//       orderBy: {
//         priority: 'asc', // Use 'desc' for descending order
//       },
//     });

//     res.json(tasks);
//   } catch (error) {
//     console.error('Error fetching tasks:', error);
//     res.status(500).send('Internal Server Error');
//   }
// }
