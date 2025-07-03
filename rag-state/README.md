# RAG Superior State Management

This directory contains the persistent state and context management for the RAG Superior system.

## Directory Structure

- `context_cache/` - Session context files for intelligent retrieval
- `projects/` - Project-specific state tracking
- `admin_sync/` - Administrative synchronization files

## Purpose

The RAG Superior system uses this directory structure to:

1. **Context Bridge**: Maintain session continuity across chat restarts
2. **State Tracker**: Track project states and checkpoints
3. **Vector Search**: Store search results and relevance data
4. **Smart Retrieval**: Enable timestamp-based relevance scoring

## Configuration

The system automatically creates and manages these directories. No manual intervention required.
