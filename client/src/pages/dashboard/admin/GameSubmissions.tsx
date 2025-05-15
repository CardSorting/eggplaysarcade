import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Helmet } from "react-helmet";
import { Check, EyeIcon, MoreHorizontal, X } from "lucide-react";
import { SubmissionStatus, GameSubmission } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const getStatusBadge = (status: SubmissionStatus) => {
  switch (status) {
    case SubmissionStatus.DRAFT:
      return <Badge variant="outline">Draft</Badge>;
    case SubmissionStatus.SUBMITTED:
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Pending Review</Badge>;
    case SubmissionStatus.IN_REVIEW:
      return <Badge variant="secondary">In Review</Badge>;
    case SubmissionStatus.APPROVED:
      return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
    case SubmissionStatus.REJECTED:
      return <Badge variant="destructive">Rejected</Badge>;
    case SubmissionStatus.PUBLISHED:
      return <Badge className="bg-purple-500 hover:bg-purple-600">Published</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export default function GameSubmissions() {
  const { toast } = useToast();
  const [selectedSubmission, setSelectedSubmission] = useState<GameSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch game submissions
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["/api/admin/game-submissions"],
  });

  const startReviewMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const response = await apiRequest(
        "POST", 
        `/api/admin/game-submissions/${submissionId}/start-review`
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/game-submissions"] });
      toast({
        title: "Review started",
        description: "You are now reviewing this game submission.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const approveSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, notes }: { submissionId: string; notes: string }) => {
      const response = await apiRequest(
        "POST", 
        `/api/admin/game-submissions/${submissionId}/approve`,
        { notes }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/game-submissions"] });
      setSelectedSubmission(null);
      setApproveDialogOpen(false);
      setReviewNotes("");
      toast({
        title: "Submission approved",
        description: "The game submission has been approved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, reason }: { submissionId: string; reason: string }) => {
      const response = await apiRequest(
        "POST", 
        `/api/admin/game-submissions/${submissionId}/reject`,
        { reason }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/game-submissions"] });
      setSelectedSubmission(null);
      setRejectDialogOpen(false);
      setRejectionReason("");
      toast({
        title: "Submission rejected",
        description: "The game submission has been rejected.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const publishSubmissionMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const response = await apiRequest(
        "POST", 
        `/api/admin/game-submissions/${submissionId}/publish`
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/game-submissions"] });
      toast({
        title: "Game published",
        description: "The game has been published successfully and is now available to players.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartReview = (submission: GameSubmission) => {
    startReviewMutation.mutate(submission.id);
  };

  const handleOpenApproveDialog = (submission: GameSubmission) => {
    setSelectedSubmission(submission);
    setApproveDialogOpen(true);
  };

  const handleOpenRejectDialog = (submission: GameSubmission) => {
    setSelectedSubmission(submission);
    setRejectDialogOpen(true);
  };

  const handleApproveSubmission = () => {
    if (!selectedSubmission) return;
    approveSubmissionMutation.mutate({ 
      submissionId: selectedSubmission.id, 
      notes: reviewNotes 
    });
  };

  const handleRejectSubmission = () => {
    if (!selectedSubmission || !rejectionReason.trim()) return;
    rejectSubmissionMutation.mutate({ 
      submissionId: selectedSubmission.id, 
      reason: rejectionReason 
    });
  };

  const handlePublishGame = (submission: GameSubmission) => {
    publishSubmissionMutation.mutate(submission.id);
  };

  const handleViewDetails = (submission: GameSubmission) => {
    setSelectedSubmission(submission);
    setViewDetailsOpen(true);
  };

  // Filter submissions based on the selected status
  const filteredSubmissions = submissions?.filter((submission: GameSubmission) => {
    if (filterStatus === "all") return true;
    return submission.status === filterStatus;
  }) || [];

  return (
    <>
      <Helmet>
        <title>Game Submissions - Admin Dashboard</title>
      </Helmet>
      
      <DashboardLayout activeTab="admin-submissions">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Game Submissions</h1>
            
            <Tabs 
              value={filterStatus} 
              onValueChange={setFilterStatus}
              className="w-fit"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value={SubmissionStatus.SUBMITTED}>Pending</TabsTrigger>
                <TabsTrigger value={SubmissionStatus.IN_REVIEW}>In Review</TabsTrigger>
                <TabsTrigger value={SubmissionStatus.APPROVED}>Approved</TabsTrigger>
                <TabsTrigger value={SubmissionStatus.REJECTED}>Rejected</TabsTrigger>
                <TabsTrigger value={SubmissionStatus.PUBLISHED}>Published</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Game Submissions</CardTitle>
              <CardDescription>
                Review and manage game submissions from developers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading submissions...</p>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">No submissions found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game Title</TableHead>
                      <TableHead>Developer</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission: GameSubmission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {submission.metadata.title}
                        </TableCell>
                        <TableCell>
                          {submission.developer?.username || "Unknown Developer"}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>{submission.versionNumber}</TableCell>
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(submission)}>
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              
                              {submission.status === SubmissionStatus.SUBMITTED && (
                                <DropdownMenuItem onClick={() => handleStartReview(submission)}>
                                  Start Review
                                </DropdownMenuItem>
                              )}
                              
                              {submission.status === SubmissionStatus.IN_REVIEW && (
                                <>
                                  <DropdownMenuItem onClick={() => handleOpenApproveDialog(submission)}>
                                    <Check className="mr-2 h-4 w-4 text-green-500" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleOpenRejectDialog(submission)}>
                                    <X className="mr-2 h-4 w-4 text-red-500" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {submission.status === SubmissionStatus.APPROVED && (
                                <DropdownMenuItem onClick={() => handlePublishGame(submission)}>
                                  Publish
                                </DropdownMenuItem>
                              )}
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
        </div>
      </DashboardLayout>

      {/* View Game Submission Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedSubmission?.metadata.title} - Submission Details</DialogTitle>
            <DialogDescription>
              Submitted by {selectedSubmission?.developer?.username || "Unknown"} {' '}
              {selectedSubmission?.submittedAt && formatDistanceToNow(new Date(selectedSubmission.submittedAt), { addSuffix: true })}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Game details */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Game Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                  </div>
                  <div>
                    <Label>Version</Label>
                    <div className="mt-1">{selectedSubmission.versionNumber}</div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <Label>Description</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedSubmission.metadata.description}
                  </p>
                </div>
                
                <div className="mt-3">
                  <Label>Short Description</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedSubmission.metadata.shortDescription}
                  </p>
                </div>
                
                {selectedSubmission.metadata.features && selectedSubmission.metadata.features.length > 0 && (
                  <div className="mt-3">
                    <Label>Features</Label>
                    <ul className="mt-1 list-disc list-inside text-sm text-muted-foreground">
                      {selectedSubmission.metadata.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <Label>Categories</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedSubmission.metadata.categories?.map((category, index) => (
                        <Badge key={index} variant="outline">{category}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Tags</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedSubmission.metadata.tags?.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Technical details */}
              <div className="space-y-2 border-t pt-4">
                <h3 className="text-lg font-semibold">Technical Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>External APIs</Label>
                    <div className="mt-1">
                      {selectedSubmission.metadata.technicalDetails?.hasExternalAPIs ? 'Yes' : 'No'}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Server-side Code</Label>
                    <div className="mt-1">
                      {selectedSubmission.metadata.technicalDetails?.hasServerSideCode ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
                
                {selectedSubmission.metadata.technicalDetails?.thirdPartyLibraries && 
                 selectedSubmission.metadata.technicalDetails.thirdPartyLibraries.length > 0 && (
                  <div className="mt-3">
                    <Label>Third-party Libraries</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedSubmission.metadata.technicalDetails.thirdPartyLibraries.map((lib, index) => (
                        <Badge key={index} variant="outline">{lib}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Review notes */}
              {selectedSubmission.reviewNotes && selectedSubmission.reviewNotes.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <h3 className="text-lg font-semibold">Review Notes</h3>
                  
                  {selectedSubmission.reviewNotes.map((note, index) => (
                    <div key={index} className="bg-muted p-3 rounded-md">
                      <div className="flex justify-between items-start">
                        <Badge variant={
                          note.severity === 'critical' ? 'destructive' : 
                          note.severity === 'warning' ? 'outline' : 'secondary'
                        }>
                          {note.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">{note.content}</p>
                      {note.isResolved && (
                        <div className="mt-1 flex items-center text-xs text-green-500">
                          <Check className="h-3 w-3 mr-1" /> Resolved
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>
              Close
            </Button>
            
            {selectedSubmission?.status === SubmissionStatus.SUBMITTED && (
              <Button onClick={() => handleStartReview(selectedSubmission)}>
                Start Review
              </Button>
            )}
            
            {selectedSubmission?.status === SubmissionStatus.IN_REVIEW && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setViewDetailsOpen(false);
                    handleOpenRejectDialog(selectedSubmission);
                  }}
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => {
                    setViewDetailsOpen(false);
                    handleOpenApproveDialog(selectedSubmission);
                  }}
                >
                  Approve
                </Button>
              </>
            )}
            
            {selectedSubmission?.status === SubmissionStatus.APPROVED && (
              <Button onClick={() => handlePublishGame(selectedSubmission)}>
                Publish
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Game Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Game Submission</DialogTitle>
            <DialogDescription>
              Approve this game submission to make it ready for publishing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
              <Textarea
                id="reviewNotes"
                placeholder="Add any notes about the approval..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApproveSubmission}
              disabled={approveSubmissionMutation.isPending}
            >
              {approveSubmissionMutation.isPending ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Game Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Game Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this game submission.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason <span className="text-red-500">*</span></Label>
              <Textarea
                id="rejectionReason"
                placeholder="Explain why this submission is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
              {rejectionReason.trim() === "" && (
                <p className="text-sm text-red-500">Rejection reason is required</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectSubmission}
              disabled={rejectionReason.trim() === "" || rejectSubmissionMutation.isPending}
            >
              {rejectSubmissionMutation.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}