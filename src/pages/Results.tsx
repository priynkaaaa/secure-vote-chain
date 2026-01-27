import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useVotingStore } from "@/store/votingStore";
import { BarChart3, Users, TrendingUp, CheckCircle2 } from "lucide-react";

const Results = () => {
  const { candidates, blockchain, voters } = useVotingStore();

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
  const winner = sortedCandidates[0];
  const totalRegistered = voters.length;
  const turnoutPercentage = totalRegistered > 0 ? ((totalVotes / totalRegistered) * 100).toFixed(1) : 0;

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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Election Results
            </h1>
            <p className="text-muted-foreground">
              Real-time results verified on the blockchain
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered Voters</p>
                  <p className="text-2xl font-bold text-foreground">{totalRegistered}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Votes Cast</p>
                  <p className="text-2xl font-bold text-foreground">{totalVotes}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Voter Turnout</p>
                  <p className="text-2xl font-bold text-foreground">{turnoutPercentage}%</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-8"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">Candidate Results</h2>

            {totalVotes === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No votes have been cast yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Results will appear here once voting begins.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedCandidates.map((candidate, index) => {
                  const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;
                  const isWinner = index === 0 && candidate.votes > 0;

                  return (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className={`relative p-4 rounded-xl ${
                        isWinner ? "bg-success/10 border-2 border-success" : "bg-muted/50"
                      }`}
                    >
                      {isWinner && (
                        <div className="absolute -top-3 right-4 px-3 py-1 bg-success text-success-foreground text-xs font-semibold rounded-full">
                          Leading
                        </div>
                      )}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                          {candidate.symbol}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">{candidate.party}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">{candidate.votes}</p>
                          <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                          className={`h-full rounded-full ${
                            isWinner
                              ? "bg-gradient-to-r from-success to-accent"
                              : "bg-gradient-to-r from-primary to-accent"
                          }`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Blockchain Verification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Results verified on blockchain ({blockchain.length} blocks)
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
