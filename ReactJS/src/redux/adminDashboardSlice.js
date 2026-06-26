import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getDashboardStats } from "../components/util/api/adminApi";

export const fetchDashboard = createAsyncThunk(
  "adminDashboard/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getDashboardStats();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState: { stats: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDashboard.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload; })
      .addCase(fetchDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default adminDashboardSlice.reducer;