import { create } from 'zustand';

export interface Voter {
  id: string;
  voterId: string;
  aadhaarNumber: string;
  name: string;
  email: string;
  phone: string;
  hasVoted: boolean;
  registeredAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol: string;
  votes: number;
}

export interface Block {
  index: number;
hash: string;
  previousHash: string;
  timestamp: string;
  data: {
    voteHash: string;
    candidateId: string;
    voterAnonymousId: string;
  };
  nonce: number;
  isValid: boolean;
}

export interface VotingState {
  currentVoter: Voter | null;
  isAuthenticated: boolean;
  hasVoted: boolean;
  candidates: Candidate[];
  blockchain: Block[];
  voters: Voter[];
  votingOpen: boolean;
  
  // Actions
  registerVoter: (voter: Omit<Voter, 'id' | 'hasVoted' | 'registeredAt'>) => boolean;
  login: (voterId: string, aadhaar: string) => boolean;
  logout: () => void;
  castVote: (candidateId: string) => Block | null;
  verifyVoter: (voterId: string) => { isRegistered: boolean; hasVoted: boolean };
}

// Generate a mock hash
const generateHash = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64);
};

// Initial candidates
const initialCandidates: Candidate[] = [
  { id: '1', name: 'Rajesh Kumar', party: 'Progressive Party', symbol: '🌸', votes: 0 },
  { id: '2', name: 'Priya Sharma', party: 'Democratic Alliance', symbol: '🌳', votes: 0 },
  { id: '3', name: 'Amit Patel', party: 'National Front', symbol: '🦁', votes: 0 },
  { id: '4', name: 'Sunita Devi', party: 'People\'s Movement', symbol: '🌻', votes: 0 },
];

// Genesis block
const genesisBlock: Block = {
  index: 0,
  hash: generateHash('genesis'),
  previousHash: '0'.repeat(64),
  timestamp: new Date().toISOString(),
  data: {
    voteHash: 'GENESIS_BLOCK',
    candidateId: '',
    voterAnonymousId: '',
  },
  nonce: 0,
  isValid: true,
};

export const useVotingStore = create<VotingState>((set, get) => ({
  currentVoter: null,
  isAuthenticated: false,
  hasVoted: false,
  candidates: initialCandidates,
  blockchain: [genesisBlock],
  voters: [],
  votingOpen: true,

  registerVoter: (voterData) => {
    const { voters } = get();
    
    // Check if voter already exists
    const exists = voters.some(v => v.voterId === voterData.voterId || v.aadhaarNumber === voterData.aadhaarNumber);
    if (exists) return false;

    const newVoter: Voter = {
      ...voterData,
      id: generateHash(voterData.voterId + Date.now()),
      hasVoted: false,
      registeredAt: new Date().toISOString(),
    };

    set({ voters: [...voters, newVoter] });
    return true;
  },

  login: (voterId, aadhaar) => {
    const { voters } = get();
    const voter = voters.find(v => v.voterId === voterId && v.aadhaarNumber === aadhaar);
    
    if (voter) {
      set({ 
        currentVoter: voter, 
        isAuthenticated: true,
        hasVoted: voter.hasVoted,
      });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ currentVoter: null, isAuthenticated: false, hasVoted: false });
  },

  castVote: (candidateId) => {
    const { currentVoter, blockchain, candidates, voters, hasVoted } = get();
    
    if (!currentVoter || hasVoted) return null;

    // Create vote data
    const voteData = {
      candidateId,
      timestamp: Date.now(),
      voterAnonymousId: generateHash(currentVoter.id + Math.random()),
    };

    const voteHash = generateHash(JSON.stringify(voteData));
    const previousBlock = blockchain[blockchain.length - 1];

    // Create new block
    const newBlock: Block = {
      index: blockchain.length,
      hash: generateHash(previousBlock.hash + voteHash + Date.now()),
      previousHash: previousBlock.hash,
      timestamp: new Date().toISOString(),
      data: {
        voteHash,
        candidateId,
        voterAnonymousId: voteData.voterAnonymousId,
      },
      nonce: Math.floor(Math.random() * 100000),
      isValid: true,
    };

    // Update candidate votes
    const updatedCandidates = candidates.map(c =>
      c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
    );

    // Update voter status
    const updatedVoters = voters.map(v =>
      v.id === currentVoter.id ? { ...v, hasVoted: true } : v
    );

    set({
      blockchain: [...blockchain, newBlock],
      candidates: updatedCandidates,
      voters: updatedVoters,
      currentVoter: { ...currentVoter, hasVoted: true },
      hasVoted: true,
    });

    return newBlock;
  },

  verifyVoter: (voterId) => {
    const { voters } = get();
    const voter = voters.find(v => v.voterId === voterId);
    
    return {
      isRegistered: !!voter,
      hasVoted: voter?.hasVoted ?? false,
    };
  },
}));
