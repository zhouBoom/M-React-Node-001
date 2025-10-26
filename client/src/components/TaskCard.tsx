import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Task } from './types';

interface TaskCardProps {
  task: Task;
  index: number;
  onUpdate: (id: string, updates: Partial<Task>) => Promise<void>;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(task.title);
  };

  const handleSave = async () => {
    if (!editTitle.trim() || isSaving) return;
    
    try {
      setIsSaving(true);
      await onUpdate(task.id, { title: editTitle.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error('保存任务失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(task.title);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          className="bg-white p-4 rounded-lg shadow mb-3 transition-all duration-200 hover:shadow-md"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editTitle.trim() || isSaving}
                  className={`px-3 py-1 text-sm rounded transition-colors ${!editTitle.trim() || isSaving
                    ? 'bg-blue-300 text-white cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          ) : (
            <div
              className="cursor-pointer"
              {...provided.dragHandleProps}
              onClick={handleEdit}
            >
              <p className="font-medium text-gray-800 mb-2">{task.title}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">ID: {task.id}</span>
                <span className="text-xs text-gray-500 cursor-pointer hover:text-blue-500">
                  点击编辑
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;