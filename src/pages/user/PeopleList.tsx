import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { Button, Chip, Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { motion } from "framer-motion";

import { useLayoutEffect, useState } from "react";
import Swal from "sweetalert2";
import PeopleModel, { PeopleType } from "../../components/PeopleModel";
import withTable from "../../components/withTable";
import {
  createPeople,
  deletePeople,
  getPeoples,
  updatePeople,
} from "../../services/peopleService";
import GlobalLoader from "../../utils/loader";

const PeopleListContent = () => {
  return null;
};

const Table = withTable(PeopleListContent);

export default function PeopleList() {
  const [people, setPeople] = useState<PeopleType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPeople, setCurrentPeople] = useState<PeopleType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [mode, setMode] = useState<"create" | "edit" | "view">("create");

  const handleOpenCreateModal = () => {
    setCurrentPeople(null);
    setModalTitle("Add New People");
    setMode("create");
    setIsModalOpen(true);
  };

  const headerActions = (
    <Button
      variant="contained"
      onClick={handleOpenCreateModal}
      style={{
        backgroundColor: "#8B4513",
      }}
    >
      Add New People
    </Button>
  );

  const handleSavePeople = async (peopleData: Partial<PeopleType>) => {
    try {
      setIsLoading(true);
      // Ensure social_links is stored as a JSON string
      const socialLinks = peopleData.social_links
        ? typeof peopleData.social_links === "string"
          ? peopleData.social_links
          : JSON.stringify(peopleData.social_links)
        : "[]";

      const image = typeof peopleData.image === "string"
        ? peopleData.image
        : peopleData.image?.url;

      if (mode === "create") {
        const response = await createPeople({
          ...peopleData,
          image,
          social_links: socialLinks,
          id: peopleData.id || null,
        } as Partial<PeopleType> as PeopleType);
        setPeople([...people, response.data.data]);
      } else if (mode === "edit" && currentPeople) {
        await updatePeople({
          ...peopleData,
          image,
          social_links: socialLinks,
        } as Partial<PeopleType> as PeopleType);
        setPeople(
          people.map((p) =>
            p.id === peopleData.id ? ({ ...peopleData } as PeopleType) : p
          )
        );
      }

      Swal.fire(
        "Success",
        mode === "create" ? "User added!" : "User updated!",
        "success"
      );
      setIsModalOpen(false);
    } catch (error: any) {
      Swal.fire("Error", error.response.data.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPeople = (product: PeopleType) => {
    setCurrentPeople(product);
    setModalTitle("Edit User");
    setMode("edit");
    setIsModalOpen(true);
  };

  const handleViewPeople = (product: PeopleType) => {
    setCurrentPeople(product);
    setModalTitle("View User");
    setMode("view");
    setIsModalOpen(true);
  };

  const handleDeletePeople = async (productId: string) => {
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
        await deletePeople(Number(productId));
        setPeople(
          people.filter((u) => u.id !== (productId as unknown as number))
        );
        Swal.fire("Deleted!", "User has been deleted.", "success");
      } catch (error: any) {
        Swal.fire("Error", error.response.data.message, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "title", headerName: "Title", flex: 1 },
    { field: "mobile", headerName: "Mobile", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
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
          <Tooltip title={params.value ? "ACTIVE" : "DEACTIVE"} arrow>
            <Chip
              label={params.value ? "Active" : "Inactive"}
              color={params.value ? "success" : "error"}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <div
          className="flex space-x-3"
          style={{
            alignItems: "center",
            marginTop: "15px",
          }}
        >
          <Tooltip title="View" arrow>
            <button
              className="text-blue-500 hover:text-blue-700 flex items-center space-x-1"
              onClick={(e) => {
                e.stopPropagation();
                handleViewPeople(params.row);
              }}
            >
              <RemoveRedEyeIcon fontSize="small" />
            </button>
          </Tooltip>
          <Tooltip title="Edit" arrow>
            <button
              className="text-black hover:text-black-700 flex items-center space-x-1"
              onClick={(e) => {
                e.stopPropagation();
                handleEditPeople(params.row);
              }}
            >
              <EditIcon fontSize="small" />
            </button>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <button
              className="text-red-500 hover:text-red-700 flex items-center space-x-1"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePeople(params.row.id);
              }}
            >
              <DeleteIcon fontSize="small" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  useLayoutEffect(() => {
    async function fetchProducts() {
      try {
        const response = await getPeoples();
        setPeople(response.data.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchProducts();
  }, []);

  return (
    <>
      <GlobalLoader isLoading={isLoading} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6"
      >
        <Table
          data={people}
          columns={columns}
          title="All People"
          isLoading={isLoading}
          showSearch={true}
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 25]}
          searchFields={["name", "title", "email", "mobile"]}
          headerActions={headerActions}
        />

        <PeopleModel
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleSavePeople}
          initialValues={currentPeople || {}}
          title={modalTitle}
          mode={mode}
        />
      </motion.div>
    </>
  );
}
