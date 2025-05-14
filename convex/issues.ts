import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all issues (admin only)
export const getAll = query({
  handler: async (ctx) => {
    // In a real app, you would check if the user is an admin here
    // const identity = await ctx.auth.getUserIdentity()
    // if (!identity || !isAdmin(identity)) throw new Error("Unauthorized")

    return await ctx.db.query("issues").collect();
  },
});

// Get issues by user
export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // In a real app, you would verify the user is requesting their own issues
    // const identity = await ctx.auth.getUserIdentity()
    // if (!identity || (identity.subject !== args.userId && !isAdmin(identity)))
    //   throw new Error("Unauthorized")

    return await ctx.db
      .query("issues")
      .withIndex("by_user", (q) => q.eq("createdBy", args.userId))
      .collect();
  },
});

// Get issue by ID
export const getById = query({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.id);

    if (!issue) {
      throw new Error("Issue not found");
    }

    // In a real app, you would check if the user can access this issue
    // const identity = await ctx.auth.getUserIdentity()
    // if (!identity || (identity.subject !== issue.createdBy && !isAdmin(identity)))
    //   throw new Error("Unauthorized")

    return issue;
  },
});

// Add a new issue
export const add = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.string(), // "low", "medium", "high", "critical"
    category: v.string(), // "technical", "billing", "feature", "security", "other"
    status: v.string(), // "open", "in-progress", "resolved"
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    return await ctx.db.insert("issues", {
      title: args.title,
      description: args.description,
      priority: args.priority,
      category: args.category,
      status: args.status,
      attachments: args.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      assignedTo: null,
      comments: [],
    });
  },
});

// Update an issue (admin only for most fields)
export const update = mutation({
  args: {
    id: v.id("issues"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
    assignedTo: v.optional(v.union(v.string(), v.null())),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const issue = await ctx.db.get(id);
    if (!issue) {
      throw new Error("Issue not found");
    }

    // In a real app, you would check if the user can update this issue
    // const identity = await ctx.auth.getUserIdentity()
    // if (!identity) throw new Error("Unauthorized")

    // Regular users can only update their own issues and only certain fields
    // if (identity.subject !== issue.createdBy && !isAdmin(identity)) {
    //   // Regular users can only update description of their own issues
    //   if (Object.keys(updates).some(key => key !== "description")) {
    //     throw new Error("Unauthorized to update these fields")
    //   }
    // }

    // Add updatedAt timestamp
    updates.updatedAt = new Date().toISOString();

    return await ctx.db.patch(id, updates);
  },
});

// Add a comment to an issue
export const addComment = mutation({
  args: {
    issueId: v.id("issues"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new Error("Issue not found");
    }

    // In a real app, you would check if the user can comment on this issue
    // if (!identity) throw new Error("Unauthorized")

    const comment = {
      id: Math.random().toString(36).substring(2, 15),
      content: args.content,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    const comments = [...(issue.comments || []), comment];

    return await ctx.db.patch(args.issueId, {
      comments,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Delete an issue (admin only)
export const remove = mutation({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.id);
    if (!issue) {
      throw new Error("Issue not found");
    }

    // In a real app, you would check if the user can delete this issue
    // const identity = await ctx.auth.getUserIdentity()
    // if (!identity || !isAdmin(identity)) throw new Error("Unauthorized")

    return await ctx.db.delete(args.id);
  },
});

// Helper function to check if a user is an admin
// function isAdmin(identity: any): boolean {
//   return identity.tokenIdentifier.includes("admin") ||
//          identity.publicMetadata?.role === "admin"
// }

// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";

// // Get all issues
// export const getAll = query({
//   handler: async (ctx) => {
//     return await ctx.db.query("issues").collect();
//   },
// });

// // Get issues by user
// export const getByUser = query({
//   args: { userId: v.string() },
//   handler: async (ctx, args) => {
//     return await ctx.db
//       .query("issues")
//       .withIndex("by_user", (q) => q.eq("createdBy", args.userId))
//       .collect();
//   },
// });

// // Get issue by ID
// export const getById = query({
//   args: { id: v.id("issues") },
//   handler: async (ctx, args) => {
//     return await ctx.db.get(args.id);
//   },
// });

// // Add a new issue
// export const add = mutation({
//   args: {
//     title: v.string(),
//     description: v.string(),
//     priority: v.string(), // "low", "medium", "high", "critical"
//     category: v.string(), // "technical", "billing", "feature", "security", "other"
//     status: v.string(), // "open", "in-progress", "resolved"
//     attachments: v.optional(v.array(v.string())),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     const userId = identity?.subject;

//     return await ctx.db.insert("issues", {
//       title: args.title,
//       description: args.description,
//       priority: args.priority,
//       category: args.category,
//       status: args.status,
//       attachments: args.attachments || [],
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       createdBy: userId,
//       assignedTo: null,
//       comments: [],
//     });
//   },
// });

// // Update an issue
// export const update = mutation({
//   args: {
//     id: v.id("issues"),
//     title: v.optional(v.string()),
//     description: v.optional(v.string()),
//     priority: v.optional(v.string()),
//     category: v.optional(v.string()),
//     status: v.optional(v.string()),
//     updatedAt: v.optional(v.string()),
//     assignedTo: v.optional(v.union(v.string(), v.null())),
//     attachments: v.optional(v.array(v.string())),
//   },
//   handler: async (ctx, args) => {
//     const { id, ...updates } = args;

//     // Add updatedAt timestamp
//     updates.updatedAt = new Date().toISOString();

//     return await ctx.db.patch(id, updates);
//   },
// });

// // Add a comment to an issue
// export const addComment = mutation({
//   args: {
//     issueId: v.id("issues"),
//     content: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     const userId = identity?.subject;

//     const issue = await ctx.db.get(args.issueId);
//     if (!issue) {
//       throw new Error("Issue not found");
//     }

//     const comment = {
//       id: Math.random().toString(36).substring(2, 15),
//       content: args.content,
//       createdBy: userId,
//       createdAt: new Date().toISOString(),
//     };

//     const comments = [...(issue.comments || []), comment];

//     return await ctx.db.patch(args.issueId, {
//       comments,
//       updatedAt: new Date().toISOString(),
//     });
//   },
// });

// // Delete an issue
// export const remove = mutation({
//   args: { id: v.id("issues") },
//   handler: async (ctx, args) => {
//     return await ctx.db.delete(args.id);
//   },
// });
