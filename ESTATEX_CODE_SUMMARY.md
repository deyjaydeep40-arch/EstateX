# EstateX: Local Hosting & Key Changes Summary

To host this application locally on port **`5302`**, run:

```bash
# Install packages
npm install

# Start local server on port 5302
npm run dev:local
```

---

## Direct Code Modifications Summary

1. **`server.ts`**: Port configuration made dynamic (`const PORT = parseInt(process.env.PORT || '3000', 10);`).
2. **`package.json`**: Added `"dev:local": "PORT=5302 tsx server.ts"` script to allow direct custom-port viewing.
3. **`src/components/AnimatedBackground.tsx`**: Implemented interactive blueprint particle mesh canvas with pulsing radial gradients.
4. **`src/components/SearchFilters.tsx` & `src/pages/Home.tsx`**:
   - Replaced rounded bubble pills (`rounded-full`) with crisp modern rectangular structures (`rounded-xl` and `rounded-lg`).
   - Updated search category tabs and values to read **"Buy / Purchase"** and **"Rent"**.
