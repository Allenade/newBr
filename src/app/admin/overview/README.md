# Financial Dashboard Component

This folder contains components for displaying financial metrics in the admin dashboard.

## How to Use

To add the financial metrics dashboard to your existing Overview page without changing your code, you can import and use the `FinancialDashboard` component:

```tsx
import FinancialDashboard from "./components/FinancialDashboard";

// Then in your component's return statement, add:
<FinancialDashboard />;
```

## Components

1. **FinancialMetrics**: Displays total earnings, bonus, and trading points across all users.
2. **UserFinancialMetrics**: Displays a table of individual user financial metrics.
3. **FinancialDashboard**: A wrapper component that includes both of the above components.

## Example Usage

```tsx
"use client";
import React from "react";
import Block, { BlockBody } from "@/components/templates/block";
import FinancialDashboard from "./components/FinancialDashboard";

const AdminOverviewPage = () => {
  return (
    <Block>
      <BlockBody>
        <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

        {/* Your existing content */}

        {/* Add the financial dashboard */}
        <FinancialDashboard />

        {/* More of your existing content */}
      </BlockBody>
    </Block>
  );
};

export default AdminOverviewPage;
```

## Features

- Displays total earnings, bonus, and trading points
- Shows individual user financial metrics in a table
- Responsive design that works on all screen sizes
- Loading skeletons for better user experience
- No changes to your existing code required
