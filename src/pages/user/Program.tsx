import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { Button, Chip, Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { motion } from "framer-motion";
import { useLayoutEffect, useState } from "react";
import Swal from "sweetalert2";
import ProgramModel from "../../components/ProgramModel";
import withTable from "../../components/withTable";
import {
  createProgram,
  deleteProgram,
  getPrograms,
  ProgramType,
  updateProgram,
} from "../../services/programService";
import GlobalLoader from "../../utils/loader";

// Component passed to HOC
const ProgramListContent = () => null;

// Wrapped table component
const Table = withTable(ProgramListContent);

export default function ProgramList() {
  const [programs, setPrograms] = useState<ProgramType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add Program");
  const [currentProgram, setCurrentProgram] = useState<ProgramType | null>(
    null
  );
  const [mode, setMode] = useState<"view" | "edit" | "create">("create");

  const columns: GridColDef[] = [
    { field: "title", headerName: "Title", flex: 1 },
    {
      field: "isUpcoming",
      headerName: "Upcoming",
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
              label={params.value ? "Yes" : "No"}
              color={params.value ? "success" : "error"}
              size="small"
            />
          </Tooltip>
        </div>
      ),
    },
    {
      field: "isFeatured",
      headerName: "Featured",
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
              label={params.value ? "Yes" : "No"}
              color={params.value ? "success" : "error"}
              size="small"
            />
          </Tooltip>
        </div>
      ),
    },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
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
              label={params.value ? "Active" : "Deactive"}
              color={params.value ? "success" : "error"}
              size="small"
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
          className="flex space-x-3 "
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
                handleViewProgram(params.row);
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
                handleEditProgram(params.row);
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
                handleDeleteProgram(params.row.id);
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
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      const response = await getPrograms();
      const data = response.data.data;
      setPrograms(data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProgram = (program: ProgramType) => {
    setCurrentProgram({ ...program });
    setModalTitle("View Program");
    setMode("view");
    setIsModalOpen(true);
  };

  const handleEditProgram = (program: ProgramType) => {
    setCurrentProgram({ ...program });
    setModalTitle("Edit Program");
    setMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteProgram = async (programId: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the program.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        await deleteProgram(programId);
        setPrograms(programs.filter((p) => p.id !== programId));
        Swal.fire("Deleted!", "Program has been deleted.", "success");
      } catch (error: any) {
        Swal.fire("Error", error.response.data.message, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOpenCreateModal = () => {
    setCurrentProgram(null);
    setModalTitle("Add New Program");
    setMode("create");
    setIsModalOpen(true);
  };

  const handleSaveProgram = async (programData: Partial<ProgramType>) => {
    try {
      setIsLoading(true);

      const image = typeof programData.image === "string"
        ? programData.image
        : programData.image?.url;

      if (mode === "create") {
        await createProgram({
          ...programData,
          image,
        } as unknown as ProgramType);
        fetchPrograms();
      } else if (mode === "edit" && currentProgram && programData.id) {
        await updateProgram({
          ...programData,
          image,
        } as unknown as ProgramType);
        fetchPrograms();
      }

      Swal.fire(
        "Success",
        mode === "create" ? "Program added!" : "Program updated!",
        "success"
      );
      setIsModalOpen(false);
    } catch (error: any) {
      Swal.fire("Error", error.response.data.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const headerActions = (
    <Button
      variant="contained"
      onClick={handleOpenCreateModal}
      style={{
        backgroundColor: "#8B4513",
      }}
    >
      Add New Program
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
          data={programs}
          columns={columns}
          title="All Programs"
          isLoading={isLoading}
          showSearch={true}
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 25]}
          searchFields={["title", "location", "description"]}
          headerActions={headerActions}
        />

        <ProgramModel
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleSaveProgram}
          initialValues={currentProgram || {}}
          title={modalTitle}
          mode={mode}
        />
      </motion.div>
    </>
  );
}
