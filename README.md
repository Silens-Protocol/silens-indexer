# Silens Indexer

A blockchain indexer for the Silens protocol built with [Ponder](https://ponder.sh/). This indexer processes events from the Silens smart contracts on Scroll Sepolia and provides a GraphQL API and REST endpoints for querying indexed data.

## Overview

The Silens Indexer is responsible for:

- **Event Processing**: Indexing events from Silens smart contracts (Core, Model Registry, Proposal Voting, Reputation System, Identity)
- **Data Storage**: Storing structured data in PostgreSQL database
- **API Layer**: Providing GraphQL and REST APIs for frontend applications
- **Real-time Updates**: Processing blockchain events in real-time as they occur

## Architecture

### Smart Contracts Indexed

- **SilensCore** (`0xd20b657d51174d1B374E43A9C1CB78875349BE09`)
- **SilensModelRegistry** (`0x3200D5861a8bA6874e81f1B2A03661bBCA1e6665`)
- **SilensProposalVoting** (`0x8660466fd7683A84cB163e78B73c37846477AC68`)
- **SilensReputationSystem** (`0xAd6dFe534f3bE9221ceaE8bCD929CCa052D48a6B`)
- **SilensIdentity** (`0x87BE019A88fC21e60902453b93f19cc41A81a46F`)

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

## Prerequisites

- Node.js >= 18.14
- PostgreSQL database
- Access to Scroll Sepolia RPC endpoint

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd silens-indexer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env` file with the following variables:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@host:port/database
   
   # Blockchain RPC
   SCROLL_SEPOLIA_RPC_URL=https://sepolia-rpc.scroll.io
   
   # Optional: API keys for enhanced RPC access
   # SCROLL_SEPOLIA_RPC_URL=https://scroll-sepolia.infura.io/v3/YOUR_API_KEY
   ```

## Usage

### Development Mode

Start the indexer in development mode with hot reloading:

```bash
npm run dev
```

This will:
- Start the Ponder development server
- Begin indexing from the configured start blocks
- Start the GraphQL and REST API servers
- Enable hot reloading for code changes

## Configuration

### Ponder Configuration

The main configuration is in `ponder.config.ts`:

- **Chains**: Configured for Scroll Sepolia testnet
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