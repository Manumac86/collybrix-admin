"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/pm/shared/user-avatar";
import { Heart, Trash2, Edit2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RetrospectiveCard as RetroCard } from "@/types/pm";

interface RetrospectiveCardProps {
  card: RetroCard;
  onVote: (cardId: string, action: "add" | "remove") => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
  onUpdate?: (cardId: string, content: string) => Promise<void>;
  users: Array<{ _id: string; name: string; avatarUrl: string | null; role: string }>;
  maxVotes?: number;
  currentUserVotes?: number;
  isVoting?: boolean;
}

export function RetrospectiveCard({
  card,
  onVote,
  onDelete,
  onUpdate,
  users,
  maxVotes = 3,
  currentUserVotes = 0,
  isVoting = false,
}: RetrospectiveCardProps) {
  const { userId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(card.content);
  const [isDeleting, setIsDeleting] = useState(false);

  const author = users.find((u) => u._id === card.authorId);
  const hasVoted = userId ? card.votes.includes(userId) : false;
  const isAuthor = userId === card.authorId;
  const canDelete = isAuthor || card.isAnonymous;
  const canEdit = isAuthor && !card.isAnonymous;

  // Check if user has reached max votes
  const hasReachedMaxVotes = !hasVoted && currentUserVotes >= maxVotes;

  const handleVote = async () => {
    if (!userId) return;
    const action = hasVoted ? "remove" : "add";
    await onVote(card._id.toString(), action);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this card?")) return;
    setIsDeleting(true);
    try {
      await onDelete(card._id.toString());
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!onUpdate || !editContent.trim()) return;
    try {
      await onUpdate(card._id.toString(), editContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update card:", error);
    }
  };

  const handleCancel = () => {
    setEditContent(card.content);
    setIsEditing(false);
  };

  return (
    <Card
      className={cn(
        "group relative p-4 transition-all hover:shadow-md",
        hasVoted && "ring-2 ring-pink-400",
        isDeleting && "opacity-50 pointer-events-none"
      )}
    >
      {/* Card Header - Author/Anonymous */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {card.isAnonymous ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs">?</span>
              </div>
              <span className="text-xs text-muted-foreground">Anonymous</span>
            </div>
          ) : (
            author && (
              <div className="flex items-center gap-2">
                <UserAvatar user={author as any} size="sm" showTooltip={false} />
                <span className="text-xs text-muted-foreground">{author.name}</span>
              </div>
            )
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Card Content */}
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[80px] text-sm"
            autoFocus
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {editContent.length}/500
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-7"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={!editContent.trim()}
                className="h-7"
              >
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm mb-3 whitespace-pre-wrap break-words">{card.content}</p>
      )}

      {/* Voting Section */}
      <div className="flex items-center justify-between pt-3 border-t">
        <Button
          variant={hasVoted ? "default" : "outline"}
          size="sm"
          onClick={handleVote}
          disabled={isVoting || hasReachedMaxVotes}
          className={cn(
            "h-7 gap-1",
            hasVoted && "bg-pink-500 hover:bg-pink-600",
            hasReachedMaxVotes && "opacity-50 cursor-not-allowed"
          )}
        >
          <Heart
            className={cn("h-3 w-3", hasVoted && "fill-current")}
          />
          <span className="text-xs font-medium">{card.votes.length}</span>
        </Button>

        {hasReachedMaxVotes && !hasVoted && (
          <span className="text-xs text-muted-foreground">
            Max votes reached
          </span>
        )}
      </div>
    </Card>
  );
}
