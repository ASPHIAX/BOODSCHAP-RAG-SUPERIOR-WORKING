// MCP Protocol Validation Module
// Enterprise compliant validation schemas

import Joi from 'joi';

// MCP Protocol validation schemas
export const mcpSchemas = {
  initialize: Joi.object({
    jsonrpc: Joi.string().valid('2.0').required(),
    id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    method: Joi.string().valid('initialize').required(),
    params: Joi.object({
      protocolVersion: Joi.string().required(),
      capabilities: Joi.object().optional(),
      clientInfo: Joi.object().optional()
    }).required()
  }),

  toolCall: Joi.object({
    jsonrpc: Joi.string().valid('2.0').required(),
    id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    method: Joi.string().valid('tools/call').required(),
    params: Joi.object({
      name: Joi.string().required(),
      arguments: Joi.object().optional()
    }).required()
  }),

  listTools: Joi.object({
    jsonrpc: Joi.string().valid('2.0').required(),
    id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    method: Joi.string().valid('tools/list').required(),
    params: Joi.object().optional()
  }),

  listResources: Joi.object({
    jsonrpc: Joi.string().valid('2.0').required(),
    id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    method: Joi.string().valid('resources/list').required(),
    params: Joi.object().optional()
  })
};

export function validateMCPMessage(message, schema) {
  return schema.validate(message);
}

export default { mcpSchemas, validateMCPMessage };
