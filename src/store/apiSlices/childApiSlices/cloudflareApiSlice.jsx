import { masterApiSlice } from "../masterApiSlice";

const cloudflareApi = masterApiSlice
  .enhanceEndpoints({ addTagTypes: ["cloudflare"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      addDomain: builder.mutation({
        query: (domain) => ({
          url: `/cloudflare-add-domains`,
          method: "POST",
          body: domain,
        }),
        invalidatesTags: ["cloudflare"],
      }),
      addDNSRecords: builder.mutation({
        query: (dnsRecord) => ({
          url: `/cloudflare-add-dns-record`,
          method: "POST",
          body: dnsRecord,
        }),
        invalidatesTags: ["cloudflare"],
      }),
      getDomainStatus: builder.mutation({
        query: (domain) => ({
          url: `/cloudflare-domain-status`,
          method: "POST",
          body: domain,
        }),
        invalidatesTags: ["cloudflare"],
      }),
    }),
  });

export const {
  useAddDomainMutation,
  useAddDNSRecordsMutation,
  useGetDomainStatusMutation,
} = cloudflareApi;
