import {TasksStateType} from '../App';
import {
  AddTodolistActionType,
  RemoveTodolistActionType,
  SetTodosActionType
} from './todolists-reducer';
import {
  TaskStatuses,
  TaskType,
  todolistsAPI, UpdateTaskModelType
} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppRootStateType} from "./store";

export type RemoveTaskActionType = {
  type: 'REMOVE-TASK',
  todolistId: string
  taskId: string
}

export type AddTaskActionType = {
  type: 'ADD-TASK',
  task: TaskType
}

export type ChangeTaskStatusActionType = {
  type: 'CHANGE-TASK-STATUS',
  todolistId: string
  taskId: string
  status: TaskStatuses
}

export type ChangeTaskTitleActionType = {
  type: 'CHANGE-TASK-TITLE',
  todolistId: string
  taskId: string
  title: string
}

export type SetTasksActionType = {
  type: 'SET-TASKS'
  tasks: Array<TaskType>
  todolistId: string
}


type ActionsType = RemoveTaskActionType | AddTaskActionType
  | ChangeTaskStatusActionType
  | ChangeTaskTitleActionType
  | AddTodolistActionType
  | RemoveTodolistActionType
  | SetTodosActionType
  | SetTasksActionType

const initialState: TasksStateType = {
  /*"todolistId1": [
      { id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
          startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
      { id: "2", title: "JS", status: TaskStatuses.Completed, todoListId: "todolistId1", description: '',
          startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
      { id: "3", title: "React", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
          startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
  ],
  "todolistId2": [
      { id: "1", title: "bread", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
          startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
      { id: "2", title: "milk", status: TaskStatuses.Completed, todoListId: "todolistId2", description: '',
          startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
      { id: "3", title: "tea", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
          startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
  ]*/

}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
  switch (action.type) {
    case 'REMOVE-TASK': {
      const stateCopy = {...state}
      const tasks = stateCopy[action.todolistId];
      const newTasks = tasks.filter(t => t.id !== action.taskId);
      stateCopy[action.todolistId] = newTasks;
      return stateCopy;
    }
    case 'ADD-TASK': {
      const stateCopy = {...state}
      const tasks = stateCopy[action.task.todoListId];
      const newTasks = [action.task, ...tasks];
      stateCopy[action.task.todoListId] = newTasks;
      return stateCopy;
    }
    case 'CHANGE-TASK-STATUS': {
      let todolistTasks = state[action.todolistId];
      let newTasksArray = todolistTasks
        .map(t => t.id === action.taskId ? {...t, status: action.status} : t);

      state[action.todolistId] = newTasksArray;
      return ({...state});
    }
    case 'CHANGE-TASK-TITLE': {
      let todolistTasks = state[action.todolistId];
      // найдём нужную таску:
      let newTasksArray = todolistTasks
        .map(t => t.id === action.taskId ? {...t, title: action.title} : t);

      state[action.todolistId] = newTasksArray;
      return ({...state});
    }
    case 'ADD-TODOLIST': {
      return {
        ...state,
        [action.todolistId]: []
      }
    }
    case 'REMOVE-TODOLIST': {
      const copyState = {...state};
      delete copyState[action.id];
      return copyState;
    }
    case "SET-TODOS": {
      const copyState = {...state};
      action.todolists.forEach((tl) => {
        copyState[tl.id] = []
      })
      return copyState
    }
    case 'SET-TASKS': {
      const stateCopy = {...state}
      stateCopy[action.todolistId] = action.tasks
      return stateCopy
    }
    default:
      return state;
  }
}

export const removeTaskAC = (taskId: string, todolistId: string): RemoveTaskActionType => {
  return {type: 'REMOVE-TASK', taskId: taskId, todolistId: todolistId}
}
export const addTaskAC = (task: TaskType): AddTaskActionType => {
  return {type: 'ADD-TASK', task}
}
export const changeTaskStatusAC = (taskId: string, status: TaskStatuses, todolistId: string): ChangeTaskStatusActionType => {
  return {type: 'CHANGE-TASK-STATUS', status, todolistId, taskId}
}
export const changeTaskTitleAC = (taskId: string, title: string, todolistId: string): ChangeTaskTitleActionType => {
  return {type: 'CHANGE-TASK-TITLE', title, todolistId, taskId}
}

export const setTasksAC = (tasks: Array<TaskType>, todolistId: string): SetTasksActionType => {
  return {type: 'SET-TASKS', tasks, todolistId}
}

//THUNK

export const fetchTasksTC = (todolistId: string) => {
  return (dispatch: Dispatch) => {
    todolistsAPI.getTasks(todolistId)
      .then((res) => {
        const tasks = res.data.items
        const action = setTasksAC(tasks, todolistId)
        dispatch(action)
      })
  }
}

export const removeTaskTC = (taskId: string, todolistId: string) => {
  return (dispatch: Dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId)
      .then((res) => {
        dispatch(removeTaskAC(taskId, todolistId))
      })
  }
}

export const addTaskTC = (todolistId: string, title: string) => {
  return (dispatch: Dispatch) => {
    todolistsAPI.createTask(todolistId, title)
      .then((res) => {
        let task = res.data.data.item
        dispatch(addTaskAC(task))
      })
  }
}

export const updateTaskStatusTC = (todolistId: string, taskId: string, status: TaskStatuses) => (dispatch: Dispatch,
                                                                                                 getState: () => AppRootStateType) => {
  const appState = getState()
  const taskApp = appState.tasks
  const taskForCurrentTodo = taskApp[todolistId]
  const currentTask = taskForCurrentTodo.find((t) => {
    return t.id === taskId
  })

  if (currentTask) {
    const model: UpdateTaskModelType = {
      title: currentTask.title,
      description: currentTask.description,
      status: status,
      priority: currentTask.priority,
      startDate: currentTask.startDate,
      deadline: currentTask.deadline
    }

    todolistsAPI.updateTask(todolistId, taskId, model)
      .then((res) => {
        dispatch(changeTaskStatusAC(taskId, status, todolistId))
      })
  }
}

export const updateTaskTitleTC = (taskId: string, newTitle: string, todolistId: string) => (dispatch: Dispatch,
                                                                                                 getState: () => AppRootStateType) => {
  const appState = getState()
  const taskApp = appState.tasks
  const taskForCurrentTodo = taskApp[todolistId]
  const currentTask = taskForCurrentTodo.find((t) => {
    return t.id === taskId
  })

  if (currentTask) {
    const model: UpdateTaskModelType = {
      title: newTitle,
      description: currentTask.description,
      status: currentTask.status,
      priority: currentTask.priority,
      startDate: currentTask.startDate,
      deadline: currentTask.deadline
    }

    todolistsAPI.updateTask(todolistId, taskId, model)
      .then((res) => {
        dispatch(changeTaskTitleAC(taskId, newTitle, todolistId))
      })
  }
}