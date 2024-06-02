// components/KanbanBoard.tsx

import initialData from "../data/data.json"; // Path to your data.json file
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { Flex, Heading, Text } from "@chakra-ui/react";
import { title } from "process";
import axios from "axios"; // Import axios for making HTTP requests
import { randomInt } from "crypto";
import { error } from "console";
import { Task_interface, TaskDataSubTasks } from "../types/Task";


const Column = dynamic(() => import("../components/Column"), { ssr: false });
const AltColumn = dynamic(() => import("../components/AltColumn"), {
    ssr: false,
});

// type TaskDataSubTasks = {
//     description: string;
//     status: string;
// };

// interface Task {
//     id: number; // Numeric ID for frontend use
//     title: string;
//     description: string;
//     subTasks: TaskDataSubTasks[]; // Assuming subTasks are an array of strings
//     taskID: string; // MongoDB ObjectId
//     courseID: string; // Equivalent to course_id in the backend
//     estimatedCompletionTime: number;
//     status: string;
//     due_date: number;
//     weight: number;
//     created_at: string;
//     priority: number;
// }

type ColumnKey = "toDo" | "inProgress" | "completed";

interface Columns {
    toDo: Task_interface[];
    inProgress: Task_interface[];
    completed: Task_interface[];
}

const initialColumns: Columns = {
    toDo: [],
    inProgress: [],
    completed: [],
};

const KanbanBoard: React.FC = () => {
    const [columns, setColumns] = useState<Columns>(initialColumns);

    const fetchTasks = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/tasks`,
                { withCredentials: true }
            );
            const fetchedTasks = response.data;

            // Convert and map tasks to fit the frontend interface
            const tasks: Task_interface[] = fetchedTasks.map(
                (task: any, index: number) => ({
                    id: index + 1, // Create a numeric ID based on the index if needed
                    title: task.title,
                    description: task.description,
                    subTasks: task.sub_tasks, // Assuming sub_tasks is correct and it's an array of strings
                    taskID: task.id, // Assuming the backend uses _id for MongoDB ObjectId
                    courseID: task.course_id,
                    estimatedCompletionTime: task.estimated_completion_time,
                    status: task.status,
                    due_date: task.due_date,
                    weight: task.weight,
                    created_at: task.created_at,
                    priority: task.priority,
                })
            );

            // Sorting tasks into columns based on their status
            const newColumns: Columns = {
                toDo: tasks.filter((task) => task.status === "to-do"), // toDO
                inProgress: tasks.filter(
                    (task) => task.status === "in-progress" // inProgress
                ),
                completed: tasks.filter((task) => task.status === "completed"), // completed
            };

            setColumns(newColumns);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    };

    useEffect(() => {
        // When the page first loads, I want to fetch all of the tasks for this user
        // Then sort them into lists based on status
        // Use states for those lists
        // I think the column should just be hard coded
        // Like there is only 3, there will only ever be 3, it will not change
        fetchTasks();
    }, []);

    // Quick fix this later
    const onDragEnd = (result: DropResult) => {
        const { destination, source } = result;
        if (
            !destination ||
            (destination.droppableId === source.droppableId &&
                destination.index === source.index)
        ) {
            return;
        }

        const task = columns[source.droppableId as ColumnKey][source.index];
        let newStatus;
        switch (destination.droppableId) {
            case "toDo":
                newStatus = "to-do";
                break;
            
            case "inProgress":
                newStatus = "in-progress";
                break;

            case "completed":
                newStatus = "completed";
                break;
        
            default:
                break;
        }

        if (newStatus) task.status = newStatus;
        if (newStatus && task.taskID) updateTaskStatus(newStatus, task.taskID);

        const sourceCol = columns[source.droppableId as ColumnKey];
        const destinationCol = columns[destination.droppableId as ColumnKey];
        const [removed] = sourceCol.splice(source.index, 1);
        destinationCol.splice(destination.index, 0, removed);

        setColumns({
            ...columns,
            [source.droppableId]: [...sourceCol],
            [destination.droppableId]: [...destinationCol],
        });
    };

    const updateTaskStatus = async (newStatus: string, taskId: string) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/update-status`,
                {task_id: taskId, new_status: newStatus},
                { withCredentials: true }
            );
            console.log("Task status updated:", response.data);
        } catch (error) {
            console.error("Failed to update task status:", error);
        }

    };

    

    // Add a new function to handle task deletion
    const deleteTask = async (taskId: string) => {
        // Create a new copy of columns with the task removed
        const newColumns = {
            toDo: columns.toDo.filter((task) => task.taskID != taskId),
            inProgress: columns.inProgress.filter(
                (task) => task.taskID != taskId
            ),
            completed: columns.completed.filter(
                (task) => task.taskID != taskId
            ),
        };
        // Update the columns state
        setColumns(newColumns);

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/delete-task`,
                { id: taskId },
                { withCredentials: true }
            );

            if (response.data.message === "Task was successfully deleted") {
                console.log("Succesfully deleted task");
            } else {
                console.log("Failed to delete task");
            }
        } catch (error) {
            console.error("Delete task failed: ", error);
        }
    };

    const updateTask = (taskId: string, newContent: string) => {
        const newColumns: Columns = { ...columns };

        // Go through each column
        Object.keys(newColumns).forEach((columnKey) => {
            // Assert that columnKey is a valid key of Columns
            const key = columnKey as ColumnKey;

            // Map through the tasks in each column to find and update the specified task
            newColumns[key] = newColumns[key].map((task) => {
                if (task.taskID === taskId) {
                    // Return a new task object with updated content
                    return { ...task, description: newContent };
                }
                return task;
            });
        });

        // Set the updated columns back to state
        setColumns(newColumns);
    };

    const createTask = () => {
        console.log("createTask called");
        const newTask: Task_interface = {
            id: randomInt(100, 2000), // Ensuring unique ID generation
            taskID: crypto.randomUUID(), // Use a proper UUID
            title: "New Task",
            description: "A new description",
            subTasks: [{ description: "A sub task", status: "to-do" }],
            courseID: "Course 101",
            estimatedCompletionTime: 69,
            status: "to-do",
            due_date: 0,
            weight: 0,
            created_at: "",
            priority: 0,

        };

        setColumns({
            ...columns,
            toDo: [...columns.toDo, newTask],
        });
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Flex
                flexDir="column"
                bg="main-bg"
                minH="100vh"
                w="full"
                color="white-text"
                pb="2rem"
            >
                <Flex py="2rem" flexDir="column" align="center"></Flex>

                <Flex justify="space-between" px="4rem">
                    <AltColumn
                        key="toDo"
                        column={{ id: "toDo", title: "To Do" }}
                        tasks={columns.toDo}
                        deleteTask={deleteTask}
                        updateTask={updateTask}
                        onCreateTask={createTask} // Assuming createTask is relevant for "To Do"
                        fetchTasks={fetchTasks}
                    />

                    <AltColumn
                        key="inProgress"
                        column={{ id: "inProgress", title: "In Progress" }}
                        tasks={columns.inProgress}
                        deleteTask={deleteTask}
                        updateTask={updateTask}
                        fetchTasks={() => {}}
                    />

                    <AltColumn
                        key="completed"
                        column={{ id: "completed", title: "Completed" }}
                        tasks={columns.completed}
                        deleteTask={deleteTask}
                        updateTask={updateTask}
                        fetchTasks={() => {}}
                    />
                </Flex>
            </Flex>
        </DragDropContext>
    );
};

export default KanbanBoard;
