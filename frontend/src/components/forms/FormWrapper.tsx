import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

interface FormWrapperProps {
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  maxWidth?: number;
}

const FormWrapper: React.FC<FormWrapperProps> = ({
  title,
  children,
  onSubmit,
  onCancel,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  isLoading = false,
  maxWidth = 600,
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth,
        mx: 'auto',
        mt: 2,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{ mt: 3 }}
      >
        {children}
        
        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 4, justifyContent: 'flex-end' }}
        >
          {onCancel && (
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          )}
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isLoading}
            loadingPosition="start"
          >
            {submitText}
          </LoadingButton>
        </Stack>
      </Box>
    </Paper>
  );
};

export default FormWrapper;
