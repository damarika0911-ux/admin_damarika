import { Add, Delete, Edit, Visibility } from "@mui/icons-material";
import { Button, Chip, IconButton, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { useLayoutEffect, useState } from "react";
import Swal from "sweetalert2";
import withModel from "../../components/withModel";
import withTable from "../../components/withTable";
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
} from "../../services/roleSerivce";
import GlobalLoader from "../../utils/loader";

// Role interface
interface Role {
  id: number;
  role_name: string;
  view_access: boolean;
  edit_access: boolean;
  delete_access: boolean;
  create_access: boolean;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// For table rendering
interface TableRole extends Role {
  [key: string]: any;
}

// Table HOC
const Table = withTable<TableRole>(() => null);

// New `withModel` HOC usage
const RoleModal = withModel<Role>({
  name: "role",
  fields: [
    {
      name: "role_name",
      label: "Role Name",
      type: "text",
    },
    {
      name: "view_access",
      label: "View Access",
      type: "select",
      options: [
        { label: "Enabled", value: true },
        { label: "Disabled", value: false },
      ],
      halfWidth: true,
    },
    {
      name: "edit_access",
      label: "Edit Access",
      type: "select",
      options: [
        { label: "Enabled", value: true },
        { label: "Disabled", value: false },
      ],
      halfWidth: true,
    },
    {
      name: "delete_access",
      label: "Delete Access",
      type: "select",
      options: [
        { label: "Enabled", value: true },
        { label: "Disabled", value: false },
      ],
      halfWidth: true,
    },
    {
      name: "create_access",
      label: "Create Access",
      type: "select",
      options: [
        { label: "Enabled", value: true },
        { label: "Disabled", value: false },
      ],
      halfWidth: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: true },
        { label: "Inactive", value: false },
      ],
      halfWidth: true,
    },
  ],
});

function RoleManagement() {
  const [roles, setRoles] = useState<TableRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add Role");
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "create">("create");

  useLayoutEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await getRoles();
      setRoles(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRole = (role: Role) => {
    setCurrentRole(role);
    setModalTitle("View Role");
    setMode("view");
    setIsModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setCurrentRole(role);
    setModalTitle("Edit Role");
    setMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteRole = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the user.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        await deleteRole(id);
        setRoles(roles.filter((role) => role.id !== id));
      } catch (error: any) {
        Swal.fire("Error", error.response.data.message, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOpenCreateModal = () => {
    setCurrentRole({
      id: roles.length + 1,
      role_name: "",
      view_access: true,
      edit_access: false,
      delete_access: false,
      create_access: false,
      status: true,
    });
    setModalTitle("Add New Role");
    setMode("create");
    setIsModalOpen(true);
  };

  const handleSaveRole = async (roleData: Partial<Role>) => {
    try {
      setIsLoading(true);

      if (mode === "create") {
        const response = await createRole(roleData);
        setRoles([...roles, response.data.data]);
      } else if (mode === "edit" && currentRole?.id) {
        await updateRole(roleData);
        setRoles(
          roles.map((role) =>
            role.id === currentRole.id ? roleData : role
          ) as Role[]
        );
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { field: "role_name", headerName: "Role Name", flex: 1 },
    ...[
      "view_access",
      "edit_access",
      "delete_access",
      "create_access",
      "status",
    ].map((field) => ({
      field,
      headerName: field
        .replace("_", " ")
        .replace(/^\w/, (c) => c.toUpperCase()),
      flex: 1,
      renderCell: (params: any) => (
        <div
          className="w-full flex justify-center"
          style={{
            padding: "10px",
          }}
        >
          <Tooltip title={params.value ? "Active" : "Inactive"} arrow>
            <Chip
              size="small"
              label={params.value ? "Active" : "Inactive"}
              color={params.value ? "success" : "error"}
            />
          </Tooltip>
        </div>
      ),
    })),
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <div
          className="flex space-x-3"
          style={{
            alignItems: "center",
            marginTop: "5px",
          }}
        >
          <Tooltip title="View">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleViewRole(params.row);
              }}
            >
              <Visibility fontSize="small" color="info" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleEditRole(params.row);
              }}
            >
              <Edit fontSize="small" sx={{ color: "black" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteRole(params.row.id);
              }}
            >
              <Delete fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  const headerActions = (
    <Button
      variant="contained"
      style={{
        backgroundColor: "#8B4513",
      }}
      onClick={handleOpenCreateModal}
      startIcon={<Add />}
    >
      Add New Role
    </Button>
  );

  return (
    <>
      <GlobalLoader isLoading={isLoading} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6"
      >
        <Table
          data={roles}
          columns={columns}
          title="All Roles"
          isLoading={isLoading}
          showSearch={true}
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 25]}
          searchFields={["role_name"]}
          headerActions={headerActions}
        />

        <RoleModal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleSaveRole}
          initialValues={currentRole as Role}
          title={modalTitle}
          mode={mode}
        />
      </motion.div>
    </>
  );
}

export default RoleManagement;
