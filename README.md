# Tichi Automation - Playwright Test Framework

Automated test framework for the Tichi web application using Playwright.

## Prerequisites

- Node.js >= 18
- npm >= 8

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# (Optional) Copy and configure environment variables
copy .env.example .env
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Target application URL | `https://tichi-app-webapp-stage.web.app` |

## Running Tests

```bash
# Run all tests (headless)
npm test

# Run tests in headed mode (visible browser)
npm run test:headed

# Run specific test suites
npm run test:login
npm run test:routes
npm run test:network
npm run test:signup

# Debug mode with Playwright Inspector
npm run test:debug
```

## Project Structure

```
D:\TichiAutomation\
├── fixtures/              # Test fixtures (base-fixture.js)
├── pages/                 # Page Object Models (login-page.js)
├── reports/               # HTML test reports
├── screenshots/           # Failure screenshots
├── test-data/             # Test data (JSON fixtures)
├── tests/                 # Test files
│   ├── login/             # Login flow tests
│   ├── routes/            # Route exploration & auth guard tests
│   ├── network/           # API/network tests
│   └── signup/            # Sign-up page tests
├── utils/                 # Utility modules
│   ├── route-constants.js
│   └── network-logger.js
├── videos/                # Failure videos
├── playwright.config.js   # Playwright configuration
├── package.json
└── .env.example           # Environment template
```

## HTML Reports

After running tests, view the HTML report:

```bash
npm run test:report
```

The report is located in the `reports/` directory.

## Exploration Scripts

Legacy exploration scripts (run directly with Node):

```bash
node explore_all.js         # Full application exploration
node explore_login.js       # Login page exploration
node route_explore.js       # Route discovery
node page_dump.js           # Page content dump
```

## Test Cases

| Suite | Tests | Description |
|-------|-------|-------------|
| Login | 7 | Login page elements, email entry, step 2 flow |
| Forgot Password | 4 | Forgot password flow and direct access |
| Route Exploration | 11 | Navigate to all routes |
| Auth Guard | 8 | Unauthenticated redirect to login |
| Network/API | 3 | Network requests monitoring |
| Sign-Up | 4 | Sign-up page access |
| **Total** | **~37** | |
