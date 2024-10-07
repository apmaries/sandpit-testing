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
1. Create Groups (must be an 'official' group type)
   1. TIL Library Admins (can edit interactions in library and perform management tasks) \*optional
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
      - Syntax = <url>?<gc_region>&<gc_client>&<gc_integration>[&<gc_datatable>]&<til_library_admins_group>&<til_integration_admins>
      - gc_region\* = Genesys Cloud region (e.g. usw2.pure.cloud, mypurecloud.com)
      - gc_client\* = OAuth client id
      - gc_integration\* = Integration id for this app
      - gc_datatable = Data table id to use for this app
        - If no data table id provided, app will create one
        - If data table fields do not match expected columns, app will create a new data table and migrate rows automatically
        - 'til_integration_admins' users can validate and migrate data table in app
      - til_library_admins_group = Group ID for users that can add and delete conversations in library
      - til_integration_admins = Comma separated string of user ids that can perform updates to datatable and integration from within app
   1. Add to Iframe Sandbox Options
      - allow-downloads
      - allow-popups
   1. Assign TIL Library Admins / TIL Users groups

## Limits

1. Supports voice only for now (would need to think about if value in reading digital transcript for training)
1. Max interactions by category? Saves on search / refresh API call complexity
1. Conversations that span across queues?

## To do

1. Check behaviour for
   - transfers across divisions
1. Any additional metrics?
1. Migrate datatable (management tool)
   - Allow user to nominate Division?
1. Notifications
   - datatable schema broken / corrupted
   - recording state change
1. User favourites
1. Move add / deletes directly to tables

## Completed

1. Add survey data
1. Get division names
1. Generate and download datatable schema
   - Defaults to 'TIL Datatable' name
   - Defaults to Home division (can be reassigned via UI)
1. Add functionality to show / hide column topics (e.g. metrics, evaluations, survey etc.)
1. Re-jig applicationConfig
   - Rename datatableColumns to parameters
   - Update generic type to dataType
1. Remove field formatting at run time and add to when table is populated
   - Add format attribute to datatableColumns
1. Added checks to add / delete from library to ensure conversation id entered exists in library
1. Migrate datatable (management tool)
   - Needs to retain records
   - Needs to update Integration URL
1. Check behaviour for
   - digital interactions
   - transfers
1. Add warnning icon & tooltip to library tables for
   - soon to be deleted recordings (within next 30 days)
   - archived recordings
1. Add tags / comments to library table
1. Update tag event listeners - some functions don't run
1. Make tag formatting in tables better!
1. Check if logged in user has permissions below permissions per division listed in table rows
