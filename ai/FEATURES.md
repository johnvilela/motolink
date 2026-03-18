# Motolink Features

## Progress

- Planned tasks: `94` (`100%`)
- Done: `64/94` (`68%`)
- Partial: `4/94` (`4%`)
- Started overall: `68/94` (`72%`)

> Audit based on the current codebase state on `2026-03-18`.
> Compared with the `2026-03-17` audit: `+8` done, `-4` partial, `+4` started overall.

- `[x]` implemented and present in the codebase
- `[!]` partial, placeholder-only, or not exposed in the current app
- `[ ]` not implemented
- `[>]` delayed

## General

- [x] Upload images to firebase storage
- [x] Create seed script to help with local development
- [x] Global reload after branch change
- [x] Block modules by permissions
- [!] Block actions by permissions
  <!-- Pages and navigation check permissions, but server actions and route handlers only validate authentication — not specific action permissions. -->
- [x] Block pages by permissions
- [x] Save mutations actions (CREATE/UPDATE/DELETE) on history-trace for modules that have mutation actions
  <!-- All major modules (users, clients, deliverymen, work-shift-slots, payment-requests, client-blocks, planning) fire history traces on mutations. -->
- [x] Create test suites for all the services covering all methods
- [!] Create test suites for all utils files
  <!-- Missing: cnpj-mask, cep-mask, time-mask, client-cookie -->

## Authentication

- [x] Create private and public routes
- [x] Login with email & password (with error handling)
- [x] Secure the API endpoint to deny unauthorized/unauthenticated requests

## Users (colaboradores)

- [x] Create a user
- [x] Edit a user
- [x] List users by branch with pagination
- [x] Search user by name and email
- [x] View user detail with the permissions table
- [ ] Display the logs of the user on the user detail
- [x] Block and unblock a user
  <!-- toggleBlock in service + actions + users-list UI -->
- [!] Send invitation to new user with link to create a password
  <!-- Service creates a verification token, but there is no email/whatsapp delivery mechanism yet. -->
- [x] Page to create a password
- [x] Page to change password
  <!-- Profile page (/perfil) has ChangePasswordForm; service has changePassword method. -->
- [ ] Send forgot password link to user whatsapp

## Groups

- [x] Create a group
- [x] Edit a group
- [x] List groups by branch with pagination
- [x] Search group by name
- [x] View group detail with clients related to it
- [x] Delete groups without relationships

## Regions

- [x] Create a region
- [x] Edit a region
- [x] List regions by branch with pagination
- [x] Search region by name
- [x] View regions detail with clients/deliverymen related to it
- [x] Delete regions without relationships

## Clients/Commercial Conditions

- [x] Create a client with commercial conditions
- [x] Edit a client with commercial conditions
- [x] List client by branch with pagination
- [x] Search client by name and cnpj
- [x] View client details with commercial conditions
- [x] Soft-delete a client

## Deliverymen

- [x] Create a deliveryman
- [x] Edit a deliveryman
- [x] List deliveryman by branch with pagination
- [x] Search deliveryman by name and phone
- [!] View deliveryman details with logs
  <!-- Detail page exists with ban history, but general action logs are not displayed. -->
- [x] Block/Unblock a deliveryman
- [x] Soft-delete a deliveryman

## Client Block

- [x] Block and unblock a deliveryman on a single client
  <!-- ban/unban/isBanned/listHistoryByDeliveryman fully implemented with complex history tracking. -->

## Planning

- [x] List planning information by week with filter by client or group
- [x] Create and edit planning information for a client by period

## Work Shift

- [x] Create work-shift by client
- [x] Edit a work-shift
- [x] List work-shift grouped by client
- [x] Change status following a defined flow (OPEN > INVITED > CONFIRMED > CHECKED_IN > PENDING_COMPLETION > COMPLETED)
- [x] Log all actions done on the work-shift
- [x] Send invitation by whatsapp to the deliveryman
  <!-- sendInvite fully implemented via WhatsApp service integration. -->
- [x] Send invitations by client
  <!-- sendBulkInvite sends invitations for all slots of a client on a given date. -->
- [>] Send invitations by group
- [x] When the work-shift is marked as COMPLETED it should create a Payment Request
  <!-- syncPaymentRequestFromCompletedWorkShiftSlot auto-creates/updates payment request with amount calculation including discounts. -->
- [x] Delete work-shift
- [ ] When creating a new work-shift, it should give priority to deliverymen on the same region on the suggestion
- [x] When creating a new work-shift, it should remove the deliveryman blocked on the client when suggesting
- [ ] Complete a work-shift automatically after a certain time when the status is CHECKED_IN (30 minutes)

## Monitoring

- [x] Daily monitoring interface
- [x] Weekly monitoring interface

## Payment Request

- [x] List all payment request by branch
- [x] Search payment request by deliveryman, by date, by status
- [x] Edit a payment request
- [x] Approve payment request that was edited
- [x] Deny a payment request
- [x] View a payment request log
- [ ] Bank integration to execute payment using just the APP
- [ ] Bulk payment using the Bank integration

## Events

- [ ] Create a event
- [ ] Edit a event
- [ ] List events
- [ ] Delete a event

## History Trace

- [x] List history trace filtered by entity type, entity id, date period, action

## Notifications

- [ ] Warn user that it exists work-shift with status PENDING_COMPLETION
- [ ] Warn user about events
- [ ] Warn user about whatsapp disconnection

## Whatsapp

- [x] Send message with whatsapp using WAHA endpoint
- [ ] Get whatsapp instance status and display it together with the branch information
- [ ] Get the QR Code to connect whatsapp to WAHA instance

## Reports

All reports will generate a CSV or PDF file

- [ ] Invitation log report (PDF)
- [ ] Deliverymen/work-shift report
- [ ] Deliveryman payment report

## Notes

- [ ] User can create note with some status: priority, period, branches, users, roles
- [ ] Edit note
- [ ] List all notes
- [ ] Delete a note

## Dashboard

- [ ] Shows notes from the day
- [ ] Show work-shift resume
- [ ] Show financial resume (according to user role)
- [ ] Show events of the day
