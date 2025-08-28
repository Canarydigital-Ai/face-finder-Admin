import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../hooks/firebase/firebaseConfig"; 

interface LoginFormData {
  email: string;
  password: string;
}

const ADMIN_EMAIL = import.meta.env.VITE_APP_ADMIN_EMAIL

// Define the admin email - with fallback if env variable is not set

export const adminLogin = async (formData: LoginFormData) => {
  try {
    
    // Check if the email is the admin email before attempting login
    if (formData.email !== ADMIN_EMAIL) {
      throw new Error("Access denied. Only admin can login.");
    }

    const response = await signInWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );
    
    // Double-check after successful authentication
    if (response.user.email !== ADMIN_EMAIL) {
      await auth.signOut(); // Sign out immediately if not admin
      throw new Error("Access denied. Only admin can access this system.");
    }

    const token = await response.user.getIdToken();

    localStorage.setItem("authToken", token);
    localStorage.setItem("userEmail", response.user.email || "");
    localStorage.setItem("isAdmin", "true"); // Store admin status
    
    return response.user;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};