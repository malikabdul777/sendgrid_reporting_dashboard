import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isGenerating: false,
  currentStep: "",
  steps: [],
  completedSteps: [],
  error: null,
};

export const mimeSlice = createSlice({
  name: "mime",
  initialState,
  reducers: {
    startGeneration: (state, action) => {
      state.isGenerating = true;
      state.steps = action.payload;
      state.currentStep = action.payload[0]; // Set first step as current
      state.completedSteps = [];
      state.error = null;
    },
    updateProgress: (state, action) => {
      const newStep = action.payload;

      // If we have a previous step, mark it as completed
      if (state.currentStep && state.currentStep !== newStep) {
        if (!state.completedSteps.includes(state.currentStep)) {
          state.completedSteps.push(state.currentStep);
        }
      }

      // Set the new current step
      state.currentStep = newStep;
    },
    completeGeneration: (state) => {
      // Add the final step to completed steps before resetting
      if (
        state.currentStep &&
        !state.completedSteps.includes(state.currentStep)
      ) {
        state.completedSteps.push(state.currentStep);
      }
      state.isGenerating = false;
      state.currentStep = "";
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isGenerating = false;
    },
    resetProgress: (state) => {
      return initialState;
    },
  },
});

export const {
  startGeneration,
  updateProgress,
  completeGeneration,
  setError,
  resetProgress,
} = mimeSlice.actions;

export default mimeSlice.reducer;
