import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Radio,
    RadioGroup,
    Stack,
    Checkbox,
    CheckboxGroup,
    FormLabel,
    Text,
} from "@chakra-ui/react";
import axios from "axios";
import { Console } from "console";
import React, { useEffect, useState } from "react";

interface asmProps {
    isOpen: boolean;
    onClose: () => void;
    fetchTasks: () => void;
}

interface Assignment {
    id: string;
    course_id: string;
    description: string;
    due_date: string;
    title: string;
    user: string;
    weight: string;
}

const AssignmentSelectMenu: React.FC<asmProps> = ({
    isOpen,
    onClose,
    fetchTasks,
}) => {
    const [scrollBehavior, setScrollBehavior] = useState<"inside" | "outside">(
        "inside"
    );
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignmentIDs, setSelectedAssignmentIDs] = useState<
        string[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);

    const btnRef = React.useRef(null);

    const handleCheckboxChange = (checkedValues: string[]) => {
        console.log(checkedValues);
        setSelectedAssignmentIDs(checkedValues);
    };

    const fetchAssignments = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/db/assignments`,
                { withCredentials: true }
            );

            if (!response.data) {
                throw new Error("Failed to get assignments");
            }

            console.log(response.data);
            setAssignments(response.data);
        } catch (error) {
            console.error("Error: " + error);
        }
    };

    const generateTasksFromSelected = async () => {
        try {
            if (selectedAssignmentIDs.length < 1) {
                setShowError(true);
                throw new Error("No selected assignments");
            }
            setShowError(false);

            setIsLoading(true);
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/db/import/selected-assignments`,
                {
                    assignmentList: selectedAssignmentIDs,
                },
                { withCredentials: true }
            );

            if (response.data) {
                setIsLoading(false);
                setSelectedAssignmentIDs([]);
                fetchTasks();
                onClose();
            } else {
                setIsLoading(false);
                setSelectedAssignmentIDs([]);
            }
        } catch (error) {
            console.error("Error: " + error);
            setIsLoading(false); // Ensure loading is turned off in case of an error
            setSelectedAssignmentIDs([]);
        }
    };

    useEffect(() => {
        if (isOpen) fetchAssignments();
    }, [isOpen]);

    return (
        <>
            <Modal
                onClose={onClose}
                finalFocusRef={btnRef}
                isOpen={isOpen}
                scrollBehavior={scrollBehavior}
            >
                <ModalOverlay />
                <ModalContent bg="column-bg">
                    <ModalHeader color="white">Select Assignments</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody color="white">
                        <CheckboxGroup
                            colorScheme="green"
                            value={selectedAssignmentIDs}
                            onChange={handleCheckboxChange}
                        >
                            <Stack spacing={[1, 5]} direction={"column"}>
                                {assignments.map((assignment) => (
                                    <Checkbox
                                        key={assignment.id}
                                        value={assignment.id}
                                    >
                                        {assignment.title}
                                    </Checkbox>
                                ))}
                            </Stack>
                        </CheckboxGroup>
                        {showError && (
                            <Text fontSize="lg" color="red">
                                Must select at least 1 assignment.
                            </Text>
                        )}
                    </ModalBody>
                    <ModalFooter color="white">
                        <Button
                            colorScheme={isLoading ? "gray" : "blue"}
                            onClick={generateTasksFromSelected}
                            isDisabled={isLoading}
                        >
                            {isLoading ? "Loading..." : "Save"}
                        </Button>
                        <Button onClick={onClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AssignmentSelectMenu;
