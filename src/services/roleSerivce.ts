import http from "../../httpclient";
import { ROLE_LIST } from "../../urlconst";

export const getRoles = () => {
    return http.get(ROLE_LIST);
};

export const createRole = (data: any) => {
    return http.post(ROLE_LIST, data);
}

export const updateRole = (data: any) => {
    return http.put(`${ROLE_LIST}/${data.id}`, data);
}

export const getRoleByName = (name: string) => {
    return http.get(`${ROLE_LIST}/name/${name}`);
}

export const deleteRole = (id: number) => {
    return http.delete(`${ROLE_LIST}/${id}`);
}

export const getRoleById = (id: number) => {
    return http.get(`${ROLE_LIST}/${id}`);
}

