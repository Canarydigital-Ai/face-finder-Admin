
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

interface AdminState {
  isAuthenticated: boolean;
  token: string | null;
  user: AdminUser | null;
  loading: boolean;
}

const initialState: AdminState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminAuth: (state, action: PayloadAction<{ token: string; user: AdminUser }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    clearAdminAuth: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
    setAdminLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setAdminAuth, clearAdminAuth, setAdminLoading } = adminSlice.actions;
export default adminSlice.reducer;