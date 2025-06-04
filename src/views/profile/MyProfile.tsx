import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axiosInstance from '../../utils/axios';
import { Card, Label, TextInput, Button, Alert, Spinner } from 'flowbite-react';
// Jika Anda memiliki komponen PageContainer dan BreadcrumbComp, Anda bisa uncomment ini
// import PageContainer from '../../components/shared/PageContainer'; 
// import BreadcrumbComp from '../../layouts/full/shared/breadcrumb/BreadcrumbComp';

const MyProfile: React.FC = () => {
  const { user, fetchUserData } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [departemen, setDepartemen] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setDepartemen(user.departemen || '');
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password && password !== confirmPassword) {
      setError("Password baru dan konfirmasi password tidak cocok.");
      return;
    }
    if (password && password.length < 6) {
      setError("Password baru minimal harus 6 karakter.");
      return;
    }

    setIsUpdating(true);
    try {
      const payload: any = {
        username,
        email,
      };
      if (password) {
        payload.password = password;
      }

      await axiosInstance.put('/user/profile', payload); 
      setSuccessMessage('Profil berhasil diperbarui!');
      setPassword(''); // Kosongkan field password setelah berhasil
      setConfirmPassword('');
      if (fetchUserData) {
         await fetchUserData(); // Refresh data pengguna di context
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Gagal memperbarui profil.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner aria-label="Loading user data..." size="xl" />
      </div>
    );
  }

  return (
    // <PageContainer title="My Profile" description="Update your profile details">
    //   <BreadcrumbComp title="My Profile" /> 
      <Card className="max-w-2xl mx-auto mt-8">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
          Profil Saya
        </h5>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && <Alert color="failure" onDismiss={() => setError(null)}>{error}</Alert>}
          {successMessage && <Alert color="success" onDismiss={() => setSuccessMessage(null)}>{successMessage}</Alert>}
          
          <div>
            <div className="mb-2 block">
              <Label htmlFor="username" value="Username" />
            </div>
            <TextInput id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email" value="Email" />
            </div>
            <TextInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          
          <div>
            <div className="mb-2 block">
              <Label htmlFor="departemen" value="Departemen" />
            </div>
            <TextInput id="departemen" type="text" value={departemen} readOnly disabled className="bg-gray-100 dark:bg-gray-700"/>
          </div>
          
          <hr className="my-2"/>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Kosongkan field password jika Anda tidak ingin mengubah password Anda.
          </p>
          
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password" value="Password Baru" />
            </div>
            <TextInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" />
          </div>
          
          <div>
            <div className="mb-2 block">
              <Label htmlFor="confirmPassword" value="Konfirmasi Password Baru" />
            </div>
            <TextInput id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          
          <Button type="submit" isProcessing={isUpdating} disabled={isUpdating} className="w-full md:w-auto md:self-start">
            {isUpdating ? 'Memperbarui...' : 'Perbarui Profil'}
          </Button>
        </form>
      </Card>
    // </PageContainer>
  );
};

export default MyProfile; 