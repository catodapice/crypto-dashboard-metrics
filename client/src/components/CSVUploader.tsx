import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import axios from "axios";

interface CSVUploaderProps {
  onDataLoaded: (data: any[]) => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onDataLoaded }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    setError(null);

    try {
      const file = event.target.files?.[0];
      if (!file) {
        setError("No se seleccionó ningún archivo");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:5000/api/upload/csv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(true);
      onDataLoaded(response.data);

      // Limpiar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setError(
        error.response?.data?.message ||
          "Error al cargar el archivo. Por favor, inténtelo de nuevo."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Cargar Historial de Transacciones (CSV)
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFileIcon />}
          disabled={uploading}
        >
          Seleccionar Archivo CSV
          <input
            type="file"
            accept=".csv,.txt"
            hidden
            onChange={handleUpload}
          />
        </Button>
        {uploading && <CircularProgress size={24} />}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Archivo procesado correctamente.
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Sube un archivo CSV con el historial de transacciones de BitMEX.
      </Typography>
    </Box>
  );
};

export default CSVUploader;
