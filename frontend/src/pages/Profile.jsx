import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, Calendar } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

// Assuming you have this helper or similar in your app
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Profile() {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '' });
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

  // 1. Fetch user data using native fetch
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    }
  });

  // 2. Handle password update using native fetch
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoadingUpdate(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      
      toast.success('Password updated successfully!');
      setFormData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
      
      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Profile Information
          </CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent>
          {isUserLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <div className="font-medium text-lg">{user?.name || 'N/A'}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <div className="font-medium text-lg">{user?.email || 'N/A'}</div>
              </div>
              <div>
                <Label className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Member Since
                </Label>
                <div className="font-medium text-lg">
                  {user?.createdAt ? format(new Date(user.createdAt), 'MMMM do, yyyy') : 'Loading...'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Update Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="space-y-2">
              <Label htmlFor="current">Current Password</Label>
              <Input id="current" type="password" required value={formData.currentPassword} 
                     onChange={(e) => setFormData({...formData, currentPassword: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New Password</Label>
              <Input id="new" type="password" required value={formData.newPassword} 
                     onChange={(e) => setFormData({...formData, newPassword: e.target.value})} />
            </div>
            <Button type="submit" disabled={isLoadingUpdate}>
              {isLoadingUpdate ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}