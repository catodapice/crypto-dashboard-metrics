import React, { useState } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";

export interface DebugPanelProps {
  data: any;
  title: string;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ data, title }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="subtitle1">{title}</Typography>
        <Button size="small" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Ocultar" : "Mostrar"}
        </Button>
      </Box>

      {expanded && (
        <Box
          component="pre"
          sx={{
            p: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: 1,
            overflow: "auto",
            maxHeight: "400px",
          }}
        >
          {JSON.stringify(data, null, 2)}
        </Box>
      )}
    </Paper>
  );
};

export default DebugPanel;
