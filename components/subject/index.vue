<template>
  <div class="card">
    <div class="card-img">
      <img
        :src="`${subject.image ? subject.image : '/assets/images/subject.png'}`"
        :alt="`${subject.title}`"
        class="img-fluid rounded-top w-100"
      />
    </div>
    <div class="card-body">
      <h5 class="card-title">{{ subject.title }}</h5>
      <p class="fs-12 mb-0">{{ subject.description }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    subject: {
      type: Object,
      default: () => {},
    },
  },
}
</script>
