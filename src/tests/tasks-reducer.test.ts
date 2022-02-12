import {
  addTaskAC,
  removeTaskAC, setTasksAC,
  tasksReducer,
  TasksStateType, updateTaskAC
} from "../features/TodolistsList/tasks-reducer";
import {
  addTodolistAC,
  removeTodolistAC, setTodolistsAC
} from "../features/TodolistsList/todolists-reducer";
import {TaskPriorities, TaskStatuses} from "../api/todolists-api";

let startState: TasksStateType = {};
beforeEach(() => {
  startState = {
    "todolistId1": [
      {id: '1', title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: "",
        startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low, entityStatus: 'idle'},
      {id: '2', title: "JS", status: TaskStatuses.Completed, todoListId: "todolistId1", description: "",
        startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low, entityStatus: 'idle'},
      {id: '3', title: "React", status: TaskStatuses.New, todoListId: "todolistId1", description: "",
        startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low, entityStatus: 'idle'},
    ],
    "todolistId2": [
      {id: '1', title: "bread", status: TaskStatuses.New, todoListId: "todolistId2", description: "",
        startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low, entityStatus: 'idle'},
      {id: '2', title: "milk", status: TaskStatuses.Completed, todoListId: "todolistId2", description: "",
        startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low, entityStatus: 'idle'},
      {id: '3', title: "tea", status: TaskStatuses.New, todoListId: "todolistId2", description: "",
        startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low, entityStatus: 'idle'},
    ]
  };
});

test('correct task should be deleted from correct array', () => {
  const action = removeTaskAC({taskId: '2', todolistId: 'todolistId2'});

  const endState = tasksReducer(startState, action)

  expect(endState["todolistId1"].length).toBe(3);
  expect(endState["todolistId2"].length).toBe(2);
  expect(endState["todolistId2"].every(t => t.id != "2")).toBeTruthy();
});
test('correct task should be added to correct array', () => {
  let action = addTaskAC({ task: {
    todoListId: "todolistId2",
    title: 'juice',
    status: TaskStatuses.New,
    addedDate: '',
    deadline: '',
    description: '',
    order: 0,
    priority: 0,
    startDate: '',
    id: 'id exists',
    entityStatus: 'idle'
  }})
 // const action = addTaskAC(task)
  const endState = tasksReducer(startState, action)

  expect(endState['todolistId1'].length).toBe(3)
  expect(endState['todolistId2'].length).toBe(4)
  expect(endState['todolistId2'][0].id).toBeDefined()
  expect(endState['todolistId2'][0].title).toBe('juice')
});
test('status of specified task should be changed', () => {
  const action = updateTaskAC({taskId: '2', model: {status: TaskStatuses.New}, todolistId: 'todolistId2'});

  const endState = tasksReducer(startState, action)

  expect(endState["todolistId1"][1].status).toBe(TaskStatuses.Completed);
  expect(endState["todolistId2"][1].status).toBe(TaskStatuses.New);
});
test('title of specified task should be changed', () => {
  const action = updateTaskAC({taskId: '2', model: {title: "yogurt"}, todolistId: "todolistId2"});

  const endState = tasksReducer(startState, action)

  expect(endState["todolistId1"][1].title).toBe("JS");
  expect(endState["todolistId2"][1].title).toBe("yogurt");
  expect(endState["todolistId2"][0].title).toBe("bread");
});
test('new array should be added when new todolist is added', () => {
  const action = addTodolistAC({todolist: {
      id: 'blabla',
      title: "new todolist",
      order: 0,
      addedDate: ''
    }});

  const endState = tasksReducer(startState, action)

  const keys = Object.keys(endState);
  const newKey = keys.find(k => k != "todolistId1" && k != "todolistId2");
  if (!newKey) {
    throw Error("new key should be added")
  }

  expect(keys.length).toBe(3);
  expect(endState[newKey]).toEqual([]);
});
test('propertry with todolistId should be deleted', () => {
  const action = removeTodolistAC({id: "todolistId2"});

  const endState = tasksReducer(startState, action)

  const keys = Object.keys(endState);

  expect(keys.length).toBe(1);
  expect(endState["todolistId2"]).not.toBeDefined();
});

test('empty arrays shoud be added when we set todolists', () => {
  const action = setTodolistsAC({todolists: [
      {id: '1', title: 'title 1', order: 0, addedDate: ''},
      {id: '2', title: 'title 2', order: 0, addedDate: ''}
    ]});

  const endState = tasksReducer({}, action)

  const keys = Object.keys(endState);

  expect(keys.length).toBe(2);
  expect(endState['1']).toBeDefined();
  expect(endState['2']).toBeDefined();
});

test('tasks should be added for todolist', () => {
  const action = setTasksAC({tasks: startState['todolistId1'], todolistId: 'todolistId1'});

  const endState = tasksReducer({
    'todolistId2': [],
    'todolistId1': [],
  }, action)

  expect(endState['todolistId1'].length).toBe(3);
  expect(endState['todolistId2'].length).toBe(0);
});