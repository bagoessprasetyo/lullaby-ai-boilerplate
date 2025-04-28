import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, Lock, Bell, Settings, LogOut } from 'lucide-react'; // Example icons

// Mock user data (replace with actual data fetching)
const userData = {
  firstName: "Bagus",
  lastName: "Prasetyo",
  email: "bagusprasetyo@gmail.com",
  phone: "+1234567890",
  subscription: {
    plan: "Premium",
    status: "Active",
    nextBillingDate: "2024-08-15"
  }
};

export default function AccountSettingsPage() {
  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-8 bg-gradient-to-b from-background to-muted/30 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>
        {/* Optional: Add a quick action button like 'Upgrade Plan' */}
        {/* <Button variant="outline">Upgrade Plan</Button> */}
      </div>
      <p className="text-muted-foreground max-w-2xl">
        Manage your account preferences, personal information, subscription, and security settings.
      </p>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6 bg-transparent p-0">
          <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg p-3 justify-start">
            <User className="h-5 w-5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg p-3 justify-start">
            <CreditCard className="h-5 w-5" /> Subscription
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg p-3 justify-start">
            <Lock className="h-5 w-5" /> Password
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg p-3 justify-start">
            <Bell className="h-5 w-5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg p-3 justify-start">
            <Settings className="h-5 w-5" /> Preferences
          </TabsTrigger>
           <TabsTrigger value="logout" className="flex items-center gap-2 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive data-[state=active]:shadow-none rounded-lg p-3 justify-start text-destructive">
            <LogOut className="h-5 w-5" /> Logout
          </TabsTrigger>
        </TabsList>

        {/* Profile Information Tab */}
        <TabsContent value="profile">
          <Card className="shadow-sm border border-border/50 bg-[#faf7f5]">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700">Profile Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className='text-slate-700'>First Name</Label>
                  <Input id="firstName" className='text-slate-700' defaultValue={userData.firstName} placeholder="Enter your first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className='text-slate-700'>Last Name</Label>
                  <Input id="lastName" className='text-slate-700' defaultValue={userData.lastName} placeholder="Enter your last name" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Label htmlFor="email" className='text-slate-700'>Email</Label>
                  <Input id="email" type="email" className='text-slate-700' defaultValue={userData.email} placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className='text-slate-700'>Phone Number</Label>
                  <Input id="phone" type="tel" className='text-slate-700' defaultValue={userData.phone} placeholder="Enter your phone number" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-6">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <Card className="shadow-sm border border-border/50 bg-[#faf7f5]">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700">Subscription Management</CardTitle>
              <CardDescription>View and manage your current subscription plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground">Current Plan</p>
                <p className="text-lg font-semibold text-primary">{userData.subscription.plan}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Status</p>
                <p className={`text-sm ${userData.subscription.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{userData.subscription.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Next Billing Date</p>
                <p className="text-sm text-muted-foreground">{userData.subscription.nextBillingDate}</p>
              </div>
              {/* Add billing history link or details here */}
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-6 flex justify-between items-center">
              <Button variant="outline" className='text-slate-700'>Manage Billing</Button>
              {userData.subscription.plan !== 'Premium+' && (
                <Button>Upgrade Plan</Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card className="shadow-sm border border-border/50 bg-[#faf7f5]">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700">Change Password</CardTitle>
              <CardDescription>Update your account password for security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className='text-slate-700'>Current Password</Label>
                <Input id="currentPassword" type="password" placeholder="Enter your current password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className='text-slate-700'>New Password</Label>
                <Input id="newPassword" type="password" placeholder="Enter your new password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className='text-slate-700'>Confirm New Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm your new password" />
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-6">
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications Tab - Placeholder */}
        <TabsContent value="notifications">
          <Card className="shadow-sm border border-border/50 bg-[#faf7f5]">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700">Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications from Lullaby.ai.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notification settings coming soon.</p>
              {/* Add notification toggles/options here */}
            </CardContent>
             <CardFooter className="border-t border-border/50 pt-6">
              <Button disabled>Save Preferences</Button> {/* Disabled until implemented */}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Preferences Tab - Placeholder */}
        <TabsContent value="preferences">
          <Card className="shadow-sm border border-border/50 bg-[#faf7f5]">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700">App Preferences</CardTitle>
              <CardDescription>Customize your Lullaby.ai experience.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">App preferences coming soon (e.g., default language, theme).</p>
              {/* Add preference options here */}
            </CardContent>
             <CardFooter className="border-t border-border/50 pt-6">
              <Button disabled>Save Preferences</Button> {/* Disabled until implemented */}
            </CardFooter>
          </Card>
        </TabsContent>

         {/* Logout Tab - Placeholder Action */}
        <TabsContent value="logout">
          <Card className="shadow-sm border border-destructive/20 bg-[#faf7f5]">
            <CardHeader>
              <CardTitle className="text-xl text-destructive">Logout</CardTitle>
              <CardDescription>Are you sure you want to log out of your account?</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">You will be returned to the login page.</p>
            </CardContent>
            <CardFooter className="border-t border-destructive/20 pt-6">
              {/* Add actual logout functionality to this button */}
              <Button variant="destructive">Logout</Button>
            </CardFooter>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}