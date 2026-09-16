import http from "../../httpclient";
import { optimizeImageForUpload } from "../utils/imageOptimization";

export const uploadImage = async (file: File, name: string) => {
    const optimized = await optimizeImageForUpload(file);
    const formData = new FormData();
    formData.append("image", optimized);
    formData.append("name", name);

    try {
        const response = await http.post("/upload", formData);
        return response.data;
    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
};
