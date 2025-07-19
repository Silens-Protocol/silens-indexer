import { eq, desc } from "drizzle-orm";
import { 
  review, 
  proposal, 
  identity, 
  modelStats,
  model,
  proposalStats,
  vote
} from "ponder:schema";

export function serializeBigInts(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(serializeBigInts);
    }
    
    if (typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = serializeBigInts(value);
      }
      return result;
    }
    
    return obj;
  }

export async function getReviewerWithProfileData(reviewerAddress: string, db: any, getIPFSData: any, getIPFSImageUrl: any) {
  const reviewerIdentity = await db.select()
    .from(identity)
    .where(eq(identity.owner, reviewerAddress as `0x${string}`))
    .limit(1);

  let reviewerProfile: any = null;
  if (reviewerIdentity[0] && reviewerIdentity[0].uri) {
    try {
      const reviewerIpfsData = await getIPFSData(reviewerIdentity[0].uri);
      if (reviewerIpfsData && reviewerIpfsData.data) {
        reviewerProfile = reviewerIpfsData.data as any;
        
        if (reviewerProfile && reviewerProfile.profilePicture) {
          reviewerProfile.profilePictureUrl = await getIPFSImageUrl(reviewerProfile.profilePicture);
        }
      }
    } catch (error) {
      console.error(`Error fetching reviewer profile for hash ${reviewerIdentity[0].uri}:`, error);
    }
  }

  return {
    ...reviewerIdentity[0],
    profile: reviewerProfile
  };
}

export async function getProposalsWithVoters(modelId: any, db: any, getIPFSData: any, getIPFSImageUrl: any) {
  const proposals = await db.select()
    .from(proposal)
    .where(eq(proposal.modelId, modelId))
    .orderBy(desc(proposal.createdAt));

  const proposalsWithVoters = await Promise.all(
    proposals.map(async (proposalData: any) => {
      const proposalId = proposalData.id;
      
      const votesData = await db.select()
        .from(vote)
        .where(eq(vote.proposalId, proposalId))
        .orderBy(desc(vote.timestamp));

      const votesWithVoters = await Promise.all(
        votesData.map(async (voteData: any) => {
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
            id: voteData.id,
            voter: {
              owner: voterIdentity[0]?.owner,
              tokenId: voterIdentity[0]?.tokenId,
              profile: voterProfile ? {
                name: voterProfile.name,
                bio: voterProfile.bio,
                address: voterProfile.address,
                profilePictureUrl: voterProfile.profilePictureUrl
              } : null
            },
            support: voteData.support,
            forVotes: voteData.forVotes,
            againstVotes: voteData.againstVotes,
            timestamp: voteData.timestamp,
            createdAt: voteData.createdAt
          };
        })
      );

      const stats = await db.select()
        .from(proposalStats)
        .where(eq(proposalStats.id, proposalId))
        .limit(1);

      const forVotes = stats[0]?.forVotes || 0;
      const againstVotes = stats[0]?.againstVotes || 0;
      const totalGovernanceVoters = stats[0]?.totalGovernanceVoters || 0;
      const quorum = stats[0]?.quorum || 0;
      const quorumMet = (forVotes + againstVotes) >= quorum;
      const majorityWon = forVotes > againstVotes;

      return {
        id: proposalData.id.toString(),
        modelId: proposalData.modelId.toString(),
        proposalType: proposalData.proposalType,
        status: proposalData.status,
        forVotes: forVotes,
        againstVotes: againstVotes,
        startTime: proposalData.startTime.toString(),
        endTime: proposalData.endTime.toString(),
        executed: proposalData.executed,
        totalGovernanceVoters: totalGovernanceVoters,
        quorum: quorum,
        quorumMet: quorumMet,
        majorityWon: majorityWon,
        createdAt: proposalData.createdAt.toString(),
        updatedAt: proposalData.updatedAt.toString(),
        creationTxHash: proposalData.creationTxHash,
        creationBlockNumber: proposalData.creationBlockNumber?.toString(),
        executionTxHash: proposalData.executionTxHash,
        executionBlockNumber: proposalData.executionBlockNumber?.toString(),
        votes: votesWithVoters
      };
    })
  );

  return proposalsWithVoters;
}

export async function getModelWithRelatedData(modelRecord: any, db: any, getIPFSData: any, getIPFSImageUrl: any) {
  const modelId = modelRecord.id;

  const reviewsData = await db.select()
    .from(review)
    .where(eq(review.modelId, modelId))
    .orderBy(desc(review.timestamp));

  const reviews = await Promise.all(
    reviewsData.map(async (reviewData: any) => {
      const reviewerIdentity = await db.select()
        .from(identity)
        .where(eq(identity.owner, reviewData.reviewer))
        .limit(1);

      let reviewerProfile: any = null;
      if (reviewerIdentity[0] && reviewerIdentity[0].uri) {
        try {
          const reviewerIpfsData = await getIPFSData(reviewerIdentity[0].uri);
          if (reviewerIpfsData && reviewerIpfsData.data) {
            reviewerProfile = reviewerIpfsData.data as any;
            
            if (reviewerProfile && reviewerProfile.profilePicture) {
              reviewerProfile.profilePictureUrl = await getIPFSImageUrl(reviewerProfile.profilePicture);
            }
          }
        } catch (error) {
          console.error(`Error fetching reviewer profile for hash ${reviewerIdentity[0].uri}:`, error);
        }
      }

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
        reviewer: {
          ...reviewerIdentity[0],
          profile: reviewerProfile
        },
        ipfsHash: reviewData.ipfsHash,
        metadata: reviewMetadata,
        reviewType: reviewData.reviewType,
        severity: reviewData.severity,
        timestamp: reviewData.timestamp,
        createdAt: reviewData.createdAt
      };
    })
  );

  const proposalsWithVoters = await getProposalsWithVoters(modelId, db, getIPFSData, getIPFSImageUrl);

  const stats = await db.select()
    .from(modelStats)
    .where(eq(modelStats.id, modelId))
    .limit(1);

  const submitterIdentity = await db.select()
    .from(identity)
    .where(eq(identity.owner, modelRecord.submitter))
    .limit(1);

  let submitterProfile: any = null;
  if (submitterIdentity[0] && submitterIdentity[0].uri) {
    try {
      const submitterIpfsData = await getIPFSData(submitterIdentity[0].uri);
      if (submitterIpfsData && submitterIpfsData.data) {
        submitterProfile = submitterIpfsData.data as any;
        
        if (submitterProfile && submitterProfile.profilePicture) {
          submitterProfile.profilePictureUrl = await getIPFSImageUrl(submitterProfile.profilePicture);
        }
      }
    } catch (error) {
      console.error(`Error fetching submitter profile for hash ${submitterIdentity[0].uri}:`, error);
    }
  }

  let modelMetadata: any = null;
  try {
    const ipfsData = await getIPFSData(modelRecord.ipfsHash);
    if (ipfsData && ipfsData.data) {
      modelMetadata = ipfsData.data as any;
      
      if (modelMetadata && modelMetadata.imageHash) {
        modelMetadata.imageUrl = await getIPFSImageUrl(modelMetadata.imageHash);
      }
    }
  } catch (error) {
    console.error(`Error fetching model metadata for hash ${modelRecord.ipfsHash}:`, error);
  }

  const cleanSubmitterProfile = submitterProfile ? {
    name: submitterProfile.name,
    bio: submitterProfile.bio,
    address: submitterProfile.address,
    profilePictureUrl: submitterProfile.profilePictureUrl
  } : null;

  const cleanModelMetadata = modelMetadata ? {
    name: modelMetadata.name,
    summary: modelMetadata.summary,
    category: modelMetadata.category,
    tags: modelMetadata.tags,
    link: modelMetadata.link,
    modelDetails: modelMetadata.modelDetails,
    timestamp: modelMetadata.timestamp,
    submitter: modelMetadata.submitter,
    imageUrl: modelMetadata.imageUrl
  } : null;

  return {
    id: modelRecord.id.toString(),
    submitter: {
      owner: submitterIdentity[0]?.owner,
      profile: cleanSubmitterProfile
    },
    metadata: cleanModelMetadata,
    status: modelRecord.status,
    submissionTime: modelRecord.submissionTime,
    reviewEndTime: modelRecord.reviewEndTime,
    reviews: reviews.map((review: any) => ({
      id: review.id,
      reviewer: {
        owner: review.reviewer?.owner,
        createdAt: review.reviewer?.createdAt,
        profile: review.reviewer?.profile
      },
      metadata: review.metadata,
      reviewType: review.reviewType,
      severity: review.severity,
      timestamp: review.timestamp,
      createdAt: review.createdAt
    })),
    proposals: proposalsWithVoters,
    stats: stats[0] || {}
  };
}

export async function getProposalWithRelatedData(proposalRecord: any, db: any, getIPFSData: any, getIPFSImageUrl: any) {
  const proposalId = proposalRecord.id;
  const modelId = proposalRecord.modelId;

  const modelData = await db.select()
    .from(model)
    .where(eq(model.id, modelId))
    .limit(1);

  if (modelData.length === 0) {
    return {
      ...proposalRecord,
      model: null
    };
  }

  const modelRecord = modelData[0]!;
  const modelWithRelated = await getModelWithRelatedData(modelRecord, db, getIPFSData, getIPFSImageUrl);

  const stats = await db.select()
    .from(proposalStats)
    .where(eq(proposalStats.id, proposalId))
    .limit(1);

  const forVotes = stats[0]?.forVotes || 0;
  const againstVotes = stats[0]?.againstVotes || 0;
  const totalGovernanceVoters = stats[0]?.totalGovernanceVoters || 0;
  const quorum = stats[0]?.quorum || 0;
  const quorumMet = (forVotes + againstVotes) >= quorum;
  const majorityWon = forVotes > againstVotes;

  return {
    id: proposalRecord.id.toString(),
    modelId: proposalRecord.modelId.toString(),
    proposalType: proposalRecord.proposalType,
    status: proposalRecord.status,
    forVotes: forVotes,
    againstVotes: againstVotes,
    startTime: proposalRecord.startTime.toString(),
    endTime: proposalRecord.endTime.toString(),
    executed: proposalRecord.executed,
    totalGovernanceVoters: totalGovernanceVoters,
    quorum: quorum,
    quorumMet: quorumMet,
    majorityWon: majorityWon,
    createdAt: proposalRecord.createdAt.toString(),
    updatedAt: proposalRecord.updatedAt.toString(),
    creationTxHash: proposalRecord.creationTxHash,
    creationBlockNumber: proposalRecord.creationBlockNumber?.toString(),
    executionTxHash: proposalRecord.executionTxHash,
    executionBlockNumber: proposalRecord.executionBlockNumber?.toString(),
    model: modelWithRelated
  };
}

export async function getVoteWithRelatedData(voteData: any, db: any, getIPFSData: any, getIPFSImageUrl: any) {
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

  const proposalData = await db.select()
    .from(proposal)
    .where(eq(proposal.id, voteData.proposalId))
    .limit(1);

  if (proposalData.length === 0) {
    return {
      id: voteData.id,
      proposalId: voteData.proposalId,
      voter: {
        ...voterIdentity[0],
        profile: voterProfile
      },
      support: voteData.support,
      timestamp: voteData.timestamp,
      createdAt: voteData.createdAt,
      proposal: null,
      model: null
    };
  }

  const proposalRecord = proposalData[0]!;

  const modelData = await db.select()
    .from(model)
    .where(eq(model.id, proposalRecord.modelId))
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

  const proposalStatsData = await db.select()
    .from(proposalStats)
    .where(eq(proposalStats.id, proposalRecord.id))
    .limit(1);

  return {
    id: voteData.id,
    proposalId: voteData.proposalId,
    voter: {
      tokenId: voterIdentity[0]?.tokenId,
      owner: voterIdentity[0]?.owner,
      profile: voterProfile ? {
        name: voterProfile.name,
        profilePictureUrl: voterProfile.profilePictureUrl
      } : null
    },
    support: voteData.support,
    timestamp: voteData.timestamp,
    proposal: {
      id: proposalRecord.id,
      modelId: proposalRecord.modelId,
      proposalType: proposalRecord.proposalType,
      status: proposalRecord.status,
      startTime: proposalRecord.startTime,
      endTime: proposalRecord.endTime,
      executed: proposalRecord.executed,
      stats: proposalStatsData[0] || {}
    },
    model: modelData[0] ? {
      id: modelData[0].id,
      submitter: modelData[0].submitter,
      status: modelData[0].status,
      submissionTime: modelData[0].submissionTime,
      reviewEndTime: modelData[0].reviewEndTime,
      metadata: modelMetadata
    } : null
  };
}

export async function getUserWithRelatedData(userData: any, stats: any, badges: any, identityData: any, verifications: any, getIPFSData: any, getIPFSImageUrl: any) {
  let identityProfile: any = null;
  if (identityData && identityData.uri) {
    try {
      const identityIpfsData = await getIPFSData(identityData.uri);
      if (identityIpfsData && identityIpfsData.data) {
        identityProfile = identityIpfsData.data as any;
        
        if (identityProfile && identityProfile.profilePicture) {
          identityProfile.profilePictureUrl = await getIPFSImageUrl(identityProfile.profilePicture);
        }
      }
    } catch (error) {
      console.error(`Error fetching identity profile for hash ${identityData.uri}:`, error);
    }
  }

  const cleanBadges = badges.map((badge: any) => ({
    id: badge.id,
    badgeId: badge.badgeId,
    badgeName: badge.badgeName,
    awardedAt: badge.awardedAt
  }));

  const cleanVerifications = verifications.map((verification: any) => ({
    id: verification.id,
    platform: verification.platform,
    username: verification.username
  }));

  const cleanIdentity = identityData ? {
    tokenId: identityData.tokenId,
    profile: identityProfile
  } : {};

  return {
    user: {
      address: userData.address,
      reputationScore: userData.reputationScore,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    },
    stats: {
      totalModels: stats?.totalModels || 0,
      totalReviews: stats?.totalReviews || 0,
      totalVotes: stats?.totalVotes || 0,
      totalBadges: stats?.totalBadges || 0
    },
    badges: cleanBadges,
    identity: cleanIdentity,
    verifications: cleanVerifications
  };
}