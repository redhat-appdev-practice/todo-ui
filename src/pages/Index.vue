<template>
  <q-page>
    <div class="row header-title">
      <div class="col-1"></div>
      <div class="col">Title</div>
      <div class="col-1">Due</div>
      <div class="col-1" style="text-align: center;">
        <q-icon name="check" />
      </div>
    </div>
    <q-scroll-area style="height: 81vh;">
      <div class="row todo-list" v-for="todo in todos" :key="todo.id">
        <div class="col-1 action-buttons">
          <q-btn size="sm" round icon="edit" @click="edit(todo)" />
          <q-btn size="sm" round icon="delete" @click="deleteTodo(todo.id)" />
        </div>
        <div class="col">
          <q-expansion-item
            dense
            v-if="todo.description"
            :label="todo.title"
            style="white-space: normal;"
          >
            <q-card style="background-color: inherit;">
              <q-card-section>{{ todo.description }}</q-card-section>
            </q-card>
          </q-expansion-item>
          <span v-else style="margin-left: 1.25em;">{{ todo.title }}</span>
        </div>
        <div class="col-1">
          <q-icon
            v-if="isOverdue(todo.dueDate)"
            name="notification_important"
            class="text-red"
            style="font-size: 1.5rem;"
          />
          {{ todo.dueDate | timeRemaining }}
        </div>
        <div class="col-1">
          <q-checkbox @input="toggleComplete(todo)" :value="todo.complete" />
        </div>
      </div>
    </q-scroll-area>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" to="/new" />
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { Todo } from '../apiClient/index';
import moment from 'moment';

export default Vue.extend({
  name: 'PageIndex',
  props: ['hideComplete'],
  data() {
    return {
      hideCompleted: false
    };
  },
  computed: {
    ...mapState(['app']), // Map the `app` store as a computed property
    todos: function() {
      // Use the mapped `app` store to create a computed `todos` property from the Vuex state
      return this.app.todos.filter(todo => {
        if (this.$props.hideComplete) {
          return !todo.complete;
        } else {
          return true;
        }
      });
    }
  },
  methods: {
    /**
     * Toggles the completion state of a Todo item
     */
    toggleComplete: async function(row: Todo) {
      this.$q.loading.show();
      let updated = { ...row };
      updated.complete = !row.complete;
      this.$api.todos
        .updateTodo(updated.id, updated)
        .then(res => {
          this.$store.commit('app/updateTodo', res.data);
          this.$q.loading.hide();
        })
        .catch(err => {
          this.$q.loading.hide();
          this.$q.notify({
            type: 'warning',
            message: `Error updating completion status: ${err.message}`
          });
        });
    },
    /**
     * Open the associated Todo item in an editor
     */
    edit: function(todo: Todo) {
      void this.$router.push({ name: 'edit', params: { todo, id: todo.id } });
    },
    /**
     * Confirm that the user intended to delete the item, and then delete it via an API call if desired.
     */
    deleteTodo: function(id: string) {
      console.log('Event is calling this method');
      this.$q
        .dialog({
          title: 'CONFIRM',
          message: 'Are you sure? This action cannot be reversed.',
          cancel: true,
          persistent: true
        })
        .onOk(() => {
          this.$q.loading.show();
          this.$api.todos
            .deleteTodo(id)
            .then(res => {
              this.$store.commit('app/deleteTodo', id);
              this.$q.loading.hide();
            })
            .catch(err => {
              this.$q.loading.hide();
              this.$q.notify({
                type: 'warning',
                message: `Error deleting todo: ${err.message}`
              });
            });
        })
        .onCancel(() => {
          this.$q.notify({
            type: 'info',
            message: 'Cancelled delete'
          });
        });
    },
    /**
     * Check the dueDate versus the current date to see if an item is overdue.
     */
    isOverdue: function(dueDate: string) {
      let parsedDueDate = moment.parseZone(dueDate);
      return parsedDueDate.isSameOrBefore(moment.now());
    }
  },
  filters: {
    /**
     * Converts the dueDate to a "relative" time remaining/overdue (e.g. 'in 3 days')
     */
    timeRemaining: function(value: string) {
      if (value === undefined || value === null || value == '') {
        return '';
      }
      return moment.parseZone(value).fromNow();
    }
  }
});
</script>

<style lang="sass" scoped>
.header-title
  font-weight: bold
  font-size: 1rem
  text-align: left
  height: 5vh
.todo-list
  width: 100%
  padding-top: 0.3rem
  padding-bottom: 0.3rem
  min-height: 4rem
.todo-list:nth-child(even)
  background: rgba(0,0,0,0.07)
</style>
