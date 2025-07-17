import { eq, desc } from "drizzle-orm";
import { 
  review, 
  proposal, 
  identity, 
  modelStats
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

  const proposals = await db.select()
    .from(proposal)
    .where(eq(proposal.modelId, modelId))
    .orderBy(desc(proposal.createdAt));

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
    reviews: reviews.map((review: any) => ({
      id: review.id,
      reviewer: {
        owner: review.reviewer?.owner,
        createdAt: review.reviewer?.createdAt
      },
      metadata: review.metadata,
      reviewType: review.reviewType,
      severity: review.severity,
      timestamp: review.timestamp,
      createdAt: review.createdAt
    })),
    proposals: proposals,
    stats: stats[0] || {}
  };
}