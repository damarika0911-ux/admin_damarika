import http from "../../httpclient";
import { PRODUCT_LIST } from "../../urlconst";
import { ProductType } from "../components/ProductModel";

export const getProducts = () => {
    return http.get(PRODUCT_LIST);
};

export const createProduct = (data: ProductType) => {
    return http.post(PRODUCT_LIST, data);
};

export const updateProduct = (data: ProductType) => {
    return http.put(`${PRODUCT_LIST}/${data.id}`, data);
};

export const deleteProduct = (id: number) => {
    return http.delete(`${PRODUCT_LIST}/${id}`);
};

export const uploadImage = (image: File, name: string) => {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("name", name);

    return http.post("/upload", formData);
};
