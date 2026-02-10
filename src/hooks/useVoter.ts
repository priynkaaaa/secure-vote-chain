import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useVoter = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["voter", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("voters")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useRegisterVoter = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (voterData: {
      voter_id: string;
      aadhaar_number: string;
      name: string;
      email: string;
      phone: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("voters")
        .insert({ ...voterData, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voter"] });
    },
  });
};

export const useCandidates = () => {
  return useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
};

export const useBlockchain = () => {
  return useQuery({
    queryKey: ["blockchain"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blockchain")
        .select("*")
        .order("block_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useCastVote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidateId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("cast-vote", {
        body: { candidateId },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voter"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["blockchain"] });
    },
  });
};

export const useVoterCount = () => {
  return useQuery({
    queryKey: ["voter-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("voters")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
};
