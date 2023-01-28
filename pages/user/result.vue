<template>
  <div class="p-3 card card-body">
    <b-col v-if="loading" cols="12" class="text-center mt-5 mb-5">
      <LayoutLoading />
    </b-col>
    <div v-else>
      <table class="table my-5 text-center">
        <thead>
          <tr>
            <th scope="col" width="10%">#</th>
            <th scope="col" width="20%">ชื่อวิชา</th>
            <th scope="col" width="20%">ห้องสอบ</th>
            <th scope="col" width="10%">คะแนนที่ได้</th>
            <th scope="col" width="20%">ทำเสร็จ</th>
            <th scope="col" width="20%">ผู้เข้าสอบ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, index) in results" :key="index" v-if="result">
            <td>{{ results.length - index }}</td>
            <td>{{ result.subject.title }}</td>
            <td>{{ result.quizz.title }}</td>
            <td>
              <span class="badge badge-tnk"
                >{{ result.score }}/{{ result.allQuestion }} คะแนน</span
              >
            </td>
            <td>
              {{
                $moment.utc(result.submitted_at).format('DD/MM/YYYY HH:mm:ss')
              }}
            </td>
            <td>
              {{ result.allUser }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  middleware: ['auth'],
  mounted() {
    this.getResults().then(() => {
      setTimeout(() => {
        this.loading = false
      }, 200)
    })
  },
  data() {
    return {
      results: [],
      loading: true,
    }
  },
  methods: {
    async getResults() {
      this.$axios
        .get('/user/result')
        .then((response) => {
          this.results = response.data.results
        })
        .catch((error) => {
          console.log(error)
        })
    },
  },
}
</script>
