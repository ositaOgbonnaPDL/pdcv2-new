import {SpawnedActorRef, State as StateType} from 'xstate';
import {File} from '../../shared/types';
import {Project} from '../../shared/types/project';
import {
  Context as TaskContext,
  Events as TaskEvents,
  States as TaskStates,
} from './machines/task';

export type PointTuple = [number, number];

export enum TaskState {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  DONE = 'done',
}

export type Asset = File & {
  id: string;
  result?: any;
  progress: number;
  state: TaskState;
  projectId: Project['id'];
  client: Project['client'];
};

export type Task = {
  id: string;
  state: TaskState;
  isMocked: boolean;
  collectedOn: Date;
  projectId: Project['id'];
  client: Project['client'];
  data: Record<string, any>;
  assets: Map<string, Asset>;
  geometry:
    | {
        type: 'Point';
        coordinates: PointTuple;
      }
    | {
        coordinates: [PointTuple[]];
        type: 'Polygon' | 'LineString';
      };
};

export type Tasks = Map<string, Task>;

export type TaskRef = SpawnedActorRef<
  TaskEvents,
  StateType<TaskContext, TaskEvents, TaskStates>
>;
