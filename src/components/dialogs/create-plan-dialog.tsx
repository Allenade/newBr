"use client";

import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
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
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useMutateSubscriptionPlan } from "@/lib/hooks/subscription-plans/use-mutate-subscription-plan";
import { Loader2 } from "lucide-react";
type ComponentProps = {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const formSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	description: z.string().min(1, { message: "Description is required" }),
	price: z.number().min(1, { message: "Price is required" }),
	duration: z.number().min(1, { message: "Duration is required" }),
});

const CreatePlanDialog: React.FC<ComponentProps> = ({ open, setOpen }) => {
	const { createSubscriptionPlan, isCreating } = useMutateSubscriptionPlan();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			price: 0,
			duration: 0,
		},
	});

	// ~ ======= Handle submit  -->
	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		await createSubscriptionPlan({
			...values,
			price: values.price.toString(),
			duration: values.duration.toString(),
		});
		form.reset();
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="w-full sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Create Plan</DialogTitle>
					<DialogDescription>
						Create a new plan to start offering to your users
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid grid-cols-4 gap-y-5 gap-x-4"
					>
						{/* ~ ======= Name --> */}
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="col-span-4">
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						{/* ~ ======= Description --> */}
						<FormField
							control={form.control}
							render={({ field }) => (
								<FormItem className="col-span-4">
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea rows={4} {...field} className="resize-none" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
							name="description"
						/>

						{/* ~ ======= Price --> */}
						<FormField
							control={form.control}
							name="price"
							render={({ field }) => (
								<FormItem className="col-span-2">
									<FormLabel>Price</FormLabel>
									<FormControl>
										<div className="flex items-center gap-2 relative">
											<Input
												type="number"
												onChange={(e) =>
													field.onChange(parseFloat(e.target.value) || 0)
												}
												value={field.value}
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

						{/* ~ ======= Duration --> */}
						<FormField
							control={form.control}
							name="duration"
							render={({ field }) => (
								<FormItem className="col-span-2">
									<FormLabel>Duration</FormLabel>
									<FormControl>
										<Input
											type="number"
											onChange={(e) =>
												field.onChange(parseFloat(e.target.value) || 0)
											}
											value={field.value}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* ~ ======= Submit --> */}
						<div className="col-span-4 w-full flex justify-end items-center mt-3">
							<Button type="submit" className="col-span-4">
								{isCreating ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										<span>Creating...</span>
									</>
								) : (
									"Create Plan"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default CreatePlanDialog;
