<template>
  <PageQuizz type="admin" :slug="subjectSlug" />
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
  data() {
    return {
      subjectSlug: this.$route.params.subjectSlug,
    }
  },
  mounted() {
    if (!this.$auth.user.isAdmin) {
      return redirect('/')
    }
  },
}
</script>
