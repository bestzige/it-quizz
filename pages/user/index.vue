<template>
  <div>
    <b-card class="p-4">
      <h2>เพิ่มสิทธ์ได้ที่นี้</h2>
      <b-form-input
        class="mt-5"
        v-model="username"
        placeholder="ใส่รหัสนักศึกษาที่ต้องการเพิ่มเป็น Admin หรือ ลดสิทธิ์"
      ></b-form-input>
      <div class="mt-4">
        <b-row>
          <b-col cols="6"
            ><b-button @click="addAdmin" class="btn-tnk-4 w-100"
              >เพิ่ม Admin</b-button
            ></b-col
          >
          <b-col cols="6"
            ><b-button @click="removeAdmin" class="btn-tnk-3 w-100"
              >ลบออกจาก Admin</b-button
            ></b-col
          >
        </b-row>
      </div>

      <b-col cols="12" v-if="user" class="text-center mt-5">
        <h1>ข้อมูลผู้ใช้</h1>
        <p v-for="(x, index) in user" :key="index">{{ index }}: {{ x }}</p>
      </b-col>
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
  },
  data() {
    return {
      username: '',
      user: '',
    }
  },
  methods: {
    async addAdmin() {
      try {
        this.$swal({
          title: 'ยืนยันการเพิ่ม Admin',
          text: `คุณต้องการเพิ่ม ${this.username} เป็น Admin ใช่หรือไม่`,
          type: 'warning',
          buttons: true,
          dangerMode: true,
        }).then(async (willDelete) => {
          if (willDelete) {
            this.$axios
              .put('/user/admin', {
                username: this.username,
              })
              .then(({ data }) => {
                this.username = ''
                this.user = data.user
                this.$swal('เพิ่ม Admin เรียบร้อยแล้ว', '', 'success')
              })
              .catch((error) => {
                this.$swal(error.response.data.message, '', 'error')
              })
          } else {
            this.$swal('ยกเลิกการเพิ่ม Admin')
          }
        })
      } catch (error) {
        throw error
      }
    },
    async removeAdmin() {
      try {
        this.$swal({
          title: 'ยืนยันการลบ Admin',
          text: `คุณต้องการลบ ${this.username} ออกจาก Admin ใช่หรือไม่`,
          type: 'warning',
          buttons: true,
          dangerMode: true,
        }).then(async (willDelete) => {
          if (willDelete) {
            this.$axios
              .delete('/user/admin/' + this.username)
              .then(({ data }) => {
                this.username = ''
                this.user = data.user
                this.$swal('ลบ Admin เรียบร้อยแล้ว', '', 'success')
              })
              .catch((error) => {
                this.$swal(error.response.data.message, '', 'error')
              })
          } else {
            this.$swal('ยกเลิกการลบ Admin')
          }
        })
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
