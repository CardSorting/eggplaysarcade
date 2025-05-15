import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Clock,
  MoreVertical,
  MessageSquare,
  Gamepad
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Link } from "wouter";
import { SubmissionStatus } from "@/lib/types";

// Filter component
const FilterBar = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  developerFilter,
  setDeveloperFilter,
  developers
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: SubmissionStatus[];
  setStatusFilter: (status: SubmissionStatus[]) => void;
  developerFilter: string;
  setDeveloperFilter: (developer: string) => void;
  developers: any[];
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by game title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter.join(',')} onValueChange={(value) => {
          if (value === "") {
            setStatusFilter([]);
          } else {
            setStatusFilter(value.split(',') as SubmissionStatus[]);
          }
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value={SubmissionStatus.SUBMITTED}>Pending Review</SelectItem>
            <SelectItem value={SubmissionStatus.IN_REVIEW}>In Review</SelectItem>
            <SelectItem value={SubmissionStatus.APPROVED}>Approved</SelectItem>
            <SelectItem value={SubmissionStatus.REJECTED}>Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={developerFilter} onValueChange={setDeveloperFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by developer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Developers</SelectItem>
            {developers.map((dev) => (
              <SelectItem key={dev.id} value={dev.id.toString()}>
                {dev.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Review Dialog 
const ReviewDialog = ({
  open,
  onOpenChange,
  submission,
  onApprove,
  onReject,
  isLoading
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: any;
  onApprove: (id: string, note?: string) => void;
  onReject: (id: string, reason: string) => void;
  isLoading: boolean;
}) => {
  const [note, setNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Game Submission</DialogTitle>
          <DialogDescription>
            Review this game submission and either approve or reject it.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 space-y-6">
            <div className="flex gap-4">
              <img
                src={submission.metadata?.assets?.iconImageUrl || "https://via.placeholder.com/128"}
                alt={submission.metadata?.title}
                className="w-24 h-24 rounded-md object-cover"
              />
              <div>
                <h2 className="text-xl font-bold">{submission.metadata?.title}</h2>
                <p className="text-sm text-muted-foreground">
                  by {submission.developer?.username} • v{submission.versionNumber}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {submission.metadata?.categories?.map((category: any) => (
                    <Badge key={category} variant="secondary">{category}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Game Description</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {submission.metadata?.description}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Key Features</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {submission.metadata?.features?.map((feature: string, i: number) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Screenshots</h3>
              <div className="grid grid-cols-2 gap-2">
                {submission.metadata?.assets?.screenshotUrls?.map((url: string, i: number) => (
                  <img key={i} src={url} alt={`Screenshot ${i + 1}`} className="rounded-md w-full" />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Technical Details</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">External APIs:</span>{" "}
                  {submission.metadata?.technicalDetails?.hasExternalAPIs ? "Yes" : "No"}
                </p>
                <p>
                  <span className="font-medium">Server-side Code:</span>{" "}
                  {submission.metadata?.technicalDetails?.hasServerSideCode ? "Yes" : "No"}
                </p>
                <p>
                  <span className="font-medium">Third-party Libraries:</span>{" "}
                  {submission.metadata?.technicalDetails?.thirdPartyLibraries?.join(", ") || "None"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="font-medium">{submission.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted At</p>
                  <p className="font-medium">{format(new Date(submission.submittedAt), 'PPpp')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Version</p>
                  <p className="font-medium">{submission.versionNumber}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Review Note</label>
                  <Textarea
                    placeholder="Add a note about this submission (optional for approval)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => onApprove(submission.id, note)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve Submission
                  </Button>

                  {submission.status !== SubmissionStatus.REJECTED && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium">Rejection Reason</label>
                        <Textarea
                          placeholder="Provide a reason for rejection"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button
                        onClick={() => onReject(submission.id, rejectionReason)}
                        variant="destructive"
                        className="w-full"
                        disabled={isLoading || !rejectionReason.trim()}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Submission
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href={`/play-test/${submission.id}`} target="_blank">
                  <Gamepad className="mr-2 h-4 w-4" />
                  Play Test Game
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Add review note dialog
const AddNoteDialog = ({
  open,
  onOpenChange,
  submission,
  onAddNote,
  isLoading
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: any;
  onAddNote: (id: string, note: string, severity: string) => void;
  isLoading: boolean;
}) => {
  const [note, setNote] = useState("");
  const [severity, setSeverity] = useState<"info" | "warning" | "critical">("info");

  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Review Note</DialogTitle>
          <DialogDescription>
            Add a note to this submission to communicate with the developer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">Game</label>
            <p className="font-medium">{submission.metadata?.title}</p>
          </div>

          <div>
            <label className="text-sm font-medium">Severity</label>
            <Select 
              value={severity} 
              onValueChange={(value) => setSeverity(value as "info" | "warning" | "critical")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical Issue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Note</label>
            <Textarea
              placeholder="Write your note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1"
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onAddNote(submission.id, note, severity)}
            disabled={isLoading || !note.trim()}
          >
            Add Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Get status badge
const getStatusBadge = (status: SubmissionStatus) => {
  switch (status) {
    case SubmissionStatus.SUBMITTED:
      return <Badge variant="outline">Pending Review</Badge>;
    case SubmissionStatus.IN_REVIEW:
      return <Badge variant="secondary">In Review</Badge>;
    case SubmissionStatus.APPROVED:
      return <Badge className="bg-green-500">Approved</Badge>;
    case SubmissionStatus.REJECTED:
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const GameReviewsPage = () => {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "inReview" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus[]>([]);
  const [developerFilter, setDeveloperFilter] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);

  // Calculate effective status filter based on tab and explicit filter
  const effectiveStatusFilter = activeTab === "all"
    ? statusFilter
    : activeTab === "pending"
      ? [SubmissionStatus.SUBMITTED]
      : activeTab === "inReview"
        ? [SubmissionStatus.IN_REVIEW]
        : activeTab === "approved"
          ? [SubmissionStatus.APPROVED]
          : [SubmissionStatus.REJECTED];

  // Fetch submissions
  const { data: submissionsData, isLoading: isSubmissionsLoading } = useQuery({
    queryKey: ['/api/admin/submissions', effectiveStatusFilter, developerFilter, searchQuery],
    queryFn: getQueryFn({ on401: "throw" })
  });

  // Fetch developers
  const { data: developersData } = useQuery({
    queryKey: ['/api/admin/developers'],
    queryFn: getQueryFn({ on401: "throw" })
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      const res = await apiRequest('POST', `/api/admin/submissions/${id}/approve`, { note });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/submissions'] });
      toast({
        title: "Submission approved",
        description: "The game submission has been approved.",
      });
      setIsReviewDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to approve submission",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await apiRequest('POST', `/api/admin/submissions/${id}/reject`, { reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/submissions'] });
      toast({
        title: "Submission rejected",
        description: "The game submission has been rejected.",
      });
      setIsReviewDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reject submission",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async ({ id, note, severity }: { id: string; note: string; severity: string }) => {
      const res = await apiRequest('POST', `/api/admin/submissions/${id}/note`, { note, severity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/submissions'] });
      toast({
        title: "Note added",
        description: "Your note has been added to the submission.",
      });
      setIsNoteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add note",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Start review mutation
  const startReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/admin/submissions/${id}/start-review`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/submissions'] });
      toast({
        title: "Review started",
        description: "You've started reviewing this submission.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start review",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle approving submission
  const handleApprove = (id: string, note?: string) => {
    approveMutation.mutate({ id, note });
  };

  // Handle rejecting submission
  const handleReject = (id: string, reason: string) => {
    if (!reason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting this submission.",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({ id, reason });
  };

  // Handle adding a note
  const handleAddNote = (id: string, note: string, severity: string) => {
    if (!note.trim()) {
      toast({
        title: "Note content required",
        description: "Please provide content for your note.",
        variant: "destructive",
      });
      return;
    }
    addNoteMutation.mutate({ id, note, severity });
  };

  // Handle opening review dialog
  const handleOpenReviewDialog = (submission: any) => {
    setSelectedSubmission(submission);
    setIsReviewDialogOpen(true);
  };

  // Handle opening note dialog
  const handleOpenNoteDialog = (submission: any) => {
    setSelectedSubmission(submission);
    setIsNoteDialogOpen(true);
  };

  // Handle starting review
  const handleStartReview = (id: string) => {
    startReviewMutation.mutate(id);
  };

  // Mock data for the demo
  const mockSubmissions = [
    {
      id: "1",
      gameId: "101",
      developerId: "201",
      developer: { id: "201", username: "GameDev1" },
      versionNumber: "1.0.0",
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      reviewNotes: [],
      metadata: {
        title: "Space Explorer",
        description: "An exciting space exploration game with amazing graphics and compelling storyline.",
        shortDescription: "Explore the vastness of space",
        features: [
          "Procedurally generated planets",
          "Complex resource management",
          "Realistic physics simulation",
          "Multiplayer exploration"
        ],
        categories: ["Adventure", "Space", "Simulation"],
        tags: ["multiplayer", "sci-fi", "strategy"],
        technicalDetails: {
          hasExternalAPIs: false,
          hasServerSideCode: false,
          thirdPartyLibraries: ["three.js", "matter.js"]
        },
        assets: {
          iconImageUrl: "https://via.placeholder.com/128",
          headerImageUrl: "https://via.placeholder.com/1920x1080",
          screenshotUrls: [
            "https://via.placeholder.com/1280x720",
            "https://via.placeholder.com/1280x720",
            "https://via.placeholder.com/1280x720"
          ]
        }
      }
    },
    {
      id: "2",
      gameId: "102",
      developerId: "202",
      developer: { id: "202", username: "GameDev2" },
      versionNumber: "1.0.0",
      status: SubmissionStatus.IN_REVIEW,
      submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      reviewNotes: [
        {
          id: "n1",
          content: "Please provide more detail about the game controls",
          severity: "info",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          reviewerId: "admin1",
          isResolved: false
        }
      ],
      metadata: {
        title: "Puzzle Master",
        description: "A challenging puzzle game with increasingly difficult levels.",
        shortDescription: "Test your puzzle-solving skills",
        features: [
          "100+ challenging levels",
          "Adaptive difficulty",
          "Daily challenges",
          "Leaderboards"
        ],
        categories: ["Puzzle", "Strategy"],
        tags: ["singleplayer", "casual"],
        technicalDetails: {
          hasExternalAPIs: true,
          hasServerSideCode: false,
          thirdPartyLibraries: ["pixi.js"]
        },
        assets: {
          iconImageUrl: "https://via.placeholder.com/128",
          headerImageUrl: "https://via.placeholder.com/1920x1080",
          screenshotUrls: [
            "https://via.placeholder.com/1280x720",
            "https://via.placeholder.com/1280x720",
            "https://via.placeholder.com/1280x720"
          ]
        }
      }
    },
    {
      id: "3",
      gameId: "103",
      developerId: "203",
      developer: { id: "203", username: "GameDev3" },
      versionNumber: "1.0.0",
      status: SubmissionStatus.APPROVED,
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      reviewNotes: [],
      metadata: {
        title: "Racing Champions",
        description: "A high-speed racing game with realistic physics and stunning tracks.",
        shortDescription: "Race against the best drivers",
        features: [
          "20 unique tracks",
          "30 customizable cars",
          "Weather effects",
          "Career mode"
        ],
        categories: ["Racing", "Sports"],
        tags: ["multiplayer", "simulation"],
        technicalDetails: {
          hasExternalAPIs: false,
          hasServerSideCode: false,
          thirdPartyLibraries: ["babylon.js"]
        },
        assets: {
          iconImageUrl: "https://via.placeholder.com/128",
          headerImageUrl: "https://via.placeholder.com/1920x1080",
          screenshotUrls: [
            "https://via.placeholder.com/1280x720",
            "https://via.placeholder.com/1280x720",
            "https://via.placeholder.com/1280x720"
          ]
        }
      }
    },
    {
      id: "4",
      gameId: "104",
      developerId: "204",
      developer: { id: "204", username: "GameDev4" },
      versionNumber: "1.0.0",
      status: SubmissionStatus.REJECTED,
      submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      reviewedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      rejectionReason: "Game contains inappropriate content and doesn't comply with our content policies.",
      reviewNotes: [
        {
          id: "n2",
          content: "The game contains violent content not suitable for our platform.",
          severity: "critical",
          createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
          reviewerId: "admin1",
          isResolved: false
        }
      ],
      metadata: {
        title: "Zombie Apocalypse",
        description: "Survive in a world overrun by zombies. Scavenge, build, and fight your way to safety.",
        shortDescription: "Survive the zombie apocalypse",
        features: [
          "Open world survival",
          "Day/night cycle",
          "Crafting system",
          "Base building"
        ],
        categories: ["Action", "Survival", "Horror"],
        tags: ["survival", "zombies", "crafting"],
        technicalDetails: {
          hasExternalAPIs: false,
          hasServerSideCode: true,
          thirdPartyLibraries: ["three.js", "ammo.js"]
        },
        assets: {
          iconImageUrl: "https://via.placeholder.com/128",
          headerImageUrl: "https://via.placeholder.com/1920x1080",
          screenshotUrls: [
            "https://via.placeholder.com/1280x720",
            "https://via.placeholder.com/1280x720",
            "https://via.placeholder.com/1280x720"
          ]
        }
      }
    }
  ];

  // Mock developers for the demo
  const mockDevelopers = [
    { id: "201", username: "GameDev1" },
    { id: "202", username: "GameDev2" },
    { id: "203", username: "GameDev3" },
    { id: "204", username: "GameDev4" }
  ];

  // Use real data when available, otherwise use mock data
  const submissions = submissionsData?.submissions || mockSubmissions;
  const developers = developersData?.developers || mockDevelopers;

  // Count submissions by status
  const countByStatus = (status: SubmissionStatus) => {
    return submissions.filter(sub => sub.status === status).length;
  };

  return (
    <DashboardLayout activeTab="admin-reviews">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Game Reviews</h1>
        </div>

        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="all">
                All
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                <Badge variant="secondary" className="ml-2">{countByStatus(SubmissionStatus.SUBMITTED)}</Badge>
              </TabsTrigger>
              <TabsTrigger value="inReview">
                In Review
                <Badge variant="secondary" className="ml-2">{countByStatus(SubmissionStatus.IN_REVIEW)}</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected
              </TabsTrigger>
            </TabsList>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Game Submissions</CardTitle>
              <CardDescription>
                Review and manage game submissions from developers
              </CardDescription>
              <div className="mt-4">
                <FilterBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  developerFilter={developerFilter}
                  setDeveloperFilter={setDeveloperFilter}
                  developers={developers}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isSubmissionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No submissions found</h3>
                  <p className="text-muted-foreground">
                    {activeTab === "all"
                      ? "There are no game submissions to review"
                      : activeTab === "pending"
                        ? "There are no pending submissions"
                        : activeTab === "inReview"
                          ? "There are no submissions being reviewed"
                          : activeTab === "approved"
                            ? "There are no approved submissions"
                            : "There are no rejected submissions"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Game</TableHead>
                      <TableHead>Developer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <img
                              src={submission.metadata?.assets?.iconImageUrl || "https://via.placeholder.com/40"}
                              alt={submission.metadata?.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                            <div>
                              <div className="font-medium">{submission.metadata?.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {submission.metadata?.categories?.join(', ')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{submission.developer?.username}</TableCell>
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell>
                          {format(new Date(submission.submittedAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>v{submission.versionNumber}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenReviewDialog(submission)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Review Details
                              </DropdownMenuItem>
                              
                              {submission.status === SubmissionStatus.SUBMITTED && (
                                <DropdownMenuItem onClick={() => handleStartReview(submission.id)}>
                                  <Clock className="mr-2 h-4 w-4" />
                                  Start Review
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem onClick={() => handleOpenNoteDialog(submission)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Add Review Note
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              {(submission.status === SubmissionStatus.SUBMITTED || submission.status === SubmissionStatus.IN_REVIEW) && (
                                <>
                                  <DropdownMenuItem onClick={() => handleOpenReviewDialog(submission)}>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                    Approve
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem onClick={() => handleOpenReviewDialog(submission)}>
                                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              <DropdownMenuItem asChild>
                                <Link href={`/play-test/${submission.id}`} target="_blank">
                                  <Gamepad className="mr-2 h-4 w-4" />
                                  Play Test
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>
      
      {/* Review Dialog */}
      <ReviewDialog
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        submission={selectedSubmission}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={approveMutation.isPending || rejectMutation.isPending}
      />
      
      {/* Add Note Dialog */}
      <AddNoteDialog
        open={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        submission={selectedSubmission}
        onAddNote={handleAddNote}
        isLoading={addNoteMutation.isPending}
      />
    </DashboardLayout>
  );
};

export default GameReviewsPage;