import { masterApiSlice } from "../masterApiSlice";

const domainsApi = masterApiSlice
  .enhanceEndpoints({ addTagTypes: ["Domains"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getAllDomains: builder.query({
        query: () => "/domains",
        providesTags: ["Domains"],
      }),
    }),
  });

export const { useGetAllDomainsQuery } = domainsApi;
