/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { homedir, platform } from 'node:os';
import stripJsonComments from 'strip-json-comments';
import type { VscodeSettings } from '@google/gemini-cli-core';
import { getErrorMessage } from '@google/gemini-cli-core';

// We only want to show the error message once, even if we attempt to read
// the file multiple times.
let hasLoggedError = false;

function getVscodeSettingsPath(): string {
  const isInsiders = process.env['GEMINI_VSCODE_EDITION'] === 'insiders';

  // Paths based on information from:
  // https://code.visualstudio.com/docs/getstarted/settings#_settings-file-locations
  switch (platform()) {
    case 'darwin':
      return path.join(
        homedir(),
        'Library',
        'Application Support',
        isInsiders ? 'Code - Insiders' : 'Code',
        'User',
        'settings.json',
      );
    case 'win32': {
      const appData = process.env['APPDATA'];
      if (!appData) {
        return '';
      }
      return path.join(
        appData,
        isInsiders ? 'Code - Insiders' : 'Code',
        'User',
        'settings.json',
      );
    }
    case 'linux':
      return path.join(
        homedir(),
        '.config',
        isInsiders ? 'Code - Insiders' : 'Code',
        'User',
        'settings.json',
      );
    default:
      return '';
  }
}

export function readVscodeSettings(): VscodeSettings | null {
  const settingsPath = getVscodeSettingsPath();
  if (!settingsPath || !fs.existsSync(settingsPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(settingsPath, 'utf-8');
    const settings = JSON.parse(stripJsonComments(content));
    // We only care about the mcpServers for now.
    // We can expand this later if we need to.
    if (settings && typeof settings === 'object' && 'mcpServers' in settings) {
      return settings as VscodeSettings;
    }
    return null;
  } catch (err) {
    if (!hasLoggedError) {
      console.error(
        `Error reading VS Code settings from ${settingsPath}: ${getErrorMessage(
          err,
        )}`,
      );
      hasLoggedError = true;
    }
    return null;
  }
}
