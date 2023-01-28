<template>
  <div>
    <b-row>
      <b-col cols="12" xl="5" class="mx-auto d-block text-center">
        <div class="card">
          <div class="card-header">ข้อมูลการสอบ</div>
          <div class="card-body">
            <h5 class="card-title" v-if="loading">
              <span>Loading...</span>
            </h5>
            <h5 class="card-title" v-if="!loading">
              <span v-if="days > 0">{{ days }} วัน</span>
              <span v-if="hours > 0 || days > 0">{{ hours }} ชั่วโมง</span>
              <span v-if="minutes > 0 || hours > 0">{{ minutes }} นาที</span>
              <span v-if="seconds > 0 || minutes > 0"
                >{{ seconds }} วินาที</span
              >
              <span v-if="timeup"
                ><span class="text-danger">หมดเวลา!</span>
                ข้อสอบจะถูกส่งอัตโนมัติภายใน {{ sentTime }} วินาที</span
              >
            </h5>
            <p class="card-text">ข้อสอบทั้งหมด {{ totalQuestions }} ข้อ</p>
            <p class="card-text">เวลาสอบ {{ durationFormat }}</p>
            <p class="card-text">{{ startFormat }} - {{ endFormat }}</p>
          </div>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  props: ['quizzId'],
  mounted() {
    this._getQuizz().then(() => {
      this._countdown().then(() => {
        this.interval = setInterval(this._countdown, 1000)
        setTimeout(() => {
          this.loading = false
        }, 1000)
      })
    })
  },
  data() {
    return {
      loading: true,
      start: new Date(),
      end: new Date() + 0.5,
      startFormat: '00/00/0000 00:00:00',
      endFormat: '00/00/0000 00:00:00',
      totalQuestions: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      durationFormat: 'ไม่ระบุ',
      timeup: false,
      sentTime: 10,
      interval: null,
    }
  },
  computed: {
    _seconds: () => 1000,
    _minutes: () => 1000 * 60,
    _hours: () => 1000 * 60 * 60,
    _days: () => 1000 * 60 * 60 * 24,
  },
  methods: {
    async _getQuizz() {
      this.$axios
        .get(`/quizz/slug_${this.quizzId}`)
        .then(({ data }) => {
          this.start = data.data.start_at
          this.end = data.data.end_at
          this.totalQuestions = data.data.total_questions
          const startDate = new Date(this.start)
          const endDate = new Date(this.end)
          this.startFormat = startDate.toLocaleString('th-TH', {
            timeZone: 'UTC',
          })
          this.endFormat = endDate.toLocaleString('th-TH', {
            timeZone: 'UTC',
          })
          const { diffInSeconds, diffInMinutes, diffInHours, diffInDays } =
            this.formatDateDiff(startDate, endDate)

          if (diffInDays > 0) {
            this.durationFormat = `${diffInDays} วัน ${
              diffInHours - diffInDays * 24
            } ชั่วโมง ${diffInMinutes - diffInHours * 60} นาที`
          } else if (diffInHours > 0) {
            this.durationFormat = `${diffInHours} ชั่วโมง ${
              diffInMinutes - diffInHours * 60
            } นาที`
          } else if (diffInMinutes > 0) {
            this.durationFormat = `${diffInMinutes} นาที ${
              diffInSeconds - diffInMinutes * 60
            } วินาที`
          } else if (diffInSeconds > 0) {
            this.durationFormat = `${diffInSeconds} วินาที`
          }
        })
        .catch((error) => {
          this.$router.push('/subject/' + this.$route.params.subjectSlug)
        })
    },
    async _countdown() {
      const now = new Date()
      const distance = new Date(this.end) - now

      if (distance < 0) {
        console.log(distance)
        this._sentCountdown()
        return
      }

      this.days = Math.floor(distance / this._days)
      this.hours = Math.floor((distance % this._days) / this._hours)
      this.minutes = Math.floor((distance % this._hours) / this._minutes)
      this.seconds = Math.floor((distance % this._minutes) / this._seconds)
    },
    _sentCountdown() {
      clearInterval(this.interval)
      this.timeup = true
      this.interval = setInterval(() => {
        if (this.sentTime <= 0) {
          this._submit()
          return
        }
        this.sentTime--
      }, 1000)
    },
    _submit() {
      clearInterval(this.interval)
      this.timeup = false
      const answers = localStorage.getItem('@' + this.quizzId) || '[{}]'

      this.$axios
        .post(`/quizz/${this.quizzId}/submit`, {
          answers: JSON.parse(answers),
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
    formatDateDiff(start, end) {
      const diff = Math.abs(start - end)
      const diffInSeconds = Math.floor(diff / 1000)
      const diffInMinutes = Math.floor(diff / (1000 * 60))
      const diffInHours = Math.floor(diff / (1000 * 60 * 60))
      const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24))

      return {
        diffInSeconds,
        diffInMinutes,
        diffInHours,
        diffInDays,
      }
    },
  },
}
</script>
