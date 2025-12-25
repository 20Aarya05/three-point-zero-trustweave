# TrustWeave - AI-Powered Alternative Credit Scoring

TrustWeave is a revolutionary fintech application that provides credit scoring for individuals without traditional credit history. Using Google's Gemini AI, it analyzes behavioral patterns from mobile usage, utility payments, and community involvement to generate fair and accurate trust assessments.

## 🌟 Features

- **AI-Powered Analysis**: Uses Google Gemini 2.5 Flash for intelligent credit assessment
- **Alternative Data Sources**: Analyzes mobile, utility, and community behavior patterns
- **Trust Band System**: T1-T5 scoring system with traditional credit score alignment
- **Transparent Reasoning**: Clear explanations for credit decisions
- **Financial Inclusion**: Serves underbanked and unbanked populations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Live Demo

[Add your deployed URL here]

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **AI Integration**: Google Gemini API
- **Styling**: Tailwind CSS with custom components

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google AI Studio API key

## ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/20Aarya05/Three_point_zero-TrustWeave.git
   cd Three_point_zero-TrustWeave
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Get your Gemini API key**
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Sign in with your Google account
   - Create a new API key
   - Copy the key to your `.env.local` file

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
GenAI-fintech/
├── src/
│   ├── components/          # React components
│   │   ├── Landing.tsx      # Welcome & introduction
│   │   ├── PurposeSelection.tsx # Loan purpose selection
│   │   ├── CoreTrustForm.tsx    # 3 MAIN SECTIONS:
│   │   │                        # 1. Mobile Stability
│   │   │                        # 2. Utility Payment Discipline  
│   │   │                        # 3. Community Reliability
│   │   ├── LoanExperience.tsx   # Previous loan history
│   │   ├── FinancialCapacity.tsx # Income & employment
│   │   ├── AssetSupport.tsx     # Assets & collateral
│   │   ├── Processing.tsx       # AI analysis step
│   │   └── TrustProfile.tsx     # Results display
│   ├── services/
│   │   └── geminiService.ts # AI integration
│   ├── types.ts             # TypeScript definitions
│   ├── App.tsx              # Main application
│   └── index.tsx            # Entry point
├── public/
├── .env.example             # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🎯 Core Assessment Areas

### 1. 📱 Mobile Stability Analysis
- **SIM Duration**: Long-term number ownership indicates stability
- **Recharge Regularity**: Consistent top-ups show financial discipline
- **Usage Consistency**: Predictable patterns demonstrate reliability

### 2. 💡 Utility Payment Discipline
- **On-Time Behavior**: Payment punctuality reflects responsibility
- **Delay Frequency**: Late payment patterns indicate risk levels
- **Bill Predictability**: Consistent amounts show financial planning

### 3. 👥 Community Reliability
- **Group Participation**: Active involvement shows social responsibility
- **Shared Responsibility**: Reliability in commitments indicates trustworthiness
- **Dispute History**: Conflict resolution skills demonstrate maturity

## 🤖 How It Works

1. **Data Collection**: Users provide information about:
   - Mobile usage patterns (SIM duration, recharge regularity)
   - Utility payment history (on-time payments, consistency)
   - Community involvement (group participation, reliability)
   - Financial capacity and assets

2. **AI Analysis**: Google Gemini AI analyzes the behavioral patterns to:
   - Identify responsibility indicators
   - Assess financial reliability
   - Generate trust band (T1-T5)
   - Provide reasoning for the assessment

3. **Trust Profile**: Users receive:
   - Trust Band rating (T1-T5)
   - Traditional credit score alignment
   - Detailed reasoning for the assessment
   - Actionable insights for improvement

## 🎯 Trust Band System

- **T1 (Exceptional)**: 750-850 equivalent - Highest trust, premium rates
- **T2 (Strong)**: 700-749 equivalent - High trust, competitive rates  
- **T3 (Developing)**: 650-699 equivalent - Moderate trust, standard rates
- **T4 (Building)**: 600-649 equivalent - Lower trust, higher rates
- **T5 (Emerging)**: 550-599 equivalent - Minimal trust, secured products

## 🔒 Security & Privacy

- API keys are stored in environment variables
- No sensitive data is logged or stored
- All API communications are encrypted
- User data is processed temporarily for analysis only

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `VITE_GEMINI_API_KEY` in Vercel environment variables
4. Deploy!

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful language processing
- React team for the excellent framework
- Tailwind CSS for beautiful styling
- The open-source community for inspiration

## 📞 Contact

- GitHub: [@20Aarya05](https://github.com/20Aarya05)
- Project Link: [https://github.com/20Aarya05/Three_point_zero-TrustWeave](https://github.com/20Aarya05/Three_point_zero-TrustWeave)

---

**Made with ❤️ for financial inclusion**