## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/brunogallo/dapp-pixelheroes.git
   ```

2. Navigate into the project directory:

   ```bash
   cd dapp-pixelheroes
   ```

3. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

4. Prepare input files:

   - Open `src/credentials.ts` and add an array of jwt tokens.

   Example `credentials.ts`:
   ```ts
   export const tokens: Token[] = [
    {
      TOKEN: "",
    },
    {
      TOKEN: "",
    },
   ];
   ```

## Usage

Run the bot using Node.js:

```bash
npm run missions
```
