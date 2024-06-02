import { ChevronDownIcon } from "@chakra-ui/icons";
import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    Text,
    ModalFooter
} from "@chakra-ui/react";
import axios from "axios";
import ManualTaskMenu from "./ManualTaskMenu";
import AssignmentSelectMenu from "./AssignmentSelectMenu";
import { useState } from "react";

interface ImportButtonProps {
    fetchTasks: () => void;
}

const ImportButton: React.FC<ImportButtonProps> = ({ fetchTasks }) => {
    const [isManualTaskMenuOpen, setIsManualTaskMenuOpen] =
        useState<boolean>(false);
    const [isGeneratingFromAll, setIsGeneratingFromAll] = useState(false);

    const onClose = () => {
        setIsManualTaskMenuOpen(false);
    };

    const [isAsmMenuOpen, setIsAsmMenuOpen] = useState<boolean>(false);

    const onAsmClose = () => {
        setIsAsmMenuOpen(false);
    };

    const importAllAssignments = async () => {
        try {
            setIsGeneratingFromAll(true);

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/db/import/all-assignments`,
                { withCredentials: true }
            );

            if (response.data.message > 0) {
                setIsGeneratingFromAll(false);
                fetchTasks();
            } else {
                throw new Error("Unsuccessful import all assignments");
            }
        } catch (error) {
            setIsGeneratingFromAll(false);
            console.error("Failed to import all tasks:", error);
        }
    };

    return (
        <>
            <Menu>
                <MenuButton
                    as={Button}
                    colorScheme="green"
                    rightIcon={<ChevronDownIcon />}
                >
                    Import
                </MenuButton>
                <MenuList
                    backgroundColor="#276749"
                    color="white"
                    borderWidth="0px"
                >
                    <MenuItem
                        _focus={{ bg: "green.500", color: "white" }} // Customize focused state colors
                        bg="#276749"
                        color="white"
                        onClick={importAllAssignments}
                    >
                        Import All
                    </MenuItem>
                    <MenuItem
                        _focus={{ bg: "green.500", color: "white" }} // Repeat for each MenuItem
                        bg="#276749"
                        color="white"
                        onClick={() => {
                            setIsAsmMenuOpen(true);
                        }}
                    >
                        Import Selected
                    </MenuItem>
                    <MenuItem
                        _focus={{ bg: "green.500", color: "white" }} // Customize focus style
                        bg="#276749"
                        color="white"
                        onClick={() => {
                            setIsManualTaskMenuOpen(true);
                        }}
                    >
                        Manual Task
                    </MenuItem>
                </MenuList>
            </Menu>

            <ManualTaskMenu
                isOpen={isManualTaskMenuOpen}
                onClose={onClose}
                fetchTasks={fetchTasks}
            />

            <AssignmentSelectMenu
                isOpen={isAsmMenuOpen}
                onClose={onAsmClose}
                fetchTasks={fetchTasks}
            ></AssignmentSelectMenu>

            <Modal isOpen={isGeneratingFromAll} colorScheme="column-bg" onClose={() => {}}>
                <ModalOverlay />
                <ModalContent bg="column-bg">
                    <ModalHeader color="white">Loading tasks...</ModalHeader>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ImportButton;
