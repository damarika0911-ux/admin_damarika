import { User } from "lucide-react";
import { Image } from "../services/userService";
import withModel from "./withModel";

export type ProductCategoryType = {
  id: number;
  title: string;
  description: string;
  status: boolean;
  image: Image;
};

const ProductCategoryModel = withModel<ProductCategoryType>({
  name: "Product",
  defaultImage: <User className="w-12 h-12 text-gray-400" />,
  imageField: "image",
  imageHint: "Required: 800×600px (4:3 landscape ratio)",
  imageSize: { width: 800, height: 600 },
  fields: [
    {
      name: "title",
      label: "Title",
      type: "text",
      isRequired: true,
      halfWidth: false,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      isRequired: true,
      halfWidth: false,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      halfWidth: false,
      options: [
        { label: "Active", value: true },
        { label: "Inactive", value: false },
      ],
    },
  ],
});

export default ProductCategoryModel;
