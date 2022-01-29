import React, {useEffect} from 'react'
import './App.css'
import {TodolistsList} from '../features/TodolistsList/TodolistsList'

// You can learn about the difference by reading this guide on minimizing bundle size.
// https://mui.com/guides/minimizing-bundle-size/
// import { AppBar, Button, Container, IconButton, Toolbar, Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import {Menu} from '@mui/icons-material';
import {CircularProgress, LinearProgress} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {AppRootStateType} from "./store";
import {initializeAppTC, RequestStatusType} from "./app-reducer";
import {ErrorSnackbar} from "../components/ErrorSnackbar/ErrorSnackbar";
import {Login} from "../features/Login/Login";
import {Navigate, Route, Routes} from 'react-router-dom';
import {logoutTC} from "../features/Login/auth-reducer";


function App() {
  const dispatch = useDispatch()
  const status = useSelector<AppRootStateType, RequestStatusType>(state => state.app.status)
  const isInitialized = useSelector<AppRootStateType, boolean>(state => state.app.isInitialized)
  const isLoggedIn = useSelector<AppRootStateType, boolean>(state => state.auth.isLoggedIn)

  useEffect(() => {
    dispatch(initializeAppTC())
  })

  const logoutHandler = () => {
    dispatch(logoutTC())
  }

  if (!isInitialized) {
    return <div
      style={{
        position: 'fixed',
        top: '30%',
        textAlign: 'center',
        width: '100%'
      }}>
      <CircularProgress/>
    </div>
  }

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <Menu/>
          </IconButton>
          <Typography variant="h6">
            News
          </Typography>
          {isLoggedIn &&
            <Button color="inherit" onClick={logoutHandler}>Log out</Button>}
        </Toolbar>
        {status === 'loading' && <LinearProgress/>}
      </AppBar>
      <Container fixed>
        <Routes>
          <Route path="/" element={<TodolistsList/>}/>
          <Route path="login" element={<Login/>}/>
          <Route path="/404" element={<h1>404: PAGE NOT FOUND</h1>}/>
          <Route path="*" element={<Navigate to="/404"/>}/>
        </Routes>
      </Container>
      <ErrorSnackbar/>
    </div>
  )
}

export default App
