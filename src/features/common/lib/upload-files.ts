import { axiosInstance } from "@/api/mutator/custom-instance";

export async function uploadFiles(
  resource: string,
  id: number,
  files: File[],
) {
  await Promise.all(
    files.map((file) => {
      const formData = new FormData();
      formData.append("file", file);
      return axiosInstance.post(`/s3/${resource}/${id}`, formData);
    }),
  );
}
