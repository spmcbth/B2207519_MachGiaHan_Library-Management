<template>
  <div class="home-background">
    <div class="home-container">
      <!-- Left side - Content -->
      <div class="home-left">
        <div class="home-content">
          <div class="home-title">
            <h1>Hệ thống quản lý thư viện</h1>
            <p class="home-subtitle">
              Chào mừng bạn đến với thư viện trực tuyến
            </p>
          </div>
          <div class="home-description">
            <p>
              Khám phá kho tàng tri thức phong phú với hàng ngàn đầu sách đa
              dạng. Đăng nhập tài khoản để dễ dàng tìm kiếm, mượn và quản lý
              sách yêu thích của bạn.
            </p>
          </div>
          <div class="home-actions">
            <router-link to="/login" class="btn-primary">
              <i class="fas fa-user"></i>
              Đăng nhập
            </router-link>
            <router-link to="/register" class="btn-secondary">
              <i class="fas fa-user-plus"></i>
              Đăng ký
            </router-link>
          </div>
        </div>
      </div>
      <!-- Right side - Image/Illustration -->
      <div class="home-right">
        <div class="image-wrapper">
          <img src="../assets/Bibliophile-rafiki.png" class="home-image" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomeView",
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}
.home-background {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 50%, #81d4fa 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow: hidden;
}
.home-container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 123, 191, 0.15);
  overflow: hidden;
  position: relative;
  z-index: 2;
}
.home-left {
  flex: 1;
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
}
.home-content {
  max-width: 500px;
}
.home-title {
  margin-bottom: 30px;
}
.home-title h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a237e;
  margin-bottom: 15px;
  line-height: 1.2;
  background: linear-gradient(135deg, #1a237e 0%, #3f51b5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.home-subtitle {
  font-size: 1.2rem;
  color: #546e7a;
  font-weight: 400;
  margin: 0;
}
.home-description {
  margin-bottom: 35px;
}
.home-description p {
  font-size: 1rem;
  color: #607d8b;
  line-height: 1.6;
  margin: 0;
}
.home-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
  color: white;
}
.btn-primary:hover {
  transform: translateY(-2px);
  color: white;
}
.btn-secondary {
  background: transparent;
  color: #4fc3f7;
  border: 2px solid #4fc3f7;
}
.btn-secondary:hover {
  background: #4fc3f7;
  color: white;
  transform: translateY(-2px);
}
.home-right {
  flex: 1;
  background: linear-gradient(135deg, #81d4fa 0%, #4fc3f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
}
.image-wrapper {
  max-width: 85%;
  z-index: 2;
  position: relative;
}
.home-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1));
}
</style>
