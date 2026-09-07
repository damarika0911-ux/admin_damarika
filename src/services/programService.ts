import http from "../../httpclient";
import { PROGRAM_LIST } from "../../urlconst";
import { Image } from "./userService";
export type ProgramType = {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  link: string;
  status: boolean;
  isUpcoming: boolean;
  image: Image;
  isFeatured: boolean;
  availableDates: string;
  sessions: number;
  duration: number;
  participants: number;
  modules: string;
}
export const getPrograms = () => {
    return http.get(PROGRAM_LIST);
};

export const createProgram = (data: any) => {
    return http.post(PROGRAM_LIST, data);
};

export const updateProgram = (data: any) => {
    return http.put(`${PROGRAM_LIST}/${data.id}`, data);
};

export const deleteProgram = (id: number) => {
    return http.delete(`${PROGRAM_LIST}/${id}`);
};