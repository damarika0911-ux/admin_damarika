import { Delete, Edit, Visibility } from "@mui/icons-material";
import { Button, Chip, IconButton, Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { motion } from "framer-motion";
import { useLayoutEffect, useState } from "react";
import Swal from "sweetalert2";
import UserModal from "../../components/UserModal";
import withTable from "../../components/withTable";
import {
  deleteUser,
  getAllUsers,
  register,
  updateUser,
  UserType,
} from "../../services/userService";
import GlobalLoader from "../../utils/loader";

// Component passed to HOC
const UserListContent = () => null;

// Wrapped table component
const Table = withTable(UserListContent);

export default function UserList() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add User");
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "create">("create");

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "role_name",
      headerName: "Role",
      flex: 1,
      renderCell: (params) => {
        const val = params.value || "N/A";
        return (
          <div
            className="w-full flex justify-center"
            style={{
              padding: "10px",
            }}
          >
            <Chip label={val.charAt(0).toUpperCase() + val.slice(1)} />
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <div
          className="w-full flex justify-center"
          style={{
            padding: "10px",
          }}
        >
          <Chip
            label={params.value ? "Active" : "Inactive"}
            color={params.value ? "success" : "error"}
          />
        </div>
      ),
    },
    {
      field: "user_verify",
      headerName: "User Verify",
      flex: 1,
      renderCell: (params) => {
        return (
          <div
            className="w-full flex justify-center"
            style={{ padding: "10px" }}
          >
            <Chip
              label={params.value === "verified" ? "Verified" : "Not verified"}
              color={params.value === "verified" ? "success" : "error"}
            />
          </div>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex space-x-3 mt-2">
          <Tooltip title="View">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleViewUser(params.row);
              }}
            >
              <Visibility fontSize="small" color="info" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleEditUser(params.row);
              }}
            >
              <Edit fontSize="small" sx={{ color: "black" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteUser(params.row.id);
              }}
            >
              <Delete fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  useLayoutEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getAllUsers();
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUser = (user: UserType) => {
    setCurrentUser({ ...user });
    setModalTitle("View User");
    setMode("view");
    setIsModalOpen(true);
  };

  const handleEditUser = (user: UserType) => {
    setCurrentUser({ ...user });
    setModalTitle("Edit User");
    setMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
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
        await deleteUser(userId);
        setUsers(users.filter((u) => u.id !== userId));
        Swal.fire("Deleted!", "User has been deleted.", "success");
      } catch (error: any) {
        Swal.fire("Error", error.response.data.message, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOpenCreateModal = () => {
    setCurrentUser(null);
    setModalTitle("Add New User");
    setMode("create");
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userData: Partial<UserType>) => {
    try {
      setIsLoading(true);
      if (mode === "create") {
        console.log(userData);
        const data: UserType = {
          ...userData,
          role_id: userData.role_id,
          image:
            typeof userData.image === "string"
              ? userData.image
              : userData.image?.url,
          id: userData.id || "",
        } as unknown as UserType;
        await register(data, "admin");
        await fetchUsers();
      } else if (mode === "edit" && currentUser && userData.id) {
        await updateUser({
          ...userData,
          id: userData.id ?? "",
          image:
            typeof userData.image === "string"
              ? userData.image
              : userData.image?.url,
          role_name: userData.role_name,
        });
        await fetchUsers();
      }

      Swal.fire(
        "Success",
        mode === "create" ? "User added!" : "User updated!",
        "success"
      );
      setIsModalOpen(false);
    } catch (error: any) {
      Swal.fire("Error", error.response.data.message, "error");
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const headerActions = (
    <Button
      variant="contained"
      style={{
        backgroundColor: "#8B4513",
      }}
      onClick={handleOpenCreateModal}
    >
      Add New User
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
          data={users}
          columns={columns}
          title="All Users"
          isLoading={isLoading}
          showSearch={true}
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 25]}
          searchFields={["name", "email", "role_name"]}
          headerActions={headerActions}
        />

        <UserModal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleSaveUser}
          initialValues={currentUser || {}}
          title={modalTitle}
          mode={mode}
        />
      </motion.div>
    </>
  );
}
