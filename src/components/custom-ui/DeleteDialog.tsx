import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string[]) => void;
  title?: string;
  message?: string;
  id?: string[];
  itemType?: string;
}

export default function DeleteDialog({
  open,
  onOpenChange,
  onDelete,
  title,
  message,
  id = [],
  itemType = "item",
}: DeleteDialogProps) {
  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleDelete = () => {
    onDelete(id);
    onOpenChange(false);
  };

  const pluralize = (word: string, count: number) => {
    if (count === 1) return word;
    return word.endsWith("s") ? word : `${word}s`;
  };

  const isPlural = id.length !== 1;
  const displayType = pluralize(itemType, id.length);

  const computedMessage =
    message ||
    `Are you sure you want to delete ${
      isPlural ? "these" : "this"
    } ${displayType}? This action cannot be undone.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{computedMessage}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            className="text-white bg-red-500 hover:bg-red-600">
            Delete {id.length} {displayType}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
