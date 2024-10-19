import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// initialize an empty api service that we'll inject endpoints into later as needed
export const masterApiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "https://sendgrid-reporting-dashboard-server.onrender.com",
  }),
  endpoints: () => ({}),
});
