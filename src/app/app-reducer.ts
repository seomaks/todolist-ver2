import {setIsLoggedInAC} from "../features/Login/auth-reducer";
import {authAPI} from "../api/todolists-api";
import {Dispatch} from "redux";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState = {
  status: 'idle' as RequestStatusType,
  error: null as ErrorType,
  isInitialized: false
}
// slice
const slice = createSlice({
  name: 'app',
  initialState: initialState,
  reducers: {
    setAppStatusAC(state, action: PayloadAction<{status: RequestStatusType}>) {
      state.status = action.payload.status
    },
    setAppErrorAC(state, action: PayloadAction<{error: ErrorType}>) {
      state.error = action.payload.error
    },
    setIsInitializedAC(state, action: PayloadAction<{isInitialized: boolean}>) {
      state.isInitialized = action.payload.isInitialized
    },
  }
})
// reducer
export const appReducer = slice.reducer
// actions
export const {setAppStatusAC, setAppErrorAC, setIsInitializedAC} = slice.actions

// thunks
export const initializeAppTC = () => (dispatch: Dispatch) => {
  authAPI.me().then(res => {
    if (res.data.resultCode === 0) {
      dispatch(setIsLoggedInAC({value: true}));
    } else {
    }
  })
    .finally(() => {
      dispatch(setIsInitializedAC({isInitialized: true}))
    })
}


// types
export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type ErrorType = string | null
export type SetAppErrorActionType = ReturnType<typeof setAppErrorAC>
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>
