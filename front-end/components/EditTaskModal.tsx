// components/EditTaskModal.tsx

import React, { useState } from 'react';
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
} from '@chakra-ui/react';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskContent: string;
  onSave: (newContent: string) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, taskContent, onSave }) => {
  const [content, setContent] = useState(taskContent);

  const handleSave = () => {
    onSave(content);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="gray.700" color="white">
        <ModalHeader>Edit Task</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Task Description</FormLabel>
            <Input value={content} onChange={(e) => setContent(e.target.value)} autoFocus />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditTaskModal;
