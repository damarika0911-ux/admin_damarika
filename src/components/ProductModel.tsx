import { Image as ImageIcon } from "lucide-react";
import { CACHE_DURATION, CACHE_KEY, CACHE_TIME_KEY } from "../../urlconst";
import { getProductCategories } from "../services/productCategorySerivce";
import { Image } from "../services/userService";
import withModel from "./withModel";

export type ProductType = {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  price: number;
  image: Image;
  badge: string;
  link: string;
  status: boolean;
};

export type CategoryType = {
  id: number;
  title: string;
};

const ProductModel = withModel<ProductType>({
  name: "Product",
  defaultImage: <ImageIcon className="w-12 h-12 text-gray-400" />,
  imageField: "image",
  imageHint: "Required: 800×600px (4:3 landscape ratio)",
  imageSize: { width: 800, height: 600 },
  fields: [
    {
      name: "title",
      label: "Title",
      type: "text",
      rules: { required: "Title is required" },
      halfWidth: false,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      halfWidth: false,
    },
    {
      name: "price",
      label: "Price",
      type: "number",
      isRequired: true,
      halfWidth: true,
    },
    {
      name: "badge",
      label: "Badge",
      type: "text",
      halfWidth: true,
    },
    {
      name: "link",
      label: "Link",
      type: "text",
      isRequired: true,
      halfWidth: true,
    },
    {
      name: "categoryId",
      label: "Category",
      type: "select",
      isRequired: true,
      halfWidth: true,
      fetchOptions: async () => {
        const now = Date.now();
        const cached = localStorage.getItem(CACHE_KEY);
        const cacheTime = parseInt(
          localStorage.getItem(CACHE_TIME_KEY) || "0",
          10
        );

        if (cached && now - cacheTime < CACHE_DURATION) {
          return JSON.parse(cached);
        }

        const res = await getProductCategories();
        const categories: { label: string; value: number }[] =
          res.data.data.map((category: CategoryType) => ({
            label: category.title,
            value: parseInt(category.id.toString(), 10),
          }));

        localStorage.setItem(CACHE_KEY, JSON.stringify(categories));
        localStorage.setItem(CACHE_TIME_KEY, now.toString());

        return categories;
      },
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

export default ProductModel;
