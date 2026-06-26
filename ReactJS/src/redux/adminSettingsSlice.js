import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getSystemSettings, updateSystemSettings } from "../components/util/api/adminApi";

export const fetchSystemSettings = createAsyncThunk("adminSettings/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await getSystemSettings();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Error");
  }
});

export const saveSystemSettings = createAsyncThunk("adminSettings/save", async (data, { rejectWithValue }) => {
  try {
    const res = await updateSystemSettings(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Error");
  }
});

const adminSettingsSlice = createSlice({
  name: "adminSettings",
  initialState: { items: [], loading: false, saving: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveSystemSettings.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveSystemSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.items = action.payload;
      })
      .addCase(saveSystemSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export default adminSettingsSlice.reducer;
