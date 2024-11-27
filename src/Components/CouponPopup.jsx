import React, { useEffect, useState } from "react";
import { X, Copy } from "lucide-react";
import { Button } from "@/Components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import axios from "@/axiosIntercepters/AxiosInstance";

export const CouponPopup = ({ onClose, getCoupons, totalAmount }) => {
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [maxDiscount, setMaxDiscount] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [purchaseAmount, setPurchaseAmount] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const { toast } = useToast();
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axios.get("/coupon");
        console.log(response?.data, "Coupons for management");
        setCoupons(response?.data);
      } catch (error) {
        console.log(error);
        toast({
          title: "Error",
          description:
            error?.response?.data?.message || "Failed to fetch coupons.",
          variant: "destructive",
        });
      }
    };
    fetchCoupons();
  }, [toast]);

  const handleSelectedCoupon = (value) => {
    setSelectedCoupon(value);
    const coupon = coupons.find((coupon, index) => coupon._id == value);
    setMaxDiscount(coupon ? coupon.maxDiscount : null);
    setPurchaseAmount(coupon ? coupon.purchaseAmount : null);
    setCouponCode(coupon ? coupon.couponCode : null);
  };

  const handleApply = () => {
    getCoupons(selectedCoupon, maxDiscount, purchaseAmount, couponCode);
    if (selectedCoupon) {
      const coupon = coupons.find((c) => c._id === selectedCoupon);
      if (coupon) {
        toast({
          title: "Coupon Applied",
          description: `${coupon.couponCode} - ${coupon.description}`,
        });
        onClose();
      }
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Coupon Copied",
      description: `${code} has been copied to your clipboard.`,
    });
  };

  return (
    // <Card className="w-[550px] relative bg-gray-300 p-6 rounded-lg shadow-lg border border-red-500">
    //   <Button
    //     className="absolute top-2 right-2 text-red-600"
    //     variant="ghost"
    //     size="icon"
    //     onClick={onClose}
    //   >
    //     <X className="h-4 w-4" />
    //   </Button>
    //   <CardHeader className="text-red-700">
    //     <CardTitle>Available Coupons</CardTitle>
    //     <CardDescription className="text-gray-600">
    //       Select a coupon to apply to your order.
    //     </CardDescription>
    //   </CardHeader>
    //   <CardContent>
    //     <RadioGroup
    //       value={selectedCoupon || ""}
    //       onValueChange={handleSelectedCoupon}
    //       className="bg-red-600 p-4 rounded-lg space-y-4"
    //     >
    //       <CardContent>
    //         <RadioGroup
    //           value={selectedCoupon || ""}
    //           onValueChange={handleSelectedCoupon}
    //           className="bg-red-600 p-4 rounded-lg space-y-4"
    //         >
    //           {coupons.filter(
    //             (coupon) =>
    //               parseInt(totalAmount) >= coupon.purchaseAmount 
    //             &&
    //               new Date(coupon.expirationDate).setHours(0, 0, 0, 0) >=
    //                 new Date().setHours(0, 0, 0, 0)
    //           ).length > 0 ? (
    //             coupons
    //               .filter((coupon) => totalAmount >= coupon.purchaseAmount)
    //               .map((coupon) => (
    //                 <div
    //                   key={coupon._id}
    //                   className="flex items-center justify-between p-2 bg-red-100 rounded-lg shadow-sm"
    //                 >
    //                   <div className="flex items-center space-x-3">
    //                     <RadioGroupItem
    //                       value={coupon._id}
    //                       id={coupon._id}
    //                       className="bg-white border-red-300"
    //                     />
    //                     <Label htmlFor={coupon._id} className="cursor-pointer">
    //                       <span className="font-semibold text-lg text-red-700">
    //                         {coupon.couponCode}
    //                       </span>
    //                       <span className="block text-sm text-gray-700">
    //                         {coupon.description}
    //                       </span>
    //                     </Label>
    //                   </div>
    //                   <Button
    //                     variant="outline"
    //                     size="icon"
    //                     onClick={() => handleCopy(coupon.couponCode)}
    //                     className="text-red-600 border-red-300"
    //                   >
    //                     <Copy className="h-4 w-4" />
    //                   </Button>
    //                 </div>
    //               ))
    //           ) : (
    //             <p className="text-white">
    //               No coupons available for your current total amount !
    //             </p>
    //           )}
    //         </RadioGroup>
    //       </CardContent>
    //     </RadioGroup>
    //   </CardContent>
    //   <CardFooter className="flex justify-between mt-4">
    //     <Button
    //       variant="outline"
    //       onClick={() => setSelectedCoupon(null)}
    //       className="text-red-600 border-red-300"
    //     >
    //       Clear
    //     </Button>
    //     <Button
    //       onClick={handleApply}
    //       disabled={!selectedCoupon}
    //       className="text-white bg-red-600 hover:bg-red-700"
    //     >
    //       Apply
    //     </Button>
    //   </CardFooter>
    // </Card>
    <Card className="w-[550px] relative bg-red-300 mx-2 p-6 rounded-lg shadow-lg border border-red-300">
    <Button
      className="absolute top-2 right-2 text-red-600"
      variant="ghost"
      size="icon"
      onClick={onClose}
    >
      <X className="h-4 w-4" />
    </Button>
    <CardHeader className="text-red-700">
      <CardTitle className="text-xl font-semibold">Available Coupons</CardTitle>
      <CardDescription className="text-gray-700 text-sm">
        Select a coupon to apply to your order.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {coupons.filter(
        (coupon) =>
          parseInt(totalAmount) >= coupon.purchaseAmount &&
          new Date(coupon.expirationDate).setHours(0, 0, 0, 0) >=
            new Date().setHours(0, 0, 0, 0)
      ).length > 0 ? (
        <RadioGroup
          value={selectedCoupon || ""}
          onValueChange={handleSelectedCoupon}
          className="space-y-4"
        >
          {coupons
            .filter(
              (coupon) =>
                totalAmount >= coupon.purchaseAmount &&
                new Date(coupon.expirationDate).setHours(0, 0, 0, 0) >=
                  new Date().setHours(0, 0, 0, 0)
            )
            .map((coupon) => (
              <div
                key={coupon._id}
                className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={coupon._id}
                    id={coupon._id}
                    className="bg-red-50 border-red-300"
                  />
                  <Label htmlFor={coupon._id} className="cursor-pointer">
                    <span className="font-medium text-red-700 text-lg">
                      {coupon.couponCode}
                    </span>
                    <span className="block text-sm text-gray-600">
                      {coupon.description}
                    </span>
                  </Label>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(coupon.couponCode)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
        </RadioGroup>
      ) : (
        <p className="text-gray-700 font-medium text-center">
          No coupons available for your current total amount!
        </p>
      )}
    </CardContent>
    <CardFooter className="flex justify-between mt-6">
      <Button
        variant="outline"
        onClick={() => setSelectedCoupon(null)}
        className="text-red-600 border-red-300 hover:bg-red-50"
      >
        Clear
      </Button>
      <Button
        onClick={handleApply}
        disabled={!selectedCoupon}
        className="text-white bg-red-600 hover:bg-red-700"
      >
        Apply
      </Button>
    </CardFooter>
  </Card>
  
  );
};
