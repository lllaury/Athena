import React, { useEffect, useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Switch,
    Progress,
    Text,
    VStack,
    HStack,
    useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import { Task_interface, TaskDataSubTasks } from "../types/Task";


// type TaskDataSubTasks = {
//     description: string;
//     status: string;
// };

// type Task = {
//     id: number;
//     title: string;
//     description: string;
//     subTasks: TaskDataSubTasks[];
//     taskID: string;
//     courseID: string;
//     estimatedCompletionTime: number;
//     status: string;
//     due_date: number;
//     weight: number;
//     created_at: string;
//     priority: number;
// };

interface TaskDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task_interface;
    handleStatusToggle: (taskId: string, description: string) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ isOpen, onClose, task, handleStatusToggle }) => {
    // const [subTasks, setSubTasks] = useState<TaskDataSubTasks[]>(task.subTasks);

    const calculateProgress = () => {
        const completedSubtasks = task.subTasks.filter(
            (subtask) => subtask.status === "completed"
        ).length;
        return (completedSubtasks / task.subTasks.length) * 100;
    };

    // const handleStatusToggle = async (description: string) => {
    //     const updatedSubTasks = subTasks.map((subtask) => {
    //         if (subtask.description === description) {
    //             return {
    //                 ...subtask,
    //                 status:
    //                     subtask.status === "completed"
    //                         ? "incomplete"
    //                         : "completed",
    //             };
    //         }
    //         return subtask;
    //     });
    //     setSubTasks(updatedSubTasks);

    //     const payload = {
    //         description,
    //         newStatus: updatedSubTasks.find(
    //             (subtask) => subtask.description === description
    //         )?.status,
    //         taskId: task.taskID,
    //     };

    //     try {
    //         const response = await axios.post(
    //             `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/update-subtask-status`,
    //             payload,
    //             { withCredentials: true }
    //         );
    //         console.log("Subtask status updated:", response.data);
    //     } catch (error) {
    //         console.error("Failed to update subtask status:", error);
    //         // Optionally revert the state if the backend call fails
    //         setSubTasks(subTasks);
    //     }
    // };

    const inactiveTabBg = useColorModeValue("gray.600", "gray.700");
    const inactiveTabColor = useColorModeValue("gray.400", "gray.500");
    const activeTabColor = "white";
    
    // useEffect(() => {
    //     setSubTasks(task.subTasks);
    // }, [task]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
            <ModalOverlay />
            <ModalContent bg="column-bg">
                <ModalHeader color="white-text">{task.title}</ModalHeader>
                <ModalCloseButton color="white-text" />
                <ModalBody>
                    <Tabs variant="enclosed">
                        <TabList mb="1em">
                            <Tab
                                _selected={{
                                    color: activeTabColor,
                                    borderColor: "white",
                                }}
                                _focus={{ boxShadow: "none" }}
                                color={inactiveTabColor}
                                bg={inactiveTabBg}
                            >
                                Description
                            </Tab>
                            <Tab
                                _selected={{
                                    color: activeTabColor,
                                    borderColor: "white",
                                }}
                                _focus={{ boxShadow: "none" }}
                                color={inactiveTabColor}
                                bg={inactiveTabBg}
                            >
                                Subtasks
                            </Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Text color="white-text" fontSize="lg">Course: {task.courseID}</Text>
                                <Text color="white-text" fontSize="lg">Task description: {task.description}</Text>
                                <Text color="white-text" fontSize="lg">Estimated completion time: {task.estimatedCompletionTime} hours</Text>
                                <Text color="white-text" fontSize="lg">Task Weight: {task.weight}%</Text>
                                <Text color="white-text" fontSize="lg">Due Date: {(new Date (task.due_date).toString())}</Text>
                                <Text color="white-text" fontSize="lg">Creation date: {task.created_at.substring(0, 10)}</Text>
                                <Text color="white-text" fontSize="lg">Priority: {task.priority}</Text>
                                
                            </TabPanel>
                            <TabPanel>
                                <VStack align="stretch">
                                    {task.subTasks.map((subtask, index) => (
                                        <HStack
                                            key={`${subtask.description}-${index}`}
                                            justify="space-between"
                                        >
                                            <Text color="white-text">
                                                {subtask.description}
                                            </Text>
                                            <Switch
                                                isChecked={
                                                    subtask.status ===
                                                    "completed"
                                                }
                                                onChange={() =>
                                                    handleStatusToggle(task.taskID, subtask.description)
                                                }
                                            />
                                        </HStack>
                                    ))}
                                </VStack>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
                <ModalFooter>
                    <Progress
                        colorScheme="green"
                        size="lg"
                        value={calculateProgress()}
                        w="full"
                    />
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TaskDetails;
