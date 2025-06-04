import { Button, Label, TextInput, Select } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";
import axiosInstance from "../../../utils/axios";

const AuthRegister = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [departemen, setDepartemen] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password.length < 10) {
      setError("Password minimal 10 karakter.");
      setIsLoading(false);
      return;
    }
    if (!departemen) {
      setError("Departemen wajib diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/register", {
        username,
        email,
        departemen,
        password,
      });

      console.log("Registration successful:", response.data);
      alert("Registrasi berhasil! Silakan login.");
      navigate("/auth/login"); 
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.response && err.response.data && err.response.data.errors) {
        // Menampilkan pesan error validasi dari backend
        const backendErrors = err.response.data.errors.map((e: any) => e.msg).join(", ");
        setError(`Registrasi gagal: ${backendErrors}`);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(`Registrasi gagal: ${err.response.data.message}`);
      } else {
        setError("Registrasi gagal. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">
            {error}
          </div>
        )}
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="username" value="Username" />
          </div>
          <TextInput
            id="username"
            type="text"
            sizing="md"
            required
            className="form-control form-rounded-xl"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="email" value="Email Address" />
          </div>
          <TextInput
            id="email"
            type="email"
            sizing="md"
            required
            className="form-control form-rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="departemen" value="Departemen" />
          </div>
          <Select
            id="departemen"
            required
            value={departemen}
            onChange={(e) => setDepartemen(e.target.value)}
            className="form-control form-rounded-xl w-full" 
          >
            <option value="">Pilih Departemen</option>
            <option value="Admin">Admin</option>
            <option value="JPL">JPL</option>
            <option value="JXP">JXP</option>
            <option value="GRM">GRM</option>
          </Select>
        </div>
        <div className="mb-6">
          <div className="mb-2 block">
            <Label htmlFor="password" value="Password" />
          </div>
          <TextInput
            id="password"
            type="password"
            sizing="md"
            required
            className="form-control form-rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Password minimal 10 karakter."
          />
        </div>
        <Button color={"primary"} type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing Up..." : "Sign Up"}
        </Button>
      </form>
    </>
  );
};

export default AuthRegister;
