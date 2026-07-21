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

const EXPORT_DATA: Record<string, () => void> = {
  overview: () => {
    const headers = ["Metric", "Value", "Description"];
    const rows = [
      ["Total Requests", "42", "5 status types"],
      ["Revenue Collected", "$128,750", "$38,750 pending"],
      ["Hours Utilization", "72%", "144h used of 200h"],
      ["Team Members", "12", "10 active"],
    ];
    const csv = generateCSV(headers, rows);
    downloadCSV("overview-report.csv", csv);
  },
  requests: () => {
    const headers = ["Status", "Count"];
    const rows = [
      ["Pending", "14"],
      ["In Progress", "18"],
      ["In Review", "6"],
      ["Completed", "32"],
      ["Cancelled", "3"],
      ["On Hold", "2"],
    ];
    const csv = generateCSV(headers, rows);
    downloadCSV("requests-report.csv", csv);
  },
  hours: () => {
    const headers = ["Client", "Allocated", "Used", "Remaining", "Utilization"];
    const rows = [
      ["Meridian Labs", "80", "62", "18", "78%"],
      ["Verdant Health", "60", "44", "16", "73%"],
      ["Greenfield Corp", "40", "28", "12", "70%"],
      ["Nexus Financial", "20", "10", "10", "50%"],
    ];
    const csv = generateCSV(headers, rows);
    downloadCSV("hours-report.csv", csv);
  },
  revenue: () => {
    const headers = ["Month", "Revenue", "Pending", "Invoices"];
    const rows = [
      ["Feb 2026", "$185,000", "$12,000", "8"],
      ["Mar 2026", "$210,000", "$18,500", "10"],
      ["Apr 2026", "$195,000", "$22,000", "9"],
      ["May 2026", "$248,000", "$15,000", "12"],
      ["Jun 2026", "$227,500", "$38,750", "11"],
      ["Jul 2026", "$182,000", "$45,000", "7"],
    ];
    const csv = generateCSV(headers, rows);
    downloadCSV("revenue-report.csv", csv);
  },
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [activeTab, setActiveTab] = useState("overview");

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
            onClick={() => EXPORT_DATA[activeTab]?.()}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
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
