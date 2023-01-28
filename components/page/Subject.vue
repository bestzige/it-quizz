<template>
  <div>
    <b-modal
      v-if="type === 'admin'"
      id="modal-subject"
      size="md"
      header-class="d-none"
      footer-class="d-none"
      header
    >
      <div class="card-body px-5 py-4 w-424">
        <h3 class="my-1 text-center"><b></b>Subject - เพิ่มวิชา</h3>
        <hr class="custom-hr" />
        <label for="subject.title">ชื่อวิชา</label>
        <b-input placeholder="วิชา 01" v-model="subject.title"></b-input>
        <label for="subject.description" class="mt-2">รายละเอียดวิชา</label>
        <b-input
          placeholder="รายละเอียดวิชานี้"
          v-model="subject.description"
        ></b-input>
        <label for="subject.slug" class="mt-2">รหัสวิชา</label>
        <b-input placeholder="lng-120" v-model="subject.slug"></b-input>
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
            @click="addSubject"
            >เพิ่มวิชา</b-button
          >
          <b-button
            v-if="!create"
            variant="tnk-4"
            class="w-100 mt-2"
            @click="updateSubject"
            >แก้ไขวิชา</b-button
          >
        </form>
      </div>
    </b-modal>
    <div class="row">
      <div :class="`${type === 'admin' ? 'col-xl-9' : 'col-xl-8'}`">
        <h1 v-if="type === 'admin'" class="text-white">เลือกวิชาที่จะจัดการ</h1>
        <h1 v-else class="text-white">เลือกรายวิชาที่จะสอบ</h1>
      </div>
      <div v-if="type === 'admin'" class="col-xl-3">
        <button
          class="btn-tnk-3 w-100 p-2"
          type="button"
          @click="
            subject = {}
            create = true
          "
          v-b-modal.modal-subject
        >
          เพิ่มวิชา
        </button>
      </div>
    </div>
    <!-- Subject Header -->

    <!-- Render Subject -->
    <b-row>
      <b-col v-if="loading" cols="12" class="text-center mt-5 mb-5">
        <LayoutLoading />
      </b-col>
      <b-col
        v-if="!loading"
        v-for="(subjectx, idx) of subjects"
        :key="idx"
        cols="12"
        md="6"
        lg="4"
        xl="3"
        class="mb-4"
      >
        <NuxtLink
          :to="`/${type === 'admin' ? 'manage' : 'subject'}/${subjectx.slug}`"
        >
          <Subject v-if="subjectx" :subject="subjectx" class="brb-0 mt-4" />
        </NuxtLink>
        <div class="card card-body brt-0" v-if="type === 'admin'">
          <b-row>
            <b-col>
              <button
                class="btn btn-tnk-3 btn-sm w-100"
                @click="
                  subject = subjectx
                  create = false
                "
                v-b-modal.modal-subject
              >
                แก้ไข
              </button>
            </b-col>
            <b-col>
              <button
                class="btn btn-tnk-4 btn-sm w-100"
                @click="deleteSubject(subjectx._id)"
              >
                ลบ
              </button>
            </b-col>
          </b-row>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: () => 'user',
    },
  },
  mounted() {
    this.getSubjects().then(() =>
      setTimeout(() => {
        this.loading = false
      }, 200)
    )
  },
  data() {
    return {
      subjects: [],
      search: '',
      loading: true,
      create: true,
      subject: {
        title: '',
        description: '',
        image: '',
        slug: '',
      },
    }
  },
  methods: {
    async getSubjects() {
      const { data } = await this.$axios.get('/subject')
      this.subjects = data.data
    },
    async searchSubject() {
      const { data } = await this.$axios.get(`/subject?search=${this.search}`)
      this.subjects = data.data
    },
    async onSearch() {
      this.loading = true
      if (this.search.trim() === '')
        return this.getSubjects().then(
          setTimeout(() => {
            this.loading = false
          }, 200)
        )

      this.searchSubject().then(
        setTimeout(() => {
          this.loading = false
        }, 200)
      )
    },
    addSubject() {
      this.$axios
        .post('/subject', {
          title: this.subject.title,
          description: this.subject.description,
          image: this.subject.image,
          slug: this.subject.slug,
        })
        .then((res) => {
          this.subjects.push(res.data.data)
          this.$bvModal.hide('modal-subject')
        })
        .catch((err) => {
          console.log(err)
        })
    },
    deleteSubject(id) {
      this.$axios.delete(`/subject/${id}`).then((res) => {
        this.subjects = this.subjects.filter((subject) => subject._id !== id)
      })
    },
    updateSubject() {
      this.$axios
        .patch(`/subject/${this.subject._id}`, {
          title: this.subject.title,
          description: this.subject.description,
          image: this.subject.image,
          slug: this.subject.slug,
        })
        .then((res) => {
          this.subjects = this.subjects.map((subject) => {
            if (subject._id === this.subject._id) {
              subject.title = this.subject.title
              subject.description = this.subject.description
              subject.image = this.subject.image
              subject.slug = this.subject.slug
            }
            return subject
          })
          this.$bvModal.hide('modal-subject')
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
        this.subject.image = e.target.result
      }
    },
  },
}
</script>
