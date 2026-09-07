import http from "../../httpclient";
import { PRODUCT_CATEGORY_LIST } from "../../urlconst";
import { ProductCategoryType } from "../components/ProductCategoryModel";

export const getProductCategories = () => {
    return http.get(PRODUCT_CATEGORY_LIST);
};

export const createProductCategory = (data: ProductCategoryType) => {
    return http.post(PRODUCT_CATEGORY_LIST, data);
};

export const updateProductCategory = (data: any) => {
    return http.put(`${PRODUCT_CATEGORY_LIST}/${data.id}`, data);
};

export const deleteProductCategory = (id: number) => {
    return http.delete(`${PRODUCT_CATEGORY_LIST}/${id}`);
};