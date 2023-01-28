<template>
  <div>
    <b-modal
      v-if="type === 'admin'"
      id="modal-quizz"
      size="md"
      header-class="d-none"
      footer-class="d-none"
      header
    >
      <div class="card-body px-5 py-4 w-424">
        <h3 class="my-1 text-center"><b></b>Quizz - เพิ่มห้องสอบ</h3>
        <hr class="custom-hr" />
        <label for="quizz.title">ชื่อห้องสอบ</label>
        <b-input
          placeholder="ห้องสอบ Vocabulary"
          v-model="quizz.title"
        ></b-input>
        <label for="quizz.description" class="mt-2">รายละเอียดห้องสอบ</label>
        <b-input
          placeholder="รายละเอียดห้องสอบนี้"
          v-model="quizz.description"
        ></b-input>
        <label for="quizz.slug" class="mt-2">รหัสห้องสอบ</label>
        <b-input placeholder="room-1" v-model="quizz.slug"></b-input>
        <form class="form-container my-1" enctype="multipart/form-data">
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
                    v-on:change="onFileChange($event)"
                  />
                  <span class="browse-files-text">Browse </span>
                  <span>from device</span>
                </span>
              </label>
            </div>
          </div>
          <b-button
            v-if="create"
            variant="tnk-4"
            class="w-100 mt-2"
            @click="addQuizz"
            >เพิ่มวิชา</b-button
          >
          <b-button
            v-if="!create"
            variant="tnk-4"
            class="w-100 mt-2"
            @click="updateQuizz"
            >แก้ไขวิชา</b-button
          >
        </form>
      </div>
    </b-modal>

    <!-- quizz Config -->
    <div class="row">
      <div :class="`${type === 'admin' ? 'col-xl-9' : 'col-xl-8'}`">
        <h1 v-if="type === 'admin'" class="text-white">
          เลือกห้องสอบที่จะจัดการ
        </h1>
        <h1 v-else class="text-white">เลือกห้องสอบที่จะสอบ</h1>
      </div>
      <div v-if="type === 'admin'" class="col-xl-3">
        <button
          class="btn-tnk-3 w-100 p-2"
          type="button"
          @click="
            quizz = {}
            create = true
          "
          v-b-modal.modal-quizz
        >
          เพิ่มห้องสอบ
        </button>
      </div>
      <!-- <div :class="`${type === 'admin' ? 'col-xl-3' : 'col-xl-4'} text-right`">
        <div class="input-group mb-3">
          <input
            type="text"
            class="form-control mt-2"
            :placeholder="`${
              type === 'admin'
                ? 'ค้นหาห้องสอบที่จะจัดการ'
                : 'ค้นหาห้องสอบที่จะสอบ'
            }`"
            v-model="search"
          />
          <button class="btn-tnk-2 mt-2 px-4" type="button" @click="onSearch">
            ค้นหา
          </button>
        </div>
      </div> -->
    </div>
    <!-- quizz Header -->

    <!-- Render QuizzRoom -->
    <b-row>
      <b-col v-if="loading" cols="12" class="text-center mt-5 mb-5">
        <LayoutLoading />
      </b-col>
      <b-col
        v-if="!loading"
        v-for="(quizzx, idx) of quizzes"
        :key="idx"
        cols="12"
        md="6"
        lg="4"
        xl="3"
        class="mb-4"
      >
        <NuxtLink
          v-if="type === 'admin'"
          :to="`/${type === 'admin' ? 'manage' : 'quizz'}/${slug}/${
            quizzx.slug
          }`"
        >
          <Quizz v-if="quizzx" :quizz="quizzx" class="mt-4 brb-0" />
        </NuxtLink>
        <a v-else @click="joinQuizz(quizzx)" class="pointer">
          <Quizz v-if="quizzx" :quizz="quizzx" />
        </a>
        <div class="card card-body brt-0" v-if="type === 'admin'">
          <b-row>
            <b-col>
              <button
                class="btn btn-tnk-3 btn-sm w-100"
                @click="
                  quizz = quizzx
                  create = false
                "
                v-b-modal.modal-quizz
              >
                แก้ไข
              </button>
            </b-col>
            <b-col>
              <button
                class="btn btn-tnk-4 btn-sm w-100"
                @click="deleteQuizz(quizzx._id)"
              >
                ลบ
              </button>
            </b-col>
          </b-row>
        </div>
      </b-col>
    </b-row>
    <!-- Render QuizzRoom -->
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: () => 'user',
    },
    slug: {
      type: String,
      default: () => 'none',
    },
  },
  mounted() {
    this.getQuizzes().then(() =>
      setTimeout(() => {
        this.loading = false
      }, 200)
    )
  },
  data() {
    return {
      quizzes: [],
      search: '',
      loading: true,
      quizz: {
        title: '',
        description: '',
        image: '',
        slug: '',
        subject: '',
      },
      create: true,
    }
  },
  methods: {
    async getQuizzes() {
      const { data } = await this.$axios.get(`/quizz?quizz=${this.slug}`)
      this.quizzes = data.data
    },
    async searchQuizz() {
      const { data } = await this.$axios.get(
        `/quizz?quizz=${this.slug}&search=${this.search}`
      )
      this.quizzes = data.data
    },
    async onSearch() {
      this.loading = true
      if (this.search.trim() === '')
        return this.getQuizzes().then(
          setTimeout(() => {
            this.loading = false
          }, 200)
        )

      this.searchQuizz().then(
        setTimeout(() => {
          this.loading = false
        }, 200)
      )
    },
    joinQuizz(quizz) {
      this.$axios
        .get(`/quizz/${quizz._id}/state`)
        .then(({ data }) => {
          if (data.started) {
            return this.$router.push(`/subject/${this.slug}/${quizz.slug}`)
          }

          return this.$swal({
            title: 'ยืนยันการเข้าร่วมห้องสอบ',
            text: `คุณต้องการเข้าร่วมห้องสอบ ${quizz.title} ใช่หรือไม่`,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ใช่',
            cancelButtonText: 'ไม่ใช่',
          })
            .then(async (result) => {
              if (result.value) {
                const { data } = await this.$axios.post(
                  `/quizz/${quizz._id}/join`
                )
                localStorage.setItem(
                  'currentQuizz',
                  this.slug + '/' + quizz.slug
                )
                this.$router.push(`/subject/${this.slug}/${quizz.slug}`)
              }
            })
            .catch((error) => {
              this.$swal('เกิดข้อผิดพลาด', error.response.data.message, 'error')
            })
        })
        .catch((error) => {
          console.log(error)
          this.$swal({
            title: 'เข้าร่วมห้องสอบไม่สำเร็จ',
            text: error.response.data.message,
            type: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'ตกลง',
          })
        })
    },
    addQuizz() {
      this.$axios
        .post('/quizz', {
          title: this.quizz.title,
          description: this.quizz.description,
          image: this.quizz.image,
          slug: this.quizz.slug,
          subject: this.$route.params.subjectSlug,
        })
        .then((res) => {
          this.quizzes.push(res.data.data)
          this.$bvModal.hide('modal-quizz')
        })
        .catch((err) => {
          console.log(err)
        })
    },
    deleteQuizz(id) {
      this.$axios.delete(`/quizz/${id}`).then((res) => {
        this.quizzes = this.quizzes.filter((quizz) => quizz._id !== id)
      })
    },
    updateQuizz() {
      this.$axios
        .patch(`/quizz/${this.quizz._id}`, {
          title: this.quizz.title,
          description: this.quizz.description,
          image: this.quizz.image,
          slug: this.quizz.slug,
          subject: this.quizz.subject,
        })
        .then((res) => {
          this.quizzes = this.quizzes.map((quizz) => {
            if (quizz._id === this.quizz._id) {
              quizz.title = this.quizz.title
              quizz.description = this.quizz.description
              quizz.image = this.quizz.image
              quizz.slug = this.quizz.slug
              quizz.subject = this.quizz.subject
            }
            return quizz
          })
          this.$bvModal.hide('modal-quizz')
        })
        .catch((err) => {
          console.log(err)
        })
    },
    onFileChange(e) {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length) return
      this.createImage(files[0])
    },
    createImage(file) {
      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        this.quizz.image = e.target.result
      }
    },
  },
}
</script>
