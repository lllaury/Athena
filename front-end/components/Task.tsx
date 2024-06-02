// components/Task.tsx
import React, { useState, useEffect } from "react";
import { DraggableProvided } from "react-beautiful-dnd";
import {
    Flex,
    Box,
    Text,
    useColorModeValue,
    IconButton,
    useDisclosure,
    Progress,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, ViewIcon } from "@chakra-ui/icons";
import Subtasks from "./SubTasks";
import EditTaskModal from "./EditTaskModal";
import internal from "stream";
import TaskDetails from "./TaskDetails";
import { Task_interface, TaskDataSubTasks } from "../types/Task";


// type TaskDataSubTasks = {
//     description: string;
//     status: string;
// };

interface TaskProps {
    // task: {
    //     id: number; // Changed from number to string... ??? Still a number, use taskID to access stuff in database
    //     title: string;
    //     description: string;
    //     subTasks: TaskDataSubTasks[]; // Make sure this matches the structure of TaskDataSubTasks if needed
    //     taskID: string; // Is this meant to be the same as `id`? From my understanding, `id` is the frontend id for dragging, taskID is for the database
    //     courseID: string;
    //     estimatedCompletionTime: number; // Match backend field name if different
    //     status: string;
    //     due_date: number;
    //     weight: number;
    //     created_at: string;
    //     priority: number;

    // };
    task: Task_interface;
    provided: DraggableProvided;
    deleteTask: (taskId: string) => void; // Add deleteTask to the props
    updateTask: (taskId: string, newContent: string) => void; // Function to call when edit is saved
    handleStatusToggle: (taskId: string, description: string) => void;
}

const Task: React.FC<TaskProps> = ({
    task,
    provided,
    deleteTask,
    updateTask,
    handleStatusToggle,
}) => {
    const bgColor = useColorModeValue("gray.700", "gray.800");
    const borderColor = useColorModeValue("gray.600", "gray.700");
    const {
        isOpen: isEditOpen,
        onOpen: onEditOpen,
        onClose: onEditClose,
    } = useDisclosure();
    const {
        isOpen: isSubtasksOpen,
        onOpen: onSubtasksOpen,
        onClose: onSubtasksClose,
    } = useDisclosure();

    /**
     * 
     * @param epoch_millis of due date
     * @returns readable date time due date
     */
    const convert_to_human_readable_date = (epoch_millis: number) => {
        
        let date = new Date(epoch_millis);
        const dateOptions = { year: '2-digit', month: 'numeric', day: 'numeric' };
        const timeOptions = { timeStyle: 'short', hour12: true };
        const readable_date = date.toLocaleDateString('en-US', dateOptions); // it's throwing an error but works exactly how i want it, typescript moment
        const readable_time = date.toLocaleTimeString('en-US', timeOptions);
        return (readable_date + " " + readable_time);
    };

    /**
     * 
     * @returns progress of task
     */
    const calculateProgress = () => {
        const completedSubtasks = task.subTasks.filter(
            (subtask) => subtask.status === "completed"
        ).length;
        return (completedSubtasks / task.subTasks.length) * 100;
    };

    /**
     * 
     * @param status the status of the task
     * @returns what extra tile info to show for to-do and completed
     */
    const extra_tile_info = (task: Task_interface) => {     
        switch (task.status) {
            case "to-do":
                return <Text color="whiteAlpha.900" fontSize="sm">Weight: { task.weight }%</Text>;
            
            case "in-progress":
                return <Progress colorScheme="green" size="sm" value={calculateProgress()} w="100px" />
            
            case "completed":
                return <Progress colorScheme="green" size="sm" value={calculateProgress()} w="100px" />;
        
            default:
                return "error";
        }
    };

    return (
        <Flex
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            bg={bgColor}
            m={2}
            p={4}
            borderRadius="lg"
            boxShadow="0px 1px 3px rgba(0, 0, 0, 0.12)"
            border="1px solid"
            borderColor={borderColor}
            _hover={{
                background: useColorModeValue("gray.600", "gray.700"),
            }}
            transition="background 0.1s, boxShadow 0.1s"
            position="relative"
            justifyContent="space-between"
            alignItems="center"
            display="flex"
        >
            <Box flex="2" minW="0">
                <Text
                    color="whiteAlpha.900"
                    fontSize="md"
                    fontWeight="bold"
                    isTruncated
                    mr={8} // Add right margin to prevent text from overlapping icons
                >
                    {task.title}
                </Text>
                <Text
                    color="whiteAlpha.900"
                    fontSize="sm"
                    isTruncated
                    mr={8} // Add right margin to prevent text from overlapping icons
                >
                    {convert_to_human_readable_date(task.due_date)}
                </Text>
            </Box>
            <Box flex="1" minW="0" ml="auto">
                <Box>
                    <IconButton
                        aria-label="Edit task"
                        icon={<EditIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="purple"
                        onClick={onEditOpen} // Open edit modal
                    />
                    <IconButton
                        aria-label="Delete task"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        ml={1} // Add margin for consistent spacing between icons
                        onClick={() => deleteTask(task.taskID)} // Use deleteTask when the button is clicked
                    />
                    <IconButton
                        aria-label="View subtasks"
                        icon={<ViewIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="teal"
                        onClick={onSubtasksOpen}
                    />
                </Box>
                { extra_tile_info(task) }
            </Box> 
            <TaskDetails
                isOpen={isSubtasksOpen}
                onClose={onSubtasksClose}
                task={task}  // Need to change the stuff displayed here later
                handleStatusToggle={handleStatusToggle}
            />
            <EditTaskModal
                isOpen={isEditOpen}
                onClose={onEditClose}
                taskContent={task.description}
                onSave={(newContent) => updateTask(task.taskID, newContent)}
            />
        </Flex>
    );
};

export default Task;
