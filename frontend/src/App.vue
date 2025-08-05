<!-- frontend/src/App.vue -->
<template>
  <div class="app-container">
    <!-- Component hiển thị toast thông báo (nằm cố định toàn app) -->
    <Toast />

    <!-- Hiển thị component theo route hiện tại -->
    <router-view></router-view>
  </div>
</template>

<script>
// Import Toast component để hiển thị thông báo toàn cục
import Toast from "@/components/Toast.vue";

export default {
  name: "App", // Tên component gốc
  components: {
    Toast, // Đăng ký component Toast để dùng trong template
  },
};
</script>

<style>
/* Import CSS của Bootstrap và Font Awesome */
@import "bootstrap/dist/css/bootstrap.min.css";
@import "@fortawesome/fontawesome-free/css/all.min.css";
</style>
