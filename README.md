# API Specification Quality Analyzer

A web application that analyzes OpenAPI/Swagger specifications to evaluate their quality, documentation completeness, syntax correctness, adherence to best practices, security configurations, and overall usability.

## Features

- Upload API specifications (JSON/YAML/YML)
- Upload JAR files with embedded API specs in the api-docs folder
- Comprehensive quality analysis with weighted scoring
- Detailed feedback and actionable recommendations
- Interactive visualization of results
- Syntax highlighting and code navigation

## Quality Analysis Criteria

The quality score is calculated based on five key categories:

- **Documentation Completeness (30%)**: Assesses the level of documentation in the API spec
- **Schema & Syntax Conformance (20%)**: Validates against OpenAPI/Swagger schemas
- **Best Practices & Consistency (25%)**: Evaluates adherence to API design best practices
- **Security & Versioning (15%)**: Analyzes security definitions and HTTPS enforcement
- **Usability Enhancements (10%)**: Checks for features that improve API usability

## Tech Stack

- **Frontend & Backend**: Next.js with React and TypeScript
- **Styling**: Tailwind CSS
- **API Spec Parsing**: js-yaml for YAML parsing
- **JAR Processing**: adm-zip for JAR extraction
- **Code Editor**: Monaco Editor for API spec visualization
- **Containerization**: Docker for development and deployment

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/api-analyzer.git
   cd api-analyzer
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   ```bash
   cp .env.example .env
   # Edit .env file to customize settings if needed
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Configuration

The application uses the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port (used by Next.js) | 3000 |
| MAX_UPLOAD_SIZE | Maximum upload file size in MB | 10 |
| UPLOAD_DIR | Directory for storing uploaded files | uploads |
| LOG_LEVEL | Logging level (debug, info, warn, error) | info |
| DEBUG | Enable/disable debug mode | false |

### Building for Production

To create a production build:

```bash
npm run build
npm start
```

### Docker Deployment

1. Build and run with Docker Compose
   ```bash
   docker-compose up -d
   ```

2. Access the application at [http://localhost:3000](http://localhost:3000)

## Usage

1. Upload your API specification (JSON, YAML) or JAR file
2. Review the quality analysis results
3. Explore the detailed findings and recommendations
4. View the original API specification with syntax highlighting

## Troubleshooting

### Next.js Build Issues

If you encounter build errors related to server components, ensure your `next.config.mjs` uses the correct configuration:

```javascript
serverExternalPackages: ['js-yaml', 'adm-zip'], // Not serverComponentsExternalPackages
```

### API Errors

- Check that your uploaded files are valid OpenAPI/Swagger specifications
- Ensure the JAR files contain API specs in the api-docs folder
- Verify that environment variables are set correctly

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
