import { Button } from "@/Components/ui/button";

import "./component.css";
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
import { Toast } from "./Toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function ChangePassword({ id }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({});

  const navigate = useNavigate();

  const handleFormError = () => {
    const error = {};
    if (currentPassword.length < 8)
      error.currentPassword = "Enter correct password";
    else if (currentPassword.trim() == "")
      error.currentPassword = "Enter you current password";
    if (newPassword.length < 8)
      error.newPassword = "Password must be 8 charecters *";
    else if (newPassword.trim() == "")
      error.newPassword = "password must be valid charecters *";
    else if (!/[a-z]/.test(newPassword))
      error.newPassword =
        "Password must include at least one lowercase letter.";
    else if (!/[0-9]/.test(newPassword))
      error.newPassword = "Password must include at least one number.";
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword))
      error.newPassword =
        "Password must include at least one special character.";

    if (confirmPassword.length < 8)
      error.confirmPassword = "Password must be 8 charecters *";
    else if (confirmPassword.trim() == "")
      error.confirmPassword = "password must be valid charecters *";

    if (confirmPassword !== newPassword)
      error.confirmPassword = "Password not matching";

    if (confirmPassword === newPassword) {
      if (newPassword === currentPassword) {
        error.confirmPassword = "This password has already been used once.";
      }
    }

    return error;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const formError = handleFormError();
    if (Object.keys(formError).length > 0) {
      setMessage(formError);
      return;
    } else {
      setMessage({});
    }
    try {
      if (Object.keys(formError).length == 0) {
        const response = await axios.patch(`/password/${id}`, {
          currentPassword,
          newPassword,
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        window.location.reload();
        Toast.fire({
          icon: "success",
          title: `${response.data.message}`,
        });
      }
    } catch (error) {
      console.log(error);
      Toast.fire({
        icon: "error",
        title: `${error?.response.data.message}`,
      });
    }
  };
  return (
    <Dialog className="mt-5">
      <DialogTrigger asChild>
        <Button variant="outline" className="font-mono">
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-mono">Edit profile</DialogTitle>
          <DialogDescription className="font-mono">
            You can change password here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 font-mono">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Current Password
            </Label>
            <Input
              id="name"
              placeholder="Current Password"
              className="col-span-3 text-black bg-white rounded"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          {message.currentPassword && (
            <p className="text-red-600">{message.currentPassword}</p>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Password
            </Label>
            <Input
              id="username"
              placeholder="Password"
              className="col-span-3 text-black bg-white rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          {message.newPassword && (
            <p className="text-red-600">{message.newPassword}</p>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Confirm Password
            </Label>
            <Input
              id="username"
              placeholder=" Confirm Password"
              className="col-span-3 text-black bg-white rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {message.confirmPassword && (
            <p className="text-red-600 ">{message.confirmPassword}</p>
          )}
        </div>
        <DialogFooter className={" font-mono font-bold"}>
          <Button
            type="submit"
            className={"bg-blue-500 font-bold rounded"}
            onClick={handleChangePassword}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
