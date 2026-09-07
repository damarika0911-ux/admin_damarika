import ReplyIcon from "@mui/icons-material/Reply";
import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useLayoutEffect, useState } from "react";
import Swal from "sweetalert2";
import { getContacts, replyContact } from "../services/contactFrom";
import withTable from "./withTable";

// Types
interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isReplied: boolean;
  repliedMessage?: string;
  replyDate?: string;
}

interface ReplyFormData {
  replyText: string;
}

const ContactSystem: React.FC = () => {
  const UserListContent = () => null;
  const Table = withTable(UserListContent);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(false);
  }, []);
  const [messages, setMessages] = useState<Message[]>([]);

  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<number | null>(null);
  const [replyData, setReplyData] = useState<ReplyFormData>({ replyText: "" });
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "reciever_email", headerName: "Email", flex: 1 },
    { field: "subject", headerName: "Subject", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      align: "center",
      renderCell: (params: { row: Message }) => (
        <div style={{ marginTop: "10px" }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: params.row.isReplied ? "primary" : "#8B4513",
            }}
            onClick={() => handleReplyClick(params.row.id)}
            startIcon={<ReplyIcon />}
          >
            {params.row.isReplied ? "View Reply" : "Reply"}
          </Button>
        </div>
      ),
    },
  ];

  const handleReplyClick = (id: number) => {
    const message = messages.find((msg) => msg.id === id);
    if (message) {
      setCurrentMessageId(id);
      setReplyData({ replyText: message.repliedMessage || "" });
      setOpenReplyDialog(true);
    }
  };

  const handleReplyChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setReplyData({ ...replyData, replyText: event.target.value });
  };

  const submitReply = async () => {
    if (currentMessageId === null) return;
    try {
    await replyContact({
      id: currentMessageId,
      reply: replyData.replyText,
    });
    fetchMessages();
    setSuccessSnackbarOpen(true);
    setOpenReplyDialog(false);
    setReplyData({ replyText: "" });
    setCurrentMessageId(null);
    } catch (error: any) {
      Swal.fire("Reply not sent", error.response?.data?.message || "Unable to send the reply", "error");
    }
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await getContacts();
      setMessages(response.data.data);
    } catch (error: any) {
      Swal.fire("Error", error.response.data.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    fetchMessages();
  }, []);

  const handleCloseReplyDialog = () => {
    setOpenReplyDialog(false);
  };

  const handleSnackbarClose = () => {
    setSuccessSnackbarOpen(false);
  };

  const getCurrentMessage = () =>
    messages.find((msg) => msg.id === currentMessageId);

  return (
    <Fade in={true} timeout={500}>
      <div style={{ padding: "2rem" }}>
        <Table
          data={messages}
          columns={columns}
          title="Contact Messages"
          isLoading={isLoading}
          showSearch={true}
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 25]}
          searchFields={["name", "email"]}
        />

        <Dialog
          open={openReplyDialog}
          onClose={handleCloseReplyDialog}
          fullWidth
        >
          <DialogTitle>
            {getCurrentMessage()?.isReplied ? "View Reply" : "Reply to Message"}
          </DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
              <strong>From:</strong> {getCurrentMessage()?.name} (
              {getCurrentMessage()?.email})
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              <strong>Subject:</strong> {getCurrentMessage()?.subject}
            </Typography>
            <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
              <strong>Message:</strong> {getCurrentMessage()?.message}
            </Typography>

            {getCurrentMessage()?.isReplied ? (
              <>
                <Typography variant="caption">
                  <strong>Replied on:</strong> {getCurrentMessage()?.replyDate}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {getCurrentMessage()?.repliedMessage}
                </Typography>
              </>
            ) : (
              <TextField
                autoFocus
                margin="dense"
                label="Reply"
                fullWidth
                multiline
                rows={4}
                value={replyData.replyText}
                onChange={handleReplyChange}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReplyDialog} sx={{ color: "#000000" }}>
              Cancel
            </Button>
            {!getCurrentMessage()?.isReplied && (
              <Button
                onClick={submitReply}
                color="primary"
                variant="contained"
                style={{
                  backgroundColor: "#8B4513",
                }}
                startIcon={<SendIcon />}
              >
                Send Reply
              </Button>
            )}
          </DialogActions>
        </Dialog>

        <Snackbar
          open={successSnackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            Reply sent successfully!
          </Alert>
        </Snackbar>
      </div>
    </Fade>
  );
};

export default ContactSystem;
