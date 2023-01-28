<template>
  <PageSubject type="admin" />
</template>

<script>
export default {
  middleware: [
    'auth',
    ({ $auth, redirect }) => {
      if (!$auth.user.isAdmin) {
        return redirect('/')
      }
    },
  ],
  mounted() {
    if (!this.$auth.user.isAdmin) {
      return redirect('/')
    }
  },
}
</script>
