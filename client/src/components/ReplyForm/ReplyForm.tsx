import { Button, Group, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';

interface ReplyFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  initialContent?: string;
  isLoading?: boolean;
}

export function ReplyForm({
  onSubmit,
  onCancel,
  initialContent = '',
  isLoading = false,
}: ReplyFormProps) {
  const form = useForm({
    initialValues: {
      content: initialContent,
    },
    validate: {
      content: (value) => (value.length < 1 ? 'Reply cannot be empty' : null),
    },
  });

  const handleSubmit = async (values: { content: string }) => {
    await onSubmit(values.content);
    form.reset();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Textarea
        placeholder="Write your reply..."
        minRows={2}
        mb="sm"
        {...form.getInputProps('content')}
      />
      <Group justify="flex-end">
        <Button variant="subtle" size="xs" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="xs" loading={isLoading}>
          Post Reply
        </Button>
      </Group>
    </form>
  );
}
