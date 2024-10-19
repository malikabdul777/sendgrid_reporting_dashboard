import { masterApiSlice } from "../masterApiSlice";

const categoriesApi = masterApiSlice
  .enhanceEndpoints({ addTagTypes: ["Categories"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getAllCategories: builder.query({
        query: () => "/categories",
        providesTags: ["Categories"],
      }),
      createCategory: builder.mutation({
        query: (account) => ({
          url: "/categories",
          method: "POST",
          body: account,
        }),
        invalidatesTags: ["Categories"],
      }),
      deleteCategory: builder.mutation({
        query: (id) => ({
          url: `/categories/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Categories"],
      }),
    }),
  });

export const {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
