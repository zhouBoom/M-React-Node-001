import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import TaskCard from './TaskCard.js';
import type { Task } from './types';

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取任务数据
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/tasks');
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('获取任务失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // 处理拖拽完成
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // 创建新的任务列表
    const newTasks = [...tasks];
    const taskIndex = newTasks.findIndex(task => task.id === draggableId);
    const task = newTasks.splice(taskIndex, 1)[0];
    
    // 更新任务状态
    task.status = destination.droppableId as 'Todo' | 'In Progress' | 'Done';
    
    // 更新前端状态
    setTasks(newTasks);

    // 调用后端 API 更新状态
    try {
      await fetch(`http://localhost:4000/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: task.status }),
      });
    } catch (error) {
      console.error('更新任务失败:', error);
    }
  };

  // 按状态分组任务
  const todoTasks = tasks.filter(task => task.status === 'Todo');
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
  const doneTasks = tasks.filter(task => task.status === 'Done');

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Todo 列 */}
        <Droppable droppableId="Todo">
          {(provided) => (
            <div
              className="bg-gray-100 p-4 rounded-lg min-h-[300px]"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <h2 className="text-lg font-bold mb-4 text-gray-800">Todo</h2>
              {todoTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* In Progress 列 */}
        <Droppable droppableId="In Progress">
          {(provided) => (
            <div
              className="bg-blue-100 p-4 rounded-lg min-h-[300px]"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <h2 className="text-lg font-bold mb-4 text-blue-800">In Progress</h2>
              {inProgressTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Done 列 */}
        <Droppable droppableId="Done">
          {(provided) => (
            <div
              className="bg-green-100 p-4 rounded-lg min-h-[300px]"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <h2 className="text-lg font-bold mb-4 text-green-800">Done</h2>
              {doneTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

export default TaskBoard;