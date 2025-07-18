import { db } from "ponder:api";
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
  ModelStatus,
  ProposalStatus
} from "ponder:schema";
import { Hono } from "hono";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { graphql } from "ponder";
import { serializeBigInts, getModelWithRelatedData, getProposalWithRelatedData, getUserWithRelatedData, getReviewerWithProfileData, getVoteWithRelatedData } from "../utils";
import { getIPFSData, getIPFSImageUrl } from "../utils/pinata";

const app = new Hono();

app.use("/graphql", graphql({ 
  db, 
  schema: { 
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
    globalStats
  } 
}));

// ==================== Models API ====================

app.get("/models", async (c) => {
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");
  const status = c.req.query("status");
  const excludeStatus = c.req.query("excludeStatus");
  const submitter = c.req.query("submitter");
  const includeRelated = c.req.query("includeRelated") === "true";

  const conditions = [];
  if (status !== undefined) conditions.push(eq(model.status, parseInt(status)));
  if (excludeStatus !== undefined) conditions.push(sql`${model.status} != ${parseInt(excludeStatus)}`);
  if (submitter) conditions.push(eq(model.submitter, submitter as `0x${string}`));
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const query = db.select().from(model);
  if (whereClause) {
    query.where(whereClause);
  }
  const results = await query
    .orderBy(desc(model.createdAt))
    .limit(limit)
    .offset(offset);

  if (!includeRelated) {
    return c.json({
      models: serializeBigInts(results),
      pagination: { limit, offset }
    });
  }

  const modelsWithRelated = await Promise.all(
    results.map(async (modelData) => {
      return await getModelWithRelatedData(modelData, db, getIPFSData, getIPFSImageUrl);
    })
  );

  return c.json({
    models: serializeBigInts(modelsWithRelated),
    pagination: { limit, offset }
  });
});

app.get("/models/:id", async (c) => {
  const modelId = BigInt(c.req.param("id"));

  const modelData = await db.select()
    .from(model)
    .where(eq(model.id, modelId))
    .limit(1);

  if (modelData.length === 0) {
    return c.json({ error: "Model not found" }, 404);
  }

  const modelRecord = modelData[0]!;
  const modelWithRelated = await getModelWithRelatedData(modelRecord, db, getIPFSData, getIPFSImageUrl);

  return c.json(serializeBigInts(modelWithRelated));
});

app.get("/models/:id/reviews", async (c) => {
  const modelId = BigInt(c.req.param("id"));
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");
  const severity = c.req.query("severity");

  const conditions = [eq(review.modelId, modelId)];
  if (severity !== undefined) conditions.push(eq(review.severity, parseInt(severity)));

  const results = await db.select()
    .from(review)
    .where(and(...conditions))
    .orderBy(desc(review.timestamp))
    .limit(limit)
    .offset(offset);

  const reviewsWithUsers = await Promise.all(
    results.map(async (reviewData) => {
      const reviewer = await getReviewerWithProfileData(reviewData.reviewer, db, getIPFSData, getIPFSImageUrl);

      let reviewMetadata: any = null;
      try {
        const reviewIpfsData = await getIPFSData(reviewData.ipfsHash);
        if (reviewIpfsData && reviewIpfsData.data) {
          reviewMetadata = reviewIpfsData.data as any;
          
          if (reviewMetadata && reviewMetadata.screenshotHash) {
            reviewMetadata.screenshotUrl = await getIPFSImageUrl(reviewMetadata.screenshotHash);
          }
        }
      } catch (error) {
        console.error(`Error fetching review metadata for hash ${reviewData.ipfsHash}:`, error);
      }

      return {
        id: reviewData.id,
        reviewer,
        metadata: reviewMetadata,
        reviewType: reviewData.reviewType,
        severity: reviewData.severity,
        timestamp: reviewData.timestamp,
        createdAt: reviewData.createdAt
      };
    })
  );

  return c.json({
    reviews: serializeBigInts(reviewsWithUsers),
    pagination: { limit, offset }
  });
});

// ==================== Reviews API ====================

app.get("/reviews", async (c) => {
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");
  const reviewer = c.req.query("reviewer");
  const severity = c.req.query("severity");
  const modelId = c.req.query("modelId");

  const conditions = [];
  if (reviewer) conditions.push(eq(review.reviewer, reviewer as `0x${string}`));
  if (severity !== undefined) conditions.push(eq(review.severity, parseInt(severity)));
  if (modelId) conditions.push(eq(review.modelId, BigInt(modelId)));
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const results = await db.select()
    .from(review)
    .where(whereClause)
    .orderBy(desc(review.timestamp))
    .limit(limit)
    .offset(offset);

  const reviewsWithUsers = await Promise.all(
    results.map(async (reviewData) => {
      const reviewer = await getReviewerWithProfileData(reviewData.reviewer, db, getIPFSData, getIPFSImageUrl);

      let reviewMetadata: any = null;
      try {
        const reviewIpfsData = await getIPFSData(reviewData.ipfsHash);
        if (reviewIpfsData && reviewIpfsData.data) {
          reviewMetadata = reviewIpfsData.data as any;
          
          if (reviewMetadata && reviewMetadata.screenshotHash) {
            reviewMetadata.screenshotUrl = await getIPFSImageUrl(reviewMetadata.screenshotHash);
          }
        }
      } catch (error) {
        console.error(`Error fetching review metadata for hash ${reviewData.ipfsHash}:`, error);
      }

      return {
        id: reviewData.id,
        reviewer,
        metadata: reviewMetadata,
        reviewType: reviewData.reviewType,
        severity: reviewData.severity,
        timestamp: reviewData.timestamp,
        createdAt: reviewData.createdAt
      };
    })
  );

  return c.json({
    reviews: serializeBigInts(reviewsWithUsers),
    pagination: { limit, offset }
  });
});

// ==================== Proposals API ====================

app.get("/proposals", async (c) => {
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");
  const status = c.req.query("status");
  const proposalType = c.req.query("proposalType");
  const executed = c.req.query("executed");
  const includeRelated = c.req.query("includeRelated") === "true";

  const conditions = [];
  if (status !== undefined) conditions.push(eq(proposal.status, parseInt(status)));
  if (proposalType !== undefined) conditions.push(eq(proposal.proposalType, parseInt(proposalType)));
  if (executed !== undefined) conditions.push(eq(proposal.executed, executed === "true"));
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const results = await db.select()
    .from(proposal)
    .where(whereClause)
    .orderBy(desc(proposal.createdAt))
    .limit(limit)
    .offset(offset);

  if (!includeRelated) {
    return c.json({
      proposals: serializeBigInts(results),
      pagination: { limit, offset }
    });
  }

  const proposalsWithRelated = await Promise.all(
    results.map(async (proposalData) => {
      return await getProposalWithRelatedData(proposalData, db, getIPFSData, getIPFSImageUrl);
    })
  );

  return c.json({
    proposals: serializeBigInts(proposalsWithRelated),
    pagination: { limit, offset }
  });
});

app.get("/proposals/:id", async (c) => {
  const proposalId = BigInt(c.req.param("id"));
  const includeRelated = c.req.query("includeRelated") === "true";

  const proposalData = await db.select()
    .from(proposal)
    .where(eq(proposal.id, proposalId))
    .limit(1);

  if (proposalData.length === 0) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  if (!includeRelated) {
    const votesData = await db.select()
      .from(vote)
      .where(eq(vote.proposalId, proposalId))
      .orderBy(desc(vote.timestamp));

    const votes = await Promise.all(
      votesData.map(async (voteData) => {
        const voter = await db.select()
          .from(identity)
          .where(eq(identity.owner, voteData.voter))
          .limit(1);

        return {
          ...voteData,
          voter: voter[0] || null
        };
      })
    );

    const stats = await db.select()
      .from(proposalStats)
      .where(eq(proposalStats.id, proposalId))
      .limit(1);

    return c.json({
      proposal: serializeBigInts(proposalData[0]),
      votes: serializeBigInts(votes),
      stats: serializeBigInts(stats[0] || {})
    });
  }

  const proposalWithRelated = await getProposalWithRelatedData(proposalData[0], db, getIPFSData, getIPFSImageUrl);

  return c.json(serializeBigInts(proposalWithRelated));
});

app.get("/proposals/:id/votes", async (c) => {
  const proposalId = BigInt(c.req.param("id"));
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");
  const support = c.req.query("support");

  const conditions = [eq(vote.proposalId, proposalId)];
  if (support !== undefined) conditions.push(eq(vote.support, support === "true"));

  const results = await db.select()
    .from(vote)
    .where(and(...conditions))
    .orderBy(desc(vote.timestamp))
    .limit(limit)
    .offset(offset);

  const votesWithUsers = await Promise.all(
    results.map(async (voteData) => {
      const voterIdentity = await db.select()
        .from(identity)
        .where(eq(identity.owner, voteData.voter))
        .limit(1);

      let voterProfile: any = null;
      if (voterIdentity[0] && voterIdentity[0].uri) {
        try {
          const voterIpfsData = await getIPFSData(voterIdentity[0].uri);
          if (voterIpfsData && voterIpfsData.data) {
            voterProfile = voterIpfsData.data as any;
            
            if (voterProfile && voterProfile.profilePicture) {
              voterProfile.profilePictureUrl = await getIPFSImageUrl(voterProfile.profilePicture);
            }
          }
        } catch (error) {
          console.error(`Error fetching voter profile for hash ${voterIdentity[0].uri}:`, error);
        }
      }

      return {
        ...voteData,
        voter: {
          ...voterIdentity[0],
          profile: voterProfile
        }
      };
    })
  );

  return c.json({
    votes: serializeBigInts(votesWithUsers),
    pagination: { limit, offset }
  });
});

// ==================== Users API ====================

app.get("/users/:address", async (c) => {
  const address = c.req.param("address");

  const userData = await db.select()
    .from(user)
    .where(eq(user.address, address as `0x${string}`))
    .limit(1);

  if (userData.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  const stats = await db.select()
    .from(userStats)
    .where(eq(userStats.address, address as `0x${string}`))
    .limit(1);

  const badges = await db.select()
    .from(badge)
    .where(eq(badge.userId, address as `0x${string}`))
    .orderBy(desc(badge.awardedAt));

  const identityData = userData[0]?.identityTokenId ? await db.select()
    .from(identity)
    .where(eq(identity.tokenId, userData[0]?.identityTokenId))
    .limit(1) : [];

  const verifications = await db.select()
    .from(platformVerification)
    .where(eq(platformVerification.owner, address as `0x${string}`))
    .orderBy(desc(platformVerification.verifiedAt));

  const userWithRelated = await getUserWithRelatedData(
    userData[0]!,
    stats[0] || {},
    badges,
    identityData[0] || null,
    verifications,
    getIPFSData,
    getIPFSImageUrl
  );

  return c.json(serializeBigInts(userWithRelated));
});

app.get("/users/:address/models", async (c) => {
  const address = c.req.param("address");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");
  const includeRelated = c.req.query("includeRelated") === "true";

  const results = await db.select()
    .from(model)
    .where(eq(model.submitter, address as `0x${string}`))
    .orderBy(desc(model.createdAt))
    .limit(limit)
    .offset(offset);

  if (!includeRelated) {
    return c.json({
      models: serializeBigInts(results),
      pagination: { limit, offset }
    });
  }

  const modelsWithRelated = await Promise.all(
    results.map(async (modelData) => {
      return await getModelWithRelatedData(modelData, db, getIPFSData, getIPFSImageUrl);
    })
  );

  return c.json({
    models: serializeBigInts(modelsWithRelated),
    pagination: { limit, offset }
  });
});

app.get("/users/:address/reviews", async (c) => {
  const address = c.req.param("address");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");

  const results = await db.select()
    .from(review)
    .where(eq(review.reviewer, address as `0x${string}`))
    .orderBy(desc(review.timestamp))
    .limit(limit)
    .offset(offset);

  const reviewsWithUsers = await Promise.all(
    results.map(async (reviewData) => {
      const reviewer = await getReviewerWithProfileData(reviewData.reviewer, db, getIPFSData, getIPFSImageUrl);

      let reviewMetadata: any = null;
      try {
        const reviewIpfsData = await getIPFSData(reviewData.ipfsHash);
        if (reviewIpfsData && reviewIpfsData.data) {
          reviewMetadata = reviewIpfsData.data as any;
          
          if (reviewMetadata && reviewMetadata.screenshotHash) {
            reviewMetadata.screenshotUrl = await getIPFSImageUrl(reviewMetadata.screenshotHash);
          }
        }
      } catch (error) {
        console.error(`Error fetching review metadata for hash ${reviewData.ipfsHash}:`, error);
      }

      const modelData = await db.select()
        .from(model)
        .where(eq(model.id, reviewData.modelId))
        .limit(1);

      let modelMetadata: any = null;
      if (modelData[0] && modelData[0].ipfsHash) {
        try {
          const modelIpfsData = await getIPFSData(modelData[0].ipfsHash);
          if (modelIpfsData && modelIpfsData.data) {
            modelMetadata = modelIpfsData.data as any;
            
            if (modelMetadata && modelMetadata.imageHash) {
              modelMetadata.imageUrl = await getIPFSImageUrl(modelMetadata.imageHash);
            }
          }
        } catch (error) {
          console.error(`Error fetching model metadata for hash ${modelData[0].ipfsHash}:`, error);
        }
      }

      return {
        id: reviewData.id,
        reviewer,
        model: modelData[0] ? {
          id: modelData[0].id,
          submitter: modelData[0].submitter,
          status: modelData[0].status,
          metadata: modelMetadata
        } : null,
        metadata: reviewMetadata,
        reviewType: reviewData.reviewType,
        severity: reviewData.severity,
        timestamp: reviewData.timestamp,
        createdAt: reviewData.createdAt
      };
    })
  );

  return c.json({
    reviews: serializeBigInts(reviewsWithUsers),
    pagination: { limit, offset }
  });
});

app.get("/users/:address/votes", async (c) => {
  const address = c.req.param("address");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");

  const results = await db.select()
    .from(vote)
    .where(eq(vote.voter, address as `0x${string}`))
    .orderBy(desc(vote.timestamp))
    .limit(limit)
    .offset(offset);

  const votesWithRelated = await Promise.all(
    results.map(async (voteData) => {
      return await getVoteWithRelatedData(voteData, db, getIPFSData, getIPFSImageUrl);
    })
  );

  return c.json({
    votes: serializeBigInts(votesWithRelated),
    pagination: { limit, offset }
  });
});

app.get("/users/:address/reputation", async (c) => {
  const address = c.req.param("address");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");

  const results = await db.select()
    .from(reputationHistory)
    .where(eq(reputationHistory.userId, address as `0x${string}`))
    .orderBy(desc(reputationHistory.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    reputationHistory: serializeBigInts(results),
    pagination: { limit, offset }
  });
});

// ==================== Badges API ====================

app.get("/badges", async (c) => {
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");
  const badgeId = c.req.query("badgeId");
  const userId = c.req.query("userId");

  const conditions = [];
  if (badgeId !== undefined) conditions.push(eq(badge.badgeId, parseInt(badgeId)));
  if (userId) conditions.push(eq(badge.userId, userId as `0x${string}`));
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const results = await db.select()
    .from(badge)
    .where(whereClause)
    .orderBy(desc(badge.awardedAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    badges: serializeBigInts(results),
    pagination: { limit, offset }
  });
});

// ==================== Analytics API ====================

app.get("/analytics", async (c) => {
  const globalStatsData = await db.select()
    .from(globalStats)
    .where(eq(globalStats.id, "global"))
    .limit(1);

  const totalModels = await db.select({ count: sql`count(*)` })
    .from(model);

  const underReviewModels = await db.select({ count: sql`count(*)` })
    .from(model)
    .where(eq(model.status, ModelStatus.UNDER_REVIEW));

  const approvedModels = await db.select({ count: sql`count(*)` })
    .from(model)
    .where(eq(model.status, ModelStatus.APPROVED));

  const flaggedModels = await db.select({ count: sql`count(*)` })
    .from(model)
    .where(eq(model.status, ModelStatus.FLAGGED));

  const delistedModels = await db.select({ count: sql`count(*)` })
    .from(model)
    .where(eq(model.status, ModelStatus.DELISTED));

  const activeProposals = await db.select({ count: sql`count(*)` })
    .from(proposal)
    .where(eq(proposal.status, ProposalStatus.ACTIVE));

  const averageReputation = await db.select({ avg: sql`avg(reputation_score)` })
    .from(userStats);

  const topUsers = await db.select()
    .from(userStats)
    .orderBy(desc(userStats.reputationScore))
    .limit(10);

  const recentActivity = await db.select()
    .from(model)
    .orderBy(desc(model.createdAt))
    .limit(5);

  return c.json({
    global: serializeBigInts(globalStatsData[0] || {}),
    models: {
      total: totalModels[0]?.count || 0,
      underReview: underReviewModels[0]?.count || 0,
      approved: approvedModels[0]?.count || 0,
      flagged: flaggedModels[0]?.count || 0,
      delisted: delistedModels[0]?.count || 0,
    },
    proposals: {
      active: activeProposals[0]?.count || 0,
    },
    users: {
      averageReputation: averageReputation[0]?.avg || 0,
      topUsers: serializeBigInts(topUsers),
    },
    recentActivity: serializeBigInts(recentActivity),
  });
});

app.get("/analytics/models", async (c) => {
  const timeRange = c.req.query("timeRange") || "7d";
  const now = Date.now();
  const timeRanges = {
    "7d": now - 7 * 24 * 60 * 60 * 1000,
    "30d": now - 30 * 24 * 60 * 60 * 1000,
    "90d": now - 90 * 24 * 60 * 60 * 1000,
  };
  const startTime = BigInt(Math.floor(timeRanges[timeRange as keyof typeof timeRanges] / 1000));

  const modelsByStatus = await db.select({
    status: model.status,
    count: sql`count(*)`
  })
    .from(model)
    .where(gte(model.createdAt, startTime))
    .groupBy(model.status);

  const modelsByDay = await db.select({
    date: sql`date_trunc('day', to_timestamp(${model.createdAt}))`,
    count: sql`count(*)`
  })
    .from(model)
    .where(gte(model.createdAt, startTime))
    .groupBy(sql`date_trunc('day', to_timestamp(${model.createdAt}))`)
    .orderBy(sql`date_trunc('day', to_timestamp(${model.createdAt}))`);

  return c.json({
    modelsByStatus: serializeBigInts(modelsByStatus),
    modelsByDay: serializeBigInts(modelsByDay),
    timeRange
  });
});

app.get("/analytics/reviews", async (c) => {
  const timeRange = c.req.query("timeRange") || "7d";
  const now = Date.now();
  const timeRanges = {
    "7d": now - 7 * 24 * 60 * 60 * 1000,
    "30d": now - 30 * 24 * 60 * 60 * 1000,
    "90d": now - 90 * 24 * 60 * 60 * 1000,
  };
  const startTime = BigInt(Math.floor(timeRanges[timeRange as keyof typeof timeRanges] / 1000));

  const reviewsBySeverity = await db.select({
    severity: review.severity,
    count: sql`count(*)`
  })
    .from(review)
    .where(gte(review.timestamp, startTime))
    .groupBy(review.severity);

  const averageSeverity = await db.select({ avg: sql`avg(severity)` })
    .from(review)
    .where(gte(review.timestamp, startTime));

  return c.json({
    reviewsBySeverity: serializeBigInts(reviewsBySeverity),
    averageSeverity: averageSeverity[0]?.avg || 0,
    timeRange
  });
});

// ==================== Search API ====================

app.get("/search", async (c) => {
  const query = c.req.query("q");
  const type = c.req.query("type");
  const limit = parseInt(c.req.query("limit") || "10");

  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  let results = [];

  if (!type || type === "models") {
    const models = await db.select()
      .from(model)
      .limit(limit);
    results.push(...models.map(m => ({ ...m, type: "model" })));
  }

  if (!type || type === "users") {
    const users = await db.select()
      .from(user)
      .where(sql`${user.address} ILIKE ${`%${query}%`}`)
      .limit(limit);
    results.push(...users.map(u => ({ ...u, type: "user" })));
  }

  if (!type || type === "reviews") {
    const reviews = await db.select()
      .from(review)
      .limit(limit);
    results.push(...reviews.map(r => ({ ...r, type: "review" })));
  }

  return c.json({
    results: serializeBigInts(results.slice(0, limit)),
    query,
    type
  });
});


export default app;