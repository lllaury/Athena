const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateTaskData } = require("../services/gpt");
const {
    calculatePriority,
    manuallyUpdatePriority,
    updateAllPriorities,
} = require("../services/priority");

// Get's the assignments for a user
async function getAssignments(req, res) {
    try {
        // Check if user_id is set in the session
        if (!req.session.user_id) {
            return res.status(401).send({ message: "User not set in session" });
        }

        // Get all the assignments and tasks for this user
        const [assignments, tasks] = await Promise.all([
            prisma.assignment_data.findMany({
                where: { user: req.session.user_id },
            }),
            prisma.task_data.findMany({
                where: { user_id: req.session.user_id },
            }),
        ]);

        // Filter out assignments that have a corresponding task with the same title and course_id
        const filteredAssignments = assignments.filter(
            (assignment) =>
                !tasks.some(
                    (task) =>
                        task.title === assignment.title &&
                        task.course_id === assignment.course_id
                )
        );

        // Convert BigInt (due date) to string and send response
        const response = JSON.stringify(filteredAssignments, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
        );

        res.send(response);
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).send("Server Error");
    }
}

async function generateTasksFromSelectedAssignments(req, res) {
    try {
        // Check if user_id is set in the session
        if (!req.session.user_id) {
            return res.status(401).send({ message: "User not set in session" });
        }

        // Check if assignmentList is provided
        const assignmentList = req.body.assignmentList;
        if (!assignmentList) {
            return res
                .status(400)
                .send({ message: "Assignment list is required" });
        }

        // Get assignments from database where assignment title is in the assignment list
        const assignments = await prisma.assignment_data.findMany({
            where: {
                user: req.session.user_id,
                id: { in: assignmentList },
            },
        });

        const tasks = await Promise.all(
            assignments.map(async (assignment) => {
                // Make sure this matches up with new schema
                const title = assignment.title;
                const details = assignment.description;
                const dueDate = assignment.due_date;
                const course_id = assignment.course_id;
                const weight = assignment.weight;

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
                    due_date: dueDate,
                    estimated_completion_time:
                        taskData.estimated_completion_time,
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
                return newTaskData;
            })
        );

        // Save the tasks to the database
        const createdTasks = await prisma.task_data.createMany({
            data: tasks,
        });

        // Return the created tasks
        res.json(createdTasks);
    } catch (error) {
        console.error(
            "Error generating tasks from selected assignments:",
            error
        );
        res.status(500).send("Internal Server Error");
    }
}

async function generateTasksFromAllAssignments(req, res) {
    try {
        // Check if user_id is set in the session
        if (!req.session.user_id) {
            return res.status(401).send({ message: "User not set in session" });
        }

        // Fetch all assignments and existing tasks for this user
        const [assignments, existingTasks] = await Promise.all([
            prisma.assignment_data.findMany({
                where: { user: req.session.user_id },
            }),
            prisma.task_data.findMany({
                where: { user_id: req.session.user_id },
            }),
        ]);

        // Filter assignments to exclude those that already have a matching task
        const assignmentsToProcess = assignments.filter(
            (assignment) =>
                !existingTasks.some(
                    (task) =>
                        task.title === assignment.title &&
                        task.course_id === assignment.course_id
                )
        );

        // Generate tasks from the remaining assignments
        const tasks = await Promise.all(
            assignmentsToProcess.map(async (assignment) => {
                const taskData = await generateTaskData(
                    assignment.title,
                    assignment.description,
                    assignment.due_date,
                    assignment.course_id,
                    assignment.weight
                );

                return {
                    ...taskData,
                    due_date: assignment.due_date,
                    user_id: req.session.user_id,
                    running_time: 0,
                    completion_time: 0,
                    created_at: new Date().toISOString(),
                    priority: 0, // Default priority, to be updated
                    status: "to-do",
                    weight: taskData.weight || 0,
                };
            })
        );

        // Calculate priorities and finalize tasks
        for (let task of tasks) {
            task.priority = await calculatePriority(task);
        }

        if (tasks.length > 0) {
            const createdTasks = await prisma.task_data.createMany({
                data: tasks,
            });
            res.json({
                createdTasks: createdTasks,
                message: 1,
            });
        } else {
            res.status(200).send({
                message: 2,
            });
        }
    } catch (error) {
        console.error("Error generating tasks from all assignments:", error);
        res.status(500).send({
            message: -1,
        });
    }
}

async function getUserStats(req, res) {
    try {
        const userReq = req.body.user;
        if (!userReq) return res.status(400).send('"User" is a required field');

        const userData = await prisma.personal_data.findUnique({
            where: {
                user: userReq,
            },
        });

        if (!userData) {
            return res.status(404).send("User not found");
        }

        res.json(userData);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Server Error");
    }
}

module.exports = {
    getAssignments,
    getUserStats,
    generateTasksFromAllAssignments,
    generateTasksFromSelectedAssignments,
};
