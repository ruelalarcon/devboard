import { useRef, useState } from 'react';
import { Box, Button, FileButton, Group, Image, Text, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { uploadConfig } from '../../config/upload';

interface ReplyFormProps {
  onSubmit: (content: string, file: File | null) => Promise<void>;
  onCancel?: () => void;
  initialContent?: string;
  isLoading?: boolean;
  placeholder?: string;
}

export function ReplyForm({
  onSubmit,
  onCancel,
  initialContent = '',
  isLoading = false,
  placeholder = 'Write your reply...',
}: ReplyFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const resetRef = useRef<() => void>(null);

  const form = useForm({
    initialValues: {
      content: initialContent,
    },
    validate: {
      content: (value) => (value.length < 1 ? 'Content cannot be empty' : null),
    },
  });

  const handleSubmit = async (values: { content: string }) => {
    await onSubmit(values.content, file);
    form.reset();
    clearFile();
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      return;
    }

    // Check file size
    if (selectedFile.size > uploadConfig.maxFileSize) {
      notifications.show({
        title: 'Error',
        message: `File size must be less than ${uploadConfig.formatFileSize(uploadConfig.maxFileSize)}`,
        color: 'red',
      });
      return;
    }

    // Check file type
    if (!uploadConfig.allowedFileTypes.mimeTypes.includes(selectedFile.type)) {
      notifications.show({
        title: 'Error',
        message: 'Only image files (JPEG, PNG, GIF, WEBP) are allowed',
        color: 'red',
      });
      return;
    }

    setFile(selectedFile);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    resetRef.current?.();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Textarea
        placeholder={placeholder}
        minRows={2}
        maxRows={20}
        autosize
        mb="sm"
        {...form.getInputProps('content')}
      />

      {preview && (
        <Box mb="sm">
          <Image src={preview} alt="Preview" height={150} fit="contain" radius="md" />
          <Button variant="subtle" color="red" size="xs" onClick={clearFile} mt="xs">
            Remove Image
          </Button>
        </Box>
      )}

      <Group justify="flex-end">
        {onCancel && (
          <Button variant="subtle" size="xs" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <FileButton
          onChange={handleFileChange}
          accept={uploadConfig.allowedFileTypes.mimeTypes.join(',')}
          resetRef={resetRef}
        >
          {(props) => (
            <Button variant="subtle" size="xs" {...props}>
              {file ? 'Change Image' : 'Add Image'}
            </Button>
          )}
        </FileButton>
        <Button type="submit" size="xs" loading={isLoading}>
          Post
        </Button>
      </Group>

      {file && (
        <Text size="xs" ta="right" mt="xs" c="dimmed">
          {file.name} ({uploadConfig.formatFileSize(file.size)})
        </Text>
      )}
    </form>
  );
}
