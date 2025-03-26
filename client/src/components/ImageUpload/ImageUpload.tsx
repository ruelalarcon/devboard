import { useState } from 'react';
import { Box, Button, FileButton, Group, Image, Loader, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { uploadConfig } from '../../config/upload';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
}

export function ImageUpload({ onImageUploaded }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(uploadConfig.uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }

      // Convert the relative path to a full URL
      const imageUrl = uploadConfig.getFullUrl(data.file.url);

      onImageUploaded(imageUrl);
      notifications.show({
        title: 'Success',
        message: 'Image uploaded successfully',
        color: 'green',
      });

      // Reset state
      setFile(null);
      setPreview(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to upload image',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <Box>
      <Group justify="center" mt="md">
        {!preview ? (
          <FileButton
            onChange={handleFileChange}
            accept={uploadConfig.allowedFileTypes.mimeTypes.join(',')}
          >
            {(props) => <Button {...props}>Select Image</Button>}
          </FileButton>
        ) : (
          <Box>
            <Image
              src={preview}
              alt="Preview"
              radius="md"
              width={200}
              fallbackSrc="https://placehold.co/200x150?text=Preview"
            />
            <Group justify="center" mt="sm">
              <Button size="xs" color="red" onClick={handleRemove}>
                Remove
              </Button>
              <Button size="xs" onClick={handleUpload} loading={loading}>
                Upload
              </Button>
            </Group>
          </Box>
        )}
      </Group>
      {file && (
        <Text size="sm" ta="center" mt="sm">
          {file.name} ({uploadConfig.formatFileSize(file.size)})
        </Text>
      )}
      {loading && <Loader size="sm" mx="auto" mt="sm" />}
    </Box>
  );
}
