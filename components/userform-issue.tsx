"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface IssueReportFormProps {
  onSubmitSuccess?: () => void;
}

export function IssueReportForm({ onSubmitSuccess }: IssueReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "technical",
    attachments: null as FileList | null,
  });

  const addIssue = useMutation(api.issues.add);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, attachments: e.target.files }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call Convex mutation to add issue
      await addIssue({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        status: "open",
        // We'll handle attachments separately in a real implementation
      });

      toast.success(
        "Your issue has been submitted and will be reviewed shortly.",
        {
          style: {
            background: "green",
            color: "white",
          },
        }
      );

      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        category: "technical",
        attachments: null,
      });

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast.error(
        "There was a problem submitting your issue. Please try again.",
        {
          style: {
            background: "red",
            color: "white",
          },
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report an Issue</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Brief description of the issue"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Please provide detailed information about the issue"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments (optional)</Label>
            <Input
              id="attachments"
              name="attachments"
              type="file"
              multiple
              onChange={handleFileChange}
            />
            <p className="text-sm text-muted-foreground">
              Upload screenshots or relevant files (max 5MB each)
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Issue Report"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
