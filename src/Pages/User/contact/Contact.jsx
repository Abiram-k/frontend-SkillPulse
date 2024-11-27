import React, { useEffect, useState } from "react";
const web3key = import.meta.env.VITE_WEB3_API_KEY;
import {
  Facebook,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  Clock,
  Rocket,
  Truck,
  CreditCard,
  Youtube,
} from "lucide-react";
import { Toast } from "@/Components/Toast";

const Contact = () => {
  const [spinner, setSpinner] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState({});
  const validateForm = () => {
    let error = {};

    // Name validation

    if (name.trim() === "") {
      error.name = "Name is required";
    } else if (name.length < 2) {
      error.name = "Name must be at least 2 characters long";
    }

    // Email validation
    if (email.trim() === "") {
      error.email = "Email is required";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      error.email = "Invalid email format";
    }

    if (phone.trim() === "") {
      error.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      error.phone = "Phone number must be 10 digits";
    }

    if (message.trim() === "") {
      error.message = "Message is required";
    } else if (message.length < 10) {
      error.message = "Message must be at least 10 characters long";
    }

    return error;
  };
  useEffect(() => {
    setEmail("");
    setName("");
    setMessage("");
    setPhone("")
  }, []);
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formErrors = validateForm();
      if (Object.keys(formErrors).length > 0) {
        setError(formErrors);
        return;
      }
      setSpinner(true);
      const formData = new FormData(event.target);

      formData.append("access_key", web3key);

      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);
      if (Object.keys(formErrors).length == 0) {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: json,
        }).then((res) => res.json());

        if (res.success) {
          setSpinner(false);
          Toast.fire({
            icon: "success",
            title: `${"Form submitted successfully"}`,
          });
        }
      }
    } catch (error) {
      setSpinner(false);
      console.error(error);
      Toast.fire({
        icon: "error",
        title: `${"Form submition failed"}`,
      });
    }
  };

  return (
    <div className="min-h-screen text-white font-mono">
      {spinner && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="max-w-2xl mx-auto mt-16 p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">CONTACT US</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-red-600 rounded-full px-4 py-2 inline-block">
              <span>Abiram4572@gmail.com</span>
            </div>
            <div className="flex space-x-4 ms-9 lg:ms-14">
              <a href="#" className="hover:text-red-500">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-red-500">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-red-500">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Enter name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-1.5 bg-transparent border-b border-gray-600 focus:border-red-500 outline-none"
            />
            {error.name && <p className="text-red-600">{error.name}</p>}
            <input
              type="email"
              placeholder="Enter email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-1.5 bg-transparent border-b border-gray-600 focus:border-red-500 outline-none"
            />
            {error.email && <p className="text-red-600">{error.email}</p>}

            <input
              type="tel"
              placeholder="Enter mobile number"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-1.5 bg-transparent border-b border-gray-600 focus:border-red-500 outline-none"
            />
            {error.phone && <p className="text-red-600">{error.phone}</p>}

            <textarea
              placeholder="Message"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-1.5 bg-transparent border-b border-gray-600 focus:border-red-500 outline-none"
              rows={3}
            />
            {error.message && <p className="text-red-600">{error.message}</p>}

            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-1.5 rounded-full hover:bg-red-700 transition-colors"
            >
              Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
