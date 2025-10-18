import { Button } from "@/components/ui/button";

interface DeleteTableButtonProps {
  onDeleted: () => void; // Parenttan gelecek callback
}
const DeleteTableButton = ({ onDeleted }: DeleteTableButtonProps) => {
  const deleteTable = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tables/last`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to add table");
      /* console.log("Table deleted successfully "); */

      onDeleted();
    } catch (error) {
      console.error("Error deleting table:", error);
    }
  };
  return (
    <Button
      variant="destructive"
      className="cursor-pointer"
      onClick={deleteTable}
    >
      Delete Last Table
    </Button>
  );
};

export default DeleteTableButton;
