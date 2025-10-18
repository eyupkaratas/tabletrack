import { Button } from "@/components/ui/button";

interface AddTableButtonProps {
  onAdded: () => void; // Parent’tan gelecek callback
}

const AddTableButton = ({ onAdded }: AddTableButtonProps) => {
  const addTable = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to add table");
      /* console.log("Table added successfully "); */

      onAdded();
    } catch (error) {
      console.error("Error adding table:", error);
    }
  };

  return (
    <Button variant="outline" className="cursor-pointer" onClick={addTable}>
      Add Table
    </Button>
  );
};

export default AddTableButton;
