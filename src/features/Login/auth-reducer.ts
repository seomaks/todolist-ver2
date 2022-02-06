import {Dispatch} from 'redux'
import {
  setAppStatusAC,
} from '../../app/app-reducer'
import {authAPI, LoginParamsType} from "../../api/todolists-api";
import {
  handleServerAppError,
  handleServerNetworkError
} from "../../utils/error-utils";
import {AxiosError} from "axios";
import {
  clearTodosDataAC
} from "../TodolistsList/todolists-reducer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false
}

const slice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    setIsLoggedInAC(state, action: PayloadAction<{value: boolean}>) {
      state.isLoggedIn = action.payload.value
    }
  }
})

export const authReducer = slice.reducer
export const {setIsLoggedInAC} = slice.actions

// thunks
export const loginTC = (data: LoginParamsType) => (dispatch: Dispatch) => {
  debugger
  dispatch(setAppStatusAC({status: 'loading'}))
  authAPI.login(data)
    .then(res => {
      if (res.data.resultCode === 0) {
        dispatch(setIsLoggedInAC({value: true}))
        dispatch(setAppStatusAC({status: 'succeeded'}))
      } else {
        handleServerAppError(dispatch, res.data)
      }
    })
    .catch((err: AxiosError) => {
      handleServerNetworkError(dispatch, err.message)
    })
}

export const logoutTC = () => (dispatch: Dispatch) => {
  dispatch(setAppStatusAC({status: 'loading'}))
  authAPI.logout()
    .then(res => {
      if (res.data.resultCode === 0) {
        dispatch(setIsLoggedInAC({value: false}))
        dispatch(setAppStatusAC({status: 'succeeded'}))
        dispatch(clearTodosDataAC())
      } else {
        handleServerAppError(dispatch, res.data)
      }
    })
    .catch((err: AxiosError) => {
      handleServerNetworkError(dispatch, err.message)
    })
}

