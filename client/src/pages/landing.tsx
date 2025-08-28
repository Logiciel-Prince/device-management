import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Shield, Users, Zap } from "lucide-react";

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
          <Button 
            size="lg" 
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Get Started
          </Button>
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
