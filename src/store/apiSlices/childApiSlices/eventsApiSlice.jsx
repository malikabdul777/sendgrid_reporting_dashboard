import { masterApiSlice } from "../masterApiSlice";

const eventsApi = masterApiSlice
  .enhanceEndpoints({ addTagTypes: ["Events"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getDomainEvents: builder.query({
        query: ({ domain, limit }) => `/events?domain=${domain}&limit=${limit}`,
        providesTags: ["Events"],
      }),
    }),
  });

export const { useGetDomainEventsQuery } = eventsApi;
