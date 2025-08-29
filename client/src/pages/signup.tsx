import { useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Smartphone, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "employee" as "admin" | "employee",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Password mismatch",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        if (formData.password.length < 6) {
            toast({
                title: "Password too short",
                description: "Password must be at least 6 characters long",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            console.log("Sending signup request with data:", {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            const response = await fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                }),
            });

            console.log("Signup response status:", response.status);
            console.log("Signup response headers:", response.headers);

            // Let's first check what the raw response looks like
            const responseText = await response.text();
            console.log("Raw response text:", responseText);

            if (response.ok) {
                try {
                    // Parse the response text as JSON
                    const data = JSON.parse(responseText);
                    console.log("Signup success data:", data);
                    toast({
                        title: "Account created successfully",
                        description: `Welcome, ${data.user.firstName}! You can now sign in.`,
                    });
                    // Redirect to login
                    window.location.href = "/login";
                } catch (jsonError) {
                    console.error("Failed to parse JSON response:", jsonError);
                    console.log("Response was not valid JSON:", responseText);
                    toast({
                        title: "Signup completed",
                        description:
                            "Account created but response parsing failed. Try logging in.",
                        variant: "destructive",
                    });
                }
            } else {
                console.log("Signup failed with status:", response.status);
                try {
                    const error = JSON.parse(responseText);
                    console.log("Signup error data:", error);
                    toast({
                        title: "Signup failed",
                        description:
                            error.message || "Failed to create account",
                        variant: "destructive",
                    });
                } catch (parseError) {
                    console.log("Error response was not JSON:", responseText);
                    toast({
                        title: "Signup failed",
                        description: "Server error occurred",
                        variant: "destructive",
                    });
                }
            }
        } catch (error) {
            toast({
                title: "Signup failed",
                description: "Network error. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
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
                    <p className="text-muted-foreground">Create your account</p>
                </div>

                {/* Signup Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sign up</CardTitle>
                        <CardDescription>
                            Create an account to access the device management
                            platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">
                                        First Name
                                    </Label>
                                    <Input
                                        id="firstName"
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "firstName",
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "lastName",
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@company.com"
                                    value={formData.email}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "email",
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) =>
                                        handleInputChange("role", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="employee">
                                            Employee
                                        </SelectItem>
                                        <SelectItem value="admin">
                                            Administrator
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
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
                                        value={formData.password}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "password",
                                                e.target.value
                                            )
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

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "confirmPassword",
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                    >
                                        {showConfirmPassword ? (
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
                                {isLoading
                                    ? "Creating account..."
                                    : "Create Account"}
                            </Button>
                        </form>

                        <div className="mt-4 text-center text-sm">
                            <span className="text-muted-foreground">
                                Already have an account?{" "}
                            </span>
                            <Button
                                variant="link"
                                className="p-0 h-auto font-normal"
                                onClick={() =>
                                    (window.location.href = "/login")
                                }
                            >
                                Sign in
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
