import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "./globalSlice";
import dataReducer from "./dataSlice";

const store = configureStore({
  reducer: {
    global: globalReducer,
    data: dataReducer,
  },
});

export default store;
