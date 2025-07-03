class MongoDBClient {
  constructor(options = {}) {
    this.host = options.host || '192.168.68.94';
    this.port = options.port || 27018;
    this.database = options.database || 'admin';
    this.timeout = options.timeout || 5000;
  }

  async testConnection() {
    try {
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(`mongodb://${this.host}:${this.port}`, {
        serverSelectionTimeoutMS: this.timeout,
        connectTimeoutMS: this.timeout
      });
      
      await client.connect();
      const db = client.db(this.database);
      const collections = await db.listCollections().toArray();
      const messageCount = await db.collection('messages').countDocuments();
      
      await client.close();
      
      return {
        success: true,
        source: 'mongodb',
        database: this.database,
        collections: collections.length,
        messages: messageCount,
        connection: `mongodb://${this.host}:${this.port}/${this.database}`
      };
    } catch (error) {
      throw new Error(`MongoDB connection failed: ${error.message}`);
    }
  }

  async searchDocuments(query, limit = 10) {
    try {
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(`mongodb://${this.host}:${this.port}`, {
        serverSelectionTimeoutMS: this.timeout,
        connectTimeoutMS: this.timeout
      });
      
      await client.connect();
      const db = client.db(this.database);
      
      const results = await db.collection('messages')
        .find({
          $or: [
            { body: { $regex: query, $options: 'i' } },
            { from: { $regex: query, $options: 'i' } },
            { to: { $regex: query, $options: 'i' } }
          ]
        })
        .limit(limit)
        .toArray();
      
      await client.close();
      
      return {
        success: true,
        source: 'mongodb',
        database: this.database,
        query,
        count: results.length,
        documents: results.map(doc => ({
          id: doc._id,
          content: doc.body,
          from: doc.from,
          to: doc.to,
          timestamp: doc.timestamp,
          messageId: doc.messageId
        }))
      };
    } catch (error) {
      return {
        success: false,
        source: 'mongodb',
        error: error.message
      };
    }
  }
}

export { MongoDBClient };
