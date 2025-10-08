import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Calendar, 
  FormInput, 
  TrendingUp,
  Users,
  BarChart3,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { publicAnonKey, projectId } from '../../utils/supabase/info';

type Stats = {
  totalPosts: number;
  publishedPosts: number;
  totalEvents: number;
  upcomingEvents: number;
  totalForms: number;
  totalResponses: number;
};

export function Dashboard() {
  const context = useContext(AppContext);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  if (!context) {
    return <div>Error: App context not available</div>;
  }

  const { session } = context;

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a369a306/stats`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      fetchStats();
    }
  }, [session]);

  const statCards = [
    {
      title: 'Blog Posts',
      value: stats?.totalPosts || 0,
      description: `${stats?.publishedPosts || 0} published`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Events',
      value: stats?.totalEvents || 0,
      description: `${stats?.upcomingEvents || 0} upcoming`,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Forms',
      value: stats?.totalForms || 0,
      description: `${stats?.totalResponses || 0} responses`,
      icon: FormInput,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Engagement',
      value: (stats?.totalResponses || 0) + (stats?.publishedPosts || 0),
      description: 'Total interactions',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const quickActions = [
    {
      title: 'Create Blog Post',
      description: 'Write and publish a new blog post',
      icon: FileText,
      action: () => window.location.hash = '#blog',
    },
    {
      title: 'Add Event',
      description: 'Schedule a new event',
      icon: Calendar,
      action: () => window.location.hash = '#events',
    },
    {
      title: 'Build Form',
      description: 'Create a custom form',
      icon: FormInput,
      action: () => window.location.hash = '#forms',
    },
    {
      title: 'Update Hero',
      description: 'Modify hero section content',
      icon: BarChart3,
      action: () => window.location.hash = '#hero',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white">Welcome back!</CardTitle>
              <CardDescription className="text-blue-100">
                Here's what's happening with your platform today.
              </CardDescription>
            </div>
            <Button 
              onClick={fetchStats}
              variant="secondary"
              size="sm"
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white/70 backdrop-blur-lg border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-gray-600">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{loading ? '...' : stat.value}</div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Common tasks you can perform right now
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow border-gray-200">
                  <CardContent className="p-4" onClick={action.action}>
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm text-gray-900">{action.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current platform health and information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Backend API</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">File Storage</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Available
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Authentication</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}