/**
 * Tests for ENABLED_MODULES and ENABLED_TOOLS environment variable filtering
 */

describe('ENABLED_MODULES filtering', () => {
  // Helper function that mirrors the logic in src/index.ts
  function parseEnabledModules(envValue: string | undefined): Set<string> | null {
    if (!envValue) return null;
    return new Set(envValue.split(',').map(m => m.trim().toUpperCase()));
  }

  function isModuleEnabled(module: string, enabledModules: Set<string> | null): boolean {
    return !enabledModules || enabledModules.has(module);
  }

  describe('parseEnabledModules', () => {
    it('returns null when env value is undefined', () => {
      expect(parseEnabledModules(undefined)).toBeNull();
    });

    it('returns null when env value is empty string', () => {
      expect(parseEnabledModules('')).toBeNull();
    });

    it('parses single module', () => {
      const result = parseEnabledModules('SERP');
      expect(result).toEqual(new Set(['SERP']));
    });

    it('parses multiple comma-separated modules', () => {
      const result = parseEnabledModules('SERP,BUSINESS_DATA,LABS');
      expect(result).toEqual(new Set(['SERP', 'BUSINESS_DATA', 'LABS']));
    });

    it('converts to uppercase', () => {
      const result = parseEnabledModules('serp,business_data');
      expect(result).toEqual(new Set(['SERP', 'BUSINESS_DATA']));
    });

    it('trims whitespace', () => {
      const result = parseEnabledModules('  SERP  ,  BUSINESS_DATA  ');
      expect(result).toEqual(new Set(['SERP', 'BUSINESS_DATA']));
    });
  });

  describe('isModuleEnabled', () => {
    it('returns true for all modules when enabledModules is null', () => {
      expect(isModuleEnabled('SERP', null)).toBe(true);
      expect(isModuleEnabled('BUSINESS_DATA', null)).toBe(true);
      expect(isModuleEnabled('ANYTHING', null)).toBe(true);
    });

    it('returns true for modules in the enabled set', () => {
      const enabledModules = new Set(['SERP', 'BUSINESS_DATA']);
      expect(isModuleEnabled('SERP', enabledModules)).toBe(true);
      expect(isModuleEnabled('BUSINESS_DATA', enabledModules)).toBe(true);
    });

    it('returns false for modules not in the enabled set', () => {
      const enabledModules = new Set(['SERP', 'BUSINESS_DATA']);
      expect(isModuleEnabled('LABS', enabledModules)).toBe(false);
      expect(isModuleEnabled('BACKLINKS', enabledModules)).toBe(false);
    });
  });
});

describe('ENABLED_TOOLS filtering', () => {
  // Helper function that mirrors the logic in src/api/tools.ts
  function parseEnabledTools(envValue: string | undefined): Set<string> | null {
    if (!envValue) return null;
    return new Set(envValue.split(',').map(t => t.trim().toLowerCase()));
  }

  function isToolEnabled(name: string, enabledTools: Set<string> | null): boolean {
    if (!enabledTools) return true;
    return enabledTools.has(name.toLowerCase());
  }

  describe('parseEnabledTools', () => {
    it('returns null when env value is undefined', () => {
      expect(parseEnabledTools(undefined)).toBeNull();
    });

    it('returns null when env value is empty string', () => {
      expect(parseEnabledTools('')).toBeNull();
    });

    it('parses single tool', () => {
      const result = parseEnabledTools('serp_google_maps_live');
      expect(result).toEqual(new Set(['serp_google_maps_live']));
    });

    it('parses multiple comma-separated tools', () => {
      const result = parseEnabledTools('serp_google_maps_live,business_data_google_my_business_info');
      expect(result).toEqual(new Set(['serp_google_maps_live', 'business_data_google_my_business_info']));
    });

    it('converts to lowercase', () => {
      const result = parseEnabledTools('SERP_Google_Maps_Live');
      expect(result).toEqual(new Set(['serp_google_maps_live']));
    });

    it('trims whitespace', () => {
      const result = parseEnabledTools('  serp_google_maps_live  ,  business_data_google_my_business_info  ');
      expect(result).toEqual(new Set(['serp_google_maps_live', 'business_data_google_my_business_info']));
    });
  });

  describe('isToolEnabled', () => {
    it('returns true for all tools when enabledTools is null', () => {
      expect(isToolEnabled('serp_google_maps_live', null)).toBe(true);
      expect(isToolEnabled('any_tool_name', null)).toBe(true);
    });

    it('returns true for tools in the enabled set', () => {
      const enabledTools = new Set(['serp_google_maps_live', 'business_data_google_my_business_info']);
      expect(isToolEnabled('serp_google_maps_live', enabledTools)).toBe(true);
      expect(isToolEnabled('business_data_google_my_business_info', enabledTools)).toBe(true);
    });

    it('returns false for tools not in the enabled set', () => {
      const enabledTools = new Set(['serp_google_maps_live']);
      expect(isToolEnabled('backlinks_summary', enabledTools)).toBe(false);
      expect(isToolEnabled('labs_google_keyword_ideas', enabledTools)).toBe(false);
    });

    it('is case-insensitive', () => {
      const enabledTools = new Set(['serp_google_maps_live']);
      expect(isToolEnabled('SERP_GOOGLE_MAPS_LIVE', enabledTools)).toBe(true);
      expect(isToolEnabled('Serp_Google_Maps_Live', enabledTools)).toBe(true);
    });
  });
});
