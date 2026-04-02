# Migration Guide: Removing Partner Dependencies

This guide documents the changes made to remove Lovable and other partner website dependencies from the Medlabhub project.

## Changes Made

### 1. Frontend Configuration Cleanup ✓

#### package.json
- **Removed**: `lovable-tagger` (^1.1.13) from devDependencies
- **Reason**: Development tool specific to Lovable platform

#### vite.config.ts
- **Removed**: Import statement for `lovable-tagger`
- **Removed**: `componentTagger()` from plugins configuration
- **Reason**: Not needed for standalone development

#### index.html
- **Changed**: Author from "Lovable" to "Medlabhub Team"
- **Removed**: Twitter:site reference to @Lovable
- **Reason**: Update metadata to reflect actual project ownership

#### README.md
- **Replaced**: Entire README with project-specific documentation
- **Removed**: All Lovable-specific instructions and links
- **Added**: Comprehensive setup, development, and deployment guides

#### .lovable/ directory
- **Deleted**: Entire `.lovable/` configuration folder
- **Reason**: Platform-specific configuration no longer needed

#### .dist/ directory
- **Deleted**: Build artifacts folder
- **Reason**: Should be generated fresh during build, not committed

### 2. Backend AI Gateway Migration

#### Supabase Edge Functions Using Lovable AI Gateway

The following functions still reference the Lovable AI gateway. These need migration to an independent AI service:

**Files requiring updates:**
- `supabase/functions/ai-lab-calculator/index.ts`
- `supabase/functions/ai-tutor/index.ts`
- `supabase/functions/analyze-lab-image/index.ts`
- `supabase/functions/generate-organism-image/index.ts`

**Current implementation:**
```typescript
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  // ... request configuration
});
```

### 3. Migration Options for AI Services

Choose one of the following alternatives:

#### Option A: OpenAI (Recommended)
- **Service**: OpenAI API
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Model**: `gpt-4` or `gpt-3.5-turbo`
- **Setup**:
  1. Create OpenAI account
  2. Get API key
  3. Add to environment: `VITE_OPENAI_API_KEY`
  4. Update function endpoints

#### Option B: Anthropic Claude
- **Service**: Anthropic Claude
- **Endpoint**: `https://api.anthropic.com/v1/messages`
- **Model**: `claude-3-opus-20240229`
- **Setup**:
  1. Create Anthropic account
  2. Get API key
  3. Add to environment: `VITE_ANTHROPIC_API_KEY`
  4. Update function endpoints

#### Option C: Google Gemini
- **Service**: Google AI/Gemini
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- **Setup**:
  1. Create Google Cloud project
  2. Enable Generative AI API
  3. Get API key
  4. Add to environment: `VITE_GOOGLE_GEMINI_API_KEY`
  5. Update function endpoints

#### Option D: Azure OpenAI
- **Service**: Microsoft Azure OpenAI
- **Endpoint**: `https://{resource}.openai.azure.com/openai/deployments/{deployment-id}/chat/completions`
- **Setup**:
  1. Create Azure account
  2. Deploy OpenAI models
  3. Get keys and endpoint
  4. Add to environment variables
  5. Update function endpoints

### 4. Project Structure Improvements

#### New Documentation Files
- **DEVELOPMENT.md**: Comprehensive development guide
- **PROJECT_CONFIG.md**: Project configuration and standards
- **MIGRATION.md**: This file - migration documentation

#### Recommended Next Steps

1. **Choose AI Service**: Select one of the options above
2. **Update Functions**: Migrate each Edge Function to use new service
3. **Test Locally**: Test with development environment
4. **Deploy**: Deploy updated functions to Supabase
5. **Update Documentation**: Add setup instructions for chosen service

### 5. Environment Variables

Update your `.env.local` with new AI service credentials:

```env
# Remove/Replace
# VITE_LOVABLE_AI_KEY=...

# Add one of:
VITE_OPENAI_API_KEY=sk-...
# or
VITE_ANTHROPIC_API_KEY=sk-ant-...
# or
VITE_GOOGLE_GEMINI_API_KEY=...
# or
VITE_AZURE_OPENAI_API_KEY=...
VITE_AZURE_OPENAI_ENDPOINT=https://...
```

## Benefits of This Migration

✅ **Independence**: No dependency on Lovable platform
✅ **Flexibility**: Can choose any AI service provider
✅ **Cost Control**: Direct control over API costs
✅ **Long-term Viability**: Not tied to platform lifecycle
✅ **Scalability**: Can switch providers if needed
✅ **Transparency**: Full control over data and API usage

## Rollback Instructions

If needed to revert changes:

```bash
# Restore lovable-tagger dependency
npm install lovable-tagger@^1.1.13 --save-dev

# Restore imports in vite.config.ts
# Restore .lovable configuration folder
```

## Verification Checklist

- [ ] All lovable-tagger references removed from package.json
- [ ] vite.config.ts no longer imports componentTagger
- [ ] README.md updated with project-specific content
- [ ] .lovable/ directory removed
- [ ] index.html metadata updated
- [ ] AI gateway functions identified
- [ ] New AI service selected
- [ ] Environment variables configured
- [ ] Edge functions updated with new endpoints
- [ ] Local testing completed
- [ ] Functions redeployed to Supabase

## Support

For questions about specific migrations:
1. Check the AI service documentation
2. Review the updated Edge Functions
3. Contact the development team

---

**Migration Date**: April 2026
**Project**: Medlabhub
**Status**: In Progress
