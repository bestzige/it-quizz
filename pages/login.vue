<template>
  <div class="container">
    <div class="loader"></div>
    <p>โปรดรอสักครู่ในขณะที่เรากําลังเข้าสู่ระบบให้คุณ.</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      token: this.$route.query.token ? this.$route.query.token : null,
      error: this.$route.query.error ? this.$route.query.error : null,
    }
  },
  mounted() {
    if (this.$auth.loggedIn) {
      return this.$router.push('/')
    }

    if (this.error !== null && this.token == null) {
      return this.fail(this.error)
    }

    this.$auth.setStrategy('local')
    this.$auth.setUserToken(this.token, this.token).then(() => {
      this.$auth
        .fetchUser()
        .then(({ data }) => {
          return this.success(data)
        })
        .catch(() => {
          return this.fail(this.error)
        })
    })
  },
  methods: {
    success(data) {
      this.$router.push('/')
      setTimeout(() => {
        this.$swal(
          'เข้าสู่ระบบสำเร็จ',
          `ยินดีต้อนรับคุณ ${data.user.nickname}`,
          'success'
        ).then(() => {
          this.$router.go()
        })
      }, 200)
    },
    fail(error) {
      this.$router.push('/')
      this.$auth.logout()
      setTimeout(() => {
        this.$swal('เข้าสู่ระบบล้มเหลว', error, 'error')
      }, 200)
    },
  },
}
</script>
