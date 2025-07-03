import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * BOSS State Tracker - Enterprise Clean Architecture
 * Enhanced with timestamp-based state management and smart archiving
 */
export class BOSSStateTracker {
  constructor(options = {}) {
    this.baseDir = options.baseDir || "/app/rag-state";
    this.projectsDir = path.join(this.baseDir, "projects");
    this.adminSyncDir = path.join(this.baseDir, "admin_sync");
    this.ragContainerName = options.ragContainerName || "BOSS-MCP-RAG-ENHANCED-DEV";
    this.ragAdminPath = "/home/mcpuser/app/admin";
    this.maxStateHistory = options.maxStateHistory || 10;
  }

  async execute(params) {
    const { operation, projectName, state, context, checkpointId, contexts } = params;
    
    try {
      await this.initializeSystem();
      
      switch (operation) {
        case "init_system":
          return await this.initializeSystem();
        case "create_project_state":
          return await this.createProjectState(projectName, state, context);
        case "update_state":
          return await this.updateState(projectName, state);
        case "get_current_state":
          return await this.getCurrentState(projectName);
        case "create_checkpoint":
          return await this.createCheckpoint(projectName, context);
        case "list_checkpoints":
          return await this.listCheckpoints(projectName);
        case "sync_to_rag":
          return await this.syncToRAG(projectName);
        default:
          throw new Error();
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async initializeSystem() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      await fs.mkdir(this.projectsDir, { recursive: true });
      await fs.mkdir(this.adminSyncDir, { recursive: true });
      
      return {
        success: true,
        directories: {
          baseDir: this.baseDir,
          projectsDir: this.projectsDir,
          adminSyncDir: this.adminSyncDir
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createProjectState(projectName, initialState = {}, context = {}) {
    try {
      const projectDir = path.join(this.projectsDir, projectName);
      await fs.mkdir(projectDir, { recursive: true });
      
      const stateData = {
        projectName,
        state: initialState,
        context,
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        version: "2.0.0",
        history: []
      };
      
      const stateFile = path.join(projectDir, "current_state.json");
      await fs.writeFile(stateFile, JSON.stringify(stateData, null, 2));
      
      return {
        success: true,
        projectName,
        stateFile,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCurrentState(projectName) {
    try {
      const stateFile = path.join(this.projectsDir, projectName, "current_state.json");
      const stateData = JSON.parse(await fs.readFile(stateFile, "utf8"));
      
      return {
        success: true,
        projectName,
        state: stateData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        projectName
      };
    }
  }

  async createCheckpoint(projectName, context = {}) {
    try {
      const currentState = await this.getCurrentState(projectName);
      if (!currentState.success) {
        throw new Error("Project state not found");
      }
      
      const checkpointId = `checkpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const checkpointData = {
        ...currentState.state,
        checkpointId,
        context,
        createdAt: new Date().toISOString()
      };
      
      const checkpointFile = path.join(this.projectsDir, projectName, `${checkpointId}.json`);
      await fs.writeFile(checkpointFile, JSON.stringify(checkpointData, null, 2));
      
      return {
        success: true,
        checkpointId,
        projectName,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listCheckpoints(projectName) {
    try {
      const projectDir = path.join(this.projectsDir, projectName);
      const files = await fs.readdir(projectDir);
      const checkpoints = [];
      
      for (const file of files) {
        if (file.startsWith("checkpoint_") && file.endsWith(".json")) {
          const filePath = path.join(projectDir, file);
          const stats = await fs.stat(filePath);
          const checkpointData = JSON.parse(await fs.readFile(filePath, "utf8"));
          
          checkpoints.push({
            checkpointId: checkpointData.checkpointId,
            createdAt: checkpointData.createdAt,
            size: stats.size,
            file
          });
        }
      }
      
      checkpoints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return {
        success: true,
        projectName,
        checkpoints: checkpoints.slice(0, this.maxStateHistory),
        total: checkpoints.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { success: false, error: error.message, checkpoints: [] };
    }
  }
}

export const bossStateTracker = {
  name: "boss_state_tracker",
  description: "State tracking system with enhanced timestamp management",
  inputSchema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["init_system", "create_project_state", "update_state", "get_current_state", "create_checkpoint", "list_checkpoints", "sync_to_rag"]
      },
      projectName: { type: "string" },
      state: { type: "object" },
      context: { type: "object" },
      checkpointId: { type: "string" }
    },
    required: ["operation"]
  }
};
