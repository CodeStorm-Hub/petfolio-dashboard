"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Database } from "@/lib/types/database";
import {
  createAnnouncement,
  deleteAnnouncement,
  setAnnouncementPinned,
} from "@/lib/admin/announcement-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Announcement = Database["public"]["Tables"]["vendor_announcements"]["Row"];

export function AnnouncementsView({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    const result = await createAnnouncement(title, body, isPinned);
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Announcement posted");
    setTitle("");
    setBody("");
    setIsPinned(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const result = await deleteAnnouncement(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function handleTogglePin(announcement: Announcement) {
    const result = await setAnnouncementPinned(announcement.id, !announcement.is_pinned);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>New announcement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input required value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea
                required
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isPinned} onCheckedChange={setIsPinned} />
              <Label>Pin to top</Label>
            </div>
            <Button type="submit" disabled={submitting}>
              Post announcement
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {announcements.length ? (
          announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{announcement.title}</p>
                    {announcement.is_pinned ? <Badge>Pinned</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{announcement.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(announcement.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleTogglePin(announcement)}>
                    {announcement.is_pinned ? "Unpin" : "Pin"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}
