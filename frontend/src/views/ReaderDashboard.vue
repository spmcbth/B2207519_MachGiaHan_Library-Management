<template>
  <div class="reader-dashboard">
    <nav class="navbar navbar-expand-lg">
      <div class="container">
        <a
          class="navbar-brand"
          href="#"
          @click.prevent="currentComponent = 'HomePage'"
        >
          <i class="fas fa-book-open me-2"></i>Thư viện sách
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: currentComponent === 'BookList' }"
                @click="currentComponent = 'BookList'"
              >
                Sách
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: currentComponent === 'PublisherList' }"
                @click="currentComponent = 'PublisherList'"
              >
                Nhà xuất bản
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: currentComponent === 'AuthorList' }"
                @click="currentComponent = 'AuthorList'"
              >
                Tác giả
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: currentComponent === 'BorrowHistory' }"
                @click="currentComponent = 'BorrowHistory'"
              >
                Lịch sử mượn sách
              </a>
            </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item me-3">
              <span
                class="nav-link"
                style="cursor: pointer"
                @click="currentComponent = 'UserProfile'"
              >
                Xin chào, {{ currentUser?.hoLot }}
                {{ currentUser?.ten || "Độc giả" }}
              </span>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click="handleLogout">Đăng xuất</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div class="container mt-4">
      <component :is="currentComponent"></component>
    </div>
  </div>
  <footer class="footer mt-5">
    <div class="container">
      <div class="row">
        <div class="col-md-4 mb-4">
          <h5>Về chúng tôi</h5>
          <p>
            Không gian đọc sách lý tưởng không chỉ tồn tại ở những nơi yên tĩnh
            – mà còn có thể hiện diện trong chiếc điện thoại hoặc máy tính của
            bạn.
          </p>
        </div>
        <div class="col-md-4 mb-4">
          <h5>Chính sách bảo mật</h5>
          <ul class="list-unstyled">
            <li>
              <a href="#">
                Chính sách quyền riêng tư
              </a>
            </li>
            <li>
              <a href="#">
                Điều khoản sử dụng
              </a>
            </li>
            <li>
              <a href="#">
                Bảo mật & bảo vệ dữ liệu
              </a>
            </li>
            <li>
              <a href="#">
                Chính sách Cookie
              </a>
            </li>
          </ul>
        </div>
        
        <div class="col-md-4 mb-4">
          <h5>Liên hệ</h5>
          <ul class="list-unstyled">
            <li><i class="fas fa-map-marker-alt me-2"></i> Đại học Cần Thơ</li>
            <li><i class="fas fa-phone me-2"></i> 0911608752</li>
            <li>
              <i class="fas fa-envelope me-2"></i>
              hanb2207519@student.ctu.edu.vn
            </li>
          </ul>
          <div class="social-links mt-3">
            <a href="#" class="me-3"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="me-3"><i class="fab fa-twitter"></i></a>
            <a href="#" class="me-3"><i class="fab fa-instagram"></i></a>
            <a
              href="https://github.com/spmcbth/B2207519_MachGiaHan_Library-Management.git"
              ><i class="fab fa-github"></i>
            </a>
          </div>
        </div>
      </div>
      <hr />
      <div class="row">
        <div class="col-md-12 text-center">
          <p class="mb-0">
            &copy; Hệ thống Thư viện trực tuyến. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import HomePage from "@/components/reader/HomePage.vue";
import BookList from "@/components/reader/BookList.vue";
import PublisherList from "@/components/reader/PublisherList.vue";
import AuthorList from "@/components/reader/AuthorList.vue";
import BorrowHistory from "@/components/reader/BorrowHistory.vue";
import UserProfile from "@/components/reader/UserProfile.vue";

export default {
  name: "ReaderDashboard",
  components: {
    HomePage,
    BookList,
    PublisherList,
    AuthorList,
    BorrowHistory,
    UserProfile,
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const currentComponent = ref(
      localStorage.getItem("readerCurrentComponent") || "HomePage"
    );
    const currentYear = computed(() => new Date().getFullYear());

    watch(currentComponent, (newValue) => {
      localStorage.setItem("readerCurrentComponent", newValue);
    });

    const currentUser = computed(() => store.getters["auth/currentUser"]);

    const handleLogout = async () => {
      await store.dispatch("auth/logout");
      localStorage.removeItem("readerCurrentComponent");
      router.push("/login");
    };
    const navigateTo = (componentName) => {
      currentComponent.value = componentName;
    };

    return {
      currentComponent,
      currentUser,
      handleLogout,
      currentYear,
      navigateTo,
    };
  },
};
</script>

<style scoped>
/* Navbar - màu nền và hiệu ứng hover giống admin */
.navbar {
  background-color: #29b6f6;
  padding: 0.8rem 1rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.4rem;
  color: #ffffff !important;
}

.navbar-nav .nav-link {
  color: white !important;
  font-size: 1.05rem;
  font-weight: 500;
  transition: color 0.2s ease;
  cursor: pointer;
}

.navbar-nav .nav-link:hover {
  color: #003c8f !important;
}

.navbar-nav .nav-link.active {
  font-weight: 700;
  border-bottom: 2px solid #ffffff;
  padding-bottom: 2px;
}

/* Toggler icon trắng */
.navbar-toggler {
  border: none;
}
.navbar-toggler-icon {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba%28255, 255, 255, 0.9%29' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
}

/* Footer - dùng tone màu xanh nhạt phù hợp */
.footer {
  margin-top: 60px;
  background-color: #e1f5fe;
  border-top: 1px solid #b3e5fc;
  padding: 40px 0 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1rem;
  color: #37474f;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.footer h5 {
  color: #1976d2;
  font-weight: 600;
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.footer ul {
  padding-left: 0;
}

.footer ul li {
  list-style: none;
  margin-bottom: 10px;
}

.footer a {
  color: #37474f;
  text-decoration: none;
  transition: color 0.3s;
}

.footer a:hover {
  color: #1976d2;
}

.footer i {
  width: 18px;
}

.footer hr {
  margin: 24px 0;
  border-color: rgba(0, 0, 0, 0.05);
}

/* Social links - tone xanh đồng nhất */
.social-links a {
  display: inline-block;
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-radius: 50%;
  background-color: #4fc3f7;
  color: white !important;
  margin-right: 10px;
  transition: background-color 0.3s, transform 0.3s;
}

.social-links a:hover {
  background-color: #29b6f6;
  transform: translateY(-2px);
}
</style>
