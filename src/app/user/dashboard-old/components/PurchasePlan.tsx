"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { useRouter } from "next/navigation";

interface PlanFeature {
  id: string;
  name: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  features: PlanFeature[];
  description: string;
  returnPercentage: number;
  bonusAmount: number;
  duration: string;
}

interface PurchaseState {
  plans: Plan[];
  selectedPlan: Plan | null;
  selectPlan: (plan: Plan) => void;
  setPlans: (plans: Plan[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const usePurchaseStore = create<PurchaseState>((set) => ({
  plans: [],
  selectedPlan: null,
  selectPlan: (plan) => set({ selectedPlan: plan }),
  setPlans: (plans) => set({ plans }),
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

async function fetchPlans() {
  try {
    const response = await fetch("/api/plans");
    if (!response.ok) throw new Error("Failed to fetch plans");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
}

export default function PurchasePlan() {
  const { plans, selectedPlan, selectPlan, setPlans, isLoading, setIsLoading } =
    usePurchaseStore();
  const router = useRouter();

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await fetchPlans();
        setPlans(data);
      } catch (error) {
        console.error("Error loading plans:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPlans();
  }, [setPlans, setIsLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Trading Plans
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose a plan that suits your trading needs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white dark:bg-gray-900 rounded-lg border ${
              selectedPlan?.id === plan.id
                ? "border-blue-500 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-800"
            } shadow-sm p-6`}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {plan.description}
                </p>
              </div>

              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                  ${plan.price}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  duration: {plan.duration}days
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold text-green-500">
                  {plan.returnPercentage}% Expected Returns
                </p>
                <p className="text-lg font-semibold text-blue-500">
                  ${plan.bonusAmount} Welcome Bonus
                </p>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature.id}
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature.name}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => selectPlan(plan)}
                className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
                  selectedPlan?.id === plan.id
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {selectedPlan?.id === plan.id ? "Selected" : "Select Plan"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50">
                Selected Plan: {selectedPlan.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ${selectedPlan.price} - duration: {selectedPlan.duration}days
              </p>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => {
                // Store plan details in localStorage for the deposit page
                localStorage.setItem(
                  "selectedPlan",
                  JSON.stringify(selectedPlan)
                );
                // Navigate to deposits page
                router.push("/user/dashboard/deposits");
              }}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
