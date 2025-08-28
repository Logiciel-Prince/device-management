import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Smartphone, 
  FileText, 
  Clock,
  CheckCircle,
  ArrowRight,
  ChevronRight
} from "lucide-react";

export default function EmployeeLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              DeviceFlow Employee Portal
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your gateway to device requests and management. 
            Request devices, track your assignments, and manage your office equipment seamlessly.
          </p>
        </div>

        {/* Employee Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                Device Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Submit requests for smartphones, tablets, and laptops. Track approval status and get notified when devices are ready.
              </p>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Quick request submission
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Real-time status updates
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Request history
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
                My Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                View and manage all devices assigned to you. Report issues, check device information, and track usage.
              </p>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Device overview
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Issue reporting
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Device return process
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                Request Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Track the status of your pending requests and get updates on approval timelines and device availability.
              </p>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Pending requests
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Approval notifications
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Delivery tracking
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Access common tasks quickly including device requests, status checks, and profile management.
              </p>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  One-click requests
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Profile updates
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Support access
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Process Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-center mb-8">Simple Request Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-semibold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Submit Request</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Choose device type and submit your request with justification
              </p>
            </div>
            
            <div className="flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-semibold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Admin Review</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Admin reviews and approves your request based on availability
              </p>
            </div>
            
            <div className="flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-semibold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Device Ready</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Receive notification and collect your approved device
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8">
              <User className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-4">
                Access Employee Portal
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Sign in to submit device requests, track your assignments, and manage your office equipment.
              </p>
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => window.location.href = "/api/login/employee"}
                data-testid="button-employee-login"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In as Employee
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}