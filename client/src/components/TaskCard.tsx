import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Task } from './types';

interface TaskCardProps {
  task: Task;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          className="bg-white p-4 rounded-lg shadow-sm mb-3 cursor-pointer hover:shadow-md transition-shadow"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <p className="font-medium text-gray-800">{task.title}</p>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;