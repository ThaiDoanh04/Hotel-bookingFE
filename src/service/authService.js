import {get,post} from "../utils/request" // Import các phương thức từ api.js

export const login = async (loginData) => {
  try {
    const result = await post("auth/login", loginData); // Gọi API login
    return result;
  } catch (error) {
    throw new Error(error.message || "Đăng nhập thất bại!");
  }
};

export const register = async (registerData) => {
  try {
    const result = await post("auth/register", registerData); // Gọi API register
    return result;
  } catch (error) {
    throw new Error(error.message || "Đăng ký thất bại!");
  }
};

export const fetchUserProfile = async () => {
  try {
    const result = await get("auth/profile"); // Lấy thông tin user
    return result;
  } catch (error) {
    throw new Error(error.message || "Không thể tải thông tin người dùng!");
  }
};

export const logout = async () => {
  try {
    await post("auth/logout", {}); // Gọi API logout
    localStorage.removeItem("authToken"); // Xóa token khỏi localStorage
  } catch (error) {
    throw new Error("Đăng xuất thất bại!");
  }
};
