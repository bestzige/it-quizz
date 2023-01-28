<template>
  <div class="card">
    <div class="card-img">
      <img
        :src="`${quizz.image ? quizz.image : '/assets/images/quizz.png'}`"
        :alt="`${quizz.title}`"
        class="img-fluid rounded-top w-100"
      />
    </div>
    <div class="card-body">
      <h5 class="card-title">{{ quizz.title }}</h5>
      <p class="fs-12 mb-0">{{ quizz.description }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    quizz: {
      type: Object,
      default: () => {},
    },
  },
}
</script>
