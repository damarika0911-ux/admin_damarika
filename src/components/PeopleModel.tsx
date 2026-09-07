import { User } from "lucide-react";
import { Image } from "../services/userService";
import withModel from "./withModel";

export type SocialLink = {
  platform: string;
  url: string;
};

export type PeopleType = {
  id: number;
  name: string;
  title: string;
  description: string;
  mobile: string;
  email: string;
  social_links: string | SocialLink[];
  image: Image;
  status: boolean;
};

const PeopleModel = withModel<PeopleType>({
  name: "People",
  defaultImage: <User className="w-12 h-12 text-gray-400" />,
  imageField: "image",
  imageHint: "Required: 400×533px (3:4 portrait ratio)",
  imageSize: { width: 400, height: 533 },
  fields: [
    {
      name: "name",
      label: "Name",
      type: "text",
      isRequired: true,
      halfWidth: true,
    },
    {
      name: "title",
      label: "Title",
      type: "text",
      isRequired: true,
      halfWidth: true,
    },
    {
      name: "mobile",
      label: "Mobile Number",
      type: "text",
      isRequired: false,
      halfWidth: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      isRequired: false,
      halfWidth: true,
    },
    {
      name: "description",
      label: "Description",
      isRequired: true,
      type: "textarea",
      halfWidth: false,
    },
    {
      name: "social_links",
      label: "Social Media Links",
      type: "social_links",
      isRequired: false,
      halfWidth: false,
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

export default PeopleModel;
