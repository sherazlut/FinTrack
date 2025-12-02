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
import { Textarea } from "@/components/ui/textarea";
import useTransactionStore from "@/store/transactionStore";
import { toast } from "sonner";

const TRANSACTION_CATEGORIES = {
  income: ["Salary", "Freelance", "Investment", "Gift", "Others"],
  expense: [
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
  ],
};

const TransactionForm = ({ open, onOpenChange, transaction = null }) => {
  const { createTransaction, updateTransaction, isLoading } =
    useTransactionStore();

  const form = useForm({
    defaultValues: {
      type: transaction?.type || "expense",
      amount: transaction?.amount || "",
      category: transaction?.category || undefined,
      description: transaction?.description || "",
      date: transaction?.date
        ? new Date(transaction.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
  });

  const transactionType = form.watch("type");

  useEffect(() => {
    if (transaction) {
      form.reset({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description || "",
        date: transaction.date
          ? new Date(transaction.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    } else {
      form.reset({
        type: "expense",
        amount: "",
        category: undefined,
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [transaction, open, form]);

  // Reset category when type changes if current category is not valid for new type
  useEffect(() => {
    const currentCategory = form.getValues("category");
    if (currentCategory && transactionType) {
      const validCategories = TRANSACTION_CATEGORIES[transactionType] || [];
      if (!validCategories.includes(currentCategory)) {
        form.setValue("category", undefined);
      }
    }
  }, [transactionType, form]);

  const onSubmit = async (data) => {
    try {
      const transactionData = {
        ...data,
        amount: parseFloat(data.amount),
        date: new Date(data.date).toISOString(),
      };

      if (transaction) {
        const result = await updateTransaction(
          transaction._id,
          transactionData
        );
        if (result.success) {
          toast.success("Transaction updated successfully");
          onOpenChange(false);
          form.reset();
        } else {
          toast.error(result.error || "Failed to update transaction");
        }
      } else {
        const result = await createTransaction(transactionData);
        if (result.success) {
          toast.success("Transaction created successfully");
          onOpenChange(false);
          form.reset();
        } else {
          toast.error(result.error || "Failed to create transaction");
        }
      }
    } catch (error) {
      toast.error("An error occurred: " + error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? "Update your transaction details"
              : "Add a new income or expense transaction"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              rules={{
                required: "Type is required",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              rules={{
                required: "Amount is required",
                validate: (value) => {
                  const num = parseFloat(value);
                  if (isNaN(num) || num <= 0) {
                    return "Amount must be a positive number";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              rules={{ required: "Category is required" }}
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
                      {TRANSACTION_CATEGORIES[transactionType]?.map(
                        (category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              rules={{
                required: "Date is required",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a description..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description for this transaction
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isLoading ? "Saving..." : transaction ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionForm;
