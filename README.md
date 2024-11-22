# Decentralized Autonomous Sports League (DASL)

This project implements a blockchain-based Decentralized Autonomous Sports League using Clarity smart contracts on the Stacks blockchain. It allows for team management, player trading, match scheduling, and automated prize distributions.

## Features

- Team creation and management
- Player registration and trading
- Match scheduling and result reporting
- Automated balance management for teams
- Secure withdrawal system for team owners

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [Node.js](https://nodejs.org/) (v14 or later)
- [Clarinet](https://github.com/hirosystems/clarinet) (for Clarity smart contract development)
- [Stacks Wallet](https://www.hiro.so/wallet) (for interacting with the Stacks blockchain)

## Installation

1. Clone the repository:
   \`\`\`
   git clone https://github.com/your-username/decentralized-sports-league.git
   cd decentralized-sports-league
   \`\`\`

2. Install Clarinet:
   Follow the instructions on the [Clarinet GitHub page](https://github.com/hirosystems/clarinet) to install Clarinet for your operating system.

3. Initialize the Clarinet project:
   \`\`\`
   clarinet new
   \`\`\`

4. Copy the \`sports-league.clar\` contract into the \`contracts\` directory of your Clarinet project.

## Usage

### Deploying the Smart Contract

Deploy the contract using Clarinet:

\`\`\`
clarinet deploy
\`\`\`

### Interacting with the Contract

You can interact with the contract using Clarinet's console or by building a frontend application. Here are some example interactions:

1. Create a team:
   \`\`\`
   (contract-call? .sports-league create-team "Blockchain Ballers")
   \`\`\`

2. Add a player:
   \`\`\`
   (contract-call? .sports-league add-player "Satoshi Nakamoto" u1000000)
   \`\`\`

3. Trade a player:
   \`\`\`
   (contract-call? .sports-league trade-player u1 u1 u2 u500000)
   \`\`\`

4. Schedule a match:
   \`\`\`
   (contract-call? .sports-league schedule-match u1 u2 u1625097600)
   \`\`\`

5. Report match results:
   \`\`\`
   (contract-call? .sports-league report-match-result u1 u3 u2)
   \`\`\`

6. Withdraw team balance:
   \`\`\`
   (contract-call? .sports-league withdraw-balance u1 u1000000)
   \`\`\`

## Smart Contract Functions

1. \`create-team\`: Creates a new team with the given name.
2. \`add-player\`: Adds a new player to the league with a given name and value.
3. \`trade-player\`: Transfers a player from one team to another for a specified price.
4. \`schedule-match\`: Schedules a match between two teams on a specific date.
5. \`report-match-result\`: Reports the result of a completed match.
6. \`withdraw-balance\`: Allows team owners to withdraw their team's balance.

## Contributing

Contributions to the Decentralized Autonomous Sports League are welcome. Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (\`git checkout -b feature/amazing-feature\`)
3. Make your changes
4. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
5. Push to the branch (\`git push origin feature/amazing-feature\`)
6. Open a Pull Request

## License

This project is licensed under the MIT License. See the \`LICENSE\` file for details.

## Contact

If you have any questions or feedback, please open an issue on the GitHub repository.

Happy sporting on the blockchain!

