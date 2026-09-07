import http from "../../httpclient";

export const uploadImage = async (file: File, name: string) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", name);

    try {
        const response = await http.post("/upload", formData);
        return response.data;
    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
};
