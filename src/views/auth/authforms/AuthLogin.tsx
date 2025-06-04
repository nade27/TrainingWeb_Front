import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Label, TextInput, Alert } from 'flowbite-react';
import { useAuth } from '../../../hooks/useAuth';
import { HiInformationCircle } from 'react-icons/hi';

const AuthLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username harus diisi');
      return false;
    }
    if (!password.trim()) {
      setError('Password harus diisi');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login');
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError('');
      setter(e.target.value);
    };

  return (
    <form className="flex max-w-md flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="username" value="Username" />
        </div>
        <TextInput
          id="username"
          type="text"
          placeholder="Masukkan username"
          required
          value={username}
          onChange={handleInputChange(setUsername)}
          color={error && !username.trim() ? 'failure' : undefined}
        />
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="password" value="Password" />
        </div>
        <TextInput
          id="password"
          type="password"
          required
          value={password}
          onChange={handleInputChange(setPassword)}
          color={error && !password.trim() ? 'failure' : undefined}
        />
      </div>
      {error && (
        <Alert color="failure" icon={HiInformationCircle}>
          {error}
        </Alert>
      )}
      <Button type="submit" color="primary">
        Login
      </Button>
      <p className="text-sm font-light text-gray-500 dark:text-gray-400">
        Belum punya akun?{' '}
        <Link
          to="/auth/register"
          className="font-medium text-primary hover:underline"
        >
          Daftar di sini
        </Link>
      </p>
    </form>
  );
};

export default AuthLogin;
