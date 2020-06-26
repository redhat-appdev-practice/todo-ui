<template>
  <q-page class="row items-center justify-evenly">
    <div class="form">
      <q-input label="Title" v-model="editing.title" :rules="[val => !!val && val != '' || 'Title is required']"/>
      <q-input label="Desciption" v-model="editing.description" type="textarea" />
      <q-checkbox label="Complete?" v-model="editing.complete" />
      <q-input filled v-model="editing.dueDate" mask="date" :rules="['editing.dueDate']">
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
            <q-date today-btn mask="YYYY-MM-DD" v-model="editing.dueDate" title="Due Date" @input="$refs.qDateProxy.hide()" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <q-btn :label="actionButtonText" color="primary" text-color="negative" :disable="isDisabled" @click="updateOrAddTodo" />&nbsp;
    <q-btn label="Cancel" color="primary" text-color="negative" @click="$router.back()" />
    </div>
  </q-page>
</template>

<style lang="sass" scoped>
.form
  width: 95%
  margin: 0.2em
  text-align: top
  margin-bottom: auto
</style>

<script lang="ts">
import Vue from 'vue';
import { date } from 'quasar';
import { Todo } from '../apiClient/index';

export default Vue.extend({
  name: 'NewTodo',
  props: [
    'todo',
    'id'
  ],
  data() {
    return {
      editing: {...this.todo}
    };
  },
  methods: {
    addTodo: function(todo: Todo) {
      this.$q.loading.show();
      this.$api.todos.createTodo(todo)
        .then((res) => {
          this.$q.loading.hide();
          this.$store.commit('app/addTodo', res.data);
          this.$router.push({ name: 'home' });
        })
        .catch((err) => {
          this.$q.loading.hide();
          this.$q.notify({
            type: 'warning',
            message: `Error loading data from server: ${err.message}`
          })
        });
    },
    updateTodo: function(todo: Todo) {
      this.$q.loading.show();
      this.$api.todos.updateTodo(this.id, todo)
        .then((res) => {
          this.$q.loading.hide();
          this.$store.commit('app/updateTodo', res.data);
        })
        .catch((err) => {
          this.$q.loading.hide();
          this.$q.notify({
            type: 'warning',
            message: `Error loading data from server: ${err.message}`
          })
        });
    },
    updateOrAddTodo: function() {
      let todoItem = { ...this.$data.editing }
      todoItem.dueDate = this.isoDueDate;
      todoItem.author = this.$store.state.app.user.preferred_username;
      console.log(`Trying to store: ${JSON.stringify(todoItem)}`);
      if (this.$data.editing.id == undefined || this.$data.editing.id == null) {
        this.addTodo(todoItem);
      } else {
        this.updateTodo(todoItem);
      }
    }
  },
  mounted: function() {
    // Initialize the holder object if it is not already populated
    if (this.isNewTodo) {
      this.$data.editing = { title: '', description: 'null', complete: false, dueDate: null };
    } else if (this.isEdit) {
      // If the user hits the reload button in the browser, we want to restore the state
      this.$data.editing = this.$store.state.app.todos.find((item: Todo) => item.id == this.$props.id);
    }
  },
  computed: {
    isoDueDate() {
      return date.formatDate(this.$data.editing.dueDate);
    },
    isNewTodo() {
      return (this.$props.id === undefined || this.$props.id == null);
    },
    isEdit() {
      return (this.$props.id !== undefined && this.$props.id !== null && this.$props.id != '');
    },
    isDisabled() {
      if (this.isEdit) {
        const original: string = JSON.stringify(this.$props.todo);
        const current: string = JSON.stringify(this.$data.editing);
        return (original == current);
      } else if (this.isNewTodo) {
        return (this.$data.editing.title === undefined || this.$data.editing.title === null && this.$data.editing.title.length == 0);
      }
      return false;
    },
    actionButtonText() {
      return this.isEdit ? "Save" : "Add";
    }
  }
});
</script>
