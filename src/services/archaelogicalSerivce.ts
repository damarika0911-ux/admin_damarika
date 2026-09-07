import http from "../../httpclient";
import { ARCHAEOLOGICAL_LIST } from "../../urlconst";

export const getArchaelogicals = () => {
    return http.get(ARCHAEOLOGICAL_LIST);
};

export const createArchaelogical = (data: any) => {
    return http.post( ARCHAEOLOGICAL_LIST, data);
};

export const updateArchaelogical = (data: any) => {
    return http.put(`${ARCHAEOLOGICAL_LIST}/${data.id}`, data);
};

export const deleteArchaelogical = (id: number) => {
    return http.delete(`${ARCHAEOLOGICAL_LIST}/${id}`);
};