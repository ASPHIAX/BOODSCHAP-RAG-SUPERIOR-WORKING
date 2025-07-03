// RAG Superior Search Fix Plan
// Replace mock data with real filesystem search
export async function searchContextCache(query, projectName) {
  const fs = require("fs").promises;
  const path = require("path");
  const cacheDir = "/opt/GIT/BOSS_STATE_TRACKER/context_cache/";
  
  try {
    const files = await fs.readdir(cacheDir);
    const results = [];
    
    for (const file of files) {
      if (file.endsWith(".json")) {
        const content = await fs.readFile(path.join(cacheDir, file), "utf8");
        const session = JSON.parse(content);
        
        // Simple text search in session content
        const searchText = JSON.stringify(session).toLowerCase();
        if (searchText.includes(query.toLowerCase())) {
          results.push({
            sessionId: file.replace(".json", ""),
            relevance: 0.8,
            timestamp: session.timestamp || new Date().toISOString(),
            summary: session.summary || "Session data found"
          });
        }
      }
    }
    
    return results.slice(0, 10);
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}
