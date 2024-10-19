import { masterApiSlice } from "../masterApiSlice";

const sendgridApi = masterApiSlice
  .enhanceEndpoints({ addTagTypes: ["sendgrid"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      addDomainInSg: builder.mutation({
        query: (domain) => ({
          url: `/sendgrid-add-domain`,
          method: "POST",
          body: domain,
        }),
        invalidatesTags: ["sendgrid"],
      }),
    }),
  });

export const { useAddDomainInSgMutation } = sendgridApi;
