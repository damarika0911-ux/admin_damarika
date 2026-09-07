import http from "../../httpclient";
import { DISTRICT_LIST } from "../../urlconst";

export const getDistricts = () => {
    return http.get(DISTRICT_LIST);
};

export const createDistrict = (data: any) => {
    return http.post(DISTRICT_LIST, data);
};

export const updateDistrict = (data: any) => {
    return http.put(`${DISTRICT_LIST}/${data.id}`, data);
};

export const deleteDistrict = (id: number) => {
    return http.delete(`${DISTRICT_LIST}/${id}`);
};