import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAdminShippers, createShipper, updateShipper, lockShipper, unlockShipper } from "../components/util/api/adminApi";

export const fetchShippers = createAsyncThunk("adminShippers/fetchAll", async (params, { rejectWithValue }) => {
  try { const res = await getAdminShippers(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

export const addShipper = createAsyncThunk("adminShippers/create", async (data, { rejectWithValue }) => {
  try { const res = await createShipper(data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

export const editShipper = createAsyncThunk("adminShippers/update", async ({ id, data }, { rejectWithValue }) => {
  try { const res = await updateShipper(id, data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

export const lockAdminShipper = createAsyncThunk("adminShippers/lock", async (id, { rejectWithValue }) => {
  try { await lockShipper(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

export const unlockAdminShipper = createAsyncThunk("adminShippers/unlock", async (id, { rejectWithValue }) => {
  try { await unlockShipper(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

const adminShipperSlice = createSlice({
  name: "adminShippers",
  initialState: { list: [], total: 0, page: 1, limit: 10, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShippers.pending, (state) => { state.loading = true; })
      .addCase(fetchShippers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchShippers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addShipper.fulfilled, (state, action) => { state.list.unshift(action.payload); state.total += 1; })
      .addCase(editShipper.fulfilled, (state, action) => {
        const idx = state.list.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(lockAdminShipper.fulfilled, (state, action) => {
        const s = state.list.find(x => x.id === action.payload);
        if (s) s.status = "LOCKED";
      })
      .addCase(unlockAdminShipper.fulfilled, (state, action) => {
        const s = state.list.find(x => x.id === action.payload);
        if (s) s.status = "ACTIVE";
      });
  },
});

export default adminShipperSlice.reducer;