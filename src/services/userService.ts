import axios from "axios";
import http from '../../httpclient';
import { ADMIN, CREATE_USER, USER_DETAILS, USER_FORM } from '../../urlconst';
// export const baseURL = import.meta.env.VITE_APP_DEP_URL;
export const baseURL = (import.meta.env.VITE_APP_DEP_URL || (import.meta.env.DEV ? "http://localhost:3000" : "https://api.damarika.in")).replace(/\/+$/, "");
export const apiUrl = `${baseURL}/api`;
export const login = (email: string, password: string) => {
  return axios.post(`${apiUrl}/auth/login`, { email, password });
};

export type Image = {
  message: string;
  url: string;
}


export type UserType = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  status: boolean;
  role_id: number;
  role_name: string;
  image: Image | string;
  user_verify: string;
};


export type RoleType = {
  id: number;
  role_name: string;
  status: boolean;
};

type Create_User_List = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phoneNumber?: string;
  role_id: number;
  roleData?: any;
  image: string;
}

export const getRoles = () => {
  return axios.get(`${apiUrl}/auth/roles`);
}

export const register = (data: UserType, name?: string) => {
  var store = {
    name: data.name,
    email: data.email,
    password: data.password,
    phoneNumber: data.phoneNumber,
    image: data.image,
    role_id: data.role_id
  }
  if (name === "admin") {
    return http.post(`${USER_FORM}`, data);
  }
  else {
    return axios.post(`${apiUrl}/auth/register`, store);
  }
};
export const createUser = (data: Create_User_List) => {
  return http.post(`${apiUrl}${CREATE_USER}`, data);
};
export const getAllUsers = () => {
  return http.get(`${ADMIN}/admins`);
}

export const deleteUser = (id: string) => {
  return http.delete(`${ADMIN}/${id}`);
}

export const updateUser = (data: any) => {
  return http.put(`${ADMIN}/${data.id}`, data);
}
export const userDataDetails = () => {
  return http.get(`${USER_DETAILS}`);
};
