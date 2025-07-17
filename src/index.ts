import { ponder } from "ponder:registry";
import { 
  model, 
  review, 
  proposal, 
  vote, 
  user, 
  badge, 
  identity, 
  platformVerification, 
  reputationHistory,
  userStats,
  modelStats,
  proposalStats,
  globalStats,
} from "ponder:schema";

// ==================== SilensModelRegistry Events ====================

ponder.on("SilensModel:ModelSubmitted", async ({ event, context }) => {
  const { 
    modelId, 
    submitter, 
    ipfsHash, 
    status, 
    submissionTime, 
    reviewEndTime 
  } = event.args;

  await context.db
    .insert(model)
    .values({
      id: modelId,
      submitter,
      ipfsHash,
      status,
      submissionTime,
      reviewEndTime,
      upvotes: 0,
      downvotes: 0,
      createdAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
      creationTxHash: event.transaction.hash,
      creationBlockNumber: event.block.number,
    })

  await context.db
    .insert(userStats)
    .values({
      address: submitter,
      totalModels: 1,
      totalReviews: 0,
      totalProposals: 0,
      totalVotes: 0,
      totalBadges: 0,
      verifiedPlatformsCount: 0,
      reputationScore: 0,
      lastActivityAt: event.block.timestamp,
    })
    .onConflictDoUpdate((existing) => ({
      totalModels: existing.totalModels + 1,
      lastActivityAt: event.block.timestamp,
    }));

  await context.db
    .insert(globalStats)
    .values({
      id: "global",
      totalModels: 1,
      totalReviews: 0,
      totalProposals: 0,
      totalVotes: 0,
      totalUsers: 1,
      totalIdentities: 0,
      totalBadges: 0,
      totalPlatformVerifications: 0,
      averageReputationScore: 0,
      lastUpdatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate((existing) => ({
      totalModels: existing.totalModels + 1,
      lastUpdatedAt: event.block.timestamp,
    }));
});

ponder.on("SilensModel:ReviewSubmitted", async ({ event, context }) => {
  const { 
    modelId, 
    reviewer, 
    ipfsHash, 
    severity, 
    timestamp 
  } = event.args;

  await context.db
    .insert(review)
    .values({
      id: BigInt(event.log.logIndex),
      modelId,
      reviewer,
      ipfsHash,
      severity,
      timestamp,
      createdAt: event.block.timestamp,
      creationTxHash: event.transaction.hash,
      creationBlockNumber: event.block.number,
    })

  await context.db
    .insert(userStats)
    .values({
      address: reviewer,
      totalModels: 0,
      totalReviews: 1,
      totalProposals: 0,
      totalVotes: 0,
      totalBadges: 0,
      verifiedPlatformsCount: 0,
      reputationScore: 0,
      lastActivityAt: event.block.timestamp,
    })
    .onConflictDoUpdate((existing) => ({
      totalReviews: existing.totalReviews + 1,
      lastActivityAt: event.block.timestamp,
    }));

  await context.db
    .insert(modelStats)
    .values({
      id: modelId,
      totalReviews: 1,
      averageSeverity: severity,
      criticalReviewsCount: severity >= 4 ? 1 : 0,
      highSeverityReviewsCount: severity >= 3 ? 1 : 0,
      mediumSeverityReviewsCount: severity >= 2 ? 1 : 0,
      lowSeverityReviewsCount: severity >= 1 ? 1 : 0,
      lastReviewAt: event.block.timestamp,
      proposalCount: 0,
    })
    .onConflictDoUpdate((existing) => ({
      totalReviews: existing.totalReviews + 1,
      averageSeverity: (existing.averageSeverity * existing.totalReviews + severity) / (existing.totalReviews + 1),
      criticalReviewsCount: existing.criticalReviewsCount + (severity >= 4 ? 1 : 0),
      highSeverityReviewsCount: existing.highSeverityReviewsCount + (severity >= 3 ? 1 : 0),
      mediumSeverityReviewsCount: existing.mediumSeverityReviewsCount + (severity >= 2 ? 1 : 0),
      lowSeverityReviewsCount: existing.lowSeverityReviewsCount + (severity >= 1 ? 1 : 0),
      lastReviewAt: event.block.timestamp,
    }));

  await context.db
    .insert(globalStats)
    .values({
      id: "global",
      totalModels: 0,
      totalReviews: 1,
      totalProposals: 0,
      totalVotes: 0,
      totalUsers: 1,
      totalIdentities: 0,
      totalBadges: 0,
      totalPlatformVerifications: 0,
      averageReputationScore: 0,
      lastUpdatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate((existing) => ({
      totalReviews: existing.totalReviews + 1,
      lastUpdatedAt: event.block.timestamp,
    }));
});

ponder.on("SilensModel:ModelStatusUpdated", async ({ event, context }) => {
  const { modelId, newStatus } = event.args;

  await context.db
    .update(model, { id: modelId })
    .set({
      status: newStatus,
      updatedAt: event.block.timestamp,
    });
});

// ==================== SilensProposalVoting Events ====================

ponder.on("SilensProposal:ProposalCreated", async ({ event, context }) => {
  const { 
    proposalId, 
    modelId, 
    proposalType, 
    status, 
    forVotes, 
    againstVotes, 
    startTime, 
    endTime, 
    executed 
  } = event.args;

  await context.db
    .insert(proposal)
    .values({
      id: proposalId,
      modelId,
      proposalType,
      status,
      forVotes: Number(forVotes),
      againstVotes: Number(againstVotes),
      startTime,
      endTime,
      executed,
      createdAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
      creationTxHash: event.transaction.hash,
      creationBlockNumber: event.block.number,
    })

  await context.db
    .insert(modelStats)
    .values({
      id: modelId,
      totalReviews: 0,
      averageSeverity: 0,
      criticalReviewsCount: 0,
      highSeverityReviewsCount: 0,
      mediumSeverityReviewsCount: 0,
      lowSeverityReviewsCount: 0,
      proposalCount: 1,
      lastProposalAt: event.block.timestamp,
    })
    .onConflictDoUpdate((existing) => ({
      proposalCount: existing.proposalCount + 1,
      lastProposalAt: event.block.timestamp,
    }));

  await context.db
    .insert(globalStats)
    .values({
      id: "global",
      totalModels: 0,
      totalReviews: 0,
      totalProposals: 1,
      totalVotes: 0,
      totalUsers: 0,
      totalIdentities: 0,
      totalBadges: 0,
      totalPlatformVerifications: 0,
      averageReputationScore: 0,
      lastUpdatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate((existing) => ({
      totalProposals: existing.totalProposals + 1,
      lastUpdatedAt: event.block.timestamp,
    }));
});

ponder.on("SilensProposal:VoteCast", async ({ event, context }) => {
  const { 
    proposalId, 
    voter, 
    support, 
    forVotes, 
    againstVotes, 
    timestamp 
  } = event.args;

  await context.db
    .insert(vote)
    .values({
      id: BigInt(event.log.logIndex),
      proposalId,
      voter,
      support,
      forVotes: Number(forVotes),
      againstVotes: Number(againstVotes),
      timestamp,
      createdAt: event.block.timestamp,
      creationTxHash: event.transaction.hash,
      creationBlockNumber: event.block.number,
    })

  await context.db
    .insert(proposalStats)
    .values({
      id: proposalId,
      totalVotes: 1,
      forVotes: Number(forVotes),
      againstVotes: Number(againstVotes),
      participationRate: 0,
      quorumMet: false,
      majorityWon: false,
    })
    .onConflictDoUpdate((existing) => ({
      totalVotes: existing.totalVotes + 1,
      forVotes: Number(forVotes),
      againstVotes: Number(againstVotes),
    }));

  await context.db
    .insert(userStats)
    .values({
      address: voter,
      totalModels: 0,
      totalReviews: 0,
      totalProposals: 0,
      totalVotes: 1,
      totalBadges: 0,
      verifiedPlatformsCount: 0,
      reputationScore: 0,
      lastActivityAt: event.block.timestamp,
    })
    .onConflictDoUpdate((existing) => ({
      totalVotes: existing.totalVotes + 1,
      lastActivityAt: event.block.timestamp,
    }));

  await context.db
    .insert(globalStats)
    .values({
      id: "global",
      totalModels: 0,
      totalReviews: 0,
      totalProposals: 0,
      totalVotes: 1,
      totalUsers: 1,
      totalIdentities: 0,
      totalBadges: 0,
      totalPlatformVerifications: 0,
      averageReputationScore: 0,
      lastUpdatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate((existing) => ({
      totalVotes: existing.totalVotes + 1,
      lastUpdatedAt: event.block.timestamp,
    }));
});

ponder.on("SilensProposal:ProposalExecuted", async ({ event, context }) => {
  const { 
    proposalId, 
    result, 
    forVotes, 
    againstVotes, 
    totalGovernanceVoters, 
    quorum, 
    quorumMet, 
    majorityWon 
  } = event.args;

  await context.db
    .update(proposal, { id: proposalId })
    .set({
      status: result,
      executed: true,
      totalGovernanceVoters: Number(totalGovernanceVoters),
      quorum: Number(quorum),
      quorumMet,
      majorityWon,
      updatedAt: event.block.timestamp,
      executionTxHash: event.transaction.hash,
      executionBlockNumber: event.block.number,
    });

  await context.db
    .update(proposalStats, { id: proposalId })
    .set({
      forVotes: Number(forVotes),
      againstVotes: Number(againstVotes),
      quorumMet,
      majorityWon,
      executionTime: event.block.timestamp,
    });
});

// ==================== SilensReputationSystem Events ====================

ponder.on("SilensReputation:ReputationUpdated", async ({ event, context }) => {
  const { user: userId, newScore, pointsAdded, reason } = event.args;

  await context.db
    .insert(reputationHistory)
    .values({
      id: BigInt(event.log.logIndex),
      userId,
      newScore: Number(newScore),
      pointsAdded: Number(pointsAdded),
      reason,
      createdAt: event.block.timestamp,
      creationTxHash: event.transaction.hash,
      creationBlockNumber: event.block.number,
    })

  await context.db
    .insert(user)
    .values({
      address: userId,
      reputationScore: Number(newScore),
      verifiedPlatforms: "",
      createdAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
      firstActivityTxHash: event.transaction.hash,
      firstActivityBlockNumber: event.block.number,
      lastActivityTxHash: event.transaction.hash,
      lastActivityBlockNumber: event.block.number,
    })
    .onConflictDoUpdate((existing) => ({
      reputationScore: Number(newScore),
      updatedAt: event.block.timestamp,
      lastActivityTxHash: event.transaction.hash,
      lastActivityBlockNumber: event.block.number,
    }));

  await context.db
    .insert(userStats)
    .values({
      address: userId,
      totalModels: 0,
      totalReviews: 0,
      totalProposals: 0,
      totalVotes: 0,
      totalBadges: 0,
      verifiedPlatformsCount: 0,
      reputationScore: Number(newScore),
      lastActivityAt: event.block.timestamp,
    })
    .onConflictDoUpdate((existing) => ({
      reputationScore: Number(newScore),
      lastActivityAt: event.block.timestamp,
    }));
});

ponder.on("SilensReputation:BadgeAwarded", async ({ event, context }) => {
  const { user: userId, badgeId, badgeName, timestamp } = event.args;

  await context.db
    .insert(badge)
    .values({
      id: BigInt(event.log.logIndex),
      userId,
      badgeId: Number(badgeId),
      badgeName,
      awardedAt: timestamp,
      createdAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
      creationTxHash: event.transaction.hash,
      creationBlockNumber: event.block.number,
    })

  await context.db
    .insert(userStats)
    .values({
      address: userId,
      totalModels: 0,
      totalReviews: 0,
      totalProposals: 0,
      totalVotes: 0,
      totalBadges: 1,
      verifiedPlatformsCount: 0,
      reputationScore: 0,
      lastActivityAt: event.block.timestamp,
    })
    .onConflictDoUpdate((existing) => ({
      totalBadges: existing.totalBadges + 1,
      lastActivityAt: event.block.timestamp,
    }));

  await context.db
    .insert(globalStats)
    .values({
      id: "global",
      totalModels: 0,
      totalReviews: 0,
      totalProposals: 0,
      totalVotes: 0,
      totalUsers: 0,
      totalIdentities: 0,
      totalBadges: 1,
      totalPlatformVerifications: 0,
      averageReputationScore: 0,
      lastUpdatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate((existing) => ({
      totalBadges: existing.totalBadges + 1,
      lastUpdatedAt: event.block.timestamp,
    }));
});

// ==================== SilensIdentity Events ====================

ponder.on("SilensIdentityRegistry:IdentityMinted", async ({ event, context }) => {
  const { owner, tokenId, uri, timestamp } = event.args;

  await context.db
    .insert(identity)
    .values({
      tokenId,
      owner,
      uri,
      mintedAt: timestamp,
      createdAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
      creationTxHash: event.transaction.hash,
      creationBlockNumber: event.block.number,
    })

  await context.db
    .insert(user)
    .values({
      address: owner,
      identityTokenId: tokenId,
      reputationScore: 0,
      verifiedPlatforms: "",
      createdAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
      firstActivityTxHash: event.transaction.hash,
      firstActivityBlockNumber: event.block.number,
      lastActivityTxHash: event.transaction.hash,
      lastActivityBlockNumber: event.block.number,
    })
    .onConflictDoUpdate((existing) => ({
      identityTokenId: tokenId,
      updatedAt: event.block.timestamp,
      lastActivityTxHash: event.transaction.hash,
      lastActivityBlockNumber: event.block.number,
    }));

  await context.db
    .insert(globalStats)
    .values({
      id: "global",
      totalModels: 0,
      totalReviews: 0,
      totalProposals: 0,
      totalVotes: 0,
      totalUsers: 1,
      totalIdentities: 1,
      totalBadges: 0,
      totalPlatformVerifications: 0,
      averageReputationScore: 0,
      lastUpdatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate((existing) => ({
      totalIdentities: existing.totalIdentities + 1,
      lastUpdatedAt: event.block.timestamp,
    }));
});

ponder.on("SilensIdentityRegistry:PlatformVerified", async ({ event, context }) => {
  const { tokenId, platform, username, owner, timestamp } = event.args;

  await context.db
    .insert(platformVerification)
    .values({
      id: BigInt(event.log.logIndex),
      tokenId,
      platform,
      username,
      owner,
      verifiedAt: timestamp,
      createdAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
      creationTxHash: event.transaction.hash,
      creationBlockNumber: event.block.number,
    })

  const existingUser = await context.db
    .find(user, { address: owner });

  const currentPlatforms = existingUser?.verifiedPlatforms || "";
  const newPlatforms = currentPlatforms ? `${currentPlatforms},${platform}:${username}` : `${platform}:${username}`;

  await context.db
    .update(user, { address: owner })
    .set({
      verifiedPlatforms: newPlatforms,
      updatedAt: event.block.timestamp,
    });

  await context.db
    .insert(userStats)
    .values({
      address: owner,
      totalModels: 0,
      totalReviews: 0,
      totalProposals: 0,
      totalVotes: 0,
      totalBadges: 0,
      verifiedPlatformsCount: 1,
      reputationScore: 0,
      lastActivityAt: event.block.timestamp,
    })
    .onConflictDoUpdate((existing) => ({
      verifiedPlatformsCount: existing.verifiedPlatformsCount + 1,
      lastActivityAt: event.block.timestamp,
    }));

  await context.db
    .insert(globalStats)
    .values({
      id: "global",
      totalModels: 0,
      totalReviews: 0,
      totalProposals: 0,
      totalVotes: 0,
      totalUsers: 0,
      totalIdentities: 0,
      totalBadges: 0,
      totalPlatformVerifications: 1,
      averageReputationScore: 0,
      lastUpdatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate((existing) => ({
      totalPlatformVerifications: existing.totalPlatformVerifications + 1,
      lastUpdatedAt: event.block.timestamp,
    }));
});

ponder.on("SilensIdentityRegistry:SetIdentitiesRoot", async ({ event, context }) => {
  const { id, identitiesRoot } = event.args;
  console.log(`Identity root set for token ${id}: ${identitiesRoot}`);
});