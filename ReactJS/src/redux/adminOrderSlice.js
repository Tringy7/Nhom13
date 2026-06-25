import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAdminOrders, getAdminOrderById } from "../components/util/api/adminApi";

export const fetchAdminOrders = createAsyncThunk("adminOrders/fetchAll", async (params, { rejectWithValue }) => {
  try { const res = await getAdminOrders(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

export const fetchAdminOrderById = createAsyncThunk("adminOrders/fetchOne", async (id, { rejectWithValue }) => {
  try { const res = await getAdminOrderById(id); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState: { list: [], total: 0, page: 1, limit: 10, selectedOrder: null, loading: false, error: null },
  reducers: { clearSelectedOrder: (state) => { state.selectedOrder = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchAdminOrderById.fulfilled, (state, action) => { state.selectedOrder = action.payload; });
  },
});

export const { clearSelectedOrder } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;