import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, Calendar } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '' });
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

  // 1. Fetch real user data
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoadingUpdate(true);
    try {
      await axios.put('http://localhost:5000/api/auth/password', formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      toast.success('Password updated successfully!');
      setFormData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
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
          <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
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