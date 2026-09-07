import http from "../../httpclient";
import { CONTACT_FORM } from "../../urlconst";

export const getContacts = () => {
    return http.get(CONTACT_FORM);
};

export const createContact = (data: any) => {
    return http.post(CONTACT_FORM, data);
};

export const updateContact = (data: any) => {
    return http.put(`${CONTACT_FORM}/${data.id}`, data);
};

export const replyContact = (data: any) => {
    return http.put(`${CONTACT_FORM}/reply/${data.id}`, data);
};


export const deleteContact = (id: number) => {
    return http.delete(`${CONTACT_FORM}/${id}`);
};