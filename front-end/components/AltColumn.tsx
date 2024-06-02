import React, { useState, useEffect } from "react";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import Task from "./Task"; // Import the Task component
import { AddIcon } from "@chakra-ui/icons";
import ImportButton from "./ImportButton";
import { Task_interface, TaskDataSubTasks } from "../types/Task";
import axios from "axios";

// type TaskDataSubTasks = {
//     description: string;
//     status: string;
// };

// // Interfaces
// interface Task {
//     id: number;                  // Numeric ID for frontend use
//     title: string;
//     description: string;
//     subTasks: TaskDataSubTasks[];          // Assuming subTasks are an array of strings
//     taskID: string;              // MongoDB ObjectId
//     courseID: string;            // Equivalent to course_id in the backend
//     estimatedCompletionTime: number;
//     status: string;
//     due_date: number;
//     weight: number;
//     created_at: string;
//     priority: number;
// }

interface ColumnProps {
    column: {
        id: string;
        title: string;
    };
    tasks: Task_interface[];
    deleteTask: (taskId: string) => void; // Add deleteTask to the props
    updateTask: (taskId: string, newContent: string) => void; // Add this prop
    onCreateTask?: () => void; // Optional because not all columns may have this button
    fetchTasks: () => void;
}

const AltColumn: React.FC<ColumnProps> = ({
    column,
    tasks,
    deleteTask,
    updateTask,
    onCreateTask,
    fetchTasks
}) => {

    const [updatedSubTasks, setUpdatedSubTasks] = useState<TaskDataSubTasks[]>([]);
    const handleStatusToggle = async (taskId: string, description: string) => {

        const task = tasks.find(task => task.taskID == taskId);
        if (!task) {
            console.log("ALCOLUMN: COULD NOT FIND TASK WITH ID IN HANDLE STATUS TOGGLE!");
            return;
        } 

        const updatedSubTasks = task.subTasks.map((subtask) => {
            if (subtask.description === description) {
                return {
                    ...subtask,
                    status:
                        subtask.status === "completed"
                            ? "incomplete"
                            : "completed",
                };
            }
            return subtask;
        });
        // setSubTasks(updatedSubTasks);
        const oldSubtasks = task.subTasks; // backup
        task.subTasks = updatedSubTasks

        const payload = {
            description,
            newStatus: updatedSubTasks.find(
                (subtask) => subtask.description === description
            )?.status,
            taskId: task.taskID,
        };

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/update-subtask-status`,
                payload,
                { withCredentials: true }
            );
            console.log("Subtask status updated:", response.data);
        } catch (error) {
            console.error("Failed to update subtask status:", error);
            // Optionally revert the state if the backend call fails
            // setSubTasks(subTasks);
            task.subTasks = oldSubtasks;
        }
        setUpdatedSubTasks(updatedSubTasks);
    };

    // useEffect(() => {
    //     setSubTasks(task.subTasks);
    // }, [task]);

    return (
        <Flex rounded="3px" bg="column-bg" w="400px" h="620px" flexDir="column">
            <Flex
                align="center"
                justify="space-between" // Spreads out children to start and end of container
                h="60px"
                bg="column-header-bg"
                rounded="3px 3px 0 0"
                px="1.5rem"
                mb="1.5rem"
            >
                <Text fontSize="17px" fontWeight={600} color="subtle-text">
                    {column.title}
                </Text>
                {column.id === "toDo" && (
                    <ImportButton fetchTasks={fetchTasks} ></ImportButton>
                )}
            </Flex>

            <Droppable droppableId={column.id}>
                {(droppableProvided, droppableSnapshot) => (
                    <Flex
                        px="1.5rem"
                        flex={1}
                        flexDir="column"
                        ref={droppableProvided.innerRef}
                        {...droppableProvided.droppableProps}
                        bg={
                            droppableSnapshot.isDraggingOver
                                ? "column-bg-dragging"
                                : "column-bg"
                        }
                    >
                        {/* Here you map the tasks to Task components */}
                        {tasks.map((task, index) => (
                            <Draggable
                                key={task.id}
                                draggableId={`${task.id}`}
                                index={index}
                            >
                                {(draggableProvided) => (
                                    // Use the Task component instead of inline rendering
                                    <Task
                                        key={task.id}
                                        task={task}
                                        provided={draggableProvided}
                                        // You might want to pass isDragging if you need it in the Task component
                                        //isDragging={draggableProvided.draggableProps.style?.transform ? true : false}
                                        deleteTask={deleteTask} // Pass deleteTask to Task
                                        updateTask={updateTask} // And here you pass updateTask to the Task
                                        handleStatusToggle={handleStatusToggle}
                                    />
                                )}
                            </Draggable>
                        ))}
                        {droppableProvided.placeholder}
                    </Flex>
                )}
            </Droppable>
        </Flex>
    );
};

export default AltColumn;
