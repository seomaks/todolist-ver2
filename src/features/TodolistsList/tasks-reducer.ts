import {
  addTodolistAC,
  clearTodosDataAC,
  removeTodolistAC,
  setTodolistsAC
} from './todolists-reducer'
import {
  TaskPriorities,
  TaskStatuses,
  TaskType,
  todolistsAPI,
  UpdateTaskModelType
} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {
  RequestStatusType,
  setAppStatusAC,
} from "../../app/app-reducer";
import {AxiosError} from "axios";
import {
  handleServerAppError,
  handleServerNetworkError
} from "../../utils/error-utils";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: TasksStateType = {}

// slice
const slice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    removeTaskAC(state, action: PayloadAction<{taskId: string, todolistId: string}>) {
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex(t => t.id === action.payload.taskId)
      if (index > -1) {
        tasks.splice(index, 1)
      }
    },
    addTaskAC(state, action: PayloadAction<{task: TaskType}>) {
      state[action.payload.task.todoListId].unshift(action.payload.task)
    },
    updateTaskAC(state, action: PayloadAction<{taskId: string, model: UpdateDomainTaskModelType, todolistId: string}>) {
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex(t => t.id === action.payload.taskId)
      if (index > -1) {
        tasks[index] = {...tasks[index], ...action.payload.model}
      }
    },
    setTasksAC(state, action: PayloadAction<{tasks: Array<TaskType>, todolistId: string}>) {
      state[action.payload.todolistId] = action.payload.tasks
    },
    changeTaskEntityStatusAC(state, action: PayloadAction<{taskId: string, todolistId: string, entityStatus: RequestStatusType}>) {
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex(t => t.id === action.payload.taskId)
      if (index > -1) {
        tasks[index] = {...tasks[index], entityStatus: action.payload.entityStatus}
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addTodolistAC, (state, action) => {
      state[action.payload.todolist.id] = []
    });
    builder.addCase(removeTodolistAC, (state, action) => {
      delete state[action.payload.id]
    });
    builder.addCase(setTodolistsAC, (state, action) => {
      action.payload.todolists.forEach((tl:any) => {
        state[tl.id] = []
      })
    });
    builder.addCase(clearTodosDataAC, (state, action) => {
      return {}
    });
  }
})

export const tasksReducer = slice.reducer
// actions
export  const {removeTaskAC, addTaskAC, updateTaskAC, setTasksAC, changeTaskEntityStatusAC} = slice.actions
// thunks
export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch) => {
  dispatch(setAppStatusAC({status: 'loading'}))
  todolistsAPI.getTasks(todolistId)
    .then((res) => {
      const tasks = res.data.items
      const action = setTasksAC({tasks, todolistId})
      dispatch(action)
      dispatch(setAppStatusAC({status: 'succeeded'}))
    })
    .catch((err: AxiosError) => {
      handleServerNetworkError(dispatch, err.message)
    })
}
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
  dispatch(setAppStatusAC({status: 'loading'}))
  dispatch(changeTaskEntityStatusAC({taskId, todolistId, entityStatus: 'loading'}))
  todolistsAPI.deleteTask(todolistId, taskId)
    .then(res => {
      const action = removeTaskAC({taskId, todolistId})
      dispatch(action)
      dispatch(setAppStatusAC({status: 'succeeded'}))
    })
    .catch((err: AxiosError) => {
      handleServerNetworkError(dispatch, err.message)
    })
}
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
  dispatch(setAppStatusAC({status: 'loading'}))
  todolistsAPI.createTask(todolistId, title)
    .then(res => {
      if (res.data.resultCode === 0) {
        dispatch(addTaskAC({task: res.data.data.item}))
        dispatch(setAppStatusAC({status: 'succeeded'}))
      } else {
        handleServerAppError(dispatch, res.data)
      }
    })
    .catch((err: AxiosError) => {
      handleServerNetworkError(dispatch, err.message)
    })
}

export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
  (dispatch: Dispatch, getState: () => AppRootStateType) => {
    const state = getState()
    const task = state.tasks[todolistId].find(t => t.id === taskId)
    if (!task) {
      //throw new Error("task not found in the state");
      console.warn('task not found in the state')
      return
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...domainModel
    }

    dispatch(setAppStatusAC({status: 'loading'}))
    todolistsAPI.updateTask(todolistId, taskId, apiModel)
      .then(res => {
        const action = updateTaskAC({taskId, model: domainModel, todolistId})
        dispatch(action)
        dispatch(setAppStatusAC({status: 'succeeded'}))
      })
      .catch((err: AxiosError) => {
        handleServerNetworkError(dispatch, err.message)
      })
  }

// types
export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}
export type TasksStateType = {
  [key: string]: Array<TaskType>
}