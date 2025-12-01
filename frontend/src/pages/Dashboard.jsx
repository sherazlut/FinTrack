import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your financial overview
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Income</CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$0.00</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$0.00</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Balance</CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$0.00</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Budget Progress</CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0%</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
