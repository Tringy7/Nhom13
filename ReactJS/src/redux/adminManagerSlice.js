import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAdminManagers, createManager, updateManager,
  lockManager, unlockManager, resetManagerPassword
} from "../components/util/api/adminApi";

export const fetchManagers = createAsyncThunk("adminManagers/fetchAll", async (params, { rejectWithValue }) => {
  try { const res = await getAdminManagers(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

export const addManager = createAsyncThunk("adminManagers/create", async (data, { rejectWithValue }) => {
  try { const res = await createManager(data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

export const editManager = createAsyncThunk("adminManagers/update", async ({ id, data }, { rejectWithValue }) => {
  try { const res = await updateManager(id, data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

export const lockAdminManager = createAsyncThunk("adminManagers/lock", async (id, { rejectWithValue }) => {
  try { await lockManager(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

export const unlockAdminManager = createAsyncThunk("adminManagers/unlock", async (id, { rejectWithValue }) => {
  try { await unlockManager(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

export const resetAdminManagerPassword = createAsyncThunk("adminManagers/resetPwd", async (id, { rejectWithValue }) => {
  try { const res = await resetManagerPassword(id); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

const adminManagerSlice = createSlice({
  name: "adminManagers",
  initialState: { list: [], total: 0, page: 1, limit: 10, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchManagers.pending, (state) => { state.loading = true; })
      .addCase(fetchManagers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchManagers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addManager.fulfilled, (state, action) => { state.list.unshift(action.payload); state.total += 1; })
      .addCase(editManager.fulfilled, (state, action) => {
        const idx = state.list.findIndex(m => m.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(lockAdminManager.fulfilled, (state, action) => {
        const m = state.list.find(x => x.id === action.payload);
        if (m) m.status = "LOCKED";
      })
      .addCase(unlockAdminManager.fulfilled, (state, action) => {
        const m = state.list.find(x => x.id === action.payload);
        if (m) m.status = "ACTIVE";
      });
  },
});

export default adminManagerSlice.reducer;