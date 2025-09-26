/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MCPServerConfig } from './config.js';

export interface VscodeSettings {
  mcpServers?: { [key: string]: MCPServerConfig };
}
