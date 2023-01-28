<template>
  <div class="box p-4 bg-white">
    <b-modal
      :id="`modal-uploadImageQuestion-${question._id}`"
      :title="`แก้ไขรูป ${question.title}`"
      size="md"
      header-class="d-none"
      footer-class="d-none"
      header
    >
      <div class="card-body px-5 py-4 w-424">
        <h3 class="my-1 text-center">แก้ไขรูป</h3>
        <hr class="custom-hr" />
        <form class="form-container my-4" enctype="multipart/form-data">
          <div class="upload-files-container mb-4">
            <div class="subject-file-area">
              <label class="my-0 mt-3"
                ><span class="browse-files">
                  <span class="material-icons-outlined upload-icon">
                    อัพโหลดไฟล์
                  </span>
                  <input
                    type="file"
                    class="default-file-input"
                    accept="image/*"
                    v-on:change="onFileChange($event, 'question')"
                  />
                  <span class="browse-files-text">Browse </span>
                  <span>from device</span>
                </span>
              </label>
            </div>
          </div>
        </form>
      </div>
    </b-modal>
    <b-input-group class="mt-3">
      <b-form-input
        class="mb-2"
        v-model="question.title"
        v-on:change="updateQuestion"
      ></b-form-input>
      <b-input-group-append>
        <b-button variant="tnk-2" @click="imageQuestion"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-image-fill"
            viewBox="0 0 16 16"
          >
            <path
              d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2V3zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z"
            /></svg
        ></b-button>
      </b-input-group-append>
    </b-input-group>
    <b-input-group class="mt-0">
      <b-form-input
        v-model="question.description"
        v-on:change="updateQuestion"
      ></b-form-input>
    </b-input-group>
    <div
      class="form-check mt-3"
      v-for="(choice, idx) of question.choices"
      :key="idx"
    >
      <b-modal
        :id="`modal-uploadImageChoice-${choice._id}`"
        :title="`แก้ไขรูป ${choice.title}`"
        size="md"
        header-class="d-none"
        footer-class="d-none"
        header
      >
        <div class="card-body px-5 py-4 w-424">
          <h3 class="my-1 text-center">แก้ไขรูป</h3>
          <hr class="custom-hr" />
          <form class="form-container my-4" enctype="multipart/form-data">
            <div class="upload-files-container mb-4">
              <div class="subject-file-area">
                <label class="my-0 mt-3"
                  ><span class="browse-files">
                    <span class="material-icons-outlined upload-icon">
                      อัพโหลดไฟล์
                    </span>
                    <input
                      type="file"
                      class="default-file-input"
                      accept="image/*"
                      v-on:change="onFileChange($event, choice)"
                    />
                    <span class="browse-files-text">Browse </span>
                    <span>from device</span>
                  </span>
                </label>
              </div>
            </div>
          </form>
        </div>
      </b-modal>
      <input
        class="form-check-input"
        type="radio"
        v-bind:value="choice._id"
        v-model="correctChoice"
        :checked="`${choice._id}` === `${correctChoice}`"
        v-on:change="updateChoice(choice)"
      />
      <b-input-group class="mt-3">
        <b-form-input
          v-model="choice.title"
          @change="updateChoice(choice)"
        ></b-form-input>
        <b-input-group-append>
          <b-button variant="tnk-2" @click="imageChoice(choice._id)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-image-fill"
              viewBox="0 0 16 16"
            >
              <path
                d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2V3zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z"
              />
            </svg>
          </b-button>
        </b-input-group-append>
      </b-input-group>
      <b-input-group class="mt-2">
        <b-form-input
          v-model="choice.description"
          @change="updateChoice(choice)"
        ></b-form-input>
      </b-input-group>
    </div>
    <b-col cols="12" class="mx-auto d-block text-white text-center">
      <button
        class="btn btn-tnk-8 btn-sm w-100 mt-4 mb-0"
        @click="deleteQuestion(question._id)"
      >
        ลบคำถามข้อนี้
      </button>
    </b-col>
  </div>
</template>

<script>
export default {
  props: {
    question: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      quizzes: [],
      search: '',
      loading: true,
      correctChoice: this.getCorrectChoice(),
    }
  },
  methods: {
    getCorrectChoice() {
      const correctChoice = this.question.choices.find(
        (choice) => choice.isCorrect
      )
      return correctChoice._id
    },
    updateChoice(choice) {
      choice.isCorrect = this.correctChoice === choice._id
      this.$axios
        .patch(`/choice/${this.question._id}/${choice._id}`, {
          title: choice.title,
          description: choice.description,
          image: choice.image,
          isCorrect: choice.isCorrect,
        })
        .then((res) => {
          console.log(res)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    updateQuestion() {
      this.$axios
        .patch(`/question/${this.question._id}`, {
          title: this.question.title,
          description: this.question.description,
          image: this.question.image,
          quizz: this.question.quizz._id,
        })
        .then((res) => {
          console.log(res)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    deleteQuestion(questionId) {
      // swal with confirm
      this.$swal({
        title: 'คุณต้องการลบคำถามนี้ใช่หรือไม่?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่',
        cancelButtonText: 'ยกเลิก',
      }).then((result) => {
        if (result.value) {
          this.$axios
            .delete(`/question/${questionId}`)
            .then((res) => {
              this.$swal({
                title: 'ลบคำถามสำเร็จ',
                type: 'success',
                timer: 1000,
                showConfirmButton: false,
              })
              this.$emit('update-question')
            })
            .catch((err) => {
              console.log(err)
            })
        }
      })
    },
    imageChoice(choiceId) {
      this.$bvModal.show(`modal-uploadImageChoice-${choiceId}`)
    },
    imageQuestion() {
      this.$bvModal.show(`modal-uploadImageQuestion-${this.question._id}`)
    },
    onFileChange(e, type) {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length) return
      this.createImage(files[0], type)
    },
    createImage(file, type) {
      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        if (type === 'question') {
          this.question.image = e.target.result
          this.updateQuestion()
          this.$bvModal.hide(`modal-uploadImageQuestion-${this.question._id}`)
          this.$swal({
            title: 'อัพโหลดรูปภาพสำเร็จ',
            text: this.question.title,
            type: 'success',
            timer: 1000,
            showConfirmButton: false,
          })
        } else {
          type.image = e.target.result
          this.updateChoice(type)
          this.$bvModal.hide(`modal-uploadImageChoice-${type._id}`)
          this.$swal({
            title: 'อัพโหลดรูปภาพสำเร็จ',
            text: type.title,
            type: 'success',
            timer: 1000,
            showConfirmButton: false,
          })
        }
      }
    },
  },
}
</script>
