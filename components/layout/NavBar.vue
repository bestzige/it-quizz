<template>
  <b-navbar toggleable="lg" type="dark" variant="transparent" fixed="top">
    <b-container>
      <b-navbar-brand href="#">
        <h2 class="inline-block text-white">
          IT <b class="text-tnk-2"> QUIZZ</b>
        </h2>
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="mx-auto">
          <b-nav-item as="NuxtLink" to="/subject" class="mx-4"
            >รายวิชา</b-nav-item
          >
          <b-nav-item as="NuxtLink" to="/user/result" class="mx-4"
            >ผลสอบ</b-nav-item
          >
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item
            v-if="!$auth.loggedIn"
            @click="login"
            class="ml-4 btn-dark-1"
          >
            เข้าสู่ระบบ
          </b-nav-item>
          <b-img
            v-if="$auth.loggedIn"
            :src="`${
              $auth.user.avatar
                ? $auth.user.avatar
                : '/assets/images/avatar.webp'
            }`"
            class="img-user"
            rounded="circle"
            width="55px"
            height="55px"
          ></b-img>
          <b-nav-item-dropdown
            v-if="$auth.loggedIn"
            :text="`${
              $auth.user.nickname ? $auth.user.nickname : 'ยินดีต้อนรับ'
            }`"
            right
          >
            <p class="font-weight-bold text-center mt-0 mb-0">
              {{ $auth.user.username ? $auth.user.username : 'ผู้เยี่ยมชม' }}
            </p>
            <div v-if="$auth.user.isAdmin">
              <div class="dropdown-divider"></div>
              <NuxtLink to="/manage" class="dropdown-item"
                >จัดการห้องเรียน</NuxtLink
              >
            </div>
            <div v-if="$auth.user.isAdmin">
              <div class="dropdown-divider"></div>
              <NuxtLink to="/user" class="dropdown-item">จัดการแอดมิน</NuxtLink>
            </div>
            <div class="dropdown-divider"></div>
            <b-button class="dropdown-item text-center" @click="logout"
              >ออกจากระบบ</b-button
            >
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-container>
  </b-navbar>
</template>

<script>
export default {
  methods: {
    login() {
      window.location.href = this.$config.API_URL + 'auth/'
    },
    logout() {
      this.$auth.logout()
      this.$swal('ออกจากระบบสำเร็จ', '', 'success').then(() => {
        this.$router.go()
      })
    },
  },
}
</script>
