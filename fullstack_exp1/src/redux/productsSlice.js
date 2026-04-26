import { createSlice } from "@reduxjs/toolkit";

const productsSlice = createSlice({
  name: "products",
  initialState: [],
  reducers: {
    addProduct: (state, action) => {
      state.push(action.payload);
    },
    removeProduct: (state, action) => {
      return state.filter(p => p.id !== action.payload);
    }
  }
});

export const { addProduct, removeProduct } = productsSlice.actions;
export default productsSlice.reducer;
