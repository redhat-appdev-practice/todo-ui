import { UserApi, TodosApi, Todo, User } from './apiClient';

export interface ApiWrapper {
  user: UserApi

  todos: TodosApi
}

export interface State {
  todos: Todo[]

  user: User
}
