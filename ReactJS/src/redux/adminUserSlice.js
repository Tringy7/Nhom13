import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAdminUsers, getAdminUserById, lockUser, unlockUser, changeUserRole } from "../components/util/api/adminApi";

export const fetchAdminUsers = createAsyncThunk("adminUsers/fetchAll", async (params, { rejectWithValue }) => {
  try { const res = await getAdminUsers(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

export const fetchAdminUserById = createAsyncThunk("adminUsers/fetchOne", async (id, { rejectWithValue }) => {
  try { const res = await getAdminUserById(id); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

export const lockAdminUser = createAsyncThunk("adminUsers/lock", async (id, { rejectWithValue }) => {
  try { await lockUser(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

export const unlockAdminUser = createAsyncThunk("adminUsers/unlock", async (id, { rejectWithValue }) => {
  try { await unlockUser(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

export const changeAdminUserRole = createAsyncThunk("adminUsers/changeRole", async ({ id, role }, { rejectWithValue }) => {
  try { const res = await changeUserRole(id, role); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

const adminUserSlice = createSlice({
  name: "adminUsers",
  initialState: { list: [], total: 0, page: 1, limit: 10, selectedUser: null, loading: false, error: null },
  reducers: { clearSelectedUser: (state) => { state.selectedUser = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchAdminUserById.fulfilled, (state, action) => { state.selectedUser = action.payload; })
      .addCase(lockAdminUser.fulfilled, (state, action) => {
        const u = state.list.find(x => x.id === action.payload);
        if (u) u.status = "LOCKED";
      })
      .addCase(unlockAdminUser.fulfilled, (state, action) => {
        const u = state.list.find(x => x.id === action.payload);
        if (u) u.status = "ACTIVE";
      })
      .addCase(changeAdminUserRole.fulfilled, (state, action) => {
        const beforeCount = state.list.length;
        state.list = state.list.filter((user) => user.id !== action.payload.id || action.payload.role === "user");
        if (state.list.length < beforeCount) state.total = Math.max(0, state.total - 1);
        const u = state.list.find((user) => user.id === action.payload.id);
        if (u) u.role = action.payload.role;
      });
  },
});

export const { clearSelectedUser } = adminUserSlice.actions;
export default adminUserSlice.reducer;
