import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/Components/ui/sheet";

export const ChangeAddress = ({ addresses = [], onSelectedAddress }) => {
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0]._id);
    }
  }, [addresses, selectedAddress]);

  const handleAddressChange = (e) => {
    const selectedId = e.target.value;
    setSelectedAddress(selectedId);
    if (onSelectedAddress) {
      onSelectedAddress(selectedId);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="text-yellow">
          Change Address
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-gray-900 p-4 rounded-lg shadow-md border-none ">
        <SheetHeader className="font-mono ">
          <SheetTitle>Select Address</SheetTitle>
          <SheetDescription className="text-gray-600">
            Choose the address you want to use.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <div
                key={address._id}
                className="fle items-center gap-4 p-4 bg-gray-200 rounded-xl"
              >
                <Label
                  htmlFor={`address-${address._id}`}
                  className="text-sm font-semibold text-gray-800"
                >
                  {address.address}{" "}
                  <span className="text-gray-400">[{address.type}]</span>
                </Label>
                <Input
                  type="radio"
                  id={`address-${address._id}`}
                  name="address"
                  value={address._id}
                  checked={selectedAddress === address._id}
                  onChange={handleAddressChange}
                  className="w-4 h-4"
                  aria-label={`Select ${address.type} address`}
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500">No addresses available. Please add one.</p>
          )}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              type="submit"
              disabled={!selectedAddress}
              className={`font-mono rounded ${
                selectedAddress ? "bg-red-700" : "bg-gray-400"
              } text-white`}
            >
              Save Address
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

ChangeAddress.propTypes = {
  addresses: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      type: PropTypes.string,
    })
  ),
  onSelectedAddress: PropTypes.func,
};
