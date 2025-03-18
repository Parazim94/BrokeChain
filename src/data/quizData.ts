export interface Answer {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  question: string;
  answers: Answer[];
}

export interface QuizCategory {
  title: string;
  description: string;
  icon: string;
  questions: Question[];
}

export type QuizData = Record<string, QuizCategory>;

export const quizData: QuizData = {
  crypto: {
    title: "Crypto Basics",
    description: "Test your knowledge about blockchain fundamentals and cryptocurrency concepts",
    icon: "logo-bitcoin",
    questions: [
      {
        question: "What is a blockchain?",
        answers: [
          { text: "A centralized database", isCorrect: false },
          { text: "A decentralized, distributed data structure", isCorrect: true },
          { text: "A cloud storage service", isCorrect: false },
        ],
      },
      {
        question: "What is Bitcoin?",
        answers: [
          { text: "A centrally managed currency", isCorrect: false },
          { text: "A decentralized digital currency", isCorrect: true },
          { text: "An online payment system by banks", isCorrect: false },
        ],
      },
      {
        question: "What is a 'Private Key'?",
        answers: [
          { text: "A secret password that gives access to your cryptocurrencies", isCorrect: true },
          { text: "The public address link of a cryptocurrency exchange", isCorrect: false },
          { text: "A tool for mining cryptocurrencies", isCorrect: false },
        ],
      },
      {
        question: "What is a 'Smart Contract'?",
        answers: [
          { text: "A legally binding document for crypto trading", isCorrect: false },
          { text: "A self-executing program on a blockchain", isCorrect: true },
          { text: "A trading contract between two exchanges", isCorrect: false },
        ],
      },
      {
        question: "What does 'HODL' mean in the crypto community?",
        answers: [
          { text: "A trading strategy for quick selling", isCorrect: false },
          { text: "A typo that stands for 'Hold On for Dear Life'", isCorrect: true },
          { text: "A special type of token", isCorrect: false },
        ],
      },
      {
        question: "What is a cryptocurrency wallet?",
        answers: [
            { text: "A software or hardware that stores private keys", isCorrect: true },
          { text: "A physical device that holds actual digital coins", isCorrect: false },
          { text: "An online bank account for cryptocurrencies", isCorrect: false },
        ],
      },
      {
        question: "What is mining in cryptocurrency?",
        answers: [
          { text: "Digging for virtual coins in digital spaces", isCorrect: false },
          { text: "The process of validating transactions and adding them to the blockchain", isCorrect: true },
          { text: "Converting fiat currency to cryptocurrency", isCorrect: false },
        ],
      },
      {
        question: "What is a 'fork' in blockchain?",
        answers: [
          { text: "A tool used by miners to extract coins", isCorrect: false },
          { text: "When a blockchain splits into two separate chains", isCorrect: true },
          { text: "A way to merge two cryptocurrencies", isCorrect: false },
        ],
      },
      {
        question: "What is 'gas' in Ethereum?",
        answers: [
            { text: "Virtual fuel for animated graphics", isCorrect: false },
            { text: "A type of token on the Ethereum network", isCorrect: false },
            { text: "The fee required to execute transactions or smart contracts", isCorrect: true },
        ],
      },
      {
        question: "What does 'P2P' stand for in crypto?",
        answers: [
          { text: "Profit to Payment", isCorrect: false },
          { text: "Peer to Peer", isCorrect: true },
          { text: "Public to Private", isCorrect: false },
        ],
      }
    ],
  },
  trading: {
    title: "Trading Strategies",
    description: "Challenge yourself on trading concepts and market strategies",
    icon: "trending-up",
    questions: [
      {
        question: "What is a 'Bull Market'?",
        answers: [
          { text: "A market where prices are falling", isCorrect: false },
          { text: "A market where prices are rising", isCorrect: true },
          { text: "A market with high volatility", isCorrect: false },
        ],
      },
      {
        question: "What is a Stop-Loss Order?",
        answers: [
          { text: "An order to automatically sell at a certain price level", isCorrect: true },
          { text: "An order to automatically buy at a certain price level", isCorrect: false },
          { text: "An order to freeze assets", isCorrect: false },
        ],
      },
      {
        question: "What does 'DYOR' mean?",
        answers: [
          { text: "Do Your Own Research", isCorrect: true },
          { text: "Double Your Order Rapidly", isCorrect: false },
          { text: "Don't Yield On Risk", isCorrect: false },
        ],
      },
      {
        question: "What is the 'Fear and Greed Index'?",
        answers: [
          { text: "An index measuring current market corruption", isCorrect: false },
          { text: "An index for measuring market movements", isCorrect: false },
          { text: "An index showing the current market sentiment", isCorrect: true },
        ],
      },
      {
        question: "What is 'Diversification' in trading?",
        answers: [
          { text: "Focusing only on one asset", isCorrect: false },
          { text: "Reducing risk by spreading across different assets", isCorrect: true },
          { text: "A trading strategy where you buy every 10 minutes", isCorrect: false },
        ],
      },
      {
        question: "What is 'Scalping' in trading?",
        answers: [
          { text: "Holding positions for months", isCorrect: false },
          { text: "Making small profits from frequent, short-term trades", isCorrect: true },
          { text: "Buying high and selling low", isCorrect: false },
        ],
      },
      {
        question: "What is the 'RSI' indicator?",
        answers: [
          { text: "Really Significant Investment", isCorrect: false },
          { text: "Relative Strength Index - measures overbought/oversold conditions", isCorrect: true },
          { text: "Risk Security Indicator", isCorrect: false },
        ],
      },
      {
        question: "What is a 'Bear Market'?",
        answers: [
          { text: "A market where prices are falling", isCorrect: true },
          { text: "A market where prices are rising", isCorrect: false },
          { text: "A market with low volatility", isCorrect: false },
        ],
      },
      {
        question: "What is 'Market Capitalization'?",
        answers: [
          { text: "The total value of a company's or asset's shares", isCorrect: true },
          { text: "The maximum price an asset can reach", isCorrect: false },
          { text: "The amount of capital available in the market", isCorrect: false },
        ],
      },
      {
        question: "What is 'Day Trading'?",
        answers: [
          { text: "Trading only during daylight hours", isCorrect: false },
          { text: "Buying and selling financial instruments within the same trading day", isCorrect: true },
          { text: "Trading stocks that represent daylight-dependent businesses", isCorrect: false },
        ],
      }
    ],
  },
  defi: {
    title: "DeFi Knowledge",
    description: "Explore the world of decentralized finance",
    icon: "wallet",
    questions: [
      {
        question: "What is DeFi?",
        answers: [
          { text: "Digital Finance", isCorrect: false },
          { text: "Decentralized Finance", isCorrect: true },
          { text: "Direct Financial Investment", isCorrect: false },
        ],
      },
      {
        question: "What is a 'Liquidity Pool'?",
        answers: [
          { text: "A group of traders who provide market liquidity", isCorrect: false },
          { text: "A reserve of tokens locked in a smart contract", isCorrect: true },
          { text: "A type of cryptocurrency wallet", isCorrect: false },
        ],
      },
      {
        question: "What is 'Yield Farming'?",
        answers: [
          { text: "Growing agricultural products using blockchain", isCorrect: false },
          { text: "Lending crypto to earn interest and additional tokens", isCorrect: true },
          { text: "Mining cryptocurrency with renewable energy", isCorrect: false },
        ],
      },
      {
        question: "What is an 'AMM'?",
        answers: [
          { text: "Automatic Money Machine", isCorrect: false },
          { text: "Automated Market Maker", isCorrect: true },
          { text: "Advanced Mining Method", isCorrect: false },
        ],
      },
      {
        question: "What is 'Impermanent Loss'?",
        answers: [
          { text: "A temporary server outage on exchanges", isCorrect: false },
          { text: "The loss compared to HODLing when providing liquidity", isCorrect: true },
          { text: "A type of tax deduction for crypto losses", isCorrect: false },
        ],
      },
      {
        question: "What is a 'Flash Loan'?",
        answers: [
          { text: "A loan that is approved very quickly", isCorrect: false },
          { text: "A loan that must be borrowed and repaid within a single transaction", isCorrect: true },
          { text: "A small loan amount under $100", isCorrect: false },
        ],
      },
      {
        question: "What is 'Staking'?",
        answers: [
          { text: "Betting cryptocurrencies on sports events", isCorrect: false },
          { text: "Locking up crypto to support a network and earn rewards", isCorrect: true },
          { text: "Selling all your cryptocurrencies at once", isCorrect: false },
        ],
      },
      {
        question: "What is a 'DAO'?",
        answers: [
          { text: "Digital Asset Option", isCorrect: false },
          { text: "Decentralized Autonomous Organization", isCorrect: true },
          { text: "Direct Access Ownership", isCorrect: false },
        ],
      },
      {
        question: "What is 'TVL' in DeFi?",
        answers: [
          { text: "True Value Liquidation", isCorrect: false },
          { text: "Total Value Locked", isCorrect: true },
          { text: "Token Verification Level", isCorrect: false },
        ],
      },
      {
        question: "What is a 'Governance Token'?",
        answers: [
          { text: "A token used exclusively by governments", isCorrect: false },
          { text: "A token that gives holders voting rights in a protocol", isCorrect: true },
          { text: "A token that guarantees stable value", isCorrect: false },
        ],
      }
    ]
  },
  technical: {
    title: "Technical Analysis",
    description: "Master the art of reading charts and technical indicators",
    icon: "analytics",
    questions: [
      {
        question: "What is a 'Candlestick Chart'?",
        answers: [
          { text: "A chart that only shows closing prices", isCorrect: false },
          { text: "A chart showing high, low, open, and close prices", isCorrect: true },
          { text: "A chart that only shows price trends over a year", isCorrect: false },
        ],
      },
      {
        question: "What is a 'Moving Average'?",
        answers: [
          { text: "The average profit moved between accounts", isCorrect: false },
          { text: "The average price over a specific period of time", isCorrect: true },
          { text: "The movement of an asset between exchanges", isCorrect: false },
        ],
      },
      {
        question: "What is a 'Support Level'?",
        answers: [
          { text: "A price level where buying interest is strong enough to prevent further decline", isCorrect: true },
          { text: "The level of assistance provided by a trading platform", isCorrect: false },
          { text: "The minimum balance required in a trading account", isCorrect: false },
        ],
      },
      {
        question: "What is 'MACD'?",
        answers: [
          { text: "Multiple Access Control Diagram", isCorrect: false },
          { text: "Moving Average Convergence Divergence", isCorrect: true },
          { text: "Market Acceleration and Crash Detection", isCorrect: false },
        ],
      },
      {
        question: "What is a 'Doji Candlestick'?",
        answers: [
          { text: "A candlestick with a very long body", isCorrect: false },
          { text: "A candlestick where open and close prices are nearly equal", isCorrect: true },
          { text: "A candlestick showing extremely high volatility", isCorrect: false },
        ],
      },
      {
        question: "What is a 'Fibonacci Retracement'?",
        answers: [
          { text: "A mathematical sequence used to predict market lows", isCorrect: false },
          { text: "A technical analysis tool using Fibonacci ratios to identify potential support/resistance levels", isCorrect: true },
          { text: "A chart pattern named after Leonardo Fibonacci", isCorrect: false },
        ],
      },
      {
        question: "What is a 'Head and Shoulders' pattern?",
        answers: [
          { text: "A pattern indicating potential reversal from bullish to bearish trend", isCorrect: true },
          { text: "A pattern showing three consecutive peaks in trading volume", isCorrect: false },
          { text: "A chart resembling a shampoo bottle", isCorrect: false },
        ],
      },
      {
        question: "What is 'Volume' in technical analysis?",
        answers: [
          { text: "The loudness of traders on the exchange floor", isCorrect: false },
          { text: "The total number of shares or contracts traded during a period", isCorrect: true },
          { text: "The size of the candlesticks on a chart", isCorrect: false },
        ],
      },
      {
        question: "What is a 'Bollinger Band'?",
        answers: [
          { text: "A fixed band showing absolute price limits for the day", isCorrect: false },
          { text: "A volatility indicator consisting of moving averages and standard deviations", isCorrect: true },
          { text: "A band showing the range between highest buy and lowest sell orders", isCorrect: false },
        ],
      },
      {
        question: "What is 'Divergence' in technical analysis?",
        answers: [
          { text: "When price moves in the opposite direction of a technical indicator", isCorrect: true },
          { text: "When two moving averages cross each other", isCorrect: false },
          { text: "When trading volume spikes suddenly", isCorrect: false },
        ],
      }
    ]
  },
};

export type QuizCategoryKey = keyof typeof quizData;