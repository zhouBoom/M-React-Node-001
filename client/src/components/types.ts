export interface Task {
  id: string;
  title: string;
  status: 'Todo' | 'In Progress' | 'Done';
}