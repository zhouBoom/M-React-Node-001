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

// GET /api/tasks - 获取所有任务
app.get("/api/tasks", (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

// PUT /api/tasks/:id - 更新任务状态
app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['Todo', 'In Progress', 'Done'].includes(status)) {
    return res.status(400).json({ error: '无效的任务状态' });
  }
  
  const tasks = readTasks();
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: '任务不存在' });
  }
  
  tasks[taskIndex].status = status;
  
  if (writeTasks(tasks)) {
    res.json(tasks[taskIndex]);
  } else {
    res.status(500).json({ error: '更新任务失败' });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Server is running normally!");
});

app.listen(4000, () => console.log("✅ Server running on http://localhost:4000"));
