"use client";

import { Trash2, Loader2 } from "lucide-react";
import {
	Sheet,
	SheetHeader,
	SheetContent,
	SheetTitle,
	SheetDescription,
	SheetFooter,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subscriptionPlans } from "@/services/db/schema/subscription-plans.schema";

// ~ Use inferred type from the actual schema
type PlanData = typeof subscriptionPlans.$inferSelect;

// ~ Form schema for validation
const formSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	description: z.string().nullable(),
	price: z.union([z.number(), z.null()]),
	duration: z.union([z.number(), z.null()]),
	features: z.array(z.string()).nullable(),
	bonusAmount: z.union([z.number(), z.null()]),
	returnPercent: z.union([z.number(), z.null()]),
});

type FormValues = z.infer<typeof formSchema>;

type ComponentProps = {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	planData?: PlanData;
	onSave?: (data: PlanData) => void;
	isSubmitting?: boolean;
};

const EditPlansSheet: React.FC<ComponentProps> = ({
	open,
	setOpen,
	planData,
	onSave,
	isSubmitting = false,
}) => {
	// ~ Initialize form with React Hook Form
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: planData?.name || "",
			description: planData?.description || null,
			price:
				typeof planData?.price === "string"
					? Number(planData.price)
					: planData?.price || null,
			duration:
				typeof planData?.duration === "string"
					? Number(planData.duration)
					: planData?.duration || null,
			features: planData?.features || [],
			bonusAmount:
				typeof planData?.bonusAmount === "string"
					? Number(planData.bonusAmount)
					: planData?.bonusAmount || null,
			returnPercent:
				typeof planData?.returnPercent === "string"
					? Number(planData.returnPercent)
					: planData?.returnPercent || null,
		},
	});

	// ~ Handle features as comma-separated string
	const featuresString = planData?.features?.join(", ") || "";

	// ~ Handle form submission
	const onSubmit = (values: FormValues) => {
		// ~ Combine form values with existing planData
		const updatedData: PlanData = {
			id: planData?.id || "",
			createdAt: planData?.createdAt || new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			...values,
		} as PlanData;

		if (onSave) onSave(updatedData);
		setOpen(false);
	};

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetContent className="overflow-y-auto sm:max-w-[500px] p-4">
				<SheetHeader>
					<div className="flex items-center justify-between">
						<SheetTitle>Edit Plan</SheetTitle>
						<Button variant="ghost" size="icon" className="text-rose-500">
							<Trash2 size={18} />
						</Button>
					</div>
					<SheetDescription>
						Make changes to your plan here. Click save when you're done.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-4 py-4"
					>
						{/* Name Field */}
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Description Field */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea {...field} value={field.value || ""} rows={3} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Price Field */}
						<FormField
							control={form.control}
							name="price"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Price</FormLabel>
									<FormControl>
										<div className="flex items-center gap-2 relative">
											<Input
												type="number"
												onChange={(e) => {
													const value =
														e.target.value === ""
															? null
															: parseFloat(e.target.value);
													field.onChange(value);
												}}
												value={field.value === null ? "" : field.value}
												className="pl-6"
											/>
											<span className="text-sm text-muted-foreground absolute left-2">
												$
											</span>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Duration Field */}
						<FormField
							control={form.control}
							name="duration"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Duration (days)</FormLabel>
									<FormControl>
										<Input
											type="number"
											onChange={(e) => {
												const value =
													e.target.value === ""
														? null
														: parseInt(e.target.value);
												field.onChange(value);
											}}
											value={field.value === null ? "" : field.value}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Features Field */}
						<FormField
							control={form.control}
							name="features"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Features (comma-separated)</FormLabel>
									<FormControl>
										<Textarea
											value={field.value?.join(", ") || ""}
											onChange={(e) => {
												const value =
													e.target.value === ""
														? []
														: e.target.value.split(",").map((f) => f.trim());
												field.onChange(value);
											}}
											placeholder="Feature 1, Feature 2, Feature 3"
											rows={3}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Bonus Amount Field */}
						<FormField
							control={form.control}
							name="bonusAmount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Bonus Amount</FormLabel>
									<FormControl>
										<div className="flex items-center gap-2 relative">
											<Input
												type="number"
												onChange={(e) => {
													const value =
														e.target.value === ""
															? null
															: parseFloat(e.target.value);
													field.onChange(value);
												}}
												value={field.value === null ? "" : field.value}
												className="pl-6"
											/>
											<span className="text-sm text-muted-foreground absolute left-2">
												$
											</span>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Return Percent Field */}
						<FormField
							control={form.control}
							name="returnPercent"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Return Percent</FormLabel>
									<FormControl>
										<div className="flex items-center gap-2 relative">
											<Input
												type="number"
												onChange={(e) => {
													const value =
														e.target.value === ""
															? null
															: parseFloat(e.target.value);
													field.onChange(value);
												}}
												value={field.value === null ? "" : field.value}
												className="pr-6"
											/>
											<span className="text-sm text-muted-foreground absolute right-2">
												%
											</span>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<SheetFooter>
							<Button type="submit" className="w-full mt-4">
								{isSubmitting ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										<span>Saving...</span>
									</>
								) : (
									"Save Changes"
								)}
							</Button>
						</SheetFooter>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	);
};

export default EditPlansSheet;
