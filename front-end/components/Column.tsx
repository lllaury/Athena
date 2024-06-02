import React from 'react';
import { Flex, IconButton, Text } from '@chakra-ui/react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import Task from './Task'; // Import the Task component
import { AddIcon } from '@chakra-ui/icons';

// Interfaces
interface Task {
  id: number;
  content: string;
}

interface ColumnProps {
  column: {
    id: string;
    title: string;
  };
  tasks: Task[];
  deleteTask: (taskId: string) => void; // Add deleteTask to the props
  updateTask: (taskId: string, newContent: string) => void; // Add this prop
  onCreateTask?: () => void; // Optional because not all columns may have this button
}

const Column: React.FC<ColumnProps> = ({ column, tasks, deleteTask, updateTask, onCreateTask }) => {
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
        {column.title === "BACKLOG" && (
          <IconButton
            aria-label="Create task"
            icon={<AddIcon />}
            size="sm"
            colorScheme="green"
            onClick={() => {
              console.log('Create button clicked', onCreateTask);
              onCreateTask && onCreateTask();
            }}
          />
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
            bg={droppableSnapshot.isDraggingOver ? 'column-bg-dragging' : 'column-bg'}
          >
            {/* Here you map the tasks to Task components */}
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={`${task.id}`} index={index}>
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

export default Column;
