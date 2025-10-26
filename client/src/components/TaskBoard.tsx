import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import TaskCard from './TaskCard.js';
import type { Task } from './types';

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  // 获取任务数据
  const fetchTasks = async (status?: string) => {
    try {
      setLoading(true);
      let url = 'http://localhost:4000/api/tasks';
      if (status && status !== 'All') {
        url += `?status=${status}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      
      // 前端保存所有任务，然后根据筛选条件过滤
      if (status === 'All' || !status) {
        setTasks(data.success ? data.data : []);
      }
      setFilteredTasks(data.success ? data.data : []);
    } catch (error) {
      console.error('获取任务失败:', error);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(filterStatus);
  }, [filterStatus]);

  // 处理筛选变更
  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
  };

  // 添加新任务
  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    try {
      setAddingTask(true);
      const response = await fetch('http://localhost:4000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      const data = await response.json();
      
      if (data.success) {
        // 添加到本地状态
        const updatedTasks = [...tasks, data.data];
        setTasks(updatedTasks);
        
        // 如果当前筛选的是 All 或 Todo，则添加到筛选后的列表
        if (filterStatus === 'All' || filterStatus === 'Todo') {
          setFilteredTasks([...filteredTasks, data.data]);
        }
        
        // 清空输入框
        setNewTaskTitle('');
      }
    } catch (error) {
      console.error('添加任务失败:', error);
    } finally {
      setAddingTask(false);
    }
  };

  // 更新任务
  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      
      if (data.success) {
        // 更新本地状态
        const updatedTasks = tasks.map(task => 
          task.id === id ? data.data : task
        );
        setTasks(updatedTasks);
        
        // 更新筛选后的列表
        const updatedFilteredTasks = filteredTasks.map(task => 
          task.id === id ? data.data : task
        );
        setFilteredTasks(updatedFilteredTasks);
      }
    } catch (error) {
      console.error('更新任务失败:', error);
    }
  };

  // 处理拖拽完成
  const handleDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;
    
    const newStatus = destination.droppableId as 'Todo' | 'In Progress' | 'Done';
    const task = tasks.find(t => t.id === draggableId);
    
    if (!task || task.status === newStatus) return;

    // 调用后端更新状态
    await handleUpdateTask(draggableId, { status: newStatus });
  };

  // 按状态分组任务（使用筛选后的数据）
  const todoTasks = filteredTasks.filter(task => task.status === 'Todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'In Progress');
  const doneTasks = filteredTasks.filter(task => task.status === 'Done');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Task Board</h1>
          <div className="flex justify-center items-center h-64">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Task Board</h1>
        
        {/* 筛选和添加任务区域 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {/* 筛选按钮组 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['All', 'Todo', 'In Progress', 'Done'].map(status => (
              <button
                key={status}
                className={`px-4 py-2 rounded-md transition-colors ${filterStatus === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                onClick={() => handleFilterChange(status)}
              >
                {status}
              </button>
            ))}
          </div>
          
          {/* 添加任务输入框 */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="输入新任务标题..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={addingTask}
            />
            <button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim() || addingTask}
              className={`px-6 py-2 bg-green-500 text-white rounded-md transition-colors ${!newTaskTitle.trim() || addingTask
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-green-600'
              }`}
            >
              {addingTask ? '添加中...' : '添加'}
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Todo 列 */}
            <Droppable droppableId="Todo">
              {(provided) => (
                <div
                  className="bg-white rounded-lg shadow p-4 min-h-[300px] border-l-4 border-yellow-400"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Todo</h2>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {todoTasks.length}
                    </span>
                  </div>
                  {todoTasks.map((task, index) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      index={index} 
                      onUpdate={handleUpdateTask} 
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* In Progress 列 */}
            <Droppable droppableId="In Progress">
              {(provided) => (
                <div
                  className="bg-white rounded-lg shadow p-4 min-h-[300px] border-l-4 border-blue-400"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-blue-800">In Progress</h2>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {inProgressTasks.length}
                    </span>
                  </div>
                  {inProgressTasks.map((task, index) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      index={index} 
                      onUpdate={handleUpdateTask} 
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Done 列 */}
            <Droppable droppableId="Done">
              {(provided) => (
                <div
                  className="bg-white rounded-lg shadow p-4 min-h-[300px] border-l-4 border-green-400"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-green-800">Done</h2>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {doneTasks.length}
                    </span>
                  </div>
                  {doneTasks.map((task, index) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      index={index} 
                      onUpdate={handleUpdateTask} 
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default TaskBoard;