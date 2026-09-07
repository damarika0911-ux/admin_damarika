import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { Button, Chip, Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

import { useLayoutEffect, useState } from "react";
import Swal from "sweetalert2";
import ProductModel, { ProductType } from "../../components/ProductModel";
import withTable from "../../components/withTable";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../../services/productService";
import GlobalLoader from "../../utils/loader";

const ProductListContent = () => {
  return null;
};

const Table = withTable(ProductListContent);

export default function ProductList() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductType | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [mode, setMode] = useState<"create" | "edit" | "view">("create");

  const handleOpenCreateModal = () => {
    setCurrentProduct(null);
    setModalTitle("Add New Product");
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
      Add New Product
    </Button>
  );

  const handleSaveProduct = async (productData: Partial<ProductType>) => {
    try {
      setIsLoading(true);
      const image = typeof productData.image === "string"
        ? productData.image
        : productData.image?.url;

      if (mode === "create") {
        const data: ProductType = {
          ...productData,
          id: productData.id || (uuidv4() as string),
          image,
        } as unknown as ProductType;
        await createProduct(data);
      } else if (mode === "edit" && currentProduct) {
        await updateProduct({
          ...productData,
          image,
        } as unknown as ProductType);
      }

      Swal.fire(
        "Success",
        mode === "create" ? "Product added!" : "Product updated!",
        "success"
      );
      await fetchProducts();
      setIsModalOpen(false);
    } catch (error: any) {
      Swal.fire("Error", error.response.data.message, "error");
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product: ProductType) => {
    setCurrentProduct(product);
    setModalTitle("Edit User");
    setMode("edit");
    setIsModalOpen(true);
  };

  const handleViewProduct = (product: ProductType) => {
    setCurrentProduct(product);
    setModalTitle("View User");
    setMode("view");
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
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
        await deleteProduct(Number(productId));
        setProducts(
          products.filter((u) => u.id !== (productId as unknown as number))
        );
        Swal.fire("Deleted!", "User has been deleted.", "success");
      } catch (error: any) {
        console.error("Error deleting user:", error);
        Swal.fire("Error", error.response.data.message, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: "title", headerName: "Product Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "badge", headerName: "Badge", flex: 1 },
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
                handleViewProduct(params.row);
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
                handleEditProduct(params.row);
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
                handleDeleteProduct(params.row.id);
              }}
            >
              <DeleteIcon fontSize="small" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];
  async function fetchProducts() {
    try {
      const response = await getProducts();
      setProducts(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }

  useLayoutEffect(() => {
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
          data={products}
          columns={columns}
          title="All Products"
          isLoading={isLoading}
          showSearch={true}
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 25]}
          searchFields={["title", "description", "badge"]}
          headerActions={headerActions}
        />

        <ProductModel
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleSaveProduct}
          initialValues={currentProduct || {}}
          title={modalTitle}
          mode={mode}
        />
      </motion.div>
    </>
  );
}
