import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getRevenueReport } from "../components/util/api/adminApi";

export const fetchRevenue = createAsyncThunk("adminRevenue/fetch", async (_, { rejectWithValue }) => {
  try { const res = await getRevenueReport(); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Error"); }
});

const adminRevenueSlice = createSlice({
  name: "adminRevenue",
  initialState: { daily: [], monthly: [], yearly: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenue.pending, (state) => { state.loading = true; })
      .addCase(fetchRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.daily = action.payload.daily;
        state.monthly = action.payload.monthly;
        state.yearly = action.payload.yearly;
      })
      .addCase(fetchRevenue.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default adminRevenueSlice.reducer;