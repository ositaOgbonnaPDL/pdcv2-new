import {Task} from '../../contexts/TaskManager/types';

export const sortByDate = (tasks: Task[]) => {
  return tasks.sort((a, b) => {
    const x = new Date(a.collectedOn);
    const y = new Date(b.collectedOn);
    return y.getTime() - x.getTime();
  });
};
