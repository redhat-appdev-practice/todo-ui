<template>
  <q-page>
    <q-table
      :data="todos"
      :columns="columns"
      :pagination.sync="pagination"
      virtual-scroll
      row-key="id"
      style="height: 98%;"
      :rows-per-page-options="[0]"
      class="sticky-header-table">
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            class="header-title"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr>
          <q-td key="id" auto-width>
            <q-btn size="sm" round icon="edit" @click="edit(props.row)" />
            <q-btn size="sm" round icon="delete" @click="deleteTodo(props.row.id)" />
          </q-td>
          <q-td key="title" style="text-align: left;">
            <q-expansion-item dense v-if="props.row.description" :label="props.row.title" style="white-space: normal;">
              <q-card>
                <q-card-section>
                  {{ props.row.description }}
                </q-card-section>
              </q-card>
            </q-expansion-item>
            <span v-else style="margin-left: 1.25em;">{{ props.row.title }}</span>
          </q-td>
          <q-td key="dueDate" auto-width>
            <q-icon v-if="isOverdue(props.row.dueDate)" name="notification_important" class="text-red" style="font-size: 1.5rem;" /> {{ props.row.dueDate | timeRemaining }}
          </q-td>
          <q-td key="complete" auto-width>
            <q-checkbox @input="toggleComplete(props.row)" :value="props.row.complete" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
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
  props: [
    'hideComplete'
  ],
  data() {
    return {
      columns: [
        { name: 'edit', required: false, label: '', field: '', sortable: false, style: 'width: 0.5rem;' },
        { name: 'title', required: true, label: 'Title', field: (row: Todo) => row.title, format: (val: string) => `${val}`, sortable: true, style: 'width: 100%;' },
        { name: 'dueDate', required: true, label: 'Due', field: (row: Todo) => row.dueDate, format: (val: string) => `${val}`, sortable: true, style: 'width: 0.5rem;' },
        { name: 'complete', required: true, label: 'Completed', field: (row: Todo) => row.complete, format: (val: boolean) => JSON.stringify(val), sortable: true, style: 'width: 0.5rem;' },
      ],
      pagination: {
        rowsPerPage: 0
      },
      hideCompleted: false
    };
  },
  computed: {
    ...mapState(["app"]), // Map the `app` store as a computed property
    todos: function() {   // Use the mapped `app` store to create a computed `todos` property from the Vuex state
      return this.app.todos.filter((todo) => {
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
      this.$api.todos.updateTodo(updated.id, updated)
        .then((res) => {
          this.$store.commit('app/updateTodo', res.data)
          this.$q.loading.hide();
        })
        .catch((err) => {
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
      console.log("Event is calling this method");
      this.$q.dialog({
        title: 'CONFIRM',
        message: 'Are you sure? This action cannot be reversed.',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.$q.loading.show();
        this.$api.todos.deleteTodo(id)
          .then((res) => {
            this.$store.commit('app/deleteTodo', id);
            this.$q.loading.hide();
          })
          .catch((err) => {
            this.$q.loading.hide();
            this.$q.notify({
              type: 'warning',
              message: `Error deleting todo: ${err.message}`
            });
          });
      }).onCancel(() => {
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
      return moment.parseZone(value).fromNow();
    }
  }
});
</script>

<style lang="sass" scoped>
.sticky-header-table
  /* height or max-height is important */
  height: 2rem

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: $info

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 5rem
.header-title
  font-weight: bold
  font-size: 0.8rem
  text-align: left
.todo-list
  width: 100%
  margin-top: 1.0rem
  margin-bottom: auto
.todo-item
  width: 100%
  min-height: 1.3rem
</style>
