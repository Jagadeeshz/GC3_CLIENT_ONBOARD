"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { OverviewReport } from "@/components/reports/overview-report";
import { RequestReport } from "@/components/reports/request-report";
import { HoursReport } from "@/components/reports/hours-report";
import { RevenueReport } from "@/components/reports/revenue-report";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { generateCSV, downloadCSV } from "@/lib/csv-export";

type DateRange = "7d" | "30d" | "quarter" | "year";

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "quarter", label: "Last Quarter" },
  { value: "year", label: "Last Year" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
}

async function exportOverview(dateRange: string) {
  try {
    const res = await fetch(`/api/reports/overview?period=${dateRange}`);
    const data = await res.json();
    if (!data?.requests) {
      return;
    }
    const headers = ["Metric", "Value", "Description"];
    const rows = [
      ["Total Requests", String(data.requests.total), `${Object.keys(data.requests.byStatus).length} status types`],
      ["Revenue Collected", formatCurrency(data.revenue.total), `${formatCurrency(data.revenue.pending)} pending`],
      ["Hours Utilization", `${data.hours.utilization}%`, `${data.hours.used}h used of ${data.hours.available}h`],
      ["Team Members", String(data.users.total), `${data.users.active} active`],
    ];
    const csv = generateCSV(headers, rows);
    downloadCSV("overview-report.csv", csv);
  } catch (err) {
    console.error("Failed to export overview:", err);
  }
}

async function exportRequests(dateRange: string) {
  try {
    const res = await fetch(`/api/reports/requests?period=${dateRange}`);
    const data = await res.json();
    if (!data?.total) {
      return;
    }
    const headers = ["Status", "Count"];
    const rows = Object.entries(data.byStatus).map(([status, count]) => [
      status.replace("_", " "),
      String(count),
    ]);
    const csv = generateCSV(headers, rows);
    downloadCSV("requests-report.csv", csv);
  } catch (err) {
    console.error("Failed to export requests:", err);
  }
}

async function exportHours(dateRange: string) {
  try {
    const res = await fetch(`/api/reports/hours?period=${dateRange}`);
    const data = await res.json();
    if (!data?.summary) {
      return;
    }
    const headers = ["Client", "Allocated", "Used", "Remaining", "Utilization"];
    const rows = data.byClient.map((c: { clientId: string; totalHours: number; usedHours: number; remainingHours: number; utilizationPct: number }) => [
      c.clientId,
      String(c.totalHours),
      String(c.usedHours),
      String(c.remainingHours),
      `${c.utilizationPct}%`,
    ]);
    const csv = generateCSV(headers, rows);
    downloadCSV("hours-report.csv", csv);
  } catch (err) {
    console.error("Failed to export hours:", err);
  }
}

async function exportRevenue(dateRange: string) {
  try {
    const res = await fetch(`/api/reports/revenue?period=${dateRange}`);
    const data = await res.json();
    if (!data?.summary) {
      return;
    }
    const headers = ["Month", "Revenue", "Pending", "Invoices"];
    const rows = data.monthly.map((m: { month: string; revenue: number; pending: number; invoices: number }) => [
      new Date(m.month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      formatCurrency(m.revenue),
      formatCurrency(m.pending),
      String(m.invoices),
    ]);
    const csv = generateCSV(headers, rows);
    downloadCSV("revenue-report.csv", csv);
  } catch (err) {
    console.error("Failed to export revenue:", err);
  }
}

const EXPORTERS: Record<string, (dateRange: string) => Promise<void>> = {
  overview: exportOverview,
  requests: exportRequests,
  hours: exportHours,
  revenue: exportRevenue,
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await EXPORTERS[activeTab]?.(dateRange);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Analytics and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewReport dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="requests">
          <RequestReport dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="hours">
          <HoursReport dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueReport dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
