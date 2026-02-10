import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's JWT to get user identity
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { candidateId } = await req.json();
    if (!candidateId) {
      return new Response(JSON.stringify({ error: "candidateId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for privileged operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if voter exists and hasn't voted
    const { data: voter, error: voterError } = await supabase
      .from("voters")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (voterError || !voter) {
      return new Response(JSON.stringify({ error: "Voter not registered" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (voter.has_voted) {
      return new Response(JSON.stringify({ error: "Already voted" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify candidate exists
    const { data: candidate, error: candError } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", candidateId)
      .single();

    if (candError || !candidate) {
      return new Response(JSON.stringify({ error: "Invalid candidate" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get latest block
    const { data: latestBlock } = await supabase
      .from("blockchain")
      .select("*")
      .order("block_index", { ascending: false })
      .limit(1)
      .single();

    const previousHash = latestBlock?.hash || "0".repeat(64);
    const newIndex = (latestBlock?.block_index ?? -1) + 1;

    // Create block data
    const voterAnonymousId = generateHash(user.id + Math.random().toString());
    const voteHash = generateHash(JSON.stringify({ candidateId, timestamp: Date.now(), voterAnonymousId }));
    const blockHash = generateHash(previousHash + voteHash + Date.now().toString());
    const nonce = Math.floor(Math.random() * 100000);

    // Insert new block
    const { data: newBlock, error: blockError } = await supabase
      .from("blockchain")
      .insert({
        block_index: newIndex,
        hash: blockHash,
        previous_hash: previousHash,
        vote_hash: voteHash,
        candidate_id: candidateId,
        voter_anonymous_id: voterAnonymousId,
        nonce,
        is_valid: true,
      })
      .select()
      .single();

    if (blockError) {
      console.error("Block insert error:", blockError);
      return new Response(JSON.stringify({ error: "Failed to create block" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update candidate vote count
    await supabase
      .from("candidates")
      .update({ votes: candidate.votes + 1 })
      .eq("id", candidateId);

    // Mark voter as voted
    await supabase
      .from("voters")
      .update({ has_voted: true })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({ success: true, block: newBlock }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Cast vote error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
