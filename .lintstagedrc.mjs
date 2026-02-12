const lintStagedConfig = {
  "src/**/*.{ts,tsx}": [() => "tsc --noEmit"],
  "src/**/*.{js,ts,jsx,tsx,json,jsonc}": ["pnpm run lint:check"],
};

export default lintStagedConfig;
