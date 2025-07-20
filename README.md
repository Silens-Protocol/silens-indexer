# Silens Indexer

A blockchain indexer for the Silens protocol built with [Ponder](https://ponder.sh/). This indexer processes events from the Silens smart contracts on BSC Testnet and provides a GraphQL API and REST endpoints for querying indexed data.

## Overview

The Silens Indexer is responsible for:

- **Event Processing**: Indexing events from Silens smart contracts (Core, Model Registry, Proposal Voting, Reputation System, Identity)
- **Data Storage**: Storing structured data in PostgreSQL database
- **File Storage**: Managing IPFS storage via Pinata for metadata, images, and documents
- **API Layer**: Providing GraphQL and REST APIs for frontend applications
- **Real-time Updates**: Processing blockchain events in real-time as they occur

## Architecture

### Smart Contracts Indexed

- **Silens** (Main Orchestrator) (`0xCA18A11ca8e44c9eef603242Ef3cc92EE8BE12C2`)
- **IdentityRegistry** (`0x5EF386D8aF3b1709C4Ca0404A27E80B2d1206e38`)
- **ModelRegistry** (`0xEFEE9654334eE89A25021903B01AD840C7494dE2`)
- **ReputationSystem** (`0x8C0028B38c492A2F991dD805093C6712344D012F`)
- **VotingProposal** (`0x0e6c055996E02b129B8b4d7cCE9210997e408c7E`)

### Database Schema

The indexer maintains the following data models:

#### Core Entities
- **Models**: AI model submissions with metadata and status
- **Reviews**: Model reviews with severity ratings and evidence
- **Proposals**: Governance proposals for model actions
- **Votes**: User votes on governance proposals
- **Users**: User profiles with reputation scores
- **Identities**: NFT-based user identities
- **Badges**: Achievement badges for users
- **Platform Verifications**: Social media platform verifications

#### Statistics Tables
- **User Stats**: Aggregated user activity metrics
- **Model Stats**: Model performance and review statistics
- **Proposal Stats**: Governance participation metrics
- **Global Stats**: Platform-wide statistics

## Features

### Event Processing
- Real-time blockchain event indexing
- Automatic database updates
- Error handling and retry mechanisms

### File Storage (IPFS/Pinata)
- **Metadata Storage**: Model metadata, review evidence, user profiles
- **Image Storage**: Model images, review screenshots, profile pictures
- **Document Storage**: Identity verification documents
- **IPFS Integration**: Automatic file upload and retrieval via Pinata
- **Gateway Access**: Public IPFS gateway for frontend access

### API Endpoints

#### GraphQL API
- Full GraphQL schema for all data models
- Complex queries with filtering and pagination
- Real-time subscriptions (if configured)

#### REST API Endpoints

**Models**
- `GET /models` - List models with filtering
- `GET /models/:id` - Get model details with reviews and proposals
- `GET /models/:id/reviews` - Get reviews for a specific model

**Reviews**
- `GET /reviews` - List reviews with filtering

**Proposals**
- `GET /proposals` - List governance proposals
- `GET /proposals/:id` - Get proposal details with votes

**Users**
- `GET /users` - List users with reputation scores
- `GET /users/:address` - Get user profile and activity

**Statistics**
- `GET /stats/global` - Platform-wide statistics
- `GET /stats/users` - User activity statistics

## Configuration

### Ponder Configuration

The main configuration is in `ponder.config.ts`:

- **Chains**: Configured for BSC Testnet (Chain ID: 97)
- **Contracts**: All Silens smart contract addresses and ABIs
- **Database**: PostgreSQL connection settings
- **Start Blocks**: Block numbers to begin indexing from

### Schema Configuration

The database schema is defined in `ponder.schema.ts`:

- **Tables**: All data models with proper relationships
- **Indexes**: Optimized database indexes for query performance
- **Types**: TypeScript types for all entities

## Development

### Project Structure

```
silens-indexer/
├── abis/                    # Smart contract ABIs
├── src/
│   ├── index.ts            # Event handlers
│   ├── api/
│   │   └── index.ts        # REST API endpoints
│   └── utils/
│       └── index.ts        # Utility functions
├── ponder.config.ts        # Ponder configuration
├── ponder.schema.ts        # Database schema
└── package.json           # Dependencies and scripts
```
## 🚀 Deployment

#### **API Endpoints**
- **GraphQL API**: Available at `/graphql` endpoint
- **REST API**: Available at various endpoints (see API documentation above)
- **Health Check**: `/health` endpoint for service status

#### **Deployment Details**
- **Indexing Engine**: Ponder
- **Database**: PostgreSQL
- **API Framework**: Hono
- **File Storage**: IPFS via Pinata for metadata, images, and documents
- **Real-time Processing**: Event-driven indexing with automatic retries