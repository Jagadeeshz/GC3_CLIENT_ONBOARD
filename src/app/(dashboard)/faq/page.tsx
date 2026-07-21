"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  ChevronDown,
  HelpCircle,
  Shield,
  Plus,
  Pencil,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import type { FAQ } from "@/types";

// ──────────────────── FAQ Page ────────────────────

export default function FaqPage() {
  const { user, isAdmin } = useAuth();
  const canManage = isAdmin() || user?.role === "cpiu" || user?.role === "leadership";

  if (canManage) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQ</h1>
          <p className="text-muted-foreground">Manage frequently asked questions</p>
        </div>
        <Tabs defaultValue="public">
          <TabsList>
            <TabsTrigger value="public" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Public View
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Shield className="h-4 w-4" />
              Manage FAQs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="public">
            <FaqPublicView />
          </TabsContent>
          <TabsContent value="admin">
            <FaqManagement />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">FAQ</h1>
        <p className="text-muted-foreground">Frequently asked questions</p>
      </div>
      <FaqPublicView />
    </div>
  );
}

// ──────────────────── Public FAQ View ────────────────────

function FaqPublicView() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, "up" | "down" | undefined>>({});

  useEffect(() => {
    fetch("/api/faq")
      .then((r) => r.json())
      .then((result) => {
        if (result.data?.length) {
          setFaqs(result.data);
        } else {
          setFaqs(MOCK_FAQS);
        }
      })
      .catch(() => setFaqs(MOCK_FAQS))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(faqs.map((f) => f.category || "General"));
    return ["all", ...Array.from(cats).sort()];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    let result = faqs;
    if (activeCategory !== "all") {
      result = result.filter((f) => f.category === activeCategory);
    }
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(lower) ||
          f.answer.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [faqs, search, activeCategory]);

  const groupedFaqs = useMemo(() => {
    const groups: Record<string, FAQ[]> = {};
    for (const faq of filteredFaqs) {
      const cat = faq.category || "General";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(faq);
    }
    return groups;
  }, [filteredFaqs]);

  const handleVote = (faqId: string, type: "up" | "down") => {
    setVotes((prev) => ({
      ...prev,
      [faqId]: prev[faqId] === type ? undefined : type,
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 2 }).map((_, j) => (
                <Skeleton key={j} className="h-14 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat)}
          >
            {cat === "all" ? "All Categories" : cat}
          </Button>
        ))}
      </div>

      {Object.keys(groupedFaqs).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No FAQs found.</p>
            {search && (
              <Button
                variant="link"
                onClick={() => setSearch("")}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedFaqs).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                {category}
                <Badge variant="secondary" className="ml-auto">
                  {items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((faq) => (
                <div key={faq.id} className="border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium text-sm pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        openId === faq.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openId === faq.id && (
                    <div className="px-4 pb-4 border-t">
                      <p className="pt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                        {faq.answer}
                      </p>
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t">
                        <span className="text-xs text-muted-foreground">
                          Was this helpful?
                        </span>
                        <Button
                          variant={votes[faq.id] === "up" ? "default" : "outline"}
                          size="sm"
                          className="h-7 gap-1"
                          onClick={() => handleVote(faq.id, "up")}
                        >
                          <ThumbsUp className="h-3 w-3" />
                          Yes
                        </Button>
                        <Button
                          variant={votes[faq.id] === "down" ? "default" : "outline"}
                          size="sm"
                          className="h-7 gap-1"
                          onClick={() => handleVote(faq.id, "down")}
                        >
                          <ThumbsDown className="h-3 w-3" />
                          No
                        </Button>
                        {votes[faq.id] && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Thanks for your feedback!
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// ──────────────────── FAQ Management (Admin) ────────────────────

interface FaqFormData {
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_published: boolean;
}

const defaultFormData: FaqFormData = {
  question: "",
  answer: "",
  category: "General",
  sort_order: 0,
  is_published: true,
};

function FaqManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState<FaqFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  const fetchFaqs = async () => {
    try {
      const response = await fetch("/api/faq?admin=true");
      const result = await response.json();
      if (response.ok && result.data?.length) {
        setFaqs(result.data);
      } else {
        setFaqs(MOCK_FAQS);
      }
    } catch {
      setFaqs(MOCK_FAQS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateDialog = () => {
    setEditingFaq(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const openEditDialog = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sort_order: faq.sort_order,
      is_published: faq.is_published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) return;
    setSaving(true);
    try {
      const url = editingFaq ? `/api/faq/${editingFaq.id}` : "/api/faq";
      const method = editingFaq ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setDialogOpen(false);
        fetchFaqs();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/faq/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchFaqs();
      }
    } catch {
      // ignore
    }
  };

  const togglePublished = async (faq: FAQ) => {
    try {
      await fetch(`/api/faq/${faq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !faq.is_published }),
      });
      fetchFaqs();
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{faqs.length} total FAQs</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFaq ? "Edit FAQ" : "Create FAQ"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  placeholder="Enter the question..."
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  placeholder="Enter the answer..."
                  rows={6}
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    placeholder="e.g. Billing, Technical"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sort_order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_published: checked })
                  }
                />
                <Label>Published</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingFaq ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {faqs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No FAQs yet.</p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first FAQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq) => (
            <Card key={faq.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{faq.question}</p>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {faq.answer}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {faq.category}
                </Badge>
                <Badge
                  variant={faq.is_published ? "success" : "secondary"}
                  className="shrink-0"
                >
                  {faq.is_published ? "Published" : "Draft"}
                </Badge>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => togglePublished(faq)}
                  >
                    <Switch
                      checked={faq.is_published}
                      className="pointer-events-none"
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(faq)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this FAQ? This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(faq.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────── Mock Data ────────────────────

const MOCK_FAQS: FAQ[] = [
  {
    id: "1",
    question: "How do I submit a new request?",
    answer:
      "Navigate to the Requests page from the sidebar and click \"New Request\". Fill in the title, description, priority, and any relevant details. Your request will be assigned to the appropriate pod for review and action.",
    category: "Getting Started",
    sort_order: 1,
    is_published: true,
    created_by: null,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    question: "How do I track the status of my request?",
    answer:
      "Go to the Requests page to see all your requests with their current status. Each request shows its status (Pending, In Review, In Progress, Completed, or On Hold). You can click on any request for detailed information including timeline, assigned pod, and any comments.",
    category: "Getting Started",
    sort_order: 2,
    is_published: true,
    created_by: null,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "3",
    question: "What payment methods are accepted?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express) and ACH bank transfers. Payments are processed securely through Stripe. You can manage your payment methods in the Billing section of your account settings.",
    category: "Billing & Payments",
    sort_order: 1,
    is_published: true,
    created_by: null,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "4",
    question: "How does hours billing work?",
    answer:
      "Your account has an Hours Wallet that tracks your purchased and used hours. When a request is completed, the actual hours spent are deducted from your wallet. You can view your remaining hours and transaction history on the Dashboard. If your wallet runs low, you can purchase additional hours through the Billing section.",
    category: "Billing & Payments",
    sort_order: 2,
    is_published: true,
    created_by: null,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "5",
    question: "Can I request a change after a deliverable is submitted?",
    answer:
      "Yes! You can submit a Change Request from the project or request detail page. Change requests go through an approval process. If approved, any additional hours or costs will be added to your next invoice. You can track the status of change requests in the Change Requests section.",
    category: "Projects & Requests",
    sort_order: 1,
    is_published: true,
    created_by: null,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "6",
    question: "How do I communicate with my assigned pod?",
    answer:
      "Use the Messages feature accessible from the sidebar. You can send messages directly to your assigned pod team. Messages support file attachments and you'll receive notifications for replies. All communication is logged and accessible from the conversation thread.",
    category: "Projects & Requests",
    sort_order: 2,
    is_published: true,
    created_by: null,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "7",
    question: "How do I enable two-factor authentication?",
    answer:
      "Go to Account Settings > Security tab. Click \"Enable 2FA\" and follow the setup wizard. You can choose between an authenticator app (recommended) or SMS-based verification. We strongly recommend enabling 2FA to protect your account.",
    category: "Account & Security",
    sort_order: 1,
    is_published: true,
    created_by: null,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "8",
    question: "How do I invite team members to the portal?",
    answer:
      "Admins and CPIU users can invite new users from the Admin Panel > Users tab. Click \"Invite User\", enter their email address and role, and optionally add a personal message. They'll receive a magic link to complete their registration.",
    category: "Account & Security",
    sort_order: 2,
    is_published: true,
    created_by: null,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "9",
    question: "What browsers are supported?",
    answer:
      "GC3 Portal supports the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend keeping your browser up to date. Internet Explorer is not supported.",
    category: "Technical",
    sort_order: 1,
    is_published: true,
    created_by: null,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "10",
    question: "How do I upload documents and files?",
    answer:
      "You can upload documents from the Documents section or directly within a request. Supported formats include PDF, DOCX, XLSX, PNG, JPG, and ZIP. Maximum file size is 50MB per file. Documents are organized by category and can be shared with your pod team.",
    category: "Technical",
    sort_order: 2,
    is_published: true,
    created_by: null,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
];
