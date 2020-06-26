<template>
  <q-layout view="hhh lpR fFf" style="max-height: 90%; min-height: 80%;">
    <q-header elevated class="bg-primary text-negative">
      <q-toolbar>
        <q-toolbar-title>
          <img src="redhat_logo_white.png" class="logo"><span class="title">Todo App</span>
        </q-toolbar-title>

        <q-checkbox dark left-label label="Hide Completed" v-model="hideComplete" />&nbsp;&nbsp;
        <div v-if="isLoggedIn">
          <q-avatar color="positive" text-color="negative"  @click="toggleProfileMenu">{{ firstInitial }}</q-avatar>
          <q-menu fit anchor="bottom right" self="top right" v-bind="showProfileMenu">
            <q-item clickable @click="logOut">
              <q-item-section>Log Out</q-item-section>
            </q-item>
          </q-menu>
        </div>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view :todos="todos" :hide-complete="hideComplete" />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import { AxiosResponse, AxiosError, AxiosPromise } from 'axios';

export default {
  name: 'MainLayout',

  data () {
    return {
      isLoggedIn: true,
      fullName: 'Deven Phillips',
      showProfileMenu: false,
      hideComplete: true
    }
  },
  computed: {
    ...mapState(["todos", "user"]),
    firstInitial: function(): string {
      // @ts-ignore
      return this.$store.state.app.user.family_name.substr(0, 1);
    }
  },
  methods: {
    toggleProfileMenu: () => {
      // @ts-ignore
      this.$data.showProfileMenu = !this.$data.showProfileMenu;
    },
    logOut: () => {
      console.log('Do logout');
    }
  },
  mounted: function() {
    // @ts-ignore
    this.$q.loading.show();
    // @ts-ignore
    this.$api.user.getUserProfile()
      .then((res: AxiosResponse) => {
        // @ts-ignore
        this.$store.commit('app/setUserProfile', res.data);
        // @ts-ignore
        return this.$api.todos.gettodos();
      })
      .then((res: AxiosResponse) => {
        // @ts-ignore
        this.$store.commit('app/loadTodos', res.data);
        // @ts-ignore
        this.$q.loading.hide();
      })
      .catch((err: AxiosError) => {
        // @ts-ignore
        this.$q.loading.hide();
        // @ts-ignore
        this.$q.notify({
          type: 'warning',
          message: `Error loading data from server: ${err.message}`
        })
      });
  }
}
</script>

<style lang="sass" scoped>
.logo
  height: 1.8em
  margin-top: 0.3em
  margin-right: 0.5em
  margin-left: 0.5em
  float: left

.title
  font-family: Overpass, Arial, Helvetica, sans-serif
  font-weight: bold
  vertical-align: middle
  line-height: 2.5em
</style>
