import { useState } from 'react';
import { Box, Button, FileButton, Group, Image, Loader, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

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
    if (selectedFile.size > 50 * 1024 * 1024) {
      notifications.show({
        title: 'Error',
        message: 'File size must be less than 50MB',
        color: 'red',
      });
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
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

      const response = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        body: formData,
        // No need to set Content-Type header with FormData
        // browser will set it automatically with the correct boundary
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }

      const serverUrl = 'http://localhost:4000'; // Use environment variable in production
      const imageUrl = `${serverUrl}${data.file.url}`;

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
            accept="image/png,image/jpeg,image/gif,image/webp"
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
          {file.name} ({Math.round(file.size / 1024)}KB)
        </Text>
      )}
      {loading && <Loader size="sm" mx="auto" mt="sm" />}
    </Box>
  );
}
