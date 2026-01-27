import { motion } from "framer-motion";
import { 
  UserPlus, 
  ShieldCheck, 
  Vote, 
  Lock, 
  Blocks, 
  CheckCircle2, 
  LinkIcon, 
  FileText, 
  BarChart3 
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "1. User Registration",
    description: "Voter registers with ID verification through the Election Authority",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: ShieldCheck,
    title: "2. Voter Authentication",
    description: "Secure login with OTP/biometric verification and eligibility check",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Vote,
    title: "3. Vote Casting",
    description: "Voter selects candidate and confirms their choice",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Lock,
    title: "4. Vote Encryption",
    description: "Vote is encrypted and digitally signed, identity anonymized",
    color: "from-pink-500 to-pink-600",
  },
  {
    icon: Blocks,
    title: "5. Block Creation",
    description: "Encrypted vote becomes a transaction in a new block",
    color: "from-rose-500 to-rose-600",
  },
  {
    icon: CheckCircle2,
    title: "6. Block Validation",
    description: "Network validates block using consensus mechanism",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: LinkIcon,
    title: "7. Chain Addition",
    description: "Validated block is permanently added to blockchain",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: FileText,
    title: "8. Smart Contract",
    description: "Automatic vote counting with no human interference",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: BarChart3,
    title: "9. Results",
    description: "Transparent, auditable results declared publicly",
    color: "from-teal-500 to-teal-600",
  },
];

export const WorkflowSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Blockchain Voting Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A transparent, secure, and tamper-proof voting process powered by blockchain technology
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-success transform -translate-y-1/2 opacity-20" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="glass-card rounded-2xl p-6 h-full hover:shadow-xl transition-shadow duration-300">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
