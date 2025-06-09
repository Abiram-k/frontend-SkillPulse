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
import { Eye, EyeOff } from "lucide-react";

export function ChangePassword({ id }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({});
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      if (
        newPassword === currentPassword &&
        newPassword.trim() &&
        currentPassword.trim() &&
        !error.confirmPassword &&
        !error.newPassword
      ) {
        error.confirmPassword = "New password looks similar like current one!";
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
        const response = await axios.patch(`/password`, {
          currentPassword,
          newPassword,
        });
        // const response = await axios.patch(`/password/${id}`, {
        //   currentPassword,
        //   newPassword,
        // });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setOpen(false);
        Toast.fire({
          icon: "success",
          title: `${response.data.message}`,
        });
      }
    } catch (error) {
      console.log("Change password error: ", error);
      Toast.fire({
        icon: "error",
        title: `${error?.response.data.message}`,
      });
    }
  };
  return (
    <Dialog className="mt-5" open={open} onOpenChange={setOpen}>
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
          <div className="grid grid-cols-4 items-center gap-4 relative">
            <Label htmlFor="username" className="text-right">
              Password
            </Label>
            <Input
              id="username"
              placeholder="Password"
              className="col-span-3 text-black bg-white rounded"
              value={newPassword}
              type={showPassword ? "text" : "password"}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <span
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          {message.newPassword && (
            <p className="text-red-600">{message.newPassword}</p>
          )}

          <div className="grid grid-cols-4 items-center gap-4 relative">
            <Label htmlFor="username" className="text-right">
              Confirm Password
            </Label>
            <Input
              id="username"
              placeholder=" Confirm Password"
              className="col-span-3 text-black bg-white rounded"
              value={confirmPassword}
              type={showConfirmPassword ? "text" : "password"}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <span
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          {message.confirmPassword && (
            <p className="text-red-600 ">{message.confirmPassword}</p>
          )}
        </div>
        <DialogFooter className={" font-mono font-bold"}>
          <Button
            type="submit"
            className={"bg-blue-500 hover:bg-blue-600 font-bold rounded"}
            onClick={handleChangePassword}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
