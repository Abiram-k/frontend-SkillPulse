import { Button } from "@/Components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";

import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import axios from "@/axiosIntercepters/AxiosInstance";
import { Edit } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Toast } from "./Toast";
import { showToast } from "./ToastNotification";

export const ChangeStatus = ({
  updatedState,
  orderId = "",
  productId = "",
  currentStatus = "",
}) => {
  const [updatedStatus, setUpdatedStatus] = useState("");
  const [open, setOpen] = useState(false);
  const user = useSelector((state) => state.users.user);

  const handleChangeStatus = async () => {
    updatedState(updatedStatus,productId);
    try {
      const response = await axios.patch(`/admin/status?id=${user?._id}`, {
        orderId,
        productId,
        updatedStatus,
      });
      showToast("success", response.data.message);
      // window.location.reload();
      setOpen(false);
    } catch (error) {
      console.log(error);
      setOpen(false);
      Toast.fire({
        icon: "error",
        title: `${error?.response.data.message}`,
      });
    }
  };

  return (
    <Dialog className="mt-5" open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="font-mono border-none">
          <Edit className="text-blue-500 cursor-pointer" size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-mono">Edit order status</DialogTitle>
          <DialogDescription className="font-mono">
            You can change status here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 font-mono">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currentPassword" className="text-right">
              Select Status
            </Label>
            <select
              id="currentPassword"
              className="col-span-3 text-black border border-gray-300 rounded p-2"
              value={updatedStatus}
              onChange={(e) => setUpdatedStatus(e.target.value)}
            >
              {/* {currentStatus == "processing" && (
                <option value="processing">processing</option>
              )} */}
              <option value="" disabled hidden>
                Select status
              </option>
              {currentStatus == "processing" && (
                <option value="shipped">shipped</option>
              )}

              {currentStatus == "shipped" && (
                <option value="delivered">delivered</option>
              )}

              {(currentStatus != "returned" ||
                currentStatus != "delivered") && (
                <option value="cancelled">cancelled</option>
              )}

              {/* {currentStatus !== "returned" ||
                (currentStatus !== "cancelled" && (
                  <option value="returned">returned</option>
                ))} */}
            </select>
          </div>
        </div>
        <DialogFooter className={" font-mono font-bold"}>
          <Button
            type="submit"
            className={"bg-red-500 inline-block"}
            onClick={handleChangeStatus}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
