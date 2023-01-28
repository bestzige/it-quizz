<template>
  <div></div>
</template>

<script>
export default {
  mounted() {
    const currentQuizz =
      this.$auth && this.$auth.user && this.$auth.user.currentQuizz
        ? this.$auth.user.currentQuizz
        : 'none'
    if (currentQuizz !== 'none') {
      return this.$router.push('/subject/' + currentQuizz)
    }

    return this.$router.push('/subject')
  },
}
</script>
