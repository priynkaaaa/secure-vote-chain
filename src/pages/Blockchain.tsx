import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useVotingStore } from "@/store/votingStore";
import { 
  Blocks, 
  Hash, 
  Clock, 
  Link as LinkIcon, 
  CheckCircle2,
  ChevronRight,
  Shield
} from "lucide-react";
import { useState } from "react";

const Blockchain = () => {
  const { blockchain, candidates } = useVotingStore();
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);

  const getCandidateName = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    return candidate?.name || "N/A";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
              <Blocks className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Blockchain Explorer
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              View the complete, immutable record of all votes. Each block contains encrypted vote data 
              that is permanently stored on the blockchain.
            </p>
          </motion.div>

          {/* Chain Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{blockchain.length}</p>
              <p className="text-sm text-muted-foreground">Total Blocks</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{blockchain.length - 1}</p>
              <p className="text-sm text-muted-foreground">Transactions</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-success">100%</p>
              <p className="text-sm text-muted-foreground">Valid Blocks</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-success">
                <Shield className="w-6 h-6" />
              </div>
              <p className="text-sm text-muted-foreground">Chain Secure</p>
            </div>
          </motion.div>

          {/* Visual Chain */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12 overflow-x-auto pb-4"
          >
            <div className="flex items-center gap-2 min-w-max px-4">
              {blockchain.map((block, index) => (
                <div key={block.index} className="flex items-center">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    onClick={() => setSelectedBlock(selectedBlock === block.index ? null : block.index)}
                    className={`relative w-20 h-20 rounded-xl flex flex-col items-center justify-center transition-all ${
                      selectedBlock === block.index
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : block.index === 0
                        ? "bg-gradient-to-br from-accent to-primary text-primary-foreground"
                        : "bg-card border-2 border-border hover:border-primary"
                    }`}
                  >
                    <span className="text-xs opacity-70">#{block.index}</span>
                    <Blocks className="w-6 h-6" />
                    {block.isValid && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-success-foreground" />
                      </div>
                    )}
                  </motion.button>
                  {index < blockchain.length - 1 && (
                    <div className="w-8 h-1 chain-link mx-1" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Block Details */}
          <div className="space-y-4">
            {blockchain.slice().reverse().map((block, i) => (
              <motion.div
                key={block.index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className={`glass-card rounded-2xl overflow-hidden ${
                  selectedBlock === block.index ? "ring-2 ring-primary" : ""
                }`}
              >
                <button
                  onClick={() => setSelectedBlock(selectedBlock === block.index ? null : block.index)}
                  className="w-full p-6 flex items-center gap-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    block.index === 0
                      ? "bg-gradient-to-br from-accent to-primary text-primary-foreground"
                      : "bg-primary/10"
                  }`}>
                    <Blocks className={`w-7 h-7 ${block.index === 0 ? "" : "text-primary"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        Block #{block.index}
                        {block.index === 0 && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                            Genesis
                          </span>
                        )}
                      </h3>
                      {block.isValid && (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono truncate">
                      {block.hash.slice(0, 32)}...
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                    selectedBlock === block.index ? "rotate-90" : ""
                  }`} />
                </button>

                {selectedBlock === block.index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6 border-t border-border"
                  >
                    <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Hash className="w-4 h-4" />
                            Block Hash
                          </div>
                          <p className="font-mono text-sm text-foreground break-all bg-muted/50 p-3 rounded-lg">
                            {block.hash}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <LinkIcon className="w-4 h-4" />
                            Previous Hash
                          </div>
                          <p className="font-mono text-sm text-foreground break-all bg-muted/50 p-3 rounded-lg">
                            {block.previousHash}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Clock className="w-4 h-4" />
                            Timestamp
                          </div>
                          <p className="text-foreground bg-muted/50 p-3 rounded-lg">
                            {new Date(block.timestamp).toLocaleString()}
                          </p>
                        </div>

                        {block.index > 0 && (
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Vote Data (Encrypted)
                            </div>
                            <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
                              <p><span className="text-muted-foreground">Vote Hash:</span> <span className="font-mono text-accent">{block.data.voteHash.slice(0, 16)}...</span></p>
                              <p><span className="text-muted-foreground">Candidate:</span> {getCandidateName(block.data.candidateId)}</p>
                              <p><span className="text-muted-foreground">Nonce:</span> {block.nonce}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 text-success text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          Block validated and verified
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blockchain;
