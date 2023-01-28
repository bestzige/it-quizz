<template>
  <PageQuizz type="user" :slug="subjectSlug" />
</template>

<script>
export default {
  data() {
    return {
      subjectSlug: this.$route.params.subjectSlug,
    }
  },
}
</script>
