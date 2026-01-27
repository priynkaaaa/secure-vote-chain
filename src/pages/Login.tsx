import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVotingStore } from "@/store/votingStore";
import { 
  LogIn, 
  IdCard, 
  Shield, 
  KeyRound,
  AlertCircle,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { login, verifyVoter } = useVotingStore();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    voterId: "",
    aadhaarNumber: "",
    otp: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCredentials = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.voterId.trim()) newErrors.voterId = "Voter ID is required";
    if (!formData.aadhaarNumber.trim()) newErrors.aadhaarNumber = "Aadhaar number is required";
    else if (!/^\d{12}$/.test(formData.aadhaarNumber)) 
      newErrors.aadhaarNumber = "Aadhaar must be 12 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCredentials()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { isRegistered, hasVoted } = verifyVoter(formData.voterId);

    if (!isRegistered) {
      toast.error("Voter not found", {
        description: "Please register first before logging in.",
      });
      setIsSubmitting(false);
      return;
    }

    if (hasVoted) {
      toast.error("Already voted", {
        description: "You have already cast your vote in this election.",
      });
      setIsSubmitting(false);
      return;
    }

    // Send OTP (simulated)
    toast.success("OTP Sent", {
      description: "A 6-digit OTP has been sent to your registered mobile.",
    });
    setStep("otp");
    setIsSubmitting(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.otp.length !== 6) {
      setErrors({ otp: "Please enter 6-digit OTP" });
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate OTP verification (accept any 6 digits for demo)
    const success = login(formData.voterId, formData.aadhaarNumber);

    if (success) {
      toast.success("Login successful!", {
        description: "You can now cast your vote.",
      });
      navigate("/vote");
    } else {
      toast.error("Authentication failed", {
        description: "Invalid credentials. Please try again.",
      });
    }

    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Voter Login
              </h1>
              <p className="text-muted-foreground">
                Securely access your voting portal
              </p>
            </motion.div>

            {/* Progress Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <div className={`flex items-center gap-2 ${step === "credentials" ? "text-primary" : "text-success"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "credentials" ? "bg-primary text-primary-foreground" : "bg-success text-success-foreground"
                }`}>
                  {step === "otp" ? <CheckCircle2 className="w-5 h-5" /> : "1"}
                </div>
                <span className="text-sm font-medium hidden sm:block">Credentials</span>
              </div>
              <div className="w-12 h-0.5 bg-border" />
              <div className={`flex items-center gap-2 ${step === "otp" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "otp" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  2
                </div>
                <span className="text-sm font-medium hidden sm:block">OTP Verification</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-8"
            >
              {step === "credentials" ? (
                <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <IdCard className="w-4 h-4 inline mr-2" />
                      Voter ID
                    </label>
                    <Input
                      type="text"
                      placeholder="ABC1234567"
                      value={formData.voterId}
                      onChange={(e) => handleChange("voterId", e.target.value.toUpperCase())}
                      className={errors.voterId ? "border-destructive" : ""}
                    />
                    {errors.voterId && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.voterId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Aadhaar Number
                    </label>
                    <Input
                      type="text"
                      placeholder="12-digit Aadhaar"
                      value={formData.aadhaarNumber}
                      onChange={(e) => handleChange("aadhaarNumber", e.target.value.replace(/\D/g, ""))}
                      className={errors.aadhaarNumber ? "border-destructive" : ""}
                      maxLength={12}
                    />
                    {errors.aadhaarNumber && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.aadhaarNumber}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                      <KeyRound className="w-6 h-6 text-success" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit OTP sent to your registered mobile number
                    </p>
                  </div>

                  <div>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={formData.otp}
                      onChange={(e) => handleChange("otp", e.target.value.replace(/\D/g, ""))}
                      className={`text-center text-2xl tracking-[0.5em] font-mono ${errors.otp ? "border-destructive" : ""}`}
                      maxLength={6}
                    />
                    {errors.otp && (
                      <p className="text-sm text-destructive mt-1 text-center flex items-center justify-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.otp}
                      </p>
                    )}
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    For demo, enter any 6 digits (e.g., 123456)
                  </p>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Verify & Login
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setStep("credentials")}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to credentials
                  </button>
                </form>
              )}

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-center text-sm text-muted-foreground">
                  Not registered yet?{" "}
                  <Link to="/register" className="text-primary hover:underline font-medium">
                    Register here
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
