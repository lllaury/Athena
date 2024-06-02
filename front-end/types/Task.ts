export type TaskDataSubTasks = {
    description: string;
    status: string;
};

export interface Task_interface {

    id: number;
    title: string;
    description: string;
    subTasks: TaskDataSubTasks[];
    taskID: string;
    courseID: string;
    estimatedCompletionTime: number;
    status: string;
    due_date: number;
    weight: number;
    created_at: string;
    priority: number;
}