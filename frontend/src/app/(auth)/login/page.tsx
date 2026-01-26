"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useGetMyProfile } from "@/app/hooks/useGetMyProfile";
import { getBaseUrl } from "@/utils/getBaseUrl";
import { useRouter } from "next/navigation";

interface FormData {
     email: string;
     password: string;
     confirmPassword?: string;
     name?: string;
}

interface FormErrors {
     email?: string;
     password?: string;
     confirmPassword?: string;
     name?: string;
     general?: string;
}

export default function Page() {
     const router = useRouter();
     const [isLogin, setIsLogin] = useState(true);
     const [showPassword, setShowPassword] = useState(false);
     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
     const [isLoading, setIsLoading] = useState(false);
     const [formData, setFormData] = useState<FormData>({
          email: "",
          password: "",
          confirmPassword: "",
          name: "",
     });
     const [errors, setErrors] = useState<FormErrors>({});

     const validateForm = (): boolean => {
          const newErrors: FormErrors = {};

          // Email validation
          if (!formData.email) {
               newErrors.email = "Email is required";
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
               newErrors.email = "Please enter a valid email address";
          }

          // Password validation
          if (!formData.password) {
               newErrors.password = "Password is required";
          } else if (formData.password.length < 6) {
               newErrors.password = "Password must be at least 6 characters long";
          }

          // Signup specific validations
          if (!isLogin) {
               if (!formData.name) {
                    newErrors.name = "Name is required";
               }

               if (!formData.confirmPassword) {
                    newErrors.confirmPassword = "Please confirm your password";
               } else if (formData.password !== formData.confirmPassword) {
                    newErrors.confirmPassword = "Passwords do not match";
               }
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
     };

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const { name, value } = e.target;
          setFormData((prev) => ({ ...prev, [name]: value }));

          // Clear error when user starts typing
          if (errors[name as keyof FormErrors]) {
               setErrors((prev) => ({ ...prev, [name]: undefined }));
          }
     };

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();

          if (!validateForm()) return;

          setIsLoading(true);
          setErrors({});

          try {
               if (isLogin) {
                    const BASE_URL = getBaseUrl();
                    const res = await fetch(`${BASE_URL}/api/auth/login`, {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({
                              email: formData.email,
                              password: formData.password,
                         }),
                    });

                    const data = await res.json();
                    if(res.ok) {
                         console.log("logged in succesfully")
                    }
                    if (!res.ok) {
                         setErrors({ general: data.message || "Login failed" });
                         setIsLoading(false);
                         return;
                    }

                    localStorage.setItem("token", data.token);
                    window.dispatchEvent(new Event("userLoggedIn"));

                    // 🔍 Check if user has a profile
                    const profileRes = await fetch(`${BASE_URL}/api/profile/me`, {
                         method: "GET",
                         headers: {
                              Authorization: `Bearer ${data.token}`,
                         },
                    });

                    if (profileRes.ok) {
                         // 🎉 Profile exists
                         router.push("/");
                    } else if (profileRes.status === 404) {
                         // 🆕 No profile found
                         router.push("/");
                    } else {
                         console.error("Error checking profile");
                         setErrors({ general: "Something went wrong. Please try again." });
                    }
               } else {
                    // ✅ SIGNUP LOGIC
                    const BASE_URL = getBaseUrl();
                    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({
                              email: formData.email,
                              password: formData.password,
                              name: formData.name,
                         }),
                    });

                    const data = await res.json();

                    if (!res.ok) {
                         setErrors({ general: data.message || "Signup failed" });
                         setIsLoading(false);
                         return;
                    }

                    alert("Signup successful! Please log in.");
                    setIsLogin(true); // Switch to login mode
               }
          } catch (error) {
               console.error("Login/signup error:", error);
               setErrors({ general: "An error occurred. Please try again." });
          } finally {
               setIsLoading(false);
          }
     };

     const toggleMode = () => {
          setIsLogin(!isLogin);
          setFormData({
               email: "",
               password: "",
               confirmPassword: "",
               name: "",
          });
          setErrors({});
     };

     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
               <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                         <CardTitle className="text-2xl font-bold text-center">
                              {isLogin ? "Log in to your account" : "Create your account"}
                         </CardTitle>
                         <CardDescription className="text-center">
                              {isLogin
                                   ? "Enter your email and password to sign in"
                                   : "Enter your information to create an account"}
                         </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                         <CardContent className="space-y-4">
                              {errors.general && (
                                   <Alert variant="destructive">
                                        <AlertDescription>{errors.general}</AlertDescription>
                                   </Alert>
                              )}

                              {!isLogin && (
                                   <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                             <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                             <Input
                                                  id="name"
                                                  name="name"
                                                  type="text"
                                                  placeholder="Enter your full name"
                                                  value={formData.name}
                                                  onChange={handleInputChange}
                                                  className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                                             />
                                        </div>
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                   </div>
                              )}

                              <div className="space-y-2">
                                   <Label htmlFor="email">Email</Label>
                                   <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                             id="email"
                                             name="email"
                                             type="email"
                                             placeholder="Enter your email"
                                             value={formData.email}
                                             onChange={handleInputChange}
                                             className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                                        />
                                   </div>
                                   {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                              </div>

                              <div className="space-y-2">
                                   <Label htmlFor="password">Password</Label>
                                   <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                             id="password"
                                             name="password"
                                             type={showPassword ? "text" : "password"}
                                             placeholder="Enter your password"
                                             value={formData.password}
                                             onChange={handleInputChange}
                                             className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                                        />
                                        <button
                                             type="button"
                                             className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                                             onClick={() => setShowPassword(!showPassword)}
                                        >
                                             {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                   </div>
                                   {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                              </div>

                              {!isLogin && (
                                   <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <div className="relative">
                                             <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                             <Input
                                                  id="confirmPassword"
                                                  name="confirmPassword"
                                                  type={showConfirmPassword ? "text" : "password"}
                                                  placeholder="Confirm your password"
                                                  value={formData.confirmPassword}
                                                  onChange={handleInputChange}
                                                  className={`pl-10 pr-10 ${
                                                       errors.confirmPassword ? "border-red-500" : ""
                                                  }`}
                                             />
                                             <button
                                                  type="button"
                                                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                             >
                                                  {showConfirmPassword ? (
                                                       <EyeOff className="h-4 w-4" />
                                                  ) : (
                                                       <Eye className="h-4 w-4" />
                                                  )}
                                             </button>
                                        </div>
                                        {errors.confirmPassword && (
                                             <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                                        )}
                                   </div>
                              )}

                              {isLogin && (
                                   <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                             <input
                                                  id="remember-me"
                                                  name="remember-me"
                                                  type="checkbox"
                                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                             />
                                             <Label htmlFor="remember-me" className="ml-2 block text-sm">
                                                  Remember me
                                             </Label>
                                        </div>
                                        <button type="button" className="text-sm text-blue-600 hover:text-blue-500">
                                             Forgot password?
                                        </button>
                                   </div>
                              )}
                         </CardContent>

                         <CardFooter className="flex flex-col space-y-4">
                              <Button type="submit" className="w-full" disabled={isLoading}>
                                   {isLoading ? (
                                        <>
                                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                             {isLogin ? "Signing in..." : "Creating account..."}
                                        </>
                                   ) : isLogin ? (
                                        "Sign in"
                                   ) : (
                                        "Create account"
                                   )}
                              </Button>

                              <div className="text-center text-sm">
                                   {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                                   <button
                                        type="button"
                                        onClick={toggleMode}
                                        className="text-blue-600 hover:text-blue-500 font-medium"
                                   >
                                        {isLogin ? "Sign up" : "Sign in"}
                                   </button>
                              </div>
                         </CardFooter>
                    </form>
               </Card>
          </div>
     );
}
