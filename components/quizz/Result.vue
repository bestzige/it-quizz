<template>
  <div class="p-3">
    <b-modal
      id="modal-detail"
      title=""
      size="lg"
      header-class="d-none"
      footer-class="d-none"
      header
      scrollable
    >
      <div class="card-body px-5 py-4 w-1000">
        <b-row class="mt-3">
          <b-col cols="12">
            <h4>
              ชื่อห้องสอบ: <b>{{ resultModal.quizz.title }}</b>
            </h4>
          </b-col>
          <b-col cols="12" xl="6" class="text-left mt-1">
            <span
              >ชื่อ: <b>{{ resultModal.user.nickname }}</b>
            </span>
          </b-col>
          <b-col cols="12" xl="6" class="text-right mt-1">
            <span
              >เลขประจำตัวผู้สอบ: <b>{{ resultModal.user.username }}</b>
            </span>
          </b-col>
        </b-row>
        <hr />
        <b-row
          v-for="(answer, index) in resultModal.answers"
          :key="index"
          v-if="resultModal && resultModal.answers"
        >
          <b-col cols="12" xl="10" class="mt-3">
            <p>{{ index + 1 }}. {{ answer.question }}</p>
          </b-col>
          <b-col v-if="!answer.correct" cols="12" xl="2" class="text-right">
            <b-button variant="wrong" class="mt-2 px-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-x"
                viewBox="0 0 16 16"
              >
                <path
                  d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </b-button>
          </b-col>
          <b-col v-else cols="12" xl="2" class="text-right">
            <b-button variant="correct" class="mt-2 px-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-check2"
                viewBox="0 0 16 16"
              >
                <path
                  d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"
                />
              </svg>
            </b-button>
          </b-col>
        </b-row>
      </div>
    </b-modal>

    <b-row class="mb-5">
      <b-col cols="12" xl="7">
        <h4>จำนวนผู้เข้าสอบ : {{ resultCount }} คน</h4>
      </b-col>
      <b-col cols="12" xl="5" class="text-right">
        <b-row>
          <b-col cols="12">
            <b-button
              variant="tnk-3"
              class="px-5 w-100 mt-3 mt-xl-0"
              @click="exportAndClear"
              >นำออกเป็น EXCEL และ เคลียผู้สอบ</b-button
            >
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <table class="table my-5 text-center">
      <thead>
        <tr>
          <th scope="col" width="10%">#</th>
          <th scope="col" width="20%">เลขประจำตัวผู้สอบ</th>
          <th scope="col" width="20%">ชื่อ</th>
          <th scope="col" width="10%">คะแนนที่ได้</th>
          <th scope="col" width="20%">ทำเสร็จ</th>
          <th scope="col" class="text-center" width="20%">รายละเอียด</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(result, index) in results" :key="index" v-if="result">
          <td>{{ index + 1 }}</td>
          <td>{{ result.user.username }}</td>
          <td>{{ result.user.nickname }}</td>
          <td>
            <span class="badge badge-tnk"
              >{{ result.score }}/{{ result.allQuestion }} คะแนน</span
            >
          </td>
          {{
            $moment.utc(result.submitted_at).format('DD/MM/YYYY HH:mm:ss')
          }}
          <td class="text-center">
            <b-button
              variant="tnk-6"
              class="w-100"
              @click="modalDetail(result)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-info-circle-fill"
                viewBox="0 0 16 16"
              >
                <path
                  d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
                />
              </svg>
              &nbsp;ดูรายละเอียด
            </b-button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: ['quizzId', 'results', 'resultCount'],
  data() {
    return {
      resultModal: {
        user: {},
        answers: {},
        quizz: {},
        score: 0,
      },
    }
  },
  methods: {
    modalDetail(result) {
      this.resultModal = result
      this.$bvModal.show('modal-detail')
    },
    async exportAndClear() {
      const { value: formValues } = await this.$swal({
        title: 'นำออกเป็น EXCEL และเคลียผู้สอบ',
        html:
          '<label for="swal-input1 text-left">ชื่อกลุ่ม</label>' +
          '<input id="swal-input1" class="swal2-input">' +
          '<label for="swal-input2">โน๊ตกลุ่ม</label>' +
          '<input id="swal-input2" class="swal2-input">',
        focusConfirm: false,
        preConfirm: () => {
          return [
            document.getElementById('swal-input1').value,
            document.getElementById('swal-input2').value,
          ]
        },
      })

      if (formValues) {
        this.$swal
          .fire({
            title: 'คุณต้องการนำออกเป็น EXCEL และเคลียผู้สอบใช่หรือไม่?',
            text: 'คุณจะไม่สามารถกู้คืนได้หากคุณกดตกลง',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ตกลง',
            cancelButtonText: 'ยกเลิก',
          })
          .then(async (result) => {
            if (result.value) {
              this.$axios
                .post(`/clear/result/${this.quizzId}`, {
                  title: formValues[0],
                  description: formValues[1],
                })
                .then(({ data }) => {
                  this.$swal.fire({
                    title: 'สำเร็จ!',
                    text: 'นำออกเป็น EXCEL และเคลียผู้สอบเรียบร้อยแล้ว',
                    type: 'success',
                    confirmButtonText: 'ตกลง',
                  })

                  // get token by localStorage
                  const token =
                    localStorage.getItem('auth._token.local').split(' ')[1] ||
                    ''

                  const url =
                    this.$config.API_URL +
                    `export/result/${this.quizzId}/${data.group}/${token}`

                  const link = document.createElement('a')
                  link.setAttribute(
                    'download',
                    `${this.quizzId}-${new Date().getTime()}.xlsx`
                  )
                  link.setAttribute('href', url)
                  link.style.visibility = 'hidden'
                  document.body.appendChild(link)
                  link.click()

                  this.$emit('clear-exam')
                })
                .catch((error) => {
                  console.log(error)
                  this.$swal({
                    title: 'ผิดพลาด!',
                    text: 'เกิดข้อผิดพลาดในการนำออกเป็น EXCEL และเคลียผู้สอบ',
                    type: 'error',
                    confirmButtonText: 'ตกลง',
                  })
                })
            }
          })
      }
    },
  },
}
</script>
