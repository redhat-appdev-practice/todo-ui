<template>
  <q-layout view="hhh lpR fFf" style="max-height: 90%; min-height: 80%;">
    <q-header elevated class="bg-primary text-negative fixed-height">
      <q-toolbar>
        <q-toolbar-title>
          <img src="redhat_logo_red.svg" class="logo"><span class="title">Todo App</span>
        </q-toolbar-title>

        <q-checkbox dark left-label label="Hide Completed" v-model="hideComplete" />&nbsp;&nbsp;
        <div v-if="isLoggedIn">
          <q-avatar color="secondary" text-color="dark"  @click="toggleProfileMenu">{{ firstInitial }}</q-avatar>
          <q-menu fit anchor="bottom right" self="top right" :value="showProfileMenu">
            <q-item class="name">
              {{ fullName }}
            </q-item>
            <q-item clickable @click="logOut">
              <q-item-section>Log Out</q-item-section>
            </q-item>
          </q-menu>
        </div>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view :hide-complete="hideComplete" />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { AxiosResponse, AxiosError, AxiosPromise } from 'axios';
import { ApiWrapper } from '../WrapperTypes';

export default {
  name: 'MainLayout',

  data () {
    return {
      isLoggedIn: true,
      showProfileMenu: false,
      hideComplete: true,
    }
  },
  computed: {
    fullName: function() {
      let temp: string = this.$store.state?.app?.user?.name;
      if (temp === undefined || temp === null || temp == '') {
        return '';
      }
      return temp;
    },
    firstInitial: function() {
      let temp: string = this.$store.state?.app?.user?.family_name;
      if (temp === undefined || temp === null || temp == '') {
        return '?';
      }
      return temp.substr(0,1);
    }
  },
  methods: {
    toggleProfileMenu: function() {
      // @ts-ignore
      this.$data.showProfileMenu = !this.$data.showProfileMenu;
    },
    logOut: () => {
      window.location.assign('http://keycloak:8080/')
    }
  },
  mounted: function() {
    // @ts-ignore
    this.$q.loading.show();
    // @ts-ignore
    (this.$api as ApiWrapper).user.getUserProfile()
      .then((res: AxiosResponse) => {
        // @ts-ignore
        this.$store.commit('app/setUserProfile', res.data);
        this.$data.firstInitial = res.data.family_name.substr(0,1);
        // @ts-ignore
        return (this.$api as ApiWrapper).todos.gettodos() as AxiosPromise;
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
.q-checkbox__label
  word-wrap: normal
.name
  color: black
  font-weight: 600
  background-color: $negative
  font-family: 'Red Hat Display', sans-serif
.logo
  margin-top: 1vh
  margin-right: 0.5rem
  margin-left: 0rem
  float: left
  height: 8vh
.q-checkbox
  font-size: 0.75rem
.title
  font-family: 'Red Hat Display', sans-serif
  font-weight: bold
  line-height: 10vh
.fixed-height
  height: 10vh;
</style>
