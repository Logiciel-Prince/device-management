import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Smartphone, 
  Users, 
  BarChart3,
  Eye,
  Settings,
  ChevronRight
} from "lucide-react";

export default function AdminLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              DeviceFlow Admin
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive device management platform for administrators. 
            Monitor, control, and manage all office devices with advanced parental controls and analytics.
          </p>
        </div>

        {/* Admin Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                Device Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Real-time tracking of device usage, app activity, and location data with comprehensive parental controls.
              </p>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Real-time activity monitoring
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  App usage tracking
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Location services
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Manage employee accounts, roles, and device assignments with full administrative control.
              </p>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Employee account management
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Role-based access control
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Device assignments
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                Analytics & Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Detailed analytics, usage reports, and insights into device utilization and employee productivity.
              </p>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Usage analytics
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Productivity scoring
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Custom reports
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-orange-600" />
                </div>
                Device Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Complete inventory management for smartphones, tablets, and laptops with status tracking.
              </p>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Device catalog
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Status tracking
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Maintenance logs
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-red-600" />
                </div>
                Request Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Review and approve employee device requests with automated Slack notifications.
              </p>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Request approval workflow
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Slack notifications
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Audit trail
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-gray-600" />
                </div>
                System Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Configure system settings, monitoring preferences, and security policies.
              </p>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Security policies
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Monitoring settings
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  System configuration
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8">
              <Shield className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-4">
                Access Admin Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Sign in with your administrator account to access the full DeviceFlow management platform.
              </p>
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => window.location.href = "/api/login/admin"}
                data-testid="button-admin-login"
              >
                <Shield className="w-4 h-4 mr-2" />
                Sign In as Administrator
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}