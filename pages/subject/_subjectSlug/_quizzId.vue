<template>
  <div>
    <b-col v-if="loading" cols="12" class="text-center mt-5 mb-5">
      <LayoutLoading />
    </b-col>
    <div v-if="!loading">
      <QuizzInfo :quizzId="quizzId" class="mx-auto" />
      <Question
        v-if="currentQuestion"
        :question="currentQuestion"
        :qId="questionNumber"
      />

      <b-col cols="12" xl="7" class="mx-auto d-block mt-5 w-100">
        <nav>
          <ul class="pagination justify-content-center">
            <li class="page-item mx-4">
              <button class="page-link btn-tnk-3" @click="previousQuestion">
                ย้อนกลับ
              </button>
            </li>

            <button class="page-link">
              {{ questionNumber }} / {{ questions.length }}
            </button>

            <li class="page-item mx-4">
              <button
                :class="`page-link ${
                  questionNumber >= questions.length
                    ? 'btn-tnk-danger'
                    : 'btn-tnk-3'
                }`"
                @click="nextQuestion"
              >
                {{ questionNumber >= questions.length ? 'ส่งคำตอบ' : 'ถัดไป' }}
              </button>
            </li>
          </ul>
        </nav>
      </b-col>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    this.$axios
      .get(`/quizz/${this.quizzId}/state`)
      .then(({ data }) => {
        this.getQuestions()
          .then(() => {
            setTimeout(() => {
              this.loading = false
            }, 200)
            const currentQuestionId = localStorage.getItem('#' + this.quizzId)
            if (currentQuestionId === 'none') {
              localStorage.setItem('#' + this.quizzId, this.questions[0]._id)
            }
            const find = this.questions.find(
              (question) => question._id === currentQuestionId
            )

            if (!find) {
              this.currentQuestion = this.questions[0]
            } else {
              this.currentQuestion = find
              this.questionNumber =
                this.questions.findIndex(
                  (question) => question._id === currentQuestionId
                ) + 1
            }
          })
          .catch((error) => {
            this.$swal(
              'เกิดข้อผิดพลาด',
              error.response.data.message,
              'error'
            ).then(() => {
              this.$router.push('/subject/' + this.$route.params.subjectSlug)
            })
          })
      })
      .catch((error) => {
        this.$swal('เกิดข้อผิดพลาด', error.response.data.message, 'error').then(
          () => {
            this.$router.push('/subject/' + this.$route.params.subjectSlug)
          }
        )
      })
  },
  data() {
    return {
      quizzId: this.$route.params.quizzId,
      questionNumber: 1,
      currentQuestion: {},
      questions: [],
      loading: true,
    }
  },
  methods: {
    async getQuestions() {
      try {
        const { data } = await this.$axios.get(`/u-question/${this.quizzId}`)
        this.questions = data.data
      } catch (error) {
        throw error
      }
    },
    nextQuestion() {
      if (this.questionNumber >= this.questions.length) {
        return this.$swal({
          title: 'คุณต้องการส่งคำตอบใช่หรือไม่',
          text: `กรุณาตรวจสอบคำตอบก่อนกดยืนยัน`,
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'ฉันต้องการส่งคำตอบ',
          cancelButtonText: 'ฉันยังต้องการแก้ไข',
        })
          .then(async (result) => {
            if (result.value) {
              this.submitAnswer()
            }
          })
          .catch((error) => {
            this.$swal('เกิดข้อผิดพลาด', error.response.data.message, 'error')
          })
      }

      const index = this.questions.indexOf(this.currentQuestion)
      this.currentQuestion = this.questions[index + 1]
      this.questionNumber++
      this.setCurrentQuestion(this.currentQuestion._id)
    },
    previousQuestion() {
      if (this.questionNumber <= 1) {
        return
      }

      const index = this.questions.indexOf(this.currentQuestion)
      this.currentQuestion = this.questions[index - 1]
      this.questionNumber--
      this.setCurrentQuestion(this.currentQuestion._id)
    },
    setCurrentQuestion(questionId) {
      localStorage.setItem('#' + this.quizzId, questionId)
    },
    submitAnswer() {
      const xd = localStorage.getItem('@' + this.quizzId) || '[]'

      const answers = JSON.parse(xd)
        .filter((answer) => answer.questionId)
        .filter((answer) =>
          this.questions.find((question) => question._id === answer.questionId)
        )

      console.log(answers)

      if (answers.length != this.questions.length) {
        const questionNotAnswer = this.questions.filter(
          (question) =>
            !answers.find((answer) => answer.questionId === question._id)
        )
        const toString = questionNotAnswer
          .map((question) => {
            return this.questions.findIndex((q) => q._id === question._id) + 1
          })
          .join(', ')

        return this.$swal({
          title: 'กรุณาตอบคำถามทุกข้อให้ครบทุกข้อ',
          html:
            'คุณตอบคำถามไปแล้วทั้งหมด ' +
            answers.length +
            '/' +
            this.questions.length +
            ' ข้อ <br> ข้อที่ยังไม่ได้ทำ (' +
            toString +
            ')',
          type: 'error',
          confirmButtonText: 'กลับไปตอบคำถาม',
        })
      }

      this.$axios
        .post(`/quizz/${this.quizzId}/submit`, {
          answers: answers,
        })
        .then(({ data }) => {
          this.$swal({
            title: 'ส่งคำตอบเรียบร้อยแล้ว',
            type: 'success',
            confirmButtonText: 'ตกลง',
          }).then(() => {
            localStorage.removeItem('@' + this.quizzId)
            localStorage.removeItem('#' + this.quizzId)

            this.$router.push('/user/result/')
          })
        })
        .catch((error) => {
          this.$swal('เกิดข้อผิดพลาด', error.response.data.message, 'error')
          this.$router.push('/subject/' + this.$route.params.subjectSlug)
        })
    },
  },
}
</script>
