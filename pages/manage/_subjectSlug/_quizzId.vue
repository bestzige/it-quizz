<template>
  <div>
    <b-card class="p-4">
      <b-tabs content-class="mt-3" fill>
        <b-tab title="คำถาม">
          <b-row>
            <b-col cols="12" class="mb-4">
              <b-button
                variant="tnk-6"
                class="float-right text-white px-5"
                @click="addQuestion"
                >เพิ่มคำถาม
              </b-button>
            </b-col>
          </b-row>
          <!-- Render Question -->
          <b-row>
            <b-col v-if="loading" cols="12" class="text-center mt-5 mb-5">
              <LayoutLoading />
            </b-col>
            <b-col
              v-if="!loading"
              v-for="(question, idx) of questions"
              :key="idx"
              cols="12"
              md="6"
              lg="4"
              xl="4"
              class="mb-4"
            >
              <QuestionManageCard
                :question="question"
                v-on:update-question="getQuestions"
              />
            </b-col>
          </b-row>
          <!-- Render Question -->
        </b-tab>
        <b-tab title="สรุปผล" active @click="getResults">
          <QuizzResult
            v-on:clear-exam="getResults"
            :quizzId="quizzId"
            :results="results"
            :resultCount="resultCount"
          />
        </b-tab>
        <b-tab title="ตั้งค่า">
          <QuizzSetting :quizzId="quizzId" />
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
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

    this.getResults()

    this.getQuestions().then(() =>
      setTimeout(() => {
        this.loading = false
      }, 200)
    )
  },
  data() {
    return {
      quizzId: this.$route.params.quizzId,
      loading: true,
      questions: [],
      results: [],
      resultCount: 0,
    }
  },
  methods: {
    async getQuestions() {
      try {
        const { data } = await this.$axios.get(
          `/question?quizz=${this.quizzId}`
        )
        this.questions = data.data
      } catch (error) {
        throw error
      }
    },
    addQuestion() {
      this.$axios.post('/question', { quizz: this.quizzId }).then(() => {
        this.getQuestions()
      })
    },
    getResults() {
      this.$axios.get(`result/${this.quizzId}`).then(({ data }) => {
        this.results = data.data
        this.resultCount = this.results.length
      })
    },
  },
}
</script>
