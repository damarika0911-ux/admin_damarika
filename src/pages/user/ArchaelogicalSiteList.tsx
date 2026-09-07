import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { Button, Chip, Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { motion } from "framer-motion";

import { useLayoutEffect, useState } from "react";
import Swal from "sweetalert2";
import withTable from "../../components/withTable";

import ArchaelogicalSiteModel, {
  ArchaeologicalSiteType,
} from "../../components/ArchaelogicalSiteModel";
import {
  createArchaelogical,
  deleteArchaelogical,
  getArchaelogicals,
  updateArchaelogical,
} from "../../services/archaelogicalSerivce";
import GlobalLoader from "../../utils/loader";

const ArchealogicalSiteListContent = () => {
  return null;
};

const Table = withTable(ArchealogicalSiteListContent);

export default function ArchaelogicalSiteList() {
  const [archaeologicalSite, setArcheologicalSite] = useState<
    ArchaeologicalSiteType[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentArcheologicalSite, setCurrentArcheologicalSite] =
    useState<ArchaeologicalSiteType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [mode, setMode] = useState<"create" | "edit" | "view">("create");

  const handleOpenCreateModal = () => {
    setCurrentArcheologicalSite(null);
    setModalTitle("Add New Archeological Site");
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
      Add New Archeological Site
    </Button>
  );

  const handleSavePeople = async (
    archaelogicalSiteData: Partial<ArchaeologicalSiteType>
  ) => {
    try {
      setIsLoading(true);
      if (mode === "create") {
        await createArchaelogical({
          ...archaelogicalSiteData,
          image:
            typeof archaelogicalSiteData.image === "string"
              ? archaelogicalSiteData.image
              : archaelogicalSiteData.image?.url,
          id: archaelogicalSiteData.id || null,
        });
        fetchArcheologicalSite();
      } else if (mode === "edit" && currentArcheologicalSite) {
        await updateArchaelogical({
          ...archaelogicalSiteData,
          image:
            typeof archaelogicalSiteData.image === "string"
              ? archaelogicalSiteData.image
              : archaelogicalSiteData.image?.url,
        } as ArchaeologicalSiteType);

        fetchArcheologicalSite();
      }

      Swal.fire(
        "Success",
        mode === "create"
          ? "Archeological Site added!"
          : "Archeological Site updated!",
        "success"
      );
      setIsModalOpen(false);
    } catch (error: any) {
      Swal.fire("Error", error.response.data.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditArcheologicalSite = (
    archaelogicalSiteData: ArchaeologicalSiteType
  ) => {
    setCurrentArcheologicalSite(archaelogicalSiteData);
    setModalTitle("Edit Archeological Site");
    setMode("edit");
    setIsModalOpen(true);
  };

  const handleViewArcheologicalSite = (
    archaelogicalSiteData: ArchaeologicalSiteType
  ) => {
    setCurrentArcheologicalSite(archaelogicalSiteData);
    setModalTitle("View Archeological Site");
    setMode("view");
    setIsModalOpen(true);
  };

  const handleDeleteArcheologicalSite = async (productId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the Archeological Site.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        await deleteArchaelogical(Number(productId));
        fetchArcheologicalSite();
        Swal.fire(
          "Deleted!",
          "Archeological Site has been deleted.",
          "success"
        );
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
    { field: "description", headerName: "Description", flex: 2 },
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
                handleViewArcheologicalSite(params.row);
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
                handleEditArcheologicalSite(params.row);
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
                handleDeleteArcheologicalSite(params.row.id);
              }}
            >
              <DeleteIcon fontSize="small" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  async function fetchArcheologicalSite() {
    try {
      const response = await getArchaelogicals();
      setArcheologicalSite(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }

  useLayoutEffect(() => {
    fetchArcheologicalSite();
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
          data={archaeologicalSite}
          columns={columns}
          title="All Users"
          isLoading={isLoading}
          showSearch={true}
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 25]}
          searchFields={["title", "description", "badge"]}
          headerActions={headerActions}
        />

        <ArchaelogicalSiteModel
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleSavePeople}
          initialValues={currentArcheologicalSite || {}}
          title={modalTitle}
          mode={mode}
        />
      </motion.div>
    </>
  );
}
