import {setIsLoggedInAC} from "../features/Login/auth-reducer";
import {authAPI} from "../api/todolists-api";
import {Dispatch} from "redux";

const initialState = {
  status: 'idle' as RequestStatusType,
  error: null as ErrorType,
  isInitialized: false
}

type InitialStateType = typeof initialState

export const appReducer = (state: InitialStateType = initialState, action: AppActionsType): InitialStateType => {
  switch (action.type) {
    case 'APP/SET-STATUS':
      return {...state, status: action.status}
    case 'APP/SET-ERROR':
      return {...state, error: action.error}
    case 'APP/SET-IS-INITIALIZED':
      return {...state, isInitialized: action.isInitialized}
    default:
      return state
  }
}

// actions
export const setAppStatusAC = (status: RequestStatusType) => ({type: 'APP/SET-STATUS', status} as const)
export const setAppErrorAC = (error: ErrorType) => ({type: 'APP/SET-ERROR', error} as const)
export const setIsInitializedAC = (isInitialized: boolean) => ({type: 'APP/SET-IS-INITIALIZED', isInitialized} as const)

// thunks
export const initializeAppTC = () => (dispatch: Dispatch) => {
  authAPI.me().then(res => {
    if (res.data.resultCode === 0) {
      dispatch(setIsLoggedInAC(true));
    } else {
    }
  })
    .finally(() => {
      dispatch(setIsInitializedAC(true))
    })
}


// types
export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type ErrorType = string | null
export type SetAppErrorActionType = ReturnType<typeof setAppErrorAC>
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>
export type SetIsInitializedActionType = ReturnType<typeof setIsInitializedAC>
export type AppActionsType = SetAppStatusActionType | SetAppErrorActionType | SetIsInitializedActionType
