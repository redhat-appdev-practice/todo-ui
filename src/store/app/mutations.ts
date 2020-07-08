import { User, Todo } from 'src/apiClient';
import { State } from 'src/WrapperTypes';

/*
export function someMutation (state) {
}
*/
export function updateTodo(state: State, todo: Todo) {
  const itemIndex = state.todos.findIndex((item: Todo) => item.id == todo.id);
  state.todos.splice(itemIndex, 1, todo);
}

export function addTodo(state: State, todo: Todo) {
  state.todos.push(todo);
}

export function deleteTodo(state: State, id: string) {
  const itemIdx = state.todos.findIndex((item: Todo) => item.id == id);
  state.todos.splice(itemIdx, 1);
}

export function loadTodos(state: State, todos: Todo[]) {
  state.todos.splice(0);
  state.todos.push(...todos);
}

export function setUserProfile(state: State, user: User) {
  state.user = user;
}
