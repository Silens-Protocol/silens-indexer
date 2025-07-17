import { onchainTable, index } from "ponder";

export const ModelStatus = {
  UNDER_REVIEW: 0,
  APPROVED: 1,
  FLAGGED: 2,
  DELISTED: 3,
} as const;

export const ProposalType = {
  APPROVE: 0,
  FLAG: 1,
  DELIST: 2,
} as const;

export const ProposalStatus = {
  ACTIVE: 0,
  PASSED: 1,
  FAILED: 2,
  EXECUTED: 3,
} as const;

export const BadgeType = {
  VERIFIED_REVIEWER: 1,
  TRUSTED_REVIEWER: 2,
  GOVERNANCE_VOTER: 3,
} as const;

export const model = onchainTable("model", (t) => ({
  id: t.bigint().primaryKey(),
  submitter: t.hex().notNull(),
  ipfsHash: t.text().notNull(),
  status: t.integer().notNull(),
  submissionTime: t.bigint().notNull(),
  reviewEndTime: t.bigint().notNull(),
  upvotes: t.integer().notNull(),
  downvotes: t.integer().notNull(),
  createdAt: t.bigint().notNull(),
  updatedAt: t.bigint().notNull(),
  creationTxHash: t.hex().notNull(),
  creationBlockNumber: t.bigint().notNull(),
}), (table) => ({
  submitterIdx: index().on(table.submitter),
  statusIdx: index().on(table.status),
  submissionTimeIdx: index().on(table.submissionTime),
  reviewEndTimeIdx: index().on(table.reviewEndTime),
}));

export const review = onchainTable("review", (t) => ({
  id: t.bigint().primaryKey(),
  modelId: t.bigint().notNull(),
  reviewer: t.hex().notNull(),
  ipfsHash: t.text().notNull(),
  severity: t.integer().notNull(),
  timestamp: t.bigint().notNull(),
  createdAt: t.bigint().notNull(),
  creationTxHash: t.hex().notNull(),
  creationBlockNumber: t.bigint().notNull(),
}), (table) => ({
  modelIdIdx: index().on(table.modelId),
  reviewerIdx: index().on(table.reviewer),
  severityIdx: index().on(table.severity),
  timestampIdx: index().on(table.timestamp),
}));

export const proposal = onchainTable("proposal", (t) => ({
  id: t.bigint().primaryKey(),
  modelId: t.bigint().notNull(),
  proposalType: t.integer().notNull(),
  status: t.integer().notNull(),
  forVotes: t.integer().notNull(),
  againstVotes: t.integer().notNull(),
  startTime: t.bigint().notNull(),
  endTime: t.bigint().notNull(),
  executed: t.boolean().notNull(),
  totalGovernanceVoters: t.integer(),
  quorum: t.integer(),
  quorumMet: t.boolean(),
  majorityWon: t.boolean(),
  createdAt: t.bigint().notNull(),
  updatedAt: t.bigint().notNull(),
  creationTxHash: t.hex().notNull(),
  creationBlockNumber: t.bigint().notNull(),
  executionTxHash: t.hex(),
  executionBlockNumber: t.bigint(),
}), (table) => ({
  modelIdIdx: index().on(table.modelId),
  proposalTypeIdx: index().on(table.proposalType),
  statusIdx: index().on(table.status),
  startTimeIdx: index().on(table.startTime),
  endTimeIdx: index().on(table.endTime),
  executedIdx: index().on(table.executed),
}));

export const vote = onchainTable("vote", (t) => ({
  id: t.bigint().primaryKey(),
  proposalId: t.bigint().notNull(),
  voter: t.hex().notNull(),
  support: t.boolean().notNull(),
  forVotes: t.integer().notNull(),
  againstVotes: t.integer().notNull(),
  timestamp: t.bigint().notNull(),
  createdAt: t.bigint().notNull(),
  creationTxHash: t.hex().notNull(),
  creationBlockNumber: t.bigint().notNull(),
}), (table) => ({
  proposalIdIdx: index().on(table.proposalId),
  voterIdx: index().on(table.voter),
  supportIdx: index().on(table.support),
  timestampIdx: index().on(table.timestamp),
}));

export const user = onchainTable("user", (t) => ({
  address: t.hex().primaryKey(),
  identityTokenId: t.bigint(),
  reputationScore: t.integer().notNull(),
  verifiedPlatforms: t.text().notNull(),
  createdAt: t.bigint().notNull(),
  updatedAt: t.bigint().notNull(),
  firstActivityTxHash: t.hex().notNull(),
  firstActivityBlockNumber: t.bigint().notNull(),
  lastActivityTxHash: t.hex().notNull(),
  lastActivityBlockNumber: t.bigint().notNull(),
}), (table) => ({
  reputationScoreIdx: index().on(table.reputationScore),
  identityTokenIdIdx: index().on(table.identityTokenId),
}));

export const badge = onchainTable("badge", (t) => ({
  id: t.bigint().primaryKey(),
  userId: t.hex().notNull(),
  badgeId: t.integer().notNull(),
  badgeName: t.text().notNull(),
  awardedAt: t.bigint().notNull(),
  createdAt: t.bigint().notNull(),
  updatedAt: t.bigint().notNull(),
  creationTxHash: t.hex().notNull(),
  creationBlockNumber: t.bigint().notNull(),
}), (table) => ({
  userIdIdx: index().on(table.userId),
  badgeIdIdx: index().on(table.badgeId),
  awardedAtIdx: index().on(table.awardedAt),
}));

export const identity = onchainTable("identity", (t) => ({
  tokenId: t.bigint().primaryKey(),
  owner: t.hex().notNull(),
  uri: t.text().notNull(),
  mintedAt: t.bigint().notNull(),
  createdAt: t.bigint().notNull(),
  updatedAt: t.bigint().notNull(),
  creationTxHash: t.hex().notNull(),
  creationBlockNumber: t.bigint().notNull(),
}), (table) => ({
  ownerIdx: index().on(table.owner),
  mintedAtIdx: index().on(table.mintedAt),
}));

export const platformVerification = onchainTable("platform_verification", (t) => ({
  id: t.bigint().primaryKey(),
  tokenId: t.bigint().notNull(),
  platform: t.text().notNull(),
  username: t.text().notNull(),
  owner: t.hex().notNull(),
    verifiedAt: t.bigint().notNull(),
  createdAt: t.bigint().notNull(),
  updatedAt: t.bigint().notNull(),
  creationTxHash: t.hex().notNull(),
  creationBlockNumber: t.bigint().notNull(),
}), (table) => ({
  tokenIdIdx: index().on(table.tokenId),
  ownerIdx: index().on(table.owner),
  platformIdx: index().on(table.platform),
  verifiedAtIdx: index().on(table.verifiedAt),
}));

export const reputationHistory = onchainTable("reputation_history", (t) => ({
  id: t.bigint().primaryKey(),
  userId: t.hex().notNull(),
  newScore: t.integer().notNull(),
  pointsAdded: t.integer().notNull(),
  reason: t.text().notNull(),
  createdAt: t.bigint().notNull(),
  creationTxHash: t.hex().notNull(),
  creationBlockNumber: t.bigint().notNull(),
}), (table) => ({
  userIdIdx: index().on(table.userId),
  reasonIdx: index().on(table.reason),
  createdAtIdx: index().on(table.createdAt),
}));

export const userStats = onchainTable("user_stats", (t) => ({
  address: t.hex().primaryKey(),
  totalModels: t.integer().notNull(),
  totalReviews: t.integer().notNull(),
  totalProposals: t.integer().notNull(),
  totalVotes: t.integer().notNull(),
  totalBadges: t.integer().notNull(),
  verifiedPlatformsCount: t.integer().notNull(),
  reputationScore: t.integer().notNull(),
  lastActivityAt: t.bigint().notNull(),
}), (table) => ({
  reputationScoreIdx: index().on(table.reputationScore),
  totalModelsIdx: index().on(table.totalModels),
  totalReviewsIdx: index().on(table.totalReviews),
  lastActivityIdx: index().on(table.lastActivityAt),
}));

export const modelStats = onchainTable("model_stats", (t) => ({
  id: t.bigint().primaryKey(),
  totalReviews: t.integer().notNull(),
  averageSeverity: t.real().notNull(),
  criticalReviewsCount: t.integer().notNull(),
  highSeverityReviewsCount: t.integer().notNull(),
  mediumSeverityReviewsCount: t.integer().notNull(),
  lowSeverityReviewsCount: t.integer().notNull(),
  lastReviewAt: t.bigint(),
  proposalCount: t.integer().notNull(),
  lastProposalAt: t.bigint(),
}), (table) => ({
  criticalReviewsIdx: index().on(table.criticalReviewsCount),
  lastReviewIdx: index().on(table.lastReviewAt),
}));

export const proposalStats = onchainTable("proposal_stats", (t) => ({
  id: t.bigint().primaryKey(),
  totalVotes: t.integer().notNull(),
  forVotes: t.integer().notNull(),
  againstVotes: t.integer().notNull(),
  participationRate: t.real().notNull(),
  quorumMet: t.boolean().notNull(),
  majorityWon: t.boolean().notNull(),
  executionTime: t.bigint(),
}), (table) => ({
  participationRateIdx: index().on(table.participationRate),
  quorumMetIdx: index().on(table.quorumMet),
  majorityWonIdx: index().on(table.majorityWon),
}));

export const globalStats = onchainTable("global_stats", (t) => ({
  id: t.text().primaryKey(),
  totalModels: t.integer().notNull(),
  totalReviews: t.integer().notNull(),
  totalProposals: t.integer().notNull(),
  totalVotes: t.integer().notNull(),
  totalUsers: t.integer().notNull(),
  totalIdentities: t.integer().notNull(),
  totalBadges: t.integer().notNull(),
  totalPlatformVerifications: t.integer().notNull(),
  averageReputationScore: t.real().notNull(),
  lastUpdatedAt: t.bigint().notNull(),
}), (table) => ({
  totalModelsIdx: index().on(table.totalModels),
  totalUsersIdx: index().on(table.totalUsers),
  lastUpdatedIdx: index().on(table.lastUpdatedAt),
}));