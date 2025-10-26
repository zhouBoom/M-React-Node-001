import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

// 获取任务数据文件路径
const tasksFilePath = path.join(process.cwd(), 'tasks.json');

// 读取任务数据
const readTasks = () => {
  try {
    const data = fs.readFileSync(tasksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取任务数据失败:', error);
    return [];
  }
};

// 写入任务数据
const writeTasks = (tasks) => {
  try {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('写入任务数据失败:', error);
    return false;
  }
};

// 生成新的任务ID
const generateNewId = () => {
  const tasks = readTasks();
  const maxId = tasks.length > 0 ? Math.max(...tasks.map(task => parseInt(task.id))) : 0;
  return (maxId + 1).toString();
};

// GET /api/tasks - 获取任务列表（支持筛选）
app.get("/api/tasks", (req, res) => {
  try {
    const { status } = req.query;
    let tasks = readTasks();
    
    // 如果有status参数，进行筛选
    if (status && ['Todo', 'In Progress', 'Done'].includes(status)) {
      tasks = tasks.filter(task => task.status === status);
    }
    
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取任务失败' });
  }
});

// POST /api/tasks - 添加新任务
app.post("/api/tasks", (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ success: false, message: '任务标题不能为空' });
    }
    
    const tasks = readTasks();
    const newTask = {
      id: generateNewId(),
      title: title.trim(),
      status: 'Todo'
    };
    
    tasks.push(newTask);
    
    if (writeTasks(tasks)) {
      res.status(201).json({ success: true, data: newTask });
    } else {
      res.status(500).json({ success: false, message: '保存任务失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '添加任务失败' });
  }
});

// PUT /api/tasks/:id - 更新任务
app.put("/api/tasks/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;
    
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ success: false, message: '任务不存在' });
    }
    
    // 更新任务字段
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ success: false, message: '任务标题不能为空' });
      }
      tasks[taskIndex].title = title.trim();
    }
    
    if (status !== undefined) {
      if (!['Todo', 'In Progress', 'Done'].includes(status)) {
        return res.status(400).json({ success: false, message: '无效的任务状态' });
      }
      tasks[taskIndex].status = status;
    }
    
    if (writeTasks(tasks)) {
      res.json({ success: true, data: tasks[taskIndex] });
    } else {
      res.status(500).json({ success: false, message: '更新任务失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '更新任务失败' });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Server is running normally!");
});

app.listen(4000, () => console.log("✅ Server running on http://localhost:4000"));
