"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RetrospectiveCard } from "./retrospective-card";
import { Plus, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  RetrospectiveCard as RetroCard,
  RetrospectiveFormat,
  RetrospectiveColumn,
} from "@/types/pm";

interface ColumnConfig {
  id: string;
  title: string;
  emoji: string;
  description: string;
  color: string;
  bgColor: string;
}

const FORMAT_COLUMNS: Record<RetrospectiveFormat, ColumnConfig[]> = {
  "mad-sad-glad": [
    {
      id: "mad",
      title: "Mad",
      emoji: "😠",
      description: "Frustrations & blockers",
      color: "text-red-700",
      bgColor: "bg-red-50 border-red-200",
    },
    {
      id: "sad",
      title: "Sad",
      emoji: "😢",
      description: "Disappointments",
      color: "text-blue-700",
      bgColor: "bg-blue-50 border-blue-200",
    },
    {
      id: "glad",
      title: "Glad",
      emoji: "😊",
      description: "Wins & celebrations",
      color: "text-green-700",
      bgColor: "bg-green-50 border-green-200",
    },
  ],
  "what-went-well": [
    {
      id: "went-well",
      title: "What Went Well",
      emoji: "✅",
      description: "Successes",
      color: "text-green-700",
      bgColor: "bg-green-50 border-green-200",
    },
    {
      id: "improve",
      title: "Could Be Better",
      emoji: "🔄",
      description: "Areas to improve",
      color: "text-orange-700",
      bgColor: "bg-orange-50 border-orange-200",
    },
    {
      id: "ideas",
      title: "Ideas",
      emoji: "💡",
      description: "New approaches",
      color: "text-purple-700",
      bgColor: "bg-purple-50 border-purple-200",
    },
  ],
  "start-stop-continue": [
    {
      id: "start",
      title: "Start",
      emoji: "🚀",
      description: "Begin doing",
      color: "text-green-700",
      bgColor: "bg-green-50 border-green-200",
    },
    {
      id: "stop",
      title: "Stop",
      emoji: "🛑",
      description: "Eliminate",
      color: "text-red-700",
      bgColor: "bg-red-50 border-red-200",
    },
    {
      id: "continue",
      title: "Continue",
      emoji: "♻️",
      description: "Keep doing",
      color: "text-blue-700",
      bgColor: "bg-blue-50 border-blue-200",
    },
  ],
  "4ls": [
    {
      id: "loved",
      title: "Loved",
      emoji: "❤️",
      description: "What we loved",
      color: "text-pink-700",
      bgColor: "bg-pink-50 border-pink-200",
    },
    {
      id: "loathed",
      title: "Loathed",
      emoji: "💔",
      description: "What we hated",
      color: "text-red-700",
      bgColor: "bg-red-50 border-red-200",
    },
    {
      id: "learned",
      title: "Learned",
      emoji: "📚",
      description: "Key learnings",
      color: "text-blue-700",
      bgColor: "bg-blue-50 border-blue-200",
    },
    {
      id: "longed",
      title: "Longed For",
      emoji: "🌟",
      description: "What we wished",
      color: "text-purple-700",
      bgColor: "bg-purple-50 border-purple-200",
    },
  ],
};

interface RetrospectiveBoardProps {
  format: RetrospectiveFormat;
  cards: RetroCard[];
  users: Array<{ _id: string; name: string; avatarUrl: string | null; role: string }>;
  onAddCard: (column: string, content: string, isAnonymous: boolean) => Promise<void>;
  onVoteCard: (cardId: string, action: "add" | "remove") => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
  onUpdateCard?: (cardId: string, content: string) => Promise<void>;
  allowAnonymous?: boolean;
  maxVotes?: number;
  isLoading?: boolean;
}

export function RetrospectiveBoard({
  format,
  cards,
  users,
  onAddCard,
  onVoteCard,
  onDeleteCard,
  onUpdateCard,
  allowAnonymous = true,
  maxVotes = 3,
  isLoading = false,
}: RetrospectiveBoardProps) {
  const { userId } = useAuth();
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [newCardContent, setNewCardContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const columns = FORMAT_COLUMNS[format];

  // Calculate user's current vote count
  const currentUserVotes = useMemo(() => {
    if (!userId) return 0;
    return cards.reduce((count, card) => {
      return count + (card.votes.includes(userId) ? 1 : 0);
    }, 0);
  }, [cards, userId]);

  // Group cards by column
  const cardsByColumn = useMemo(() => {
    const grouped: Record<string, RetroCard[]> = {};
    columns.forEach((col) => {
      grouped[col.id] = cards
        .filter((card) => card.column === col.id)
        .sort((a, b) => a.order - b.order);
    });
    return grouped;
  }, [cards, columns]);

  const handleAddCard = async () => {
    if (!activeColumn || !newCardContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddCard(activeColumn, newCardContent.trim(), isAnonymous);
      setNewCardContent("");
      setIsAnonymous(false);
      setActiveColumn(null);
    } catch (error) {
      console.error("Failed to add card:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNewCardContent("");
    setIsAnonymous(false);
    setActiveColumn(null);
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-900 font-medium">
                Add your thoughts to each column
              </p>
              <p className="text-xs text-blue-700 mt-1">
                You have {maxVotes - currentUserVotes} votes remaining
              </p>
            </div>
            {allowAnonymous && (
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <UserX className="h-4 w-4" />
                <span>Anonymous mode available</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Columns Grid */}
      <div
        className={cn(
          "grid gap-4",
          columns.length === 3 && "grid-cols-1 md:grid-cols-3",
          columns.length === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        )}
      >
        {columns.map((column) => {
          const columnCards = cardsByColumn[column.id] || [];
          const isAddingToColumn = activeColumn === column.id;

          return (
            <Card
              key={column.id}
              className={cn("flex flex-col", column.bgColor)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{column.emoji}</span>
                    <div>
                      <CardTitle className={cn("text-base", column.color)}>
                        {column.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {column.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {columnCards.length}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                {/* Existing Cards */}
                {columnCards.map((card) => (
                  <RetrospectiveCard
                    key={card._id.toString()}
                    card={card}
                    users={users}
                    onVote={onVoteCard}
                    onDelete={onDeleteCard}
                    onUpdate={onUpdateCard}
                    maxVotes={maxVotes}
                    currentUserVotes={currentUserVotes}
                    isVoting={isLoading}
                  />
                ))}

                {/* Add Card Form */}
                {isAddingToColumn ? (
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-4 space-y-3">
                      <Textarea
                        value={newCardContent}
                        onChange={(e) => setNewCardContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="min-h-[100px] text-sm"
                        autoFocus
                        maxLength={500}
                      />

                      <div className="text-xs text-muted-foreground text-right">
                        {newCardContent.length}/500
                      </div>

                      {allowAnonymous && (
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`anonymous-${column.id}`}
                            checked={isAnonymous}
                            onCheckedChange={setIsAnonymous}
                          />
                          <Label
                            htmlFor={`anonymous-${column.id}`}
                            className="text-sm cursor-pointer"
                          >
                            Post anonymously
                          </Label>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          disabled={isSubmitting}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddCard}
                          disabled={!newCardContent.trim() || isSubmitting}
                          className="flex-1"
                        >
                          {isSubmitting ? "Adding..." : "Add Card"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* Add Card Button */
                  <Button
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => setActiveColumn(column.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Card
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
