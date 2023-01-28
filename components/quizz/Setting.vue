<template>
  <div class="mt-4">
    <b-row>
      <b-col cols="6">
        <label for="startDate"
          >- เปิดสอบวันที่ - (ปัจจุบัน: {{ startDateShow }})</label
        >
        <b-input-group class="mb-3">
          <b-form-input
            v-model="startDate"
            type="datetime-local"
            autocomplete="off"
          ></b-form-input>
        </b-input-group>
      </b-col>
      <b-col cols="6">
        <label for="endDate"
          >- ปิดสอบวันที่ - (ปัจจุบัน: {{ endDateShow }})</label
        >
        <b-input-group class="mb-3">
          <b-form-input
            v-model="endDate"
            type="datetime-local"
            autocomplete="off"
          ></b-form-input>
        </b-input-group>
      </b-col>
    </b-row>

    <b-row class="mt-2">
      <b-col cols="8" class="text-center">
        <b-form-checkbox switch size="lg" v-model="quizz.is_active"
          >เปิด-ปิด การสอบ (ถ้าเปิดเวลาหมดแล้วยังสามารถส่งข้อสอบได้ แต่จะ
          lated)</b-form-checkbox
        >
      </b-col>
      <b-col cols="4">
        <b-button class="btn btn-tnk-3 w-100" @click="saveData">
          บันทึกข้อมูล
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  props: ['quizzId'],
  mounted() {
    this.getData()
  },
  data() {
    return {
      startDate: '',
      endDate: '',
      startDateShow: '',
      endDateShow: '',
      quizz: {},
    }
  },
  methods: {
    getData() {
      this.$axios.get(`/quizz/slug_${this.quizzId}`).then(({ data }) => {
        this.quizz = data.data
        this.startDate = data.data.start_at
        this.endDate = data.data.end_at
        this.startDateShow = this.$moment(this.quizz.start_at).format(
          'วันที่ MM/DD/YYYY เวลา HH:mm'
        )
        this.endDateShow = this.$moment(this.quizz.end_at).format(
          'วันที่ MM/DD/YYYY เวลา HH:mm'
        )
      })
    },
    saveData() {
      this.$axios
        .patch(`/quizz/${this.quizz._id}`, {
          subject: this.quizz.subject,
          title: this.quizz.title,
          slug: this.quizz.slug,
          is_active: this.quizz.is_active,
          start_at: this.startDate,
          end_at: this.endDate,
        })
        .then(({ data }) => {
          this.$swal({
            title: 'บันทึกข้อมูลสำเร็จ',
            type: 'success',
            timer: 2000,
            showConfirmButton: false,
          })
          this.getData()
        })
    },
  },
}
</script>
