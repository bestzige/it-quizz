<template>
  <div>
    <b-row>
      <b-col
        cols="12"
        xl="8"
        class="mx-auto d-block text-white text-center pt-0 pb-2"
      >
        <img
          v-if="question.image"
          :src="`${question.image}`"
          :alt="`${question.title}`"
          class="img-fluid"
        />
        <h3>{{ question.title }}</h3>
        <p>{{ question.description }}</p>
      </b-col>
    </b-row>

    <b-row class="mx-auto">
      <b-col
        v-for="(choice, idx) of question.choices"
        :key="idx"
        cols="12"
        md="6"
        xl="3"
        class="mb-4"
      >
        <label class="radio-card">
          <input
            type="radio"
            v-bind:value="choice._id"
            v-model="selectedChoice"
            @change="submitAnswer"
            :checked="`${choice._id}` === `${selectedChoice}`"
          />
          <div class="card-content-wrapper">
            <span class="check-icon"></span>
            <div class="card-content">
              <img
                :src="`${
                  choice.image ? choice.image : '/assets/images/choice.png'
                }`"
                :alt="`${choice.title}`"
                class="img-fluid"
              />
              <h4>{{ choice.title }}</h4>
              <h5 v-if="choice.description !== null">
                {{ choice.description }}
              </h5>
            </div>
          </div>
        </label>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  props: {
    question: {
      type: Object,
      default: () => {},
    },
    selectChoice: {
      type: String,
      default: '',
    },
  },
  updated() {
    this.loadAnswer()
  },
  mounted() {
    this.loadAnswer()
  },
  data() {
    return {
      quizzId: this.$route.params.quizzId,
      selectedChoice: '',
    }
  },
  methods: {
    async submitAnswer() {
      const answer = {
        quizzId: this.quizzId,
        questionId: this.question._id,
        choiceId: this.selectedChoice,
      }
      const answers = JSON.parse(localStorage.getItem('@' + this.quizzId)) || []
      const index = answers.findIndex(
        (answer) => answer.questionId === this.question._id
      )
      if (index !== -1) {
        answers[index] = answer
      } else {
        answers.push(answer)
      }
      localStorage.setItem('@' + this.quizzId, JSON.stringify(answers))
    },
    loadAnswer() {
      const answers = JSON.parse(localStorage.getItem('@' + this.quizzId)) || []
      const answer = answers.find(
        (answer) => answer.questionId === this.question._id
      )
      if (answer) {
        this.selectedChoice = answer.choiceId
      }
    },
  },
}
</script>
