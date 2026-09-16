import { queryOptions } from "@tanstack/react-query";
import { getArchaelogicals } from "./archaelogicalSerivce";
import { getContacts } from "./contactFrom";
import { getDistricts } from "./districtService";
import { getPeoples } from "./peopleService";
import { getProductCategories } from "./productCategorySerivce";
import { getProducts } from "./productService";
import { getPrograms } from "./programService";
import { getRoles } from "./roleSerivce";
import { getAllUsers } from "./userService";

// API responses use { data: { data: T[] } }; keep that legacy shape at the
// transport boundary so components only ever receive an array.
const list = (request: () => Promise<{ data: { data?: any[] } }>) =>
  async (): Promise<any[]> => (await request()).data?.data ?? [];

export const adminQueries = {
  users: () => queryOptions({ queryKey: ["admin", "users"], queryFn: list(getAllUsers) }),
  products: () => queryOptions({ queryKey: ["admin", "products"], queryFn: list(getProducts) }),
  categories: () => queryOptions({ queryKey: ["admin", "categories"], queryFn: list(getProductCategories) }),
  programs: () => queryOptions({ queryKey: ["admin", "programs"], queryFn: list(getPrograms) }),
  roles: () => queryOptions({ queryKey: ["admin", "roles"], queryFn: list(getRoles) }),
  people: () => queryOptions({ queryKey: ["admin", "people"], queryFn: list(getPeoples) }),
  districts: () => queryOptions({ queryKey: ["admin", "districts"], queryFn: list(getDistricts) }),
  sites: () => queryOptions({ queryKey: ["admin", "sites"], queryFn: list(getArchaelogicals) }),
  contacts: () => queryOptions({ queryKey: ["admin", "contacts"], queryFn: list(getContacts) }),
};
