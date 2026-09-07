import { User } from "lucide-react";
import { ProgramType } from "../services/programService";
import withModel from "./withModel";

const ProgramModel = withModel<ProgramType>({
  name: "Program",
  defaultImage: <User className="w-12 h-12 text-gray-400" />,
  imageField: "image",
  imageHint: "Required: 1200×750px (16:10 landscape ratio)",
  imageSize: { width: 1200, height: 750 },
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
      isRequired: true,
      type: "textarea",
      halfWidth: false,
    },
    {
      name: "date",
      label: "Date",
      isRequired: true,
      type: "date",
      halfWidth: true,
    },
    {
      name: "location",
      label: "Location",
      type: "text",
      isRequired: true,
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
      name: "isUpcoming",
      label: "Is Upcoming",
      type: "select",
      halfWidth: true,
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    {
      name: "isFeatured",
      label: "Is Featured",
      type: "select",
      halfWidth: true,
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    {
      name: "availableDates",
      label: "Available Dates",
      type: "text",
      halfWidth: true,
    },
    {
      name: "sessions",
      label: "Sessions",
      type: "number",
      isRequired: true,
      rules: { required: "Sessions is required", min: 0 },
      halfWidth: true,
    },
    {
      name: "duration",
      label: "Duration",
      type: "number",
      isRequired: true,
      rules: { required: "Duration is required", min: 0 },
      halfWidth: true,
    },
    {
      name: "participants",
      label: "Participants",
      type: "number",
      isRequired: true,
      rules: { required: "Participants is required", min: 0 },
      halfWidth: true,
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
    {
      name: "modules",
      label: "Modules (Enter each module on a new line(/n))",
      type: "textarea",
      halfWidth: false,
    },
  ],
});

export default ProgramModel;
