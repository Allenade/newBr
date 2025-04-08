"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    price: number;
    duration: number;
    features: string[];
  };
}

export const PlanCard = ({ plan }: PlanCardProps) => {
  const router = useRouter();

  const handlePurchase = () => {
    // Store plan details in localStorage for the deposit page
    localStorage.setItem("selectedPlan", JSON.stringify(plan));
    // Navigate to deposit page
    router.push("/user/dashboard/deposits");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <p className="text-3xl font-bold">
          ${plan.price}
          <span className="text-sm font-normal text-muted-foreground">
            /{plan.duration} days
          </span>
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handlePurchase}>
          Purchase Plan
        </Button>
      </CardFooter>
    </Card>
  );
};
