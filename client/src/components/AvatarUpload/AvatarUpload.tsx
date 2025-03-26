import { useState } from 'react';
import { Avatar, Box, Button, FileButton, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { uploadConfig } from '../../config/upload';

interface AvatarUploadProps {
  currentAvatar?: string;
  displayName: string;
  onAvatarUploaded: (imageUrl: string) => Promise<void>;
  size?: string;
}

export function AvatarUpload({
  currentAvatar,
  displayName,
  onAvatarUploaded,
  size = 'xl',
}: AvatarUploadProps) {
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
        credentials: 'include',
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        throw new Error(`Server returned an invalid response format: ${text.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }

      // Convert the relative path to a full URL
      const imageUrl = uploadConfig.getFullUrl(data.file.url);

      await onAvatarUploaded(imageUrl);

      notifications.show({
        title: 'Success',
        message: 'Avatar updated successfully',
        color: 'green',
      });

      // Reset state
      setFile(null);
      setPreview(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to upload avatar',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Group justify="center" mt="md">
        {!preview ? (
          <>
            <Avatar src={currentAvatar} radius="xl" size={size} color="blue" mb="md">
              {displayName ? displayName.charAt(0).toUpperCase() : '?'}
            </Avatar>
            <Box>
              <FileButton
                onChange={handleFileChange}
                accept={uploadConfig.allowedFileTypes.mimeTypes.join(',')}
              >
                {(props) => <Button {...props}>Select Image</Button>}
              </FileButton>
            </Box>
          </>
        ) : (
          <>
            <Box ta="center">
              <Avatar src={preview} radius="xl" size={size} mb="md" />
              <Group justify="center" mt="md">
                <Button size="xs" color="red" onClick={() => setPreview(null)}>
                  Cancel
                </Button>
                <Button size="xs" onClick={handleUpload} loading={loading}>
                  Update Avatar
                </Button>
              </Group>
            </Box>
          </>
        )}
      </Group>
      {file && (
        <Text size="sm" ta="center" mt="sm">
          {file.name} ({uploadConfig.formatFileSize(file.size)})
        </Text>
      )}
    </Box>
  );
}
