# Training Call Library

## Design

Single data table to store interaction details with a type field to flag with sublibrary (e.g. good / bad).

Check if logged in user has permissions below permissions per division listed in table rows

- Analytics > Agent Conversation Detail OR
- Analytics > Conversation Detail > View
  get
  /api/v2/authorization/divisionspermitted/paged/me
  Returns which divisions the current user has the given permission in.

Support admins / users through scripts run on redirect

- Authenticate and redirect
- Get user name
- Check user name against group
  - 'TIL Admins'
  - 'TIL Users'

## Prerequisites

1. OAuth Client
   1. Scopes:
   - architect (used to get and modify datatables)
   - analytics:readonly (used to get interaction info & quality scores / in bulk)
   - authorization:readonly (used to get Division names)
   - integrations:readonly (used to look up self for admin users)
   - recordings:readonly (primary data source for interaction recording info)
   - routing:readonly (used to get queue / skill / language / wrap names)
   - speech-and-text-analytics:readonly (STA data source for silence / overtalk etc.)
   - user-basic-info
2. Configure Integration
   1. URL = <url>?<gc_region>&<gc_client>&<gc_datatable>
   1. Add 'allow-popups' to Iframe Sandbox Options
3. Data table
4. Groups
   1. TIL Admins (can edit interactions in library)
   2. TIL Users (can view / open only)

## Limits

1. Supports voice only for now (would need to think about if value in reading digital transcript for training)
1. Max interactions by category? Saves on search / refresh API call complexity
1. Conversations that span across queues?

## Questions

1. Should archived / deleted recordings still be listed (greyed out) or removed? Can retrieve archived recording but probably wouldn't want to as it's a limited number available... perhaps keep in datatable but not present in UI is best.
