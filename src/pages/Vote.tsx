import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useVoter, useCandidates, useCastVote, useRegisterVoter } from "@/hooks/useVoter";
import {
  Vote as VoteIcon,
  CheckCircle2,
  Lock,
  Blocks,
  AlertTriangle,
  Shield,
  ArrowRight,
  IdCard,
  Phone,
  User,
} from "lucide-react";
import { toast } from "sonner";

const Vote = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: voter, isLoading: voterLoading } = useVoter();
  const { data: candidates = [], isLoading: candidatesLoading } = useCandidates();
  const castVote = useCastVote();
  const registerVoter = useRegisterVoter();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [step, setStep] = useState<"voter-setup" | "select" | "confirm" | "encrypting" | "success">("select");
  const [createdBlock, setCreatedBlock] = useState<any>(null);
  const [voterForm, setVoterForm] = useState({ name: "", voterId: "", aadhaarNumber: "", phone: "" });
  const [voterErrors, setVoterErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !voterLoading && user && !voter) {
      setStep("voter-setup");
    } else if (!authLoading && !voterLoading && voter && !voter.has_voted) {
      setStep("select");
    }
  }, [user, voter, authLoading, voterLoading]);

  if (authLoading || voterLoading || candidatesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 flex items-center justify-center min-h-[80vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 flex items-center justify-center min-h-[80vh]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-warning" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">Please login to access the voting portal</p>
            <Button variant="hero" onClick={() => navigate("/login")}>
              Login to Vote <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (voter?.has_voted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 flex items-center justify-center min-h-[80vh]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 vote-verified">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Vote Already Cast</h1>
            <p className="text-muted-foreground mb-6">Your vote has been recorded on the blockchain.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="default" onClick={() => navigate("/results")}>View Results</Button>
              <Button variant="outline" onClick={() => navigate("/blockchain")}>Verify on Blockchain</Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleVoterSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!voterForm.name.trim()) newErrors.name = "Name is required";
    if (!voterForm.voterId.trim()) newErrors.voterId = "Voter ID is required";
    else if (!/^[A-Z]{3}\d{7}$/i.test(voterForm.voterId)) newErrors.voterId = "Invalid format (e.g., ABC1234567)";
    if (!voterForm.aadhaarNumber.trim()) newErrors.aadhaarNumber = "Aadhaar is required";
    else if (!/^\d{12}$/.test(voterForm.aadhaarNumber)) newErrors.aadhaarNumber = "Must be 12 digits";
    if (!voterForm.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(voterForm.phone)) newErrors.phone = "Must be 10 digits";
    setVoterErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await registerVoter.mutateAsync({
        name: voterForm.name,
        voter_id: voterForm.voterId,
        aadhaar_number: voterForm.aadhaarNumber,
        email: user.email || "",
        phone: voterForm.phone,
      });
      toast.success("Voter profile created!");
      setStep("select");
    } catch (err: any) {
      toast.error("Failed to create voter profile", { description: err.message });
    }
  };

  const confirmVote = async () => {
    setStep("encrypting");
    try {
      const result = await castVote.mutateAsync(selectedCandidate!);
      setCreatedBlock(result.block);
      setStep("success");
      toast.success("Vote cast successfully!");
    } catch (err: any) {
      toast.error("Vote failed", { description: err.message });
      setStep("confirm");
    }
  };

  const selectedCandidateData = candidates.find((c: any) => c.id === selectedCandidate);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {step === "voter-setup" && (
              <motion.div key="voter-setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-lg mx-auto">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground mb-3">Complete Voter Profile</h1>
                  <p className="text-muted-foreground">Enter your voter details to proceed</p>
                </div>
                <div className="glass-card rounded-2xl p-8">
                  <form onSubmit={handleVoterSetup} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1"><User className="w-4 h-4 inline mr-1" /> Full Name</label>
                      <Input value={voterForm.name} onChange={(e) => setVoterForm(p => ({ ...p, name: e.target.value }))} className={voterErrors.name ? "border-destructive" : ""} />
                      {voterErrors.name && <p className="text-sm text-destructive mt-1">{voterErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1"><IdCard className="w-4 h-4 inline mr-1" /> Voter ID</label>
                      <Input value={voterForm.voterId} onChange={(e) => setVoterForm(p => ({ ...p, voterId: e.target.value.toUpperCase() }))} maxLength={10} className={voterErrors.voterId ? "border-destructive" : ""} />
                      {voterErrors.voterId && <p className="text-sm text-destructive mt-1">{voterErrors.voterId}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1"><Shield className="w-4 h-4 inline mr-1" /> Aadhaar Number</label>
                      <Input value={voterForm.aadhaarNumber} onChange={(e) => setVoterForm(p => ({ ...p, aadhaarNumber: e.target.value.replace(/\D/g, "") }))} maxLength={12} className={voterErrors.aadhaarNumber ? "border-destructive" : ""} />
                      {voterErrors.aadhaarNumber && <p className="text-sm text-destructive mt-1">{voterErrors.aadhaarNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1"><Phone className="w-4 h-4 inline mr-1" /> Mobile Number</label>
                      <Input value={voterForm.phone} onChange={(e) => setVoterForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))} maxLength={10} className={voterErrors.phone ? "border-destructive" : ""} />
                      {voterErrors.phone && <p className="text-sm text-destructive mt-1">{voterErrors.phone}</p>}
                    </div>
                    <Button type="submit" variant="hero" size="lg" className="w-full" disabled={registerVoter.isPending}>
                      {registerVoter.isPending ? "Saving..." : "Continue to Vote"}
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}

            {step === "select" && (
              <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                    <VoteIcon className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Cast Your Vote</h1>
                  <p className="text-muted-foreground">
                    Welcome, <span className="font-semibold text-foreground">{voter?.name}</span>. Select your preferred candidate.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {candidates.map((candidate: any) => (
                    <motion.button key={candidate.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCandidate(candidate.id)}
                      className={`p-6 rounded-2xl border-2 text-left transition-all ${selectedCandidate === candidate.id ? "border-primary bg-primary/5 shadow-lg" : "border-border bg-card hover:border-primary/50"}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl">{candidate.symbol}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-1">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{candidate.party}</p>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${selectedCandidate === candidate.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {selectedCandidate === candidate.id ? <><CheckCircle2 className="w-3 h-3" /> Selected</> : "Click to select"}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Button variant="hero" size="xl" onClick={() => setStep("confirm")} disabled={!selectedCandidate}>
                    Proceed to Confirm <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "confirm" && (
              <motion.div key="confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto text-center">
                <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-warning" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Confirm Your Vote</h2>
                <p className="text-muted-foreground mb-6">You are about to vote for:</p>
                <div className="p-6 rounded-2xl border-2 border-primary bg-primary/5 mb-8">
                  <div className="text-4xl mb-3">{selectedCandidateData?.symbol}</div>
                  <h3 className="text-xl font-bold text-foreground">{selectedCandidateData?.name}</h3>
                  <p className="text-muted-foreground">{selectedCandidateData?.party}</p>
                </div>
                <div className="bg-destructive/10 rounded-xl p-4 mb-8">
                  <p className="text-sm text-destructive font-medium">⚠️ This action cannot be undone. Your vote will be permanently recorded on the blockchain.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep("select")}>Go Back</Button>
                  <Button variant="hero" size="lg" className="flex-1" onClick={confirmVote}>Confirm Vote</Button>
                </div>
              </motion.div>
            )}

            {step === "encrypting" && (
              <motion.div key="encrypting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto text-center">
                <div className="space-y-8">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent mx-auto" />
                  <div className="space-y-4">
                    <EncryptionStep icon={Lock} label="Encrypting vote..." delay={0} />
                    <EncryptionStep icon={Shield} label="Digital signature applied" delay={0.5} />
                    <EncryptionStep icon={Blocks} label="Creating block..." delay={1} />
                    <EncryptionStep icon={CheckCircle2} label="Validating with network" delay={1.5} />
                  </div>
                  <p className="text-muted-foreground text-sm">Please wait while your vote is securely processed...</p>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 vote-verified">
                  <CheckCircle2 className="w-12 h-12 text-success" />
                </motion.div>
                <h2 className="text-3xl font-bold text-foreground mb-3">Vote Cast Successfully!</h2>
                <p className="text-muted-foreground mb-8">Your vote has been encrypted and permanently recorded on the blockchain.</p>
                {createdBlock && (
                  <div className="glass-card rounded-2xl p-6 mb-8 text-left">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4">BLOCK DETAILS</h3>
                    <div className="space-y-3 font-mono text-sm">
                      <div><span className="text-muted-foreground">Block #:</span> <span className="text-foreground">{createdBlock.block_index}</span></div>
                      <div><span className="text-muted-foreground">Hash:</span> <span className="text-accent break-all">{createdBlock.hash?.slice(0, 20)}...</span></div>
                      <div><span className="text-muted-foreground">Timestamp:</span> <span className="text-foreground">{new Date(createdBlock.timestamp).toLocaleString()}</span></div>
                      <div><span className="text-muted-foreground">Status:</span> <span className="text-success inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Verified</span></div>
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="default" onClick={() => navigate("/results")}>View Results</Button>
                  <Button variant="outline" onClick={() => navigate("/blockchain")}>View Blockchain</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const EncryptionStep = ({ icon: Icon, label, delay }: { icon: any; label: string; delay: number }) => (
  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }} className="flex items-center gap-3 text-left bg-muted/50 rounded-lg p-3">
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Icon className="w-4 h-4 text-primary" /></div>
    <span className="text-sm text-foreground">{label}</span>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.3 }} className="ml-auto"><CheckCircle2 className="w-5 h-5 text-success" /></motion.div>
  </motion.div>
);

export default Vote;
