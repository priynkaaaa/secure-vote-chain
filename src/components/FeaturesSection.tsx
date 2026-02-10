import { motion } from "framer-motion";
import { Shield, Lock, Eye, Zap } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Immutable Records",
    description: "Once recorded, votes cannot be altered or deleted, ensuring complete integrity of the electoral process.",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Every vote is encrypted with military-grade cryptography before being stored on the blockchain.",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description: "Anyone can verify the election results while voter privacy remains completely protected.",
  },
  {
    icon: Zap,
    title: "Real-Time Results",
    description: "Smart contracts automatically count votes, providing instant and accurate results.",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-5 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
