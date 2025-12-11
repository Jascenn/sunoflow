import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Task } from '@prisma/client';

interface TasksResponse {
  success: boolean;
  tasks: Task[];
}

export function useTasks() {
  return useQuery<TasksResponse>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await axios.get<TasksResponse>('/api/tasks');
      return response.data;
    },
    refetchInterval: (query) => {
      // Smart polling: only poll if there are pending/processing tasks
      const data = query.state.data;
      const hasPendingTasks = data?.tasks?.some(
        (task) => task.status === 'PENDING' || task.status === 'PROCESSING'
      );
      return hasPendingTasks ? 3000 : false; // Poll every 3 seconds if needed
    },
    staleTime: 2000,
  });
}
