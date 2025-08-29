import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [demoUsers, setDemoUsers] = useState<any[]>([]);
    const { toast } = useToast();

    // Load demo users on component mount
    useEffect(() => {
        fetch("/api/demo-users")
            .then((res) => res.json())
            .then((users) => setDemoUsers(users))
            .catch(console.error);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                toast({
                    title: "Login successful",
                    description: `Welcome back, ${data.user.firstName}!`,
                });
                // Redirect to dashboard
                window.location.href = "/";
            } else {
                const error = await response.json();
                toast({
                    title: "Login failed",
                    description: error.message || "Invalid credentials",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Login failed",
                description: "Network error. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fillDemoCredentials = (user: any) => {
        setEmail(user.email);
        setPassword(user.password);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">DeviceFlow</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Sign in to your account
                    </p>
                </div>

                {/* Login Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome back</CardTitle>
                        <CardDescription>
                            Enter your credentials to access the device
                            management platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Demo Users */}
                {demoUsers.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                Demo Accounts
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Click to auto-fill credentials for testing
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {demoUsers.map((user, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start text-left"
                                    onClick={() => fillDemoCredentials(user)}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">
                                            {user.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {user.email} • {user.role}
                                        </span>
                                    </div>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
