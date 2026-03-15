# Motolink Features

- `[x]` implemented and present in the codebase
- `[!]` partial, placeholder-only, or not exposed in the current app
- `[ ]` not implemented

## General

- [ ] Upload images to firebase storage
- [ ] Create seed script to help with local development
- [ ] Global reload after branch change
- [ ] Block modules by permissions
- [ ] Block actions by permissions
- [ ] Block pages by permissions
- [ ] Save mutations actions (CREATE/UPDATE/DELETE) on history-trace for all modules
- [ ] Create test suites for all the services covering all methods
- [ ] Create test suites for all utils files

## Authentication

- [ ] Create private and public routes
- [ ] Login with email & password (with error handling)
- [ ] Secure the API endpoint to deny unauthorized/unauthenticated requests

## Users (colaboradores)

- [ ] Create a user
- [ ] Edit a user
- [ ] List users by branch with pagination
- [ ] Search user by name and email
- [ ] View user detail with the permissions table
- [ ] Display the logs of the user on the user detail
- [ ] Block and unblock a user
- [ ] Send invitation to new user with link to create a password
- [ ] Page to create a password
- [ ] Page to change password
- [ ] Send forgot password link to user whatsapp

## Groups

- [ ] Create a group
- [ ] Edit a group
- [ ] List groups by branch with pagination
- [ ] Search group by name
- [ ] View group detail with clients related to it
- [ ] Delete groups without relationships

## Regions

- [ ] Create a region
- [ ] Edit a region
- [ ] List regions by branch with pagination
- [ ] Search region by name
- [ ] View regions detail with clients/deliverymen related to it
- [ ] Delete regions without relationships

## Clients/Commercial Conditions

- [ ] Create a client with commercial conditions
- [ ] Edit a client with commercial conditions
- [ ] List regions by branch with pagination
- [ ] Search region by name and cnpj
- [ ] View client details with commercial conditions
- [ ] Soft-delete a client

## Deliverymen

- [ ] Create a deliveryman
- [ ] Edit a deliveryman
- [ ] List deliveryman by branch with pagination
- [ ] Search deliveryman by name and phone
- [ ] View deliveryman details with logs
- [ ] Block/Unblock a deliveryman
- [ ] Soft-delete a deliveryman

## Client Block

- [ ] Block and unblock a deliveryman on a single client

## Planning

- [ ] List planning information by week with filter by client or group
- [ ] Create and edit planning information for a client by period

## Work Shift

- [ ] Create work-shift by client
- [ ] Edit a work-shift
- [ ] List work-shift grouped by client
- [ ] Change status following a defined flow (OPEN > INVITED > CONFIRMED > CHECKED_IN > PENDING_COMPLETION > COMPLETED)
- [ ] Log all actions done on the work-shift
- [ ] Send invitation by whatsapp to the deliveryman
- [ ] Send invitations by client
- [ ] Send invitations by group
- [ ] When the work-shift is marked as COMPLETED it should create a Payment Request
- [ ] Delete work-shift
- [ ] When creating a new work-shift, it should give priority to deliverymen on the same region on the suggestion
- [ ] When creating a new work-shift, it should remove the deliveryman blocker on the client when suggesting
- [ ] Complete a work-shift automatically after a certain time when the status is CHECKED_IN

## Payment Request

- [ ] List all payment request by branch
- [ ] Search payment request by deliveryman, by date, by status
- [ ] Edit a payment request
- [ ] Approve payment request that was edited
- [ ] Deny a payment request
- [ ] View a payment request log

## Events

- [ ] Create a event
- [ ] Edit a event
- [ ] List events
- [ ] Delete a event

## History Trace

- [ ] List history trace filtered by entity type, entity id, date period, action

## Notifications

- [ ] Warn user that it exists work-shift with status PENDING_COMPLETION
- [ ] Warn user about events
- [ ] Warn user about whatsapp disconnection

## Whatsapp

- [ ] Send message with whatsapp using WAHA endpoint
- [ ] Get whatsapp instance status and display it together with the branch information
- [ ] Get the QR Code to connect whatsapp to WAHA instance
