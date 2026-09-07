import http from "../../httpclient";
import { PEOPLE_LIST } from "../../urlconst";

export const getPeoples = () => {
    return http.get(PEOPLE_LIST);
};

export const createPeople = (data: any) => {
    return http.post(PEOPLE_LIST, data);
};

export const updatePeople= (data: any) => {
    return http.put(`${PEOPLE_LIST}/${data.id}`, data);
};

export const deletePeople = (id: number) => {
    return http.delete(`${PEOPLE_LIST}/${id}`);
};