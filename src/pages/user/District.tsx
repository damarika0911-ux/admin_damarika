import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { Button, Chip, Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { motion } from "framer-motion";

import { useLayoutEffect, useState } from "react";
import Swal from "sweetalert2";
import withTable from "../../components/withTable";

import DistrictModel, { DistrictType } from "../../components/DistrictModel";
import {
  createDistrict,
  deleteDistrict,
  getDistricts,
  updateDistrict,
} from "../../services/districtService";
import GlobalLoader from "../../utils/loader";

const DistrictListContent = () => {
  return null;
};

const Table = withTable(DistrictListContent);

export default function DistrictList() {
  const [district, setDistrict] = useState<DistrictType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDistrict, setCurrentDistrict] = useState<DistrictType | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [mode, setMode] = useState<"create" | "edit" | "view">("create");

  const handleOpenCreateModal = () => {
    setCurrentDistrict(null);
    setModalTitle("Add New District");
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
      Add New District
    </Button>
  );

  const handleSaveDistrict = async (districtData: Partial<DistrictType>) => {
    try {
      setIsLoading(true);
      if (mode === "create") {
        await createDistrict({
          ...districtData,
          id: districtData.id || null,
        } as Partial<DistrictType> as DistrictType);
        fetchDistrict();
      } else if (mode === "edit" && currentDistrict) {
        (await updateDistrict(
          districtData
        )) as unknown as Partial<DistrictType> as DistrictType;
        fetchDistrict();
      }

      Swal.fire(
        "Success",
        mode === "create" ? "District added!" : "District updated!",
        "success"
      );
      setIsModalOpen(false);
    } catch (error: any) {
      Swal.fire("Error", error.response.data.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPeople = (district: DistrictType) => {
    setCurrentDistrict(district);
    setModalTitle("Edit District");
    setMode("edit");
    setIsModalOpen(true);
  };

  const handleViewPeople = (district: DistrictType) => {
    setCurrentDistrict(district);
    setModalTitle("View District");
    setMode("view");
    setIsModalOpen(true);
  };

  const handleDeletePeople = async (productId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the district.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        await deleteDistrict(Number(productId));
        fetchDistrict();
        Swal.fire("Deleted!", "District has been deleted.", "success");
      } catch (error: any) {
        console.error("Error deleting district:", error);
        Swal.fire("Error", error.response.data.message, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "path", headerName: "Path", flex: 1 },
    { field: "centerX", headerName: "Center X", flex: 1 },
    { field: "centerY", headerName: "Center Y", flex: 1 },
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
  async function fetchDistrict() {
    try {
      const response = await getDistricts();
      setDistrict(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  }
  useLayoutEffect(() => {
    fetchDistrict();
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
          data={district}
          columns={columns}
          title="All District"
          isLoading={isLoading}
          showSearch={true}
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 25]}
          searchFields={["title", "description", "badge"]}
          headerActions={headerActions}
        />

        <DistrictModel
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleSaveDistrict}
          initialValues={currentDistrict || {}}
          title={modalTitle}
          mode={mode}
        />
      </motion.div>
    </>
  );
}
