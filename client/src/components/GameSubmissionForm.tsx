import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { InsertGame } from "@shared/schema";
import { Upload, Image, X } from "lucide-react";

// Create a schema for the form that extends insertGameSchema
const gameSubmissionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  instructions: z.string().min(10, "Instructions must be at least 10 characters"),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms to submit a game",
  }),
});

type GameSubmissionFormValues = z.infer<typeof gameSubmissionSchema>;

const GameSubmissionForm = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [gameFileError, setGameFileError] = useState("");
  const [thumbnailError, setThumbnailError] = useState("");

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const form = useForm<GameSubmissionFormValues>({
    resolver: zodResolver(gameSubmissionSchema),
    defaultValues: {
      title: "",
      description: "",
      instructions: "",
      categoryId: "",
      tags: "",
      termsAccepted: false,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (values: GameSubmissionFormValues) => {
      // Validate files
      if (!gameFile) throw new Error("Game file is required");
      if (!thumbnail) throw new Error("Thumbnail is required");

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("instructions", values.instructions);
      formData.append("categoryId", values.categoryId);
      
      if (values.tags) {
        formData.append("tags", values.tags);
      }
      
      formData.append("gameFile", gameFile);
      formData.append("thumbnail", thumbnail);

      const response = await fetch("/api/games", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit game");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Game submitted successfully!",
        description: "Your game has been uploaded and is now available for others to play.",
      });
      setLocation(`/games/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: GameSubmissionFormValues) => {
    // Reset file errors
    setGameFileError("");
    setThumbnailError("");

    // Validate files before submission
    if (!gameFile) {
      setGameFileError("Game file is required");
      return;
    }

    if (!thumbnail) {
      setThumbnailError("Thumbnail is required");
      return;
    }

    submitMutation.mutate(values);
  };

  const handleGameFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["text/html", "application/zip"];
    if (!validTypes.includes(file.type)) {
      setGameFileError("Only HTML and ZIP files are allowed");
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setGameFileError("File size must be less than 50MB");
      return;
    }

    setGameFileError("");
    setGameFile(file);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setThumbnailError("Only image files are allowed");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setThumbnailError("File size must be less than 5MB");
      return;
    }

    setThumbnailError("");
    setThumbnail(file);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="font-heading text-3xl font-bold text-white mb-8 text-center">
        Submit Your Game
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="bg-card p-8 rounded-xl">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="text-white">Game Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter game title"
                    className="bg-background border-gray-700 text-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={categoriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background border-gray-700 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-gray-700">
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
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
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Tags (comma separated)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. multiplayer, puzzle, arcade"
                      className="bg-background border-gray-700 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="text-white">Game Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your game..."
                    className="bg-background border-gray-700 text-white"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="text-white">How to Play</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide instructions for players..."
                    className="bg-background border-gray-700 text-white"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mb-6">
            <FormLabel className="text-white block mb-2">Game File (HTML5 or ZIP)</FormLabel>
            <div 
              className={`border-2 border-dashed ${gameFileError ? 'border-red-500' : 'border-gray-700'} rounded-lg p-6 text-center bg-background cursor-pointer`}
              onClick={() => document.getElementById('gameFile')?.click()}
            >
              {gameFile ? (
                <div className="flex items-center justify-center">
                  <span className="text-white mr-2">{gameFile.name}</span>
                  <Button 
                    type="button" 
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGameFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <Upload className="h-10 w-10 text-gray-500 mx-auto" />
                  </div>
                  <p className="text-gray-400 mb-2">Drag and drop your game files here, or click to browse</p>
                  <p className="text-gray-500 text-sm">Max file size: 50MB. Accepted formats: .html, .zip</p>
                </>
              )}
              <input
                type="file"
                id="gameFile"
                accept=".html,.zip"
                className="hidden"
                onChange={handleGameFileChange}
              />
            </div>
            {gameFileError && <p className="text-red-500 mt-2 text-sm">{gameFileError}</p>}
          </div>

          <div className="mb-6">
            <FormLabel className="text-white block mb-2">Game Thumbnail</FormLabel>
            <div 
              className={`border-2 border-dashed ${thumbnailError ? 'border-red-500' : 'border-gray-700'} rounded-lg p-6 text-center bg-background cursor-pointer`}
              onClick={() => document.getElementById('thumbnail')?.click()}
            >
              {thumbnail ? (
                <div className="flex items-center justify-center">
                  {thumbnail.type.startsWith('image/') && (
                    <img 
                      src={URL.createObjectURL(thumbnail)} 
                      alt="Thumbnail preview" 
                      className="h-20 object-contain mr-2"
                    />
                  )}
                  <span className="text-white mr-2">{thumbnail.name}</span>
                  <Button 
                    type="button" 
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThumbnail(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <Image className="h-10 w-10 text-gray-500 mx-auto" />
                  </div>
                  <p className="text-gray-400 mb-2">Upload a thumbnail image for your game</p>
                  <p className="text-gray-500 text-sm">Recommended size: 600x400px. Accepted formats: .jpg, .png</p>
                </>
              )}
              <input
                type="file"
                id="thumbnail"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailChange}
              />
            </div>
            {thumbnailError && <p className="text-red-500 mt-2 text-sm">{thumbnailError}</p>}
          </div>

          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="mb-6 flex items-start space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-gray-300">
                    I confirm that I own or have the rights to distribute this game
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              className="btn-primary bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Game"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default GameSubmissionForm;
