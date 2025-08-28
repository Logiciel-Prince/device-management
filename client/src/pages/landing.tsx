import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Shield, Users, Zap, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold">DeviceFlow</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your office device management with automated workflows, 
            Slack notifications, and comprehensive monitoring capabilities.
          </p>
          
          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <CardContent className="p-8 text-center">
                <Shield className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Administrator</h3>
                <p className="text-muted-foreground mb-6">
                  Manage devices, monitor usage, approve requests, and control parental settings.
                </p>
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => window.location.href = "/admin"}
                  data-testid="button-admin-access"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Access
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500">
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 mx-auto text-green-600 mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Employee</h3>
                <p className="text-muted-foreground mb-6">
                  Request devices, track assignments, and manage your office equipment.
                </p>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => window.location.href = "/employee"}
                  data-testid="button-employee-access"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Employee Portal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-primary" />
                Device Management
              </CardTitle>
              <CardDescription>
                Comprehensive inventory tracking for smartphones, tablets, and laptops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time device status tracking</li>
                <li>• Assignment and return workflows</li>
                <li>• Maintenance scheduling</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                Request Workflows
              </CardTitle>
              <CardDescription>
                Streamlined approval process for device requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Employee self-service requests</li>
                <li>• Admin approval workflows</li>
                <li>• Automatic device assignment</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                Slack Integration
              </CardTitle>
              <CardDescription>
                Instant notifications for your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time request notifications</li>
                <li>• Approval status updates</li>
                <li>• Device status changes</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Ready to get started?</CardTitle>
              <CardDescription>
                Sign in with your Replit account to access the device management platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login-cta"
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
