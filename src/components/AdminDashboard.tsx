import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  FormInput, 
  Settings,
  LogOut,
  User,
  BarChart3
} from 'lucide-react';
import { Dashboard } from './admin/Dashboard';
import { HeroManager } from './admin/HeroManager';
import { BlogManager } from './admin/BlogManager';
import { EventsManager } from './admin/EventsManager';
import { FormsManager } from './admin/FormsManager';

export function AdminDashboard() {
  const context = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!context) {
    return <div>Error: App context not available</div>;
  }

  const { user, logout } = context;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hero', label: 'Hero Section', icon: Settings },
    { id: 'blog', label: 'Blog Posts', icon: FileText },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'forms', label: 'Forms', icon: FormInput },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Universal Backend
                </h1>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Admin Panel
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user?.user_metadata?.name || user?.email}</span>
              </div>
              <Button 
                onClick={logout}
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white/70 backdrop-blur-lg rounded-lg border border-white/20 p-2">
            <TabsList className="grid grid-cols-5 w-full bg-transparent">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            <TabsContent value="dashboard" className="space-y-6">
              <Dashboard />
            </TabsContent>

            <TabsContent value="hero" className="space-y-6">
              <HeroManager />
            </TabsContent>

            <TabsContent value="blog" className="space-y-6">
              <BlogManager />
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <EventsManager />
            </TabsContent>

            <TabsContent value="forms" className="space-y-6">
              <FormsManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}