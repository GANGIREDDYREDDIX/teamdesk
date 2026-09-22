/**
 * TeamDesk – Mock Data Store
 *
 * Simulates a Supabase backend for Phase 1 demo.
 * All data is stored in memory and localStorage for persistence across reloads.
 * Replace individual functions with Supabase calls when connecting a real backend.
 */

import { format, addDays, subDays, addHours, parseISO, isAfter, isBefore } from 'date-fns'

// ─── Seed Data ────────────────────────────────────────────────────────────────
const now = new Date()
const fmt = (d) => format(d, "yyyy-MM-dd'T'HH:mm:ss'Z'")

const SEED = {
  org: {
    id: 'org-1',
    name: 'Acme Corp',
    timezone: 'America/New_York',
    digest_time: '09:00',
  },

  users: [
    {
      id: 'user-head',
      email: 'head@teamdesk.demo',
      password: 'Head@1234',
      role: 'head',
      name: 'Jordan Blake',
      initials: 'JB',
      avatar_color: '#1E2A4A',
      department_id: null,
      is_active: true,
      joined_at: fmt(subDays(now, 90)),
    },
    {
      id: 'user-alice',
      email: 'alice@teamdesk.demo',
      password: 'Alice@1234',
      role: 'employee',
      name: 'Alice Chen',
      initials: 'AC',
      avatar_color: '#7C3AED',
      department_id: 'dept-eng',
      is_active: true,
      joined_at: fmt(subDays(now, 60)),
    },
    {
      id: 'user-bob',
      email: 'bob@teamdesk.demo',
      password: 'Bob@1234',
      role: 'employee',
      name: 'Bob Sharma',
      initials: 'BS',
      avatar_color: '#0891B2',
      department_id: 'dept-mktg',
      is_active: true,
      joined_at: fmt(subDays(now, 45)),
    },
    {
      id: 'user-carol',
      email: 'carol@teamdesk.demo',
      password: 'Carol@1234',
      role: 'employee',
      name: 'Carol Rivera',
      initials: 'CR',
      avatar_color: '#DC2626',
      department_id: 'dept-ops',
      is_active: true,
      joined_at: fmt(subDays(now, 30)),
    },
  ],

  departments: [
    { id: 'dept-eng',  name: 'Engineering', org_id: 'org-1' },
    { id: 'dept-mktg', name: 'Marketing',   org_id: 'org-1' },
    { id: 'dept-ops',  name: 'Operations',  org_id: 'org-1' },
  ],

  tasks: [
    // P1 Critical – Overdue – In Progress
    {
      id: 'task-1',
      reference: 'TD-0001',
      title: 'Fix critical payment gateway bug',
      instructions: 'Users are unable to complete purchases when using Visa cards. Investigate the payment processor integration and resolve the issue immediately. Check logs for error codes starting with STRIPE_ERR.',
      assigned_to: 'user-alice',
      assigned_by: 'user-head',
      department_id: 'dept-eng',
      priority: 'p1',
      status: 'in_progress',
      deadline_date: format(subDays(now, 1), 'yyyy-MM-dd'),
      deadline_time: '17:00',
      start_date: format(subDays(now, 3), 'yyyy-MM-dd'),
      tags: ['bug', 'payments', 'critical'],
      estimated_hours: 8,
      acceptance_criteria: 'All Visa card transactions complete successfully. Error rate drops to < 0.1%. QA sign-off on payment flow.',
      progress: 65,
      blocker_reason: null,
      current_deadline: format(subDays(now, 1), 'yyyy-MM-dd') + 'T17:00:00Z',
      original_deadline: format(subDays(now, 1), 'yyyy-MM-dd') + 'T17:00:00Z',
      assignment_group_id: null,
      created_at: fmt(subDays(now, 3)),
      updated_at: fmt(subDays(now, 0)),
      acknowledged_at: fmt(subDays(now, 3)),
    },

    // P2 High – Blocked
    {
      id: 'task-2',
      reference: 'TD-0002',
      title: 'Prepare Q3 Marketing Report',
      instructions: 'Compile all Q3 campaign performance data including click rates, conversions, and ROI by channel. Include competitor benchmarks. Deliver a 10-page executive summary with charts.',
      assigned_to: 'user-bob',
      assigned_by: 'user-head',
      department_id: 'dept-mktg',
      priority: 'p2',
      status: 'blocked',
      deadline_date: format(addDays(now, 2), 'yyyy-MM-dd'),
      deadline_time: '17:00',
      start_date: format(subDays(now, 5), 'yyyy-MM-dd'),
      tags: ['report', 'q3', 'marketing'],
      estimated_hours: 16,
      acceptance_criteria: 'Report reviewed by Head of Marketing. All charts use approved brand colors. PDF exported and uploaded.',
      progress: 40,
      blocker_reason: 'Waiting for Google Analytics access credentials from IT. Submitted ticket #IT-4521 three days ago with no response.',
      current_deadline: format(addDays(now, 2), 'yyyy-MM-dd') + 'T17:00:00Z',
      original_deadline: format(addDays(now, 2), 'yyyy-MM-dd') + 'T17:00:00Z',
      assignment_group_id: null,
      created_at: fmt(subDays(now, 5)),
      updated_at: fmt(subDays(now, 1)),
      acknowledged_at: fmt(subDays(now, 5)),
    },

    // P3 Medium – Awaiting Review
    {
      id: 'task-3',
      reference: 'TD-0003',
      title: 'Update employee onboarding checklist',
      instructions: 'Review and update the current onboarding document to reflect recent policy changes. Add new sections for remote work setup and security training. Get legal review for data privacy section.',
      assigned_to: 'user-carol',
      assigned_by: 'user-head',
      department_id: 'dept-ops',
      priority: 'p3',
      status: 'awaiting_review',
      deadline_date: format(now, 'yyyy-MM-dd'),
      deadline_time: '17:00',
      start_date: format(subDays(now, 7), 'yyyy-MM-dd'),
      tags: ['hr', 'documentation', 'onboarding'],
      estimated_hours: 6,
      acceptance_criteria: 'Document reflects all 2026 policy updates. Legal team has signed off. Available in company wiki.',
      progress: 100,
      blocker_reason: null,
      current_deadline: format(now, 'yyyy-MM-dd') + 'T17:00:00Z',
      original_deadline: format(now, 'yyyy-MM-dd') + 'T17:00:00Z',
      assignment_group_id: null,
      created_at: fmt(subDays(now, 7)),
      updated_at: fmt(addHours(now, -2)),
      acknowledged_at: fmt(subDays(now, 7)),
    },

    // P4 Low – To Do (unacknowledged)
    {
      id: 'task-4',
      reference: 'TD-0004',
      title: 'Organize team building event for October',
      instructions: 'Research and book a team building activity for the whole department (12 people). Budget is $150/person. Options: escape room, cooking class, or outdoor adventure. Get team preferences survey first.',
      assigned_to: 'user-carol',
      assigned_by: 'user-head',
      department_id: 'dept-ops',
      priority: 'p4',
      status: 'todo',
      deadline_date: format(addDays(now, 14), 'yyyy-MM-dd'),
      deadline_time: '17:00',
      start_date: null,
      tags: ['team-building', 'event'],
      estimated_hours: 4,
      acceptance_criteria: 'Venue booked, calendar invite sent to all team members, budget approved.',
      progress: 0,
      blocker_reason: null,
      current_deadline: format(addDays(now, 14), 'yyyy-MM-dd') + 'T17:00:00Z',
      original_deadline: format(addDays(now, 14), 'yyyy-MM-dd') + 'T17:00:00Z',
      assignment_group_id: null,
      created_at: fmt(subDays(now, 1)),
      updated_at: fmt(subDays(now, 1)),
      acknowledged_at: null,
    },

    // P1 – Completed (bulk assignment group – Alice)
    {
      id: 'task-5',
      reference: 'TD-0005',
      title: 'Complete security training module',
      instructions: 'All team members must complete the mandatory annual security awareness training on the LMS platform. Pass the final quiz with score ≥ 80%. Certificate must be uploaded upon completion.',
      assigned_to: 'user-alice',
      assigned_by: 'user-head',
      department_id: 'dept-eng',
      priority: 'p2',
      status: 'completed',
      deadline_date: format(subDays(now, 3), 'yyyy-MM-dd'),
      deadline_time: '17:00',
      start_date: format(subDays(now, 7), 'yyyy-MM-dd'),
      tags: ['training', 'compliance', 'mandatory'],
      estimated_hours: 3,
      acceptance_criteria: 'LMS shows 100% completion. Certificate uploaded to task. Quiz score ≥ 80%.',
      progress: 100,
      blocker_reason: null,
      current_deadline: format(subDays(now, 3), 'yyyy-MM-dd') + 'T17:00:00Z',
      original_deadline: format(subDays(now, 3), 'yyyy-MM-dd') + 'T17:00:00Z',
      assignment_group_id: 'group-security',
      created_at: fmt(subDays(now, 7)),
      updated_at: fmt(subDays(now, 3)),
      acknowledged_at: fmt(subDays(now, 7)),
    },

    // P2 – Completed (bulk assignment group – Bob)
    {
      id: 'task-6',
      reference: 'TD-0006',
      title: 'Complete security training module',
      instructions: 'All team members must complete the mandatory annual security awareness training on the LMS platform. Pass the final quiz with score ≥ 80%. Certificate must be uploaded upon completion.',
      assigned_to: 'user-bob',
      assigned_by: 'user-head',
      department_id: 'dept-mktg',
      priority: 'p2',
      status: 'in_progress',
      deadline_date: format(subDays(now, 3), 'yyyy-MM-dd'),
      deadline_time: '17:00',
      start_date: format(subDays(now, 7), 'yyyy-MM-dd'),
      tags: ['training', 'compliance', 'mandatory'],
      estimated_hours: 3,
      acceptance_criteria: 'LMS shows 100% completion. Certificate uploaded to task. Quiz score ≥ 80%.',
      progress: 55,
      blocker_reason: null,
      current_deadline: format(subDays(now, 3), 'yyyy-MM-dd') + 'T17:00:00Z',
      original_deadline: format(subDays(now, 3), 'yyyy-MM-dd') + 'T17:00:00Z',
      assignment_group_id: 'group-security',
      created_at: fmt(subDays(now, 7)),
      updated_at: fmt(subDays(now, 2)),
      acknowledged_at: fmt(subDays(now, 7)),
    },

    // P3 – Bulk group – Carol
    {
      id: 'task-7',
      reference: 'TD-0007',
      title: 'Complete security training module',
      instructions: 'All team members must complete the mandatory annual security awareness training on the LMS platform. Pass the final quiz with score ≥ 80%. Certificate must be uploaded upon completion.',
      assigned_to: 'user-carol',
      assigned_by: 'user-head',
      department_id: 'dept-ops',
      priority: 'p2',
      status: 'todo',
      deadline_date: format(subDays(now, 3), 'yyyy-MM-dd'),
      deadline_time: '17:00',
      start_date: null,
      tags: ['training', 'compliance', 'mandatory'],
      estimated_hours: 3,
      acceptance_criteria: 'LMS shows 100% completion. Certificate uploaded to task. Quiz score ≥ 80%.',
      progress: 0,
      blocker_reason: null,
      current_deadline: format(subDays(now, 3), 'yyyy-MM-dd') + 'T17:00:00Z',
      original_deadline: format(subDays(now, 3), 'yyyy-MM-dd') + 'T17:00:00Z',
      assignment_group_id: 'group-security',
      created_at: fmt(subDays(now, 7)),
      updated_at: fmt(subDays(now, 7)),
      acknowledged_at: null,
    },

    // P2 – Alice – In Progress – Due today
    {
      id: 'task-8',
      reference: 'TD-0008',
      title: 'Deploy hotfix v2.3.1 to production',
      instructions: 'Deploy the approved hotfix build to production environment. Run smoke tests post-deployment. Monitor error rates for 2 hours. Document deployment in the runbook.',
      assigned_to: 'user-alice',
      assigned_by: 'user-head',
      department_id: 'dept-eng',
      priority: 'p2',
      status: 'in_progress',
      deadline_date: format(now, 'yyyy-MM-dd'),
      deadline_time: '14:00',
      start_date: format(now, 'yyyy-MM-dd'),
      tags: ['deployment', 'hotfix', 'production'],
      estimated_hours: 2,
      acceptance_criteria: 'Green CI pipeline. Zero critical errors in first 2 hours. Runbook entry complete.',
      progress: 30,
      blocker_reason: null,
      current_deadline: format(now, 'yyyy-MM-dd') + 'T14:00:00Z',
      original_deadline: format(now, 'yyyy-MM-dd') + 'T14:00:00Z',
      assignment_group_id: null,
      created_at: fmt(subDays(now, 1)),
      updated_at: fmt(addHours(now, -1)),
      acknowledged_at: fmt(subDays(now, 1)),
    },

    // P3 – Bob – Upcoming
    {
      id: 'task-9',
      reference: 'TD-0009',
      title: 'Create social media content calendar for November',
      instructions: 'Plan and schedule 30 posts across LinkedIn, Twitter, and Instagram for November. Include product launches, blog promotions, and engagement content. Use Canva for graphics.',
      assigned_to: 'user-bob',
      assigned_by: 'user-head',
      department_id: 'dept-mktg',
      priority: 'p3',
      status: 'todo',
      deadline_date: format(addDays(now, 7), 'yyyy-MM-dd'),
      deadline_time: '17:00',
      start_date: format(addDays(now, 1), 'yyyy-MM-dd'),
      tags: ['social-media', 'content', 'planning'],
      estimated_hours: 12,
      acceptance_criteria: 'Content calendar shared in Google Sheets. All posts reviewed. Graphics assets uploaded.',
      progress: 0,
      blocker_reason: null,
      current_deadline: format(addDays(now, 7), 'yyyy-MM-dd') + 'T17:00:00Z',
      original_deadline: format(addDays(now, 7), 'yyyy-MM-dd') + 'T17:00:00Z',
      assignment_group_id: null,
      created_at: fmt(subDays(now, 2)),
      updated_at: fmt(subDays(now, 2)),
      acknowledged_at: fmt(subDays(now, 2)),
    },

    // P1 – Carol – Cancelled
    {
      id: 'task-10',
      reference: 'TD-0010',
      title: 'Coordinate office relocation logistics',
      instructions: 'Plan and coordinate the office move to 500 Main St scheduled for Sept 15. Arrange movers, IT equipment packing, parking, and employee communication.',
      assigned_to: 'user-carol',
      assigned_by: 'user-head',
      department_id: 'dept-ops',
      priority: 'p1',
      status: 'cancelled',
      deadline_date: format(subDays(now, 10), 'yyyy-MM-dd'),
      deadline_time: '17:00',
      start_date: format(subDays(now, 20), 'yyyy-MM-dd'),
      tags: ['office', 'logistics'],
      estimated_hours: 40,
      acceptance_criteria: 'All equipment moved. Office functional on day 1. Zero data loss.',
      progress: 20,
      blocker_reason: null,
      current_deadline: format(subDays(now, 10), 'yyyy-MM-dd') + 'T17:00:00Z',
      original_deadline: format(subDays(now, 10), 'yyyy-MM-dd') + 'T17:00:00Z',
      assignment_group_id: null,
      created_at: fmt(subDays(now, 20)),
      updated_at: fmt(subDays(now, 10)),
      acknowledged_at: fmt(subDays(now, 19)),
      cancelled_at: fmt(subDays(now, 10)),
    },

    // P3 – Alice – Todo (upcoming)
    {
      id: 'task-11',
      reference: 'TD-0011',
      title: 'Write unit tests for auth module',
      instructions: 'Achieve 90% code coverage on the authentication module. Tests should cover login, logout, token refresh, and error states. Use Vitest and mock Supabase client.',
      assigned_to: 'user-alice',
      assigned_by: 'user-head',
      department_id: 'dept-eng',
      priority: 'p3',
      status: 'todo',
      deadline_date: format(addDays(now, 5), 'yyyy-MM-dd'),
      deadline_time: '17:00',
      start_date: null,
      tags: ['testing', 'auth', 'engineering'],
      estimated_hours: 8,
      acceptance_criteria: '90% coverage report. All existing tests still pass. PR merged.',
      progress: 0,
      blocker_reason: null,
      current_deadline: format(addDays(now, 5), 'yyyy-MM-dd') + 'T17:00:00Z',
      original_deadline: format(addDays(now, 5), 'yyyy-MM-dd') + 'T17:00:00Z',
      assignment_group_id: null,
      created_at: fmt(subDays(now, 1)),
      updated_at: fmt(subDays(now, 1)),
      acknowledged_at: null,
    },

    // P2 – Bob – Extension requested
    {
      id: 'task-12',
      reference: 'TD-0012',
      title: 'Redesign product landing page',
      instructions: 'Redesign the main product landing page based on the new brand guidelines. Create 3 concept mockups in Figma, get feedback from the Head, then develop the chosen design in HTML/CSS.',
      assigned_to: 'user-bob',
      assigned_by: 'user-head',
      department_id: 'dept-mktg',
      priority: 'p2',
      status: 'in_progress',
      deadline_date: format(addDays(now, 3), 'yyyy-MM-dd'),
      deadline_time: '17:00',
      start_date: format(subDays(now, 5), 'yyyy-MM-dd'),
      tags: ['design', 'landing-page', 'web'],
      estimated_hours: 20,
      acceptance_criteria: 'Design approved by Head. Page live on staging. Lighthouse score > 90.',
      progress: 45,
      blocker_reason: null,
      current_deadline: format(addDays(now, 3), 'yyyy-MM-dd') + 'T17:00:00Z',
      original_deadline: format(addDays(now, 1), 'yyyy-MM-dd') + 'T17:00:00Z',
      assignment_group_id: null,
      created_at: fmt(subDays(now, 5)),
      updated_at: fmt(subDays(now, 1)),
      acknowledged_at: fmt(subDays(now, 5)),
    },
  ],

  checklist_items: [
    { id: 'cl-1', task_id: 'task-1', text: 'Reproduce the Visa error in staging', is_required: true,  is_completed: true,  order: 1 },
    { id: 'cl-2', task_id: 'task-1', text: 'Identify root cause in payment logs', is_required: true,  is_completed: true,  order: 2 },
    { id: 'cl-3', task_id: 'task-1', text: 'Implement and test fix',              is_required: true,  is_completed: false, order: 3 },
    { id: 'cl-4', task_id: 'task-1', text: 'QA sign-off',                         is_required: true,  is_completed: false, order: 4 },
    { id: 'cl-5', task_id: 'task-1', text: 'Deploy to production',                is_required: false, is_completed: false, order: 5 },

    { id: 'cl-6',  task_id: 'task-3', text: 'Review current onboarding doc',          is_required: true,  is_completed: true,  order: 1 },
    { id: 'cl-7',  task_id: 'task-3', text: 'Identify outdated sections',             is_required: true,  is_completed: true,  order: 2 },
    { id: 'cl-8',  task_id: 'task-3', text: 'Add remote work setup section',          is_required: true,  is_completed: true,  order: 3 },
    { id: 'cl-9',  task_id: 'task-3', text: 'Add security training section',          is_required: true,  is_completed: true,  order: 4 },
    { id: 'cl-10', task_id: 'task-3', text: 'Legal review for data privacy section',  is_required: false, is_completed: true,  order: 5 },

    { id: 'cl-11', task_id: 'task-8', text: 'Pre-deployment checklist complete',      is_required: true,  is_completed: true,  order: 1 },
    { id: 'cl-12', task_id: 'task-8', text: 'Deploy to staging first',                is_required: true,  is_completed: false, order: 2 },
    { id: 'cl-13', task_id: 'task-8', text: 'Run smoke tests',                        is_required: true,  is_completed: false, order: 3 },
    { id: 'cl-14', task_id: 'task-8', text: 'Deploy to production',                   is_required: true,  is_completed: false, order: 4 },
    { id: 'cl-15', task_id: 'task-8', text: 'Monitor for 2 hours',                    is_required: false, is_completed: false, order: 5 },
  ],

  task_updates: [
    { id: 'upd-1', task_id: 'task-1', progress: 30, note: 'Reproduced the issue. Stack trace shows STRIPE_CARD_DECLINED with code 3006. Investigating webhook handler.', created_by: 'user-alice', created_at: fmt(subDays(now, 2)) },
    { id: 'upd-2', task_id: 'task-1', progress: 65, note: 'Found the bug — missing null check in card brand detection. Fix implemented and tested in staging.', created_by: 'user-alice', created_at: fmt(subDays(now, 1)) },
    { id: 'upd-3', task_id: 'task-2', progress: 40, note: 'Collected data from all sources except Google Analytics. Waiting on IT for access. Charts for social and email done.', created_by: 'user-bob', created_at: fmt(subDays(now, 1)) },
    { id: 'upd-4', task_id: 'task-8', progress: 30, note: 'Pre-deployment checklist complete. Starting staging deployment now.', created_by: 'user-alice', created_at: fmt(addHours(now, -1)) },
    { id: 'upd-5', task_id: 'task-12', progress: 45, note: '2 Figma mockups ready, working on the third. On track.', created_by: 'user-bob', created_at: fmt(subDays(now, 1)) },
  ],

  task_comments: [
    { id: 'cmt-1', task_id: 'task-1', text: 'This is blocking our Black Friday sale. Please prioritize QA as soon as the fix is ready.', author_id: 'user-head', created_at: fmt(subDays(now, 2)) },
    { id: 'cmt-2', task_id: 'task-1', text: 'Understood. I\'ll ping you the moment QA is scheduled.', author_id: 'user-alice', created_at: fmt(subDays(now, 2)) },
    { id: 'cmt-3', task_id: 'task-2', text: 'The Google Analytics ticket has been escalated to IT Director. Should have access by EOD.', author_id: 'user-head', created_at: fmt(subDays(now, 0)) },
    { id: 'cmt-4', task_id: 'task-3', text: 'Great work on this. The legal team mentioned one small update to the data retention section — I\'ll send you their notes shortly.', author_id: 'user-head', created_at: fmt(addHours(now, -3)) },
    { id: 'cmt-5', task_id: 'task-12', text: 'The Figma mockups look great! Go with concept B. Let me know if you need brand assets.', author_id: 'user-head', created_at: fmt(subDays(now, 1)) },
  ],

  submissions: [
    {
      id: 'sub-1',
      task_id: 'task-3',
      summary: 'All sections updated per the 2026 policy refresh. Remote work setup guide added with IT-approved hardware list. Security training section links to new LMS course. Legal reviewed and signed off on data privacy section. Document is live in Confluence.',
      submitted_at: fmt(addHours(now, -2)),
      on_time: true,
      review_decision: null,
      reviewed_at: null,
      reviewer_note: null,
      submitted_by: 'user-carol',
    },
    {
      id: 'sub-2',
      task_id: 'task-5',
      summary: 'Completed the full security training module on LMS. Score: 94/100. Certificate attached.',
      submitted_at: fmt(subDays(now, 4)),
      on_time: true,
      review_decision: 'approved',
      reviewed_at: fmt(subDays(now, 3)),
      reviewer_note: 'Excellent score! Thank you for completing this quickly.',
      submitted_by: 'user-alice',
    },
  ],

  extension_requests: [
    {
      id: 'ext-1',
      task_id: 'task-12',
      requested_deadline: format(addDays(now, 3), 'yyyy-MM-dd') + 'T17:00:00Z',
      reason: 'The third Figma mockup requires additional design review from brand team. Requesting 2 extra days to incorporate their feedback before development begins.',
      status: 'approved',
      requested_by: 'user-bob',
      requested_at: fmt(subDays(now, 2)),
      decided_by: 'user-head',
      decided_at: fmt(subDays(now, 1)),
      decision_note: 'Approved. Please keep me posted on the brand team review.',
    },
  ],

  activity_history: [
    { id: 'act-1',  task_id: 'task-1',  field: 'status',   old_value: null,         new_value: 'todo',         actor_id: 'user-head',  created_at: fmt(subDays(now, 3)) },
    { id: 'act-2',  task_id: 'task-1',  field: 'acknowledged', old_value: null,     new_value: 'true',         actor_id: 'user-alice', created_at: fmt(subDays(now, 3)) },
    { id: 'act-3',  task_id: 'task-1',  field: 'status',   old_value: 'todo',       new_value: 'in_progress',  actor_id: 'user-alice', created_at: fmt(subDays(now, 3)) },
    { id: 'act-4',  task_id: 'task-1',  field: 'progress', old_value: '0',          new_value: '30',           actor_id: 'user-alice', created_at: fmt(subDays(now, 2)) },
    { id: 'act-5',  task_id: 'task-1',  field: 'progress', old_value: '30',         new_value: '65',           actor_id: 'user-alice', created_at: fmt(subDays(now, 1)) },
    { id: 'act-6',  task_id: 'task-2',  field: 'status',   old_value: null,         new_value: 'todo',         actor_id: 'user-head',  created_at: fmt(subDays(now, 5)) },
    { id: 'act-7',  task_id: 'task-2',  field: 'status',   old_value: 'in_progress',new_value: 'blocked',      actor_id: 'user-bob',   created_at: fmt(subDays(now, 1)) },
    { id: 'act-8',  task_id: 'task-3',  field: 'status',   old_value: 'in_progress',new_value: 'awaiting_review', actor_id: 'user-carol', created_at: fmt(addHours(now, -2)) },
    { id: 'act-9',  task_id: 'task-5',  field: 'status',   old_value: 'awaiting_review', new_value: 'completed', actor_id: 'user-head', created_at: fmt(subDays(now, 3)) },
    { id: 'act-10', task_id: 'task-10', field: 'status',   old_value: 'in_progress',new_value: 'cancelled',    actor_id: 'user-head',  created_at: fmt(subDays(now, 10)) },
    { id: 'act-11', task_id: 'task-12', field: 'deadline', old_value: format(addDays(now, 1), 'yyyy-MM-dd'), new_value: format(addDays(now, 3), 'yyyy-MM-dd'), actor_id: 'user-head', created_at: fmt(subDays(now, 1)) },
  ],

  notifications: [
    { id: 'notif-1', recipient_id: 'user-alice', type: 'task_assigned',    task_id: 'task-11', message: 'New task assigned: Write unit tests for auth module', read_at: null,                  created_at: fmt(subDays(now, 1)) },
    { id: 'notif-2', recipient_id: 'user-head',  type: 'work_submitted',   task_id: 'task-3',  message: 'Carol Rivera submitted: Update employee onboarding checklist', read_at: null,         created_at: fmt(addHours(now, -2)) },
    { id: 'notif-3', recipient_id: 'user-head',  type: 'blocker_reported', task_id: 'task-2',  message: 'Bob Sharma reported a blocker on: Prepare Q3 Marketing Report', read_at: null,       created_at: fmt(subDays(now, 1)) },
    { id: 'notif-4', recipient_id: 'user-bob',   type: 'extension_decided',task_id: 'task-12', message: 'Your extension request was approved for: Redesign product landing page', read_at: fmt(subDays(now, 1)), created_at: fmt(subDays(now, 1)) },
    { id: 'notif-5', recipient_id: 'user-carol', type: 'task_assigned',    task_id: 'task-4',  message: 'New task assigned: Organize team building event for October', read_at: null,          created_at: fmt(subDays(now, 1)) },
    { id: 'notif-6', recipient_id: 'user-alice', type: 'deadline_reminder',task_id: 'task-8',  message: 'Reminder: Deploy hotfix v2.3.1 to production is due today at 2:00 PM', read_at: null, created_at: fmt(subDays(now, 0)) },
    { id: 'notif-7', recipient_id: 'user-head',  type: 'overdue_alert',    task_id: 'task-1',  message: 'Overdue: Fix critical payment gateway bug (Alice Chen)', read_at: null,               created_at: fmt(now) },
    { id: 'notif-8', recipient_id: 'user-alice', type: 'comment_added',    task_id: 'task-1',  message: 'Jordan Blake commented on: Fix critical payment gateway bug', read_at: fmt(subDays(now, 2)), created_at: fmt(subDays(now, 2)) },
  ],
}

// ─── LocalStorage persistence ─────────────────────────────────────────────────
const STORAGE_KEY = 'teamdesk_store'

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {}
}

// Initialize store (seed if first run)
let _store = loadStore() || {
  org: SEED.org,
  users: SEED.users,
  departments: SEED.departments,
  tasks: SEED.tasks,
  checklist_items: SEED.checklist_items,
  task_updates: SEED.task_updates,
  task_comments: SEED.task_comments,
  submissions: SEED.submissions,
  extension_requests: SEED.extension_requests,
  activity_history: SEED.activity_history,
  notifications: SEED.notifications,
  session: null, // { userId, expiresAt }
}

// Listeners for realtime-like updates
const _listeners = new Set()

function notify() {
  saveStore(_store)
  _listeners.forEach(fn => fn({ ..._store }))
}

export function subscribe(fn) {
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}

export function getStore() {
  return { ..._store }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export function signIn(email, password) {
  const user = _store.users.find(u =>
    u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )
  if (!user) return { error: 'Invalid email or password.' }
  if (!user.is_active) return { error: 'Your account has been deactivated. Contact the department head.' }

  _store.session = { userId: user.id, expiresAt: Date.now() + 8 * 3600 * 1000 }
  notify()
  return { user }
}

export function signOut() {
  _store.session = null
  notify()
}

export function getCurrentUser() {
  if (!_store.session) return null
  if (_store.session.expiresAt < Date.now()) {
    _store.session = null
    return null
  }
  return _store.users.find(u => u.id === _store.session.userId) || null
}

export function resetPasswordRequest(email) {
  const user = _store.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  // In real app: send reset email. Here we just simulate success.
  return { success: true }
}

export function resetPassword(userId, newPassword) {
  const idx = _store.users.findIndex(u => u.id === userId)
  if (idx === -1) return { error: 'User not found.' }
  _store.users[idx].password = newPassword
  notify()
  return { success: true }
}

export function updateProfile(userId, updates) {
  const idx = _store.users.findIndex(u => u.id === userId)
  if (idx === -1) return { error: 'User not found.' }
  _store.users[idx] = { ..._store.users[idx], ...updates }
  notify()
  return { user: _store.users[idx] }
}

// ─── Users / Employees ───────────────────────────────────────────────────────
export function getUsers() { return [..._store.users] }
export function getUserById(id) { return _store.users.find(u => u.id === id) || null }
export function getEmployees() { return _store.users.filter(u => u.role === 'employee') }
export function getActiveEmployees() { return _store.users.filter(u => u.role === 'employee' && u.is_active) }

export function inviteEmployee({ name, email, department_id }) {
  const existing = _store.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (existing) return { error: 'A user with this email already exists.' }

  const id = 'user-' + Date.now()
  const colors = ['#7C3AED','#0891B2','#DC2626','#059669','#D97706','#2563EB']
  const color = colors[_store.users.length % colors.length]
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)

  const user = {
    id,
    email,
    password: 'Welcome@1234', // default password for demo
    role: 'employee',
    name,
    initials,
    avatar_color: color,
    department_id,
    is_active: true,
    joined_at: new Date().toISOString(),
  }
  _store.users.push(user)

  addNotification({
    recipient_id: id,
    type: 'task_assigned',
    task_id: null,
    message: `Welcome to TeamDesk! Your account has been created. Log in with your email and the temporary password Welcome@1234`,
  })

  notify()
  return { user }
}

export function deactivateEmployee(userId) {
  const idx = _store.users.findIndex(u => u.id === userId)
  if (idx === -1) return { error: 'User not found.' }
  _store.users[idx].is_active = false
  // If currently logged in as this user, clear session
  if (_store.session?.userId === userId) _store.session = null
  notify()
  return { success: true }
}

export function reactivateEmployee(userId) {
  const idx = _store.users.findIndex(u => u.id === userId)
  if (idx === -1) return { error: 'User not found.' }
  _store.users[idx].is_active = true
  notify()
  return { success: true }
}

// ─── Departments ──────────────────────────────────────────────────────────────
export function getDepartments() { return [..._store.departments] }

export function createDepartment(name) {
  const id = 'dept-' + Date.now()
  const dept = { id, name, org_id: 'org-1' }
  _store.departments.push(dept)
  notify()
  return { department: dept }
}

export function updateDepartment(id, name) {
  const idx = _store.departments.findIndex(d => d.id === id)
  if (idx === -1) return { error: 'Department not found.' }
  _store.departments[idx].name = name
  notify()
  return { department: _store.departments[idx] }
}

export function deleteDepartment(id) {
  _store.departments = _store.departments.filter(d => d.id !== id)
  notify()
  return { success: true }
}

// ─── Org ──────────────────────────────────────────────────────────────────────
export function getOrg() { return { ..._store.org } }

export function updateOrg(updates) {
  _store.org = { ..._store.org, ...updates }
  notify()
  return { org: _store.org }
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export function getAllTasks() { return [..._store.tasks] }
export function getTaskById(id) { return _store.tasks.find(t => t.id === id) || null }
export function getTasksForEmployee(userId) { return _store.tasks.filter(t => t.assigned_to === userId) }

let _taskCounter = 13 // next reference number

export function createTask(taskData, currentUserId) {
  const assignees = Array.isArray(taskData.assigned_to) ? taskData.assigned_to : [taskData.assigned_to]
  const isGroup = assignees.length > 1
  const groupId = isGroup ? 'group-' + Date.now() : null

  const createdTasks = []

  assignees.forEach((assigneeId) => {
    const id = 'task-' + Date.now() + '-' + assigneeId
    const ref = 'TD-' + String(_taskCounter++).padStart(4, '0')
    const task = {
      id,
      reference: ref,
      title: taskData.title,
      instructions: taskData.instructions,
      assigned_to: assigneeId,
      assigned_by: currentUserId,
      department_id: taskData.department_id || null,
      priority: taskData.priority || 'p3',
      status: 'todo',
      deadline_date: taskData.deadline_date,
      deadline_time: taskData.deadline_time || '17:00',
      start_date: taskData.start_date || null,
      tags: taskData.tags || [],
      estimated_hours: taskData.estimated_hours || null,
      acceptance_criteria: taskData.acceptance_criteria || '',
      progress: 0,
      blocker_reason: null,
      current_deadline: taskData.deadline_date + 'T' + (taskData.deadline_time || '17:00') + ':00Z',
      original_deadline: taskData.deadline_date + 'T' + (taskData.deadline_time || '17:00') + ':00Z',
      assignment_group_id: groupId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      acknowledged_at: null,
    }
    _store.tasks.push(task)

    // Add checklist items
    if (taskData.checklist_items?.length) {
      taskData.checklist_items.forEach((item, i) => {
        _store.checklist_items.push({
          id: 'cl-' + Date.now() + '-' + i,
          task_id: id,
          text: item.text,
          is_required: item.is_required || false,
          is_completed: false,
          order: i + 1,
        })
      })
    }

    // Activity log
    addActivity(id, 'status', null, 'todo', currentUserId)

    // Notify employee
    addNotification({
      recipient_id: assigneeId,
      type: 'task_assigned',
      task_id: id,
      message: `New task assigned: ${taskData.title} (${ref})`,
    })

    createdTasks.push(task)
  })

  notify()
  return { tasks: createdTasks }
}

export function updateTask(taskId, updates, currentUserId) {
  const idx = _store.tasks.findIndex(t => t.id === taskId)
  if (idx === -1) return { error: 'Task not found.' }

  const old = _store.tasks[idx]

  // Track changed fields in activity history
  Object.keys(updates).forEach(key => {
    if (updates[key] !== old[key]) {
      addActivity(taskId, key, String(old[key] ?? ''), String(updates[key] ?? ''), currentUserId)
    }
  })

  _store.tasks[idx] = { ...old, ...updates, updated_at: new Date().toISOString() }
  notify()
  return { task: _store.tasks[idx] }
}

export function acknowledgeTask(taskId, userId) {
  const idx = _store.tasks.findIndex(t => t.id === taskId && t.assigned_to === userId)
  if (idx === -1) return { error: 'Task not found.' }
  _store.tasks[idx].acknowledged_at = new Date().toISOString()
  _store.tasks[idx].updated_at = new Date().toISOString()
  addActivity(taskId, 'acknowledged', null, 'true', userId)
  notify()
  return { success: true }
}

export function startWork(taskId, userId) {
  const idx = _store.tasks.findIndex(t => t.id === taskId && t.assigned_to === userId)
  if (idx === -1) return { error: 'Task not found.' }
  if (_store.tasks[idx].status !== 'todo') return { error: 'Task is not in To Do status.' }
  _store.tasks[idx].status = 'in_progress'
  _store.tasks[idx].updated_at = new Date().toISOString()
  if (!_store.tasks[idx].acknowledged_at) _store.tasks[idx].acknowledged_at = new Date().toISOString()
  addActivity(taskId, 'status', 'todo', 'in_progress', userId)
  notify()
  return { success: true }
}

export function updateProgress(taskId, userId, progress, note) {
  const idx = _store.tasks.findIndex(t => t.id === taskId && t.assigned_to === userId)
  if (idx === -1) return { error: 'Task not found.' }

  const old = _store.tasks[idx].progress
  _store.tasks[idx].progress = progress
  _store.tasks[idx].updated_at = new Date().toISOString()
  if (_store.tasks[idx].status === 'todo') {
    _store.tasks[idx].status = 'in_progress'
    addActivity(taskId, 'status', 'todo', 'in_progress', userId)
  }

  _store.task_updates.push({
    id: 'upd-' + Date.now(),
    task_id: taskId,
    progress,
    note: note || '',
    created_by: userId,
    created_at: new Date().toISOString(),
  })

  addActivity(taskId, 'progress', String(old), String(progress), userId)
  notify()
  return { success: true }
}

export function reportBlocker(taskId, userId, reason) {
  const idx = _store.tasks.findIndex(t => t.id === taskId && t.assigned_to === userId)
  if (idx === -1) return { error: 'Task not found.' }

  const headId = _store.users.find(u => u.role === 'head')?.id
  _store.tasks[idx].status = 'blocked'
  _store.tasks[idx].blocker_reason = reason
  _store.tasks[idx].updated_at = new Date().toISOString()

  addActivity(taskId, 'status', _store.tasks[idx].status, 'blocked', userId)
  addActivity(taskId, 'blocker_reason', null, reason, userId)

  if (headId) {
    addNotification({
      recipient_id: headId,
      type: 'blocker_reported',
      task_id: taskId,
      message: `${getUserById(userId)?.name} reported a blocker on: ${_store.tasks[idx].title}`,
    })
  }
  notify()
  return { success: true }
}

export function resumeWork(taskId, userId) {
  const idx = _store.tasks.findIndex(t => t.id === taskId && t.assigned_to === userId)
  if (idx === -1) return { error: 'Task not found.' }
  _store.tasks[idx].status = 'in_progress'
  _store.tasks[idx].blocker_reason = null
  _store.tasks[idx].updated_at = new Date().toISOString()
  addActivity(taskId, 'status', 'blocked', 'in_progress', userId)
  notify()
  return { success: true }
}

export function submitForReview(taskId, userId, { summary }) {
  const idx = _store.tasks.findIndex(t => t.id === taskId && t.assigned_to === userId)
  if (idx === -1) return { error: 'Task not found.' }

  const task = _store.tasks[idx]

  // Check required checklist items
  const required = _store.checklist_items.filter(c => c.task_id === taskId && c.is_required)
  const incomplete = required.filter(c => !c.is_completed)
  if (incomplete.length > 0) {
    return { error: `Complete all required checklist items first (${incomplete.length} remaining).` }
  }

  // Check on-time
  const deadlineTs = new Date(task.current_deadline).getTime()
  const on_time = Date.now() <= deadlineTs

  _store.tasks[idx].status = 'awaiting_review'
  _store.tasks[idx].updated_at = new Date().toISOString()

  _store.submissions.push({
    id: 'sub-' + Date.now(),
    task_id: taskId,
    summary,
    submitted_at: new Date().toISOString(),
    on_time,
    review_decision: null,
    reviewed_at: null,
    reviewer_note: null,
    submitted_by: userId,
  })

  addActivity(taskId, 'status', 'in_progress', 'awaiting_review', userId)

  const headId = _store.users.find(u => u.role === 'head')?.id
  if (headId) {
    addNotification({
      recipient_id: headId,
      type: 'work_submitted',
      task_id: taskId,
      message: `${getUserById(userId)?.name} submitted: ${task.title}`,
    })
  }
  notify()
  return { success: true }
}

export function reviewTask(taskId, headId, { decision, note }) {
  const idx = _store.tasks.findIndex(t => t.id === taskId)
  if (idx === -1) return { error: 'Task not found.' }
  if (_store.tasks[idx].status !== 'awaiting_review') return { error: 'Task is not awaiting review.' }

  // Update latest submission
  const subIdx = _store.submissions.map((s,i) => ({...s, _i:i}))
    .filter(s => s.task_id === taskId)
    .sort((a,b) => new Date(b.submitted_at) - new Date(a.submitted_at))[0]?._i

  if (subIdx !== undefined) {
    _store.submissions[subIdx].review_decision = decision
    _store.submissions[subIdx].reviewed_at = new Date().toISOString()
    _store.submissions[subIdx].reviewer_note = note || ''
  }

  const newStatus = decision === 'approved' ? 'completed' : 'in_progress'
  _store.tasks[idx].status = newStatus
  _store.tasks[idx].updated_at = new Date().toISOString()

  addActivity(taskId, 'status', 'awaiting_review', newStatus, headId)

  const assigneeId = _store.tasks[idx].assigned_to
  addNotification({
    recipient_id: assigneeId,
    type: 'review_decision',
    task_id: taskId,
    message: decision === 'approved'
      ? `Your submission was approved: ${_store.tasks[idx].title}`
      : `Changes requested on: ${_store.tasks[idx].title} — ${note}`,
  })

  notify()
  return { success: true }
}

export function cancelTask(taskId, headId, reason) {
  const idx = _store.tasks.findIndex(t => t.id === taskId)
  if (idx === -1) return { error: 'Task not found.' }
  _store.tasks[idx].status = 'cancelled'
  _store.tasks[idx].cancelled_at = new Date().toISOString()
  _store.tasks[idx].updated_at = new Date().toISOString()
  addActivity(taskId, 'status', _store.tasks[idx].status, 'cancelled', headId)
  if (reason) addActivity(taskId, 'cancel_reason', null, reason, headId)

  const assigneeId = _store.tasks[idx].assigned_to
  addNotification({
    recipient_id: assigneeId,
    type: 'task_cancelled',
    task_id: taskId,
    message: `Task cancelled: ${_store.tasks[idx].title}`,
  })
  notify()
  return { success: true }
}

export function reassignTask(taskId, newUserId, headId) {
  const idx = _store.tasks.findIndex(t => t.id === taskId)
  if (idx === -1) return { error: 'Task not found.' }

  const oldUserId = _store.tasks[idx].assigned_to
  _store.tasks[idx].assigned_to = newUserId
  _store.tasks[idx].updated_at = new Date().toISOString()

  addActivity(taskId, 'assigned_to', oldUserId, newUserId, headId)

  addNotification({
    recipient_id: newUserId,
    type: 'task_reassigned',
    task_id: taskId,
    message: `Task reassigned to you: ${_store.tasks[idx].title}`,
  })
  notify()
  return { success: true }
}

export function changeDeadline(taskId, newDate, newTime, reason, headId) {
  const idx = _store.tasks.findIndex(t => t.id === taskId)
  if (idx === -1) return { error: 'Task not found.' }

  const oldDeadline = _store.tasks[idx].current_deadline
  const newDeadline = newDate + 'T' + (newTime || '17:00') + ':00Z'

  _store.tasks[idx].deadline_date = newDate
  _store.tasks[idx].deadline_time = newTime || '17:00'
  _store.tasks[idx].current_deadline = newDeadline
  _store.tasks[idx].updated_at = new Date().toISOString()

  addActivity(taskId, 'deadline', oldDeadline, newDeadline, headId)
  if (reason) addActivity(taskId, 'deadline_reason', null, reason, headId)

  const assigneeId = _store.tasks[idx].assigned_to
  addNotification({
    recipient_id: assigneeId,
    type: 'deadline_changed',
    task_id: taskId,
    message: `Deadline updated for: ${_store.tasks[idx].title} → ${newDate}`,
  })
  notify()
  return { success: true }
}

// ─── Checklist ────────────────────────────────────────────────────────────────
export function getChecklistItems(taskId) {
  return _store.checklist_items.filter(c => c.task_id === taskId).sort((a,b) => a.order - b.order)
}

export function toggleChecklistItem(itemId, userId) {
  const idx = _store.checklist_items.findIndex(c => c.id === itemId)
  if (idx === -1) return { error: 'Item not found.' }
  _store.checklist_items[idx].is_completed = !_store.checklist_items[idx].is_completed
  const taskId = _store.checklist_items[idx].task_id
  const taskIdx = _store.tasks.findIndex(t => t.id === taskId)
  if (taskIdx !== -1) _store.tasks[taskIdx].updated_at = new Date().toISOString()
  notify()
  return { success: true }
}

export function addChecklistItem(taskId, text, is_required) {
  const existing = _store.checklist_items.filter(c => c.task_id === taskId)
  const item = {
    id: 'cl-' + Date.now(),
    task_id: taskId,
    text,
    is_required: is_required || false,
    is_completed: false,
    order: existing.length + 1,
  }
  _store.checklist_items.push(item)
  notify()
  return { item }
}

// ─── Comments ─────────────────────────────────────────────────────────────────
export function getComments(taskId) {
  return _store.task_comments.filter(c => c.task_id === taskId)
    .sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
}

export function addComment(taskId, text, authorId) {
  const task = getTaskById(taskId)
  const comment = {
    id: 'cmt-' + Date.now(),
    task_id: taskId,
    text,
    author_id: authorId,
    created_at: new Date().toISOString(),
  }
  _store.task_comments.push(comment)

  // Notify the other party
  const otherId = task?.assigned_to === authorId ? task?.assigned_by : task?.assigned_to
  if (otherId && otherId !== authorId) {
    addNotification({
      recipient_id: otherId,
      type: 'comment_added',
      task_id: taskId,
      message: `${getUserById(authorId)?.name} commented on: ${task?.title}`,
    })
  }
  notify()
  return { comment }
}

// ─── Updates ──────────────────────────────────────────────────────────────────
export function getUpdates(taskId) {
  return _store.task_updates.filter(u => u.task_id === taskId)
    .sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
}

// ─── Submissions ──────────────────────────────────────────────────────────────
export function getSubmissions(taskId) {
  return _store.submissions.filter(s => s.task_id === taskId)
    .sort((a,b) => new Date(a.submitted_at) - new Date(b.submitted_at))
}

// ─── Extension Requests ───────────────────────────────────────────────────────
export function getExtensionRequests(taskId) {
  return _store.extension_requests.filter(e => e.task_id === taskId)
    .sort((a,b) => new Date(a.requested_at) - new Date(b.requested_at))
}

export function requestExtension(taskId, userId, { requested_deadline, reason }) {
  const task = getTaskById(taskId)
  if (!task) return { error: 'Task not found.' }

  const pending = _store.extension_requests.find(
    e => e.task_id === taskId && e.status === 'pending'
  )
  if (pending) return { error: 'You already have a pending extension request for this task.' }

  const req = {
    id: 'ext-' + Date.now(),
    task_id: taskId,
    requested_deadline,
    reason,
    status: 'pending',
    requested_by: userId,
    requested_at: new Date().toISOString(),
    decided_by: null,
    decided_at: null,
    decision_note: null,
  }
  _store.extension_requests.push(req)

  const headId = _store.users.find(u => u.role === 'head')?.id
  if (headId) {
    addNotification({
      recipient_id: headId,
      type: 'extension_requested',
      task_id: taskId,
      message: `${getUserById(userId)?.name} requested a deadline extension for: ${task.title}`,
    })
  }
  notify()
  return { request: req }
}

export function decideExtension(requestId, headId, { decision, note }) {
  const idx = _store.extension_requests.findIndex(e => e.id === requestId)
  if (idx === -1) return { error: 'Request not found.' }

  const req = _store.extension_requests[idx]
  req.status = decision
  req.decided_by = headId
  req.decided_at = new Date().toISOString()
  req.decision_note = note || ''

  if (decision === 'approved') {
    // Update task deadline
    const newDate = req.requested_deadline.split('T')[0]
    changeDeadline(req.task_id, newDate, '17:00', `Extension approved: ${note || ''}`, headId)
  }

  addNotification({
    recipient_id: req.requested_by,
    type: 'extension_decided',
    task_id: req.task_id,
    message: `Your extension request was ${decision}: ${getTaskById(req.task_id)?.title}`,
  })

  notify()
  return { success: true }
}

// ─── Activity History ────────────────────────────────────────────────────────
function addActivity(taskId, field, old_value, new_value, actorId) {
  _store.activity_history.push({
    id: 'act-' + Date.now() + '-' + Math.random(),
    task_id: taskId,
    field,
    old_value,
    new_value,
    actor_id: actorId,
    created_at: new Date().toISOString(),
  })
}

export function getActivity(taskId) {
  return _store.activity_history.filter(a => a.task_id === taskId)
    .sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
}

// ─── Notifications ────────────────────────────────────────────────────────────
function addNotification({ recipient_id, type, task_id, message }) {
  _store.notifications.push({
    id: 'notif-' + Date.now() + '-' + Math.random(),
    recipient_id,
    type,
    task_id,
    message,
    read_at: null,
    created_at: new Date().toISOString(),
  })
}

export function getNotifications(userId) {
  return _store.notifications
    .filter(n => n.recipient_id === userId)
    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
}

export function getUnreadCount(userId) {
  return _store.notifications.filter(n => n.recipient_id === userId && !n.read_at).length
}

export function markNotificationRead(notifId) {
  const idx = _store.notifications.findIndex(n => n.id === notifId)
  if (idx !== -1) {
    _store.notifications[idx].read_at = new Date().toISOString()
    notify()
  }
}

export function markAllNotificationsRead(userId) {
  _store.notifications.forEach(n => {
    if (n.recipient_id === userId && !n.read_at) {
      n.read_at = new Date().toISOString()
    }
  })
  notify()
}

// ─── Analytics Helpers ────────────────────────────────────────────────────────
export function getOpenTaskCount(userId) {
  return _store.tasks.filter(t =>
    t.assigned_to === userId &&
    !['completed','cancelled'].includes(t.status)
  ).length
}

export function getDashboardStats() {
  const allTasks = _store.tasks
  const now = new Date()
  const todayStr = format(now, 'yyyy-MM-dd')
  const weekStart = format(now, 'yyyy-MM-dd')
  const weekEnd = format(addDays(now, 7), 'yyyy-MM-dd')

  const open = allTasks.filter(t => !['completed','cancelled'].includes(t.status)).length
  const dueToday = allTasks.filter(t =>
    !['completed','cancelled'].includes(t.status) && t.deadline_date === todayStr
  ).length
  const overdue = allTasks.filter(t =>
    !['completed','cancelled'].includes(t.status) &&
    t.deadline_date < todayStr
  ).length
  const blocked = allTasks.filter(t => t.status === 'blocked').length
  const awaitingReview = allTasks.filter(t => t.status === 'awaiting_review').length
  const completedThisWeek = allTasks.filter(t =>
    t.status === 'completed' &&
    t.updated_at >= format(subDays(now, 7), "yyyy-MM-dd'T'HH:mm:ss'Z'")
  ).length

  return { open, dueToday, overdue, blocked, awaitingReview, completedThisWeek }
}

export function getPendingExtensionRequests() {
  return _store.extension_requests
    .filter(e => e.status === 'pending')
    .map(e => ({ ...e, task: getTaskById(e.task_id), requester: getUserById(e.requested_by) }))
}

export function resetToSeedData() {
  localStorage.removeItem(STORAGE_KEY)
  window.location.reload()
}
