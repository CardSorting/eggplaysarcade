import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Gamepad2, 
  PlusCircle, 
  Search, 
  Filter, 
  SortDesc, 
  Users,
  Star, 
  Calendar, 
  ArrowUpDown,
  Edit,
  ExternalLink,
  BarChart2,
  Trash2,
  MoreVertical 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { SubmissionStatus } from "@/lib/types";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from "date-fns";

// Helper function to get status badge
const getStatusBadge = (status: SubmissionStatus) => {
  switch (status) {
    case SubmissionStatus.DRAFT:
      return <Badge variant="outline">Draft</Badge>;
    case SubmissionStatus.SUBMITTED:
      return <Badge variant="secondary">Pending Review</Badge>;
    case SubmissionStatus.IN_REVIEW:
      return <Badge variant="secondary">In Review</Badge>;
    case SubmissionStatus.APPROVED:
      return <Badge className="bg-green-500">Approved</Badge>;
    case SubmissionStatus.REJECTED:
      return <Badge variant="destructive">Rejected</Badge>;
    case SubmissionStatus.PUBLISHED:
      return <Badge>Published</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

// Sorting options
type SortField = 'title' | 'publishedAt' | 'players' | 'rating';
type SortDirection = 'asc' | 'desc';

// Game list component
const GamesList = ({ games, isLoading }: { games: any[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <Gamepad2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No games found</h3>
        <p className="text-muted-foreground mt-2">
          You haven't uploaded any games yet. Get started by creating a new game.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/developer/games/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Submit New Game
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Game</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Published</TableHead>
          <TableHead>Players</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {games.map((game) => (
          <TableRow key={game.id}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-3">
                <img 
                  src={game.thumbnailUrl} 
                  alt={game.title} 
                  className="h-10 w-10 rounded object-cover"
                />
                <div>
                  <div className="font-medium">{game.title}</div>
                  <div className="text-xs text-muted-foreground">{game.categories.join(', ')}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(game.status)}</TableCell>
            <TableCell>
              {game.publishedAt ? (
                format(new Date(game.publishedAt), 'MMM d, yyyy')
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>{game.totalPlayers?.toLocaleString() || 0}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1 fill-yellow-400" />
                <span>{game.rating || 0}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/developer/games/${game.id}`}>
                      <BarChart2 className="h-4 w-4 mr-2" />
                      View Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/developer/games/${game.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Game
                    </Link>
                  </DropdownMenuItem>
                  {game.status === SubmissionStatus.PUBLISHED && (
                    <DropdownMenuItem asChild>
                      <Link href={`/games/${game.id}`} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Live Page
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Game
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Status filter dropdown
const StatusFilterDropdown = ({ 
  value, 
  onChange 
}: { 
  value: SubmissionStatus[]; 
  onChange: (value: SubmissionStatus[]) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9">
          <Filter className="h-4 w-4 mr-2" />
          Status
          {value.length > 0 && (
            <Badge className="ml-2 bg-primary text-primary-foreground" variant="secondary">
              {value.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.values(SubmissionStatus).map((status) => {
          const isSelected = value.includes(status);
          return (
            <DropdownMenuItem
              key={status}
              className="flex items-center gap-2"
              onSelect={(e) => {
                e.preventDefault();
                if (isSelected) {
                  onChange(value.filter((s) => s !== status));
                } else {
                  onChange([...value, status]);
                }
              }}
            >
              <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                {isSelected && <Check className="h-3 w-3" />}
              </div>
              <span>{status.replace('_', ' ')}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Category filter dropdown
const CategoryFilterDropdown = ({ 
  value, 
  onChange 
}: { 
  value: string[]; 
  onChange: (value: string[]) => void;
}) => {
  // In a real implementation, we would fetch categories from the API
  const categories = [
    { id: '1', name: 'Action' },
    { id: '2', name: 'Puzzle' },
    { id: '3', name: 'Strategy' },
    { id: '4', name: 'Arcade' },
    { id: '5', name: 'Adventure' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9">
          <Filter className="h-4 w-4 mr-2" />
          Category
          {value.length > 0 && (
            <Badge className="ml-2 bg-primary text-primary-foreground" variant="secondary">
              {value.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {categories.map((category) => {
          const isSelected = value.includes(category.id);
          return (
            <DropdownMenuItem
              key={category.id}
              className="flex items-center gap-2"
              onSelect={(e) => {
                e.preventDefault();
                if (isSelected) {
                  onChange(value.filter((id) => id !== category.id));
                } else {
                  onChange([...value, category.id]);
                }
              }}
            >
              <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                {isSelected && <Check className="h-3 w-3" />}
              </div>
              <span>{category.name}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Sort dropdown
const SortDropdown = ({
  value,
  onChange
}: {
  value: { field: SortField; direction: SortDirection };
  onChange: (value: { field: SortField; direction: SortDirection }) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9">
          <SortDesc className="h-4 w-4 mr-2" />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onChange({ field: 'title', direction: 'asc' })}
          className={value.field === 'title' && value.direction === 'asc' ? 'bg-accent' : ''}
        >
          Title (A-Z)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onChange({ field: 'title', direction: 'desc' })}
          className={value.field === 'title' && value.direction === 'desc' ? 'bg-accent' : ''}
        >
          Title (Z-A)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onChange({ field: 'publishedAt', direction: 'desc' })}
          className={value.field === 'publishedAt' && value.direction === 'desc' ? 'bg-accent' : ''}
        >
          Newest First
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onChange({ field: 'publishedAt', direction: 'asc' })}
          className={value.field === 'publishedAt' && value.direction === 'asc' ? 'bg-accent' : ''}
        >
          Oldest First
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onChange({ field: 'players', direction: 'desc' })}
          className={value.field === 'players' && value.direction === 'desc' ? 'bg-accent' : ''}
        >
          Most Players
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onChange({ field: 'rating', direction: 'desc' })}
          className={value.field === 'rating' && value.direction === 'desc' ? 'bg-accent' : ''}
        >
          Highest Rated
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Check component for filter dropdowns
const Check = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DeveloperGamesList = () => {
  // State for filtering and pagination
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'publishedAt',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Query for fetching games
  const { data, isLoading } = useQuery({
    queryKey: [
      '/api/developer/games',
      currentPage,
      pageSize,
      statusFilter,
      categoryFilter,
      searchQuery,
      sort
    ],
    queryFn: getQueryFn({ on401: "throw" })
  });

  // Mock data for preview
  const mockGames = [
    {
      id: '1',
      title: 'Block Puzzle',
      description: 'A classic block puzzle game',
      thumbnailUrl: 'https://via.placeholder.com/100',
      status: SubmissionStatus.PUBLISHED,
      publishedAt: new Date('2023-05-15'),
      categories: ['Puzzle', 'Arcade'],
      totalPlayers: 5200,
      rating: 4.7,
      hasUpdatesInReview: false
    },
    {
      id: '2',
      title: 'Space Shooter',
      description: 'An action-packed space shooter game',
      thumbnailUrl: 'https://via.placeholder.com/100',
      status: SubmissionStatus.PUBLISHED,
      publishedAt: new Date('2023-06-20'),
      categories: ['Action', 'Arcade'],
      totalPlayers: 3500,
      rating: 4.5,
      hasUpdatesInReview: true
    },
    {
      id: '3',
      title: 'Chess Master',
      description: 'A sophisticated chess game',
      thumbnailUrl: 'https://via.placeholder.com/100',
      status: SubmissionStatus.PUBLISHED,
      publishedAt: new Date('2023-07-12'),
      categories: ['Strategy', 'Board'],
      totalPlayers: 2200,
      rating: 4.8,
      hasUpdatesInReview: false
    },
    {
      id: '4',
      title: 'Racing Sim 2023',
      description: 'A realistic racing simulation',
      thumbnailUrl: 'https://via.placeholder.com/100',
      status: SubmissionStatus.IN_REVIEW,
      publishedAt: null,
      categories: ['Racing', 'Simulation'],
      totalPlayers: 0,
      rating: 0,
      hasUpdatesInReview: false
    },
    {
      id: '5',
      title: 'Adventure Quest',
      description: 'An epic adventure game',
      thumbnailUrl: 'https://via.placeholder.com/100',
      status: SubmissionStatus.DRAFT,
      publishedAt: null,
      categories: ['Adventure', 'RPG'],
      totalPlayers: 0,
      rating: 0,
      hasUpdatesInReview: false
    }
  ];

  // Use real data when available, otherwise use mock data
  const gamesList = data?.games || mockGames;
  const totalPages = data?.pagination?.totalPages || 3;

  return (
    <DashboardLayout activeTab="dev-games">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Games</h1>
          <Button asChild>
            <Link href="/dashboard/developer/games/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit New Game
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Game Library</CardTitle>
            <CardDescription>Manage and monitor all your game submissions</CardDescription>
            
            <div className="mt-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusFilterDropdown
                    value={statusFilter}
                    onChange={setStatusFilter}
                  />
                  <CategoryFilterDropdown
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                  />
                  <SortDropdown
                    value={sort}
                    onChange={setSort}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <GamesList
              games={gamesList}
              isLoading={isLoading}
            />
            
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                        }
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i} className={currentPage === i + 1 ? 'hidden sm:inline-block' : 'hidden sm:inline-block'}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i + 1);
                        }}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1);
                        }
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DeveloperGamesList;