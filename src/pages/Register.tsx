import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVotingStore } from "@/store/votingStore";
import { 
  UserPlus, 
  IdCard, 
  Mail, 
  Phone, 
  User, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield
} from "lucide-react";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const { registerVoter } = useVotingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    voterId: "",
    aadhaarNumber: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.voterId.trim()) newErrors.voterId = "Voter ID is required";
    else if (!/^[A-Z]{3}\d{7}$/i.test(formData.voterId)) 
      newErrors.voterId = "Invalid Voter ID format (e.g., ABC1234567)";
    
    if (!formData.aadhaarNumber.trim()) newErrors.aadhaarNumber = "Aadhaar number is required";
    else if (!/^\d{12}$/.test(formData.aadhaarNumber)) 
      newErrors.aadhaarNumber = "Aadhaar must be 12 digits";
    
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) 
      newErrors.email = "Invalid email format";
    
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone)) 
      newErrors.phone = "Phone must be 10 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const success = registerVoter(formData);

    if (success) {
      toast.success("Registration successful!", {
        description: "You can now login to cast your vote.",
      });
      navigate("/login");
    } else {
      toast.error("Registration failed", {
        description: "Voter ID or Aadhaar already registered.",
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
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Voter Registration
              </h1>
              <p className="text-muted-foreground">
                Register to participate in secure blockchain-based elections
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      maxLength={10}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Mobile Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="10-digit mobile"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, ""))}
                      className={errors.phone ? "border-destructive" : ""}
                      maxLength={10}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground mb-1">Verification Process</p>
                      <p className="text-muted-foreground">
                        Your details will be verified against the Election Authority database. 
                        You'll receive an OTP for authentication during login.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
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
                      Complete Registration
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already registered?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Login here
                  </Link>
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
