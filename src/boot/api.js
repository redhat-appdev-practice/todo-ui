import Vue from 'vue';
import { TodosApi, UserApi } from '../apiClient/index';

// @ts-ignore
Vue.prototype.$api = { todos: new TodosApi(), user: new UserApi() };
