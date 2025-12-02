import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useBudgetStore from "@/store/budgetStore";
import { toast } from "sonner";

const BUDGET_CATEGORIES = [
  "Food",
  "Rent",
  "Travel",
  "Utilities",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Education",
  "Transportation",
  "Others",
];

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const BudgetForm = ({ open, onOpenChange, budget = null }) => {
  const { createBudget, updateBudget, isLoading } = useBudgetStore();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const form = useForm({
    defaultValues: {
      category: budget?.category || undefined,
      monthlyLimit: budget?.monthlyLimit || "",
      month: budget?.month || currentMonth,
      year: budget?.year || currentYear,
    },
  });

  useEffect(() => {
    if (budget) {
      form.reset({
        category: budget.category,
        monthlyLimit: budget.monthlyLimit,
        month: budget.month,
        year: budget.year,
      });
    } else {
      form.reset({
        category: undefined,
        monthlyLimit: "",
        month: currentMonth,
        year: currentYear,
      });
    }
  }, [budget, open, form, currentMonth, currentYear]);

  const onSubmit = async (data) => {
    try {
      const budgetData = {
        ...data,
        monthlyLimit: parseFloat(data.monthlyLimit),
        month: parseInt(data.month, 10),
        year: parseInt(data.year, 10),
      };

      if (budget) {
        const result = await updateBudget(budget._id, budgetData);
        if (result.success) {
          toast.success("Budget updated successfully");
          onOpenChange(false);
          form.reset();
        } else {
          toast.error(result.error || "Failed to update budget");
        }
      } else {
        const result = await createBudget(budgetData);
        if (result.success) {
          toast.success("Budget created successfully");
          onOpenChange(false);
          form.reset();
        } else {
          toast.error(result.error || "Failed to create budget");
        }
      }
    } catch (error) {
      toast.error("An error occurred: " + error.message);
    }
  };

  // Generate year options (current year and next 2 years)
  const yearOptions = [];
  for (let i = 0; i < 3; i++) {
    yearOptions.push(currentYear + i);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{budget ? "Edit Budget" : "Add Budget"}</DialogTitle>
          <DialogDescription>
            {budget
              ? "Update your budget details"
              : "Set a monthly budget limit for a category"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              rules={{
                required: "Category is required",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUDGET_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthlyLimit"
              rules={{
                required: "Monthly limit is required",
                validate: (value) => {
                  const num = parseFloat(value);
                  if (isNaN(num) || num <= 0) {
                    return "Monthly limit must be a positive number";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Limit</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum amount you want to spend in this category
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="month"
                rules={{
                  required: "Month is required",
                  validate: (value) => {
                    const num = parseInt(value, 10);
                    if (isNaN(num) || num < 1 || num > 12) {
                      return "Month must be between 1 and 12";
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(parseInt(value, 10))
                      }
                      value={field.value?.toString() || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem
                            key={month.value}
                            value={month.value.toString()}
                          >
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                rules={{
                  required: "Year is required",
                  validate: (value) => {
                    const num = parseInt(value, 10);
                    if (isNaN(num) || num < 2000 || num > 2100) {
                      return "Year must be a valid year";
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(parseInt(value, 10))
                      }
                      value={field.value?.toString() || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : budget ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetForm;
