import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Gamepad, Upload } from "lucide-react";
import { MultiSelect } from "./components/MultiSelect";
import { FeatureList } from "./components/FeatureList";
import { FileUploader } from "./components/FileUploader";
import { SubmissionStatus } from "@/lib/types";

// Define the form schema using zod
const gameSubmissionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(4000, "Description must be less than 4000 characters"),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters").max(200, "Short description must be less than 200 characters"),
  features: z.array(z.string()).min(1, "Add at least one feature"),
  instructions: z.string().min(10, "Instructions must be at least 10 characters"),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  tags: z.array(z.string()),
  minimumSystemRequirements: z.object({
    cpu: z.string().optional(),
    gpu: z.string().optional(),
    ram: z.string().optional(),
    os: z.string().optional(),
    storage: z.string().optional(),
  }),
  recommendedSystemRequirements: z.object({
    cpu: z.string().optional(),
    gpu: z.string().optional(),
    ram: z.string().optional(),
    os: z.string().optional(),
    storage: z.string().optional(),
  }),
  pricingTier: z.string().default("free"),
  monetizationSettings: z.object({
    hasInAppPurchases: z.boolean().default(false),
    hasPremiumVersion: z.boolean().default(false),
    hasSubscription: z.boolean().default(false),
    hasAdvertisements: z.boolean().default(false),
  }),
  legalInfo: z.object({
    supportEmail: z.string().email("Enter a valid email").optional(),
    privacyPolicyUrl: z.string().url("Enter a valid URL").optional(),
    termsOfServiceUrl: z.string().url("Enter a valid URL").optional(),
  }),
  technicalDetails: z.object({
    hasExternalAPIs: z.boolean().default(false),
    hasServerSideCode: z.boolean().default(false),
    thirdPartyLibraries: z.array(z.string()),
  }),
  releaseNotes: z.string().optional(),
});

// Define the form value type from the schema
type GameSubmissionFormValues = z.infer<typeof gameSubmissionSchema>;

// Define the uploader component for screenshots
const ScreenshotsUploader = ({ 
  files, 
  setFiles 
}: { 
  files: File[]; 
  setFiles: (files: File[]) => void;
}) => {
  // Handle file selection
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    // Convert FileList to array and filter for images
    const newFiles = Array.from(selectedFiles).filter(file => file.type.startsWith('image/'));
    
    // Append new files to existing files
    setFiles([...files, ...newFiles]);
  };
  
  // Handle file removal
  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {files.map((file, index) => (
          <div key={index} className="relative group">
            <img
              src={URL.createObjectURL(file)}
              alt={`Screenshot ${index + 1}`}
              className="w-full h-32 object-cover rounded-md border"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveFile(index)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ))}
        
        {files.length < 10 && (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="text-sm text-gray-500">Click to upload screenshot</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </label>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">
        Upload at least 3 screenshots. Images should be 16:9 ratio, minimum 1280x720px.
      </p>
    </div>
  );
};

const NewGamePage = () => {
  const [, navigate] = useLocation();
  const [iconImage, setIconImage] = useState<File | null>(null);
  const [headerImage, setHeaderImage] = useState<File | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [gameBundle, setGameBundle] = useState<File | null>(null);
  const [currentTab, setCurrentTab] = useState("basic");
  const [submitAsDraft, setSubmitAsDraft] = useState(false);
  
  // Get categories from the API
  const { data: categoriesData } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: getQueryFn({ on401: "returnNull" })
  });
  
  // Initialize the form
  const form = useForm<GameSubmissionFormValues>({
    resolver: zodResolver(gameSubmissionSchema),
    defaultValues: {
      title: '',
      description: '',
      shortDescription: '',
      instructions: '',
      features: [],
      categories: [],
      tags: [],
      minimumSystemRequirements: {
        cpu: '',
        gpu: '',
        ram: '',
        os: '',
        storage: ''
      },
      recommendedSystemRequirements: {
        cpu: '',
        gpu: '',
        ram: '',
        os: '',
        storage: ''
      },
      pricingTier: 'free',
      monetizationSettings: {
        hasInAppPurchases: false,
        hasPremiumVersion: false,
        hasSubscription: false,
        hasAdvertisements: false
      },
      legalInfo: {
        supportEmail: '',
        privacyPolicyUrl: '',
        termsOfServiceUrl: ''
      },
      technicalDetails: {
        hasExternalAPIs: false,
        hasServerSideCode: false,
        thirdPartyLibraries: []
      },
      releaseNotes: ''
    }
  });
  
  // Mutation for submitting the game
  const submitMutation = useMutation({
    mutationFn: async (values: GameSubmissionFormValues) => {
      const formData = new FormData();
      
      // Add all form values as JSON
      formData.append('data', JSON.stringify(values));
      formData.append('asDraft', submitAsDraft.toString());
      
      // Add files
      if (iconImage) {
        formData.append('iconImage', iconImage);
      }
      
      if (headerImage) {
        formData.append('headerImage', headerImage);
      }
      
      screenshots.forEach(file => {
        formData.append('screenshots', file);
      });
      
      if (gameBundle) {
        formData.append('gameBundle', gameBundle);
      }
      
      const res = await apiRequest('POST', '/api/developer/games', formData, true);
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch the games list
      queryClient.invalidateQueries({ queryKey: ['/api/developer/games'] });
      
      // Show success message
      toast({
        title: submitAsDraft ? "Draft saved successfully" : "Game submitted successfully",
        description: submitAsDraft 
          ? "Your game has been saved as a draft. You can edit it later."
          : "Your game has been submitted for review.",
      });
      
      // Navigate to the game details page
      navigate(`/dashboard/developer/games/${data.gameId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: GameSubmissionFormValues) => {
    // Validate required files
    if (!iconImage) {
      toast({
        title: "Missing icon image",
        description: "Please upload an icon image for your game.",
        variant: "destructive",
      });
      setCurrentTab("media");
      return;
    }
    
    if (!headerImage) {
      toast({
        title: "Missing header image",
        description: "Please upload a header image for your game.",
        variant: "destructive",
      });
      setCurrentTab("media");
      return;
    }
    
    if (screenshots.length < 3) {
      toast({
        title: "Not enough screenshots",
        description: "Please upload at least 3 screenshots of your game.",
        variant: "destructive",
      });
      setCurrentTab("media");
      return;
    }
    
    if (!gameBundle) {
      toast({
        title: "Missing game bundle",
        description: "Please upload your game files.",
        variant: "destructive",
      });
      setCurrentTab("technical");
      return;
    }
    
    // Submit the form
    submitMutation.mutate(values);
  };
  
  const handleSaveDraft = () => {
    setSubmitAsDraft(true);
    form.handleSubmit(onSubmit)();
  };
  
  const handleSubmitForReview = () => {
    setSubmitAsDraft(false);
    form.handleSubmit(onSubmit)();
  };
  
  return (
    <DashboardLayout activeTab="dev-games">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/developer/games">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Submit New Game</h1>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="monetization">Monetization</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Game Details</CardTitle>
                    <CardDescription>Basic information about your game</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Game Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your game title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shortDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Description</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Brief description for listings (max 200 characters)" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            This will be displayed in game listings and search results.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Detailed description of your game" 
                              className="min-h-[150px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a comprehensive description of your game, including gameplay, story, and unique features.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Game Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="How to play your game" 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Explain how to play your game, including controls and objectives.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="features"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Features</FormLabel>
                          <FormControl>
                            <FeatureList
                              features={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription>
                            List the key features of your game. Add at least one feature.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="categories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categories</FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={(categoriesData || []).map((cat: any) => ({
                                  value: cat.id.toString(),
                                  label: cat.name
                                }))}
                                selected={field.value}
                                onChange={field.onChange}
                                placeholder="Select categories"
                              />
                            </FormControl>
                            <FormDescription>
                              Select categories that best describe your game.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={[
                                  { value: "multiplayer", label: "Multiplayer" },
                                  { value: "singleplayer", label: "Singleplayer" },
                                  { value: "2d", label: "2D" },
                                  { value: "3d", label: "3D" },
                                  { value: "pixel-art", label: "Pixel Art" },
                                  { value: "casual", label: "Casual" },
                                  { value: "hardcore", label: "Hardcore" },
                                  { value: "puzzle", label: "Puzzle" },
                                  { value: "action", label: "Action" },
                                  { value: "adventure", label: "Adventure" },
                                  { value: "rpg", label: "RPG" },
                                  { value: "strategy", label: "Strategy" },
                                  { value: "simulation", label: "Simulation" },
                                  { value: "sports", label: "Sports" },
                                  { value: "racing", label: "Racing" },
                                ]}
                                selected={field.value}
                                onChange={field.onChange}
                                placeholder="Select tags"
                                allowCustom
                              />
                            </FormControl>
                            <FormDescription>
                              Add tags to help players find your game.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleSaveDraft}>Save as Draft</Button>
                  <Button type="button" onClick={() => setCurrentTab("media")}>Next: Media</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="media" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Game Media</CardTitle>
                    <CardDescription>Upload visual assets for your game</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>Icon Image (512x512px)</Label>
                        <div className="mt-2">
                          <FileUploader
                            file={iconImage}
                            onFileSelect={setIconImage}
                            accept="image/*"
                            maxSize={2 * 1024 * 1024} // 2MB
                            previewType="square"
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            Upload a square icon for your game. This will be displayed in listings.
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Header Image (1920x1080px)</Label>
                        <div className="mt-2">
                          <FileUploader
                            file={headerImage}
                            onFileSelect={setHeaderImage}
                            accept="image/*"
                            maxSize={5 * 1024 * 1024} // 5MB
                            previewType="wide"
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            Upload a banner image for your game. This will be displayed at the top of your game page.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Screenshots (Minimum 3)</Label>
                      <div className="mt-2">
                        <ScreenshotsUploader
                          files={screenshots}
                          setFiles={setScreenshots}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => setCurrentTab("basic")}>Previous: Basic Info</Button>
                  <Button type="button" onClick={() => setCurrentTab("technical")}>Next: Technical</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="technical" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Details</CardTitle>
                    <CardDescription>Upload your game and provide technical information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Game Files</Label>
                      <div className="mt-2">
                        <FileUploader
                          file={gameBundle}
                          onFileSelect={setGameBundle}
                          accept=".zip,.html"
                          maxSize={100 * 1024 * 1024} // 100MB
                          previewType="file"
                          icon={<Gamepad className="h-8 w-8 mb-2 text-muted-foreground" />}
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Upload your game as a ZIP file containing all required files, or a single HTML file for simple games.
                          Your game must have an index.html file at the root that serves as the entry point.
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Minimum Requirements</h3>
                        <FormField
                          control={form.control}
                          name="minimumSystemRequirements.cpu"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPU</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Intel Core i3 or equivalent" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="minimumSystemRequirements.gpu"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GPU</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Integrated Graphics" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="minimumSystemRequirements.ram"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>RAM</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 4 GB" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="minimumSystemRequirements.os"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Operating System</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Windows 10, macOS, Linux" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="minimumSystemRequirements.storage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Storage</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 100 MB" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Recommended Requirements</h3>
                        <FormField
                          control={form.control}
                          name="recommendedSystemRequirements.cpu"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPU</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Intel Core i5 or equivalent" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="recommendedSystemRequirements.gpu"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GPU</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., NVIDIA GeForce GTX 1050" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="recommendedSystemRequirements.ram"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>RAM</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 8 GB" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="recommendedSystemRequirements.os"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Operating System</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Windows 10, macOS, Linux" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="recommendedSystemRequirements.storage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Storage</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 200 MB" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Technical Specifications</h3>
                      
                      <FormField
                        control={form.control}
                        name="technicalDetails.hasExternalAPIs"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Uses External APIs
                              </FormLabel>
                              <FormDescription>
                                Check if your game connects to external APIs or services
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="technicalDetails.hasServerSideCode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Uses Server-Side Code
                              </FormLabel>
                              <FormDescription>
                                Check if your game requires server-side processing
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="technicalDetails.thirdPartyLibraries"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Third-Party Libraries</FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={[
                                  { value: "jquery", label: "jQuery" },
                                  { value: "react", label: "React" },
                                  { value: "three.js", label: "Three.js" },
                                  { value: "pixi.js", label: "Pixi.js" },
                                  { value: "phaser", label: "Phaser" },
                                  { value: "babylon.js", label: "Babylon.js" },
                                  { value: "p5.js", label: "p5.js" },
                                  { value: "lodash", label: "Lodash" },
                                  { value: "firebase", label: "Firebase" },
                                  { value: "gsap", label: "GSAP" },
                                  { value: "matter.js", label: "Matter.js" },
                                  { value: "socket.io", label: "Socket.IO" },
                                ]}
                                selected={field.value}
                                onChange={field.onChange}
                                placeholder="Select libraries"
                                allowCustom
                              />
                            </FormControl>
                            <FormDescription>
                              List any third-party libraries or frameworks used in your game
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => setCurrentTab("media")}>Previous: Media</Button>
                  <Button type="button" onClick={() => setCurrentTab("monetization")}>Next: Monetization</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="monetization" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monetization & Legal</CardTitle>
                    <CardDescription>Configure how your game generates revenue</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="pricingTier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pricing Tier</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select pricing tier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="free">Free to Play</SelectItem>
                              <SelectItem value="premium">Premium (Paid)</SelectItem>
                              <SelectItem value="freemium">Freemium (Free with in-app purchases)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose how you want to monetize your game
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Monetization Options</h3>
                      
                      <FormField
                        control={form.control}
                        name="monetizationSettings.hasInAppPurchases"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                In-App Purchases
                              </FormLabel>
                              <FormDescription>
                                Players can purchase virtual items or currency
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="monetizationSettings.hasPremiumVersion"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Premium Version
                              </FormLabel>
                              <FormDescription>
                                Players can upgrade to a premium version with additional features
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="monetizationSettings.hasSubscription"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Subscription
                              </FormLabel>
                              <FormDescription>
                                Players pay a recurring fee for access to the game or premium features
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="monetizationSettings.hasAdvertisements"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Advertisements
                              </FormLabel>
                              <FormDescription>
                                Game includes advertisements
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Legal Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="legalInfo.supportEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Support Email</FormLabel>
                            <FormControl>
                              <Input placeholder="support@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Email address for player support inquiries
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="legalInfo.privacyPolicyUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Privacy Policy URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/privacy" {...field} />
                            </FormControl>
                            <FormDescription>
                              Link to your game's privacy policy
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="legalInfo.termsOfServiceUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Terms of Service URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/terms" {...field} />
                            </FormControl>
                            <FormDescription>
                              Link to your game's terms of service
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="releaseNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Release Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Release notes for version 1.0" 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Describe what's included in this version of your game
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <div className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => setCurrentTab("technical")}>Previous: Technical</Button>
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={handleSaveDraft}
                      disabled={submitMutation.isPending}
                    >
                      Save as Draft
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleSubmitForReview}
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending ? "Submitting..." : "Submit for Review"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default NewGamePage;