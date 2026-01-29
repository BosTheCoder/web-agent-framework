# SpareRoom Adapter

Adapter for SpareRoom website automation.

## Status

**SKELETON IMPLEMENTATION - NOT FUNCTIONAL**

This adapter contains placeholder selectors and TODO comments. It requires actual SpareRoom UI selectors to be functional.

## Implementation Checklist

- [ ] Record login flow (see auth commands)
- [ ] Inspect messages page and update selectors in `src/selectors.ts`
- [ ] Implement `navigateToMessages` in `src/flows.ts`
- [ ] Implement `listUnreadThreads` in `src/index.ts`
- [ ] Implement `navigateToThread` in `src/flows.ts`
- [ ] Implement `readThread` in `src/index.ts`
- [ ] Test reply UI and update send selectors
- [ ] Implement `sendReply` in `src/index.ts`
- [ ] Test end-to-end in dry-run mode
- [ ] Test actual sending (with caution)

## How to Update Selectors

When SpareRoom UI changes:

1. Open SpareRoom in browser
2. Use browser DevTools to inspect elements
3. Prefer selectors in this order:
   - `role="..."` with `name="..."`
   - `data-testid="..."`
   - Stable class names (not auto-generated)
   - CSS selectors (last resort)
4. Update `src/selectors.ts`
5. Test with dry-run mode

## Testing

```bash
# Run in dry-run mode (no actual sends)
pnpm web-agent run --site spare-room --dry-run

# Test listing threads only
pnpm web-agent test:adapter spare-room list

# Test reading single thread
pnpm web-agent test:adapter spare-room read <thread-id>
```

## Safety Notes

- Always test with `--dry-run` first
- Verify selectors against latest SpareRoom UI
- Check ToS compliance before deploying
