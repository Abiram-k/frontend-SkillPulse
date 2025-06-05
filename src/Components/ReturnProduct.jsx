import React, { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import axiosInstance from "@/axiosIntercepters/AxiosInstance";
import { showToast } from "./ToastNotification";
import { useSelector } from "react-redux";

export function ReturnProduct({ item, setTrigger }) {
  const [returnDescription, setReturnDescription] = useState("");
  const [error, setError] = useState("");
  const validateReason = () => {
    const trimmedDescription = returnDescription.trim();

    if (trimmedDescription === "") {
      setError("Reason must be added");
      return false;
    } else if (trimmedDescription.length <= 8) {
      setError("Reason must be at least 8 characters long");
      return false;
    } else if (!isNaN(trimmedDescription[0])) {
      setError("Reason must start with a character");
      return false;
    }

    setError("");
    return true;
  };
  const user = useSelector((state) => state.users.user);
  const handleReturnProduct = async (e) => {
    if (!validateReason()) {
      e.preventDefault();
      return;
    }

    try {
      const response = await axiosInstance.patch(
        `/returnProduct?id=${user._id}&itemId=${item._id}`,
        { returnDescription }
      );
      setTrigger((prev) => prev + 1);
      showToast("success", response.data.message);
    } catch (error) {
      console.log(error);
      showToast("error", error?.response?.data.message);
    }
  };
  return (
    <AlertDialog className="font-mono">
      <AlertDialogTrigger asChild>
        <Button className="font-mono">Return</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="font-mono">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure to Return this product?
          </AlertDialogTitle>
          <Textarea
            type="text"
            className="text-black bg-white"
            placeholder="Reson for Return"
            value={returnDescription}
            onChange={(e) => setReturnDescription(e.target.value)}
          />
          {error && <p className="text-red-600">{error}</p>}
          <AlertDialogDescription className="text-gray-400">
            This action cannot be undone. We will notofy you once return
            confirmed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReturnProduct}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
