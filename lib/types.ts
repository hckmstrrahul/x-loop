export type DraftScore = {
  quality_score: number;
  slop_score: number;
  has_minor_score: number;
  banger_pool: boolean;
  tweet_bool_metadata: {
    is_question: boolean;
    has_link: boolean;
    has_hashtag: boolean;
    has_mention: boolean;
    has_emoji: boolean;
    is_engagement_bait: boolean;
    looks_thread_opener: boolean;
    all_caps: boolean;
    over_280: boolean;
  };
  predicted_actions: {
    follow_author: number;
    share_via_dm: number;
    profile_click: number;
    dwell_time: number;
    not_interested: number;
    mute_author: number;
    block_author: number;
    report: number;
  };
  reasoning: string;
};

export type BrandVerdict = 'Safe' | 'LowRisk' | 'MediumRisk';

export type QuoteSafety = {
  verdict: BrandVerdict;
  labels: Array<{ name: string; source: string }>;
  reasoning: string;
};

export type ScoredPost = {
  text: string;
  score: DraftScore;
};

export type HistoryArchetype = {
  rank: number;
  kind: 'highest-yield' | 'steady-earner' | 'sleeper-hit' | 'avoid' | 'neutral';
  title: string;
  description: string;
  n: number;
  mean_quality: number;
  mean_slop: number;
  banger_rate: number;
};

export type HistoryAnalysis = {
  scored: ScoredPost[];
  summary: {
    posts_scored: number;
    banger_rate: number;
    slop_rate: number;
    median_quality: number;
    minor_flagged: number;
  };
  archetypes: HistoryArchetype[];
};
