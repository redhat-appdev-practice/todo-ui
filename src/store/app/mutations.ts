import { User, Todo } from 'src/apiClient';
import { start } from 'repl';

/*
export function someMutation (state) {
}
*/
export function updateTodo(state: any, todo: Todo) {
  let itemIndex = state.todos.findIndex((item: Todo) => item.id == todo.id);
  state.todos.splice(itemIndex, 1, todo);
}

export function addTodo(state: any, todo: Todo) {
  state.todos.push(todo);
}

export function deleteTodo(state: any, id: string) {
  let itemIdx = state.todos.findIndex((item) => item.id == id);
  state.todos.splice(itemIdx, 1);
}

export function loadTodos(state: any, todos: Todo[]) {
  state.todos.splice(0);
  state.todos.push(...todos);
}

export function setUserProfile(state: any, user: User) {
  state.user = user;
}
