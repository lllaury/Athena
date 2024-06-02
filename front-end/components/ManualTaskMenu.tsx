import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Flex,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface ManualTaskMenuProps {
    isOpen: boolean;
    onClose: () => void;
    fetchTasks: () => void;
}

const ManualTaskMenu: React.FC<ManualTaskMenuProps> = ({
    isOpen,
    onClose,
    fetchTasks,
}) => {
    const initialRef = React.useRef(null);
    const finalRef = React.useRef(null);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueYear, setDueYear] = useState("");
    const [dueMonth, setDueMonth] = useState("");
    const [dueDay, setDueDay] = useState("");
    const [className, setClassName] = useState("");
    const [description, setDescription] = useState("");
    const [showError, setShowError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        setDueDate(`${dueYear}-${dueMonth}-${dueDay}`);
    }, [dueYear, dueMonth, dueDay]);

    const validateFields = () => {
        console.log("Validating fields, due date is currently: ", dueDate);

        // Check if any field is empty
        if (
            !title.trim() ||
            !dueDate.trim() ||
            !className.trim() ||
            !description.trim()
        ) {
            setShowError(true);
            return false;
        }

        // Regex to check if the date is in the format YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dueDate)) {
            setShowError(true);
            return false;
        }

        // If all validations pass
        setShowError(false);
        return true;
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        switch (name) {
            case "title":
                setTitle(value);
                break;
            case "dueYear":
                setDueYear(value);
                break;
            case "dueMonth":
                setDueMonth(value);
                break;
            case "dueDay":
                setDueDay(value);
                break;
            case "className":
                setClassName(value);
                break;
            case "description":
                setDescription(value);
                break;
        }
    };

    const generateTask = async () => {
        try {
            if (!validateFields())
                throw new Error(
                    "Not valid fields"
                );

            const payload = {
                title: title,
                details: description,
                dueDate: dueDate,
                course_id: className,
                weight: 10, // Assuming weight is a fixed value for now
            };
            console.log("Generating manual task...")
            setIsLoading(true);
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/generate`,
                payload,
                { withCredentials: true }
            );
            console.log("Completed manual task generation")
            setIsLoading(false);


            if (response.data.message === "Task has been generated") {
                fetchTasks();
                onClose();
            } else {
                throw new Error(
                    "Unexpected response: " + response.data.message
                );
            }
        } catch (error) {
            setIsLoading(false);
            console.error("Generate task failed: ", error);
        }
    };

    return (
        <Modal
            initialFocusRef={initialRef}
            finalFocusRef={finalRef}
            isOpen={isOpen}
            onClose={onClose}
        >
            <ModalOverlay />
            <ModalContent bg="column-bg">
                <ModalHeader color={"white"}>Create Task</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <FormControl>
                        <FormLabel color={"white"}>Assignment Title</FormLabel>
                        <Input
                            name="title"
                            ref={initialRef}
                            placeholder="Title"
                            color="white"
                            value={title}
                            onChange={handleInputChange}
                        />
                    </FormControl>

                    <FormControl mt={4}>
                        <FormLabel color={"white"}>Due Date</FormLabel>
                        <Flex>
                            <Input
                                name="dueYear"
                                placeholder="202X"
                                color="white"
                                value={dueYear}
                                onChange={handleInputChange}
                                maxLength={4}
                            />
                            <Input
                                name="dueMonth"
                                placeholder="MM"
                                color="white"
                                value={dueMonth}
                                onChange={handleInputChange}
                                maxLength={2}
                            />
                            <Input
                                name="dueDay"
                                placeholder="DD"
                                color="white"
                                value={dueDay}
                                onChange={handleInputChange}
                                maxLength={2}
                            />
                        </Flex>
                    </FormControl>

                    <FormControl mt={4}>
                        <FormLabel color={"white"}>Class Name</FormLabel>
                        <Input
                            name="className"
                            placeholder="Class 101"
                            color="white"
                            value={className}
                            onChange={handleInputChange}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel color={"white"}>
                            Assignment Description
                        </FormLabel>
                        <Textarea
                            name="description"
                            placeholder="Assignment description."
                            size="sm"
                            color="white"
                            value={description}
                            onChange={handleInputChange}
                        />
                    </FormControl>
                    {showError && (
                        <FormLabel color="red">
                            Please check your inputs. Fields must not be empty
                            and the date must be formatted as YYYY-MM-DD.
                        </FormLabel>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme={isLoading ? "gray" : "blue"} mr={3} onClick={generateTask} isDisabled={isLoading}>
                        {isLoading ? "Loading..." : "Save"}
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ManualTaskMenu;
