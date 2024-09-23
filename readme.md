# Training Call Library

## Design

Single data table to store interaction details with a type field to flag with sublibrary (e.g. good / bad)

## Deployment

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
1. Create Groups
   1. TIL Admins (can edit interactions in library and perform management tasks) \*optional
   1. TIL Users (can view / open only)
1. Data table
   1. Create a datatable
      - Name: Set any name as desired
      - Description: Set any description as desired
      - Division: Set any division as desired
      - Reference Key Label: Enter "conversation_id" (without quotation marks)
   1. Note the datatable id (can be retrieved from the URL e.g. https://apps.region/directory/#/admin/routing/datatables/0c91184a-93b9-4e8b-ae10-xxxxxxxxxxxx)
1. Configure Integration
   1. URL
      - Syntax = <url>?<gc_region>&<gc_client>&<gc_datatable>&[<til_admins_group_id> : <til_admins_ids>]
      - Supports either using a group for admins or comma separated list of admin ids (not mutually exclusive)
   1. Add to Iframe Sandbox Options
      - allow-downloads
      - allow-popups
   1. Assign TIL Admins / TIL Users groups

## Limits

1. Supports voice only for now (would need to think about if value in reading digital transcript for training)
1. Max interactions by category? Saves on search / refresh API call complexity
1. Conversations that span across queues?

## Questions / To Work Through

1. Should archived / deleted recordings still be listed (greyed out) or removed? Can retrieve archived recording but probably wouldn't want to as it's a limited number available... perhaps keep in datatable but not present in UI is best.
1. Check behaviour for
   - digital interactions
   - transfers
   - transfers across divisions
1. Any additional metrics?
1. Migrate datatable (management tool)
   - Needs to retain records
   - Needs to update Integration URL
   - Allow user to nominate Division
1. Notify admins if datatable schema broken / corrupted
1. Add functionality to show / hide column topics (e.g. metrics, evaluations, survey etc.)
1. Check if logged in user has permissions below permissions per division listed in table rows
   - Analytics > Agent Conversation Detail OR
   - Analytics > Conversation Detail > View
     get
     /api/v2/authorization/divisionspermitted/paged/me
     Returns which divisions the current user has the given permission in.

## Completed

1. Add survey data
1. Get division names
1. Generate and download datatable schema
   - Defaults to 'TIL Datatable' name
   - Defaults to Home division (can be reassigned via UI)
