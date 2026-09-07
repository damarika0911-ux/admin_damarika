import { User } from "lucide-react";
import {
  CACHE_DURATION,
  ROLE_CACHE_KEY,
  ROLE_CACHE_TIME_KEY,
} from "../../urlconst";
import { getRoles } from "../services/roleSerivce";
import { RoleType, UserType } from "../services/userService";
import withModel from "./withModel";

const UserModal = withModel<UserType>({
  name: "User",
  defaultImage: <User className="w-12 h-12 text-gray-400" />,
  imageField: "image", // key from UserType for image preview & upload
  fields: [
    {
      name: "name",
      label: "Name",
      isRequired: true,
      halfWidth: true,
      type: "text",
    },
    {
      name: "email",
      label: "Email",
      isRequired: true,
      halfWidth: true,
      type: "email",
      rules: {
        required: "Email is required",
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Enter a valid email address",
        },
      },
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      isRequired: true,
      halfWidth: true,
      type: "text",
    },
    {
      name: "role_id",
      label: "Role",
      type: "select",
      isRequired: true,
      halfWidth: true,
      fetchOptions: async () => {
        const now = new Date().getTime();
        const lastFetchTime = parseInt(
          localStorage.getItem(ROLE_CACHE_TIME_KEY) || "0",
          10
        );
        const cachedData = localStorage.getItem(ROLE_CACHE_KEY);
        if (cachedData && now - lastFetchTime < CACHE_DURATION) {
          return JSON.parse(cachedData);
        }

        const res = await getRoles();
        const roles: { label: string; value: number }[] = res.data.data
          .filter((role: RoleType) => role.status === true)
          .map((role: RoleType) => ({
            label:
              role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1),
            value: parseInt(role.id.toString(), 10),
          }));
        localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(roles));
        localStorage.setItem(ROLE_CACHE_TIME_KEY, now.toString());

        return roles;
      },
    },
    {
      name: "password",
      label: "Password",
      isRequired: true,
      type: "password",
      halfWidth: true,
      rules: {
        minLength: {
          value: 12,
          message: "Minimum length is 12 characters",
        },
        maxLength: {
          value: 72,
          message: "Maximum length is 72 characters",
        },
      },
    },
    {
      name: "user_verify",
      label: "User Verify",
      type: "select",
      halfWidth: true,
      options: [
        { label: "Verified", value: "verified" },
        { label: "Not Verified", value: "not verified" },
      ],
    },

    {
      name: "status",
      label: "Status",
      type: "select",
      halfWidth: true,
      options: [
        { label: "Active", value: true },
        { label: "Inactive", value: false },
      ],
    },
  ],
});

export default UserModal;
